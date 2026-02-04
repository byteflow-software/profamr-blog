import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@profamr.com.br";
  const newPassword = "Admin@123";

  // Hash the new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // Update user password
  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  console.log("Senha resetada com sucesso!");
  console.log("Email:", email);
  console.log("Nova senha:", newPassword);
  console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
}

main()
  .catch((e) => {
    console.error("Erro ao resetar senha:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
