"use client";

export default function BotaoImprimirEtiqueta() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-black text-white px-4 py-2 rounded text-sm font-medium"
    >
      Imprimir etiqueta
    </button>
  );
}
