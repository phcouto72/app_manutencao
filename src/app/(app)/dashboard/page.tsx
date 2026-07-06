import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totalEquipamentos,
    equipamentosParados,
    equipamentosEmManutencao,
    totalUsuarios,
    osAbertas,
    osAguardandoPeca,
  ] = await Promise.all([
    prisma.equipamento.count(),
    prisma.equipamento.count({ where: { status: "PARADO" } }),
    prisma.equipamento.count({ where: { status: "EM_MANUTENCAO" } }),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.manutencao.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO"] } } }),
    prisma.manutencao.count({ where: { status: "AGUARDANDO_PECA" } }),
  ]);

  const cartoes = [
    { label: "Equipamentos cadastrados", valor: totalEquipamentos, cor: "text-base-100" },
    { label: "OS abertas / em andamento", valor: osAbertas, cor: "text-info" },
    { label: "OS aguardando peça", valor: osAguardandoPeca, cor: "text-signal" },
    { label: "Equipamentos parados", valor: equipamentosParados, cor: "text-danger" },
  ];

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">PAINEL GERAL</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Visão Geral</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {cartoes.map((c) => (
          <div key={c.label} className="card p-5">
            <p className={`font-display text-4xl font-semibold ${c.cor}`}>{c.valor}</p>
            <p className="text-base-400 text-xs mt-2 uppercase tracking-wide">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-2">
          Próximos passos do projeto
        </h2>
        <p className="text-base-400 text-sm leading-relaxed">
          Fase 2 concluída: ordens de serviço de manutenção (equipamentos e predial), histórico
          por equipamento/local e cadastro de locais. As próximas fases vão habilitar: estoque de
          peças, fornecedores e compras, agendamento de preventivas com aviso por e-mail, e
          relatórios para impressão.
        </p>
      </div>
    </div>
  );
}
