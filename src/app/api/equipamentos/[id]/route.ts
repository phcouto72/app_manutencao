import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEquipamentos } from "@/lib/authz";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const equipamento = await prisma.equipamento.findUnique({
    where: { id: params.id },
    include: { local: true, subEquipamentos: true },
  });

  if (!equipamento) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(equipamento);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEquipamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar equipamentos" }, { status: 403 });
  }

  const corpo = await req.json();

  const equipamento = await prisma.equipamento.update({
    where: { id: params.id },
    data: corpo,
  });

  await prisma.logAuditoria.create({
    data: {
      usuarioId: (session.user as any).id,
      acao: "EDITAR_EQUIPAMENTO",
      entidade: "Equipamento",
      entidadeId: equipamento.id,
      detalhes: `Equipamento "${equipamento.nome}" atualizado`,
    },
  });

  return NextResponse.json(equipamento);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEquipamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão para excluir equipamentos" }, { status: 403 });
  }

  await prisma.equipamento.delete({ where: { id: params.id } });

  await prisma.logAuditoria.create({
    data: {
      usuarioId: (session.user as any).id,
      acao: "EXCLUIR_EQUIPAMENTO",
      entidade: "Equipamento",
      entidadeId: params.id,
    },
  });

  return NextResponse.json({ ok: true });
}
