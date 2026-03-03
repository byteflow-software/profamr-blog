/**
 * Migra registros de mídia e conteúdo de posts/wiki com links corrigidos
 * do banco de origem para o banco de destino (atual .env).
 *
 * Uso: npx tsx scripts/sync-media-to-new-db.ts
 */

import { PrismaClient } from '@prisma/client'

const SOURCE_URL = 'postgresql://neondb_owner:npg_J2TSLCR3uZmO@ep-old-cake-acordtag-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const sourceDb = new PrismaClient({
  datasources: { db: { url: SOURCE_URL } },
})

const destDb = new PrismaClient() // uses DATABASE_URL from .env

async function main() {
  console.log('🔄 Sincronização de mídias e conteúdo corrigido\n')

  // Step 1: Migrate media records
  console.log('📸 Lendo mídias do banco de origem...')
  const sourceMedia = await sourceDb.media.findMany({
    orderBy: { id: 'asc' },
  })
  console.log(`   ${sourceMedia.length} mídias encontradas\n`)

  if (sourceMedia.length > 0) {
    // Check if destination already has media
    const destMediaCount = await destDb.media.count()
    console.log(`   Destino já tem ${destMediaCount} mídias`)

    if (destMediaCount > 0) {
      console.log('   ⚠ Limpando mídias existentes no destino...')
      await destDb.media.deleteMany()
    }

    console.log('   Inserindo mídias no destino...')
    let inserted = 0
    for (const media of sourceMedia) {
      try {
        await destDb.media.create({
          data: {
            id: media.id,
            filename: media.filename,
            originalName: media.originalName,
            url: media.url,
            mimeType: media.mimeType,
            size: media.size,
            width: media.width,
            height: media.height,
            type: media.type,
            title: media.title,
            altText: media.altText,
            caption: media.caption,
            description: media.description,
            uploadedById: media.uploadedById,
            createdAt: media.createdAt,
            updatedAt: media.updatedAt,
          },
        })
        inserted++
      } catch (err) {
        console.log(`   ⚠ Erro ao inserir mídia ID ${media.id}: ${(err as Error).message}`)
      }

      if (inserted % 100 === 0) {
        console.log(`   Progresso: ${inserted}/${sourceMedia.length}`)
      }
    }
    console.log(`   ✅ ${inserted} mídias inseridas\n`)

    // Reset sequence
    if (inserted > 0) {
      const maxId = sourceMedia[sourceMedia.length - 1].id
      try {
        await destDb.$executeRawUnsafe(`SELECT setval('media_id_seq', ${maxId}, true)`)
        console.log(`   Sequência media_id_seq ajustada para ${maxId}\n`)
      } catch {
        console.log('   ⚠ Não foi possível ajustar a sequência (pode ser automático)\n')
      }
    }
  }

  // Step 2: Update posts with corrected content
  console.log('📝 Lendo posts do banco de origem...')
  const sourcePosts = await sourceDb.post.findMany({
    select: { id: true, content: true, featuredImage: true },
  })
  console.log(`   ${sourcePosts.length} posts encontrados`)

  let postsUpdated = 0
  for (const post of sourcePosts) {
    try {
      // Check if post exists in destination
      const destPost = await destDb.post.findUnique({
        where: { id: post.id },
        select: { id: true, content: true, featuredImage: true },
      })

      if (destPost && (destPost.content !== post.content || destPost.featuredImage !== post.featuredImage)) {
        await destDb.post.update({
          where: { id: post.id },
          data: {
            content: post.content,
            ...(post.featuredImage !== destPost.featuredImage ? { featuredImage: post.featuredImage } : {}),
          },
        })
        postsUpdated++
      }
    } catch (err) {
      // Post might not exist in destination, skip
    }
  }
  console.log(`   ✅ ${postsUpdated} posts atualizados\n`)

  // Step 3: Update wiki articles with corrected content
  console.log('📚 Lendo artigos wiki do banco de origem...')
  const sourceWiki = await sourceDb.wikiArticle.findMany({
    select: { id: true, content: true },
  })
  console.log(`   ${sourceWiki.length} artigos encontrados`)

  let wikiUpdated = 0
  for (const article of sourceWiki) {
    try {
      const destArticle = await destDb.wikiArticle.findUnique({
        where: { id: article.id },
        select: { id: true, content: true },
      })

      if (destArticle && destArticle.content !== article.content) {
        await destDb.wikiArticle.update({
          where: { id: article.id },
          data: { content: article.content },
        })
        wikiUpdated++
      }
    } catch (err) {
      // Article might not exist in destination, skip
    }
  }
  console.log(`   ✅ ${wikiUpdated} wiki articles atualizados\n`)

  // Step 4: Verify
  console.log('🔍 Verificação final...')
  const finalMediaCount = await destDb.media.count()
  const remainingWpPosts = await destDb.post.count({
    where: { content: { contains: 'blog-local.gopost.com' } },
  })
  const remainingWpWiki = await destDb.wikiArticle.count({
    where: { content: { contains: 'blog-local.gopost.com' } },
  })

  console.log(`   📸 Mídias no destino: ${finalMediaCount}`)
  console.log(`   📝 Posts atualizados: ${postsUpdated}`)
  console.log(`   📚 Wiki atualizados: ${wikiUpdated}`)
  console.log(`   ⚠ Posts com URLs WP restantes: ${remainingWpPosts}`)
  console.log(`   ⚠ Wiki com URLs WP restantes: ${remainingWpWiki}`)
  console.log('\n✅ Sincronização concluída!')
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await sourceDb.$disconnect()
    await destDb.$disconnect()
  })
