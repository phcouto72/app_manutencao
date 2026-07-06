import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarAgendamentos } from "@/lib/authz";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarAgendamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const { status } = await req.json();

  const agendamento = await prisma.agendamento.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(agendamento);
}
