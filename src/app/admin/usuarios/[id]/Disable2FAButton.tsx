'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldOff, Loader2 } from 'lucide-react'
import { disable2FA } from '../actions'

interface Disable2FAButtonProps {
  userId: number
  userName: string
}

export function Disable2FAButton({ userId, userName }: Disable2FAButtonProps) {
  const router = useRouter()
  const [isDisabling, setIsDisabling] = useState(false)

  const handleDisable = async () => {
    if (
      !confirm(
        `Tem certeza que deseja desativar a autenticação de dois fatores para "${userName}"?\n\nO usuário precisará configurar novamente se quiser usar 2FA.`
      )
    ) {
      return
    }

    setIsDisabling(true)
    try {
      const result = await disable2FA(userId)
      if (result.success) {
        alert('2FA desativado com sucesso!')
        router.refresh()
      } else {
        alert(result.error || 'Erro ao desativar 2FA')
      }
    } catch {
      alert('Erro ao desativar 2FA')
    } finally {
      setIsDisabling(false)
    }
  }

  return (
    <button
      onClick={handleDisable}
      disabled={isDisabling}
      className="admin-btn admin-btn-warning"
      style={{ width: '100%', justifyContent: 'flex-start' }}
    >
      {isDisabling ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ShieldOff size={16} />
      )}
      Desativar 2FA
    </button>
  )
}
