import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";

export const dynamic = "force-dynamic";

const frequenciaTexto: Record<string, string> = {
  DIAS: "dia(s)",
  SEMANAS: "semana(s)",
  MESES: "mês(es)",
  HORAS_USO: "hora(s) de uso",
};

export default async function PlanosPreventivosPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarAgendamentos(papel);

  const planos = await prisma.planoPreventivo.findMany({
    include: { equipamento: true, agendamentos: { orderBy: { dataPrevista: "desc" }, take: 1 } },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">PREVENTIVAS</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Planos de Manutenção Preventiva</h1>
        </div>
        {podeGerenciar && (
          <Link href="/planos-preventivos/novo" className="btn-primary">
            + Novo plano
          </Link>
        )}
      </div>

      {planos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhum plano preventivo cadastrado ainda.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Equipamento</th>
                <th className="px-4 py-3 font-medium">Frequência</th>
                <th className="px-4 py-3 font-medium">Próximo agendamento</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {planos.map((p) => (
                <tr key={p.id} className="border-b border-base-800">
                  <td className="px-4 py-3">{p.titulo}</td>
                  <td className="px-4 py-3 text-base-400">{p.equipamento.nome}</td>
                  <td className="px-4 py-3 text-base-400">
                    A cada {p.frequenciaValor} {frequenciaTexto[p.frequenciaTipo]}
                  </td>
                  <td className="px-4 py-3 text-base-400">
                    {p.agendamentos[0]
                      ? new Intl.DateTimeFormat("pt-BR").format(new Date(p.agendamentos[0].dataPrevista))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {p.ativo ? (
                      <span className="text-ok">Ativo</span>
                    ) : (
                      <span className="text-base-500">Inativo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
