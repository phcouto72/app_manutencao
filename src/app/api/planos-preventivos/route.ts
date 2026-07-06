import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";
import { calcularProximaData } from "@/lib/agendamento";

const planoSchema = z.object({
  equipamentoId: z.string().min(1, "Selecione um equipamento"),
  titulo: z.string().min(2, "Informe um título para o plano"),
  descricao: z.string().optional().nullable(),
  frequenciaTipo: z.enum(["DIAS", "SEMANAS", "MESES", "HORAS_USO"]),
  frequenciaValor: z.number().int().min(1),
  notificarPorEmail: z.boolean().default(true),
  diasAntecedenciaAviso: z.number().int().min(0).default(3),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const planos = await prisma.planoPreventivo.findMany({
    include: { equipamento: true, agendamentos: { orderBy: { dataPrevista: "desc" }, take: 1 } },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(planos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarAgendamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão para criar planos preventivos" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = planoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const dados = validacao.data;

  const plano = await prisma.planoPreventivo.create({ data: dados });

  // Já gera o primeiro agendamento automaticamente, quando a frequência permite calcular a data.
  const proximaData = calcularProximaData(new Date(), dados.frequenciaTipo, dados.frequenciaValor);
  if (proximaData) {
    await prisma.agendamento.create({
      data: {
        planoPreventivoId: plano.id,
        equipamentoId: dados.equipamentoId,
        titulo: dados.titulo,
        dataPrevista: proximaData,
        notificarPorEmail: dados.notificarPorEmail,
        diasAntecedenciaAviso: dados.diasAntecedenciaAviso,
        criadoPorId: (session.user as any).id,
      },
    });
  }

  return NextResponse.json(plano, { status: 201 });
}
