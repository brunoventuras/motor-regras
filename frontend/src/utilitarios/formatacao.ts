import type { TipoAcao } from '../tipos/api.ts';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 4 });
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const data = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

export const formatarMoeda = (valor: string | number) => moeda.format(Number(valor));
export const formatarNumero = (valor: string | number) => numero.format(Number(valor));
export const formatarPercentual = (valor: string | number) => `${numero.format(Number(valor))}%`;
export const formatarDataHora = (valor: string) => dataHora.format(new Date(valor));
export const formatarData = (valor: string) => data.format(new Date(valor));

/** Diferença com sinal explícito, ex.: "+ R$ 19,00" ou "− R$ 10,00". */
export function formatarDelta(valor: string | number) {
  const numeroDelta = Number(valor);
  if (numeroDelta === 0) return formatarMoeda(0);
  return `${numeroDelta > 0 ? '+' : '−'} ${formatarMoeda(Math.abs(numeroDelta))}`;
}

/** Descreve a ação de uma regra em linguagem de negócio, ex.: "Desconto de 5%". */
export function descreverAcao(tipoAcao: TipoAcao, valorAcao: string | number | null) {
  const valor = valorAcao === null ? '' : String(valorAcao);
  const descricoes: Record<TipoAcao, string> = {
    desconto_percentual: `Desconto de ${formatarPercentual(valor)}`,
    acrescimo_percentual: `Acréscimo de ${formatarPercentual(valor)}`,
    desconto_valor: `Desconto de ${formatarMoeda(valor)} por unidade`,
    acrescimo_valor: `Acréscimo de ${formatarMoeda(valor)} por unidade`,
    acrescimo_faixa:
      valorAcao === null
        ? 'Acréscimo da faixa de utilização'
        : `Acréscimo da faixa: ${formatarPercentual(valor)}`,
  };
  return descricoes[tipoAcao];
}

export function descreverFaixa(quantidadeInicial: number, quantidadeFinal: number | null) {
  return quantidadeFinal === null
    ? `${quantidadeInicial} ou mais`
    : `${quantidadeInicial} a ${quantidadeFinal}`;
}
