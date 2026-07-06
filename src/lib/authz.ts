// Regras simples de permissão por papel.
// ADMIN e GESTOR podem criar/editar/excluir.
// TECNICO pode criar/editar manutenções (fase 2), mas aqui só visualiza equipamentos.
// VISUALIZADOR só consulta.

export type Papel = "ADMIN" | "GESTOR" | "TECNICO" | "VISUALIZADOR";

export function podeGerenciarEquipamentos(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarManutencoes(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR" || papel === "TECNICO";
}

export function podeGerenciarLocais(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarEstoque(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarFornecedores(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarCompras(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarAgendamentos(papel?: string | null) {
  return papel === "ADMIN" || papel === "GESTOR";
}

export function podeGerenciarUsuarios(papel?: string | null) {
  return papel === "ADMIN";
}
