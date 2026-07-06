"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Equipamento = { id: string; nome: string };
type Local = { id: string; nome: string };
type Usuario = { id: string; nome: string };

export default function NovaManutencaoForm({
  equipamentos,
  locais,
  usuarios,
}: {
  equipamentos: Equipamento[];
  locais: Local[];
  usuarios: Usuario[];
}) {
  const router = useRouter();
  const [alvo, setAlvo] = useState<"equipamento" | "predial">("equipamento");
  const [dados, setDados] = useState({
    tipo: "CORRETIVA",
    categoriaServico: "MECANICA",
    titulo: "",
    descricaoProblema: "",
    equipamentoId: "",
    localId: "",
    responsavelId: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo: string, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const corpo = {
      ...dados,
      equipamentoId: alvo === "equipamento" ? dados.equipamentoId || null : null,
      localId: alvo === "predial" ? dados.localId || null : null,
      responsavelId: dados.responsavelId || null,
    };

    const resposta = await fetch("/api/manutencoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpoErro = await resposta.json().catch(() => ({}));
      setErro(corpoErro?.erro?.formErrors?.[0] || "Não foi possível abrir a OS. Verifique os dados.");
      return;
    }

    router.push("/manutencoes");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div>
        <label className="label-field">Esta manutenção é sobre:</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAlvo("equipamento")}
            className={`px-4 py-2 rounded text-sm border ${
              alvo === "equipamento"
                ? "border-signal text-signal bg-base-800"
                : "border-base-700 text-base-400"
            }`}
          >
            Um equipamento
          </button>
          <button
            type="button"
            onClick={() => setAlvo("predial")}
            className={`px-4 py-2 rounded text-sm border ${
              alvo === "predial"
                ? "border-signal text-signal bg-base-800"
                : "border-base-700 text-base-400"
            }`}
          >
            Estrutura predial (elétrica, hidráulica, civil...)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alvo === "equipamento" ? (
          <div className="md:col-span-2">
            <label className="label-field">Equipamento *</label>
            <select
              required
              className="input-field"
              value={dados.equipamentoId}
              onChange={(e) => atualizar("equipamentoId", e.target.value)}
            >
              <option value="">Selecione...</option>
              {equipamentos.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="md:col-span-2">
            <label className="label-field">Local *</label>
            <select
              required
              className="input-field"
              value={dados.localId}
              onChange={(e) => atualizar("localId", e.target.value)}
            >
              <option value="">Selecione...</option>
              {locais.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="label-field">Título da OS *</label>
          <input
            required
            className="input-field"
            value={dados.titulo}
            onChange={(e) => atualizar("titulo", e.target.value)}
            placeholder="Ex: Vazamento na tubulação do banheiro do 2º andar"
          />
        </div>

        <div>
          <label className="label-field">Tipo de manutenção</label>
          <select
            className="input-field"
            value={dados.tipo}
            onChange={(e) => atualizar("tipo", e.target.value)}
          >
            <option value="CORRETIVA">Corretiva</option>
            <option value="PREVENTIVA">Preventiva</option>
            <option value="PREDITIVA">Preditiva</option>
          </select>
        </div>

        <div>
          <label className="label-field">Categoria do serviço</label>
          <select
            className="input-field"
            value={dados.categoriaServico}
            onChange={(e) => atualizar("categoriaServico", e.target.value)}
          >
            <option value="MECANICA">Mecânica</option>
            <option value="ELETRICA">Elétrica</option>
            <option value="HIDRAULICA">Hidráulica</option>
            <option value="CIVIL">Civil</option>
            <option value="ELETRONICA">Eletrônica</option>
            <option value="OUTRO">Outro</option>
          </select>
        </div>

        <div>
          <label className="label-field">Responsável</label>
          <select
            className="input-field"
            value={dados.responsavelId}
            onChange={(e) => atualizar("responsavelId", e.target.value)}
          >
            <option value="">Não definido</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Descrição do problema</label>
          <textarea
            className="input-field"
            rows={3}
            value={dados.descricaoProblema}
            onChange={(e) => atualizar("descricaoProblema", e.target.value)}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Abrindo OS..." : "Abrir ordem de serviço"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
