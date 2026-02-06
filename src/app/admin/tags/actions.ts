'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function createTag(name: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const slug = slugify(name)

    const existing = await prisma.tag.findUnique({ where: { slug } })
    if (existing) {
      return { success: false, error: 'Já existe uma tag com este nome' }
    }

    await prisma.tag.create({ data: { name, slug } })

    revalidatePath('/admin/tags')
    revalidatePath('/admin/posts')

    return { success: true }
  } catch (error) {
    console.error('Error creating tag:', error)
    return { success: false, error: 'Erro ao criar tag' }
  }
}

export async function deleteTag(id: number) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })

    if (!tag) {
      return { success: false, error: 'Tag não encontrada' }
    }

    if (tag._count.posts > 0) {
      return {
        success: false,
        error: 'Não é possível excluir tag com posts associados',
      }
    }

    await prisma.tag.delete({ where: { id } })

    revalidatePath('/admin/tags')

    return { success: true }
  } catch (error) {
    console.error('Error deleting tag:', error)
    return { success: false, error: 'Erro ao excluir tag' }
  }
}
