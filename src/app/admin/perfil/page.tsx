import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProfileForm } from './ProfileForm'
import { PasswordForm } from './PasswordForm'
import { TwoFactorSetup } from './TwoFactorSetup'

async function getUser(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
      lastLoginAt: true,
      _count: {
        select: {
          posts: true,
          wikiArticles: true,
        },
      },
    },
  })
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/admin/login')
  }

  const user = await getUser(parseInt(session.user.id))

  if (!user) {
    redirect('/admin/login')
  }

  const roleLabel = {
    ADMIN: 'Administrador',
    EDITOR: 'Editor',
    AUTHOR: 'Autor',
  }[user.role]

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Meu Perfil</h1>
          <p className="admin-page-subtitle">{roleLabel}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--spacing-lg)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <ProfileForm user={user} />
          <PasswordForm userId={user.id} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div className="admin-card">
            <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Estatísticas</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{user._count.posts}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Posts</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{user._count.wikiArticles}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Wiki</div>
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>Informações</h3>

            <div style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
              <strong>Membro desde:</strong><br />
              {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>

            <div style={{ fontSize: '0.875rem' }}>
              <strong>Último acesso:</strong><br />
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
          </div>

          <TwoFactorSetup userId={user.id} enabled={user.twoFactorEnabled} />
        </div>
      </div>
    </div>
  )
}
