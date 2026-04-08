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

const ALL_TUTORIAL_PAGE_IDS = [
  'dashboard',
  'posts-list',
  'post-new',
  'post-edit',
  'categories',
  'category-edit',
  'tags',
  'media-library',
  'wiki-list',
  'wiki-new',
  'wiki-edit',
  'wiki-categories',
  'users-list',
  'user-edit',
  'profile',
  'settings',
];

export async function completeAllTutorials() {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false as const, error: 'Não autorizado' }
  }

  try {
    await Promise.all(
      ALL_TUTORIAL_PAGE_IDS.map((pageId) =>
        prisma.tutorialProgress.upsert({
          where: { userId_pageId: { userId: user.id, pageId } },
          update: { completedAt: new Date() },
          create: { userId: user.id, pageId },
        }),
      ),
    )
    return { success: true as const, data: ALL_TUTORIAL_PAGE_IDS }
  } catch (error) {
    console.error('Error completing all tutorials:', error)
    return { success: false as const, error: 'Erro ao salvar progresso' }
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
