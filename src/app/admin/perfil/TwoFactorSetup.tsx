'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldOff, Loader2, QrCode } from 'lucide-react'
import { setup2FA, enable2FA, disable2FA } from './actions'

interface TwoFactorSetupProps {
  userId: number
  enabled: boolean
}

export function TwoFactorSetup({ userId, enabled }: TwoFactorSetupProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [setupData, setSetupData] = useState<{ qrCode: string; secret: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await setup2FA()
      if (result.success && result.qrCode && result.secret) {
        setSetupData({ qrCode: result.qrCode, secret: result.secret })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao configurar 2FA' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao configurar 2FA' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Digite o código de 6 dígitos' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await enable2FA(verificationCode)
      if (result.success) {
        setMessage({ type: 'success', text: '2FA ativado com sucesso!' })
        setSetupData(null)
        setVerificationCode('')
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Código inválido' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao ativar 2FA' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Tem certeza que deseja desativar a autenticação de dois fatores?')) {
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await disable2FA()
      if (result.success) {
        setMessage({ type: 'success', text: '2FA desativado' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao desativar 2FA' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao desativar 2FA' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-card">
      <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <Shield size={16} />
        Autenticação de Dois Fatores
      </h3>

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

      {enabled ? (
        <div>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-success)' }}>
            2FA está ativo para sua conta.
          </p>
          <button
            onClick={handleDisable}
            disabled={isLoading}
            className="admin-btn admin-btn-danger"
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldOff size={16} />
            )}
            Desativar 2FA
          </button>
        </div>
      ) : setupData ? (
        <div>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
            Escaneie o QR Code com seu app autenticador:
          </p>

          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
            <img
              src={setupData.qrCode}
              alt="QR Code 2FA"
              style={{
                maxWidth: '200px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>
            Ou digite manualmente:
          </p>
          <code
            style={{
              display: 'block',
              padding: 'var(--spacing-sm)',
              background: 'var(--color-bg-muted)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              wordBreak: 'break-all',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            {setupData.secret}
          </code>

          <div className="admin-form-group">
            <label className="admin-form-label">Código de Verificação</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="admin-form-input"
              placeholder="000000"
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontFamily: 'monospace' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              onClick={() => setSetupData(null)}
              className="admin-btn admin-btn-secondary"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button
              onClick={handleEnable}
              disabled={isLoading || verificationCode.length !== 6}
              className="admin-btn admin-btn-primary"
              style={{ flex: 1 }}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Ativar'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)', color: 'var(--color-text-muted)' }}>
            Adicione uma camada extra de segurança à sua conta.
          </p>
          <button
            onClick={handleSetup}
            disabled={isLoading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%' }}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <QrCode size={16} />
            )}
            Configurar 2FA
          </button>
        </div>
      )}
    </div>
  )
}
