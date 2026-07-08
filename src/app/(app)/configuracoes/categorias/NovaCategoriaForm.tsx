"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovaCategoriaForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aberto, setAberto] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível salvar.");
      return;
    }

    setNome("");
    setDescricao("");
    setAberto(false);
    router.refresh();
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className="btn-primary">
        + Nova categoria
      </button>
    );
  }

  return (
    <form onSubmit={salvar} className="card p-5 space-y-3 max-w-md">
      <div>
        <label className="label-field">Nome da categoria *</label>
        <input
          required
          autoFocus
          className="input-field"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Compressor, Motor, Ar condicionado"
        />
      </div>
      <div>
        <label className="label-field">Descrição</label>
        <input
          className="input-field"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      {erro && <p className="text-sm text-danger">{erro}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Salvando..." : "Salvar categoria"}
        </button>
        <button type="button" onClick={() => setAberto(false)} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
