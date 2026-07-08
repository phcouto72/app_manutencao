"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Local = { id: string; nome: string };
type Categoria = { id: string; nome: string };

type EquipamentoDados = {
  id?: string;
  nome: string;
  codigoPatrimonio?: string | null;
  categoria?: string | null;
  categoriaId?: string | null;
  fabricante?: string | null;
  modelo?: string | null;
  numeroSerie?: string | null;
  status: string;
  criticidade: number;
  localId?: string | null;
  equipamentoPaiId?: string | null;
  observacoes?: string | null;
};

export default function EquipamentoForm({
  locais,
  categorias,
  equipamento,
  equipamentosParaHierarquia,
}: {
  locais: Local[];
  categorias: Categoria[];
  equipamento?: EquipamentoDados;
  equipamentosParaHierarquia: { id: string; nome: string }[];
}) {
  const router = useRouter();
  const [dados, setDados] = useState<EquipamentoDados>(
    equipamento ?? {
      nome: "",
      codigoPatrimonio: "",
      categoriaId: "",
      fabricante: "",
      modelo: "",
      numeroSerie: "",
      status: "OPERANTE",
      criticidade: 2,
      localId: "",
      equipamentoPaiId: "",
      observacoes: "",
    }
  );
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar<K extends keyof EquipamentoDados>(campo: K, valor: EquipamentoDados[K]) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const url = equipamento?.id ? `/api/equipamentos/${equipamento.id}` : "/api/equipamentos";
    const metodo = equipamento?.id ? "PUT" : "POST";

    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...dados,
        criticidade: Number(dados.criticidade),
        localId: dados.localId || null,
        equipamentoPaiId: dados.equipamentoPaiId || null,
        categoriaId: dados.categoriaId || null,
        codigoPatrimonio: dados.codigoPatrimonio || null,
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      const mensagem =
        typeof corpo?.erro === "string"
          ? corpo.erro
          : corpo?.erro
            ? "Verifique os campos destacados e tente novamente."
            : "Não foi possível salvar. Verifique os dados.";
      setErro(mensagem);
      return;
    }

    router.push("/equipamentos");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label-field">Nome do equipamento *</label>
          <input
            required
            className="input-field"
            value={dados.nome}
            onChange={(e) => atualizar("nome", e.target.value)}
            placeholder="Ex: Compressor de ar 20HP"
          />
        </div>

        <div>
          <label className="label-field">Código de patrimônio</label>
          <input
            className="input-field"
            value={dados.codigoPatrimonio ?? ""}
            onChange={(e) => atualizar("codigoPatrimonio", e.target.value)}
            placeholder="Ex: PAT-0042"
          />
        </div>

        <div>
          <label className="label-field">Categoria</label>
          <select
            className="input-field"
            value={dados.categoriaId ?? ""}
            onChange={(e) => atualizar("categoriaId", e.target.value)}
          >
            <option value="">Selecione...</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {categorias.length === 0 && (
            <p className="text-xs text-base-400 mt-1">
              Nenhuma categoria cadastrada ainda — crie em Configurações → Categorias.
            </p>
          )}
          {!dados.categoriaId && dados.categoria && (
            <p className="text-xs text-signal mt-1">
              Categoria antiga (texto livre): "{dados.categoria}" — escolha a correspondente acima.
            </p>
          )}
        </div>

        <div>
          <label className="label-field">Fabricante</label>
          <input
            className="input-field"
            value={dados.fabricante ?? ""}
            onChange={(e) => atualizar("fabricante", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Modelo</label>
          <input
            className="input-field"
            value={dados.modelo ?? ""}
            onChange={(e) => atualizar("modelo", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Número de série</label>
          <input
            className="input-field"
            value={dados.numeroSerie ?? ""}
            onChange={(e) => atualizar("numeroSerie", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Local</label>
          <select
            className="input-field"
            value={dados.localId ?? ""}
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

        <div>
          <label className="label-field">Status</label>
          <select
            className="input-field"
            value={dados.status}
            onChange={(e) => atualizar("status", e.target.value)}
          >
            <option value="OPERANTE">Operante</option>
            <option value="EM_MANUTENCAO">Em manutenção</option>
            <option value="PARADO">Parado</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <div>
          <label className="label-field">Criticidade</label>
          <select
            className="input-field"
            value={dados.criticidade}
            onChange={(e) => atualizar("criticidade", Number(e.target.value))}
          >
            <option value={1}>Baixa</option>
            <option value={2}>Média</option>
            <option value={3}>Alta</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Equipamento pai (opcional)</label>
          <select
            className="input-field"
            value={dados.equipamentoPaiId ?? ""}
            onChange={(e) => atualizar("equipamentoPaiId", e.target.value)}
          >
            <option value="">Nenhum — este é um equipamento independente</option>
            {equipamentosParaHierarquia
              .filter((eq) => eq.id !== equipamento?.id)
              .map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.nome}
                </option>
              ))}
          </select>
          <p className="text-xs text-base-400 mt-1">
            Use isso para representar um subconjunto/componente de outro equipamento (ex: motor
            de uma máquina maior).
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Observações</label>
          <textarea
            className="input-field"
            rows={3}
            value={dados.observacoes ?? ""}
            onChange={(e) => atualizar("observacoes", e.target.value)}
          />
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Salvando..." : "Salvar equipamento"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
