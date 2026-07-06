import { prisma } from "@/lib/prisma";

export async function getEmpresaConfig() {
  return prisma.empresaConfig.upsert({
    where: { id: "empresa-config" },
    update: {},
    create: { id: "empresa-config" },
  });
}
