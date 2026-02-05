'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown, Folder, FolderOpen, Pencil } from 'lucide-react'
import { DeleteWikiCategoryButton } from './DeleteWikiCategoryButton'
import styles from './WikiCategoryTree.module.css'

export interface WikiCategoryNode {
  id: number
  name: string
  slug: string
  icon: string | null
  order: number
  parentId: number | null
  _count: { articles: number }
  children: WikiCategoryNode[]
}

interface WikiCategoryTreeItemProps {
  category: WikiCategoryNode
  depth: number
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  activeId: number | null
  overId: number | null
  overAsChild: boolean
}

export function WikiCategoryTreeItem({
  category,
  depth,
  expandedIds,
  onToggleExpand,
  activeId,
  overId,
  overAsChild,
}: WikiCategoryTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id,
    data: {
      type: 'wiki-category',
      category,
      depth,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    '--depth': depth,
  } as React.CSSProperties

  const hasChildren = category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isOver = overId === category.id && !overAsChild
  const isOverAsChild = overId === category.id && overAsChild

  return (
    <div
      ref={setNodeRef}
      className={`${styles.item} ${isDragging ? styles.dragging : ''} ${isOver ? styles.over : ''} ${isOverAsChild ? styles.overAsChild : ''}`}
      style={style}
    >
      <div className={styles.itemContent}>
        <button
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <button
          className={styles.expandButton}
          onClick={() => onToggleExpand(category.id)}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className={styles.expandPlaceholder} />
          )}
        </button>

        <span className={styles.icon}>
          {category.icon ? (
            <span>{category.icon}</span>
          ) : hasChildren ? (
            isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <Folder size={16} />
          )}
        </span>

        <span className={styles.name}>{category.name}</span>
        <span className={styles.slug}>{category.slug}</span>
        <span className={styles.count}>{category._count.articles} artigos</span>

        <div className={styles.actions}>
          <Link
            href={`/admin/wiki/categorias/${category.id}`}
            className="admin-btn admin-btn-sm admin-btn-secondary"
          >
            <Pencil size={14} />
          </Link>
          <DeleteWikiCategoryButton
            categoryId={category.id}
            categoryName={category.name}
            articleCount={category._count.articles}
          />
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className={styles.children}>
          {category.children.map((child) => (
            <WikiCategoryTreeItem
              key={child.id}
              category={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              activeId={activeId}
              overId={overId}
              overAsChild={overAsChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}
