import { Decimal } from 'decimal.js';

const ZERO = new Decimal(0);
const CEM = new Decimal(100);

/** Arredonda para centavos, com meio para cima, como numa calculadora comercial. */
export function arredondar(valor: Decimal): Decimal {
  return valor.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
}

/** Impede que descontos levem o valor abaixo de zero. */
export function limitarAZero(valor: Decimal): Decimal {
  return Decimal.max(valor, ZERO);
}

/** Converte um percentual (ex.: 5) em fração (0,05). */
export function percentualParaFracao(percentual: Decimal): Decimal {
  return percentual.dividedBy(CEM);
}
