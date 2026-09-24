import type { Decimal } from 'decimal.js';
import { aplicarAcao } from './aplicar-acao.ts';
import { avaliarCondicao } from './avaliar-condicao.ts';
import { arredondar } from './dinheiro.ts';
import type {
  CondicaoAvaliada,
  ContextoAvaliacao,
  EntradaCalculo,
  FaixaMotor,
  RegraAvaliadaMotor,
  RegraMotor,
  ResultadoAvaliacao,
  ResultadoCalculo,
} from './tipos.ts';

/** Localiza a faixa ativa que contém a quantidade informada. */
export function encontrarFaixa(faixas: FaixaMotor[], quantidade: number): FaixaMotor | null {
  return (
    faixas.find(
      (faixa) =>
        quantidade >= faixa.quantidadeInicial &&
        (faixa.quantidadeFinal === null || quantidade <= faixa.quantidadeFinal),
    ) ?? null
  );
}

/** Mantém apenas as regras ativas e vigentes no momento do cálculo. */
export function filtrarRegrasElegiveis(regras: RegraMotor[], momento: Date): RegraMotor[] {
  return regras.filter(
    (regra) =>
      regra.ativo &&
      regra.vigenciaInicio <= momento &&
      (regra.vigenciaFim === null || regra.vigenciaFim > momento),
  );
}

/** Ordena por prioridade; em empate vale a regra mais antiga e, por último, o id. */
export function ordenarRegras(regras: RegraMotor[]): RegraMotor[] {
  return [...regras].sort(
    (a, b) =>
      a.prioridade - b.prioridade || a.criadoEm.getTime() - b.criadoEm.getTime() || a.id - b.id,
  );
}

/** Decide o desfecho da regra a partir das condições, do grupo e da faixa. */
function definirResultado(
  regra: RegraMotor,
  condicoes: CondicaoAvaliada[],
  gruposAplicados: Set<number>,
  faixa: FaixaMotor | null,
): ResultadoAvaliacao {
  if (!condicoes.every((condicao) => condicao.atendida)) return 'condicao_nao_atendida';
  if (regra.grupo && gruposAplicados.has(regra.grupo.id)) return 'superada_no_grupo';
  if (regra.tipoAcao === 'acrescimo_faixa' && !faixa) return 'sem_faixa';
  return 'aplicada';
}

/** Valor efetivo da ação: o percentual da faixa para acrescimo_faixa, o valor da regra nos demais casos. */
function obterValorAcao(regra: RegraMotor, faixa: FaixaMotor | null): Decimal | null {
  return regra.tipoAcao === 'acrescimo_faixa' ? (faixa?.acrescimo ?? null) : regra.valorAcao;
}

/**
 * Executa o cálculo completo e devolve a memória de cada regra avaliada.
 * 1. Preço de tabela: valor base do serviço multiplicado pelo fator da região.
 * 2. Regras elegíveis em ordem de prioridade, cada uma sobre o subtotal da anterior.
 * 3. Em um grupo exclusivo, apenas a primeira regra atendida é aplicada.
 * 4. Total: valor unitário final multiplicado pela quantidade.
 */
export function calcular(entrada: EntradaCalculo): ResultadoCalculo {
  const faixa = encontrarFaixa(entrada.faixas, entrada.quantidade);
  const contexto: ContextoAvaliacao = {
    servicoId: entrada.servico.id,
    categoriaClienteId: entrada.categoriaCliente.id,
    regiaoId: entrada.regiao.id,
    quantidade: entrada.quantidade,
    faixa,
  };

  const valorUnitarioInicial = arredondar(
    entrada.servico.valorBase.times(entrada.regiao.fatorPreco),
  );
  const regras = ordenarRegras(filtrarRegrasElegiveis(entrada.regras, entrada.momento));
  const gruposAplicados = new Set<number>();
  const regrasAvaliadas: RegraAvaliadaMotor[] = [];
  let subtotal = valorUnitarioInicial;

  regras.forEach((regra, indice) => {
    const condicoes = regra.condicoes.map((condicao) => avaliarCondicao(condicao, contexto));
    const resultado = definirResultado(regra, condicoes, gruposAplicados, faixa);
    const valorAcao = obterValorAcao(regra, faixa);
    const valorAntes = subtotal;

    if (resultado === 'aplicada' && valorAcao) {
      subtotal = aplicarAcao(regra.tipoAcao, valorAcao, subtotal);
      if (regra.grupo) gruposAplicados.add(regra.grupo.id);
    }

    regrasAvaliadas.push({
      ordemAvaliacao: indice + 1,
      regraId: regra.id,
      regraCodigo: regra.codigo,
      regraNome: regra.nome,
      prioridade: regra.prioridade,
      grupoNome: regra.grupo?.nome ?? null,
      tipoAcao: regra.tipoAcao,
      valorAcao,
      condicoes,
      resultado,
      valorAntes,
      valorDepois: subtotal,
      delta: subtotal.minus(valorAntes),
    });
  });

  return {
    valorUnitarioInicial,
    valorUnitarioFinal: subtotal,
    valorTotal: arredondar(subtotal.times(entrada.quantidade)),
    faixa,
    regrasAvaliadas,
  };
}
