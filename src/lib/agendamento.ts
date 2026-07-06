export function calcularProximaData(
  base: Date,
  frequenciaTipo: "DIAS" | "SEMANAS" | "MESES" | "HORAS_USO",
  frequenciaValor: number
): Date | null {
  const proxima = new Date(base);

  switch (frequenciaTipo) {
    case "DIAS":
      proxima.setDate(proxima.getDate() + frequenciaValor);
      return proxima;
    case "SEMANAS":
      proxima.setDate(proxima.getDate() + frequenciaValor * 7);
      return proxima;
    case "MESES":
      proxima.setMonth(proxima.getMonth() + frequenciaValor);
      return proxima;
    case "HORAS_USO":
      // Não há leitura automática de horímetro no sistema ainda — quem cadastra o plano
      // deve criar o agendamento correspondente manualmente com base na leitura do equipamento.
      return null;
    default:
      return null;
  }
}
