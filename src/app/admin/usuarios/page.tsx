import Link from 'next/link'
import { Edit, Shield, ShieldCheck, User as UserIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DeleteUserButton } from './DeleteUserButton'

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          wikiArticles: true,
        },
      },
    },
  })
}

export default async function UsersPage() {
  const currentUser = await getCurrentUser()

  if (currentUser?.role !== 'ADMIN') {
    redirect('/admin')
  }

  const users = await getUsers()

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="admin-badge admin-badge-danger">Administrador</span>
      case 'EDITOR':
        return <span className="admin-badge admin-badge-warning">Editor</span>
      default:
        return <span className="admin-badge admin-badge-secondary">Autor</span>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck size={16} />
      case 'EDITOR':
        return <Shield size={16} />
      default:
        return <UserIcon size={16} />
    }
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Usuários</h1>
          <p className="admin-page-subtitle">{users.length} usuário(s) cadastrado(s)</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Função</th>
                <th>Conteúdo</th>
                <th>Criado em</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {getRoleIcon(user.role)}
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.displayName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>
                      <span title="Posts">{user._count.posts} posts</span>
                      {' · '}
                      <span title="Wiki">{user._count.wikiArticles} wiki</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem' }}>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      <Link
                        href={`/admin/usuarios/${user.id}`}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </Link>
                      <DeleteUserButton
                        userId={user.id}
                        userName={user.displayName}
                        contentCount={user._count.posts + user._count.wikiArticles}
                        currentUserId={currentUser.id}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
