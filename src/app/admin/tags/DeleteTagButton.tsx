'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteTag } from './actions'

interface DeleteTagButtonProps {
  tagId: number
  tagName: string
  postCount: number
}

export function DeleteTagButton({ tagId, tagName, postCount }: DeleteTagButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (postCount > 0) {
      alert(`Não é possível excluir "${tagName}" pois há ${postCount} post(s) associado(s).`)
      return
    }

    if (!confirm(`Tem certeza que deseja excluir "${tagName}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteTag(tagId)
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
      title={postCount > 0 ? 'Tag possui posts' : 'Excluir'}
    >
      {isDeleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
