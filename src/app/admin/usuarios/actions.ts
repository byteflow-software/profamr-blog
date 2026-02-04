'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/auth-utils'
import { UserRole } from '@prisma/client'

interface UserFormData {
  email: string
  displayName: string
  password?: string
  role: UserRole
  bio?: string
}

export async function createUser(data: UserFormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return { success: false, error: 'Este email já está cadastrado' }
    }

    // Validate password
    if (!data.password) {
      return { success: false, error: 'Senha é obrigatória' }
    }

    const passwordValidation = validatePasswordStrength(data.password)
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join('. ') }
    }

    const passwordHash = await hashPassword(data.password)

    await prisma.user.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        passwordHash,
        role: data.role,
        bio: data.bio,
      },
    })

    revalidatePath('/admin/usuarios')

    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Erro ao criar usuário' }
  }
}

export async function updateUser(id: number, data: UserFormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Check if email already exists for another user
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    })
    if (existing) {
      return { success: false, error: 'Este email já está em uso' }
    }

    // Prepare update data
    const updateData: {
      email: string
      displayName: string
      role: UserRole
      bio?: string
      passwordHash?: string
    } = {
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      bio: data.bio,
    }

    // Only update password if provided
    if (data.password) {
      const passwordValidation = validatePasswordStrength(data.password)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.errors.join('. ') }
      }
      updateData.passwordHash = await hashPassword(data.password)
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
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
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Cannot delete yourself
    if (parseInt(session.user.id) === id) {
      return { success: false, error: 'Você não pode excluir sua própria conta' }
    }

    // Check if user has content
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true, wikiArticles: true } },
      },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user._count.posts > 0 || user._count.wikiArticles > 0) {
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

export async function resetUserPassword(id: number, newPassword: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      return { success: false, error: passwordValidation.errors.join('. ') }
    }

    const passwordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        failedAttempts: 0,
        lockedUntil: null,
      },
    })

    revalidatePath('/admin/usuarios')

    return { success: true }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { success: false, error: 'Erro ao redefinir senha' }
  }
}

export async function disable2FA(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    revalidatePath('/admin/usuarios')

    return { success: true }
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return { success: false, error: 'Erro ao desativar 2FA' }
  }
}

export async function unlockUser(id: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
      },
    })

    revalidatePath('/admin/usuarios')

    return { success: true }
  } catch (error) {
    console.error('Error unlocking user:', error)
    return { success: false, error: 'Erro ao desbloquear usuário' }
  }
}
