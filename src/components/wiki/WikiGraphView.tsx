'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'
import type { WikiCategoryTree, WikiArticleTree } from '@/lib/wiki'
import styles from './WikiGraphView.module.css'

interface WikiGraphViewProps {
  categories: WikiCategoryTree[]
  onClose: () => void
}

interface LayoutNode {
  id: string
  label: string
  x: number
  y: number
  width: number
  height: number
  color: string
  type: 'category' | 'article'
  slug: string
  hasChildren: boolean
  expanded: boolean
}

interface LayoutEdge {
  from: string
  to: string
}

const NODE_H = 36
const NODE_PAD_X = 16
const LEVEL_GAP_Y = 90
const SIBLING_GAP_X = 30
const CATEGORY_COLOR = '#1a5276'
const ARTICLE_COLOR = '#d4a853'
const CHAR_WIDTH = 7.5
const MAX_LABEL = 28

function truncateLabel(text: string): string {
  if (text.length <= MAX_LABEL) return text
  return text.slice(0, MAX_LABEL - 1) + '\u2026'
}

function measureNodeWidth(label: string): number {
  const truncated = truncateLabel(label)
  return Math.max(100, truncated.length * CHAR_WIDTH + NODE_PAD_X * 2)
}

function computeBounds(nodes: LayoutNode[]) {
  if (nodes.length === 0) return { x: 0, y: 0, w: 1200, h: 800 }
  const minX = Math.min(...nodes.map((n) => n.x)) - 60
  const minY = Math.min(...nodes.map((n) => n.y)) - 60
  const maxX = Math.max(...nodes.map((n) => n.x + n.width)) + 60
  const maxY = Math.max(...nodes.map((n) => n.y + n.height)) + 60
  return { x: minX, y: minY, w: Math.max(maxX - minX, 200), h: Math.max(maxY - minY, 200) }
}

export function WikiGraphView({ categories, onClose }: WikiGraphViewProps) {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Start with all categories collapsed
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set<string>())

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  // Memoize layout to avoid creating new arrays every render
  const { nodes, edges } = useMemo(
    () => buildLayout(categories, expandedIds),
    [categories, expandedIds]
  )

  // Compute auto-fit viewBox from nodes (stable, no infinite loop)
  const autoBounds = useMemo(() => computeBounds(nodes), [nodes])

  // viewBox state - initialized from auto bounds, kept stable on expand/collapse
  const [viewBox, setViewBox] = useState(autoBounds)
  const viewBoxRef = useRef(viewBox)
  viewBoxRef.current = viewBox

  // Pan state via refs to avoid stale closures
  const isPanningRef = useRef(false)
  const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 })

  // Wheel zoom with passive: false
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 1.1 : 0.9
      setViewBox((prev) => {
        const newW = prev.w * factor
        const newH = prev.h * factor
        const dx = (prev.w - newW) / 2
        const dy = (prev.h - newH) / 2
        return { x: prev.x + dx, y: prev.y + dy, w: newW, h: newH }
      })
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    isPanningRef.current = true
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      vx: viewBoxRef.current.x,
      vy: viewBoxRef.current.y,
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    const vb = viewBoxRef.current
    const scaleX = vb.w / rect.width
    const scaleY = vb.h / rect.height
    const dx = (e.clientX - panStart.current.x) * scaleX
    const dy = (e.clientY - panStart.current.y) * scaleY
    setViewBox({
      x: panStart.current.vx - dx,
      y: panStart.current.vy - dy,
      w: vb.w,
      h: vb.h,
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
  }, [])

  const zoom = useCallback((factor: number) => {
    setViewBox((prev) => {
      const newW = prev.w * factor
      const newH = prev.h * factor
      const dx = (prev.w - newW) / 2
      const dy = (prev.h - newH) / 2
      return { x: prev.x + dx, y: prev.y + dy, w: newW, h: newH }
    })
  }, [])

  const resetView = useCallback(() => {
    setViewBox(autoBounds)
  }, [autoBounds])

  const handleNodeClick = useCallback(
    (node: LayoutNode) => {
      if (node.type === 'article') {
        router.push(`/wiki/${node.slug}`)
        onClose()
      } else if (node.hasChildren) {
        toggleExpand(node.id)
      }
    },
    [router, onClose, toggleExpand]
  )

  // Build node map for edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map<string, LayoutNode>()
    nodes.forEach((n) => map.set(n.id, n))
    return map
  }, [nodes])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.topBar}>
          <span className={styles.topBarTitle}>Hierarquia da Wiki</span>
          <div className={styles.topBarActions}>
            <button className={styles.controlBtn} onClick={() => zoom(0.75)} title="Zoom in">
              <ZoomIn size={16} />
            </button>
            <button className={styles.controlBtn} onClick={() => zoom(1.35)} title="Zoom out">
              <ZoomOut size={16} />
            </button>
            <button className={styles.controlBtn} onClick={resetView} title="Ajustar à tela">
              <Maximize2 size={16} />
            </button>
            <button className={styles.closeBtn} onClick={onClose} title="Fechar">
              <X size={18} />
            </button>
          </div>
        </div>

        <div
          ref={wrapperRef}
          className={styles.svgWrapper}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            className={styles.svg}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodeMap.get(edge.from)
              const to = nodeMap.get(edge.to)
              if (!from || !to) return null
              const x1 = from.x + from.width / 2
              const y1 = from.y + from.height
              const x2 = to.x + to.width / 2
              const y2 = to.y
              const midY = (y1 + y2) / 2
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#bbb"
                  strokeWidth={1.5}
                  opacity={0.5}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isCategory = node.type === 'category'
              const bgColor = isCategory ? (node.color || CATEGORY_COLOR) : ARTICLE_COLOR
              const textColor = isCategory ? '#fff' : '#333'
              const rx = isCategory ? 6 : 14

              return (
                <g
                  key={node.id}
                  style={{ cursor: node.hasChildren || node.type === 'article' ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNodeClick(node)
                  }}
                >
                  <rect
                    x={node.x}
                    y={node.y}
                    width={node.width}
                    height={node.height}
                    rx={rx}
                    fill={bgColor}
                    stroke={isCategory ? 'rgba(0,0,0,0.15)' : 'rgba(180,140,20,0.3)'}
                    strokeWidth={1}
                  />
                  {/* Expand/collapse indicator */}
                  {isCategory && node.hasChildren && (
                    <text
                      x={node.x + 10}
                      y={node.y + node.height / 2 + 1}
                      fontSize={10}
                      fill="rgba(255,255,255,0.7)"
                      dominantBaseline="middle"
                    >
                      {node.expanded ? '\u25BC' : '\u25B6'}
                    </text>
                  )}
                  <text
                    x={node.x + (isCategory && node.hasChildren ? 24 : NODE_PAD_X)}
                    y={node.y + node.height / 2 + 1}
                    fontSize={12}
                    fontWeight={isCategory ? 600 : 400}
                    fontFamily="system-ui, sans-serif"
                    fill={textColor}
                    dominantBaseline="middle"
                  >
                    {truncateLabel(node.label)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: CATEGORY_COLOR }} />
            <span>Categoria</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: ARTICLE_COLOR }} />
            <span>Artigo</span>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.6875rem' }}>
            Clique nas categorias para expandir/colapsar. Clique nos artigos para acessar.
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Layout algorithm ---

interface TreeNode {
  id: string
  label: string
  color: string
  type: 'category' | 'article'
  slug: string
  hasChildren: boolean
  expanded: boolean
  children: TreeNode[]
}

function buildTreeFromCategory(
  cat: WikiCategoryTree,
  expandedIds: Set<string>
): TreeNode {
  const id = `cat-${cat.id}`
  const expanded = expandedIds.has(id)
  const children: TreeNode[] = []

  if (expanded) {
    cat.children.forEach((child) => {
      children.push(buildTreeFromCategory(child, expandedIds))
    })
    cat.articles.forEach((art) => {
      children.push(buildTreeFromArticle(art, expandedIds))
    })
  }

  return {
    id,
    label: cat.name,
    color: cat.color || CATEGORY_COLOR,
    type: 'category',
    slug: cat.slug,
    hasChildren: cat.children.length > 0 || cat.articles.length > 0,
    expanded,
    children,
  }
}

function buildTreeFromArticle(
  art: WikiArticleTree,
  expandedIds: Set<string>
): TreeNode {
  const id = `art-${art.id}`
  const expanded = expandedIds.has(id)
  const children: TreeNode[] = []

  if (expanded && art.children.length > 0) {
    art.children.forEach((child) => {
      children.push(buildTreeFromArticle(child, expandedIds))
    })
  }

  return {
    id,
    label: art.title,
    color: ARTICLE_COLOR,
    type: 'article',
    slug: art.slug,
    hasChildren: art.children.length > 0,
    expanded,
    children,
  }
}

function getSubtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) {
    return measureNodeWidth(node.label)
  }
  const childrenWidth = node.children.reduce(
    (sum, child) => sum + getSubtreeWidth(child) + SIBLING_GAP_X,
    -SIBLING_GAP_X
  )
  return Math.max(measureNodeWidth(node.label), childrenWidth)
}

function buildLayout(
  categories: WikiCategoryTree[],
  expandedIds: Set<string>
): { nodes: LayoutNode[]; edges: LayoutEdge[] } {
  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []

  const roots = categories.map((cat) => buildTreeFromCategory(cat, expandedIds))

  function positionNode(node: TreeNode, cx: number, y: number): void {
    const w = measureNodeWidth(node.label)
    nodes.push({
      id: node.id,
      label: node.label,
      x: cx - w / 2,
      y,
      width: w,
      height: NODE_H,
      color: node.color,
      type: node.type,
      slug: node.slug,
      hasChildren: node.hasChildren,
      expanded: node.expanded,
    })

    if (node.children.length === 0) return

    const childWidths = node.children.map((c) => getSubtreeWidth(c))
    const totalWidth =
      childWidths.reduce((a, b) => a + b, 0) +
      SIBLING_GAP_X * (node.children.length - 1)

    let startX = cx - totalWidth / 2

    node.children.forEach((child, i) => {
      const childCx = startX + childWidths[i] / 2
      edges.push({ from: node.id, to: child.id })
      positionNode(child, childCx, y + LEVEL_GAP_Y)
      startX += childWidths[i] + SIBLING_GAP_X
    })
  }

  // Position all root categories
  const rootWidths = roots.map((r) => getSubtreeWidth(r))
  const totalRootWidth =
    rootWidths.reduce((a, b) => a + b, 0) +
    SIBLING_GAP_X * Math.max(0, roots.length - 1)

  let startX = -totalRootWidth / 2

  roots.forEach((root, i) => {
    const cx = startX + rootWidths[i] / 2
    positionNode(root, cx, 20)
    startX += rootWidths[i] + SIBLING_GAP_X
  })

  return { nodes, edges }
}
