import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PostCard } from '@/components/blog/PostCard'
import styles from './page.module.css'

async function getFeaturedPost() {
  return prisma.post.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    include: {
      author: { select: { displayName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  })
}

async function getPopularPosts() {
  return prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { viewCount: 'desc' },
    take: 6,
    include: {
      author: { select: { displayName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  })
}

async function getLatestWikiArticles() {
  return prisma.wikiArticle.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    include: {
      category: { select: { name: true, slug: true, icon: true } },
    },
  })
}

export default async function HomePage() {
  const [featuredPost, popularPosts, wikiArticles] = await Promise.all([
    getFeaturedPost(),
    getPopularPosts(),
    getLatestWikiArticles(),
  ])

  return (
    <div className={styles.page}>
      {/* Featured Post */}
      {featuredPost && (
        <section className={styles.section}>
          <div className={styles.container}>
            <PostCard post={featuredPost} variant="featured" />
          </div>
        </section>
      )}

      {/* Popular Posts */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Populares</h2>
            <Link href="/blog" className={styles.viewAll}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className={styles.postsGrid}>
            {popularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Wiki */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Wiki Jurídica</h2>
            <Link href="/wiki" className={styles.viewAll}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <p className={styles.sectionDesc}>
            Enciclopédia de termos, conceitos e doutrinas jurídicas.
          </p>
          <div className={styles.wikiList}>
            {wikiArticles.map((article) => (
              <Link
                key={article.id}
                href={`/wiki/${article.slug}`}
                className={styles.wikiItem}
              >
                <span className={styles.wikiTitle}>{article.title}</span>
                {article.category && (
                  <span className={styles.wikiCategory}>{article.category.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
