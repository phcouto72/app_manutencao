import Link from "next/link";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { podeGerenciarEquipamentos } from "@/lib/authz";
import ExcluirEquipamentoBotao from "./ExcluirEquipamentoBotao";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { texto: string; cor: string }> = {
  OPERANTE: { texto: "Operante", cor: "text-ok" },
  EM_MANUTENCAO: { texto: "Em manutenção", cor: "text-warn" },
  PARADO: { texto: "Parado", cor: "text-danger" },
  INATIVO: { texto: "Inativo", cor: "text-base-500" },
};

export default async function EquipamentosPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarEquipamentos(papel);

  const equipamentos = await prisma.equipamento.findMany({
    include: { local: true, equipamentoPai: true },
    orderBy: { criadoEm: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">CADASTRO</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Equipamentos</h1>
        </div>
        {podeGerenciar && (
          <Link href="/equipamentos/novo" className="btn-primary">
            + Novo equipamento
          </Link>
        )}
      </div>

      {equipamentos.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-base-400">Nenhum equipamento cadastrado ainda.</p>
          {podeGerenciar && (
            <Link href="/equipamentos/novo" className="btn-primary inline-block mt-4">
              Cadastrar o primeiro equipamento
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Patrimônio</th>
                {podeGerenciar && <th className="px-4 py-3 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {equipamentos.map((eq) => (
                <tr key={eq.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/equipamentos/${eq.id}`} className="hover:text-signal">
                      {eq.nome}
                    </Link>
                    {eq.equipamentoPai && (
                      <span className="text-base-500 text-xs block">
                        componente de: {eq.equipamentoPai.nome}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-400">{eq.categoria ?? "—"}</td>
                  <td className="px-4 py-3 text-base-400">{eq.local?.nome ?? "—"}</td>
                  <td className={`px-4 py-3 font-medium ${statusLabel[eq.status].cor}`}>
                    {statusLabel[eq.status].texto}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-base-400">
                    {eq.codigoPatrimonio ?? "—"}
                  </td>
                  {podeGerenciar && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link href={`/equipamentos/${eq.id}`} className="text-info hover:underline">
                        Editar
                      </Link>
                      <ExcluirEquipamentoBotao id={eq.id} nome={eq.nome} />
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
