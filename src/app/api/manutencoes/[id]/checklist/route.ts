import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const { descricao } = await req.json();
  if (!descricao || String(descricao).trim().length < 2) {
    return NextResponse.json({ erro: "Descreva o item do checklist" }, { status: 400 });
  }

  const item = await prisma.checklistItem.create({
    data: { manutencaoId: params.id, descricao },
  });

  return NextResponse.json(item, { status: 201 });
}
