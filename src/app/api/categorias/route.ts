import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCategorias } from "@/lib/authz";

const categoriaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da categoria"),
  descricao: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { equipamentos: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(categorias);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarCategorias(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar categorias" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = categoriaSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.categoria.findUnique({ where: { nome: validacao.data.nome } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe uma categoria com esse nome" }, { status: 400 });
  }

  const categoria = await prisma.categoria.create({ data: validacao.data });
  return NextResponse.json(categoria, { status: 201 });
}
