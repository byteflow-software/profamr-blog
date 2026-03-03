'use client'

import { useState } from 'react'
import { X, Trash2, Save, Loader2, Film, FileText, Maximize2 } from 'lucide-react'

interface MediaItem {
  id: number
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
  type: 'IMAGE' | 'VIDEO'
  title: string | null
  altText: string | null
  caption: string | null
  description: string | null
  createdAt: string
  uploadedBy?: { displayName: string }
}

interface MediaEditModalProps {
  media: MediaItem
  onClose: () => void
  onSave: () => void
  onDelete: () => void
}

export function MediaEditModal({ media, onClose, onSave, onDelete }: MediaEditModalProps) {
  const [filename, setFilename] = useState(media.filename)
  const [title, setTitle] = useState(media.title || '')
  const [altText, setAltText] = useState(media.altText || '')
  const [caption, setCaption] = useState(media.caption || '')
  const [description, setDescription] = useState(media.description || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/media/${media.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, title, altText, caption, description }),
      })
      if (res.ok) {
        onSave()
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
    }
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta mídia?')) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/media/${media.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete()
      }
    } catch (err) {
      console.error('Erro ao deletar:', err)
    }
    setIsDeleting(false)
  }

  return (
    <div className="media-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="media-modal">
        <div className="media-modal-header">
          <h2 className="media-modal-title">Editar Mídia</h2>
          <button className="media-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="media-modal-body">
          <div className="media-modal-preview" style={{ position: 'relative' }}>
            {media.mimeType === 'application/pdf' ? (
              <iframe
                src={media.url}
                title={media.filename}
                style={{ width: '100%', height: '320px', border: 'none' }}
              />
            ) : media.type === 'IMAGE' ? (
              <img src={media.url} alt={media.filename} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Film size={48} style={{ color: 'var(--color-text-muted)' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  {media.mimeType}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Tela cheia"
            >
              <Maximize2 size={16} />
            </button>
            {media.width && media.height && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '8px', textAlign: 'center' }}>
                {media.width} × {media.height}px
              </p>
            )}
          </div>

          <div className="media-modal-fields">
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Nome do arquivo</label>
              <input
                className="admin-form-input"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Título</label>
              <input
                className="admin-form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título da mídia"
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Texto alternativo</label>
              <input
                className="admin-form-input"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descrição para acessibilidade"
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Legenda</label>
              <input
                className="admin-form-input"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Legenda exibida abaixo da mídia"
              />
            </div>
            <div className="admin-form-group" style={{ marginBottom: 0 }}>
              <label className="admin-form-label">Descrição</label>
              <textarea
                className="admin-form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição detalhada"
                rows={3}
              />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <p>Arquivo original: {media.originalName}</p>
              <p>URL: <a href={media.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)' }}>{media.url}</a></p>
              {media.uploadedBy && <p>Enviado por: {media.uploadedBy.displayName}</p>}
            </div>
          </div>
        </div>

        <div className="media-modal-footer">
          <button
            className="admin-btn admin-btn-danger admin-btn-sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
            Excluir
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <button
            onClick={() => setIsFullscreen(false)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2001,
            }}
            title="Fechar (Esc)"
          >
            <X size={24} />
          </button>
          {media.mimeType === 'application/pdf' ? (
            <iframe
              src={media.url}
              title={media.filename}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90vw',
                height: '90vh',
                border: 'none',
                borderRadius: '8px',
              }}
            />
          ) : media.type === 'IMAGE' ? (
            <img
              src={media.url}
              alt={media.filename}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          ) : (
            <video
              src={media.url}
              controls
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '95vw',
                maxHeight: '95vh',
                borderRadius: '8px',
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
