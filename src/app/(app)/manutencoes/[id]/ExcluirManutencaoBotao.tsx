"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExcluirManutencaoBotao({ id }: { id: string }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    setExcluindo(true);
    const resposta = await fetch(`/api/manutencoes/${id}`, { method: "DELETE" });
    setExcluindo(false);

    if (resposta.ok) {
      router.push("/manutencoes");
      router.refresh();
    } else {
      alert("Não foi possível excluir esta OS.");
    }
  }

  if (confirmando) {
    return (
      <span className="inline-flex items-center gap-3 text-sm">
        <span className="text-base-400">
          Excluir esta OS? Se o equipamento não tiver outra OS aberta, ele volta a ficar operante.
        </span>
        <button onClick={excluir} disabled={excluindo} className="text-danger font-medium hover:underline whitespace-nowrap">
          {excluindo ? "Excluindo..." : "Confirmar exclusão"}
        </button>
        <button onClick={() => setConfirmando(false)} className="text-base-400 hover:underline whitespace-nowrap">
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <button onClick={() => setConfirmando(true)} className="text-danger text-sm hover:underline">
      Excluir OS
    </button>
  );
}
