import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarManutencoes } from "@/lib/authz";
import AtualizarManutencaoForm from "./AtualizarManutencaoForm";
import UsoPecasForm from "./UsoPecasForm";

export const dynamic = "force-dynamic";

const tipoTexto: Record<string, string> = {
  PREVENTIVA: "Preventiva",
  CORRETIVA: "Corretiva",
  PREDITIVA: "Preditiva",
};

export default async function DetalheManutencaoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  const podeGerenciar = podeGerenciarManutencoes(papel);

  const manutencao = await prisma.manutencao.findUnique({
    where: { id: params.id },
    include: {
      equipamento: true,
      local: true,
      responsavel: true,
      itensPeca: { include: { peca: true } },
    },
  });

  if (!manutencao) notFound();

  const [usuarios, pecas] = await Promise.all([
    prisma.usuario.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.peca.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, quantidadeAtual: true, unidadeMedida: true },
    }),
  ]);

  // Histórico: outras manutenções do mesmo equipamento (ou do mesmo local, se for predial).
  const historico = manutencao.equipamentoId
    ? await prisma.manutencao.findMany({
        where: { equipamentoId: manutencao.equipamentoId, id: { not: manutencao.id } },
        orderBy: { dataAbertura: "desc" },
        take: 10,
      })
    : manutencao.localId
      ? await prisma.manutencao.findMany({
          where: { localId: manutencao.localId, id: { not: manutencao.id } },
          orderBy: { dataAbertura: "desc" },
          take: 10,
        })
      : [];

  return (
    <div className="max-w-3xl">
      <p className="font-mono text-signal text-xs tracking-widest mb-1">
        OS #{String(manutencao.numeroOS).padStart(4, "0")} · {tipoTexto[manutencao.tipo]}
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-2">{manutencao.titulo}</h1>
      <p className="text-base-400 text-sm mb-8">
        {manutencao.equipamento?.nome ?? manutencao.local?.nome} · Aberta em{" "}
        {new Intl.DateTimeFormat("pt-BR").format(new Date(manutencao.dataAbertura))}
      </p>

      {manutencao.descricaoProblema && (
        <div className="card p-5 mb-6">
          <p className="label-field">Problema relatado</p>
          <p className="text-sm">{manutencao.descricaoProblema}</p>
        </div>
      )}

      <div className="card p-6 mb-8">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">
          {podeGerenciar ? "Atualizar OS" : "Situação atual"}
        </h2>
        {podeGerenciar ? (
          <AtualizarManutencaoForm
            manutencaoId={manutencao.id}
            statusAtual={manutencao.status}
            descricaoSolucaoAtual={manutencao.descricaoSolucao ?? ""}
            custoMaoDeObraAtual={Number(manutencao.custoMaoDeObra ?? 0)}
            custoPecasAtual={Number(manutencao.custoPecas ?? 0)}
            responsavelIdAtual={manutencao.responsavelId ?? ""}
            usuarios={usuarios}
          />
        ) : (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="label-field">Status</dt>
              <dd>{manutencao.status}</dd>
            </div>
            <div>
              <dt className="label-field">Responsável</dt>
              <dd>{manutencao.responsavel?.nome ?? "—"}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="card p-6 mb-8">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">Peças usadas</h2>
        {manutencao.itensPeca.length > 0 && (
          <ul className="divide-y divide-base-800 mb-4">
            {manutencao.itensPeca.map((item) => (
              <li key={item.id} className="py-2 flex items-center justify-between text-sm">
                <span>{item.peca.nome}</span>
                <span className="text-base-400">
                  {item.quantidade} {item.peca.unidadeMedida}
                </span>
              </li>
            ))}
          </ul>
        )}
        {podeGerenciar ? (
          <UsoPecasForm manutencaoId={manutencao.id} pecas={pecas} />
        ) : (
          manutencao.itensPeca.length === 0 && (
            <p className="text-base-400 text-sm">Nenhuma peça registrada ainda.</p>
          )
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">
          Histórico do mesmo {manutencao.equipamentoId ? "equipamento" : "local"}
        </h2>
        {historico.length === 0 ? (
          <p className="text-base-400 text-sm">Nenhuma outra manutenção registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-base-800">
            {historico.map((h) => (
              <li key={h.id} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <p>{h.titulo}</p>
                  <p className="text-base-400 text-xs">
                    {tipoTexto[h.tipo]} ·{" "}
                    {new Intl.DateTimeFormat("pt-BR").format(new Date(h.dataAbertura))}
                  </p>
                </div>
                <span className="text-xs text-base-400 uppercase">{h.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
