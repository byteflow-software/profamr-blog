'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2 } from 'lucide-react'
import { resetUserPassword } from '../actions'

interface ResetPasswordButtonProps {
  userId: number
  userName: string
}

export function ResetPasswordButton({ userId, userName }: ResetPasswordButtonProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = async () => {
    const newPassword = prompt(
      `Digite a nova senha para "${userName}":\n\nRequisitos:\n- Mínimo 8 caracteres\n- Uma letra maiúscula\n- Uma letra minúscula\n- Um número`
    )

    if (!newPassword) return

    setIsResetting(true)
    try {
      const result = await resetUserPassword(userId, newPassword)
      if (result.success) {
        alert('Senha redefinida com sucesso!')
        router.refresh()
      } else {
        alert(result.error || 'Erro ao redefinir senha')
      }
    } catch {
      alert('Erro ao redefinir senha')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={isResetting}
      className="admin-btn admin-btn-secondary"
      style={{ width: '100%', justifyContent: 'flex-start' }}
    >
      {isResetting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <KeyRound size={16} />
      )}
      Redefinir Senha
    </button>
  )
}
