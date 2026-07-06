import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";
import { calcularProximaData } from "@/lib/agendamento";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const agendamento = await prisma.agendamento.findUnique({
    where: { id: params.id },
    include: { planoPreventivo: true, manutencaoGerada: true },
  });

  if (!agendamento) return NextResponse.json({ erro: "Agendamento não encontrado" }, { status: 404 });
  if (agendamento.manutencaoGerada) {
    return NextResponse.json({ erro: "Este agendamento já gerou uma OS" }, { status: 400 });
  }

  const manutencao = await prisma.manutencao.create({
    data: {
      tipo: "PREVENTIVA",
      categoriaServico: "OUTRO",
      titulo: agendamento.titulo,
      equipamentoId: agendamento.equipamentoId,
      agendamentoId: agendamento.id,
      responsavelId: (session.user as any).id,
    },
  });

  if (agendamento.equipamentoId) {
    await prisma.equipamento.update({
      where: { id: agendamento.equipamentoId },
      data: { status: "EM_MANUTENCAO" },
    });
  }

  await prisma.agendamento.update({
    where: { id: agendamento.id },
    data: { status: "CONCLUIDO" },
  });

  // Se veio de um plano recorrente, já programa o próximo agendamento.
  if (agendamento.planoPreventivo && agendamento.planoPreventivo.ativo) {
    const proximaData = calcularProximaData(
      agendamento.dataPrevista,
      agendamento.planoPreventivo.frequenciaTipo,
      agendamento.planoPreventivo.frequenciaValor
    );
    if (proximaData) {
      await prisma.agendamento.create({
        data: {
          planoPreventivoId: agendamento.planoPreventivoId,
          equipamentoId: agendamento.equipamentoId,
          titulo: agendamento.planoPreventivo.titulo,
          dataPrevista: proximaData,
          notificarPorEmail: agendamento.notificarPorEmail,
          diasAntecedenciaAviso: agendamento.diasAntecedenciaAviso,
          criadoPorId: agendamento.criadoPorId,
        },
      });
    }
  }

  return NextResponse.json(manutencao, { status: 201 });
}
