'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

interface UploadZoneProps {
  onUploadComplete: () => void
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState({ done: 0, total: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('filename', file.name)

    const res = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erro no upload')
    }

    return res.json()
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setIsUploading(true)
    setUploadCount({ done: 0, total: fileArray.length })

    for (let i = 0; i < fileArray.length; i++) {
      try {
        await uploadFile(fileArray[i])
      } catch (err) {
        console.error(`Erro ao enviar ${fileArray[i].name}:`, err)
      }
      setUploadCount((prev) => ({ ...prev, done: prev.done + 1 }))
    }

    setIsUploading(false)
    setUploadCount({ done: 0, total: 0 })
    onUploadComplete()
  }, [onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {isUploading ? (
        <>
          <Loader2 size={32} className="upload-zone-icon" style={{ animation: 'spin 1s linear infinite' }} />
          <p className="upload-zone-text">
            Enviando {uploadCount.done}/{uploadCount.total}...
          </p>
          <div className="upload-progress">
            <div className="upload-progress-bar">
              <div
                className="upload-progress-fill"
                style={{ width: `${(uploadCount.done / uploadCount.total) * 100}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <Upload size={32} className="upload-zone-icon" />
          <p className="upload-zone-text">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="upload-zone-hint">
            Imagens (JPG, PNG, GIF, WebP) e Vídeos (MP4, WebM, MOV) — máx. 50MB
          </p>
        </>
      )}
    </div>
  )
}
