import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";

const manutencaoSchema = z
  .object({
    tipo: z.enum(["PREVENTIVA", "CORRETIVA", "PREDITIVA"]),
    categoriaServico: z.enum([
      "MECANICA",
      "ELETRICA",
      "HIDRAULICA",
      "CIVIL",
      "ELETRONICA",
      "OUTRO",
    ]),
    titulo: z.string().min(2, "Informe um título para a OS"),
    descricaoProblema: z.string().optional().nullable(),
    equipamentoId: z.string().optional().nullable(),
    localId: z.string().optional().nullable(),
    responsavelId: z.string().optional().nullable(),
  })
  .refine((dados) => dados.equipamentoId || dados.localId, {
    message: "Selecione um equipamento ou um local para a manutenção predial",
  });

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const tipo = searchParams.get("tipo") || undefined;
  const equipamentoId = searchParams.get("equipamentoId") || undefined;

  const manutencoes = await prisma.manutencao.findMany({
    where: {
      status: status ? (status as any) : undefined,
      tipo: tipo ? (tipo as any) : undefined,
      equipamentoId: equipamentoId || undefined,
    },
    include: { equipamento: true, local: true, responsavel: true },
    orderBy: { dataAbertura: "desc" },
  });

  return NextResponse.json(manutencoes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão para abrir manutenções" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = manutencaoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const manutencao = await prisma.manutencao.create({ data: validacao.data });

  // Se a manutenção está vinculada a um equipamento, marca o equipamento como "em manutenção".
  if (manutencao.equipamentoId) {
    await prisma.equipamento.update({
      where: { id: manutencao.equipamentoId },
      data: { status: "EM_MANUTENCAO" },
    });
  }

  await prisma.logAuditoria.create({
    data: {
      usuarioId: (session.user as any).id,
      acao: "CRIAR_MANUTENCAO",
      entidade: "Manutencao",
      entidadeId: manutencao.id,
      detalhes: `OS "${manutencao.titulo}" aberta`,
    },
  });

  return NextResponse.json(manutencao, { status: 201 });
}
