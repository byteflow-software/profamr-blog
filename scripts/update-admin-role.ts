import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: "admin@profamr.com.br" },
    data: { role: "ADMIN" },
  });

  console.log("✅ Role atualizado com sucesso!");
  console.log("   Email:", user.email);
  console.log("   Role:", user.role);
}

main()
  .catch((e) => {
    console.error("Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
