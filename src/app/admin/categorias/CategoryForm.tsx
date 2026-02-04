'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { createCategory, updateCategory } from './actions'

interface CategoryFormProps {
  category?: {
    id: number
    name: string
    slug: string
    description: string | null
    parentId: number | null
  }
  categories: { id: number; name: string }[]
}

export function CategoryForm({ category, categories }: CategoryFormProps) {
  const router = useRouter()
  const isEditing = !!category

  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [parentId, setParentId] = useState<number | null>(category?.parentId || null)

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
      parentId: parentId || null,
    }

    try {
      const result = isEditing
        ? await updateCategory(category.id, data)
        : await createCategory(data)

      if (result.success) {
        if (!isEditing) {
          setName('')
          setSlug('')
          setDescription('')
          setParentId(null)
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

  // Filter out current category from parent options
  const parentOptions = categories.filter((c) => c.id !== category?.id)

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
        <label className="admin-form-label">Categoria Pai</label>
        <select
          value={parentId || ''}
          onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value) : null)}
          className="admin-form-select"
        >
          <option value="">Nenhuma (raiz)</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
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
