import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";
import AcoesAgendamento from "./AcoesAgendamento";

export const dynamic = "force-dynamic";

const statusInfo: Record<string, { texto: string; cor: string }> = {
  PENDENTE: { texto: "Pendente", cor: "text-base-400" },
  NOTIFICADO: { texto: "Notificado", cor: "text-info" },
  CONCLUIDO: { texto: "Concluído", cor: "text-ok" },
  CANCELADO: { texto: "Cancelado", cor: "text-base-500" },
};

export default async function AgendamentosPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarAgendamentos(papel);

  const agendamentos = await prisma.agendamento.findMany({
    include: { equipamento: true, planoPreventivo: true },
    orderBy: { dataPrevista: "asc" },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">PREVENTIVAS</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Agendamentos</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/planos-preventivos" className="btn-secondary">
            Ver planos preventivos
          </Link>
          {podeGerenciar && (
            <Link href="/agendamentos/novo" className="btn-primary">
              + Agendamento avulso
            </Link>
          )}
        </div>
      </div>

      {agendamentos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhum agendamento cadastrado ainda.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Data prevista</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {podeGerenciar && <th className="px-4 py-3 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {agendamentos.map((a) => {
                const vencido = new Date(a.dataPrevista) < hoje && a.status !== "CONCLUIDO" && a.status !== "CANCELADO";
                return (
                  <tr key={a.id} className="border-b border-base-800">
                    <td className="px-4 py-3">
                      {a.titulo}
                      {a.planoPreventivo && (
                        <span className="text-base-500 text-xs ml-2">(plano recorrente)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-base-400">{a.equipamento?.nome ?? "—"}</td>
                    <td className={`px-4 py-3 font-medium ${vencido ? "text-danger" : "text-base-100"}`}>
                      {new Intl.DateTimeFormat("pt-BR").format(new Date(a.dataPrevista))}
                      {vencido && " · vencido"}
                    </td>
                    <td className={`px-4 py-3 ${statusInfo[a.status].cor}`}>{statusInfo[a.status].texto}</td>
                    {podeGerenciar && (
                      <td className="px-4 py-3">
                        <AcoesAgendamento id={a.id} status={a.status} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
