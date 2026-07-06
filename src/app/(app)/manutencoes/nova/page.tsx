import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";
import NovaManutencaoForm from "../NovaManutencaoForm";

export default async function NovaManutencaoPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) redirect("/manutencoes");

  const [equipamentos, locais, usuarios] = await Promise.all([
    prisma.equipamento.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.local.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
  ]);

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">MANUTENÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Nova Ordem de Serviço</h1>
      <div className="card p-6 max-w-3xl">
        <NovaManutencaoForm equipamentos={equipamentos} locais={locais} usuarios={usuarios} />
      </div>
    </div>
  );
}
