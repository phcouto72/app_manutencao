"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AtualizarStatusPedido({
  pedidoId,
  statusAtual,
}: {
  pedidoId: string;
  statusAtual: string;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function mudarStatus(novoStatus: string) {
    if (novoStatus === "RECEBIDO") {
      const confirmar = confirm(
        "Confirmar recebimento? Isso vai dar entrada automática das quantidades no estoque."
      );
      if (!confirmar) return;
    }

    setErro(null);
    setSalvando(true);

    const resposta = await fetch(`/api/pedidos-compra/${pedidoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível atualizar o status.");
      return;
    }

    router.refresh();
  }

  const opcoes = [
    { valor: "ORCAMENTO", texto: "Orçamento" },
    { valor: "APROVADO", texto: "Aprovado" },
    { valor: "ENVIADO", texto: "Enviado" },
    { valor: "RECEBIDO", texto: "Recebido" },
    { valor: "CANCELADO", texto: "Cancelado" },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            disabled={salvando || statusAtual === "RECEBIDO"}
            onClick={() => mudarStatus(o.valor)}
            className={`px-3 py-1.5 rounded text-xs border transition-colors ${
              statusAtual === o.valor
                ? "border-signal text-signal bg-base-800"
                : "border-base-700 text-base-400 hover:text-base-100 disabled:opacity-40"
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
      {statusAtual === "RECEBIDO" && (
        <p className="text-xs text-base-400 mt-2">
          Pedido já recebido — o estoque já foi atualizado, status não pode mais ser alterado.
        </p>
      )}
      {erro && <p className="text-sm text-danger mt-2">{erro}</p>}
    </div>
  );
}
