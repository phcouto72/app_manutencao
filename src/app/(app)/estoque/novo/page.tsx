import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeGerenciarEstoque } from "@/lib/authz";
import PecaForm from "../PecaForm";

export default async function NovaPecaPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarEstoque(papel)) redirect("/estoque");

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ESTOQUE</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Nova peça</h1>
      <div className="card p-6 max-w-2xl">
        <PecaForm />
      </div>
    </div>
  );
}
