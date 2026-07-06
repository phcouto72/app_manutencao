import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCompras } from "@/lib/authz";

const itemSchema = z.object({
  pecaId: z.string().min(1),
  quantidade: z.number().int().min(1),
  precoUnitario: z.number().min(0),
});

const pedidoSchema = z.object({
  fornecedorId: z.string().min(1, "Selecione um fornecedor"),
  observacoes: z.string().optional().nullable(),
  itens: z.array(itemSchema).min(1, "Adicione ao menos um item ao pedido"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const pedidos = await prisma.pedidoCompra.findMany({
    include: { fornecedor: true, itens: { include: { peca: true } } },
    orderBy: { dataPedido: "desc" },
  });

  return NextResponse.json(pedidos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarCompras(papel)) {
    return NextResponse.json({ erro: "Sem permissão para criar pedidos de compra" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = pedidoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const { fornecedorId, observacoes, itens } = validacao.data;
  const valorTotal = itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);

  const pedido = await prisma.pedidoCompra.create({
    data: {
      fornecedorId,
      observacoes,
      valorTotal,
      criadoPorId: (session.user as any).id,
      itens: {
        create: itens.map((item) => ({
          pecaId: item.pecaId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        })),
      },
    },
    include: { itens: true },
  });

  return NextResponse.json(pedido, { status: 201 });
}
