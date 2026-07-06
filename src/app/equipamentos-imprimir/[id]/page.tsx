import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEmpresaConfig } from "@/lib/empresa";
import BotaoImprimirEtiqueta from "./BotaoImprimirEtiqueta";

export const dynamic = "force-dynamic";

export default async function EtiquetaEquipamentoPage({ params }: { params: { id: string } }) {
  const equipamento = await prisma.equipamento.findUnique({ where: { id: params.id } });
  if (!equipamento) notFound();

  const empresa = await getEmpresaConfig();
  const baseUrl = process.env.NEXTAUTH_URL || "";
  const urlEquipamento = `${baseUrl}/equipamentos/${equipamento.id}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    urlEquipamento
  )}`;

  return (
    <div className="max-w-sm mx-auto p-8 print:p-0 text-center">
      <div className="flex justify-end mb-4 print:hidden">
        <BotaoImprimirEtiqueta />
      </div>

      <div className="border-2 border-gray-900 rounded-lg p-6 print:border-black">
        {empresa.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={empresa.logoUrl} alt={empresa.nome} className="h-10 max-w-[160px] object-contain mx-auto mb-3" />
        )}
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Equipamento</p>
        <h1 className="text-lg font-bold mb-4">{equipamento.nome}</h1>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrCodeSrc} alt="QR Code do equipamento" className="mx-auto mb-4" width={220} height={220} />

        {equipamento.codigoPatrimonio && (
          <p className="font-mono text-sm mb-1">Patrimônio: {equipamento.codigoPatrimonio}</p>
        )}
        <p className="text-xs text-gray-500">Aponte a câmera para abrir a ficha do equipamento</p>
      </div>
    </div>
  );
}
