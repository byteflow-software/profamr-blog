'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { createWikiCategory, updateWikiCategory } from './actions'

interface WikiCategoryFormProps {
  category?: {
    id: number
    name: string
    slug: string
    description: string | null
    icon: string | null
    color: string | null
    order: number
  }
}

export function WikiCategoryForm({ category }: WikiCategoryFormProps) {
  const router = useRouter()
  const isEditing = !!category

  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [icon, setIcon] = useState(category?.icon || '')
  const [order, setOrder] = useState(category?.order || 0)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = (value: string) => {
    setName(value)
    if (!isEditing || slug === slugify(category.name)) {
      setSlug(slugify(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const data = {
      name,
      slug,
      description: description || undefined,
      icon: icon || undefined,
      order,
    }

    try {
      const result = isEditing
        ? await updateWikiCategory(category.id, data)
        : await createWikiCategory(data)

      if (result.success) {
        if (!isEditing) {
          setName('')
          setSlug('')
          setDescription('')
          setIcon('')
          setOrder(0)
        }
        router.refresh()
      } else {
        setError(result.error || 'Erro ao salvar')
      }
    } catch {
      setError('Erro ao salvar')
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
          onChange={(e) => handleNameChange(e.target.value)}
          className="admin-form-input"
          required
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(slugify(e.target.value))}
          className="admin-form-input"
          required
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Ícone (emoji)</label>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="admin-form-input"
          placeholder="Ex: 📚"
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Ordem</label>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
          className="admin-form-input"
          min={0}
        />
      </div>

      <div className="admin-form-group">
        <label className="admin-form-label">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="admin-form-textarea"
          rows={3}
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
            {isEditing ? 'Atualizar' : 'Adicionar'}
          </>
        )}
      </button>
    </form>
  )
}
