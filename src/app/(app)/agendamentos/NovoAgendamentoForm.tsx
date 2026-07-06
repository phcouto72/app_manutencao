"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Equipamento = { id: string; nome: string };

export default function NovoAgendamentoForm({ equipamentos }: { equipamentos: Equipamento[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [equipamentoId, setEquipamentoId] = useState("");
  const [dataPrevista, setDataPrevista] = useState("");
  const [notificarPorEmail, setNotificarPorEmail] = useState(true);
  const [diasAntecedenciaAviso, setDiasAntecedenciaAviso] = useState(3);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        equipamentoId: equipamentoId || null,
        dataPrevista,
        notificarPorEmail,
        diasAntecedenciaAviso: Number(diasAntecedenciaAviso),
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível criar o agendamento. Verifique os dados.");
      return;
    }

    router.push("/agendamentos");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label-field">Título *</label>
          <input
            required
            className="input-field"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Inspeção anual do quadro elétrico"
          />
        </div>

        <div>
          <label className="label-field">Equipamento (opcional)</label>
          <select
            className="input-field"
            value={equipamentoId}
            onChange={(e) => setEquipamentoId(e.target.value)}
          >
            <option value="">Nenhum específico</option>
            {equipamentos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-field">Data prevista *</label>
          <input
            required
            type="date"
            className="input-field"
            value={dataPrevista}
            onChange={(e) => setDataPrevista(e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Avisar com quantos dias de antecedência</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={diasAntecedenciaAviso}
            onChange={(e) => setDiasAntecedenciaAviso(Number(e.target.value))}
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="notificar"
            type="checkbox"
            checked={notificarPorEmail}
            onChange={(e) => setNotificarPorEmail(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="notificar" className="text-sm">
            Enviar aviso por e-mail
          </label>
        </div>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Criando..." : "Criar agendamento"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
