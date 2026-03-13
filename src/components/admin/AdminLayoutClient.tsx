'use client'

import { useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { TutorialProvider } from './tutorial/tutorial-provider'

interface AdminLayoutClientProps {
  user: {
    id: number
    email: string
    displayName: string
    role: string
    bio: string | null
    avatarUrl: string | null
  }
  children: React.ReactNode
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TutorialProvider>
      <AdminSidebar
        user={user}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={`admin-main ${isCollapsed ? 'admin-main-collapsed' : ''}`}>
        <AdminHeader user={user} />
        <main className="admin-content">{children}</main>
      </div>
    </TutorialProvider>
  )
}
