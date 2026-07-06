import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCompras } from "@/lib/authz";
import AtualizarStatusPedido from "./AtualizarStatusPedido";

export const dynamic = "force-dynamic";

export default async function DetalhePedidoCompraPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarCompras(papel);

  const pedido = await prisma.pedidoCompra.findUnique({
    where: { id: params.id },
    include: { fornecedor: true, itens: { include: { peca: true } } },
  });

  if (!pedido) notFound();

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-signal text-xs tracking-widest mb-1">
        PEDIDO #{String(pedido.numeroPedido).padStart(4, "0")}
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-2">
        {pedido.fornecedor.nome}
      </h1>
      <p className="text-base-400 text-sm mb-8">
        Criado em {new Intl.DateTimeFormat("pt-BR").format(new Date(pedido.dataPedido))}
        {pedido.dataRecebimento &&
          ` · Recebido em ${new Intl.DateTimeFormat("pt-BR").format(new Date(pedido.dataRecebimento))}`}
      </p>

      {podeGerenciar && (
        <div className="card p-5 mb-6">
          <p className="label-field mb-2">Status do pedido</p>
          <AtualizarStatusPedido pedidoId={pedido.id} statusAtual={pedido.status} />
        </div>
      )}

      <div className="card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-medium">Peça</th>
              <th className="px-4 py-3 font-medium">Quantidade</th>
              <th className="px-4 py-3 font-medium">Preço unit.</th>
              <th className="px-4 py-3 font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.itens.map((item) => (
              <tr key={item.id} className="border-b border-base-800">
                <td className="px-4 py-3">{item.peca.nome}</td>
                <td className="px-4 py-3 text-base-400">
                  {item.quantidade} {item.peca.unidadeMedida}
                </td>
                <td className="px-4 py-3 text-base-400">
                  {Number(item.precoUnitario).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="px-4 py-3">
                  {(item.quantidade * Number(item.precoUnitario)).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 flex justify-end border-t border-base-700">
          <span className="font-display text-xl font-semibold">
            Total:{" "}
            {Number(pedido.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      </div>

      {pedido.observacoes && (
        <div className="card p-5">
          <p className="label-field">Observações</p>
          <p className="text-sm">{pedido.observacoes}</p>
        </div>
      )}
    </div>
  );
}
