import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="faixa-sinalizacao" />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p className="font-mono text-signal text-xs tracking-widest mb-2">
              OS-001 · ACESSO RESTRITO
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-wide">
              CONTROLE DE MANUTENÇÃO
            </h1>
            <p className="text-base-400 text-sm mt-2">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <div className="card p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
