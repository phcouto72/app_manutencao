import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/authz";

export default async function ConfiguracoesHubPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  const itens = [
    { href: "/configuracoes/empresa", titulo: "Empresa", desc: "Logo e dados usados nos relatórios" },
    { href: "/configuracoes/locais", titulo: "Locais", desc: "Estrutura predial da empresa" },
    { href: "/configuracoes/categorias", titulo: "Categorias de Equipamento", desc: "Tipos usados no cadastro de equipamentos" },
    { href: "/configuracoes/usuarios", titulo: "Usuários", desc: "Contas de acesso e funções" },
    { href: "/configuracoes/auditoria", titulo: "Auditoria", desc: "Histórico de ações no sistema" },
  ];

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Configurações</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itens.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card p-6 hover:border-signal transition-colors block"
          >
            <h2 className="font-display text-xl font-semibold tracking-wide mb-1">{item.titulo}</h2>
            <p className="text-base-400 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
