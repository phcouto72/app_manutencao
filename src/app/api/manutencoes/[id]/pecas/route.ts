import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

const schema = z.object({
  pecaId: z.string().min(1),
  quantidade: z.number().int().min(1),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = schema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const { pecaId, quantidade } = validacao.data;

  const peca = await prisma.peca.findUnique({ where: { id: pecaId } });
  if (!peca) return NextResponse.json({ erro: "Peça não encontrada" }, { status: 404 });
  if (peca.quantidadeAtual < quantidade) {
    return NextResponse.json(
      { erro: `Estoque insuficiente. Disponível: ${peca.quantidadeAtual} ${peca.unidadeMedida}` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.itemPecaManutencao.create({
      data: {
        manutencaoId: params.id,
        pecaId,
        quantidade,
        precoUnitario: peca.precoMedio,
      },
    }),
    prisma.movimentoEstoque.create({
      data: {
        pecaId,
        tipo: "SAIDA",
        quantidade,
        motivo: `Usada na OS ${params.id}`,
        usuarioId: (session.user as any).id,
      },
    }),
    prisma.peca.update({
      where: { id: pecaId },
      data: { quantidadeAtual: { decrement: quantidade } },
    }),
    prisma.manutencao.update({
      where: { id: params.id },
      data: { custoPecas: { increment: Number(peca.precoMedio) * quantidade } },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
