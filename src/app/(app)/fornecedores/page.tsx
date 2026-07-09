import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarFornecedores } from "@/lib/authz";
import { parsePaginacao } from "@/lib/paginacao";
import Paginacao from "@/components/Paginacao";

export const dynamic = "force-dynamic";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: { pagina?: string; porPagina?: string };
}) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarFornecedores(papel);

  const { pagina, porPagina, skip, take } = parsePaginacao(searchParams);
  const where = { ativo: true };

  const [fornecedores, total] = await Promise.all([
    prisma.fornecedor.findMany({ where, orderBy: { nome: "asc" }, skip, take }),
    prisma.fornecedor.count({ where }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">COMPRAS</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Fornecedores</h1>
        </div>
        {podeGerenciar && (
          <Link href="/fornecedores/novo" className="btn-primary">
            + Novo fornecedor
          </Link>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr key={f.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/fornecedores/${f.id}`} className="hover:text-signal">
                      {f.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-base-400">{f.contatoNome ?? "—"}</td>
                  <td className="px-4 py-3 text-base-400">{f.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-base-400">{f.email ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao total={total} pagina={pagina} porPagina={porPagina} />
      </div>
    </div>
  );
}
