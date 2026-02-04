'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { User, Settings, LogOut, ChevronDown, Shield } from 'lucide-react'
import styles from './AdminHeader.module.css'

interface AdminHeaderProps {
  user: {
    displayName: string
    email: string
    role: string
    twoFactorEnabled: boolean
  }
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  EDITOR: 'Editor',
  AUTHOR: 'Autor',
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/admin/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Breadcrumb or page title could go here */}
      </div>

      <div className={styles.right}>
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.userButton}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className={styles.avatar}>
              <User size={18} />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.displayName}</span>
              <span className={styles.userRole}>{roleLabels[user.role] || user.role}</span>
            </div>
            <ChevronDown
              size={16}
              className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownEmail}>{user.email}</span>
                {user.twoFactorEnabled && (
                  <span className={styles.badge2fa}>
                    <Shield size={12} />
                    2FA
                  </span>
                )}
              </div>

              <div className={styles.dropdownDivider} />

              <Link
                href="/admin/perfil"
                className={styles.dropdownItem}
                onClick={() => setIsDropdownOpen(false)}
              >
                <User size={16} />
                Meu Perfil
              </Link>

              <Link
                href="/admin/configuracoes"
                className={styles.dropdownItem}
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} />
                Configurações
              </Link>

              <div className={styles.dropdownDivider} />

              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
