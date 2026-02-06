import { createClerkClient } from '@clerk/backend'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

async function migrateUsers() {
  console.log('Iniciando migração de usuários para Clerk...\n')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
    },
  })

  console.log(`Encontrados ${users.length} usuário(s) no banco local.\n`)

  let mapped = 0
  let created = 0
  let errors = 0

  for (const user of users) {
    // Verifica se já existe mapeamento
    const existingMapping = await prisma.clerkUserMapping.findUnique({
      where: { userId: user.id },
    })

    if (existingMapping) {
      console.log(`[OK] ${user.email} já mapeado → ${existingMapping.clerkUserId}`)
      mapped++
      continue
    }

    // Busca usuário no Clerk por email
    const clerkUsers = await clerk.users.getUserList({
      emailAddress: [user.email],
    })

    let clerkUserId: string

    if (clerkUsers.data.length > 0) {
      clerkUserId = clerkUsers.data[0].id
      console.log(`[ENCONTRADO] ${user.email} já existe no Clerk → ${clerkUserId}`)
    } else {
      // Cria o usuário no Clerk automaticamente
      try {
        const nameParts = user.displayName.split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || undefined

        const newClerkUser = await clerk.users.createUser({
          emailAddress: [user.email],
          firstName,
          lastName,
          skipPasswordRequirement: true,
        })

        clerkUserId = newClerkUser.id
        console.log(`[CRIADO] ${user.email} (${user.role}) → ${clerkUserId}`)
        created++
      } catch (err: any) {
        console.error(`[ERRO] Falha ao criar ${user.email} no Clerk: ${err.message || err}`)
        errors++
        continue
      }
    }

    // Cria o mapeamento no banco local
    await prisma.clerkUserMapping.create({
      data: {
        clerkUserId,
        userId: user.id,
      },
    })

    mapped++
  }

  console.log(`\nResultado:`)
  console.log(`  Mapeados: ${mapped}`)
  console.log(`  Criados no Clerk: ${created}`)
  if (errors > 0) {
    console.log(`  Erros: ${errors}`)
  }

  console.log(`\nNota: Os usuários criados no Clerk precisam definir senha.`)
  console.log(`Envie um convite ou reset de senha pelo Clerk Dashboard.`)

  await prisma.$disconnect()
}

migrateUsers().catch((error) => {
  console.error('Erro durante migração:', error)
  prisma.$disconnect()
  process.exit(1)
})
