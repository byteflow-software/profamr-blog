import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWikiTreeData } from '@/lib/wiki'
import { WikiSidebar } from '@/components/wiki/WikiSidebar'
import styles from './page.module.css'

interface WikiCategoryPageProps {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  return prisma.wikiCategory.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: 'PUBLISHED' },
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
        },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: WikiCategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Categoria não encontrada' }
  }

  return {
    title: `${category.name} - Wiki`,
    description: category.description || `Artigos sobre ${category.name} na Wiki Jurídica`,
  }
}

export default async function WikiCategoryPage({ params }: WikiCategoryPageProps) {
  const { slug } = await params
  const [category, treeData] = await Promise.all([
    getCategory(slug),
    getWikiTreeData(),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/wiki" className={styles.backLink}>
          <ChevronLeft size={16} />
          Wiki
        </Link>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <WikiSidebar categories={treeData} />
          </aside>

          <main className={styles.main}>
            <header className={styles.header}>
              <h1 className={styles.title}>{category.name}</h1>
              {category.description && (
                <p className={styles.description}>{category.description}</p>
              )}
              <span className={styles.count}>
                {category.articles.length} artigo{category.articles.length !== 1 ? 's' : ''}
              </span>
            </header>

            {category.articles.length === 0 ? (
              <p className={styles.empty}>Nenhum artigo nesta categoria.</p>
            ) : (
              <div className={styles.articlesList}>
                {category.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/wiki/${article.slug}`}
                    className={styles.articleItem}
                  >
                    <h2 className={styles.articleTitle}>{article.title}</h2>
                    {article.summary && (
                      <p className={styles.articleSummary}>
                        {article.summary.slice(0, 150)}...
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
