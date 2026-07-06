import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const { senhaAtual, novaSenha } = await req.json();

  if (!novaSenha || String(novaSenha).length < 6) {
    return NextResponse.json({ erro: "A nova senha precisa ter ao menos 6 caracteres" }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({ where: { id: (session.user as any).id } });
  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });

  const senhaValida = await bcrypt.compare(senhaAtual || "", usuario.senhaHash);
  if (!senhaValida) {
    return NextResponse.json({ erro: "Senha atual incorreta" }, { status: 400 });
  }

  const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash: novaSenhaHash },
  });

  return NextResponse.json({ ok: true });
}
