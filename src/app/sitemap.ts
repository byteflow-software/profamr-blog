import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  })

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `https://profamr.app/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt || undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: 'https://profamr.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://profamr.app/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://profamr.app/wiki',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...postEntries,
  ]
}
