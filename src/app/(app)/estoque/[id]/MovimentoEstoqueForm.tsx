"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MovimentoEstoqueForm({ pecaId }: { pecaId: string }) {
  const router = useRouter();
  const [tipo, setTipo] = useState("ENTRADA");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch(`/api/pecas/${pecaId}/movimento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, quantidade: Number(quantidade), motivo }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível registrar a movimentação.");
      return;
    }

    setQuantidade("");
    setMotivo("");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="label-field">Tipo</label>
        <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ENTRADA">Entrada</option>
          <option value="SAIDA">Saída</option>
          <option value="AJUSTE">Ajuste (define o valor exato)</option>
        </select>
      </div>
      <div className="w-32">
        <label className="label-field">Quantidade</label>
        <input
          required
          type="number"
          min={0}
          className="input-field"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
        />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="label-field">Motivo</label>
        <input
          className="input-field"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex: Compra avulsa, inventário, perda"
        />
      </div>
      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Registrando..." : "Registrar"}
      </button>
      {erro && <p className="text-sm text-danger w-full">{erro}</p>}
    </form>
  );
}
