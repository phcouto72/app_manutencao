import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const manutencao = await prisma.manutencao.findUnique({
    where: { id: params.id },
    include: { equipamento: true, local: true, responsavel: true },
  });

  if (!manutencao) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  return NextResponse.json(manutencao);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar manutenções" }, { status: 403 });
  }

  const corpo = await req.json();

  const dadosAtualizacao: any = {
    status: corpo.status,
    descricaoSolucao: corpo.descricaoSolucao,
    responsavelId: corpo.responsavelId || null,
    custoMaoDeObra: corpo.custoMaoDeObra ?? undefined,
    custoPecas: corpo.custoPecas ?? undefined,
  };

  if (corpo.status === "EM_ANDAMENTO" && !corpo.dataInicioJaDefinida) {
    dadosAtualizacao.dataInicio = new Date();
  }
  if (corpo.status === "CONCLUIDA") {
    dadosAtualizacao.dataConclusao = new Date();
  }

  const manutencao = await prisma.manutencao.update({
    where: { id: params.id },
    data: dadosAtualizacao,
  });

  // Ao concluir ou cancelar, o equipamento volta a ficar operante
  // (regra simples — não considera se existe outra OS aberta para o mesmo equipamento).
  if (manutencao.equipamentoId && (corpo.status === "CONCLUIDA" || corpo.status === "CANCELADA")) {
    const outrasAbertas = await prisma.manutencao.count({
      where: {
        equipamentoId: manutencao.equipamentoId,
        status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO_PECA"] },
        id: { not: manutencao.id },
      },
    });
    if (outrasAbertas === 0) {
      await prisma.equipamento.update({
        where: { id: manutencao.equipamentoId },
        data: { status: "OPERANTE" },
      });
    }
  }

  await prisma.logAuditoria.create({
    data: {
      usuarioId: (session.user as any).id,
      acao: "ATUALIZAR_MANUTENCAO",
      entidade: "Manutencao",
      entidadeId: manutencao.id,
      detalhes: `OS "${manutencao.titulo}" atualizada para status ${manutencao.status}`,
    },
  });

  return NextResponse.json(manutencao);
}
