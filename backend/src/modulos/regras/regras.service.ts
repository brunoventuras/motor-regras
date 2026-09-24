import { erroNaoEncontrado, erroRequisicaoInvalida } from '../../compartilhado/erros.ts';
import { prisma } from '../../compartilhado/prisma.ts';
import type { CampoCondicao } from '../../generated/prisma/enums.ts';
import type { DadosRegra } from './regras.schemas.ts';

const RELACOES_REGRA = {
  grupo: { select: { id: true, nome: true } },
  condicoes: { orderBy: { id: 'asc' as const } },
  criadoPor: { select: { id: true, nome: true } },
  atualizadoPor: { select: { id: true, nome: true } },
};

const CONTADORES_POR_CAMPO: Record<
  Exclude<CampoCondicao, 'quantidade'>,
  (ids: number[]) => Promise<number>
> = {
  servico: (ids) => prisma.servico.count({ where: { id: { in: ids } } }),
  categoria_cliente: (ids) => prisma.categoriaCliente.count({ where: { id: { in: ids } } }),
  regiao: (ids) => prisma.regiao.count({ where: { id: { in: ids } } }),
  faixa_utilizacao: (ids) => prisma.faixaUtilizacao.count({ where: { id: { in: ids } } }),
};

/** Garante que grupo e itens de catálogo citados nas condições existem, já que o JSONB não tem chave estrangeira. */
async function verificarReferencias(dados: DadosRegra) {
  if (dados.grupoId && !(await prisma.grupoRegra.findUnique({ where: { id: dados.grupoId } }))) {
    throw erroRequisicaoInvalida('O grupo informado não existe.');
  }

  for (const condicao of dados.condicoes) {
    if (condicao.campo === 'quantidade') continue;
    const ids = [condicao.valor].flat();
    const encontrados = await CONTADORES_POR_CAMPO[condicao.campo](ids);
    if (encontrados !== new Set(ids).size) {
      throw erroRequisicaoInvalida('Uma das condições cita um item de cadastro inexistente.');
    }
  }
}

/** Separa as condições do cabeçalho da regra para gravação. */
function separarDados({ condicoes, ...cabecalho }: DadosRegra) {
  return { cabecalho, condicoes };
}

export function listarRegras() {
  return prisma.regra.findMany({
    include: RELACOES_REGRA,
    orderBy: [{ prioridade: 'asc' }, { criadoEm: 'asc' }, { id: 'asc' }],
  });
}

export async function obterRegra(id: number) {
  const regra = await prisma.regra.findUnique({ where: { id }, include: RELACOES_REGRA });
  if (!regra) throw erroNaoEncontrado('Regra não encontrada.');
  return regra;
}

export async function criarRegra(dados: DadosRegra, usuarioId: number) {
  await verificarReferencias(dados);
  const { cabecalho, condicoes } = separarDados(dados);

  return prisma.regra.create({
    data: {
      ...cabecalho,
      criadoPorId: usuarioId,
      atualizadoPorId: usuarioId,
      condicoes: { create: condicoes },
    },
    include: RELACOES_REGRA,
  });
}

/**
 * Atualiza a regra e substitui todas as condições numa única transação.
 * Cálculos já feitos não são afetados, pois a memória guarda a regra como estava.
 */
export async function atualizarRegra(id: number, dados: DadosRegra, usuarioId: number) {
  await obterRegra(id);
  await verificarReferencias(dados);
  const { cabecalho, condicoes } = separarDados(dados);

  return prisma.$transaction(async (transacao) => {
    await transacao.condicao.deleteMany({ where: { regraId: id } });
    return transacao.regra.update({
      where: { id },
      data: { ...cabecalho, atualizadoPorId: usuarioId, condicoes: { create: condicoes } },
      include: RELACOES_REGRA,
    });
  });
}

export async function alterarAtivoRegra(id: number, ativo: boolean, usuarioId: number) {
  await obterRegra(id);
  return prisma.regra.update({
    where: { id },
    data: { ativo, atualizadoPorId: usuarioId },
    include: RELACOES_REGRA,
  });
}
