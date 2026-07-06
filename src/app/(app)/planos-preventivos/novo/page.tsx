import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";
import NovoPlanoPreventivoForm from "../NovoPlanoPreventivoForm";

export default async function NovoPlanoPreventivoPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarAgendamentos(papel)) redirect("/planos-preventivos");

  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">PREVENTIVAS</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo plano preventivo</h1>
      <div className="card p-6 max-w-2xl">
        <NovoPlanoPreventivoForm equipamentos={equipamentos} />
      </div>
    </div>
  );
}
