import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
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
  const session = await auth()

  return (
    <div className="admin-layout">
      {session ? (
        <>
          <AdminSidebar user={session.user} />
          <div className="admin-main">
            <AdminHeader user={session.user} />
            <main className="admin-content">{children}</main>
          </div>
        </>
      ) : (
        <main className="admin-content-full">{children}</main>
      )}
    </div>
  )
}
