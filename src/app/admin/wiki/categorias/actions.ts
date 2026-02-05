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
  parentId?: number | null
}

function revalidateWikiPaths() {
  revalidatePath('/admin/wiki/categorias')
  revalidatePath('/admin/wiki')
  revalidatePath('/wiki')
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
        parentId: data.parentId ?? null,
      },
    })

    revalidateWikiPaths()

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
        parentId: data.parentId ?? null,
      },
    })

    revalidateWikiPaths()

    return { success: true }
  } catch (error) {
    console.error('Error updating wiki category:', error)
    return { success: false, error: 'Erro ao atualizar categoria' }
  }
}

interface WikiCategoryHierarchyUpdate {
  id: number
  parentId: number | null
}

export async function updateWikiCategoryHierarchy(updates: WikiCategoryHierarchyUpdate[]) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const allCategories = await prisma.wikiCategory.findMany({
      select: { id: true, parentId: true },
    })

    // Build proposed parent map
    const proposedParents = new Map<number, number | null>()
    for (const cat of allCategories) {
      proposedParents.set(cat.id, cat.parentId)
    }
    for (const update of updates) {
      proposedParents.set(update.id, update.parentId)
    }

    // Check for cycles
    const hasCircularReference = (categoryId: number, visited: Set<number> = new Set()): boolean => {
      if (visited.has(categoryId)) return true
      visited.add(categoryId)
      const parentId = proposedParents.get(categoryId)
      if (parentId === null || parentId === undefined) return false
      return hasCircularReference(parentId, visited)
    }

    for (const update of updates) {
      if (update.parentId !== null) {
        if (!proposedParents.has(update.parentId)) {
          return { success: false, error: `Categoria pai ${update.parentId} não existe` }
        }
        if (update.id === update.parentId) {
          return { success: false, error: 'Uma categoria não pode ser pai de si mesma' }
        }
        if (hasCircularReference(update.id)) {
          return { success: false, error: 'Referência circular detectada' }
        }
      }
    }

    await prisma.$transaction(
      updates.map((update) =>
        prisma.wikiCategory.update({
          where: { id: update.id },
          data: { parentId: update.parentId },
        })
      )
    )

    revalidateWikiPaths()

    return { success: true }
  } catch (error) {
    console.error('Error updating wiki category hierarchy:', error)
    return { success: false, error: 'Erro ao atualizar hierarquia' }
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

    revalidateWikiPaths()

    return { success: true }
  } catch (error) {
    console.error('Error deleting wiki category:', error)
    return { success: false, error: 'Erro ao excluir categoria' }
  }
}
