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
  // Os itens abaixo serão habilitados nas próximas fases do projeto.
  // { href: "/relatorios", label: "Relatórios", codigo: "09" },
];

export default function Sidebar({ nomeUsuario, papel }: { nomeUsuario: string; papel: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-base-900 border-r border-base-700 flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-base-700">
        <p className="font-mono text-signal text-[10px] tracking-widest">SISTEMA</p>
        <h2 className="font-display text-xl font-semibold tracking-wide leading-tight">
          CONTROLE DE MANUTENÇÃO
        </h2>
      </div>

      <nav className="flex-1 py-4">
        {itens.map((item) => {
          const ativo = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
