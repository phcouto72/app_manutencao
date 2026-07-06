import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";
import NovoAgendamentoForm from "../NovoAgendamentoForm";

export default async function NovoAgendamentoPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarAgendamentos(papel)) redirect("/agendamentos");

  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">PREVENTIVAS</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo agendamento avulso</h1>
      <div className="card p-6 max-w-2xl">
        <NovoAgendamentoForm equipamentos={equipamentos} />
      </div>
    </div>
  );
}
