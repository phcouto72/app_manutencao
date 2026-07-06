export default function RodapeSistema({ nomeEmpresa }: { nomeEmpresa?: string }) {
  const ano = new Date().getFullYear();

  return (
    <footer className="mt-12">
      <div className="faixa-sinalizacao" />
      <div className="px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-1 text-xs text-base-500">
        <p>
          Sistema de Controle de Manutenção{nomeEmpresa ? ` · ${nomeEmpresa}` : ""}
        </p>
        <p>© {ano} · Todos os direitos reservados</p>
      </div>
    </footer>
  );
}
