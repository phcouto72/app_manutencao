import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarUsuarios } from "@/lib/authz";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar usuários" }, { status: 403 });
  }

  const corpo = await req.json();
  const dadosAtualizacao: any = {
    nome: corpo.nome,
    papel: corpo.papel,
    ativo: corpo.ativo,
  };

  if (corpo.novaSenha) {
    if (String(corpo.novaSenha).length < 6) {
      return NextResponse.json(
        { erro: "A nova senha precisa ter ao menos 6 caracteres" },
        { status: 400 }
      );
    }
    dadosAtualizacao.senhaHash = await bcrypt.hash(corpo.novaSenha, 10);
  }

  // Impede que o próprio admin se rebaixe/desative e fique sem acesso por engano.
  if (params.id === (session.user as any).id && (corpo.papel !== "ADMIN" || corpo.ativo === false)) {
    return NextResponse.json(
      { erro: "Você não pode remover seu próprio acesso de administrador por aqui." },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data: dadosAtualizacao,
    select: { id: true, nome: true, email: true, papel: true, ativo: true },
  });

  return NextResponse.json(usuario);
}
