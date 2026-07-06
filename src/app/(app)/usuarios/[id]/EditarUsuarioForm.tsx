"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
};

export default function EditarUsuarioForm({
  usuario,
  ehVocêMesmo,
}: {
  usuario: Usuario;
  ehVocêMesmo: boolean;
}) {
  const router = useRouter();
  const [nome, setNome] = useState(usuario.nome);
  const [papel, setPapel] = useState(usuario.papel);
  const [ativo, setAtivo] = useState(usuario.ativo);
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setSalvando(true);

    const resposta = await fetch(`/api/usuarios/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, papel, ativo, novaSenha: novaSenha || undefined }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível salvar.");
      return;
    }

    setNovaSenha("");
    setSucesso(true);
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-4 max-w-md">
      <div>
        <label className="label-field">Nome</label>
        <input required className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>

      <div>
        <label className="label-field">E-mail</label>
        <input className="input-field opacity-60" value={usuario.email} disabled />
      </div>

      <div>
        <label className="label-field">Função</label>
        <select
          className="input-field"
          value={papel}
          onChange={(e) => setPapel(e.target.value)}
          disabled={ehVocêMesmo}
        >
          <option value="ADMIN">Administrador — acesso total</option>
          <option value="GESTOR">Gestor — gerencia tudo, exceto usuários</option>
          <option value="TECNICO">Técnico — executa e registra manutenções</option>
          <option value="VISUALIZADOR">Visualizador — apenas consulta</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="ativo"
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          disabled={ehVocêMesmo}
          className="w-4 h-4"
        />
        <label htmlFor="ativo" className="text-sm">
          Usuário ativo (desmarque para bloquear o acesso sem excluir o cadastro)
        </label>
      </div>

      {ehVocêMesmo && (
        <p className="text-xs text-base-400">
          Você não pode mudar sua própria função ou se desativar por aqui — peça a outro
          administrador, se precisar.
        </p>
      )}

      <div className="pt-2 border-t border-base-700">
        <label className="label-field">Definir nova senha (opcional)</label>
        <input
          type="password"
          minLength={6}
          className="input-field"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Deixe em branco para não alterar"
        />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-ok">Alterações salvas.</p>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
