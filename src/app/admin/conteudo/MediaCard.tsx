'use client'

import { Film, FileText } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface MediaItem {
  id: number
  filename: string
  url: string
  mimeType: string
  size: number
  type: 'IMAGE' | 'VIDEO'
  createdAt: string
}

interface MediaCardProps {
  media: MediaItem
  onClick: () => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function MediaCard({ media, onClick }: MediaCardProps) {
  return (
    <div className="media-card" onClick={onClick}>
      <div className="media-card-thumb">
        {media.mimeType === 'application/pdf' ? (
          <FileText size={40} className="media-card-video-icon" />
        ) : media.type === 'IMAGE' ? (
          <img src={media.url} alt={media.filename} loading="lazy" />
        ) : (
          <Film size={40} className="media-card-video-icon" />
        )}
      </div>
      <div className="media-card-info">
        <div className="media-card-name" title={media.filename}>
          {media.filename}
        </div>
        <div className="media-card-meta">
          {formatSize(media.size)} &bull; {formatDate(media.createdAt)}
        </div>
      </div>
    </div>
  )
}
