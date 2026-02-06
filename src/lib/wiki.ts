import { prisma } from '@/lib/prisma'

interface WikiArticleFlat {
  id: number
  title: string
  slug: string
  parentId: number | null
  categoryId: number | null
  order: number
}

export interface WikiArticleTree {
  id: number
  title: string
  slug: string
  children: WikiArticleTree[]
}

export interface WikiCategoryTree {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  children: WikiCategoryTree[]
  articles: WikiArticleTree[]
}

function buildArticleTree(
  articles: WikiArticleFlat[],
  parentId: number | null
): WikiArticleTree[] {
  return articles
    .filter((a) => a.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((a) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      children: buildArticleTree(articles, a.id),
    }))
}

interface WikiCategoryFlat {
  id: number
  name: string
  slug: string
  icon: string | null
  color: string | null
  parentId: number | null
  order: number
}

function buildCategoryTree(
  categories: WikiCategoryFlat[],
  articles: WikiArticleFlat[],
  parentId: number | null
): WikiCategoryTree[] {
  return categories
    .filter((c) => c.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((cat) => {
      const categoryArticles = articles.filter((a) => a.categoryId === cat.id)
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        color: cat.color,
        children: buildCategoryTree(categories, articles, cat.id),
        articles: buildArticleTree(categoryArticles, null),
      }
    })
}

export async function getWikiTreeData(): Promise<WikiCategoryTree[]> {
  const [categories, articles] = await Promise.all([
    prisma.wikiCategory.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        parentId: true,
        order: true,
      },
    }),
    prisma.wikiArticle.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        parentId: true,
        categoryId: true,
        order: true,
      },
    }),
  ])

  return buildCategoryTree(categories, articles, null)
}
