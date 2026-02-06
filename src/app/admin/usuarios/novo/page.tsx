import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UserForm } from '../UserForm'

export default async function NewUserPage() {
  const user = await getCurrentUser()

  if (user?.role !== 'ADMIN') {
    redirect('/admin')
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Novo Usuário</h1>
          <p className="admin-page-subtitle">Criar uma nova conta de usuário</p>
        </div>
      </div>

      <UserForm />
    </div>
  )
}
