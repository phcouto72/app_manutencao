import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";

const agendamentoSchema = z.object({
  titulo: z.string().min(2, "Informe um título"),
  equipamentoId: z.string().optional().nullable(),
  dataPrevista: z.string().min(1, "Informe a data prevista"),
  notificarPorEmail: z.boolean().default(true),
  diasAntecedenciaAviso: z.number().int().min(0).default(3),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const agendamentos = await prisma.agendamento.findMany({
    include: { equipamento: true, planoPreventivo: true },
    orderBy: { dataPrevista: "asc" },
  });

  return NextResponse.json(agendamentos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarAgendamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão para criar agendamentos" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = agendamentoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const dados = validacao.data;

  const agendamento = await prisma.agendamento.create({
    data: {
      titulo: dados.titulo,
      equipamentoId: dados.equipamentoId || null,
      dataPrevista: new Date(dados.dataPrevista),
      notificarPorEmail: dados.notificarPorEmail,
      diasAntecedenciaAviso: dados.diasAntecedenciaAviso,
      criadoPorId: (session.user as any).id,
    },
  });

  return NextResponse.json(agendamento, { status: 201 });
}
