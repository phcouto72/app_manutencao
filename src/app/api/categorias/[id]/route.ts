import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCategorias } from "@/lib/authz";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarCategorias(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar categorias" }, { status: 403 });
  }

  const { nome, descricao } = await req.json();
  if (!nome || String(nome).trim().length < 2) {
    return NextResponse.json({ erro: "Informe o nome da categoria" }, { status: 400 });
  }

  const categoria = await prisma.categoria.update({
    where: { id: params.id },
    data: { nome, descricao },
  });

  return NextResponse.json(categoria);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarCategorias(papel)) {
    return NextResponse.json({ erro: "Sem permissão para excluir categorias" }, { status: 403 });
  }

  const emUso = await prisma.equipamento.count({ where: { categoriaId: params.id } });
  if (emUso > 0) {
    return NextResponse.json(
      { erro: `Não é possível excluir: ${emUso} equipamento(s) usam esta categoria.` },
      { status: 400 }
    );
  }

  await prisma.categoria.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
