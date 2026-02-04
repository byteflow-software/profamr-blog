import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, ShieldOff, Unlock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { UserForm } from '../UserForm'
import { ResetPasswordButton } from './ResetPasswordButton'
import { Disable2FAButton } from './Disable2FAButton'
import { UnlockUserButton } from './UnlockUserButton'

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

async function getUser(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      bio: true,
      twoFactorEnabled: true,
      failedAttempts: true,
      lockedUntil: true,
      lastLoginAt: true,
      createdAt: true,
    },
  })
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const { id } = await params
  const userId = parseInt(id)

  if (isNaN(userId)) {
    notFound()
  }

  const user = await getUser(userId)

  if (!user) {
    notFound()
  }

  const isLocked = user.lockedUntil && new Date(user.lockedUntil) > new Date()
  const isSelf = parseInt(session.user.id) === user.id

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Usuário</h1>
          <p className="admin-page-subtitle">{user.displayName}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        <div>
          <UserForm user={user} />
        </div>

        <div>
          <div className="admin-card">
            <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Informações</h3>

            <div style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
              <strong>Criado em:</strong>{' '}
              {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>

            <div style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
              <strong>Último login:</strong>{' '}
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Nunca'}
            </div>

            <div style={{ fontSize: '0.875rem' }}>
              <strong>Tentativas falhas:</strong> {user.failedAttempts}
            </div>
          </div>

          <div className="admin-card" style={{ marginTop: 'var(--spacing-md)' }}>
            <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Ações de Segurança</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
              <ResetPasswordButton userId={user.id} userName={user.displayName} />

              {user.twoFactorEnabled && !isSelf && (
                <Disable2FAButton userId={user.id} userName={user.displayName} />
              )}

              {isLocked && (
                <UnlockUserButton userId={user.id} userName={user.displayName} />
              )}
            </div>
          </div>

          {isLocked && (
            <div className="admin-card" style={{ marginTop: 'var(--spacing-md)', background: 'var(--color-warning-bg)', borderColor: 'var(--color-warning)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-warning)' }}>
                <strong>Conta bloqueada</strong> até{' '}
                {new Date(user.lockedUntil!).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
