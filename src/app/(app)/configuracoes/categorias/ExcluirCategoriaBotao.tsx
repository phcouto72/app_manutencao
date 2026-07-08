"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExcluirCategoriaBotao({
  id,
  nome,
  redirectTo,
}: {
  id: string;
  nome: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    setErro(null);
    setExcluindo(true);
    const resposta = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    setExcluindo(false);

    if (resposta.ok) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
      setConfirmando(false);
    } else {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível excluir esta categoria.");
    }
  }

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-2 flex-wrap justify-end">
        {erro ? (
          <span className="text-danger text-xs">{erro}</span>
        ) : (
          <span className="text-base-400 text-xs">Excluir "{nome}"?</span>
        )}
        <button onClick={excluir} disabled={excluindo} className="text-danger font-medium hover:underline text-xs">
          {excluindo ? "Excluindo..." : "Confirmar"}
        </button>
        <button onClick={() => setConfirmando(false)} className="text-base-400 hover:underline text-xs">
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirmando(true)} className="text-danger hover:underline text-xs">
      Excluir
    </button>
  );
}
