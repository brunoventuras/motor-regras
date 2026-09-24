import type { CampoCondicao, ContextoAvaliacao, OperadorCondicao } from './tipos.ts';

type TipoValorCampo = 'catalogo' | 'numero';

interface DefinicaoCampo {
  rotulo: string;
  tipoValor: TipoValorCampo;
  operadores: OperadorCondicao[];
  obterValor: (contexto: ContextoAvaliacao) => number | null;
}

const OPERADORES_CATALOGO: OperadorCondicao[] = ['igual', 'diferente', 'em'];

const OPERADORES_NUMERICOS: OperadorCondicao[] = [
  'igual',
  'diferente',
  'maior',
  'maior_igual',
  'menor',
  'menor_igual',
  'entre',
];

/**
 * Vocabulário de campos que as condições podem avaliar.
 * Cada campo informa como é exibido, quais operadores aceita e de onde vem o seu valor no pedido.
 * Um campo novo exige uma entrada aqui e o valor correspondente no enum CampoCondicao do schema.
 */
export const CAMPOS: Record<CampoCondicao, DefinicaoCampo> = {
  servico: {
    rotulo: 'Serviço',
    tipoValor: 'catalogo',
    operadores: OPERADORES_CATALOGO,
    obterValor: (contexto) => contexto.servicoId,
  },
  categoria_cliente: {
    rotulo: 'Categoria do cliente',
    tipoValor: 'catalogo',
    operadores: OPERADORES_CATALOGO,
    obterValor: (contexto) => contexto.categoriaClienteId,
  },
  regiao: {
    rotulo: 'Região',
    tipoValor: 'catalogo',
    operadores: OPERADORES_CATALOGO,
    obterValor: (contexto) => contexto.regiaoId,
  },
  quantidade: {
    rotulo: 'Quantidade',
    tipoValor: 'numero',
    operadores: OPERADORES_NUMERICOS,
    obterValor: (contexto) => contexto.quantidade,
  },
  faixa_utilizacao: {
    rotulo: 'Faixa de utilização',
    tipoValor: 'catalogo',
    operadores: OPERADORES_CATALOGO,
    obterValor: (contexto) => contexto.faixa?.id ?? null,
  },
};
