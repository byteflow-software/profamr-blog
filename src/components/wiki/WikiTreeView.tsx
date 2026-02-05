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
  children: WikiCategoryItem[]
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

function hasSlugInCategory(category: WikiCategoryItem, slug: string): boolean {
  if (category.articles.some((a) => hasSlugInTree(a, slug))) return true
  return category.children.some((c) => hasSlugInCategory(c, slug))
}

function countArticles(category: WikiCategoryItem): number {
  let count = category.articles.length
  for (const child of category.children) {
    count += countArticles(child)
  }
  return count
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
  depth = 0,
}: {
  category: WikiCategoryItem
  currentSlug?: string
  depth?: number
}) {
  const hasActiveChild = currentSlug
    ? hasSlugInCategory(category, currentSlug)
    : false
  const [isOpen, setIsOpen] = useState(hasActiveChild)
  const totalArticles = countArticles(category)
  const hasContent = category.articles.length > 0 || category.children.length > 0

  return (
    <li className={styles.categoryNode}>
      <button
        className={`${styles.categoryToggle} ${isOpen ? styles.categoryToggleOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <ChevronRight size={14} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
        <span className={styles.categoryName}>{category.name}</span>
        <span className={styles.categoryCount}>{totalArticles}</span>
      </button>
      {isOpen && hasContent && (
        <ul className={styles.articleList}>
          {/* Render subcategories first */}
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              currentSlug={currentSlug}
              depth={depth + 1}
            />
          ))}
          {/* Then render articles */}
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
