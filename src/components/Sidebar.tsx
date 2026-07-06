"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const itens = [
  { href: "/dashboard", label: "Painel", codigo: "01" },
  { href: "/equipamentos", label: "Equipamentos", codigo: "02" },
  { href: "/manutencoes", label: "Manutenções", codigo: "03" },
  { href: "/locais", label: "Locais", codigo: "04" },
  { href: "/estoque", label: "Estoque de Peças", codigo: "05" },
  { href: "/fornecedores", label: "Fornecedores", codigo: "06" },
  { href: "/compras", label: "Pedidos de Compra", codigo: "07" },
  { href: "/agendamentos", label: "Agendamentos", codigo: "08" },
  { href: "/relatorios", label: "Relatórios", codigo: "09" },
];

const itemUsuarios = { href: "/usuarios", label: "Usuários", codigo: "10" };
const itemAuditoria = { href: "/auditoria", label: "Auditoria", codigo: "11" };
const itemConfiguracoes = { href: "/configuracoes", label: "Configurações", codigo: "12" };

export default function Sidebar({
  nomeUsuario,
  papel,
  nomeEmpresa,
  logoUrl,
  aberto,
  onFechar,
}: {
  nomeUsuario: string;
  papel: string;
  nomeEmpresa: string;
  logoUrl: string | null;
  aberto: boolean;
  onFechar: () => void;
}) {
  const pathname = usePathname();
  const listaItens =
    papel === "ADMIN" ? [...itens, itemUsuarios, itemAuditoria, itemConfiguracoes] : itens;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 bg-base-900 border-r border-base-700 flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0 md:w-60 md:min-h-screen
        ${aberto ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="px-5 py-6 border-b border-base-700 flex items-start justify-between">
        <div className="min-w-0">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nomeEmpresa} className="h-10 max-w-[160px] object-contain mb-2" />
          ) : (
            <p className="font-mono text-signal text-[10px] tracking-widest">SISTEMA</p>
          )}
          <h2 className="font-display text-lg font-semibold tracking-wide leading-tight truncate">
            {nomeEmpresa}
          </h2>
        </div>
        <button
          onClick={onFechar}
          aria-label="Fechar menu"
          className="text-base-400 hover:text-base-100 md:hidden p-1"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {listaItens.map((item) => {
          const ativo = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onFechar}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-colors ${
                ativo
                  ? "border-signal text-base-100 bg-base-800"
                  : "border-transparent text-base-400 hover:text-base-100 hover:bg-base-800/60"
              }`}
            >
              <span className="font-mono text-[10px] text-base-500">{item.codigo}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-base-700">
        <p className="text-sm text-base-100 truncate">{nomeUsuario}</p>
        <p className="text-xs text-base-400 mb-3 uppercase tracking-wide">{papel}</p>
        <Link href="/perfil" onClick={onFechar} className="text-xs text-base-400 hover:text-signal transition-colors block mb-2">
          Meu perfil / trocar senha
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-base-400 hover:text-danger transition-colors"
        >
          Sair do sistema
        </button>
      </div>
    </aside>
  );
}
