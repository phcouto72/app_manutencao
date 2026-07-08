"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoUsuarioForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState("TECNICO");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, papel }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível criar o usuário.");
      return;
    }

    router.push("/configuracoes/usuarios");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-md">
      <div>
        <label className="label-field">Nome *</label>
        <input required className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div>
        <label className="label-field">E-mail *</label>
        <input
          required
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Senha inicial *</label>
        <input
          required
          type="password"
          minLength={6}
          className="input-field"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Função</label>
        <select className="input-field" value={papel} onChange={(e) => setPapel(e.target.value)}>
          <option value="ADMIN">Administrador — acesso total</option>
          <option value="GESTOR">Gestor — gerencia tudo, exceto usuários</option>
          <option value="TECNICO">Técnico — executa e registra manutenções</option>
          <option value="VISUALIZADOR">Visualizador — apenas consulta</option>
        </select>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Criando..." : "Criar usuário"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
