import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarUsuarios } from "@/lib/authz";

const usuarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres"),
  papel: z.enum(["ADMIN", "GESTOR", "TECNICO", "VISUALIZADOR"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const usuarios = await prisma.usuario.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, email: true, papel: true, ativo: true, criadoEm: true },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar usuários" }, { status: 403 });
  }

  const corpo = await req.json();
  const validacao = usuarioSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email: validacao.data.email.toLowerCase() } });
  if (existente) {
    return NextResponse.json({ erro: "Já existe um usuário com esse e-mail" }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(validacao.data.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome: validacao.data.nome,
      email: validacao.data.email.toLowerCase().trim(),
      senhaHash,
      papel: validacao.data.papel,
    },
    select: { id: true, nome: true, email: true, papel: true, ativo: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
