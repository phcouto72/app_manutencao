"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Fornecedor = { id: string; nome: string };
type Peca = { id: string; nome: string; precoMedio: number; unidadeMedida: string };

type ItemPedido = { pecaId: string; quantidade: number; precoUnitario: number };

export default function NovoPedidoCompraForm({
  fornecedores,
  pecas,
}: {
  fornecedores: Fornecedor[];
  pecas: Peca[];
}) {
  const router = useRouter();
  const [fornecedorId, setFornecedorId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([{ pecaId: "", quantidade: 1, precoUnitario: 0 }]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizarItem(index: number, campo: keyof ItemPedido, valor: string | number) {
    setItens((atual) =>
      atual.map((item, i) => (i === index ? { ...item, [campo]: valor } : item))
    );
  }

  function selecionarPeca(index: number, pecaId: string) {
    const peca = pecas.find((p) => p.id === pecaId);
    setItens((atual) =>
      atual.map((item, i) =>
        i === index ? { ...item, pecaId, precoUnitario: peca ? Number(peca.precoMedio) : 0 } : item
      )
    );
  }

  function adicionarItem() {
    setItens((atual) => [...atual, { pecaId: "", quantidade: 1, precoUnitario: 0 }]);
  }

  function removerItem(index: number) {
    setItens((atual) => atual.filter((_, i) => i !== index));
  }

  const valorTotal = itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!fornecedorId) {
      setErro("Selecione um fornecedor.");
      return;
    }
    if (itens.some((i) => !i.pecaId)) {
      setErro("Selecione a peça em todos os itens, ou remova as linhas vazias.");
      return;
    }

    setSalvando(true);

    const resposta = await fetch("/api/pedidos-compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fornecedorId, observacoes, itens }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível criar o pedido. Verifique os dados.");
      return;
    }

    router.push("/compras");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div>
        <label className="label-field">Fornecedor *</label>
        <select
          required
          className="input-field"
          value={fornecedorId}
          onChange={(e) => setFornecedorId(e.target.value)}
        >
          <option value="">Selecione...</option>
          {fornecedores.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field mb-2">Itens do pedido</label>
        <div className="space-y-3">
          {itens.map((item, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3 card p-3">
              <div className="flex-1 min-w-[180px]">
                <label className="label-field">Peça</label>
                <select
                  className="input-field"
                  value={item.pecaId}
                  onChange={(e) => selecionarPeca(index, e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {pecas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="label-field">Qtd.</label>
                <input
                  type="number"
                  min={1}
                  className="input-field"
                  value={item.quantidade}
                  onChange={(e) => atualizarItem(index, "quantidade", Number(e.target.value))}
                />
              </div>
              <div className="w-32">
                <label className="label-field">Preço unit. (R$)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input-field"
                  value={item.precoUnitario}
                  onChange={(e) => atualizarItem(index, "precoUnitario", Number(e.target.value))}
                />
              </div>
              <button
                type="button"
                onClick={() => removerItem(index)}
                className="text-danger text-sm hover:underline pb-2"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={adicionarItem} className="btn-secondary mt-3">
          + Adicionar item
        </button>
      </div>

      <div>
        <label className="label-field">Observações</label>
        <textarea
          className="input-field"
          rows={2}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <div className="card p-4 flex items-center justify-between">
        <span className="text-base-400 text-sm">Valor total estimado</span>
        <span className="font-display text-2xl font-semibold">
          {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Criando..." : "Criar pedido"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
