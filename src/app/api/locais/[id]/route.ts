import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarLocais } from "@/lib/authz";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarLocais(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar locais" }, { status: 403 });
  }

  const { nome, descricao } = await req.json();
  if (!nome || String(nome).trim().length < 2) {
    return NextResponse.json({ erro: "Informe o nome do local" }, { status: 400 });
  }

  const local = await prisma.local.update({
    where: { id: params.id },
    data: { nome, descricao },
  });

  return NextResponse.json(local);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarLocais(papel)) {
    return NextResponse.json({ erro: "Sem permissão para excluir locais" }, { status: 403 });
  }

  const [equipamentos, manutencoes] = await Promise.all([
    prisma.equipamento.count({ where: { localId: params.id } }),
    prisma.manutencao.count({ where: { localId: params.id } }),
  ]);

  if (equipamentos > 0 || manutencoes > 0) {
    return NextResponse.json(
      {
        erro: `Não é possível excluir: ${equipamentos} equipamento(s) e ${manutencoes} manutenção(ões) usam este local.`,
      },
      { status: 400 }
    );
  }

  await prisma.local.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
