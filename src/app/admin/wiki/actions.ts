'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface WikiFormData {
  title: string
  slug?: string
  content: string
  summary?: string
  status: 'DRAFT' | 'PUBLISHED'
  categoryId?: number | null
  parentId?: number | null
  order?: number
}

export async function createWikiArticle(data: WikiFormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.title)

    const existing = await prisma.wikiArticle.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'Já existe um artigo com este slug' }
    }

    const article = await prisma.wikiArticle.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary,
        status: data.status,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        authorId: user.id,
        categoryId: data.categoryId,
        parentId: data.parentId,
        order: data.order || 0,
      },
    })

    revalidatePath('/admin/wiki')
    revalidatePath('/wiki')

    return { success: true, articleId: article.id }
  } catch (error) {
    console.error('Error creating wiki article:', error)
    return { success: false, error: 'Erro ao criar artigo' }
  }
}

export async function updateWikiArticle(id: number, data: WikiFormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const article = await prisma.wikiArticle.findUnique({ where: { id } })
    if (!article) {
      return { success: false, error: 'Artigo não encontrado' }
    }

    const slug = data.slug || slugify(data.title)

    const existing = await prisma.wikiArticle.findFirst({
      where: { slug, NOT: { id } },
    })
    if (existing) {
      return { success: false, error: 'Já existe um artigo com este slug' }
    }

    let publishedAt = article.publishedAt
    if (data.status === 'PUBLISHED' && !article.publishedAt) {
      publishedAt = new Date()
    } else if (data.status !== 'PUBLISHED') {
      publishedAt = null
    }

    await prisma.wikiArticle.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        content: data.content,
        summary: data.summary,
        status: data.status,
        publishedAt,
        categoryId: data.categoryId,
        parentId: data.parentId,
        order: data.order || 0,
      },
    })

    revalidatePath('/admin/wiki')
    revalidatePath(`/admin/wiki/${id}`)
    revalidatePath('/wiki')
    revalidatePath(`/wiki/${slug}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating wiki article:', error)
    return { success: false, error: 'Erro ao atualizar artigo' }
  }
}

export async function deleteWikiArticle(id: number) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.wikiArticle.delete({ where: { id } })

    revalidatePath('/admin/wiki')
    revalidatePath('/wiki')

    return { success: true }
  } catch (error) {
    console.error('Error deleting wiki article:', error)
    return { success: false, error: 'Erro ao excluir artigo' }
  }
}
