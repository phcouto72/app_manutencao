import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/authz";
import MovimentoEstoqueForm from "./MovimentoEstoqueForm";

export const dynamic = "force-dynamic";

const tipoTexto: Record<string, { texto: string; cor: string }> = {
  ENTRADA: { texto: "Entrada", cor: "text-ok" },
  SAIDA: { texto: "Saída", cor: "text-danger" },
  AJUSTE: { texto: "Ajuste", cor: "text-info" },
};

export default async function DetalhePecaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarEstoque(papel);

  const peca = await prisma.peca.findUnique({
    where: { id: params.id },
    include: { movimentos: { orderBy: { criadoEm: "desc" }, take: 30, include: { usuario: true } } },
  });

  if (!peca) notFound();

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ESTOQUE</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-2">{peca.nome}</h1>
      <p className="text-base-400 text-sm mb-8">
        {peca.quantidadeAtual} {peca.unidadeMedida} em estoque · Ponto de pedido: {peca.quantidadeMin}{" "}
        {peca.unidadeMedida}
      </p>

      {podeGerenciar && (
        <div className="card p-5 mb-8">
          <h2 className="font-display text-lg font-semibold tracking-wide mb-4">
            Registrar movimentação
          </h2>
          <MovimentoEstoqueForm pecaId={peca.id} />
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">Histórico</h2>
        {peca.movimentos.length === 0 ? (
          <p className="text-base-400 text-sm">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-2 py-2 font-medium">Data</th>
                <th className="px-2 py-2 font-medium">Tipo</th>
                <th className="px-2 py-2 font-medium">Quantidade</th>
                <th className="px-2 py-2 font-medium">Motivo</th>
                <th className="px-2 py-2 font-medium">Usuário</th>
              </tr>
            </thead>
            <tbody>
              {peca.movimentos.map((m) => (
                <tr key={m.id} className="border-b border-base-800">
                  <td className="px-2 py-2 text-base-400">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                      new Date(m.criadoEm)
                    )}
                  </td>
                  <td className={`px-2 py-2 font-medium ${tipoTexto[m.tipo].cor}`}>
                    {tipoTexto[m.tipo].texto}
                  </td>
                  <td className="px-2 py-2">{m.quantidade}</td>
                  <td className="px-2 py-2 text-base-400">{m.motivo ?? "—"}</td>
                  <td className="px-2 py-2 text-base-400">{m.usuario?.nome ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
