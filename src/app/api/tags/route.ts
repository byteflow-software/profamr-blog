import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q') || ''

  const tags = await prisma.tag.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    take: 20,
    select: { id: true, name: true, slug: true },
  })

  return NextResponse.json(tags)
}
