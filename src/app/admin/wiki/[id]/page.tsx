import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { WikiForm } from '../WikiForm'

interface EditWikiPageProps {
  params: Promise<{ id: string }>
}

async function getArticle(id: number) {
  return prisma.wikiArticle.findUnique({ where: { id } })
}

async function getCategories() {
  return prisma.wikiCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })
}

async function getArticles() {
  return prisma.wikiArticle.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true },
  })
}

export default async function EditWikiPage({ params }: EditWikiPageProps) {
  const { id } = await params
  const articleId = parseInt(id)

  if (isNaN(articleId)) {
    notFound()
  }

  const [article, categories, articles] = await Promise.all([
    getArticle(articleId),
    getCategories(),
    getArticles(),
  ])

  if (!article) {
    notFound()
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Editar Artigo Wiki</h1>
          <p className="admin-page-subtitle">{article.title}</p>
        </div>
      </div>

      <WikiForm
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          content: article.content,
          summary: article.summary,
          status: article.status === 'ARCHIVED' ? 'DRAFT' : article.status,
          categoryId: article.categoryId,
          parentId: article.parentId,
          order: article.order,
        }}
        categories={categories}
        articles={articles}
      />
    </div>
  )
}
