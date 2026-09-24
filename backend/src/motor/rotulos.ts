import type { OperadorCondicao, TipoAcao } from './tipos.ts';

export const ROTULOS_OPERADORES: Record<OperadorCondicao, string> = {
  igual: 'igual a',
  diferente: 'diferente de',
  em: 'é um de',
  maior: 'maior que',
  maior_igual: 'maior ou igual a',
  menor: 'menor que',
  menor_igual: 'menor ou igual a',
  entre: 'entre',
};

export const ROTULOS_TIPOS_ACAO: Record<TipoAcao, string> = {
  desconto_percentual: 'Desconto percentual',
  acrescimo_percentual: 'Acréscimo percentual',
  desconto_valor: 'Desconto em valor (R$ por unidade)',
  acrescimo_valor: 'Acréscimo em valor (R$ por unidade)',
  acrescimo_faixa: 'Acréscimo da faixa de utilização',
};
