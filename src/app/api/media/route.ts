import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MediaType } from '@prisma/client'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') as MediaType | null
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const skip = (page - 1) * limit

  const where = {
    ...(type && { type }),
    ...(search && {
      OR: [
        { filename: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
        { altText: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        uploadedBy: {
          select: { displayName: true },
        },
      },
    }),
    prisma.media.count({ where }),
  ])

  return NextResponse.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
