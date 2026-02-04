'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Eye, EyeOff } from 'lucide-react'
import { changePassword } from './actions'

interface PasswordFormProps {
  userId: number
}

export function PasswordForm({ userId }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não conferem' })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await changePassword(currentPassword, newPassword)

      if (result.success) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao alterar senha' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao alterar senha' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-card">
      <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Alterar Senha</h2>

      <form onSubmit={handleSubmit}>
        {message && (
          <div
            style={{
              padding: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              background: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {message.text}
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-form-label">Senha Atual *</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="admin-form-input"
              required
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
              }}
            >
              {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Nova Senha *</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="admin-form-input"
            required
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Mínimo 8 caracteres, incluindo maiúscula, minúscula e número
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Confirmar Nova Senha *</label>
          <input
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="admin-form-input"
            required
          />
        </div>

        <button
          type="submit"
          className="admin-btn admin-btn-secondary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Alterando...
            </>
          ) : (
            <>
              <KeyRound size={16} />
              Alterar Senha
            </>
          )}
        </button>
      </form>
    </div>
  )
}
