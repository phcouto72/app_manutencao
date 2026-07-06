import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { readFile, stat } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { PASTA_UPLOADS } from "@/lib/uploads";

const TIPOS_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".gif": "image/gif",
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  // Impede tentativas de escapar da pasta de uploads (ex: ../../etc/passwd)
  const partesSeguras = params.path.map((p) => path.basename(p));
  const caminhoCompleto = path.join(PASTA_UPLOADS, ...partesSeguras);

  if (!caminhoCompleto.startsWith(PASTA_UPLOADS)) {
    return NextResponse.json({ erro: "Caminho inválido" }, { status: 400 });
  }

  try {
    await stat(caminhoCompleto);
    const arquivo = await readFile(caminhoCompleto);
    const extensao = path.extname(caminhoCompleto).toLowerCase();

    return new NextResponse(arquivo, {
      headers: {
        "Content-Type": TIPOS_MIME[extensao] || "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ erro: "Arquivo não encontrado" }, { status: 404 });
  }
}
