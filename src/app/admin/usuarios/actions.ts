'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

interface UserFormData {
  email: string
  displayName: string
  role: UserRole
  bio?: string
}

export async function updateUser(id: number, data: UserFormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    })
    if (existing) {
      return { success: false, error: 'Este email já está em uso' }
    }

    await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        bio: data.bio,
      },
    })

    revalidatePath('/admin/usuarios')
    revalidatePath(`/admin/usuarios/${id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Erro ao atualizar usuário' }
  }
}

export async function deleteUser(id: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    if (user.id === id) {
      return { success: false, error: 'Você não pode excluir sua própria conta' }
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, wikiArticles: true } },
      },
    })

    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (targetUser._count.posts > 0 || targetUser._count.wikiArticles > 0) {
      return {
        success: false,
        error: 'Não é possível excluir usuário com conteúdo associado',
      }
    }

    await prisma.user.delete({ where: { id } })

    revalidatePath('/admin/usuarios')

    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Erro ao excluir usuário' }
  }
}
