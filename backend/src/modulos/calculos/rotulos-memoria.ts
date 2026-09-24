import { prisma } from '../../compartilhado/prisma.ts';
import { CAMPOS } from '../../motor/campos.ts';
import { ROTULOS_OPERADORES } from '../../motor/rotulos.ts';
import type { CampoCondicao, CondicaoAvaliada } from '../../motor/tipos.ts';
import { descreverFaixa } from '../catalogos/faixas.regras.ts';

type NomesPorId = Map<number, string>;
type NomesPorCampo = Record<Exclude<CampoCondicao, 'quantidade'>, NomesPorId>;

/** Carrega os nomes de todos os itens de catálogo, inclusive inativos, para descrever as condições. */
export async function carregarNomesCatalogos(): Promise<NomesPorCampo> {
  const [servicos, categorias, regioes, faixas] = await Promise.all([
    prisma.servico.findMany({ select: { id: true, nome: true } }),
    prisma.categoriaCliente.findMany({ select: { id: true, nome: true } }),
    prisma.regiao.findMany({ select: { id: true, nome: true } }),
    prisma.faixaUtilizacao.findMany(),
  ]);

  const paraMapa = (itens: { id: number; nome: string }[]) =>
    new Map(itens.map((item) => [item.id, item.nome]));

  return {
    servico: paraMapa(servicos),
    categoria_cliente: paraMapa(categorias),
    regiao: paraMapa(regioes),
    faixa_utilizacao: paraMapa(
      faixas.map((faixa) => ({
        id: faixa.id,
        nome: descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal),
      })),
    ),
  };
}

/** Converte um valor de condição em texto legível, ex.: 3 vira "Estratégico" e [51, 100] vira "51 e 100". */
function descreverValor(
  campo: CampoCondicao,
  valor: number | number[] | null,
  nomes: NomesPorCampo,
) {
  if (valor === null) return 'não se aplica';
  if (campo === 'quantidade') {
    return Array.isArray(valor) ? `${valor[0]} e ${valor[1]}` : String(valor);
  }
  const nome = (id: number) => nomes[campo].get(id) ?? `#${id}`;
  return Array.isArray(valor) ? valor.map(nome).join(', ') : nome(valor);
}

/**
 * Monta a cópia das condições gravada na memória, já com os textos legíveis.
 * Assim o histórico continua compreensível mesmo que um cadastro seja renomeado depois.
 */
export function descreverCondicoes(condicoes: CondicaoAvaliada[], nomes: NomesPorCampo) {
  return condicoes.map((condicao) => ({
    campo: condicao.campo,
    campoRotulo: CAMPOS[condicao.campo].rotulo,
    operador: condicao.operador,
    operadorRotulo: ROTULOS_OPERADORES[condicao.operador],
    valor: condicao.valor,
    valorRotulo: descreverValor(condicao.campo, condicao.valor, nomes),
    valorContexto: condicao.valorContexto,
    valorContextoRotulo: descreverValor(condicao.campo, condicao.valorContexto, nomes),
    atendida: condicao.atendida,
  }));
}
