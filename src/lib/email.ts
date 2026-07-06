import nodemailer from "nodemailer";

let transportador: nodemailer.Transporter | null = null;

function getTransportador() {
  if (transportador) return transportador;

  if (!process.env.SMTP_HOST) {
    return null; // SMTP não configurado ainda — quem chamar deve tratar esse caso
  }

  transportador = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  return transportador;
}

export async function enviarEmail({
  para,
  assunto,
  html,
}: {
  para: string[];
  assunto: string;
  html: string;
}) {
  const transporte = getTransportador();
  if (!transporte || para.length === 0) {
    return { enviado: false, motivo: "SMTP não configurado ou sem destinatários" };
  }

  try {
    await transporte.sendMail({
      from: process.env.SMTP_FROM || "Sistema de Manutenção <manutencao@localhost>",
      to: para.join(", "),
      subject: assunto,
      html,
    });
    return { enviado: true };
  } catch (erro: any) {
    return { enviado: false, motivo: erro?.message || "Erro desconhecido ao enviar e-mail" };
  }
}
