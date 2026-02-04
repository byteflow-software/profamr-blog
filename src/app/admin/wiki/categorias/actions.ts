'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface WikiCategoryFormData {
  name: string
  slug?: string
  description?: string
  icon?: string
  color?: string
  order?: number
}

export async function createWikiCategory(data: WikiCategoryFormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.wikiCategory.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'Já existe uma categoria com este slug' }
    }

    await prisma.wikiCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        color: data.color,
        order: data.order || 0,
      },
    })

    revalidatePath('/admin/wiki/categorias')
    revalidatePath('/admin/wiki')
    revalidatePath('/wiki')

    return { success: true }
  } catch (error) {
    console.error('Error creating wiki category:', error)
    return { success: false, error: 'Erro ao criar categoria' }
  }
}

export async function updateWikiCategory(id: number, data: WikiCategoryFormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.wikiCategory.findFirst({
      where: { slug, NOT: { id } },
    })
    if (existing) {
      return { success: false, error: 'Já existe uma categoria com este slug' }
    }

    await prisma.wikiCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        color: data.color,
        order: data.order || 0,
      },
    })

    revalidatePath('/admin/wiki/categorias')
    revalidatePath('/admin/wiki')
    revalidatePath('/wiki')

    return { success: true }
  } catch (error) {
    console.error('Error updating wiki category:', error)
    return { success: false, error: 'Erro ao atualizar categoria' }
  }
}

export async function deleteWikiCategory(id: number) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const category = await prisma.wikiCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    })

    if (!category) {
      return { success: false, error: 'Categoria não encontrada' }
    }

    if (category._count.articles > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com artigos associados',
      }
    }

    await prisma.wikiCategory.delete({ where: { id } })

    revalidatePath('/admin/wiki/categorias')

    return { success: true }
  } catch (error) {
    console.error('Error deleting wiki category:', error)
    return { success: false, error: 'Erro ao excluir categoria' }
  }
}
