import { Metadata } from 'next'
import Link from 'next/link'
import { Search, FileText, BookOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate, truncate, stripHtml } from '@/lib/utils'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Busca',
  description: 'Buscar artigos e termos no blog e wiki jurídica.',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

async function searchContent(query: string) {
  if (!query || query.length < 2) {
    return { posts: [], wikiArticles: [] }
  }

  const searchTerm = `%${query}%`

  const [posts, wikiArticles] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: {
        categories: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
    }),
    prisma.wikiArticle.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { title: 'asc' },
      take: 20,
      include: {
        category: { select: { name: true, slug: true } },
      },
    }),
  ])

  return { posts, wikiArticles }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const { posts, wikiArticles } = await searchContent(query)
  const totalResults = posts.length + wikiArticles.length

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Search Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Busca</h1>

          <form action="/busca" method="GET" className={styles.searchForm}>
            <Search className={styles.searchIcon} />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar artigos, termos jurídicos..."
              className={styles.searchInput}
              autoFocus
            />
            <button type="submit" className={styles.searchButton}>
              Buscar
            </button>
          </form>

          {query && (
            <p className={styles.results}>
              {totalResults} resultado{totalResults !== 1 ? 's' : ''} para &quot;{query}&quot;
            </p>
          )}
        </header>

        {/* Results */}
        {query && totalResults === 0 && (
          <div className={styles.empty}>
            <Search className={styles.emptyIcon} />
            <h2>Nenhum resultado encontrado</h2>
            <p>
              Tente buscar por outros termos ou navegue pelas categorias do{' '}
              <Link href="/blog">blog</Link> ou <Link href="/wiki">wiki</Link>.
            </p>
          </div>
        )}

        {posts.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FileText className={styles.sectionIcon} />
              Artigos do Blog ({posts.length})
            </h2>
            <div className={styles.resultsList}>
              {posts.map((post) => (
                <article key={post.id} className={styles.resultItem}>
                  <Link href={`/blog/${post.slug}`} className={styles.resultLink}>
                    <h3 className={styles.resultTitle}>{post.title}</h3>
                    <p className={styles.resultExcerpt}>
                      {truncate(post.excerpt || stripHtml(post.content), 200)}
                    </p>
                    <div className={styles.resultMeta}>
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.categories[0] && (
                        <span className={styles.resultCategory}>
                          {post.categories[0].category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {wikiArticles.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <BookOpen className={styles.sectionIcon} />
              Wiki Jurídica ({wikiArticles.length})
            </h2>
            <div className={styles.resultsList}>
              {wikiArticles.map((article) => (
                <article key={article.id} className={styles.resultItem}>
                  <Link href={`/wiki/${article.slug}`} className={styles.resultLink}>
                    <h3 className={styles.resultTitle}>{article.title}</h3>
                    {article.summary && (
                      <p className={styles.resultExcerpt}>
                        {truncate(article.summary, 200)}
                      </p>
                    )}
                    <div className={styles.resultMeta}>
                      {article.category && (
                        <span className={styles.resultCategory}>
                          {article.category.name}
                        </span>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
