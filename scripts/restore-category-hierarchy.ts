/**
 * Script para restaurar hierarquia de categorias a partir do backup WordPress
 *
 * Lê o dump SQL do WordPress e atualiza os parentId das categorias
 * e wiki categorias existentes no banco PostgreSQL.
 *
 * Uso: npx tsx scripts/restore-category-hierarchy.ts
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

const prisma = new PrismaClient()
const WP_PREFIX = 'wp_0ff490e234_'

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

// Parser para extrair valores de INSERT statements
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

function cleanContent(content: string): string {
  return content
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

async function main() {
  console.log('=== Restaurar Hierarquia de Categorias do WordPress ===\n')

  const sqlPath = path.join(__dirname, '../backup-database/db_dom221839.sql')

  if (!fs.existsSync(sqlPath)) {
    console.error('Arquivo SQL nao encontrado:', sqlPath)
    process.exit(1)
  }

  // 1. Ler dados do WordPress
  const terms = new Map<number, WPTerm>()
  const termTaxonomies = new Map<number, WPTermTaxonomy>()

  console.log('Lendo arquivo SQL...')

  const fileStream = fs.createReadStream(sqlPath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  })

  let currentTable = ''
  let lineBuffer = ''

  for await (const line of rl) {
    if (line.includes(`INSERT INTO \`${WP_PREFIX}terms\``)) {
      currentTable = 'terms'
      lineBuffer = line
    } else if (line.includes(`INSERT INTO \`${WP_PREFIX}term_taxonomy\``)) {
      currentTable = 'term_taxonomy'
      lineBuffer = line
    } else if (currentTable && !line.startsWith('--') && !line.startsWith('/*')) {
      lineBuffer += line
    }

    if (lineBuffer.endsWith(';')) {
      const values = parseInsertValues(lineBuffer)

      for (const row of values) {
        switch (currentTable) {
          case 'terms':
            if (row.length >= 3) {
              terms.set(parseInt(row[0]), {
                term_id: parseInt(row[0]),
                name: cleanContent(row[1]),
                slug: row[2],
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
                parent: parseInt(row[4]),
              })
            }
            break
        }
      }

      lineBuffer = ''
      currentTable = ''
    }
  }

  console.log(`Termos encontrados: ${terms.size}`)
  console.log(`Taxonomias encontradas: ${termTaxonomies.size}\n`)

  // 2. Mapear hierarquia de categorias do blog
  console.log('--- Categorias do Blog ---\n')

  const blogCategories: { wpTermId: number; name: string; wpParentTermId: number }[] = []

  for (const [, tt] of termTaxonomies) {
    if (tt.taxonomy === 'category') {
      const term = terms.get(tt.term_id)
      if (term) {
        blogCategories.push({
          wpTermId: term.term_id,
          name: term.name,
          wpParentTermId: tt.parent,
        })
      }
    }
  }

  // Buscar categorias existentes no banco
  const existingCategories = await prisma.category.findMany({
    select: { id: true, name: true, wpTermId: true, parentId: true },
  })

  const catByWpTermId = new Map(
    existingCategories.filter((c) => c.wpTermId).map((c) => [c.wpTermId!, c])
  )

  let blogUpdates = 0
  for (const wpCat of blogCategories) {
    if (wpCat.wpParentTermId === 0) continue // Sem pai no WordPress

    const dbCat = catByWpTermId.get(wpCat.wpTermId)
    if (!dbCat) continue

    // Encontrar o term_id do pai
    // O parent no term_taxonomy é o term_id do pai
    const parentDbCat = catByWpTermId.get(wpCat.wpParentTermId)
    if (!parentDbCat) {
      console.log(`  Aviso: Pai WP term_id=${wpCat.wpParentTermId} nao encontrado para "${wpCat.name}"`)
      continue
    }

    if (dbCat.parentId !== parentDbCat.id) {
      console.log(`  ${wpCat.name} -> filho de ${parentDbCat.name}`)
      await prisma.category.update({
        where: { id: dbCat.id },
        data: { parentId: parentDbCat.id },
      })
      blogUpdates++
    }
  }

  console.log(`\n${blogUpdates} categorias do blog atualizadas.\n`)

  // 3. Mapear hierarquia de categorias Wiki
  console.log('--- Categorias da Wiki ---\n')

  const wikiCategories: { wpTermId: number; name: string; wpParentTermId: number }[] = []

  for (const [, tt] of termTaxonomies) {
    if (tt.taxonomy === 'wiki_cats') {
      const term = terms.get(tt.term_id)
      if (term) {
        wikiCategories.push({
          wpTermId: term.term_id,
          name: term.name,
          wpParentTermId: tt.parent,
        })
      }
    }
  }

  const existingWikiCategories = await prisma.wikiCategory.findMany({
    select: { id: true, name: true, wpTermId: true, parentId: true },
  })

  const wikiCatByWpTermId = new Map(
    existingWikiCategories.filter((c) => c.wpTermId).map((c) => [c.wpTermId!, c])
  )

  let wikiUpdates = 0
  for (const wpCat of wikiCategories) {
    if (wpCat.wpParentTermId === 0) continue

    const dbCat = wikiCatByWpTermId.get(wpCat.wpTermId)
    if (!dbCat) continue

    const parentDbCat = wikiCatByWpTermId.get(wpCat.wpParentTermId)
    if (!parentDbCat) {
      console.log(`  Aviso: Pai WP term_id=${wpCat.wpParentTermId} nao encontrado para "${wpCat.name}"`)
      continue
    }

    if (dbCat.parentId !== parentDbCat.id) {
      console.log(`  ${wpCat.name} -> filho de ${parentDbCat.name}`)
      await prisma.wikiCategory.update({
        where: { id: dbCat.id },
        data: { parentId: parentDbCat.id },
      })
      wikiUpdates++
    }
  }

  console.log(`\n${wikiUpdates} categorias wiki atualizadas.\n`)

  // 4. Mostrar estrutura final
  console.log('=== Estrutura Final ===\n')

  console.log('Categorias do Blog:')
  const allCats = await prisma.category.findMany({ orderBy: { name: 'asc' } })
  const printTree = (items: typeof allCats, parentId: number | null, depth: number) => {
    const children = items.filter((c) => c.parentId === parentId)
    for (const c of children) {
      console.log(`${'  '.repeat(depth)}${depth > 0 ? '└─ ' : ''}${c.name}`)
      printTree(items, c.id, depth + 1)
    }
  }
  printTree(allCats, null, 0)

  console.log('\nCategorias da Wiki:')
  const allWikiCats = await prisma.wikiCategory.findMany({ orderBy: { order: 'asc' } })
  const printWikiTree = (items: typeof allWikiCats, parentId: number | null, depth: number) => {
    const children = items.filter((c) => c.parentId === parentId)
    for (const c of children) {
      console.log(`${'  '.repeat(depth)}${depth > 0 ? '└─ ' : ''}${c.icon || ''} ${c.name}`)
      printWikiTree(items, c.id, depth + 1)
    }
  }
  printWikiTree(allWikiCats, null, 0)

  console.log('\nConcluido!')
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
