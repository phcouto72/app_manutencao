import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EquipamentoForm from "../EquipamentoForm";

export const dynamic = "force-dynamic";

export default async function EditarEquipamentoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;

  const [equipamento, locais, equipamentosParaHierarquia] = await Promise.all([
    prisma.equipamento.findUnique({
      where: { id: params.id },
      include: { equipamentoPai: true, subEquipamentos: true, categoriaRef: true },
    }),
    prisma.local.findMany({ orderBy: { nome: "asc" } }),
    prisma.equipamento.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);

  if (!equipamento) notFound();

  const categorias = await prisma.categoria.findMany({ orderBy: { nome: "asc" } });

  const somenteLeitura = !(papel === "ADMIN" || papel === "GESTOR");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-signal text-xs tracking-widest mb-1">CADASTRO</p>
          <h1 className="font-display text-3xl font-semibold tracking-wide">
            {somenteLeitura ? "Detalhes do equipamento" : "Editar equipamento"}
          </h1>
        </div>
        <Link href={`/equipamentos-imprimir/${equipamento.id}`} target="_blank" className="btn-secondary">
          Ver etiqueta / QR Code
        </Link>
      </div>

      <div className="card p-6 max-w-3xl mb-6">
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
              <dd>{equipamento.categoriaRef?.nome ?? "—"}</dd>
            </div>
            <div>
              <dt className="label-field">Patrimônio</dt>
              <dd>{equipamento.codigoPatrimonio ?? "—"}</dd>
            </div>
            <div>
              <dt className="label-field">Equipamento pai</dt>
              <dd>
                {equipamento.equipamentoPai ? (
                  <Link href={`/equipamentos/${equipamento.equipamentoPai.id}`} className="hover:text-signal">
                    {equipamento.equipamentoPai.nome}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <EquipamentoForm
            locais={locais}
            categorias={categorias}
            equipamento={equipamento as any}
            equipamentosParaHierarquia={equipamentosParaHierarquia}
          />
        )}
      </div>

      {equipamento.subEquipamentos.length > 0 && (
        <div className="card p-6 max-w-3xl">
          <h2 className="font-display text-lg font-semibold tracking-wide mb-3">
            Subconjuntos / componentes
          </h2>
          <ul className="divide-y divide-base-800">
            {equipamento.subEquipamentos.map((sub) => (
              <li key={sub.id} className="py-2 text-sm">
                <Link href={`/equipamentos/${sub.id}`} className="hover:text-signal">
                  {sub.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
