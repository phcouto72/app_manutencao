import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buscarDadosRelatorio, FiltrosRelatorio } from "@/lib/relatorios";

export const dynamic = "force-dynamic";

const tipoTexto: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  PREDITIVA: "Preditiva",
};

const statusTexto: Record<string, string> = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_PECA: "Aguardando peça",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: FiltrosRelatorio;
}) {
  const [equipamentos, locais] = await Promise.all([
    prisma.equipamento.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
    prisma.local.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  const dados = await buscarDadosRelatorio(searchParams);

  const querystring = new URLSearchParams(
    Object.entries(searchParams).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">RELATÓRIOS</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">
            Relatório de Manutenções
          </h1>
        </div>
        <Link
          href={`/relatorios-imprimir${querystring ? `?${querystring}` : ""}`}
          target="_blank"
          className="btn-primary"
        >
          Abrir para impressão / PDF
        </Link>
      </div>

      <form method="GET" className="card p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="label-field">De</label>
          <input
            type="date"
            name="dataInicio"
            defaultValue={searchParams.dataInicio}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">Até</label>
          <input
            type="date"
            name="dataFim"
            defaultValue={searchParams.dataFim}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-field">Equipamento</label>
          <select name="equipamentoId" defaultValue={searchParams.equipamentoId} className="input-field">
            <option value="">Todos</option>
            {equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Local</label>
          <select name="localId" defaultValue={searchParams.localId} className="input-field">
            <option value="">Todos</option>
            {locais.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Tipo</label>
          <select name="tipo" defaultValue={searchParams.tipo} className="input-field">
            <option value="">Todos</option>
            <option value="PREVENTIVA">Preventiva</option>
            <option value="CORRETIVA">Corretiva</option>
            <option value="PREDITIVA">Preditiva</option>
          </select>
        </div>
        <div>
          <label className="label-field">Status</label>
          <select name="status" defaultValue={searchParams.status} className="input-field">
            <option value="">Todos</option>
            <option value="ABERTA">Aberta</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="AGUARDANDO_PECA">Aguardando peça</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
        <div className="flex items-end gap-3">
          <button type="submit" className="btn-primary">
            Filtrar
          </button>
          <Link href="/relatorios" className="btn-secondary">
            Limpar
          </Link>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <p className="font-display text-4xl font-semibold">{dados.totalOS}</p>
          <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">Ordens de serviço</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-2xl font-semibold">{formatarMoeda(dados.custoTotal)}</p>
          <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">Custo total (peças + mão de obra)</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-4xl font-semibold">
            {dados.mttrHoras !== null ? dados.mttrHoras.toFixed(1) : "—"}
          </p>
          <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">MTTR médio (horas)</p>
        </div>
        <div className="card p-5">
          <p className="font-display text-4xl font-semibold">{dados.porStatus.CONCLUIDA ?? 0}</p>
          <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">Concluídas no período</p>
        </div>
      </div>

      {(dados.mtbfDias !== null || dados.disponibilidadePercentual !== null) && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {dados.mtbfDias !== null && (
            <div className="card p-5">
              <p className="font-display text-4xl font-semibold">{dados.mtbfDias.toFixed(1)}</p>
              <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">
                MTBF (dias entre falhas)
              </p>
            </div>
          )}
          {dados.disponibilidadePercentual !== null && (
            <div className="card p-5">
              <p className="font-display text-4xl font-semibold">
                {dados.disponibilidadePercentual.toFixed(1)}%
              </p>
              <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">
                Disponibilidade no período
              </p>
            </div>
          )}
        </div>
      )}

      {dados.rankingEquipamentos.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-display text-lg font-semibold tracking-wide mb-3">
            Equipamentos com mais manutenções
          </h2>
          <ul className="space-y-2 text-sm">
            {dados.rankingEquipamentos.map((eq, i) => (
              <li key={i} className="flex justify-between">
                <span>{eq.nome}</span>
                <span className="text-base-400">{eq.total} OS</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-medium">OS</th>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Equipamento/Local</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Custo</th>
              <th className="px-4 py-3 font-medium">Aberta em</th>
            </tr>
          </thead>
          <tbody>
            {dados.manutencoes.map((m) => (
              <tr key={m.id} className="border-b border-base-800">
                <td className="px-4 py-3 font-mono text-xs text-base-400">
                  #{String(m.numeroOS).padStart(4, "0")}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/manutencoes/${m.id}`} className="hover:text-signal">
                    {m.titulo}
                  </Link>
                </td>
                <td className="px-4 py-3 text-base-400">{tipoTexto[m.tipo]}</td>
                <td className="px-4 py-3 text-base-400">{m.equipamento?.nome ?? m.local?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-base-400">{statusTexto[m.status]}</td>
                <td className="px-4 py-3 text-base-400">
                  {formatarMoeda(Number(m.custoMaoDeObra ?? 0) + Number(m.custoPecas ?? 0))}
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
  );
}
