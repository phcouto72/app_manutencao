"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = { id: string; nome: string };

export default function AtualizarManutencaoForm({
  manutencaoId,
  statusAtual,
  descricaoSolucaoAtual,
  custoMaoDeObraAtual,
  custoPecasAtual,
  responsavelIdAtual,
  usuarios,
}: {
  manutencaoId: string;
  statusAtual: string;
  descricaoSolucaoAtual: string;
  custoMaoDeObraAtual: number;
  custoPecasAtual: number;
  responsavelIdAtual: string;
  usuarios: Usuario[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(statusAtual);
  const [descricaoSolucao, setDescricaoSolucao] = useState(descricaoSolucaoAtual);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(String(custoMaoDeObraAtual ?? 0));
  const [custoPecas, setCustoPecas] = useState(String(custoPecasAtual ?? 0));
  const [responsavelId, setResponsavelId] = useState(responsavelIdAtual);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch(`/api/manutencoes/${manutencaoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        descricaoSolucao,
        custoMaoDeObra: Number(custoMaoDeObra) || 0,
        custoPecas: Number(custoPecas) || 0,
        responsavelId: responsavelId || null,
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar as alterações.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Status</label>
          <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ABERTA">Aberta</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="AGUARDANDO_PECA">Aguardando peça</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="label-field">Responsável</label>
          <select
            className="input-field"
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
          >
            <option value="">Não definido</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Custo de mão de obra (R$)</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={custoMaoDeObra}
            onChange={(e) => setCustoMaoDeObra(e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Custo de peças (R$)</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            value={custoPecas}
            onChange={(e) => setCustoPecas(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Descrição da solução aplicada</label>
          <textarea
            className="input-field"
            rows={4}
            value={descricaoSolucao}
            onChange={(e) => setDescricaoSolucao(e.target.value)}
            placeholder="Descreva o que foi feito para resolver o problema..."
          />
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <button type="submit" disabled={salvando} className="btn-primary">
        {salvando ? "Salvando..." : "Salvar atualização"}
      </button>
    </form>
  );
}
