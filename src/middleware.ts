export { default } from "next-auth/middleware";

export const config = {
  // Toda rota dentro do grupo (app) exige sessão ativa.
  // A tela de login e as rotas de API de autenticação ficam de fora.
  matcher: [
    "/dashboard/:path*",
    "/equipamentos/:path*",
    "/manutencoes/:path*",
    "/estoque/:path*",
    "/fornecedores/:path*",
    "/compras/:path*",
    "/agendamentos/:path*",
    "/planos-preventivos/:path*",
    "/relatorios/:path*",
    "/relatorios-imprimir/:path*",
    "/perfil/:path*",
    "/equipamentos-imprimir/:path*",
    "/configuracoes/:path*",
  ],
};
