import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/authz";

const pecaSchema = z.object({
  codigo: z.string().optional().nullable(),
  nome: z.string().min(2, "Informe o nome da peça"),
  descricao: z.string().optional().nullable(),
  unidadeMedida: z.string().default("UN"),
  quantidadeMin: z.number().int().min(0).default(0),
  quantidadeAtual: z.number().int().min(0).default(0),
  localizacaoEstoque: z.string().optional().nullable(),
  precoMedio: z.number().min(0).default(0),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const pecas = await prisma.peca.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(pecas);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEstoque(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar peças" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = pecaSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const peca = await prisma.peca.create({ data: validacao.data });
  return NextResponse.json(peca, { status: 201 });
}
