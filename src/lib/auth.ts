import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export type UserRole = 'ADMIN' | 'EDITOR' | 'AUTHOR'

export interface AppUser {
  id: number
  email: string
  displayName: string
  role: UserRole
  bio: string | null
  avatarUrl: string | null
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) return null

  const mapping = await prisma.clerkUserMapping.findUnique({
    where: { clerkUserId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          role: true,
          bio: true,
          avatarUrl: true,
        },
      },
    },
  })

  if (!mapping) return null
  return mapping.user as AppUser
}
