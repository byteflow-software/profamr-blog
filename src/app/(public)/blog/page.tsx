import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/blog/PostCard'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos jurídicos, análises de casos e atualizações do mundo do Direito.',
}

interface BlogPageProps {
  searchParams: Promise<{ page?: string; categoria?: string }>
}

const POSTS_PER_PAGE = 12

async function getPosts(page: number, categorySlug?: string) {
  const where = {
    status: 'PUBLISHED' as const,
    ...(categorySlug && {
      categories: {
        some: {
          category: { slug: categorySlug },
        },
      },
    }),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      include: {
        author: { select: { displayName: true } },
        categories: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
    }),
    prisma.post.count({ where }),
  ])

  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) }
}

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  })
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const categorySlug = params.categoria

  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPosts(page, categorySlug),
    getCategories(),
  ])

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>
            {activeCategory ? activeCategory.name : 'Blog'}
          </h1>
          <p className={styles.description}>
            {activeCategory
              ? `${total} artigos em ${activeCategory.name}`
              : `${total} artigos sobre Direito e temas jurídicos`}
          </p>
        </header>

        <div className={styles.content}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sidebarTitle}>Categorias</h3>
              <ul className={styles.categoryList}>
                <li>
                  <Link
                    href="/blog"
                    className={`${styles.categoryLink} ${!categorySlug ? styles.categoryLinkActive : ''}`}
                  >
                    Todas as categorias
                  </Link>
                </li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/blog?categoria=${category.slug}`}
                      className={`${styles.categoryLink} ${categorySlug === category.slug ? styles.categoryLinkActive : ''}`}
                    >
                      {category.name}
                      <span className={styles.categoryCount}>
                        {category._count.posts}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Posts Grid */}
          <main className={styles.main}>
            {posts.length === 0 ? (
              <div className={styles.empty}>
                <p>Nenhum artigo encontrado.</p>
              </div>
            ) : (
              <>
                <div className={styles.postsGrid}>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className={styles.pagination}>
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${categorySlug ? `&categoria=${categorySlug}` : ''}`}
                        className={styles.paginationLink}
                      >
                        Anterior
                      </Link>
                    )}
                    <div className={styles.paginationNumbers}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (num) => (
                          <Link
                            key={num}
                            href={`/blog?page=${num}${categorySlug ? `&categoria=${categorySlug}` : ''}`}
                            className={`${styles.paginationNumber} ${num === page ? styles.paginationNumberActive : ''}`}
                          >
                            {num}
                          </Link>
                        )
                      )}
                    </div>
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${categorySlug ? `&categoria=${categorySlug}` : ''}`}
                        className={styles.paginationLink}
                      >
                        Próximo
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
