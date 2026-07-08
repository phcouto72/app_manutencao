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
    include: { local: true, subEquipamentos: true, categoriaRef: true },
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

  // Monta explicitamente os campos aceitos pela atualização. Isso evita que campos de
  // relação (equipamentoPai, subEquipamentos, categoriaRef) ou outros que vieram junto
  // por engano no corpo da requisição quebrem a atualização no Prisma.
  const dadosAtualizacao = {
    nome: corpo.nome,
    codigoPatrimonio: corpo.codigoPatrimonio || null,
    categoria: corpo.categoria ?? undefined,
    categoriaId: corpo.categoriaId || null,
    fabricante: corpo.fabricante ?? undefined,
    modelo: corpo.modelo ?? undefined,
    numeroSerie: corpo.numeroSerie ?? undefined,
    status: corpo.status,
    criticidade: corpo.criticidade !== undefined ? Number(corpo.criticidade) : undefined,
    localId: corpo.localId || null,
    equipamentoPaiId: corpo.equipamentoPaiId || null,
    observacoes: corpo.observacoes ?? undefined,
  };

  if (dadosAtualizacao.equipamentoPaiId === params.id) {
    return NextResponse.json(
      { erro: "Um equipamento não pode ser pai dele mesmo" },
      { status: 400 }
    );
  }

  let equipamento;
  try {
    equipamento = await prisma.equipamento.update({
      where: { id: params.id },
      data: dadosAtualizacao,
    });
  } catch (erro: any) {
    if (erro?.code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe outro equipamento com esse código de patrimônio." },
        { status: 400 }
      );
    }
    console.error("Erro ao atualizar equipamento:", erro);
    return NextResponse.json(
      { erro: "Não foi possível salvar. Tente novamente ou avise o administrador." },
      { status: 500 }
    );
  }

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
