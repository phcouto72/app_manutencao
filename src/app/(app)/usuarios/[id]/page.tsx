import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarUsuarios } from "@/lib/authz";
import EditarUsuarioForm from "./EditarUsuarioForm";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const papel = (session?.user as any)?.papel;
  if (!podeGerenciarUsuarios(papel)) redirect("/dashboard");

  const usuario = await prisma.usuario.findUnique({ where: { id: params.id } });
  if (!usuario) notFound();

  const ehVocêMesmo = usuario.id === (session!.user as any).id;

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">ADMINISTRAÇÃO</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-8">{usuario.nome}</h1>
      <div className="card p-6">
        <EditarUsuarioForm usuario={usuario} ehVocêMesmo={ehVocêMesmo} />
      </div>
    </div>
  );
}
