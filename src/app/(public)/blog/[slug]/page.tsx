import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Calendar, Clock, User, ChevronLeft, Share2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate, stripHtml, estimateReadingTime } from '@/lib/utils'
import { PostCard } from '@/components/blog/PostCard'
import styles from './page.module.css'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { displayName: true, bio: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
      tags: {
        include: { tag: { select: { name: true, slug: true } } },
      },
    },
  })

  return post
}

async function getRelatedPosts(postId: number, categoryIds: number[]) {
  return prisma.post.findMany({
    where: {
      id: { not: postId },
      status: 'PUBLISHED',
      categories: {
        some: {
          categoryId: { in: categoryIds },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    include: {
      author: { select: { displayName: true } },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    },
  })
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Artigo não encontrado' }
  }

  const excerpt = post.excerpt || stripHtml(post.content).slice(0, 160)

  return {
    title: post.title,
    description: excerpt,
    openGraph: {
      title: post.title,
      description: excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.displayName],
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const readingTime = estimateReadingTime(post.content)
  const categoryIds = post.categories.map((c) => c.categoryId)
  const relatedPosts = await getRelatedPosts(post.id, categoryIds)

  // Incrementa visualização
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  })

  return (
    <article className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <Link href="/blog" className={styles.backLink}>
            <ChevronLeft className={styles.backIcon} />
            Voltar ao Blog
          </Link>

          <div className={styles.categories}>
            {post.categories.map(({ category }) => (
              <Link
                key={category.slug}
                href={`/blog?categoria=${category.slug}`}
                className={styles.category}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            <div className={styles.metaItem}>
              <User className={styles.metaIcon} />
              <span>{post.author.displayName}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock className={styles.metaIcon} />
              <span>{readingTime} min de leitura</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className={styles.featuredImage}>
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className={styles.image}
            priority
          />
        </div>
      )}

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.container}>
          <div className={styles.content}>
            <div
              className={`prose ${styles.prose}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                <span className={styles.tagsLabel}>Tags:</span>
                <div className={styles.tagsList}>
                  {post.tags.map(({ tag }) => (
                    <Link
                      key={tag.slug}
                      href={`/blog?tag=${tag.slug}`}
                      className={styles.tag}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className={styles.share}>
              <span className={styles.shareLabel}>Compartilhar:</span>
              <div className={styles.shareButtons}>
                <button className={styles.shareButton} aria-label="Compartilhar">
                  <Share2 />
                </button>
              </div>
            </div>

            {/* Author */}
            <div className={styles.author}>
              <div className={styles.authorAvatar}>
                <User className={styles.authorAvatarIcon} />
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.authorLabel}>Escrito por</span>
                <h3 className={styles.authorName}>{post.author.displayName}</h3>
                {post.author.bio && (
                  <p className={styles.authorBio}>{post.author.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className={styles.related}>
          <div className={styles.container}>
            <h2 className={styles.relatedTitle}>Artigos Relacionados</h2>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
