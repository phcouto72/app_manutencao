import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/authz";

const movimentoSchema = z.object({
  tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.number().int(),
  motivo: z.string().optional().nullable(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEstoque(papel)) {
    return NextResponse.json({ erro: "Sem permissão para movimentar estoque" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = movimentoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const { tipo, quantidade, motivo } = validacao.data;

  const peca = await prisma.peca.findUnique({ where: { id: params.id } });
  if (!peca) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });

  let novaQuantidade = peca.quantidadeAtual;
  if (tipo === "ENTRADA") novaQuantidade += quantidade;
  else if (tipo === "SAIDA") novaQuantidade -= quantidade;
  else novaQuantidade = quantidade; // ajuste define o valor absoluto

  if (novaQuantidade < 0) {
    return NextResponse.json({ erro: "Quantidade em estoque não pode ficar negativa" }, { status: 400 });
  }

  const [, pecaAtualizada] = await prisma.$transaction([
    prisma.movimentoEstoque.create({
      data: {
        pecaId: peca.id,
        tipo,
        quantidade,
        motivo,
        usuarioId: (session.user as any).id,
      },
    }),
    prisma.peca.update({
      where: { id: peca.id },
      data: { quantidadeAtual: novaQuantidade },
    }),
  ]);

  return NextResponse.json(pecaAtualizada);
}
