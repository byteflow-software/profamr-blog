'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronRight, ChevronDown, Folder, FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { DeleteCategoryButton } from './DeleteCategoryButton'
import styles from './CategoryTree.module.css'

export interface CategoryNode {
  id: number
  name: string
  slug: string
  parentId: number | null
  _count: { posts: number }
  children: CategoryNode[]
}

interface CategoryTreeItemProps {
  category: CategoryNode
  depth: number
  isExpanded: boolean
  onToggleExpand: (id: number) => void
  isDragging?: boolean
  isOver?: boolean
  isOverAsChild?: boolean
}

export const CategoryTreeItem = forwardRef<HTMLDivElement, CategoryTreeItemProps>(
  function CategoryTreeItem(
    { category, depth, isExpanded, onToggleExpand, isDragging, isOver, isOverAsChild },
    ref
  ) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({
      id: category.id,
      data: {
        type: 'category',
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
    const dragging = isDragging || isSortableDragging

    return (
      <div
        ref={(node) => {
          setNodeRef(node)
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={`${styles.item} ${dragging ? styles.dragging : ''} ${isOver ? styles.over : ''} ${isOverAsChild ? styles.overAsChild : ''}`}
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
            {hasChildren ? (
              isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
            ) : (
              <Folder size={16} />
            )}
          </span>

          <span className={styles.name}>{category.name}</span>
          <span className={styles.slug}>{category.slug}</span>
          <span className={styles.count}>{category._count.posts} posts</span>

          <div className={styles.actions}>
            <Link
              href={`/admin/categorias/${category.id}`}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              <Pencil size={14} />
            </Link>
            <DeleteCategoryButton
              categoryId={category.id}
              categoryName={category.name}
              postCount={category._count.posts}
            />
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className={styles.children}>
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                depth={depth + 1}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        )}
      </div>
    )
  }
)
