import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const peca = await prisma.peca.findUnique({
    where: { id: params.id },
    include: { movimentos: { orderBy: { criadoEm: "desc" }, take: 20, include: { usuario: true } } },
  });

  if (!peca) return NextResponse.json({ erro: "Não encontrada" }, { status: 404 });
  return NextResponse.json(peca);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEstoque(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar peças" }, { status: 403 });
  }

  const corpo = await req.json();
  // quantidadeAtual não é editada diretamente aqui — só por movimentações, para manter o histórico coerente.
  const { quantidadeAtual, ...dadosEditaveis } = corpo;

  const peca = await prisma.peca.update({
    where: { id: params.id },
    data: dadosEditaveis,
  });

  return NextResponse.json(peca);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEstoque(papel)) {
    return NextResponse.json({ erro: "Sem permissão para excluir peças" }, { status: 403 });
  }

  await prisma.peca.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
