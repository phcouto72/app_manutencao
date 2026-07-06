"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({
  nomeUsuario,
  papel,
  nomeEmpresa,
  logoUrl,
  children,
}: {
  nomeUsuario: string;
  papel: string;
  nomeEmpresa: string;
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="md:flex">
      {menuAberto && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      <Sidebar
        nomeUsuario={nomeUsuario}
        papel={papel}
        nomeEmpresa={nomeEmpresa}
        logoUrl={logoUrl}
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
      />

      <div className="flex-1 min-h-screen">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-base-700 md:hidden">
          <button
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
            className="text-base-100 p-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nomeEmpresa} className="h-6 max-w-[120px] object-contain" />
          ) : (
            <span className="font-display text-base font-semibold tracking-wide truncate">
              {nomeEmpresa}
            </span>
          )}
        </div>

        <div className="faixa-sinalizacao hidden md:block" />
        <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
