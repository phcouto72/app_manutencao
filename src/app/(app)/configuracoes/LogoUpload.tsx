"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoUpload({ logoAtual }: { logoAtual: string | null }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(logoAtual);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    setErro(null);
    const arquivo = inputRef.current?.files?.[0];
    if (!arquivo) return;

    setPreview(URL.createObjectURL(arquivo));

    const formData = new FormData();
    formData.append("logo", arquivo);

    setEnviando(true);
    const resposta = await fetch("/api/empresa/logo", { method: "POST", body: formData });
    setEnviando(false);

    if (!resposta.ok) {
      setErro("Não foi possível enviar o logo.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="w-40 h-40 border border-base-700 rounded-lg flex items-center justify-center bg-base-800 mb-4 overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Logo da empresa" className="max-w-full max-h-full object-contain" />
        ) : (
          <span className="text-base-500 text-xs text-center px-2">Nenhum logo ainda</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={enviar}
        className="text-sm text-base-300"
      />
      {enviando && <p className="text-xs text-base-400 mt-1">Enviando...</p>}
      {erro && <p className="text-sm text-danger mt-1">{erro}</p>}
      <p className="text-xs text-base-400 mt-2">
        Recomendado: imagem quadrada ou horizontal, fundo transparente, até 3 MB.
      </p>
    </div>
  );
}
