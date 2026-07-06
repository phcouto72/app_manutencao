import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarFornecedores } from "@/lib/authz";
import FornecedorForm from "../FornecedorForm";

export const dynamic = "force-dynamic";

export default async function DetalheFornecedorPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarFornecedores(papel);

  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id: params.id },
    include: { pedidos: { orderBy: { dataPedido: "desc" } } },
  });

  if (!fornecedor) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <p className="font-mono text-signal text-xs tracking-widest mb-1">COMPRAS</p>
        <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">{fornecedor.nome}</h1>
        <div className="card p-6">
          {podeGerenciar ? (
            <FornecedorForm fornecedor={fornecedor as any} />
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="label-field">Contato</dt>
                <dd>{fornecedor.contatoNome ?? "—"}</dd>
              </div>
              <div>
                <dt className="label-field">Telefone</dt>
                <dd>{fornecedor.telefone ?? "—"}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">
          Histórico de compras
        </h2>
        {fornecedor.pedidos.length === 0 ? (
          <p className="text-base-400 text-sm">Nenhum pedido registrado ainda.</p>
        ) : (
          <ul className="divide-y divide-base-800">
            {fornecedor.pedidos.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                <Link href={`/compras/${p.id}`} className="hover:text-signal">
                  Pedido #{String(p.numeroPedido).padStart(4, "0")} ·{" "}
                  {new Intl.DateTimeFormat("pt-BR").format(new Date(p.dataPedido))}
                </Link>
                <span className="text-xs text-base-400 uppercase">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
