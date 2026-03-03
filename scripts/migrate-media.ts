/**
 * Script de migração de mídias do WordPress para Vercel Blob Storage
 *
 * 1. Lê attachments exportados do WordPress (JSONL)
 * 2. Converte imagens para WebP via sharp
 * 3. Faz upload para Vercel Blob
 * 4. Cria registros na tabela Media (PostgreSQL)
 * 5. Substitui URLs do WordPress no conteúdo dos posts e wiki articles
 *
 * Uso: BLOB_READ_WRITE_TOKEN=... npx tsx scripts/migrate-media.ts
 */

import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

const WP_UPLOADS_BASE = 'https://blog-local.gopost.com/wp-content/uploads/'
const LOCAL_MEDIA_DIR = path.join(__dirname, 'wp-media')
const ATTACHMENTS_FILE = path.join(__dirname, 'wp-data/attachments.jsonl')

interface WPAttachment {
  id: number
  title: string
  name: string
  mime_type: string
  guid: string
  caption: string
  file_path: string
  alt_text: string
}

// Map: WP file_path (without size suffix) → new Blob URL
const urlMap = new Map<string, string>()

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

async function processAttachment(att: WPAttachment): Promise<boolean> {
  if (!att.file_path) {
    console.log(`   ⚠ Skip ID ${att.id}: no file_path`)
    return false
  }

  const localPath = path.join(LOCAL_MEDIA_DIR, att.file_path)

  if (!fs.existsSync(localPath)) {
    console.log(`   ⚠ Skip ID ${att.id}: file not found: ${att.file_path}`)
    return false
  }

  let buffer = fs.readFileSync(localPath)
  let finalMimeType = att.mime_type
  let width: number | null = null
  let height: number | null = null
  let finalFilename = path.basename(att.file_path)

  if (isImage(att.mime_type)) {
    try {
      const metadata = await sharp(buffer).metadata()
      width = metadata.width || null
      height = metadata.height || null

      // Convert to WebP
      buffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer()

      finalMimeType = 'image/webp'
      finalFilename = finalFilename.replace(/\.[^.]+$/, '.webp')
    } catch (err) {
      console.log(`   ⚠ Sharp error for ${att.file_path}, keeping original:`, (err as Error).message)
    }
  }

  // Upload to Vercel Blob
  const timestamp = Date.now()
  const blobPath = `media/${timestamp}-${finalFilename}`

  const blob = await put(blobPath, buffer, {
    access: 'public',
    contentType: finalMimeType,
  })

  // Create Media record
  const mediaType = isImage(att.mime_type) ? 'IMAGE' :
    att.mime_type.startsWith('video/') ? 'VIDEO' : 'IMAGE' // PDFs as IMAGE for simplicity

  await prisma.media.create({
    data: {
      filename: finalFilename,
      originalName: path.basename(att.file_path),
      url: blob.url,
      mimeType: finalMimeType,
      size: buffer.length,
      width,
      height,
      type: mediaType,
      title: att.title || null,
      altText: att.alt_text || null,
      caption: att.caption || null,
      description: null,
      uploadedById: 1, // Prof. AMR
    },
  })

  // Store URL mapping: WP path → Blob URL
  // Map the original file path (e.g., "2025/07/image.png")
  urlMap.set(att.file_path, blob.url)

  // Also map the basename without extension for thumbnail matching
  // WordPress generates: image-300x200.png, image-1024x683.png etc.
  const baseName = path.basename(att.file_path, path.extname(att.file_path))
  const dirPath = path.dirname(att.file_path)
  urlMap.set(`__base__${dirPath}/${baseName}`, blob.url)

  return true
}

function replaceWordPressUrls(content: string): string {
  if (!content) return content

  // Replace full WordPress URLs with Blob URLs
  // Pattern: https://blog-local.gopost.com/wp-content/uploads/YYYY/MM/filename[-WxH].ext
  const wpUrlPattern = /https?:\/\/blog-local\.gopost\.com\/wp-content\/uploads\/([^\s"'<>)]+)/g

  return content.replace(wpUrlPattern, (fullMatch, relativePath: string) => {
    // Try exact match first
    if (urlMap.has(relativePath)) {
      return urlMap.get(relativePath)!
    }

    // Try matching as a thumbnail variant
    // WordPress thumbnails: filename-WIDTHxHEIGHT.ext
    const thumbMatch = relativePath.match(/^(.+?)(-\d+x\d+)(\.[^.]+)$/)
    if (thumbMatch) {
      const originalPath = thumbMatch[1] + thumbMatch[3]
      if (urlMap.has(originalPath)) {
        return urlMap.get(originalPath)!
      }
    }

    // Try base name matching
    const ext = path.extname(relativePath)
    const nameWithoutExt = relativePath.replace(ext, '').replace(/-\d+x\d+$/, '')
    const dirPart = path.dirname(relativePath)
    const basePart = path.basename(nameWithoutExt)
    const baseKey = `__base__${dirPart}/${basePart}`

    if (urlMap.has(baseKey)) {
      return urlMap.get(baseKey)!
    }

    // No mapping found, keep original
    return fullMatch
  })
}

async function migrate() {
  console.log('🖼️  Migração de Mídias WordPress → Vercel Blob\n')

  // Check prerequisites
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('❌ BLOB_READ_WRITE_TOKEN não configurado no .env')
    process.exit(1)
  }

  if (!fs.existsSync(ATTACHMENTS_FILE)) {
    console.error('❌ Arquivo de attachments não encontrado:', ATTACHMENTS_FILE)
    process.exit(1)
  }

  if (!fs.existsSync(LOCAL_MEDIA_DIR)) {
    console.error('❌ Diretório de mídia não encontrado:', LOCAL_MEDIA_DIR)
    process.exit(1)
  }

  // Step 1: Read attachments
  console.log('📖 Lendo attachments...')
  const attachments: WPAttachment[] = []
  const fileStream = fs.createReadStream(ATTACHMENTS_FILE)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  for await (const line of rl) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      attachments.push(JSON.parse(trimmed))
    } catch (e) {
      console.log(`   ⚠ JSON parse error: ${trimmed.substring(0, 80)}...`)
    }
  }
  console.log(`   ${attachments.length} attachments encontrados\n`)

  // Step 2: Upload each attachment
  console.log('☁️  Fazendo upload para Vercel Blob...')
  let uploaded = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i]
    try {
      const success = await processAttachment(att)
      if (success) {
        uploaded++
      } else {
        skipped++
      }
    } catch (err) {
      errors++
      console.error(`   ❌ Erro ID ${att.id} (${att.file_path}):`, (err as Error).message)
    }

    // Progress every 50
    if ((i + 1) % 50 === 0 || i === attachments.length - 1) {
      console.log(`   Progresso: ${i + 1}/${attachments.length} (${uploaded} ok, ${skipped} skip, ${errors} err)`)
    }
  }

  console.log(`\n📊 Upload concluído:`)
  console.log(`   ✅ ${uploaded} mídias enviadas`)
  console.log(`   ⏭️  ${skipped} ignoradas`)
  console.log(`   ❌ ${errors} erros`)
  console.log(`   📝 ${urlMap.size} mapeamentos de URL\n`)

  // Step 3: Replace URLs in posts
  console.log('🔄 Substituindo URLs nos posts...')
  const posts = await prisma.post.findMany({
    where: {
      content: { contains: 'blog-local.gopost.com' }
    },
    select: { id: true, content: true, featuredImage: true }
  })

  let postsUpdated = 0
  for (const post of posts) {
    const newContent = replaceWordPressUrls(post.content)
    const newFeaturedImage = post.featuredImage ? replaceWordPressUrls(post.featuredImage) : null

    if (newContent !== post.content || newFeaturedImage !== post.featuredImage) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          content: newContent,
          ...(newFeaturedImage !== post.featuredImage && { featuredImage: newFeaturedImage }),
        }
      })
      postsUpdated++
    }
  }
  console.log(`   ${postsUpdated} posts atualizados`)

  // Step 4: Replace URLs in wiki articles
  console.log('🔄 Substituindo URLs nos artigos wiki...')
  const wikiArticles = await prisma.wikiArticle.findMany({
    where: {
      content: { contains: 'blog-local.gopost.com' }
    },
    select: { id: true, content: true }
  })

  let wikiUpdated = 0
  for (const article of wikiArticles) {
    const newContent = replaceWordPressUrls(article.content)
    if (newContent !== article.content) {
      await prisma.wikiArticle.update({
        where: { id: article.id },
        data: { content: newContent }
      })
      wikiUpdated++
    }
  }
  console.log(`   ${wikiUpdated} artigos wiki atualizados`)

  // Step 5: Also check for any remaining WP URLs (different patterns)
  console.log('\n🔍 Verificando URLs restantes...')
  const remainingPosts = await prisma.post.count({
    where: { content: { contains: 'blog-local.gopost.com' } }
  })
  const remainingWiki = await prisma.wikiArticle.count({
    where: { content: { contains: 'blog-local.gopost.com' } }
  })
  console.log(`   Posts com URLs WP restantes: ${remainingPosts}`)
  console.log(`   Wiki com URLs WP restantes: ${remainingWiki}`)

  console.log('\n✅ Migração de mídias concluída!')
  console.log(`   📸 ${uploaded} mídias no Vercel Blob`)
  console.log(`   📝 ${postsUpdated} posts atualizados`)
  console.log(`   📚 ${wikiUpdated} wiki articles atualizados`)
}

migrate()
  .catch((e) => {
    console.error('❌ Erro na migração:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
