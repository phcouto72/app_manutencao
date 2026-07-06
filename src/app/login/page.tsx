import LoginForm from "./LoginForm";
import { getEmpresaConfig } from "@/lib/empresa";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const empresa = await getEmpresaConfig();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="faixa-sinalizacao" />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            {empresa.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={empresa.logoUrl}
                alt={empresa.nome}
                className="h-16 max-w-[220px] object-contain mx-auto mb-4"
              />
            )}
            <p className="font-mono text-signal text-xs tracking-widest mb-2">
              OS-001 · ACESSO RESTRITO
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-wide">
              CONTROLE DE MANUTENÇÃO
            </h1>
            <p className="text-base-400 text-sm mt-2">{empresa.nome}</p>
          </div>

          <div className="card p-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
