import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCategorias } from "@/lib/authz";
import NovaCategoriaForm from "./NovaCategoriaForm";
import ExcluirCategoriaBotao from "./ExcluirCategoriaBotao";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarCategorias(papel);

  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { equipamentos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">CONFIGURAÇÕES</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Categorias de Equipamento</h1>
        </div>
        {podeGerenciar && <NovaCategoriaForm />}
      </div>

      {categorias.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Equipamentos</th>
                  {podeGerenciar && <th className="px-4 py-3 font-medium text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className="border-b border-base-800">
                    <td className="px-4 py-3">
                      {podeGerenciar ? (
                        <Link href={`/configuracoes/categorias/${c.id}`} className="hover:text-signal">
                          {c.nome}
                        </Link>
                      ) : (
                        c.nome
                      )}
                    </td>
                    <td className="px-4 py-3 text-base-400">{c.descricao ?? "—"}</td>
                    <td className="px-4 py-3 text-base-400">{c._count.equipamentos}</td>
                    {podeGerenciar && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-3 justify-end">
                          <Link href={`/configuracoes/categorias/${c.id}`} className="text-info hover:underline text-xs">
                            Editar
                          </Link>
                          <ExcluirCategoriaBotao id={c.id} nome={c.nome} />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
