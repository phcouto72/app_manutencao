"use client";

import { useState } from "react";

export default function TrocarSenhaForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (novaSenha !== confirmarSenha) {
      setErro("A confirmação não coincide com a nova senha.");
      return;
    }

    setSalvando(true);
    const resposta = await fetch("/api/perfil/senha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível trocar a senha.");
      return;
    }

    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setSucesso(true);
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-sm">
      <div>
        <label className="label-field">Senha atual</label>
        <input
          required
          type="password"
          className="input-field"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Nova senha</label>
        <input
          required
          type="password"
          minLength={6}
          className="input-field"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Confirmar nova senha</label>
        <input
          required
          type="password"
          minLength={6}
          className="input-field"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
        />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-ok">Senha alterada com sucesso.</p>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Salvando..." : "Trocar senha"}
      </button>
    </form>
  );
}
