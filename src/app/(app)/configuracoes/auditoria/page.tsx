import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarUsuarios } from "@/lib/authz";
import { parsePaginacao } from "@/lib/paginacao";
import Paginacao from "@/components/Paginacao";

export const dynamic = "force-dynamic";

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: { pagina?: string; porPagina?: string };
}) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  const { pagina, porPagina, skip, take } = parsePaginacao(searchParams);

  const [logs, total] = await Promise.all([
    prisma.logAuditoria.findMany({
      include: { usuario: true },
      orderBy: { criadoEm: "desc" },
      skip,
      take,
    }),
    prisma.logAuditoria.count(),
  ]);

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-2">Log de Auditoria</h1>
      <p className="text-base-400 text-sm mb-8">Histórico completo de ações registradas no sistema.</p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Data/hora</th>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Ação</th>
                <th className="px-4 py-3 font-medium">Entidade</th>
                <th className="px-4 py-3 font-medium">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-base-800 hover:bg-base-800/50">
                  <td className="px-4 py-3 text-base-400 whitespace-nowrap">
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
                      new Date(log.criadoEm)
                    )}
                  </td>
                  <td className="px-4 py-3">{log.usuario?.nome ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-signal">{log.acao}</td>
                  <td className="px-4 py-3 text-base-400">{log.entidade}</td>
                  <td className="px-4 py-3 text-base-400">{log.detalhes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total === 0 ? (
          <p className="text-base-400 text-sm p-6 text-center">Nenhum registro ainda.</p>
        ) : (
          <Paginacao total={total} pagina={pagina} porPagina={porPagina} />
        )}
      </div>
    </div>
  );
}
