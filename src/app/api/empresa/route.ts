import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/authz";
import { getEmpresaConfig } from "@/lib/empresa";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await getEmpresaConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) {
    return NextResponse.json({ erro: "Sem permissão para editar dados da empresa" }, { status: 403 });
  }

  const { nome, cnpj, endereco, telefone, email } = await req.json();

  const config = await prisma.empresaConfig.upsert({
    where: { id: "empresa-config" },
    update: { nome, cnpj, endereco, telefone, email },
    create: { id: "empresa-config", nome, cnpj, endereco, telefone, email },
  });

  return NextResponse.json(config);
}
