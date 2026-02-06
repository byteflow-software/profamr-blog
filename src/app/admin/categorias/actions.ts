'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: number | null
}

export async function createCategory(data: CategoryFormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'Já existe uma categoria com este slug' }
    }

    await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath('/admin/posts')

    return { success: true }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Erro ao criar categoria' }
  }
}

export async function updateCategory(id: number, data: CategoryFormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = data.slug || slugify(data.name)

    const existing = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    })
    if (existing) {
      return { success: false, error: 'Já existe uma categoria com este slug' }
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath('/admin/posts')

    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Erro ao atualizar categoria' }
  }
}

interface CategoryHierarchyUpdate {
  id: number
  parentId: number | null
}

export async function updateCategoryHierarchy(updates: CategoryHierarchyUpdate[]) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Validate no cycles: a category cannot be a child of itself or its descendants
    const allCategories = await prisma.category.findMany({
      select: { id: true, parentId: true },
    })

    // Build a map with the proposed changes
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
        // Check if parent exists
        if (!proposedParents.has(update.parentId)) {
          return { success: false, error: `Categoria pai ${update.parentId} não existe` }
        }
        // Check for self-reference
        if (update.id === update.parentId) {
          return { success: false, error: 'Uma categoria não pode ser pai de si mesma' }
        }
        // Check for circular reference
        if (hasCircularReference(update.id)) {
          return { success: false, error: 'Referência circular detectada' }
        }
      }
    }

    // Perform updates in a transaction
    await prisma.$transaction(
      updates.map((update) =>
        prisma.category.update({
          where: { id: update.id },
          data: { parentId: update.parentId },
        })
      )
    )

    revalidatePath('/admin/categorias')
    revalidatePath('/admin/posts')
    revalidatePath('/blog')

    return { success: true }
  } catch (error) {
    console.error('Error updating category hierarchy:', error)
    return { success: false, error: 'Erro ao atualizar hierarquia' }
  }
}

export async function deleteCategory(id: number) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Check if category has posts
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })

    if (!category) {
      return { success: false, error: 'Categoria não encontrada' }
    }

    if (category._count.posts > 0) {
      return {
        success: false,
        error: 'Não é possível excluir categoria com posts associados',
      }
    }

    await prisma.category.delete({ where: { id } })

    revalidatePath('/admin/categorias')

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Erro ao excluir categoria' }
  }
}
