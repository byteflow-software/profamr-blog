/**
 * Script para reorganizar categorias existentes em hierarquia
 *
 * Uso:
 *   npx tsx scripts/reorganize-categories.ts
 *
 * Este script permite:
 * 1. Visualizar a estrutura atual de categorias
 * 2. Definir regras de aninhamento baseadas em padrões de nome
 * 3. Aplicar as mudanças no banco de dados
 */

import { PrismaClient } from '@prisma/client'
import * as readline from 'readline'

const prisma = new PrismaClient()

interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  _count: { posts: number }
}

// Helper para criar interface de leitura
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
}

// Helper para perguntar ao usuário
function ask(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// Exibir categorias em formato de árvore
function displayTree(categories: Category[], parentId: number | null = null, depth: number = 0): void {
  const children = categories.filter((c) => c.parentId === parentId)
  children.sort((a, b) => a.name.localeCompare(b.name))

  for (const cat of children) {
    const indent = '  '.repeat(depth)
    const prefix = depth > 0 ? '└─ ' : ''
    console.log(`${indent}${prefix}${cat.name} (${cat._count.posts} posts) [id: ${cat.id}]`)
    displayTree(categories, cat.id, depth + 1)
  }
}

// Verificar se há referência circular
function hasCircularReference(
  categoryId: number,
  newParentId: number,
  categories: Category[]
): boolean {
  if (categoryId === newParentId) return true

  let currentId: number | null = newParentId
  const visited = new Set<number>()

  while (currentId !== null) {
    if (visited.has(currentId)) return true
    if (currentId === categoryId) return true
    visited.add(currentId)

    const parent = categories.find((c) => c.id === currentId)
    currentId = parent?.parentId ?? null
  }

  return false
}

// Aplicar regras de aninhamento baseadas em padrões
interface NestingRule {
  parentName: string
  childPattern: RegExp
}

function applyNestingRules(categories: Category[], rules: NestingRule[]): Map<number, number> {
  const updates = new Map<number, number>() // categoryId -> newParentId

  for (const rule of rules) {
    const parent = categories.find(
      (c) => c.name.toLowerCase() === rule.parentName.toLowerCase()
    )
    if (!parent) {
      console.log(`  Aviso: Categoria pai "${rule.parentName}" não encontrada`)
      continue
    }

    for (const cat of categories) {
      if (cat.id === parent.id) continue
      if (cat.parentId !== null) continue // Já tem pai

      if (rule.childPattern.test(cat.name)) {
        if (!hasCircularReference(cat.id, parent.id, categories)) {
          updates.set(cat.id, parent.id)
          console.log(`  ${cat.name} -> filho de ${parent.name}`)
        }
      }
    }
  }

  return updates
}

// Menu principal
async function main() {
  console.log('\n=== Reorganizador de Categorias ===\n')

  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
  })

  console.log(`Total de categorias: ${categories.length}\n`)
  console.log('Estrutura atual:\n')
  displayTree(categories)

  const rl = createReadlineInterface()

  console.log('\n\nOpções:')
  console.log('1. Definir regras de aninhamento por padrão')
  console.log('2. Aninhar categoria específica')
  console.log('3. Mover categoria para raiz')
  console.log('4. Mostrar estrutura atual')
  console.log('5. Sair')

  let running = true

  while (running) {
    const choice = await ask(rl, '\nEscolha uma opção (1-5): ')

    switch (choice) {
      case '1': {
        console.log('\nDefinir regras de aninhamento:')
        console.log('Formato: NomePai:padrão (ex: "Direito Civil:civil" para aninhar categorias que contêm "civil")')
        console.log('Digite "fim" para parar de adicionar regras\n')

        const rules: NestingRule[] = []

        while (true) {
          const ruleInput = await ask(rl, 'Regra (ou "fim"): ')
          if (ruleInput.toLowerCase() === 'fim') break

          const [parentName, pattern] = ruleInput.split(':')
          if (!parentName || !pattern) {
            console.log('Formato inválido. Use NomePai:padrão')
            continue
          }

          rules.push({
            parentName: parentName.trim(),
            childPattern: new RegExp(pattern.trim(), 'i'),
          })
          console.log(`Regra adicionada: "${parentName}" será pai de categorias que contêm "${pattern}"`)
        }

        if (rules.length > 0) {
          console.log('\nAplicando regras...\n')
          const updates = applyNestingRules(categories, rules)

          if (updates.size > 0) {
            const confirm = await ask(rl, `\n${updates.size} categorias serão atualizadas. Confirmar? (s/n): `)
            if (confirm.toLowerCase() === 's') {
              for (const [categoryId, parentId] of updates) {
                await prisma.category.update({
                  where: { id: categoryId },
                  data: { parentId },
                })
                // Atualizar localmente também
                const cat = categories.find((c) => c.id === categoryId)
                if (cat) cat.parentId = parentId
              }
              console.log('Categorias atualizadas com sucesso!')
            } else {
              console.log('Operação cancelada.')
            }
          } else {
            console.log('Nenhuma categoria corresponde às regras.')
          }
        }
        break
      }

      case '2': {
        const childId = parseInt(await ask(rl, 'ID da categoria a mover: '))
        const parentId = parseInt(await ask(rl, 'ID da categoria pai: '))

        const child = categories.find((c) => c.id === childId)
        const parent = categories.find((c) => c.id === parentId)

        if (!child) {
          console.log('Categoria filha não encontrada.')
          break
        }
        if (!parent) {
          console.log('Categoria pai não encontrada.')
          break
        }
        if (hasCircularReference(childId, parentId, categories)) {
          console.log('Erro: Isso criaria uma referência circular.')
          break
        }

        const confirm = await ask(rl, `Mover "${child.name}" para dentro de "${parent.name}"? (s/n): `)
        if (confirm.toLowerCase() === 's') {
          await prisma.category.update({
            where: { id: childId },
            data: { parentId },
          })
          child.parentId = parentId
          console.log('Categoria movida com sucesso!')
        }
        break
      }

      case '3': {
        const catId = parseInt(await ask(rl, 'ID da categoria a mover para raiz: '))
        const cat = categories.find((c) => c.id === catId)

        if (!cat) {
          console.log('Categoria não encontrada.')
          break
        }
        if (cat.parentId === null) {
          console.log('Categoria já está na raiz.')
          break
        }

        const confirm = await ask(rl, `Mover "${cat.name}" para a raiz? (s/n): `)
        if (confirm.toLowerCase() === 's') {
          await prisma.category.update({
            where: { id: catId },
            data: { parentId: null },
          })
          cat.parentId = null
          console.log('Categoria movida para a raiz!')
        }
        break
      }

      case '4': {
        console.log('\nEstrutura atual:\n')
        displayTree(categories)
        break
      }

      case '5': {
        running = false
        console.log('\nAté logo!')
        break
      }

      default:
        console.log('Opção inválida.')
    }
  }

  rl.close()
}

main()
  .catch((e) => {
    console.error('Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
