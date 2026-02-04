import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@profamr.com.br";
  const password = "Admin@123"; // Senha temporária - deve ser alterada após o primeiro login
  const displayName = "Administrador";

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("Usuário admin já existe:", email);
    return;
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: "ADMIN",
    },
  });

  console.log("Usuário admin criado com sucesso!");
  console.log("Email:", email);
  console.log("Senha:", password);
  console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
}

main()
  .catch((e) => {
    console.error("Erro ao criar usuário:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
