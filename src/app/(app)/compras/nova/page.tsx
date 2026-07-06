import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCompras } from "@/lib/authz";
import NovoPedidoCompraForm from "../NovoPedidoCompraForm";

export default async function NovoPedidoCompraPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarCompras(papel)) redirect("/compras");

  const [fornecedores, pecas] = await Promise.all([
    prisma.fornecedor.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.peca.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">COMPRAS</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo pedido de compra</h1>
      <div className="card p-6 max-w-3xl">
        <NovoPedidoCompraForm fornecedores={fornecedores} pecas={pecas as any} />
      </div>
    </div>
  );
}
