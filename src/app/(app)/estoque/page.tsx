import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarEstoque(papel);

  const pecas = await prisma.peca.findMany({ orderBy: { nome: "asc" } });
  const emFalta = pecas.filter((p) => p.quantidadeAtual <= p.quantidadeMin);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">ESTOQUE</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Peças</h1>
        </div>
        {podeGerenciar && (
          <Link href="/estoque/novo" className="btn-primary">
            + Nova peça
          </Link>
        )}
      </div>

      {emFalta.length > 0 && (
        <div className="card p-4 mb-6 border-signal/50 bg-signal/5">
          <p className="text-signal text-sm font-medium">
            ⚠ {emFalta.length} peça(s) no ponto de pedido ou abaixo dele: {emFalta.map((p) => p.nome).join(", ")}
          </p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Código</th>
              <th className="px-4 py-3 font-medium">Qtd. atual</th>
              <th className="px-4 py-3 font-medium">Qtd. mínima</th>
              <th className="px-4 py-3 font-medium">Preço médio</th>
              <th className="px-4 py-3 font-medium">Localização</th>
            </tr>
          </thead>
          <tbody>
            {pecas.map((p) => {
              const baixo = p.quantidadeAtual <= p.quantidadeMin;
              return (
                <tr key={p.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/estoque/${p.id}`} className="hover:text-signal">
                      {p.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-base-400">{p.codigo ?? "—"}</td>
                  <td className={`px-4 py-3 font-medium ${baixo ? "text-signal" : "text-base-100"}`}>
                    {p.quantidadeAtual} {p.unidadeMedida}
                  </td>
                  <td className="px-4 py-3 text-base-400">{p.quantidadeMin}</td>
                  <td className="px-4 py-3 text-base-400">
                    {Number(p.precoMedio).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="px-4 py-3 text-base-400">{p.localizacaoEstoque ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
          </div>
      </div>
    </div>
  );
}
