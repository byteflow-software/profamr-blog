import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Pencil, ExternalLink, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeletePostButton } from './DeletePostButton'
import styles from './page.module.css'

interface PostsPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    q?: string
    sort?: string
    order?: string
  }>
}

type SortField = 'title' | 'author' | 'status' | 'views' | 'date'
type SortOrder = 'asc' | 'desc'

function getOrderBy(sort: SortField, order: SortOrder) {
  switch (sort) {
    case 'title': return { title: order }
    case 'author': return { author: { displayName: order } }
    case 'status': return { status: order }
    case 'views': return { viewCount: order }
    case 'date': return { updatedAt: order }
    default: return { updatedAt: 'desc' as const }
  }
}

async function getPosts(status?: string, page: number = 1, search?: string, sort: SortField = 'date', order: SortOrder = 'desc') {
  const take = 20
  const skip = (page - 1) * take

  const where = {
    ...(status && status !== 'all' ? { status: status as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: getOrderBy(sort, order) as any,
      skip,
      take,
      include: {
        author: { select: { displayName: true } },
        categories: {
          include: { category: { select: { name: true } } },
        },
      },
    }),
    prisma.post.count({ where }),
  ])

  return { posts, total, pages: Math.ceil(total / take) }
}

function getPaginationPages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = []

  // Always show first page
  pages.push(1)

  if (current <= 3) {
    // Near start: 1 2 3 4 5 ... last
    for (let i = 2; i <= Math.min(5, total - 1); i++) pages.push(i)
    if (total > 6) pages.push('ellipsis')
  } else if (current >= total - 2) {
    // Near end: 1 ... last-4 last-3 last-2 last-1 last
    pages.push('ellipsis')
    for (let i = Math.max(total - 4, 2); i < total; i++) pages.push(i)
  } else {
    // Middle: 1 ... current-1 current current+1 ... last
    pages.push('ellipsis')
    for (let i = current - 1; i <= current + 1; i++) pages.push(i)
    pages.push('ellipsis')
  }

  // Always show last page
  pages.push(total)

  return pages
}

function SortHeader({ label, field, currentSort, currentOrder, baseHref }: {
  label: string
  field: SortField
  currentSort: SortField
  currentOrder: SortOrder
  baseHref: string
}) {
  const isActive = currentSort === field
  const nextOrder = isActive && currentOrder === 'asc' ? 'desc' : isActive && currentOrder === 'desc' ? 'asc' : 'asc'
  const href = `${baseHref}&sort=${field}&order=${nextOrder}`

  return (
    <th>
      <Link href={href} className={styles.sortHeader}>
        {label}
        <span className={styles.sortIcon}>
          {isActive ? (
            currentOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ChevronsUpDown size={14} />
          )}
        </span>
      </Link>
    </th>
  )
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const search = params.q
  const sort = (params.sort as SortField) || 'date'
  const order = (params.order as SortOrder) || 'desc'

  const { posts, total, pages } = await getPosts(status, page, search, sort, order)

  const baseHref = `/admin/posts?status=${status}${search ? `&q=${search}` : ''}`
  const paginationPages = getPaginationPages(page, pages)

  function pageHref(p: number) {
    return `${baseHref}&page=${p}&sort=${sort}&order=${order}`
  }

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Posts</h1>
          <p className="admin-page-subtitle">{total} posts encontrados</p>
        </div>
        <Link href="/admin/posts/novo" className="admin-btn admin-btn-primary">
          <Plus size={16} />
          Novo Post
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.tabs}>
          <Link
            href="/admin/posts"
            className={`${styles.tab} ${status === 'all' ? styles.tabActive : ''}`}
          >
            Todos
          </Link>
          <Link
            href="/admin/posts?status=PUBLISHED"
            className={`${styles.tab} ${status === 'PUBLISHED' ? styles.tabActive : ''}`}
          >
            Publicados
          </Link>
          <Link
            href="/admin/posts?status=DRAFT"
            className={`${styles.tab} ${status === 'DRAFT' ? styles.tabActive : ''}`}
          >
            Rascunhos
          </Link>
        </div>

        <form className={styles.search}>
          <input
            type="search"
            name="q"
            placeholder="Buscar posts..."
            defaultValue={search}
            className="admin-form-input"
          />
        </form>
      </div>

      {/* Table */}
      <div className="admin-card">
        {posts.length === 0 ? (
          <div className="admin-empty">
            <p className="admin-empty-text">Nenhum post encontrado.</p>
            <Link href="/admin/posts/novo" className="admin-btn admin-btn-primary">
              <Plus size={16} />
              Criar primeiro post
            </Link>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <SortHeader label="Título" field="title" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Autor" field="author" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <th>Categorias</th>
                  <SortHeader label="Status" field="status" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Views" field="views" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <SortHeader label="Data" field="date" currentSort={sort} currentOrder={order} baseHref={baseHref} />
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className={styles.postTitle}
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className={styles.cellMuted}>
                      {post.author.displayName}
                    </td>
                    <td className={styles.cellMuted}>
                      {post.categories.map((c) => c.category.name).join(', ') || '-'}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          post.status === 'PUBLISHED'
                            ? 'admin-badge-success'
                            : post.status === 'DRAFT'
                            ? 'admin-badge-warning'
                            : 'admin-badge-info'
                        }`}
                      >
                        {post.status === 'PUBLISHED'
                          ? 'Publicado'
                          : post.status === 'DRAFT'
                          ? 'Rascunho'
                          : 'Arquivado'}
                      </span>
                    </td>
                    <td className={styles.cellMuted}>
                      {post.viewCount.toLocaleString('pt-BR')}
                    </td>
                    <td className={styles.cellMuted}>
                      {formatDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        {post.status === 'PUBLISHED' && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="admin-btn admin-btn-sm admin-btn-secondary"
                            title="Ver no site"
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="admin-btn admin-btn-sm admin-btn-secondary"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>
                        <DeletePostButton postId={post.id} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            <Link
              href={pageHref(Math.max(1, page - 1))}
              className={`${styles.pageLink} ${styles.pageNav} ${page <= 1 ? styles.pageDisabled : ''}`}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
            >
              <ChevronLeft size={14} />
            </Link>

            {paginationPages.map((p, i) =>
              p === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className={styles.pageEllipsis}>...</span>
              ) : (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`${styles.pageLink} ${p === page ? styles.pageLinkActive : ''}`}
                >
                  {p}
                </Link>
              )
            )}

            <Link
              href={pageHref(Math.min(pages, page + 1))}
              className={`${styles.pageLink} ${styles.pageNav} ${page >= pages ? styles.pageDisabled : ''}`}
              aria-disabled={page >= pages}
              tabIndex={page >= pages ? -1 : undefined}
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
