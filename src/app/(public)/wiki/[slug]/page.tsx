import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWikiTreeData } from '@/lib/wiki'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import { formatDate, stripHtml, estimateReadingTime } from '@/lib/utils'
import styles from './page.module.css'

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  return prisma.wikiArticle.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { displayName: true } },
      category: { select: { name: true, slug: true } },
      parent: { select: { title: true, slug: true } },
      children: {
        where: { status: 'PUBLISHED' },
        orderBy: { order: 'asc' },
        select: { id: true, title: true, slug: true },
      },
    },
  })
}

async function getTableOfContents(content: string) {
  const headingRegex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi
  const toc: { level: number; text: string; id: string }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const text = stripHtml(match[2])
    const id = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')

    toc.push({ level, text, id })
  }

  return toc
}

export async function generateMetadata({
  params,
}: WikiArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)

  if (!article) {
    return { title: 'Artigo não encontrado' }
  }

  const description = article.summary || stripHtml(article.content).slice(0, 160)

  return {
    title: `${article.title} - Wiki`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
    },
  }
}

export default async function WikiArticlePage({ params }: WikiArticlePageProps) {
  const { slug } = await params
  const [article, treeData] = await Promise.all([
    getArticle(slug),
    getWikiTreeData(),
  ])

  if (!article) {
    notFound()
  }

  const readingTime = estimateReadingTime(article.content)
  const tableOfContents = await getTableOfContents(article.content)

  await prisma.wikiArticle.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  })

  let processedContent = article.content
  tableOfContents.forEach(({ text, id }) => {
    const regex = new RegExp(`(<h[2-3][^>]*>)(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(</h[2-3]>)`, 'i')
    processedContent = processedContent.replace(regex, `$1<span id="${id}">$2</span>$3`)
  })

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/wiki">Wiki</Link>
          {article.category && (
            <>
              <ChevronRight size={12} className={styles.breadcrumbSep} />
              <Link href={`/wiki/categoria/${article.category.slug}`}>
                {article.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>{article.title}</span>
        </nav>

        <div className={styles.layout}>
          {/* Tree sidebar */}
          <aside className={styles.sidebar}>
            <WikiSidebar categories={treeData} currentSlug={slug} />

            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className={styles.tocSection}>
                <h3 className={styles.tocTitle}>Neste artigo</h3>
                <nav className={styles.toc}>
                  {tableOfContents.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.id}`}
                      className={`${styles.tocLink} ${item.level === 3 ? styles.tocIndent : ''}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </aside>

          {/* Article content */}
          <article className={styles.article}>
            <header className={styles.header}>
              {article.category && (
                <span className={styles.label}>{article.category.name}</span>
              )}
              <h1 className={styles.title}>{article.title}</h1>
              {article.summary && (
                <p className={styles.summary}>{article.summary}</p>
              )}
              <div className={styles.meta}>
                <span>{readingTime} min de leitura</span>
                <span className={styles.dot}>&middot;</span>
                <span>Atualizado em {formatDate(article.updatedAt)}</span>
              </div>
            </header>

            <div
              className={`prose ${styles.content}`}
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {article.children.length > 0 && (
              <div className={styles.children}>
                <h2 className={styles.childrenTitle}>Sub-artigos</h2>
                <ul className={styles.childrenList}>
                  {article.children.map((child) => (
                    <li key={child.id}>
                      <Link href={`/wiki/${child.slug}`}>{child.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.backSection}>
              <Link href="/wiki" className={styles.backLink}>
                <ChevronLeft size={16} />
                Voltar para Wiki
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
