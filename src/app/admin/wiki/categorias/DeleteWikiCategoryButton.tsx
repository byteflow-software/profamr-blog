'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteWikiCategory } from './actions'

interface DeleteWikiCategoryButtonProps {
  categoryId: number
  categoryName: string
  articleCount: number
}

export function DeleteWikiCategoryButton({
  categoryId,
  categoryName,
  articleCount,
}: DeleteWikiCategoryButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (articleCount > 0) {
      alert(
        `Não é possível excluir "${categoryName}" pois há ${articleCount} artigo(s) associado(s).`
      )
      return
    }

    if (!confirm(`Tem certeza que deseja excluir "${categoryName}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteWikiCategory(categoryId)
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
      title={articleCount > 0 ? 'Categoria possui artigos' : 'Excluir'}
    >
      {isDeleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
