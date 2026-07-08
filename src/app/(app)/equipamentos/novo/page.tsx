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

  const [locais, categorias, equipamentosParaHierarquia] = await Promise.all([
    prisma.local.findMany({ orderBy: { nome: "asc" } }),
    prisma.categoria.findMany({ orderBy: { nome: "asc" } }),
    prisma.equipamento.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">CADASTRO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Novo equipamento</h1>
      <div className="card p-6 max-w-3xl">
        <EquipamentoForm locais={locais} categorias={categorias} equipamentosParaHierarquia={equipamentosParaHierarquia} />
      </div>
    </div>
  );
}
