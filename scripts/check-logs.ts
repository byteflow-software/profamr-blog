import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.loginLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log("📋 Últimos 10 logs de login:\n");
  logs.forEach((log, i) => {
    console.log(`${i + 1}. ${log.success ? "✅" : "❌"} Email: "${log.email}"`);
    console.log(`   Motivo: ${log.reason || "success"}`);
    console.log(`   Data: ${log.createdAt.toISOString()}`);
    console.log("");
  });

  // Listar todos os usuários
  const users = await prisma.user.findMany({
    select: { email: true, displayName: true, role: true },
  });

  console.log("\n👥 Usuários cadastrados:");
  users.forEach((u) => {
    console.log(`   - ${u.email} (${u.displayName}) - ${u.role}`);
  });
}

main()
  .catch((e) => {
    console.error("Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
