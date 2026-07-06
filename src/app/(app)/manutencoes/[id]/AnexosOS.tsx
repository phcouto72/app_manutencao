"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Anexo = { id: string; url: string; nomeArquivo: string; tipo: string | null };

export default function AnexosOS({
  manutencaoId,
  anexosIniciais,
}: {
  manutencaoId: string;
  anexosIniciais: Anexo[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState("foto");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) {
      setErro("Escolha um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("tipo", tipo);

    setEnviando(true);
    const resposta = await fetch(`/api/manutencoes/${manutencaoId}/anexos`, {
      method: "POST",
      body: formData,
    });
    setEnviando(false);

    if (!resposta.ok) {
      const corpo = await resposta.json().catch(() => ({}));
      setErro(corpo?.erro || "Não foi possível enviar o arquivo.");
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      {anexosIniciais.length > 0 && (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {anexosIniciais.map((anexo) => (
            <li key={anexo.id} className="card p-3">
              {anexo.tipo === "foto" || /\.(png|jpe?g|webp|gif)$/i.test(anexo.nomeArquivo) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={anexo.url}
                  alt={anexo.nomeArquivo}
                  className="w-full h-28 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-28 flex items-center justify-center bg-base-800 rounded mb-2 text-base-400 text-xs">
                  Documento
                </div>
              )}
              <a
                href={anexo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-signal hover:underline block truncate"
              >
                {anexo.nomeArquivo}
              </a>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={enviar} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label-field">Tipo</label>
          <select className="input-field" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="foto">Foto</option>
            <option value="nota_fiscal">Nota fiscal</option>
            <option value="laudo">Laudo</option>
            <option value="outro">Outro</option>
          </select>
        </div>
        <div>
          <label className="label-field">Arquivo</label>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="text-sm text-base-300"
          />
        </div>
        <button type="submit" disabled={enviando} className="btn-primary">
          {enviando ? "Enviando..." : "Anexar"}
        </button>
      </form>
      {erro && <p className="text-sm text-danger mt-2">{erro}</p>}
      <p className="text-xs text-base-400 mt-2">Tamanho máximo: 10 MB por arquivo.</p>
    </div>
  );
}
