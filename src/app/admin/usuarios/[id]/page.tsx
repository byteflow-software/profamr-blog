import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { UserForm } from '../UserForm'

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
      createdAt: true,
    },
  })
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUser = await getCurrentUser()

  if (currentUser?.role !== 'ADMIN') {
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

  const isSelf = currentUser.id === user.id

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

            {isSelf && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Este é o seu próprio perfil.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
