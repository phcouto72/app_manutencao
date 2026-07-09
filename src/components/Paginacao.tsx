import { Suspense } from "react";
import PaginacaoControles from "./PaginacaoControles";

export default function Paginacao(props: { total: number; pagina: number; porPagina: number }) {
  return (
    <Suspense fallback={null}>
      <PaginacaoControles {...props} />
    </Suspense>
  );
}
