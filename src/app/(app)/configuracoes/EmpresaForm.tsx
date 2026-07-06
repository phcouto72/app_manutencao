"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EmpresaDados = {
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
};

export default function EmpresaForm({ config }: { config: EmpresaDados }) {
  const router = useRouter();
  const [dados, setDados] = useState(config);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof EmpresaDados>(campo: K, valor: EmpresaDados[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setSalvando(true);

    const resposta = await fetch("/api/empresa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar.");
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-lg">
      <div>
        <label className="label-field">Nome da empresa *</label>
        <input
          required
          className="input-field"
          value={dados.nome}
          onChange={(e) => atualizar("nome", e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">CNPJ</label>
        <input
          className="input-field"
          value={dados.cnpj ?? ""}
          onChange={(e) => atualizar("cnpj", e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Endereço</label>
        <input
          className="input-field"
          value={dados.endereco ?? ""}
          onChange={(e) => atualizar("endereco", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label-field">Telefone</label>
          <input
            className="input-field"
            value={dados.telefone ?? ""}
            onChange={(e) => atualizar("telefone", e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">E-mail</label>
          <input
            type="email"
            className="input-field"
            value={dados.email ?? ""}
            onChange={(e) => atualizar("email", e.target.value)}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-ok">Dados salvos.</p>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Salvando..." : "Salvar dados da empresa"}
      </button>
    </form>
  );
}
