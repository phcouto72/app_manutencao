// Todas recebem o texto digitado até agora e devolvem o texto já formatado.
// São usadas no onChange dos campos, então funcionam enquanto a pessoa digita.

export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length <= 10) {
    // (XX) XXXX-XXXX
    return digitos
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  // (XX) XXXXX-XXXX
  return digitos
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function mascararCNPJ(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);
  return digitos
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function mascararCPF(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

// Campo único que aceita CPF ou CNPJ — decide o formato pela quantidade de dígitos.
export function mascararCpfOuCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length > 11 ? mascararCNPJ(valor) : mascararCPF(valor);
}
