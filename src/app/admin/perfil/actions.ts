'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface ProfileData {
  displayName: string
  bio?: string
  avatarUrl?: string
}

export async function updateProfile(data: ProfileData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
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
