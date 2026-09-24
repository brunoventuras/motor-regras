import type { Decimal } from 'decimal.js';
import type {
  CampoCondicao,
  OperadorCondicao,
  ResultadoAvaliacao,
  TipoAcao,
} from '../generated/prisma/enums.ts';

export type { CampoCondicao, OperadorCondicao, ResultadoAvaliacao, TipoAcao };

export interface ItemCatalogo {
  id: number;
  nome: string;
}

export interface FaixaMotor {
  id: number;
  quantidadeInicial: number;
  quantidadeFinal: number | null;
  acrescimo: Decimal;
}

export interface CondicaoMotor {
  campo: CampoCondicao;
  operador: OperadorCondicao;
  valor: number | number[];
}

export interface RegraMotor {
  id: number;
  codigo: string;
  nome: string;
  prioridade: number;
  ativo: boolean;
  vigenciaInicio: Date;
  vigenciaFim: Date | null;
  criadoEm: Date;
  grupo: ItemCatalogo | null;
  tipoAcao: TipoAcao;
  valorAcao: Decimal | null;
  condicoes: CondicaoMotor[];
}

export interface EntradaCalculo {
  servico: ItemCatalogo & { valorBase: Decimal };
  categoriaCliente: ItemCatalogo;
  regiao: ItemCatalogo & { fatorPreco: Decimal };
  quantidade: number;
  momento: Date;
  regras: RegraMotor[];
  faixas: FaixaMotor[];
}

/** Dados do pedido já resolvidos, consultados pelas condições durante a avaliação. */
export interface ContextoAvaliacao {
  servicoId: number;
  categoriaClienteId: number;
  regiaoId: number;
  quantidade: number;
  faixa: FaixaMotor | null;
}

export interface CondicaoAvaliada extends CondicaoMotor {
  valorContexto: number | null;
  atendida: boolean;
}

export interface RegraAvaliadaMotor {
  ordemAvaliacao: number;
  regraId: number;
  regraCodigo: string;
  regraNome: string;
  prioridade: number;
  grupoNome: string | null;
  tipoAcao: TipoAcao;
  valorAcao: Decimal | null;
  condicoes: CondicaoAvaliada[];
  resultado: ResultadoAvaliacao;
  valorAntes: Decimal;
  valorDepois: Decimal;
  delta: Decimal;
}

export interface ResultadoCalculo {
  valorUnitarioInicial: Decimal;
  valorUnitarioFinal: Decimal;
  valorTotal: Decimal;
  faixa: FaixaMotor | null;
  regrasAvaliadas: RegraAvaliadaMotor[];
}
