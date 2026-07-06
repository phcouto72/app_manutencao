import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarUsuarios } from "@/lib/authz";
import NovoUsuarioForm from "../NovoUsuarioForm";

export default async function NovoUsuarioPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo usuário</h1>
      <div className="card p-6">
        <NovoUsuarioForm />
      </div>
    </div>
  );
}
