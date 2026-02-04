import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@profamr.com.br";
  const testPassword = "Admin@123";

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("❌ Usuário NÃO encontrado!");
    return;
  }

  console.log("✅ Usuário encontrado:");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Nome:", user.displayName);
  console.log("   Role:", user.role);
  console.log("   Tentativas falhas:", user.failedAttempts);
  console.log("   Bloqueado até:", user.lockedUntil);
  console.log("   Tem senha:", !!user.passwordHash);
  console.log("   Hash da senha:", user.passwordHash?.substring(0, 20) + "...");

  // Testar senha
  if (user.passwordHash) {
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log("\n🔐 Teste de senha:");
    console.log("   Senha testada:", testPassword);
    console.log("   Resultado:", isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA");
  }

  // Verificar últimos logs de login
  const logs = await prisma.loginLog.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  console.log("\n📋 Últimos logs de login:");
  logs.forEach((log, i) => {
    console.log(
      `   ${i + 1}. ${log.success ? "✅" : "❌"} ${log.createdAt.toISOString()} - ${log.reason || "success"}`,
    );
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
