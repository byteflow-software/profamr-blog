'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, ImageIcon, Film, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import { UploadZone } from './UploadZone'
import { MediaCard } from './MediaCard'
import { MediaEditModal } from './MediaEditModal'
import './conteudo.css'

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

interface MediaResponse {
  items: MediaItem[]
  total: number
  page: number
  totalPages: number
}

export function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<'all' | 'IMAGE' | 'VIDEO'>('all')
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
      })
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (searchDebounced) params.set('search', searchDebounced)

      const res = await fetch(`/api/media?${params}`)
      if (res.ok) {
        const data: MediaResponse = await res.json()
        setMedia(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (err) {
      console.error('Erro ao buscar mídia:', err)
    }
    setIsLoading(false)
  }, [page, typeFilter, searchDebounced])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [typeFilter, searchDebounced])

  const handleUploadComplete = () => {
    fetchMedia()
  }

  const handleSave = () => {
    setSelectedMedia(null)
    fetchMedia()
  }

  const handleDelete = () => {
    setSelectedMedia(null)
    fetchMedia()
  }

  return (
    <>
      <div className="media-header">
        <div>
          <h1 className="admin-page-title">Biblioteca de Mídia</h1>
          <p className="admin-page-subtitle">{total} arquivo{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <UploadZone onUploadComplete={handleUploadComplete} />

      <div className="media-filters">
        <div className="media-tabs">
          <button
            className={`media-tab ${typeFilter === 'all' ? 'media-tab-active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            <LayoutGrid size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Todos
          </button>
          <button
            className={`media-tab ${typeFilter === 'IMAGE' ? 'media-tab-active' : ''}`}
            onClick={() => setTypeFilter('IMAGE')}
          >
            <ImageIcon size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Imagens
          </button>
          <button
            className={`media-tab ${typeFilter === 'VIDEO' ? 'media-tab-active' : ''}`}
            onClick={() => setTypeFilter('VIDEO')}
          >
            <Film size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Vídeos
          </button>
        </div>

        <div className="media-search">
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            className="media-search-input"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="media-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="media-card">
              <div className="admin-skeleton" style={{ aspectRatio: '1', width: '100%' }} />
              <div style={{ padding: '8px' }}>
                <div className="admin-skeleton admin-skeleton-text" style={{ width: '80%' }} />
                <div className="admin-skeleton admin-skeleton-text" style={{ width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="media-empty">
          <ImageIcon size={48} className="media-empty-icon" />
          <p className="media-empty-text">
            {searchDebounced ? 'Nenhum resultado encontrado' : 'Nenhuma mídia enviada ainda'}
          </p>
        </div>
      ) : (
        <>
          <div className="media-grid" style={{ marginTop: 'var(--spacing-lg)' }}>
            {media.map((item) => (
              <MediaCard
                key={item.id}
                media={item}
                onClick={() => setSelectedMedia(item)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="media-pagination">
              <button
                className="media-pagination-btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="media-pagination-info">
                Página {page} de {totalPages}
              </span>
              <button
                className="media-pagination-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {selectedMedia && (
        <MediaEditModal
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
