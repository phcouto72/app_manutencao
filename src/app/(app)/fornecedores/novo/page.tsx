import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarFornecedores } from "@/lib/authz";
import FornecedorForm from "../FornecedorForm";

export default async function NovoFornecedorPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarFornecedores(papel)) redirect("/fornecedores");

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">COMPRAS</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo fornecedor</h1>
      <div className="card p-6 max-w-2xl">
        <FornecedorForm />
      </div>
    </div>
  );
}
