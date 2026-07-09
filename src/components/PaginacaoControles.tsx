"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const OPCOES_POR_PAGINA = [10, 25, 50, 100];

export default function Paginacao({
  total,
  pagina,
  porPagina,
}: {
  total: number;
  pagina: number;
  porPagina: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const fim = Math.min(pagina * porPagina, total);

  function irPara(novaPagina: number, novoPorPagina?: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(novaPagina));
    if (novoPorPagina) params.set("porPagina", String(novoPorPagina));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-base-700 text-sm">
      <p className="text-base-400 text-xs">
        {total === 0 ? "Nenhum resultado" : `Mostrando ${inicio}–${fim} de ${total}`}
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-base-400 text-xs">Por página</label>
          <select
            className="input-field !w-auto !py-1 text-sm"
            value={porPagina}
            onChange={(e) => irPara(1, Number(e.target.value))}
          >
            {OPCOES_POR_PAGINA.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={pagina <= 1}
            onClick={() => irPara(pagina - 1)}
            className="btn-secondary !py-1 !px-3 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-base-400 text-xs whitespace-nowrap">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            disabled={pagina >= totalPaginas}
            onClick={() => irPara(pagina + 1)}
            className="btn-secondary !py-1 !px-3 disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
