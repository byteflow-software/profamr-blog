/**
 * Migração do WordPress (Docker) para PostgreSQL (Neon)
 *
 * Lê dados exportados como JSON de scripts/wp-data/
 * Reseta o banco Neon, preserva usuários e clerk mappings,
 * importa posts, wiki, categorias e tags do WordPress.
 *
 * Uso: npx tsx scripts/migrate-from-docker.ts
 */

import { PrismaClient, PostStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ==================== Tipos ====================

interface WPTerm {
  term_id: number
  name: string
  slug: string
  taxonomy: string
  description: string
  parent: number
  tt_id: number
}

interface WPRelationship {
  object_id: number
  term_taxonomy_id: number
}

interface WPPostRaw {
  ID: number
  post_title: string
  post_name: string
  post_content: string // base64 encoded
  post_excerpt: string // base64 encoded
  post_status: string
  post_type: string
  post_date: string
  post_modified: string
  post_parent: number
}

interface WPPost {
  ID: number
  post_title: string
  post_name: string
  post_content: string
  post_excerpt: string
  post_status: string
  post_type: string
  post_date: string
  post_modified: string
  post_parent: number
}

// ==================== Helpers ====================

function convertStatus(wpStatus: string): PostStatus {
  switch (wpStatus) {
    case 'publish': return 'PUBLISHED'
    case 'draft': return 'DRAFT'
    default: return 'DRAFT'
  }
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.startsWith('0000')) return null
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

function ensureSlug(slug: string, fallback: string): string {
  if (slug && slug.trim()) return slug
  return fallback
}

function loadJson<T>(filename: string): T {
  const filePath = path.join(__dirname, 'wp-data', filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

function loadJsonl<T>(filename: string): T[] {
  const filePath = path.join(__dirname, 'wp-data', filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return raw.split('\n').filter(Boolean).map(line => JSON.parse(line) as T)
}

function decodeBase64(b64: string): string {
  if (!b64) return ''
  return Buffer.from(b64, 'base64').toString('utf-8')
}

// ==================== Usuários a preservar ====================

const USERS_TO_PRESERVE = [
  {
    id: 1,
    email: 'admin@profamr.com.br',
    displayName: 'Prof. AMR',
    bio: 'Advogado e Professor de Direito',
    avatarUrl: null,
    role: 'ADMIN' as const,
    clerkUserId: 'user_39IqzIpcOFE0TrlGQXZCh7ZXdTb',
  },
  {
    id: 2,
    email: 'ryanmatheusdeveloper@gmail.com',
    displayName: 'admin',
    bio: null,
    avatarUrl: null,
    role: 'AUTHOR' as const,
    clerkUserId: 'user_39IqzA3sTf2z2VrNIzn2l03ozco',
  },
  {
    id: 3,
    email: 'contato@profamr.app',
    displayName: 'Prof. Alexandre Morais da Rosa',
    bio: null,
    avatarUrl: null,
    role: 'AUTHOR' as const,
    clerkUserId: 'user_39IqzG30fiaW14VPvLmjpZp5tmL',
  },
  {
    id: 4,
    email: 'prof@profamr.app',
    displayName: 'Prof. Alexandre Morais da Rosa',
    bio: null,
    avatarUrl: null,
    role: 'AUTHOR' as const,
    clerkUserId: 'user_39IqzDhABX56K1SKvKStv3y1iu6',
  },
]

const DEFAULT_AUTHOR_ID = 1 // Prof. AMR

// ==================== Main ====================

async function migrate() {
  console.log('=== Migração WordPress (Docker) → PostgreSQL (Neon) ===\n')

  // 1. Carregar dados JSON exportados
  console.log('1. Carregando dados exportados...')
  const terms = loadJson<WPTerm[]>('terms.json')
  const relationships = loadJson<WPRelationship[]>('relationships.json')

  // Posts use JSONL format with base64-encoded content
  const blogPostsRaw = loadJsonl<WPPostRaw>('posts-blog.jsonl')
  const wikiPostsRaw = loadJsonl<WPPostRaw>('posts-wiki.jsonl')

  // Decode base64 content and excerpt
  const blogPosts: WPPost[] = blogPostsRaw.map(p => ({
    ...p,
    post_content: decodeBase64(p.post_content),
    post_excerpt: decodeBase64(p.post_excerpt),
  }))
  const wikiPosts: WPPost[] = wikiPostsRaw.map(p => ({
    ...p,
    post_content: decodeBase64(p.post_content),
    post_excerpt: decodeBase64(p.post_excerpt),
  }))

  console.log(`   Terms: ${terms.length}`)
  console.log(`   Relationships: ${relationships.length}`)
  console.log(`   Blog posts: ${blogPosts.length}`)
  console.log(`   Wiki posts: ${wikiPosts.length}`)

  // Separar termos por taxonomia
  const categories = terms.filter(t => t.taxonomy === 'category')
  const tags = terms.filter(t => t.taxonomy === 'post_tag')
  const wikiCats = terms.filter(t => t.taxonomy === 'wiki_cats')

  console.log(`   Categories: ${categories.length}, Tags: ${tags.length}, Wiki cats: ${wikiCats.length}`)

  // Build lookup: tt_id -> term
  const termByTtId = new Map<number, WPTerm>()
  for (const t of terms) {
    termByTtId.set(t.tt_id, t)
  }

  // Build lookup: object_id -> [tt_ids]
  const relsByObject = new Map<number, number[]>()
  for (const r of relationships) {
    const arr = relsByObject.get(r.object_id) || []
    arr.push(r.term_taxonomy_id)
    relsByObject.set(r.object_id, arr)
  }

  // 2. Resetar banco
  console.log('\n2. Resetando banco de dados...')
  await prisma.$executeRawUnsafe('DELETE FROM "tags_on_posts"')
  await prisma.$executeRawUnsafe('DELETE FROM "categories_on_posts"')
  await prisma.$executeRawUnsafe('DELETE FROM "posts"')
  await prisma.$executeRawUnsafe('DELETE FROM "categories"')
  await prisma.$executeRawUnsafe('DELETE FROM "tags"')
  await prisma.$executeRawUnsafe('DELETE FROM "wiki_articles"')
  await prisma.$executeRawUnsafe('DELETE FROM "wiki_categories"')
  await prisma.$executeRawUnsafe('DELETE FROM "clerk_user_mappings"')
  await prisma.$executeRawUnsafe('DELETE FROM "users"')
  await prisma.$executeRawUnsafe('DELETE FROM "site_settings"')
  console.log('   Todas as tabelas limpas.')

  // 3. Recriar usuários
  console.log('\n3. Recriando usuários...')
  for (const u of USERS_TO_PRESERVE) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "users" (id, email, display_name, bio, avatar_url, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6::"UserRole", NOW(), NOW())`,
      u.id, u.email, u.displayName, u.bio, u.avatarUrl, u.role
    )
    await prisma.$executeRawUnsafe(
      `INSERT INTO "clerk_user_mappings" (clerk_user_id, user_id, created_at) VALUES ($1, $2, NOW())`,
      u.clerkUserId, u.id
    )
    console.log(`   + ${u.email} (${u.role})`)
  }
  // Reset sequence
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id),0) FROM users))`)

  // 4. Importar categorias (blog)
  console.log('\n4. Importando categorias do blog...')
  const categoryMap = new Map<number, number>() // wpTermId -> prismaId

  // First pass: create all categories without parent
  for (const cat of categories) {
    try {
      const slug = ensureSlug(cat.slug, `cat-${cat.term_id}`)
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          slug,
          description: cat.description || null,
          wpTermId: cat.term_id,
        },
      })
      categoryMap.set(cat.term_id, created.id)
    } catch (e: any) {
      // Slug duplicate - append term_id
      try {
        const created = await prisma.category.create({
          data: {
            name: cat.name,
            slug: `${cat.slug}-${cat.term_id}`,
            description: cat.description || null,
            wpTermId: cat.term_id,
          },
        })
        categoryMap.set(cat.term_id, created.id)
      } catch (e2) {
        console.error(`   Erro ao criar categoria ${cat.name}: ${e.message}`)
      }
    }
  }

  // Second pass: set parents
  for (const cat of categories) {
    if (cat.parent > 0) {
      const prismaId = categoryMap.get(cat.term_id)
      // Find the parent term_id from the parent tt_id
      const parentTerm = categories.find(c => c.term_id === cat.parent)
      const parentPrismaId = parentTerm ? categoryMap.get(parentTerm.term_id) : undefined
      if (prismaId && parentPrismaId) {
        await prisma.category.update({
          where: { id: prismaId },
          data: { parentId: parentPrismaId },
        })
      }
    }
  }
  console.log(`   ${categoryMap.size} categorias importadas`)

  // 5. Importar tags
  console.log('\n5. Importando tags...')
  const tagMap = new Map<number, number>() // wpTermId -> prismaId

  for (const tag of tags) {
    try {
      const slug = ensureSlug(tag.slug, `tag-${tag.term_id}`)
      const created = await prisma.tag.create({
        data: {
          name: tag.name,
          slug,
          wpTermId: tag.term_id,
        },
      })
      tagMap.set(tag.term_id, created.id)
    } catch (e: any) {
      try {
        const created = await prisma.tag.create({
          data: {
            name: tag.name,
            slug: `${tag.slug}-${tag.term_id}`,
            wpTermId: tag.term_id,
          },
        })
        tagMap.set(tag.term_id, created.id)
      } catch (e2) {
        console.error(`   Erro ao criar tag ${tag.name}: ${e.message}`)
      }
    }
  }
  console.log(`   ${tagMap.size} tags importadas`)

  // 6. Importar wiki categories
  console.log('\n6. Importando categorias Wiki...')
  const wikiCatMap = new Map<number, number>() // wpTermId -> prismaId

  for (const cat of wikiCats) {
    try {
      const slug = ensureSlug(cat.slug, `wiki-cat-${cat.term_id}`)
      const created = await prisma.wikiCategory.create({
        data: {
          name: cat.name,
          slug,
          description: cat.description || null,
          wpTermId: cat.term_id,
        },
      })
      wikiCatMap.set(cat.term_id, created.id)
    } catch (e: any) {
      try {
        const created = await prisma.wikiCategory.create({
          data: {
            name: cat.name,
            slug: `${cat.slug}-${cat.term_id}`,
            description: cat.description || null,
            wpTermId: cat.term_id,
          },
        })
        wikiCatMap.set(cat.term_id, created.id)
      } catch (e2) {
        console.error(`   Erro ao criar wiki cat ${cat.name}: ${e.message}`)
      }
    }
  }

  // Set parents for wiki categories
  for (const cat of wikiCats) {
    if (cat.parent > 0) {
      const prismaId = wikiCatMap.get(cat.term_id)
      const parentTerm = wikiCats.find(c => c.term_id === cat.parent)
      const parentPrismaId = parentTerm ? wikiCatMap.get(parentTerm.term_id) : undefined
      if (prismaId && parentPrismaId) {
        await prisma.wikiCategory.update({
          where: { id: prismaId },
          data: { parentId: parentPrismaId },
        })
      }
    }
  }
  console.log(`   ${wikiCatMap.size} categorias Wiki importadas`)

  // 7. Importar posts do blog
  console.log('\n7. Importando posts do blog...')
  let blogCount = 0
  let blogErrors = 0

  for (const post of blogPosts) {
    try {
      const slug = ensureSlug(post.post_name, `post-${post.ID}`)
      const status = convertStatus(post.post_status)
      const publishedAt = status === 'PUBLISHED' ? parseDate(post.post_date) : null

      const created = await prisma.post.create({
        data: {
          title: post.post_title || 'Sem título',
          slug,
          content: post.post_content || '',
          excerpt: post.post_excerpt || null,
          status,
          publishedAt,
          authorId: DEFAULT_AUTHOR_ID,
          wpId: post.ID,
        },
      })

      // Attach categories and tags via relationships
      const ttIds = relsByObject.get(post.ID) || []
      for (const ttId of ttIds) {
        const term = termByTtId.get(ttId)
        if (!term) continue

        if (term.taxonomy === 'category') {
          const catId = categoryMap.get(term.term_id)
          if (catId) {
            try {
              await prisma.categoriesOnPosts.create({
                data: { postId: created.id, categoryId: catId },
              })
            } catch { /* ignore duplicates */ }
          }
        } else if (term.taxonomy === 'post_tag') {
          const tagId = tagMap.get(term.term_id)
          if (tagId) {
            try {
              await prisma.tagsOnPosts.create({
                data: { postId: created.id, tagId: tagId },
              })
            } catch { /* ignore duplicates */ }
          }
        }
      }

      blogCount++
    } catch (e: any) {
      blogErrors++
      if (blogErrors <= 5) {
        console.error(`   Erro post ${post.ID} "${post.post_title?.slice(0, 40)}": ${e.message}`)
      }
    }
  }
  console.log(`   ${blogCount} posts importados (${blogErrors} erros)`)

  // 8. Importar artigos Wiki
  console.log('\n8. Importando artigos Wiki...')
  let wikiCount = 0
  let wikiErrors = 0
  const wikiIdMap = new Map<number, number>() // wpPostId -> prismaId

  // First pass: create all wiki articles without parent
  for (const post of wikiPosts) {
    try {
      const slug = ensureSlug(post.post_name, `wiki-${post.ID}`)
      const status = convertStatus(post.post_status)
      const publishedAt = status === 'PUBLISHED' ? parseDate(post.post_date) : null

      // Find wiki category from relationships
      let wikiCategoryId: number | null = null
      const ttIds = relsByObject.get(post.ID) || []
      for (const ttId of ttIds) {
        const term = termByTtId.get(ttId)
        if (term && term.taxonomy === 'wiki_cats') {
          const catId = wikiCatMap.get(term.term_id)
          if (catId) {
            wikiCategoryId = catId
            break
          }
        }
      }

      const created = await prisma.wikiArticle.create({
        data: {
          title: post.post_title || 'Sem título',
          slug,
          content: post.post_content || '',
          summary: post.post_excerpt || null,
          status,
          publishedAt,
          authorId: DEFAULT_AUTHOR_ID,
          categoryId: wikiCategoryId,
          wpId: post.ID,
        },
      })

      wikiIdMap.set(post.ID, created.id)
      wikiCount++
    } catch (e: any) {
      wikiErrors++
      if (wikiErrors <= 5) {
        console.error(`   Erro wiki ${post.ID} "${post.post_title?.slice(0, 40)}": ${e.message}`)
      }
    }
  }

  // Second pass: set parents for wiki articles
  let parentsSet = 0
  for (const post of wikiPosts) {
    if (post.post_parent > 0) {
      const prismaId = wikiIdMap.get(post.ID)
      const parentPrismaId = wikiIdMap.get(post.post_parent)
      if (prismaId && parentPrismaId) {
        try {
          await prisma.wikiArticle.update({
            where: { id: prismaId },
            data: { parentId: parentPrismaId },
          })
          parentsSet++
        } catch { /* ignore */ }
      }
    }
  }

  console.log(`   ${wikiCount} artigos wiki importados (${wikiErrors} erros, ${parentsSet} com parent)`)

  // 9. Recriar SiteSettings
  console.log('\n9. Recriando configurações do site...')
  await prisma.siteSettings.create({
    data: {
      id: 1,
      siteName: 'Prof. AMR',
      siteTagline: 'Conhecimento jurídico acessível e atualizado',
      aboutText: 'Blog especializado em direito, com artigos, análises e uma wiki jurídica completa.',
      socialLinks: [],
    },
  })

  // 10. Verificação final
  console.log('\n10. Verificação final...')
  const [
    userCount,
    postCount,
    catCount,
    tagCount,
    wikiArticleCount,
    wikiCatCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.wikiArticle.count(),
    prisma.wikiCategory.count(),
  ])

  console.log('\n=== Migração Concluída ===')
  console.log(`   Usuários: ${userCount}`)
  console.log(`   Posts: ${postCount}`)
  console.log(`   Categorias: ${catCount}`)
  console.log(`   Tags: ${tagCount}`)
  console.log(`   Wiki Artigos: ${wikiArticleCount}`)
  console.log(`   Wiki Categorias: ${wikiCatCount}`)
}

migrate()
  .catch((e) => {
    console.error('ERRO na migração:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
