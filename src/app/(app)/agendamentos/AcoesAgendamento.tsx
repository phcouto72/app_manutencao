"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcoesAgendamento({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function gerarOS() {
    setCarregando(true);
    const resposta = await fetch(`/api/agendamentos/${id}/gerar-os`, { method: "POST" });
    setCarregando(false);

    if (resposta.ok) {
      const manutencao = await resposta.json();
      router.push(`/manutencoes/${manutencao.id}`);
    } else {
      alert("Não foi possível gerar a OS.");
    }
  }

  async function cancelar() {
    if (!confirm("Cancelar este agendamento?")) return;
    setCarregando(true);
    const resposta = await fetch(`/api/agendamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELADO" }),
    });
    setCarregando(false);
    if (resposta.ok) router.refresh();
  }

  if (status === "CONCLUIDO" || status === "CANCELADO") {
    return <span className="text-base-500 text-xs">—</span>;
  }

  return (
    <div className="flex gap-3 justify-end text-xs">
      <button disabled={carregando} onClick={gerarOS} className="text-signal hover:underline">
        Gerar OS
      </button>
      <button disabled={carregando} onClick={cancelar} className="text-danger hover:underline">
        Cancelar
      </button>
    </div>
  );
}
