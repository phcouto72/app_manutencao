import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

export const dynamic = "force-dynamic";

const statusInfo: Record<string, { texto: string; cor: string }> = {
  ABERTA: { texto: "Aberta", cor: "text-info" },
  EM_ANDAMENTO: { texto: "Em andamento", cor: "text-warn" },
  AGUARDANDO_PECA: { texto: "Aguardando peça", cor: "text-signal" },
  CONCLUIDA: { texto: "Concluída", cor: "text-ok" },
  CANCELADA: { texto: "Cancelada", cor: "text-base-500" },
};

const tipoTexto: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  PREDITIVA: "Preditiva",
};

export default async function ManutencoesPage({
  searchParams,
}: {
  searchParams: { status?: string; tipo?: string };
}) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarManutencoes(papel);

  const manutencoes = await prisma.manutencao.findMany({
    where: {
      status: (searchParams.status as any) || undefined,
      tipo: (searchParams.tipo as any) || undefined,
    },
    include: { equipamento: true, local: true, responsavel: true },
    orderBy: { dataAbertura: "desc" },
  });

  function linkFiltro(params: Record<string, string | undefined>) {
    const novo = new URLSearchParams();
    if (params.status ?? searchParams.status) novo.set("status", (params.status ?? searchParams.status)!);
    if (params.tipo ?? searchParams.tipo) novo.set("tipo", (params.tipo ?? searchParams.tipo)!);
    if ("status" in params && !params.status) novo.delete("status");
    if ("tipo" in params && !params.tipo) novo.delete("tipo");
    const texto = novo.toString();
    return texto ? `/manutencoes?${texto}` : "/manutencoes";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">MANUTENÇÃO</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Ordens de Serviço</h1>
        </div>
        {podeGerenciar && (
          <Link href="/manutencoes/nova" className="btn-primary">
            + Nova OS
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 text-xs">
        {[
          { label: "Todas", status: undefined },
          { label: "Abertas", status: "ABERTA" },
          { label: "Em andamento", status: "EM_ANDAMENTO" },
          { label: "Aguardando peça", status: "AGUARDANDO_PECA" },
          { label: "Concluídas", status: "CONCLUIDA" },
        ].map((f) => (
          <Link
            key={f.label}
            href={linkFiltro({ status: f.status })}
            className={`px-3 py-1.5 rounded border ${
              searchParams.status === f.status || (!searchParams.status && !f.status)
                ? "border-signal text-signal bg-base-800"
                : "border-base-700 text-base-400 hover:text-base-100"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {manutencoes.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhuma ordem de serviço encontrada com esse filtro.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">OS</th>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Equipamento / Local</th>
                <th className="px-4 py-3 font-medium">Responsável</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aberta em</th>
              </tr>
            </thead>
            <tbody>
              {manutencoes.map((m) => (
                <tr key={m.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3 font-mono text-xs text-base-400">
                    #{String(m.numeroOS).padStart(4, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/manutencoes/${m.id}`} className="hover:text-signal">
                      {m.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-base-400">{tipoTexto[m.tipo]}</td>
                  <td className="px-4 py-3 text-base-400">
                    {m.equipamento?.nome ?? m.local?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-base-400">{m.responsavel?.nome ?? "—"}</td>
                  <td className={`px-4 py-3 font-medium ${statusInfo[m.status].cor}`}>
                    {statusInfo[m.status].texto}
                  </td>
                  <td className="px-4 py-3 text-base-400">
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(m.dataAbertura))}
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
