"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ExcluirEquipamentoBotao({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  async function excluir() {
    const resposta = await fetch(`/api/equipamentos/${id}`, { method: "DELETE" });
    if (resposta.ok) {
      router.refresh();
    } else {
      alert("Não foi possível excluir este equipamento.");
    }
    setConfirmando(false);
  }

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-base-400">Excluir "{nome}"?</span>
        <button onClick={excluir} className="text-danger font-medium hover:underline">
          Confirmar
        </button>
        <button onClick={() => setConfirmando(false)} className="text-base-400 hover:underline">
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirmando(true)} className="text-danger hover:underline">
      Excluir
    </button>
  );
}
