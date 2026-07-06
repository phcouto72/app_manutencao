"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Equipamento = { id: string; nome: string };

export default function NovoPlanoPreventivoForm({ equipamentos }: { equipamentos: Equipamento[] }) {
  const router = useRouter();
  const [dados, setDados] = useState({
    equipamentoId: "",
    titulo: "",
    descricao: "",
    frequenciaTipo: "MESES",
    frequenciaValor: 6,
    notificarPorEmail: true,
    diasAntecedenciaAviso: 3,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function atualizar(campo: string, valor: any) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);

    const resposta = await fetch("/api/planos-preventivos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...dados,
        frequenciaValor: Number(dados.frequenciaValor),
        diasAntecedenciaAviso: Number(dados.diasAntecedenciaAviso),
      }),
    });

    setSalvando(false);

    if (!resposta.ok) {
      setErro("Não foi possível criar o plano. Verifique os dados.");
      return;
    }

    router.push("/planos-preventivos");
    router.refresh();
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="md:col-span-2">
          <label className="label-field">Título do plano *</label>
          <input
            required
            className="input-field"
            value={dados.titulo}
            onChange={(e) => atualizar("titulo", e.target.value)}
            placeholder="Ex: Troca de óleo, Lubrificação de rolamentos"
          />
        </div>

        <div>
          <label className="label-field">Repetir a cada</label>
          <input
            type="number"
            min={1}
            className="input-field"
            value={dados.frequenciaValor}
            onChange={(e) => atualizar("frequenciaValor", e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">Unidade</label>
          <select
            className="input-field"
            value={dados.frequenciaTipo}
            onChange={(e) => atualizar("frequenciaTipo", e.target.value)}
          >
            <option value="DIAS">Dias</option>
            <option value="SEMANAS">Semanas</option>
            <option value="MESES">Meses</option>
            <option value="HORAS_USO">Horas de uso (agendamento manual)</option>
          </select>
        </div>

        <div>
          <label className="label-field">Avisar com quantos dias de antecedência</label>
          <input
            type="number"
            min={0}
            className="input-field"
            value={dados.diasAntecedenciaAviso}
            onChange={(e) => atualizar("diasAntecedenciaAviso", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 pt-6">
          <input
            id="notificar"
            type="checkbox"
            checked={dados.notificarPorEmail}
            onChange={(e) => atualizar("notificarPorEmail", e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="notificar" className="text-sm">
            Enviar aviso por e-mail
          </label>
        </div>

        <div className="md:col-span-2">
          <label className="label-field">Descrição</label>
          <textarea
            className="input-field"
            rows={2}
            value={dados.descricao}
            onChange={(e) => atualizar("descricao", e.target.value)}
          />
        </div>
      </div>

      {dados.frequenciaTipo === "HORAS_USO" && (
        <p className="text-xs text-signal">
          Atenção: este sistema ainda não acompanha o horímetro do equipamento automaticamente.
          Para "horas de uso", você vai precisar criar os agendamentos manualmente na tela de
          Agendamentos, com base na leitura do equipamento.
        </p>
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? "Criando..." : "Criar plano"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
