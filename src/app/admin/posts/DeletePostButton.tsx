'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePost } from './actions'

interface DeletePostButtonProps {
  postId: number
  postTitle: string
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${postTitle}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deletePost(postId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || 'Erro ao excluir post')
      }
    } catch {
      alert('Erro ao excluir post')
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
      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </button>
  )
}
