"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditarLocalForm({
  id,
  nomeInicial,
  descricaoInicial,
}: {
  id: string;
  nomeInicial: string;
  descricaoInicial: string;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(nomeInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setSalvando(true);

    const resposta = await fetch(`/api/locais/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível salvar.");
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-md">
      <div>
        <label className="label-field">Nome do local *</label>
        <input required className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label className="label-field">Descrição</label>
        <input className="input-field" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-ok">Alterações salvas.</p>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
