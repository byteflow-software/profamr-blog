import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Listar todos os usuários
  const users = await prisma.user.findMany({
    select: { id: true, email: true, displayName: true, role: true },
  });

  console.log("Usuários cadastrados:");
  users.forEach((u) => {
    console.log(`   - [${u.id}] ${u.email} (${u.displayName}) - ${u.role}`);
  });

  // Listar mapeamentos Clerk
  const mappings = await prisma.clerkUserMapping.findMany({
    include: { user: { select: { email: true } } },
  });

  console.log("\nMapeamentos Clerk:");
  if (mappings.length === 0) {
    console.log("   Nenhum mapeamento encontrado.");
  } else {
    mappings.forEach((m) => {
      console.log(`   - ${m.user.email} -> ${m.clerkUserId}`);
    });
  }
}

main()
  .catch((e) => {
    console.error("Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
