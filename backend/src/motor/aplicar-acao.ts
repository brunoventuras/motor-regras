import { Decimal } from 'decimal.js';
import { arredondar, limitarAZero, percentualParaFracao } from './dinheiro.ts';
import type { TipoAcao } from './tipos.ts';

type Operacao = (subtotal: Decimal, valor: Decimal) => Decimal;

const aplicarAcrescimoPercentual: Operacao = (subtotal, percentual) =>
  subtotal.plus(subtotal.times(percentualParaFracao(percentual)));

const OPERACOES: Record<TipoAcao, Operacao> = {
  desconto_percentual: (subtotal, percentual) =>
    subtotal.minus(subtotal.times(percentualParaFracao(percentual))),
  acrescimo_percentual: aplicarAcrescimoPercentual,
  desconto_valor: (subtotal, valor) => subtotal.minus(valor),
  acrescimo_valor: (subtotal, valor) => subtotal.plus(valor),
  acrescimo_faixa: aplicarAcrescimoPercentual,
};

/**
 * Aplica o efeito de uma regra sobre o subtotal unitário.
 * O resultado é arredondado em centavos e nunca fica negativo.
 */
export function aplicarAcao(tipoAcao: TipoAcao, valor: Decimal, subtotal: Decimal): Decimal {
  return limitarAZero(arredondar(OPERACOES[tipoAcao](subtotal, valor)));
}
