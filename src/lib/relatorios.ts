import { prisma } from "@/lib/prisma";

export type FiltrosRelatorio = {
  dataInicio?: string;
  dataFim?: string;
  equipamentoId?: string;
  localId?: string;
  tipo?: string;
  status?: string;
  categoriaServico?: string;
};

export async function buscarDadosRelatorio(filtros: FiltrosRelatorio) {
  const where: any = {};

  if (filtros.dataInicio || filtros.dataFim) {
    where.dataAbertura = {};
    if (filtros.dataInicio) where.dataAbertura.gte = new Date(filtros.dataInicio);
    if (filtros.dataFim) {
      const fim = new Date(filtros.dataFim);
      fim.setHours(23, 59, 59, 999);
      where.dataAbertura.lte = fim;
    }
  }
  if (filtros.equipamentoId) where.equipamentoId = filtros.equipamentoId;
  if (filtros.localId) where.localId = filtros.localId;
  if (filtros.tipo) where.tipo = filtros.tipo;
  if (filtros.status) where.status = filtros.status;
  if (filtros.categoriaServico) where.categoriaServico = filtros.categoriaServico;

  const manutencoes = await prisma.manutencao.findMany({
    where,
    include: { equipamento: true, local: true, responsavel: true },
    orderBy: { dataAbertura: "desc" },
  });

  const totalOS = manutencoes.length;
  const custoTotal = manutencoes.reduce(
    (soma, m) => soma + Number(m.custoMaoDeObra ?? 0) + Number(m.custoPecas ?? 0),
    0
  );

  const concluidas = manutencoes.filter((m) => m.status === "CONCLUIDA" && m.dataConclusao);
  const mttrHoras =
    concluidas.length > 0
      ? concluidas.reduce((soma, m) => {
          const inicio = m.dataInicio ?? m.dataAbertura;
          const horas = (new Date(m.dataConclusao!).getTime() - new Date(inicio).getTime()) / 36e5;
          return soma + Math.max(horas, 0);
        }, 0) / concluidas.length
      : null;

  const porTipo: Record<string, number> = {};
  const porStatus: Record<string, number> = {};
  const porEquipamento: Record<string, { nome: string; total: number }> = {};

  for (const m of manutencoes) {
    porTipo[m.tipo] = (porTipo[m.tipo] ?? 0) + 1;
    porStatus[m.status] = (porStatus[m.status] ?? 0) + 1;
    if (m.equipamento) {
      const chave = m.equipamento.id;
      if (!porEquipamento[chave]) porEquipamento[chave] = { nome: m.equipamento.nome, total: 0 };
      porEquipamento[chave].total += 1;
    }
  }

  const rankingEquipamentos = Object.values(porEquipamento)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // MTBF e disponibilidade só fazem sentido olhando para um equipamento específico.
  let mtbfDias: number | null = null;
  let disponibilidadePercentual: number | null = null;

  if (filtros.equipamentoId) {
    const corretivas = manutencoes
      .filter((m) => m.tipo === "CORRETIVA")
      .sort((a, b) => new Date(a.dataAbertura).getTime() - new Date(b.dataAbertura).getTime());

    if (corretivas.length >= 2) {
      let somaDias = 0;
      for (let i = 1; i < corretivas.length; i++) {
        const dias =
          (new Date(corretivas[i].dataAbertura).getTime() -
            new Date(corretivas[i - 1].dataAbertura).getTime()) /
          (1000 * 60 * 60 * 24);
        somaDias += dias;
      }
      mtbfDias = somaDias / (corretivas.length - 1);
    }

    const equipamento = await prisma.equipamento.findUnique({
      where: { id: filtros.equipamentoId },
      select: { criadoEm: true },
    });

    if (equipamento) {
      const inicioPeriodo = filtros.dataInicio
        ? new Date(filtros.dataInicio)
        : new Date(equipamento.criadoEm);
      const fimPeriodo = filtros.dataFim ? new Date(filtros.dataFim) : new Date();
      const totalHorasPeriodo = Math.max(
        (fimPeriodo.getTime() - inicioPeriodo.getTime()) / 36e5,
        1
      );

      const horasParadas = manutencoes.reduce((soma, m) => {
        if (!m.dataConclusao) return soma;
        const inicio = m.dataInicio ?? m.dataAbertura;
        const horas = (new Date(m.dataConclusao).getTime() - new Date(inicio).getTime()) / 36e5;
        return soma + Math.max(horas, 0);
      }, 0);

      disponibilidadePercentual = Math.max(
        0,
        Math.min(100, ((totalHorasPeriodo - horasParadas) / totalHorasPeriodo) * 100)
      );
    }
  }

  return {
    manutencoes,
    totalOS,
    custoTotal,
    mttrHoras,
    porTipo,
    porStatus,
    rankingEquipamentos,
    mtbfDias,
    disponibilidadePercentual,
  };
}
