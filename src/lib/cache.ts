import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })
  },
  ['categories'],
  { revalidate: 60, tags: ['categories'] }
)

export const getCachedTags = unstable_cache(
  async () => {
    return prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })
  },
  ['tags'],
  { revalidate: 60, tags: ['tags'] }
)
