'use server'

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getTutorialProgress() {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false as const, error: 'Não autorizado' }
  }

  try {
    const records = await prisma.tutorialProgress.findMany({
      where: { userId: user.id },
      select: { pageId: true },
    })

    return { success: true as const, data: records.map((r) => r.pageId) }
  } catch (error) {
    console.error('Error fetching tutorial progress:', error)
    return { success: false as const, error: 'Erro ao buscar progresso do tutorial' }
  }
}

export async function completeTutorial(pageId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false as const, error: 'Não autorizado' }
  }

  if (!pageId) {
    return { success: false as const, error: 'pageId é obrigatório' }
  }

  try {
    await prisma.tutorialProgress.upsert({
      where: {
        userId_pageId: { userId: user.id, pageId },
      },
      update: { completedAt: new Date() },
      create: { userId: user.id, pageId },
    })

    return { success: true as const }
  } catch (error) {
    console.error('Error completing tutorial:', error)
    return { success: false as const, error: 'Erro ao salvar progresso do tutorial' }
  }
}

export async function resetTutorialProgress() {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false as const, error: 'Não autorizado' }
  }

  try {
    await prisma.tutorialProgress.deleteMany({
      where: { userId: user.id },
    })

    return { success: true as const }
  } catch (error) {
    console.error('Error resetting tutorial progress:', error)
    return { success: false as const, error: 'Erro ao resetar progresso do tutorial' }
  }
}
