'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteWikiArticle } from './actions'

interface DeleteWikiButtonProps {
  articleId: number
  articleTitle: string
}

export function DeleteWikiButton({ articleId, articleTitle }: DeleteWikiButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${articleTitle}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteWikiArticle(articleId)
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
      title="Excluir"
    >
      {isDeleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
