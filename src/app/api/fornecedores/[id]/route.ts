import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarFornecedores } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id: params.id },
    include: { pedidos: { orderBy: { dataPedido: "desc" } } },
  });

  if (!fornecedor) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(fornecedor);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarFornecedores(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar fornecedores" }, { status: 403 });
  }

  const corpo = await req.json();
  const fornecedor = await prisma.fornecedor.update({ where: { id: params.id }, data: corpo });
  return NextResponse.json(fornecedor);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarFornecedores(papel)) {
    return NextResponse.json({ erro: "Sem permissão para excluir fornecedores" }, { status: 403 });
  }

  await prisma.fornecedor.update({ where: { id: params.id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}
