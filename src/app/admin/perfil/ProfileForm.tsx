'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { updateProfile } from './actions'

interface ProfileFormProps {
  user: {
    id: number
    displayName: string
    bio: string | null
    avatarUrl: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()

  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsSubmitting(true)

    try {
      const result = await updateProfile({
        displayName,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      })

      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao salvar' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-card">
      <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Informações do Perfil</h2>

      <form onSubmit={handleSubmit}>
        {message && (
          <div
            style={{
              padding: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              background: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {message.text}
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-form-label">Nome de Exibição *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="admin-form-input"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">URL do Avatar</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="admin-form-input"
            placeholder="https://exemplo.com/avatar.jpg"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Biografia</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="admin-form-textarea"
            rows={4}
            placeholder="Conte um pouco sobre você..."
          />
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Perfil
            </>
          )}
        </button>
      </form>
    </div>
  )
}
