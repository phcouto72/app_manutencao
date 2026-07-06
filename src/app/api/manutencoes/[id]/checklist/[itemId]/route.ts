import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const { concluido } = await req.json();

  const item = await prisma.checklistItem.update({
    where: { id: params.itemId },
    data: { concluido: Boolean(concluido) },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  await prisma.checklistItem.delete({ where: { id: params.itemId } });
  return NextResponse.json({ ok: true });
}
