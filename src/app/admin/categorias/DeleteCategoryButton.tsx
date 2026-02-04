'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteCategory } from './actions'

interface DeleteCategoryButtonProps {
  categoryId: number
  categoryName: string
  postCount: number
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  postCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (postCount > 0) {
      alert(
        `Não é possível excluir "${categoryName}" pois há ${postCount} post(s) associado(s).`
      )
      return
    }

    if (!confirm(`Tem certeza que deseja excluir "${categoryName}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteCategory(categoryId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Erro ao excluir')
      }
    } catch {
      alert('Erro ao excluir')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="admin-btn admin-btn-sm admin-btn-danger"
      title={postCount > 0 ? 'Categoria possui posts' : 'Excluir'}
    >
      {isDeleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
