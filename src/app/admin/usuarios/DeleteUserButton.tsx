'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteUser } from './actions'

interface DeleteUserButtonProps {
  userId: number
  userName: string
  contentCount: number
  currentUserId: number
}

export function DeleteUserButton({
  userId,
  userName,
  contentCount,
  currentUserId,
}: DeleteUserButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const isSelf = userId === currentUserId
  const hasContent = contentCount > 0

  const handleDelete = async () => {
    if (isSelf) {
      alert('Você não pode excluir sua própria conta.')
      return
    }

    if (hasContent) {
      alert(
        `Não é possível excluir "${userName}" pois há ${contentCount} conteúdo(s) associado(s).`
      )
      return
    }

    if (!confirm(`Tem certeza que deseja excluir "${userName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteUser(userId)
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

  const getTitle = () => {
    if (isSelf) return 'Não é possível excluir sua própria conta'
    if (hasContent) return 'Usuário possui conteúdo associado'
    return 'Excluir usuário'
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting || isSelf}
      className="admin-btn admin-btn-sm admin-btn-danger"
      title={getTitle()}
    >
      {isDeleting ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
    </button>
  )
}
