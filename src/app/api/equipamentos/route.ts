import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEquipamentos } from "@/lib/authz";

const equipamentoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do equipamento"),
  codigoPatrimonio: z.string().optional().nullable(),
  categoriaId: z.string().optional().nullable(),
  fabricante: z.string().optional().nullable(),
  modelo: z.string().optional().nullable(),
  numeroSerie: z.string().optional().nullable(),
  status: z.enum(["OPERANTE", "EM_MANUTENCAO", "PARADO", "INATIVO"]).default("OPERANTE"),
  criticidade: z.number().int().min(1).max(3).default(2),
  localId: z.string().optional().nullable(),
  equipamentoPaiId: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const equipamentos = await prisma.equipamento.findMany({
    include: { local: true },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(equipamentos);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });

  const papel = (session.user as any)?.papel;
  if (!podeGerenciarEquipamentos(papel)) {
    return NextResponse.json({ erro: "Sem permissão para cadastrar equipamentos" }, { status: 403 });
  }

  const corpo = await req.json();
  if (corpo.localId === "") corpo.localId = null;
  if (corpo.equipamentoPaiId === "") corpo.equipamentoPaiId = null;
  if (corpo.categoriaId === "") corpo.categoriaId = null;
  if (corpo.codigoPatrimonio === "") corpo.codigoPatrimonio = null;

  const validacao = equipamentoSchema.safeParse(corpo);
  if (!validacao.success) {
    return NextResponse.json({ erro: validacao.error.flatten() }, { status: 400 });
  }

  let equipamento;
  try {
    equipamento = await prisma.equipamento.create({ data: validacao.data });
  } catch (erro: any) {
    if (erro?.code === "P2002") {
      return NextResponse.json(
        { erro: "Já existe outro equipamento com esse código de patrimônio." },
        { status: 400 }
      );
    }
    console.error("Erro ao criar equipamento:", erro);
    return NextResponse.json(
      { erro: "Não foi possível salvar. Tente novamente ou avise o administrador." },
      { status: 500 }
    );
  }

  await prisma.logAuditoria.create({
    data: {
      usuarioId: (session.user as any).id,
      acao: "CRIAR_EQUIPAMENTO",
      entidade: "Equipamento",
      entidadeId: equipamento.id,
      detalhes: `Equipamento "${equipamento.nome}" criado`,
    },
  });

  return NextResponse.json(equipamento, { status: 201 });
}
