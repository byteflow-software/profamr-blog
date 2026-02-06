import { getCurrentUser } from '@/lib/auth'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import './admin.css'

export const metadata = {
  title: {
    default: 'Admin - Prof. AMR',
    template: '%s | Admin - Prof. AMR',
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="admin-layout">
      {user ? (
        <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
      ) : (
        <main className="admin-content-full">{children}</main>
      )}
    </div>
  )
}
