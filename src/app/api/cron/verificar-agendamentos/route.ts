import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enviarEmail } from "@/lib/email";

// Este endpoint não usa login de usuário — ele é chamado por um cron externo
// (ex: cron-job.org, ou o recurso de Cron do EasyPanel), por isso é protegido
// por um segredo compartilhado (CRON_SECRET), e não por sessão.
export async function GET(req: NextRequest) {
  const segredoEsperado = process.env.CRON_SECRET;
  const segredoRecebido = req.nextUrl.searchParams.get("secret");

  if (!segredoEsperado || segredoRecebido !== segredoEsperado) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const agendamentosPendentes = await prisma.agendamento.findMany({
    where: { status: { in: ["PENDENTE", "NOTIFICADO"] }, notificarPorEmail: true },
    include: { equipamento: true },
  });

  const destinatarios = await prisma.usuario.findMany({
    where: { ativo: true, papel: { in: ["ADMIN", "GESTOR"] } },
    select: { email: true },
  });
  const emailsDestino = destinatarios.map((u) => u.email);

  const resultados: { agendamentoId: string; enviado: boolean; motivo?: string }[] = [];

  for (const agendamento of agendamentosPendentes) {
    const diasParaVencer = Math.ceil(
      (agendamento.dataPrevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dentroDaJanelaDeAviso = diasParaVencer <= agendamento.diasAntecedenciaAviso;
    if (!dentroDaJanelaDeAviso) continue;

    const jaAvisadoHoje = await prisma.notificacao.findFirst({
      where: {
        agendamentoId: agendamento.id,
        enviadaEm: { gte: hoje },
      },
    });
    if (jaAvisadoHoje) continue;

    const textoData = new Intl.DateTimeFormat("pt-BR").format(agendamento.dataPrevista);
    const statusTexto =
      diasParaVencer < 0
        ? `<strong style="color:#D8483B">VENCIDA há ${Math.abs(diasParaVencer)} dia(s)</strong>`
        : diasParaVencer === 0
          ? `<strong style="color:#E0B400">vence HOJE</strong>`
          : `vence em ${diasParaVencer} dia(s)`;

    const html = `
      <div style="font-family: sans-serif; font-size: 14px; color: #222;">
        <p>Manutenção preventiva ${statusTexto}:</p>
        <p><strong>${agendamento.titulo}</strong></p>
        ${agendamento.equipamento ? `<p>Equipamento: ${agendamento.equipamento.nome}</p>` : ""}
        <p>Data prevista: ${textoData}</p>
        <p style="color:#888; font-size: 12px; margin-top: 20px;">
          Aviso automático do Sistema de Controle de Manutenção.
        </p>
      </div>
    `;

    const resultado = await enviarEmail({
      para: emailsDestino,
      assunto: `Manutenção preventiva: ${agendamento.titulo}`,
      html,
    });

    await prisma.notificacao.create({
      data: {
        agendamentoId: agendamento.id,
        canal: "email",
        sucesso: resultado.enviado,
      },
    });

    if (resultado.enviado && agendamento.status === "PENDENTE") {
      await prisma.agendamento.update({
        where: { id: agendamento.id },
        data: { status: "NOTIFICADO" },
      });
    }

    resultados.push({ agendamentoId: agendamento.id, enviado: resultado.enviado, motivo: resultado.motivo });
  }

  return NextResponse.json({ verificados: agendamentosPendentes.length, notificacoes: resultados });
}
