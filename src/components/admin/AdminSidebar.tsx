'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  ExternalLink,
} from 'lucide-react'
import styles from './AdminSidebar.module.css'

interface AdminSidebarProps {
  user: {
    displayName: string
    role: string
  }
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Posts',
    href: '/admin/posts',
    icon: FileText,
  },
  {
    label: 'Categorias',
    href: '/admin/categorias',
    icon: FolderTree,
  },
  {
    label: 'Tags',
    href: '/admin/tags',
    icon: Tags,
  },
  {
    label: 'Wiki',
    href: '/admin/wiki',
    icon: BookOpen,
    submenu: [
      { label: 'Artigos', href: '/admin/wiki' },
      { label: 'Categorias', href: '/admin/wiki/categorias' },
    ],
  },
  {
    label: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
    adminOnly: true,
  },
  {
    label: 'Configurações',
    href: '/admin/configuracoes',
    icon: Settings,
  },
]

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const filteredItems = menuItems.filter(
    (item) => !item.adminOnly || user.role === 'ADMIN'
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${
          isMobileOpen ? styles.mobileOpen : ''
        }`}
      >
        <div className={styles.header}>
          <Link href="/admin" className={styles.logo}>
            {isCollapsed ? (
              <span className={styles.logoIcon}>P</span>
            ) : (
              <Image
                src="/images/prof_amr_logo.png"
                alt="Prof. AMR"
                width={100}
                height={40}
                className={styles.logoImage}
              />
            )}
          </Link>
          <button
            className={styles.collapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className={styles.nav}>
          {filteredItems.map((item) => (
            <div key={item.href} className={styles.navItem}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${
                  isActive(item.href) ? styles.active : ''
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon size={20} className={styles.navIcon} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
              {item.submenu && !isCollapsed && isActive(item.href) && (
                <div className={styles.submenu}>
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`${styles.submenuLink} ${
                        pathname === sub.href ? styles.active : ''
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <Link
            href="/"
            className={styles.viewSite}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            {!isCollapsed && <span>Ver site</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}
