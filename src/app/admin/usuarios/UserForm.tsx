'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Save, Loader2, ArrowLeft } from 'lucide-react'
import { updateUser } from './actions'
import { UserRole } from '@prisma/client'

interface UserFormProps {
  user?: {
    id: number
    email: string
    displayName: string
    role: UserRole
    bio: string | null
  }
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter()

  if (!user) {
    return (
      <div className="admin-card">
        <p style={{ color: 'var(--color-text-muted)' }}>
          A criação de novos usuários é feita diretamente no painel do Clerk.
          Após criar o usuário no Clerk, execute o script de migração para vincular ao sistema.
        </p>
        <Link href="/admin/usuarios" className="admin-btn admin-btn-secondary" style={{ marginTop: 'var(--spacing-md)' }}>
          <ArrowLeft size={16} />
          Voltar
        </Link>
      </div>
    )
  }

  const [email, setEmail] = useState(user.email)
  const [displayName, setDisplayName] = useState(user.displayName)
  const [role, setRole] = useState<UserRole>(user.role)
  const [bio, setBio] = useState(user.bio || '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const result = await updateUser(user.id, {
        email,
        displayName,
        role,
        bio: bio || undefined,
      })

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
              Atualizar
            </>
          )}
        </button>
      </div>
    </form>
  )
}
