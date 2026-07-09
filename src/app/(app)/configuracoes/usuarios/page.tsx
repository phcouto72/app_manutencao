import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarUsuarios } from "@/lib/authz";
import { parsePaginacao } from "@/lib/paginacao";
import Paginacao from "@/components/Paginacao";

export const dynamic = "force-dynamic";

const papelTexto: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR: "Gestor",
  TECNICO: "Técnico",
  VISUALIZADOR: "Visualizador",
};

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: { pagina?: string; porPagina?: string };
}) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  const { pagina, porPagina, skip, take } = parsePaginacao(searchParams);

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { nome: "asc" }, skip, take }),
    prisma.usuario.count(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">Usuários</h1>
        </div>
        <Link href="/configuracoes/usuarios/novo" className="btn-primary">
          + Novo usuário
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700 text-left text-base-400 uppercase text-xs tracking-wide">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Função</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className={`border-b border-base-800 transition-colors ${u.ativo ? "hover:bg-base-800/50" : "bg-base-500/10 hover:bg-base-500/20"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/configuracoes/usuarios/${u.id}`} className="hover:text-signal">
                      {u.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-base-400">{u.email}</td>
                  <td className="px-4 py-3 text-base-400">{papelTexto[u.papel]}</td>
                  <td className="px-4 py-3">
                    {u.ativo ? <span className="text-ok">Ativo</span> : <span className="text-base-500">Inativo</span>}
                  </td>
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
