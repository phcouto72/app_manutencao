import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";
import { salvarArquivoEnviado } from "@/lib/uploads";

const TAMANHO_MAXIMO = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarManutencoes(papel)) {
    return NextResponse.json({ erro: "Sem permissão" }, { status: 403 });
  }

  const formData = await req.formData();
  const arquivo = formData.get("arquivo") as File | null;
  const tipo = (formData.get("tipo") as string) || "outro";

  if (!arquivo) {
    return NextResponse.json({ erro: "Nenhum arquivo enviado" }, { status: 400 });
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: "Arquivo maior que 10 MB" }, { status: 400 });
  }

  const { caminhoRelativo, nomeArquivo } = await salvarArquivoEnviado(
    arquivo,
    `manutencoes/${params.id}`
  );

  const anexo = await prisma.anexo.create({
    data: {
      manutencaoId: params.id,
      url: `/api/arquivos/${caminhoRelativo}`,
      nomeArquivo: arquivo.name,
      tipo,
    },
  });

  return NextResponse.json(anexo, { status: 201 });
}
