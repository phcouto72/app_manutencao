import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const emailAdmin = process.env.SEED_ADMIN_EMAIL || "admin@empresa.com.br";
  const senhaAdmin = process.env.SEED_ADMIN_SENHA || "TrocarSenha123!";

  const senhaHash = await bcrypt.hash(senhaAdmin, 10);

  const admin = await prisma.usuario.upsert({
    where: { email: emailAdmin },
    update: {},
    create: {
      nome: "Administrador",
      email: emailAdmin,
      senhaHash,
      papel: "ADMIN",
    },
  });

  await prisma.local.upsert({
    where: { id: "local-sede" },
    update: {},
    create: {
      id: "local-sede",
      nome: "Sede",
      descricao: "Local padrão inicial — edite ou crie novos locais conforme a estrutura da empresa.",
    },
  });

  console.log("Usuário administrador criado/atualizado:");
  console.log(`  E-mail: ${admin.email}`);
  console.log(`  Senha inicial: ${senhaAdmin} (troque assim que fizer o primeiro login)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
