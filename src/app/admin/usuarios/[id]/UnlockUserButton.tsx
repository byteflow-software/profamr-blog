'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Unlock, Loader2 } from 'lucide-react'
import { unlockUser } from '../actions'

interface UnlockUserButtonProps {
  userId: number
  userName: string
}

export function UnlockUserButton({ userId, userName }: UnlockUserButtonProps) {
  const router = useRouter()
  const [isUnlocking, setIsUnlocking] = useState(false)

  const handleUnlock = async () => {
    if (!confirm(`Desbloquear a conta de "${userName}"?`)) {
      return
    }

    setIsUnlocking(true)
    try {
      const result = await unlockUser(userId)
      if (result.success) {
        alert('Conta desbloqueada com sucesso!')
        router.refresh()
      } else {
        alert(result.error || 'Erro ao desbloquear conta')
      }
    } catch {
      alert('Erro ao desbloquear conta')
    } finally {
      setIsUnlocking(false)
    }
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={isUnlocking}
      className="admin-btn admin-btn-success"
      style={{ width: '100%', justifyContent: 'flex-start' }}
    >
      {isUnlocking ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Unlock size={16} />
      )}
      Desbloquear Conta
    </button>
  )
}
