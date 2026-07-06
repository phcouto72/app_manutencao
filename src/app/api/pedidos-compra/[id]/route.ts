import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCompras } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const pedido = await prisma.pedidoCompra.findUnique({
    where: { id: params.id },
    include: { fornecedor: true, itens: { include: { peca: true } } },
  });

  if (!pedido) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(pedido);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarCompras(papel)) {
    return NextResponse.json({ erro: "Sem permissão para atualizar pedidos de compra" }, { status: 403 });
  }

  const { status } = await req.json();

  const pedidoAtual = await prisma.pedidoCompra.findUnique({
    where: { id: params.id },
    include: { itens: true },
  });
  if (!pedidoAtual) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });

  // Só dá baixa no estoque uma vez: apenas na transição PARA "RECEBIDO" vindo de outro status.
  const vaiReceberAgora = status === "RECEBIDO" && pedidoAtual.status !== "RECEBIDO";

  if (vaiReceberAgora) {
    const operacoes = pedidoAtual.itens.flatMap((item) => {
      return [
        prisma.movimentoEstoque.create({
          data: {
            pecaId: item.pecaId,
            tipo: "ENTRADA",
            quantidade: item.quantidade,
            motivo: `Recebimento do pedido de compra #${pedidoAtual.numeroPedido}`,
            usuarioId: (session.user as any).id,
          },
        }),
        prisma.peca.update({
          where: { id: item.pecaId },
          data: {
            quantidadeAtual: { increment: item.quantidade },
            precoMedio: Number(item.precoUnitario), // simplificado: usa o preço da última compra recebida
          },
        }),
      ];
    });

    await prisma.$transaction([
      ...operacoes,
      prisma.pedidoCompra.update({
        where: { id: params.id },
        data: { status: "RECEBIDO", dataRecebimento: new Date() },
      }),
    ]);
  } else {
    await prisma.pedidoCompra.update({ where: { id: params.id }, data: { status } });
  }

  const pedidoAtualizado = await prisma.pedidoCompra.findUnique({
    where: { id: params.id },
    include: { fornecedor: true, itens: { include: { peca: true } } },
  });

  return NextResponse.json(pedidoAtualizado);
}
