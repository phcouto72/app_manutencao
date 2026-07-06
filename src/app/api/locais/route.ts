import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarLocais } from "@/lib/authz";

const localSchema = z.object({
  nome: z.string().min(2, "Informe o nome do local"),
  descricao: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const locais = await prisma.local.findMany({ orderBy: { nome: "asc" } });
  return NextResponse.json(locais);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarLocais(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar locais" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = localSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const local = await prisma.local.create({ data: validacao.data });
  return NextResponse.json(local, { status: 201 });
}
