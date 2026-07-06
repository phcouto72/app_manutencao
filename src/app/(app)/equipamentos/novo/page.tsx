import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEquipamentos } from "@/lib/authz";
import EquipamentoForm from "../EquipamentoForm";

export default async function NovoEquipamentoPage() {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarEquipamentos(papel)) redirect("/equipamentos");

  const locais = await prisma.local.findMany({ orderBy: { nome: "asc" } });

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">CADASTRO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo equipamento</h1>
      <div className="card p-6 max-w-3xl">
        <EquipamentoForm locais={locais} />
      </div>
    </div>
  );
}
