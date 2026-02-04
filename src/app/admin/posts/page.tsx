import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Pencil, Trash2, Eye, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { DeletePostButton } from './DeletePostButton'
import styles from './page.module.css'

interface PostsPageProps {
  searchParams: Promise<{
    status?: string
    page?: string
    q?: string
  }>
}

async function getPosts(status?: string, page: number = 1, search?: string) {
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
      orderBy: { updatedAt: 'desc' },
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

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const status = params.status || 'all'
  const page = parseInt(params.page || '1')
  const search = params.q

  const { posts, total, pages } = await getPosts(status, page, search)

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
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Autor</th>
                <th>Categorias</th>
                <th>Status</th>
                <th>Views</th>
                <th>Data</th>
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
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/posts?status=${status}&page=${p}${search ? `&q=${search}` : ''}`}
                className={`${styles.pageLink} ${p === page ? styles.pageLinkActive : ''}`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
