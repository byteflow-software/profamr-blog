'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { createTag } from './actions'

export function TagForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await createTag(name)
      if (result.success) {
        setName('')
        router.refresh()
      } else {
        setError(result.error || 'Erro ao criar tag')
      }
    } catch {
      setError('Erro ao criar tag')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="admin-form-group">
        <label className="admin-form-label">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="admin-form-input"
          placeholder="Nova tag"
          required
        />
      </div>

      <button
        type="submit"
        className="admin-btn admin-btn-primary"
        disabled={isSubmitting}
        style={{ width: '100%' }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Plus size={16} />
            Adicionar
          </>
        )}
      </button>
    </form>
  )
}
