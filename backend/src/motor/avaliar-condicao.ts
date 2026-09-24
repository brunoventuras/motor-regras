import { CAMPOS } from './campos.ts';
import type {
  CondicaoAvaliada,
  CondicaoMotor,
  ContextoAvaliacao,
  OperadorCondicao,
} from './tipos.ts';

type Comparacao = (atual: number, esperado: number | number[]) => boolean;

const COMPARACOES: Record<OperadorCondicao, Comparacao> = {
  igual: (atual, esperado) => atual === esperado,
  diferente: (atual, esperado) => atual !== esperado,
  em: (atual, esperado) => Array.isArray(esperado) && esperado.includes(atual),
  maior: (atual, esperado) => atual > Number(esperado),
  maior_igual: (atual, esperado) => atual >= Number(esperado),
  menor: (atual, esperado) => atual < Number(esperado),
  menor_igual: (atual, esperado) => atual <= Number(esperado),
  entre: (atual, esperado) => {
    if (!Array.isArray(esperado)) return false;
    const [minimo, maximo] = esperado;
    return atual >= minimo && atual <= maximo;
  },
};

/**
 * Compara o valor do pedido com o valor esperado pela condição.
 * Quando o pedido não possui o valor (ex.: quantidade fora de qualquer faixa), a condição não é atendida.
 */
export function avaliarCondicao(
  condicao: CondicaoMotor,
  contexto: ContextoAvaliacao,
): CondicaoAvaliada {
  const valorContexto = CAMPOS[condicao.campo].obterValor(contexto);
  const atendida =
    valorContexto !== null && COMPARACOES[condicao.operador](valorContexto, condicao.valor);

  return { ...condicao, valorContexto, atendida };
}
