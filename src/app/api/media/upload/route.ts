import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx. 50MB)' }, { status: 400 })
    }

    const mimeType = file.type
    const isImage = IMAGE_TYPES.includes(mimeType)
    const isVideo = VIDEO_TYPES.includes(mimeType)

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    const originalName = file.name
    const customFilename = (formData.get('filename') as string) || originalName
    const title = (formData.get('title') as string) || null
    const altText = (formData.get('altText') as string) || null
    const caption = (formData.get('caption') as string) || null
    const description = (formData.get('description') as string) || null

    const arrayBuffer = await file.arrayBuffer()
    let buffer: Buffer<ArrayBuffer> = Buffer.from(arrayBuffer)
    let finalMimeType = mimeType
    let width: number | null = null
    let height: number | null = null
    let finalFilename = customFilename

    if (isImage && mimeType !== 'image/svg+xml') {
      // Convert to WebP
      const metadata = await sharp(buffer).metadata()
      width = metadata.width || null
      height = metadata.height || null

      const webpResult = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer()
      buffer = webpResult as Buffer<ArrayBuffer>

      finalMimeType = 'image/webp'
      // Change extension to .webp
      finalFilename = finalFilename.replace(/\.[^.]+$/, '.webp')
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const blobPath = `media/${timestamp}-${finalFilename}`
    const blob = await put(blobPath, buffer, {
      access: 'public',
      contentType: finalMimeType,
    })

    // Save to database
    const media = await prisma.media.create({
      data: {
        filename: finalFilename,
        originalName,
        url: blob.url,
        mimeType: finalMimeType,
        size: buffer.length,
        width,
        height,
        type: isImage ? 'IMAGE' : 'VIDEO',
        title,
        altText,
        caption,
        description,
        uploadedById: user.id,
      },
    })

    return NextResponse.json(media, { status: 201 })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ error: 'Erro interno no upload' }, { status: 500 })
  }
}
