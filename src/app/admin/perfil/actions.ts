'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generate2FASecret,
  verify2FAToken,
} from '@/lib/auth-utils'

interface ProfileData {
  displayName: string
  bio?: string
  avatarUrl?: string
}

export async function updateProfile(data: ProfileData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        displayName: data.displayName,
        bio: data.bio || null,
        avatarUrl: data.avatarUrl || null,
      },
    })

    revalidatePath('/admin/perfil')

    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Erro ao atualizar perfil' }
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { passwordHash: true },
    })

    if (!user || !user.passwordHash) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    // Validate new password
    const validation = validatePasswordStrength(newPassword)
    if (!validation.valid) {
      return { success: false, error: validation.errors.join('. ') }
    }

    // Update password
    const newHash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { passwordHash: newHash },
    })

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'Erro ao alterar senha' }
  }
}

export async function setup2FA() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { email: true, twoFactorEnabled: true },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user.twoFactorEnabled) {
      return { success: false, error: '2FA já está ativo' }
    }

    const { secret, qrCodeUrl } = await generate2FASecret(user.email)

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { twoFactorSecret: secret },
    })

    return { success: true, qrCode: qrCodeUrl, secret }
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    return { success: false, error: 'Erro ao configurar 2FA' }
  }
}

export async function enable2FA(token: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user.twoFactorEnabled) {
      return { success: false, error: '2FA já está ativo' }
    }

    if (!user.twoFactorSecret) {
      return { success: false, error: 'Configure o 2FA primeiro' }
    }

    // Verify token
    const isValid = verify2FAToken(user.twoFactorSecret, token)
    if (!isValid) {
      return { success: false, error: 'Código inválido' }
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { twoFactorEnabled: true },
    })

    revalidatePath('/admin/perfil')

    return { success: true }
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return { success: false, error: 'Erro ao ativar 2FA' }
  }
}

export async function disable2FA() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    revalidatePath('/admin/perfil')

    return { success: true }
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return { success: false, error: 'Erro ao desativar 2FA' }
  }
}
