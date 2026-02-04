import { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWikiTreeData } from '@/lib/wiki'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Wiki Jurídica',
  description: 'Enciclopédia completa de termos, conceitos e doutrinas jurídicas.',
}

async function getRecentArticles() {
  return prisma.wikiArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      category: { select: { name: true, slug: true } },
    },
  })
}

export default async function WikiPage() {
  const [categories, recentArticles] = await Promise.all([
    getWikiTreeData(),
    getRecentArticles(),
  ])

  const totalArticles = categories.reduce(
    (sum, cat) => sum + cat.articles.length,
    0
  )

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Wiki Jurídica</h1>
          <p className={styles.description}>
            {totalArticles} artigos sobre termos, conceitos e doutrinas jurídicas.
          </p>
          <form action="/wiki/busca" method="GET" className={styles.searchForm}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="search"
              name="q"
              placeholder="Buscar na wiki..."
              className={styles.searchInput}
            />
          </form>
        </header>

        {/* Layout with tree + content */}
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <WikiSidebar categories={categories} />
          </aside>

          <main className={styles.main}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Artigos Recentes</h2>
            </div>
            <div className={styles.articlesList}>
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/wiki/${article.slug}`}
                  className={styles.articleItem}
                >
                  <div className={styles.articleContent}>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    {article.summary && (
                      <p className={styles.articleSummary}>
                        {article.summary.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                  {article.category && (
                    <span className={styles.articleCategory}>
                      {article.category.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
