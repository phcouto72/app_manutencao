import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TrocarSenhaForm from "./TrocarSenhaForm";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <p className="font-mono text-signal text-xs tracking-widest mb-1">MINHA CONTA</p>
      <h1 className="font-display text-3xl font-semibold tracking-wide mb-2">Meu perfil</h1>
      <p className="text-base-400 text-sm mb-8">
        {session?.user?.name} · {session?.user?.email}
      </p>

      <div className="card p-6">
        <h2 className="font-display text-xl font-semibold tracking-wide mb-4">Trocar senha</h2>
        <TrocarSenhaForm />
      </div>
    </div>
  );
}
