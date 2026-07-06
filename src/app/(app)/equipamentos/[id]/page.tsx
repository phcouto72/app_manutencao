import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EquipamentoForm from "../EquipamentoForm";

export default async function EditarEquipamentoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;

  const [equipamento, locais] = await Promise.all([
    prisma.equipamento.findUnique({ where: { id: params.id } }),
    prisma.local.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!equipamento) notFound();

  const somenteLeitura = !(papel === "ADMIN" || papel === "GESTOR");

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">CADASTRO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">
        {somenteLeitura ? "Detalhes do equipamento" : "Editar equipamento"}
      </h1>
      <div className="card p-6 max-w-3xl">
        {somenteLeitura ? (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label-field">Nome</dt>
              <dd>{equipamento.nome}</dd>
            </div>
            <div>
              <dt className="label-field">Status</dt>
              <dd>{equipamento.status}</dd>
            </div>
            <div>
              <dt className="label-field">Categoria</dt>
              <dd>{equipamento.categoria ?? "—"}</dd>
            </div>
            <div>
              <dt className="label-field">Patrimônio</dt>
              <dd>{equipamento.codigoPatrimonio ?? "—"}</dd>
            </div>
          </dl>
        ) : (
          <EquipamentoForm locais={locais} equipamento={equipamento as any} />
        )}
      </div>
    </div>
  );
}
