import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getEmpresaConfig } from "@/lib/empresa";
import AppShell from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const nomeUsuario = session.user?.name ?? "Usuário";
  const papel = (session.user as any)?.papel ?? "";
  const empresa = await getEmpresaConfig();

  return (
    <AppShell
      nomeUsuario={nomeUsuario}
      papel={papel}
      nomeEmpresa={empresa.nome}
      logoUrl={empresa.logoUrl}
    >
      {children}
    </AppShell>
  );
}
