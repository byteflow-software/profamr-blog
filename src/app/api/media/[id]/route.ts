import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const mediaId = parseInt(id)

  if (isNaN(mediaId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { filename, title, altText, caption, description } = body

    const media = await prisma.media.update({
      where: { id: mediaId },
      data: {
        ...(filename !== undefined && { filename }),
        ...(title !== undefined && { title }),
        ...(altText !== undefined && { altText }),
        ...(caption !== undefined && { caption }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Erro ao atualizar mídia:', error)
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const mediaId = parseInt(id)

  if (isNaN(mediaId)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  try {
    const media = await prisma.media.findUnique({ where: { id: mediaId } })
    if (!media) {
      return NextResponse.json({ error: 'Mídia não encontrada' }, { status: 404 })
    }

    // Delete from Vercel Blob
    try {
      await del(media.url)
    } catch (e) {
      console.error('Erro ao deletar do Blob:', e)
    }

    // Delete from DB
    await prisma.media.delete({ where: { id: mediaId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar mídia:', error)
    return NextResponse.json({ error: 'Erro ao deletar' }, { status: 500 })
  }
}
