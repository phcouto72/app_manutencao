import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarLocais } from "@/lib/authz";
import NovoLocalForm from "./NovoLocalForm";
import ExcluirLocalBotao from "./ExcluirLocalBotao";

export const dynamic = "force-dynamic";

export default async function LocaisPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarLocais(papel);

  const locais = await prisma.local.findMany({
    include: { _count: { select: { equipamentos: true, manutencoes: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">CONFIGURAÇÕES</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Locais</h1>
        </div>
        {podeGerenciar && <NovoLocalForm />}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Equipamentos</th>
                <th className="px-4 py-3 font-medium">Manutenções</th>
                {podeGerenciar && <th className="px-4 py-3 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {locais.map((l) => (
                <tr key={l.id} className="border-b border-base-800">
                  <td className="px-4 py-3">
                    {podeGerenciar ? (
                      <Link href={`/configuracoes/locais/${l.id}`} className="hover:text-signal">
                        {l.nome}
                      </Link>
                    ) : (
                      l.nome
                    )}
                  </td>
                  <td className="px-4 py-3 text-base-400">{l.descricao ?? "—"}</td>
                  <td className="px-4 py-3 text-base-400">{l._count.equipamentos}</td>
                  <td className="px-4 py-3 text-base-400">{l._count.manutencoes}</td>
                  {podeGerenciar && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/configuracoes/locais/${l.id}`} className="text-info hover:underline text-xs">
                          Editar
                        </Link>
                        <ExcluirLocalBotao id={l.id} nome={l.nome} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
