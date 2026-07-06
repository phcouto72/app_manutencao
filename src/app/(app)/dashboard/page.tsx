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
    pecas,
    agendamentosVencidos,
  ] = await Promise.all([
    prisma.equipamento.count(),
    prisma.equipamento.count({ where: { status: "PARADO" } }),
    prisma.equipamento.count({ where: { status: "EM_MANUTENCAO" } }),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.manutencao.count({ where: { status: { in: ["ABERTA", "EM_ANDAMENTO"] } } }),
    prisma.manutencao.count({ where: { status: "AGUARDANDO_PECA" } }),
    prisma.peca.findMany({ select: { quantidadeAtual: true, quantidadeMin: true } }),
    prisma.agendamento.count({
      where: { status: { in: ["PENDENTE", "NOTIFICADO"] }, dataPrevista: { lt: new Date() } },
    }),
  ]);

  const pecasEmFalta = pecas.filter((p) => p.quantidadeAtual <= p.quantidadeMin).length;

  const cartoes = [
    { label: "Equipamentos cadastrados", valor: totalEquipamentos, cor: "text-base-100" },
    { label: "OS abertas / em andamento", valor: osAbertas, cor: "text-info" },
    { label: "Agendamentos vencidos", valor: agendamentosVencidos, cor: "text-danger" },
    { label: "Peças no ponto de pedido", valor: pecasEmFalta, cor: "text-signal" },
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
          Sobre o sistema
        </h2>
        <p className="text-base-400 text-sm leading-relaxed">
          Este sistema centraliza o controle de manutenção da empresa: cadastro de equipamentos
          (com hierarquia entre eles), ordens de serviço para manutenções corretivas, preventivas
          e prediais, estoque de peças com movimentações automáticas, fornecedores e pedidos de
          compra, agendamento de preventivas com aviso por e-mail, checklists técnicos, anexos de
          fotos e documentos por OS, e relatórios com indicadores (MTTR, MTBF, disponibilidade,
          custos) prontos para impressão. O acesso é organizado por perfil de usuário
          (Administrador, Gestor, Técnico e Visualizador), garantindo que cada pessoa veja e faça
          apenas o que precisa.
        </p>
      </div>
    </div>
  );
}
