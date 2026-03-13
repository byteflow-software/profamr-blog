import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getCachedCategories } from '@/lib/cache'
import { PostCard } from '@/components/blog/PostCard'
import { BlogFilterBar } from '@/components/blog/BlogFilterBar'
import { JsonLd } from '@/components/blog/JsonLd'
import styles from './page.module.css'

interface BlogPageProps {
  searchParams: Promise<{
    page?: string
    categoria?: string
    tag?: string
    q?: string
    ordem?: string
  }>
}

const POSTS_PER_PAGE = 12

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const hasFilters = !!(params.tag || params.categoria || params.q)

  return {
    title: 'Blog',
    description: 'Artigos jurídicos, análises de casos e atualizações do mundo do Direito.',
    alternates: {
      canonical: 'https://profamr.app/blog',
    },
    ...(page > 1 || hasFilters ? {
      robots: { index: false, follow: true },
    } : {}),
    openGraph: {
      title: 'Blog | Prof. AMR',
      description: 'Artigos jurídicos, análises de casos e atualizações do mundo do Direito.',
      url: 'https://profamr.app/blog',
      locale: 'pt_BR',
      siteName: 'Prof. AMR',
      images: [{ url: '/images/prof_amr_logo.png', alt: 'Prof. AMR - Blog' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Prof. AMR',
      description: 'Artigos jurídicos, análises de casos e atualizações do mundo do Direito.',
      images: ['/images/prof_amr_logo.png'],
    },
  }
}

async function getPosts(
  page: number,
  categorySlug?: string,
  tagSlug?: string,
  searchQuery?: string,
  sortOrder?: string
) {
  const where = {
    status: 'PUBLISHED' as const,
    ...(categorySlug && {
      categories: {
        some: {
          category: { slug: categorySlug },
        },
      },
    }),
    ...(tagSlug && {
      tags: {
        some: {
          tag: { slug: tagSlug },
        },
      },
    }),
    ...(searchQuery && {
      title: { contains: searchQuery, mode: 'insensitive' as const },
    }),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: sortOrder === 'antiga' ? 'asc' : 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        viewCount: true,
        author: { select: { displayName: true } },
        categories: {
          include: { category: { select: { name: true, slug: true } } },
        },
        tags: {
          include: { tag: { select: { name: true, slug: true } } },
        },
      },
    }),
    prisma.post.count({ where }),
  ])

  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const categorySlug = params.categoria
  const tagSlug = params.tag
  const searchQuery = params.q
  const sortOrder = params.ordem

  const [{ posts, total, totalPages }, categories] = await Promise.all([
    getPosts(page, categorySlug, tagSlug, searchQuery, sortOrder),
    getCachedCategories(),
  ])

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : null

  const activeTag = tagSlug
    ? await prisma.tag.findUnique({
        where: { slug: tagSlug },
        select: { name: true, slug: true },
      })
    : null

  // Build query string for pagination links
  function paginationHref(pageNum: number) {
    const params = new URLSearchParams()
    params.set('page', String(pageNum))
    if (categorySlug) params.set('categoria', categorySlug)
    if (tagSlug) params.set('tag', tagSlug)
    if (searchQuery) params.set('q', searchQuery)
    if (sortOrder) params.set('ordem', sortOrder)
    return `/blog?${params.toString()}`
  }

  // Description text
  let description = `${total} artigos sobre Direito e temas jurídicos`
  if (activeTag && activeCategory) {
    description = `${total} artigos com a tag '${activeTag.name}' em ${activeCategory.name}`
  } else if (activeTag) {
    description = `${total} artigos com a tag '${activeTag.name}'`
  } else if (activeCategory) {
    description = `${total} artigos em ${activeCategory.name}`
  } else if (searchQuery) {
    description = `${total} artigos encontrados para "${searchQuery}"`
  }

  const hasFilters = activeTag || activeCategory || searchQuery

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://profamr.app' },
      { '@type': 'ListItem', position: 2, name: 'Blog' },
    ],
  }

  return (
    <div className={styles.page}>
      <JsonLd data={breadcrumbSchema} />
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.description}>{description}</p>
        </header>

        {/* Filter Bar */}
        <BlogFilterBar
          activeTag={activeTag}
          activeCategory={activeCategory ? { name: activeCategory.name, slug: activeCategory.slug } : null}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
        />

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
                {hasFilters ? (
                  <>
                    <p>Nenhum artigo encontrado com os filtros aplicados.</p>
                    <Link href="/blog" className={styles.clearFiltersLink}>
                      Limpar todos os filtros
                    </Link>
                  </>
                ) : (
                  <p>Nenhum artigo encontrado.</p>
                )}
              </div>
            ) : (
              <>
                <div className={styles.postsGrid}>
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      activeTagSlug={tagSlug}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className={styles.pagination}>
                    {page > 1 && (
                      <Link
                        href={paginationHref(page - 1)}
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
                            href={paginationHref(num)}
                            className={`${styles.paginationNumber} ${num === page ? styles.paginationNumberActive : ''}`}
                          >
                            {num}
                          </Link>
                        )
                      )}
                    </div>
                    {page < totalPages && (
                      <Link
                        href={paginationHref(page + 1)}
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
