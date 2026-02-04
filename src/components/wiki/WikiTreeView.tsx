'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import styles from './WikiTreeView.module.css'

interface WikiArticleItem {
  id: number
  title: string
  slug: string
  children: WikiArticleItem[]
}

interface WikiCategoryItem {
  id: number
  name: string
  slug: string
  articles: WikiArticleItem[]
}

interface WikiTreeViewProps {
  categories: WikiCategoryItem[]
  currentSlug?: string
}

function hasSlugInTree(article: WikiArticleItem, slug: string): boolean {
  if (article.slug === slug) return true
  return article.children.some((c) => hasSlugInTree(c, slug))
}

function TreeNode({
  article,
  currentSlug,
  depth = 0,
}: {
  article: WikiArticleItem
  currentSlug?: string
  depth?: number
}) {
  const [isOpen, setIsOpen] = useState(
    currentSlug ? hasSlugInTree(article, currentSlug) : false
  )
  const hasChildren = article.children.length > 0
  const isActive = article.slug === currentSlug

  return (
    <li className={styles.node}>
      <div
        className={`${styles.nodeRow} ${isActive ? styles.nodeActive : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
      >
        {hasChildren && (
          <button
            className={`${styles.toggle} ${isOpen ? styles.toggleOpen : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Recolher' : 'Expandir'}
          >
            <ChevronRight size={14} />
          </button>
        )}
        <Link
          href={`/wiki/${article.slug}`}
          className={`${styles.nodeLink} ${isActive ? styles.nodeLinkActive : ''}`}
        >
          {article.title}
        </Link>
      </div>
      {hasChildren && isOpen && (
        <ul className={styles.children}>
          {article.children!.map((child) => (
            <TreeNode
              key={child.id}
              article={child}
              currentSlug={currentSlug}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function CategoryNode({
  category,
  currentSlug,
}: {
  category: WikiCategoryItem
  currentSlug?: string
}) {
  const hasActiveChild = currentSlug
    ? category.articles.some((a) => hasSlugInTree(a, currentSlug))
    : false
  const [isOpen, setIsOpen] = useState(hasActiveChild)

  return (
    <li className={styles.categoryNode}>
      <button
        className={`${styles.categoryToggle} ${isOpen ? styles.categoryToggleOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
        <span className={styles.categoryName}>{category.name}</span>
        <span className={styles.categoryCount}>{category.articles.length}</span>
      </button>
      {isOpen && category.articles.length > 0 && (
        <ul className={styles.articleList}>
          {category.articles.map((article) => (
            <TreeNode
              key={article.id}
              article={article}
              currentSlug={currentSlug}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function WikiTreeView({ categories, currentSlug }: WikiTreeViewProps) {
  return (
    <nav className={styles.tree} aria-label="Navegação Wiki">
      <ul className={styles.root}>
        {categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            currentSlug={currentSlug}
          />
        ))}
      </ul>
    </nav>
  )
}
