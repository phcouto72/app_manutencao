import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarFornecedores } from "@/lib/authz";

const fornecedorSchema = z.object({
  nome: z.string().min(2, "Informe o nome do fornecedor"),
  cnpjCpf: z.string().optional().nullable(),
  contatoNome: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ativo: z.boolean().default(true),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const fornecedores = await prisma.fornecedor.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(fornecedores);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarFornecedores(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar fornecedores" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = fornecedorSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const fornecedor = await prisma.fornecedor.create({ data: validacao.data });
  return NextResponse.json(fornecedor, { status: 201 });
}
