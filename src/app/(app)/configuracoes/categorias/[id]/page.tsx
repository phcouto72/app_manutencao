import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarCategorias } from "@/lib/authz";
import EditarCategoriaForm from "./EditarCategoriaForm";
import ExcluirCategoriaBotao from "../ExcluirCategoriaBotao";

export const dynamic = "force-dynamic";

export default async function EditarCategoriaPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarCategorias(papel)) redirect("/configuracoes/categorias");

  const categoria = await prisma.categoria.findUnique({
    where: { id: params.id },
    include: { _count: { select: { equipamentos: true } } },
  });
  if (!categoria) notFound();

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">CONFIGURAÇÕES</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">Editar categoria</h1>

      <div className="card p-6 max-w-md mb-6">
        <EditarCategoriaForm
          id={categoria.id}
          nomeInicial={categoria.nome}
          descricaoInicial={categoria.descricao ?? ""}
        />
      </div>

      <div className="card p-6 max-w-md flex items-center justify-between">
        <p className="text-sm text-base-400">{categoria._count.equipamentos} equipamento(s) usam esta categoria.</p>
        <ExcluirCategoriaBotao id={categoria.id} nome={categoria.nome} redirectTo="/configuracoes/categorias" />
      </div>
    </div>
  );
}
