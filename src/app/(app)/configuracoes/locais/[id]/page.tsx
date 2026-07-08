import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarLocais } from "@/lib/authz";
import EditarLocalForm from "./EditarLocalForm";
import ExcluirLocalBotao from "../ExcluirLocalBotao";

export const dynamic = "force-dynamic";

export default async function EditarLocalPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarLocais(papel)) redirect("/configuracoes/locais");

  const local = await prisma.local.findUnique({
    where: { id: params.id },
    include: { _count: { select: { equipamentos: true, manutencoes: true } } },
  });
  if (!local) notFound();

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">CONFIGURAÇÕES</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Editar local</h1>

      <div className="card p-6 max-w-md mb-6">
        <EditarLocalForm id={local.id} nomeInicial={local.nome} descricaoInicial={local.descricao ?? ""} />
      </div>

      <div className="card p-6 max-w-md flex items-center justify-between">
        <p className="text-sm text-base-400">
          {local._count.equipamentos} equipamento(s) e {local._count.manutencoes} manutenção(ões)
          usam este local.
        </p>
        <ExcluirLocalBotao id={local.id} nome={local.nome} redirectTo="/configuracoes/locais" />
      </div>
    </div>
  );
}
