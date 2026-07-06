import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCompras } from "@/lib/authz";

export const dynamic = "force-dynamic";

const statusInfo: Record<string, { texto: string; cor: string }> = {
  ORCAMENTO: { texto: "Orçamento", cor: "text-base-400" },
  APROVADO: { texto: "Aprovado", cor: "text-info" },
  ENVIADO: { texto: "Enviado", cor: "text-warn" },
  RECEBIDO: { texto: "Recebido", cor: "text-ok" },
  CANCELADO: { texto: "Cancelado", cor: "text-danger" },
};

export default async function ComprasPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarCompras(papel);

  const pedidos = await prisma.pedidoCompra.findMany({
    include: { fornecedor: true, itens: true },
    orderBy: { dataPedido: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">COMPRAS</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Pedidos de Compra</h1>
        </div>
        {podeGerenciar && (
          <Link href="/compras/nova" className="btn-primary">
            + Novo pedido
          </Link>
        )}
      </div>

      {pedidos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhum pedido de compra registrado ainda.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Pedido</th>
                <th className="px-4 py-3 font-medium">Fornecedor</th>
                <th className="px-4 py-3 font-medium">Itens</th>
                <th className="px-4 py-3 font-medium">Valor total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((p) => (
                <tr key={p.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/compras/${p.id}`} className="hover:text-signal">
                      #{String(p.numeroPedido).padStart(4, "0")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-base-400">{p.fornecedor.nome}</td>
                  <td className="px-4 py-3 text-base-400">{p.itens.length}</td>
                  <td className="px-4 py-3 text-base-400">
                    {Number(p.valorTotal).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className={`px-4 py-3 font-medium ${statusInfo[p.status].cor}`}>
                    {statusInfo[p.status].texto}
                  </td>
                  <td className="px-4 py-3 text-base-400">
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(p.dataPedido))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
