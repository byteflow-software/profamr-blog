import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  FileText,
  BookOpen,
  Eye,
  Users,
  Plus,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import styles from './page.module.css'

async function getStats() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalWikiArticles,
    publishedWikiArticles,
    totalCategories,
    totalTags,
    totalUsers,
    totalViews,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: 'PUBLISHED' } }),
    prisma.post.count({ where: { status: 'DRAFT' } }),
    prisma.wikiArticle.count(),
    prisma.wikiArticle.count({ where: { status: 'PUBLISHED' } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalWikiArticles,
    publishedWikiArticles,
    totalCategories,
    totalTags,
    totalUsers,
    totalViews: totalViews._sum.viewCount || 0,
  }
}

async function getRecentPosts() {
  return prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      author: { select: { displayName: true } },
    },
  })
}

async function getRecentWikiArticles() {
  return prisma.wikiArticle.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      author: { select: { displayName: true } },
    },
  })
}

export default async function AdminDashboard() {
  const [stats, recentPosts, recentWikiArticles] = await Promise.all([
    getStats(),
    getRecentPosts(),
    getRecentWikiArticles(),
  ])

  return (
    <div className={styles.page}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">
            Visão geral do seu blog
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Total de Posts</div>
          <div className="admin-stat-value">{stats.totalPosts}</div>
          <div className="admin-stat-change">
            {stats.publishedPosts} publicados, {stats.draftPosts} rascunhos
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Artigos Wiki</div>
          <div className="admin-stat-value">{stats.totalWikiArticles}</div>
          <div className="admin-stat-change">
            {stats.publishedWikiArticles} publicados
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Visualizações</div>
          <div className="admin-stat-value">
            {stats.totalViews.toLocaleString('pt-BR')}
          </div>
          <div className="admin-stat-change positive">
            <TrendingUp size={12} /> Total acumulado
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Usuários</div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
          <div className="admin-stat-change">
            {stats.totalCategories} categorias, {stats.totalTags} tags
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link href="/admin/posts/novo" className="admin-btn admin-btn-primary">
          <Plus size={16} />
          Novo Post
        </Link>
        <Link href="/admin/wiki/novo" className="admin-btn admin-btn-secondary">
          <Plus size={16} />
          Novo Artigo Wiki
        </Link>
      </div>

      {/* Recent Content */}
      <div className={styles.recentGrid}>
        {/* Recent Posts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <FileText size={16} />
              Posts Recentes
            </h2>
            <Link href="/admin/posts" className={styles.viewAll}>
              Ver todos
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <p className={styles.emptyText}>Nenhum post ainda.</p>
          ) : (
            <div className={styles.recentList}>
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}`}
                  className={styles.recentItem}
                >
                  <div className={styles.recentItemContent}>
                    <span className={styles.recentItemTitle}>{post.title}</span>
                    <span className={styles.recentItemMeta}>
                      <Clock size={12} />
                      {formatRelativeDate(post.updatedAt)}
                    </span>
                  </div>
                  <span
                    className={`admin-badge ${
                      post.status === 'PUBLISHED'
                        ? 'admin-badge-success'
                        : 'admin-badge-warning'
                    }`}
                  >
                    {post.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wiki Articles */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <BookOpen size={16} />
              Wiki Recente
            </h2>
            <Link href="/admin/wiki" className={styles.viewAll}>
              Ver todos
            </Link>
          </div>

          {recentWikiArticles.length === 0 ? (
            <p className={styles.emptyText}>Nenhum artigo wiki ainda.</p>
          ) : (
            <div className={styles.recentList}>
              {recentWikiArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/wiki/${article.id}`}
                  className={styles.recentItem}
                >
                  <div className={styles.recentItemContent}>
                    <span className={styles.recentItemTitle}>{article.title}</span>
                    <span className={styles.recentItemMeta}>
                      <Clock size={12} />
                      {formatRelativeDate(article.updatedAt)}
                    </span>
                  </div>
                  <span
                    className={`admin-badge ${
                      article.status === 'PUBLISHED'
                        ? 'admin-badge-success'
                        : 'admin-badge-warning'
                    }`}
                  >
                    {article.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
