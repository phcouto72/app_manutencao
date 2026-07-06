import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarLocais } from "@/lib/authz";
import NovoLocalForm from "./NovoLocalForm";

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
          <p className="font-mono text-signal text-xs tracking-widest mb-1">ESTRUTURA</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Locais</h1>
        </div>
        {podeGerenciar && <NovoLocalForm />}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Equipamentos</th>
              <th className="px-4 py-3 font-medium">Manutenções</th>
            </tr>
          </thead>
          <tbody>
            {locais.map((l) => (
              <tr key={l.id} className="border-b border-base-800">
                <td className="px-4 py-3">{l.nome}</td>
                <td className="px-4 py-3 text-base-400">{l.descricao ?? "—"}</td>
                <td className="px-4 py-3 text-base-400">{l._count.equipamentos}</td>
                <td className="px-4 py-3 text-base-400">{l._count.manutencoes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
