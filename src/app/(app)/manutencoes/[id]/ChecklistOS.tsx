"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; descricao: string; concluido: boolean };

export default function ChecklistOS({
  manutencaoId,
  itensIniciais,
}: {
  manutencaoId: string;
  itensIniciais: Item[];
}) {
  const router = useRouter();
  const [novoItem, setNovoItem] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function adicionarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!novoItem.trim()) return;
    setSalvando(true);
    await fetch(`/api/manutencoes/${manutencaoId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descricao: novoItem }),
    });
    setSalvando(false);
    setNovoItem("");
    router.refresh();
  }

  async function alternar(item: Item) {
    await fetch(`/api/manutencoes/${manutencaoId}/checklist/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: !item.concluido }),
    });
    router.refresh();
  }

  async function remover(itemId: string) {
    await fetch(`/api/manutencoes/${manutencaoId}/checklist/${itemId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {itensIniciais.length > 0 && (
        <ul className="space-y-2 mb-4">
          {itensIniciais.map((item) => (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={item.concluido}
                onChange={() => alternar(item)}
                className="w-4 h-4"
              />
              <span className={item.concluido ? "line-through text-base-500" : ""}>
                {item.descricao}
              </span>
              <button
                onClick={() => remover(item.id)}
                className="text-danger text-xs hover:underline ml-auto"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={adicionarItem} className="flex gap-2">
        <input
          className="input-field"
          value={novoItem}
          onChange={(e) => setNovoItem(e.target.value)}
          placeholder="Ex: Verificar nível de óleo"
        />
        <button type="submit" disabled={salvando} className="btn-secondary whitespace-nowrap">
          + Item
        </button>
      </form>
    </div>
  );
}
