import { buscarDadosRelatorio, FiltrosRelatorio } from "@/lib/relatorios";
import { getEmpresaConfig } from "@/lib/empresa";
import BotaoImprimir from "./BotaoImprimir";

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

export default async function RelatorioImprimirPage({
  searchParams,
}: {
  searchParams: FiltrosRelatorio;
}) {
  const dados = await buscarDadosRelatorio(searchParams);
  const empresa = await getEmpresaConfig();
  const geradoEm = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date()
  );

  const periodo =
    searchParams.dataInicio || searchParams.dataFim
      ? `${searchParams.dataInicio ? new Intl.DateTimeFormat("pt-BR").format(new Date(searchParams.dataInicio)) : "início"} até ${
          searchParams.dataFim ? new Intl.DateTimeFormat("pt-BR").format(new Date(searchParams.dataFim)) : "hoje"
        }`
      : "todo o período";

  return (
    <div className="max-w-4xl mx-auto p-8 print:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <p className="text-sm text-gray-500">
          Use o botão abaixo, ou Ctrl+P / Cmd+P, e escolha "Salvar como PDF" na impressora.
        </p>
        <BotaoImprimir />
      </div>

      <div className="border-b-4 border-gray-900 pb-4 mb-6 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Manutenções</h1>
          <p className="text-sm text-gray-600 mt-1">
            Período: {periodo} · Gerado em {geradoEm}
          </p>
          <p className="text-sm text-gray-600 mt-1 font-semibold">{empresa.nome}</p>
          {empresa.endereco && <p className="text-xs text-gray-500">{empresa.endereco}</p>}
        </div>
        {(empresa.logoImpressaoUrl || empresa.logoUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={empresa.logoImpressaoUrl || empresa.logoUrl || ""}
            alt={empresa.nome}
            className="h-16 max-w-[180px] object-contain"
          />
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 text-center">
        <div className="border border-gray-300 rounded p-3">
          <p className="text-2xl font-bold">{dados.totalOS}</p>
          <p className="text-xs text-gray-500 uppercase">Ordens de serviço</p>
        </div>
        <div className="border border-gray-300 rounded p-3">
          <p className="text-lg font-bold">{formatarMoeda(dados.custoTotal)}</p>
          <p className="text-xs text-gray-500 uppercase">Custo total</p>
        </div>
        <div className="border border-gray-300 rounded p-3">
          <p className="text-2xl font-bold">{dados.mttrHoras !== null ? dados.mttrHoras.toFixed(1) : "—"}</p>
          <p className="text-xs text-gray-500 uppercase">MTTR médio (h)</p>
        </div>
        <div className="border border-gray-300 rounded p-3">
          <p className="text-2xl font-bold">{dados.porStatus.CONCLUIDA ?? 0}</p>
          <p className="text-xs text-gray-500 uppercase">Concluídas</p>
        </div>
      </div>

      {(dados.mtbfDias !== null || dados.disponibilidadePercentual !== null) && (
        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          {dados.mtbfDias !== null && (
            <div className="border border-gray-300 rounded p-3">
              <p className="text-2xl font-bold">{dados.mtbfDias.toFixed(1)}</p>
              <p className="text-xs text-gray-500 uppercase">MTBF (dias entre falhas)</p>
            </div>
          )}
          {dados.disponibilidadePercentual !== null && (
            <div className="border border-gray-300 rounded p-3">
              <p className="text-2xl font-bold">{dados.disponibilidadePercentual.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 uppercase">Disponibilidade</p>
            </div>
          )}
        </div>
      )}

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-900 text-left">
            <th className="py-2 pr-2">OS</th>
            <th className="py-2 pr-2">Título</th>
            <th className="py-2 pr-2">Tipo</th>
            <th className="py-2 pr-2">Equip./Local</th>
            <th className="py-2 pr-2">Status</th>
            <th className="py-2 pr-2">Custo</th>
            <th className="py-2 pr-2">Aberta em</th>
            <th className="py-2 pr-2">Concluída em</th>
          </tr>
        </thead>
        <tbody>
          {dados.manutencoes.map((m) => (
            <tr key={m.id} className="border-b border-gray-300">
              <td className="py-1.5 pr-2">#{String(m.numeroOS).padStart(4, "0")}</td>
              <td className="py-1.5 pr-2">{m.titulo}</td>
              <td className="py-1.5 pr-2">{tipoTexto[m.tipo]}</td>
              <td className="py-1.5 pr-2">{m.equipamento?.nome ?? m.local?.nome ?? "—"}</td>
              <td className="py-1.5 pr-2">{statusTexto[m.status]}</td>
              <td className="py-1.5 pr-2">
                {formatarMoeda(Number(m.custoMaoDeObra ?? 0) + Number(m.custoPecas ?? 0))}
              </td>
              <td className="py-1.5 pr-2">
                {new Intl.DateTimeFormat("pt-BR").format(new Date(m.dataAbertura))}
              </td>
              <td className="py-1.5 pr-2">
                {m.dataConclusao ? new Intl.DateTimeFormat("pt-BR").format(new Date(m.dataConclusao)) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {dados.manutencoes.length === 0 && (
        <p className="text-center text-gray-500 py-10">Nenhuma manutenção encontrada para esse filtro.</p>
      )}
    </div>
  );
}
