"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PecaDados = {
  id?: string;
  codigo?: string | null;
  nome: string;
  descricao?: string | null;
  unidadeMedida: string;
  quantidadeMin: number;
  quantidadeAtual: number;
  localizacaoEstoque?: string | null;
  precoMedio: number;
};

export default function PecaForm({ peca }: { peca?: PecaDados }) {
  const router = useRouter();
  const ehEdicao = Boolean(peca?.id);
  const [dados, setDados] = useState<PecaDados>(
    peca ?? {
      codigo: "",
      nome: "",
      descricao: "",
      unidadeMedida: "UN",
      quantidadeMin: 0,
      quantidadeAtual: 0,
      localizacaoEstoque: "",
      precoMedio: 0,
    }
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof PecaDados>(campo: K, valor: PecaDados[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const url = ehEdicao ? `/api/pecas/${peca!.id}` : "/api/pecas";
    const metodo = ehEdicao ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...dados,
        quantidadeMin: Number(dados.quantidadeMin),
        quantidadeAtual: Number(dados.quantidadeAtual),
        precoMedio: Number(dados.precoMedio),
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível salvar. Verifique os dados.");
      return;
    }

    router.push("/estoque");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label-field">Nome da peça *</label>
          <input
            required
            className="input-field"
            value={dados.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex: Rolamento 6205, Fusível 10A"
          />
        </div>

        <div>
          <label className="label-field">Código interno</label>
          <input
            className="input-field"
            value={dados.codigo ?? ""}
            onChange={(e) => atualizar("codigo", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Unidade de medida</label>
          <select
            className="input-field"
            value={dados.unidadeMedida}
            onChange={(e) => atualizar("unidadeMedida", e.target.value)}
          >
            <option value="UN">Unidade</option>
            <option value="M">Metro</option>
            <option value="KG">Quilograma</option>
            <option value="L">Litro</option>
            <option value="CX">Caixa</option>
            <option value="PAR">Par</option>
          </select>
        </div>

        {!ehEdicao && (
          <div>
            <label className="label-field">Quantidade inicial em estoque</label>
            <input
              type="number"
              min={0}
              className="input-field"
              value={dados.quantidadeAtual}
              onChange={(e) => atualizar("quantidadeAtual", Number(e.target.value))}
            />
          </div>
        )}

        <div>
          <label className="label-field">Quantidade mínima (ponto de pedido)</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={dados.quantidadeMin}
            onChange={(e) => atualizar("quantidadeMin", Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label-field">Preço médio (R$)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="input-field"
            value={dados.precoMedio}
            onChange={(e) => atualizar("precoMedio", Number(e.target.value))}
          />
        </div>

        <div>
          <label className="label-field">Localização no estoque</label>
          <input
            className="input-field"
            value={dados.localizacaoEstoque ?? ""}
            onChange={(e) => atualizar("localizacaoEstoque", e.target.value)}
            placeholder="Ex: Prateleira A3"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Descrição</label>
          <textarea
            className="input-field"
            rows={2}
            value={dados.descricao ?? ""}
            onChange={(e) => atualizar("descricao", e.target.value)}
          />
        </div>
      </div>

      {ehEdicao && (
        <p className="text-xs text-base-400">
          A quantidade em estoque só muda por movimentações (entrada/saída/ajuste), registradas na
          tela de detalhe da peça — assim mantemos o histórico correto.
        </p>
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Salvando..." : "Salvar peça"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
