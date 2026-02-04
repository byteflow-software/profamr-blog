'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  parentId?: number | null
}

export async function createCategory(data: CategoryFormData) {
  const session = await auth()
  if (!session?.user) {
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
  const session = await auth()
  if (!session?.user) {
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

export async function deleteCategory(id: number) {
  const session = await auth()
  if (!session?.user) {
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
