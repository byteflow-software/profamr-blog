'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createUser, updateUser } from './actions'
import { UserRole } from '@prisma/client'

interface UserFormProps {
  user?: {
    id: number
    email: string
    displayName: string
    role: UserRole
    bio: string | null
    twoFactorEnabled: boolean
  }
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()
  const isEditing = !!user

  const [email, setEmail] = useState(user?.email || '')
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<UserRole>(user?.role || 'AUTHOR')
  const [bio, setBio] = useState(user?.bio || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const data = {
      email,
      displayName,
      password: password || undefined,
      role,
      bio: bio || undefined,
    }

    try {
      const result = isEditing
        ? await updateUser(user.id, data)
        : await createUser(data)

      if (result.success) {
        router.push('/admin/usuarios')
        router.refresh()
      } else {
        setError(result.error || 'Erro ao salvar')
      }
    } catch {
      setError('Erro ao salvar')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="admin-card" style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error)', marginBottom: 'var(--spacing-lg)' }}>
          <p style={{ color: 'var(--color-error)', margin: 0 }}>{error}</p>
        </div>
      )}

      <div className="admin-card">
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Informações Básicas</h2>

        <div className="admin-form-group">
          <label className="admin-form-label">Nome de Exibição *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="admin-form-input"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="admin-form-input"
            required
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">
            {isEditing ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-form-input"
              required={!isEditing}
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Mínimo 8 caracteres, incluindo maiúscula, minúscula e número
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Função *</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="admin-form-select"
            required
          >
            <option value="AUTHOR">Autor</option>
            <option value="EDITOR">Editor</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Administradores têm acesso total. Editores podem gerenciar conteúdo. Autores podem criar conteúdo próprio.
          </p>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Biografia</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="admin-form-textarea"
            rows={4}
            placeholder="Uma breve descrição sobre o usuário..."
          />
        </div>
      </div>

      {isEditing && user.twoFactorEnabled && (
        <div className="admin-card" style={{ marginTop: 'var(--spacing-md)' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-sm)' }}>Autenticação de Dois Fatores</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            2FA está ativo para este usuário. Use a página de edição para desativá-lo se necessário.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
        <Link href="/admin/usuarios" className="admin-btn admin-btn-secondary">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              {isEditing ? 'Atualizar' : 'Criar Usuário'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
