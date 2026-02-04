import { prisma } from '@/lib/prisma'
import { WikiForm } from '../WikiForm'

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

export default async function NewWikiPage() {
  const [categories, articles] = await Promise.all([
    getCategories(),
    getArticles(),
  ])

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Novo Artigo Wiki</h1>
          <p className="admin-page-subtitle">Criar um novo artigo para a wiki</p>
        </div>
      </div>

      <WikiForm categories={categories} articles={articles} />
    </div>
  )
}
