export function parsePaginacao(
  searchParams: { pagina?: string; porPagina?: string },
  porPaginaPadrao = 25
) {
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);
  const porPagina = Number(searchParams.porPagina) || porPaginaPadrao;
  const skip = (pagina - 1) * porPagina;
  return { pagina, porPagina, skip, take: porPagina };
}
