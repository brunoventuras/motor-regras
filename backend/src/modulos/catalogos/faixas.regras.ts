import { erroConflito } from '../../compartilhado/erros.ts';
import { prisma } from '../../compartilhado/prisma.ts';

/** Descreve uma faixa para mensagens e para a memória de cálculo, ex.: "51 a 100" ou "101 ou mais". */
export function descreverFaixa(quantidadeInicial: number, quantidadeFinal: number | null): string {
  return quantidadeFinal === null
    ? `${quantidadeInicial} ou mais`
    : `${quantidadeInicial} a ${quantidadeFinal}`;
}

/**
 * Impede que uma faixa ativa se sobreponha a outra, com mensagem que aponta a faixa em conflito.
 * O banco possui a mesma proteção (constraint EXCLUDE) como última garantia.
 */
export async function verificarSobreposicaoFaixa(
  quantidadeInicial: number,
  quantidadeFinal: number | null,
  idIgnorado?: number,
) {
  const conflitante = await prisma.faixaUtilizacao.findFirst({
    where: {
      ativo: true,
      id: idIgnorado ? { not: idIgnorado } : undefined,
      OR: [{ quantidadeFinal: null }, { quantidadeFinal: { gte: quantidadeInicial } }],
      quantidadeInicial: quantidadeFinal === null ? undefined : { lte: quantidadeFinal },
    },
  });

  if (conflitante) {
    const faixa = descreverFaixa(conflitante.quantidadeInicial, conflitante.quantidadeFinal);
    throw erroConflito(`A faixa se sobrepõe à faixa ativa ${faixa}.`);
  }
}
