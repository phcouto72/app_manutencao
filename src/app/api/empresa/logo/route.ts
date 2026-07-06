import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/authz";
import { salvarArquivoEnviado } from "@/lib/uploads";
import { prisma } from "@/lib/prisma";

const TAMANHO_MAXIMO = 3 * 1024 * 1024; // 3 MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("logo") as File | null;

  if (!arquivo) return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Logo maior que 3 MB" }, { status: 400 });
  }
  if (!arquivo.type.startsWith("image/")) {
    return NextResponse.json({ erro: "Envie um arquivo de imagem" }, { status: 400 });
  }

  const { caminhoRelativo } = await salvarArquivoEnviado(arquivo, "empresa");

  const config = await prisma.empresaConfig.upsert({
    where: { id: "empresa-config" },
    update: { logoUrl: `/api/arquivos/${caminhoRelativo}` },
    create: { id: "empresa-config", logoUrl: `/api/arquivos/${caminhoRelativo}` },
  });

  return NextResponse.json(config);
}
