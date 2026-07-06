"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Peca = { id: string; nome: string; quantidadeAtual: number; unidadeMedida: string };

export default function UsoPecasForm({
  manutencaoId,
  pecas,
}: {
  manutencaoId: string;
  pecas: Peca[];
}) {
  const router = useRouter();
  const [pecaId, setPecaId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!pecaId) {
      setErro("Selecione uma peça.");
      return;
    }

    setSalvando(true);
    const resposta = await fetch(`/api/manutencoes/${manutencaoId}/pecas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pecaId, quantidade }),
    });
    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível registrar o uso da peça.");
      return;
    }

    setPecaId("");
    setQuantidade(1);
    router.refresh();
  }

  return (
    <form onSubmit={registrar} className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[180px]">
        <label className="label-field">Peça usada</label>
        <select className="input-field" value={pecaId} onChange={(e) => setPecaId(e.target.value)}>
          <option value="">Selecione...</option>
          {pecas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} (disponível: {p.quantidadeAtual} {p.unidadeMedida})
            </option>
          ))}
        </select>
      </div>
      <div className="w-28">
        <label className="label-field">Quantidade</label>
        <input
          type="number"
          min={1}
          className="input-field"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />
      </div>
      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Registrando..." : "Registrar uso"}
      </button>
      {erro && <p className="text-sm text-danger w-full">{erro}</p>}
    </form>
  );
}
