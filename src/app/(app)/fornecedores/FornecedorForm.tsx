"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mascararTelefone, mascararCpfOuCnpj } from "@/lib/mascaras";

type FornecedorDados = {
  id?: string;
  nome: string;
  cnpjCpf?: string | null;
  contatoNome?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  observacoes?: string | null;
};

export default function FornecedorForm({ fornecedor }: { fornecedor?: FornecedorDados }) {
  const router = useRouter();
  const ehEdicao = Boolean(fornecedor?.id);
  const [dados, setDados] = useState<FornecedorDados>(
    fornecedor ?? {
      nome: "",
      cnpjCpf: "",
      contatoNome: "",
      telefone: "",
      email: "",
      endereco: "",
      observacoes: "",
    }
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof FornecedorDados>(campo: K, valor: FornecedorDados[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const url = ehEdicao ? `/api/fornecedores/${fornecedor!.id}` : "/api/fornecedores";
    const metodo = ehEdicao ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar. Verifique os dados.");
      return;
    }

    router.push("/fornecedores");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label-field">Nome / Razão social *</label>
          <input
            required
            className="input-field"
            value={dados.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">CNPJ / CPF</label>
          <input
            className="input-field"
            value={dados.cnpjCpf ?? ""}
            onChange={(e) => atualizar("cnpjCpf", mascararCpfOuCnpj(e.target.value))}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        <div>
          <label className="label-field">Nome do contato</label>
          <input
            className="input-field"
            value={dados.contatoNome ?? ""}
            onChange={(e) => atualizar("contatoNome", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Telefone</label>
          <input
            className="input-field"
            value={dados.telefone ?? ""}
            onChange={(e) => atualizar("telefone", mascararTelefone(e.target.value))}
            placeholder="(00) 00000-0000"
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

        <div className="md:col-span-2">
          <label className="label-field">Endereço</label>
          <input
            className="input-field"
            value={dados.endereco ?? ""}
            onChange={(e) => atualizar("endereco", e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Observações</label>
          <textarea
            className="input-field"
            rows={2}
            value={dados.observacoes ?? ""}
            onChange={(e) => atualizar("observacoes", e.target.value)}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Salvando..." : "Salvar fornecedor"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
