import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/authz";
import { getEmpresaConfig } from "@/lib/empresa";
import EmpresaForm from "./EmpresaForm";
import LogoUpload from "./LogoUpload";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  const config = await getEmpresaConfig();

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">
        Configurações da empresa
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold tracking-wide mb-4">Logo</h2>
          <LogoUpload logoAtual={config.logoUrl} />
        </div>

        <div className="card p-6">
          <h2 className="font-display text-lg font-semibold tracking-wide mb-4">
            Dados da empresa
          </h2>
          <p className="text-xs text-base-400 mb-4">
            Esses dados aparecem no cabeçalho dos relatórios impressos.
          </p>
          <EmpresaForm config={config} />
        </div>
      </div>
    </div>
  );
}
