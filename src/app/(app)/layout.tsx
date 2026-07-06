import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const nomeUsuario = session.user?.name ?? "Usuário";
  const papel = (session.user as any)?.papel ?? "";

  return (
    <div className="flex">
      <Sidebar nomeUsuario={nomeUsuario} papel={papel} />
      <main className="flex-1 min-h-screen">
        <div className="faixa-sinalizacao" />
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
