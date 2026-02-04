'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { WikiTreeView } from './WikiTreeView'
import styles from './WikiSidebar.module.css'

interface WikiSidebarProps {
  categories: Parameters<typeof WikiTreeView>[0]['categories']
  currentSlug?: string
  title?: string
}

export function WikiSidebar({ categories, currentSlug, title = 'Categorias' }: WikiSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.toggleLabel}>{title}</span>
        <ChevronDown size={16} className={`${styles.toggleIcon} ${isOpen ? styles.toggleIconOpen : ''}`} />
      </button>
      <div className={styles.desktopContent}>
        <h2 className={styles.title}>{title}</h2>
        <WikiTreeView categories={categories} currentSlug={currentSlug} />
      </div>
      {isOpen && (
        <div className={styles.mobileContent}>
          <WikiTreeView categories={categories} currentSlug={currentSlug} />
        </div>
      )}
    </div>
  )
}
