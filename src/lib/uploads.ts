import { mkdir, writeFile } from "fs/promises";
import path from "path";

// Pasta de uploads fora do diretório public — servida pela nossa própria rota de API.
// IMPORTANTE: no EasyPanel, monte um volume persistente apontando para este caminho,
// senão os arquivos enviados somem a cada novo deploy (o container é recriado do zero).
export const PASTA_UPLOADS = path.join(process.cwd(), "uploads");

function sanitizarNomeArquivo(nome: string) {
  return nome.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function salvarArquivoEnviado(
  arquivo: File,
  subpasta: string
): Promise<{ nomeArquivo: string; caminhoRelativo: string }> {
  const destino = path.join(PASTA_UPLOADS, subpasta);
  await mkdir(destino, { recursive: true });

  const nomeArquivo = `${Date.now()}-${sanitizarNomeArquivo(arquivo.name)}`;
  const bytes = Buffer.from(await arquivo.arrayBuffer());
  await writeFile(path.join(destino, nomeArquivo), bytes);

  return {
    nomeArquivo,
    caminhoRelativo: `${subpasta}/${nomeArquivo}`,
  };
}
