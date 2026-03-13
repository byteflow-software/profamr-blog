import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { formatDate, truncate, stripHtml, estimateReadingTime } from '@/lib/utils'
import styles from './PostCard.module.css'

const MAX_VISIBLE_TAGS = 5

interface PostCardProps {
  post: {
    id: number
    title: string
    slug: string
    excerpt: string | null
    content?: string
    featuredImage: string | null
    publishedAt: Date | null
    author: {
      displayName: string
    }
    categories: {
      category: {
        name: string
        slug: string
      }
    }[]
    tags?: {
      tag: {
        name: string
        slug: string
      }
    }[]
  }
  variant?: 'default' | 'featured' | 'compact'
  activeTagSlug?: string
}

export function PostCard({ post, variant = 'default', activeTagSlug }: PostCardProps) {
  const excerpt = post.excerpt || (post.content ? stripHtml(post.content) : '')
  const readingTime = post.content ? estimateReadingTime(post.content) : Math.ceil((excerpt.split(/\s+/).length * 5) / 200)
  const category = post.categories[0]?.category
  const tags = post.tags || []
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = tags.length - MAX_VISIBLE_TAGS

  if (variant === 'featured') {
    return (
      <article className={styles.featured}>
        {post.featuredImage && (
          <div className={styles.featuredImage}>
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className={styles.image}
            />
          </div>
        )}
        <div className={styles.featuredContent}>
          {category && (
            <span className={styles.label}>{category.name}</span>
          )}
          <h2 className={styles.featuredTitle}>
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className={styles.featuredExcerpt}>{truncate(excerpt, 200)}</p>
          <div className={styles.meta}>
            <span>{formatDate(post.publishedAt)}</span>
            <span className={styles.dot}>&middot;</span>
            <span>{readingTime} min de leitura</span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'compact') {
    return (
      <article className={styles.compact}>
        <Link href={`/blog/${post.slug}`} className={styles.compactLink}>
          <h3 className={styles.compactTitle}>{post.title}</h3>
          <span className={styles.compactMeta}>{formatDate(post.publishedAt)}</span>
        </Link>
      </article>
    )
  }

  return (
    <article className={styles.card}>
      <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
        {category && (
          <span className={styles.label}>{category.name}</span>
        )}
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.cardExcerpt}>{truncate(excerpt, 120)}</p>
      </Link>
      {visibleTags.length > 0 && (
        <div className={styles.tagList}>
          {visibleTags.map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/blog?tag=${tag.slug}`}
              className={`${styles.tagBadge} ${activeTagSlug === tag.slug ? styles.tagBadgeActive : ''}`}
            >
              {tag.name}
            </Link>
          ))}
          {hiddenCount > 0 && (
            <span className={styles.tagMore}>+{hiddenCount} mais</span>
          )}
        </div>
      )}
      <Link href={`/blog/${post.slug}`} className={styles.cardFooterLink}>
        <div className={styles.cardFooter}>
          <span className={styles.meta}>
            {formatDate(post.publishedAt)}
            <span className={styles.dot}>&middot;</span>
            {readingTime} min
          </span>
          <ArrowRight size={14} className={styles.arrow} />
        </div>
      </Link>
    </article>
  )
}
