/**
 * Script de migração de WordPress MySQL para PostgreSQL
 *
 * Este script lê o dump SQL do WordPress e importa os dados
 * para o banco PostgreSQL usando Prisma.
 *
 * Uso: npm run migrate:wp
 */

import { PrismaClient, PostStatus } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()

// Prefixo das tabelas WordPress
const WP_PREFIX = 'wp_0ff490e234_'

interface WPPost {
  ID: number
  post_author: number
  post_date: string
  post_content: string
  post_title: string
  post_excerpt: string
  post_status: string
  post_name: string
  post_modified: string
  post_type: string
  post_parent: number
}

interface WPTerm {
  term_id: number
  name: string
  slug: string
}

interface WPTermTaxonomy {
  term_taxonomy_id: number
  term_id: number
  taxonomy: string
  description: string
  parent: number
}

interface WPTermRelationship {
  object_id: number
  term_taxonomy_id: number
}

interface WPUser {
  ID: number
  user_email: string
  display_name: string
}

// Parser simples para extrair valores de INSERT statements
function parseInsertValues(line: string): string[][] {
  const valuesMatch = line.match(/VALUES\s*(.+);?$/i)
  if (!valuesMatch) return []

  const valuesStr = valuesMatch[1]
  const results: string[][] = []
  let current: string[] = []
  let inString = false
  let stringChar = ''
  let currentValue = ''
  let escaped = false
  let depth = 0

  for (let i = 0; i < valuesStr.length; i++) {
    const char = valuesStr[i]

    if (escaped) {
      currentValue += char
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      currentValue += char
      continue
    }

    if (!inString && (char === "'" || char === '"')) {
      inString = true
      stringChar = char
      continue
    }

    if (inString && char === stringChar) {
      inString = false
      continue
    }

    if (inString) {
      currentValue += char
      continue
    }

    if (char === '(') {
      depth++
      if (depth === 1) continue
    }

    if (char === ')') {
      depth--
      if (depth === 0) {
        current.push(currentValue.trim())
        currentValue = ''
        results.push(current)
        current = []
        continue
      }
    }

    if (char === ',' && depth === 1) {
      current.push(currentValue.trim())
      currentValue = ''
      continue
    }

    if (depth > 0) {
      currentValue += char
    }
  }

  return results
}

// Converte status do WordPress para enum
function convertStatus(wpStatus: string): PostStatus {
  switch (wpStatus) {
    case 'publish':
      return 'PUBLISHED'
    case 'draft':
    case 'auto-draft':
      return 'DRAFT'
    case 'trash':
    case 'private':
      return 'ARCHIVED'
    default:
      return 'DRAFT'
  }
}

// Converte data do WordPress
function parseWPDate(dateStr: string): Date | null {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') {
    return null
  }
  return new Date(dateStr)
}

// Remove tags HTML e limpa conteúdo
function cleanContent(content: string): string {
  return content
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

async function migrate() {
  console.log('🚀 Iniciando migração do WordPress para PostgreSQL...\n')

  const sqlPath = path.join(__dirname, '../backup-database/db_dom221839.sql')

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Arquivo SQL não encontrado:', sqlPath)
    process.exit(1)
  }

  // Estruturas para armazenar dados temporariamente
  const users = new Map<number, WPUser>()
  const terms = new Map<number, WPTerm>()
  const termTaxonomies = new Map<number, WPTermTaxonomy>()
  const termRelationships: WPTermRelationship[] = []
  const posts: WPPost[] = []

  console.log('📖 Lendo arquivo SQL...')

  const fileStream = fs.createReadStream(sqlPath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let currentTable = ''
  let lineBuffer = ''

  for await (const line of rl) {
    // Detecta tabela atual
    if (line.includes(`INSERT INTO \`${WP_PREFIX}users\``)) {
      currentTable = 'users'
      lineBuffer = line
    } else if (line.includes(`INSERT INTO \`${WP_PREFIX}terms\``)) {
      currentTable = 'terms'
      lineBuffer = line
    } else if (line.includes(`INSERT INTO \`${WP_PREFIX}term_taxonomy\``)) {
      currentTable = 'term_taxonomy'
      lineBuffer = line
    } else if (line.includes(`INSERT INTO \`${WP_PREFIX}term_relationships\``)) {
      currentTable = 'term_relationships'
      lineBuffer = line
    } else if (line.includes(`INSERT INTO \`${WP_PREFIX}posts\``)) {
      currentTable = 'posts'
      lineBuffer = line
    } else if (currentTable && !line.startsWith('--') && !line.startsWith('/*')) {
      lineBuffer += line
    }

    // Processa quando a linha termina com ;
    if (lineBuffer.endsWith(';')) {
      const values = parseInsertValues(lineBuffer)

      for (const row of values) {
        switch (currentTable) {
          case 'users':
            if (row.length >= 10) {
              users.set(parseInt(row[0]), {
                ID: parseInt(row[0]),
                user_email: row[4],
                display_name: row[9]
              })
            }
            break

          case 'terms':
            if (row.length >= 3) {
              terms.set(parseInt(row[0]), {
                term_id: parseInt(row[0]),
                name: cleanContent(row[1]),
                slug: row[2]
              })
            }
            break

          case 'term_taxonomy':
            if (row.length >= 5) {
              termTaxonomies.set(parseInt(row[0]), {
                term_taxonomy_id: parseInt(row[0]),
                term_id: parseInt(row[1]),
                taxonomy: row[2],
                description: cleanContent(row[3]),
                parent: parseInt(row[4])
              })
            }
            break

          case 'term_relationships':
            if (row.length >= 2) {
              termRelationships.push({
                object_id: parseInt(row[0]),
                term_taxonomy_id: parseInt(row[1])
              })
            }
            break

          case 'posts':
            if (row.length >= 20) {
              const postType = row[20]
              const postStatus = row[7]

              // Filtra apenas posts, pages e wiki
              if (['post', 'page', 'yada_wiki'].includes(postType) &&
                  ['publish', 'draft'].includes(postStatus)) {
                posts.push({
                  ID: parseInt(row[0]),
                  post_author: parseInt(row[1]),
                  post_date: row[2],
                  post_content: cleanContent(row[4]),
                  post_title: cleanContent(row[5]),
                  post_excerpt: cleanContent(row[6]),
                  post_status: postStatus,
                  post_name: row[11],
                  post_modified: row[14],
                  post_type: postType,
                  post_parent: parseInt(row[17])
                })
              }
            }
            break
        }
      }

      lineBuffer = ''
      currentTable = ''
    }
  }

  console.log(`\n📊 Dados extraídos:`)
  console.log(`   - Usuários: ${users.size}`)
  console.log(`   - Termos: ${terms.size}`)
  console.log(`   - Taxonomias: ${termTaxonomies.size}`)
  console.log(`   - Relacionamentos: ${termRelationships.length}`)
  console.log(`   - Posts/Wiki: ${posts.length}`)

  // Inicia transação de importação
  console.log('\n💾 Importando dados para PostgreSQL...\n')

  // 1. Criar usuário padrão
  console.log('👤 Criando usuários...')
  const defaultUser = await prisma.user.upsert({
    where: { email: 'admin@profamr.com.br' },
    update: {},
    create: {
      email: 'admin@profamr.com.br',
      displayName: 'Prof. AMR',
      bio: 'Advogado e Professor de Direito'
    }
  })

  for (const [wpId, user] of users) {
    try {
      await prisma.user.upsert({
        where: { email: user.user_email || `user${wpId}@imported.local` },
        update: {},
        create: {
          email: user.user_email || `user${wpId}@imported.local`,
          displayName: user.display_name || `Usuário ${wpId}`
        }
      })
    } catch (e) {
      // Ignora duplicatas
    }
  }

  // 2. Criar categorias
  console.log('📁 Criando categorias...')
  const categoryMap = new Map<number, number>() // wpTermId -> prismaId

  for (const [ttId, tt] of termTaxonomies) {
    if (tt.taxonomy === 'category') {
      const term = terms.get(tt.term_id)
      if (term) {
        try {
          const cat = await prisma.category.upsert({
            where: { wpTermId: term.term_id },
            update: { name: term.name, slug: term.slug },
            create: {
              name: term.name,
              slug: term.slug || `cat-${term.term_id}`,
              description: tt.description || null,
              wpTermId: term.term_id
            }
          })
          categoryMap.set(ttId, cat.id)
        } catch (e) {
          console.error(`   Erro ao criar categoria ${term.name}:`, e)
        }
      }
    }
  }

  // 3. Criar tags
  console.log('🏷️  Criando tags...')
  const tagMap = new Map<number, number>() // wpTermTaxonomyId -> prismaId

  for (const [ttId, tt] of termTaxonomies) {
    if (tt.taxonomy === 'post_tag') {
      const term = terms.get(tt.term_id)
      if (term) {
        try {
          const tag = await prisma.tag.upsert({
            where: { wpTermId: term.term_id },
            update: { name: term.name, slug: term.slug },
            create: {
              name: term.name,
              slug: term.slug || `tag-${term.term_id}`,
              wpTermId: term.term_id
            }
          })
          tagMap.set(ttId, tag.id)
        } catch (e) {
          console.error(`   Erro ao criar tag ${term.name}:`, e)
        }
      }
    }
  }

  // 4. Criar categorias Wiki
  console.log('📚 Criando categorias Wiki...')
  const wikiCategoryMap = new Map<number, number>()

  for (const [ttId, tt] of termTaxonomies) {
    if (tt.taxonomy === 'wiki_cats') {
      const term = terms.get(tt.term_id)
      if (term) {
        try {
          const wikiCat = await prisma.wikiCategory.upsert({
            where: { wpTermId: term.term_id },
            update: { name: term.name, slug: term.slug },
            create: {
              name: term.name,
              slug: term.slug || `wiki-cat-${term.term_id}`,
              description: tt.description || null,
              wpTermId: term.term_id
            }
          })
          wikiCategoryMap.set(ttId, wikiCat.id)
        } catch (e) {
          console.error(`   Erro ao criar categoria Wiki ${term.name}:`, e)
        }
      }
    }
  }

  // 5. Criar posts do blog
  console.log('📝 Importando posts do blog...')
  let blogCount = 0
  let wikiCount = 0

  for (const post of posts) {
    if (post.post_type === 'post') {
      try {
        const publishedAt = parseWPDate(post.post_date)
        const slug = post.post_name || `post-${post.ID}`

        const createdPost = await prisma.post.upsert({
          where: { wpId: post.ID },
          update: {
            title: post.post_title,
            content: post.post_content,
            excerpt: post.post_excerpt || null,
            status: convertStatus(post.post_status),
            publishedAt
          },
          create: {
            title: post.post_title || 'Sem título',
            slug: slug,
            content: post.post_content,
            excerpt: post.post_excerpt || null,
            status: convertStatus(post.post_status),
            publishedAt,
            authorId: defaultUser.id,
            wpId: post.ID
          }
        })

        // Relacionar categorias e tags
        for (const rel of termRelationships) {
          if (rel.object_id === post.ID) {
            const catId = categoryMap.get(rel.term_taxonomy_id)
            const tagId = tagMap.get(rel.term_taxonomy_id)

            if (catId) {
              try {
                await prisma.categoriesOnPosts.upsert({
                  where: {
                    postId_categoryId: { postId: createdPost.id, categoryId: catId }
                  },
                  update: {},
                  create: { postId: createdPost.id, categoryId: catId }
                })
              } catch (e) { /* Ignora duplicatas */ }
            }

            if (tagId) {
              try {
                await prisma.tagsOnPosts.upsert({
                  where: {
                    postId_tagId: { postId: createdPost.id, tagId: tagId }
                  },
                  update: {},
                  create: { postId: createdPost.id, tagId: tagId }
                })
              } catch (e) { /* Ignora duplicatas */ }
            }
          }
        }

        blogCount++
      } catch (e) {
        console.error(`   Erro ao importar post ${post.ID}:`, e)
      }
    }
  }

  // 6. Criar artigos Wiki
  console.log('📖 Importando artigos Wiki...')

  for (const post of posts) {
    if (post.post_type === 'yada_wiki') {
      try {
        const publishedAt = parseWPDate(post.post_date)
        const slug = post.post_name || `wiki-${post.ID}`

        // Encontra categoria wiki
        let wikiCategoryId: number | null = null
        for (const rel of termRelationships) {
          if (rel.object_id === post.ID) {
            const catId = wikiCategoryMap.get(rel.term_taxonomy_id)
            if (catId) {
              wikiCategoryId = catId
              break
            }
          }
        }

        await prisma.wikiArticle.upsert({
          where: { wpId: post.ID },
          update: {
            title: post.post_title,
            content: post.post_content,
            summary: post.post_excerpt || null,
            status: convertStatus(post.post_status),
            publishedAt
          },
          create: {
            title: post.post_title || 'Sem título',
            slug: slug,
            content: post.post_content,
            summary: post.post_excerpt || null,
            status: convertStatus(post.post_status),
            publishedAt,
            authorId: defaultUser.id,
            categoryId: wikiCategoryId,
            wpId: post.ID
          }
        })

        wikiCount++
      } catch (e) {
        console.error(`   Erro ao importar wiki ${post.ID}:`, e)
      }
    }
  }

  // 7. Criar configurações padrão do site
  console.log('⚙️  Configurando site...')
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      siteName: 'Prof. AMR - Direito & Artigos',
      siteTagline: 'Conhecimento jurídico acessível e atualizado',
      aboutText: 'Blog especializado em direito, com artigos, análises e uma wiki jurídica completa.'
    }
  })

  console.log('\n✅ Migração concluída!')
  console.log(`   - ${blogCount} posts do blog importados`)
  console.log(`   - ${wikiCount} artigos wiki importados`)
  console.log(`   - ${categoryMap.size} categorias criadas`)
  console.log(`   - ${tagMap.size} tags criadas`)
  console.log(`   - ${wikiCategoryMap.size} categorias wiki criadas`)
}

migrate()
  .catch((e) => {
    console.error('❌ Erro na migração:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
