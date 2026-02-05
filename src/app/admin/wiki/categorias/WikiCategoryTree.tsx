'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react'
import { WikiCategoryTreeItem, WikiCategoryNode } from './WikiCategoryTreeItem'
import { updateWikiCategoryHierarchy } from './actions'
import styles from './WikiCategoryTree.module.css'

interface WikiCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  order: number
  parentId: number | null
  _count: { articles: number }
  parent?: { name: string } | null
}

interface WikiCategoryTreeProps {
  categories: WikiCategory[]
}

function buildTree(categories: WikiCategory[]): WikiCategoryNode[] {
  const map = new Map<number, WikiCategoryNode>()
  const roots: WikiCategoryNode[] = []

  for (const cat of categories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of categories) {
    const node = map.get(cat.id)!
    if (cat.parentId === null) {
      roots.push(node)
    } else {
      const parent = map.get(cat.parentId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    }
  }

  const sortChildren = (nodes: WikiCategoryNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    for (const node of nodes) sortChildren(node.children)
  }
  sortChildren(roots)

  return roots
}

function flattenTree(nodes: WikiCategoryNode[], expanded: Set<number>): WikiCategoryNode[] {
  const result: WikiCategoryNode[] = []
  const traverse = (node: WikiCategoryNode) => {
    result.push(node)
    if (expanded.has(node.id) && node.children.length > 0) {
      for (const child of node.children) traverse(child)
    }
  }
  for (const node of nodes) traverse(node)
  return result
}

function getDescendantIds(node: WikiCategoryNode): number[] {
  const ids: number[] = []
  const traverse = (n: WikiCategoryNode) => {
    for (const child of n.children) {
      ids.push(child.id)
      traverse(child)
    }
  }
  traverse(node)
  return ids
}

function findNode(nodes: WikiCategoryNode[], id: number): WikiCategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

export function WikiCategoryTree({ categories }: WikiCategoryTreeProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [overId, setOverId] = useState<number | null>(null)
  const [overAsChild, setOverAsChild] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(
    () => new Set(categories.map((c) => c.id))
  )

  const tree = useMemo(() => buildTree(categories), [categories])
  const flatList = useMemo(() => flattenTree(tree, expanded), [tree, expanded])
  const activeNode = activeId ? findNode(tree, activeId) : null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const toggleExpand = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpanded(new Set(categories.map((c) => c.id)))
  }, [categories])

  const collapseAll = useCallback(() => {
    setExpanded(new Set())
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number)
    setError('')
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event
    if (!over) {
      setOverId(null)
      setOverAsChild(false)
      return
    }

    const targetId = over.id as number
    const sourceId = active.id as number
    const activeNode = findNode(tree, sourceId)

    if (activeNode) {
      const descendantIds = getDescendantIds(activeNode)
      if (targetId === sourceId || descendantIds.includes(targetId)) {
        setOverId(null)
        setOverAsChild(false)
        return
      }
    }

    setOverId(targetId)
    setOverAsChild(true)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)
    setOverAsChild(false)

    if (!over || active.id === over.id) return

    const sourceId = active.id as number
    const targetId = over.id as number
    const activeNode = findNode(tree, sourceId)
    if (!activeNode) return

    const descendantIds = getDescendantIds(activeNode)
    if (descendantIds.includes(targetId)) {
      setError('Não é possível mover uma categoria para dentro de uma subcategoria')
      return
    }

    setIsUpdating(true)
    setError('')

    try {
      const result = await updateWikiCategoryHierarchy([
        { id: sourceId, parentId: targetId },
      ])
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Erro ao atualizar hierarquia')
      }
    } catch {
      setError('Erro ao atualizar hierarquia')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMoveToRoot = async (categoryId: number) => {
    setIsUpdating(true)
    setError('')
    try {
      const result = await updateWikiCategoryHierarchy([
        { id: categoryId, parentId: null },
      ])
      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || 'Erro ao mover para raiz')
      }
    } catch {
      setError('Erro ao mover para raiz')
    } finally {
      setIsUpdating(false)
    }
  }

  if (categories.length === 0) {
    return <p className={styles.empty}>Nenhuma categoria cadastrada.</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className="admin-btn admin-btn-sm admin-btn-secondary"
          onClick={expandAll}
        >
          <ChevronDown size={14} />
          Expandir Tudo
        </button>
        <button
          type="button"
          className="admin-btn admin-btn-sm admin-btn-secondary"
          onClick={collapseAll}
        >
          <ChevronRight size={14} />
          Colapsar Tudo
        </button>
        {isUpdating && (
          <span className={styles.updating}>
            <Loader2 size={14} className="animate-spin" />
            Atualizando...
          </span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.hint}>
        Arraste uma categoria e solte sobre outra para torná-la subcategoria.
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={flatList.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className={styles.tree}>
            <button
              type="button"
              className={styles.rootDropZone}
              onClick={() => { if (activeId) handleMoveToRoot(activeId) }}
            >
              Solte aqui para mover para a raiz
            </button>

            {tree.map((category) => (
              <WikiCategoryTreeItem
                key={category.id}
                category={category}
                depth={0}
                expandedIds={expanded}
                onToggleExpand={toggleExpand}
                activeId={activeId}
                overId={overId}
                overAsChild={overAsChild}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeNode && (
            <div className={styles.dragOverlay}>
              {activeNode.icon && <span>{activeNode.icon}</span>}
              <span className={styles.dragOverlayName}>{activeNode.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
