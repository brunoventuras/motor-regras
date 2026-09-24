export type ValorDecimal = string;

export interface UsuarioSessao {
  id: number;
  nome: string;
  autorizado: boolean;
}

export interface Auditoria {
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Servico extends Auditoria {
  id: number;
  codigo: string;
  nome: string;
  valorBase: ValorDecimal;
}

export interface CategoriaCliente extends Auditoria {
  id: number;
  codigo: string;
  nome: string;
}

export interface Regiao extends Auditoria {
  id: number;
  codigo: string;
  nome: string;
  fatorPreco: ValorDecimal;
}

export interface FaixaUtilizacao extends Auditoria {
  id: number;
  quantidadeInicial: number;
  quantidadeFinal: number | null;
  acrescimo: ValorDecimal;
}

export interface GrupoRegra extends Auditoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export const CAMPOS_CONDICAO = [
  'servico',
  'categoria_cliente',
  'regiao',
  'quantidade',
  'faixa_utilizacao',
] as const;

export const OPERADORES_CONDICAO = [
  'igual',
  'diferente',
  'em',
  'maior',
  'maior_igual',
  'menor',
  'menor_igual',
  'entre',
] as const;

export const TIPOS_ACAO = [
  'desconto_percentual',
  'acrescimo_percentual',
  'desconto_valor',
  'acrescimo_valor',
  'acrescimo_faixa',
] as const;

export type CampoCondicao = (typeof CAMPOS_CONDICAO)[number];
export type OperadorCondicao = (typeof OPERADORES_CONDICAO)[number];
export type TipoAcao = (typeof TIPOS_ACAO)[number];

export type ResultadoAvaliacao =
  'aplicada' | 'condicao_nao_atendida' | 'superada_no_grupo' | 'sem_faixa';

export interface Condicao {
  id?: number;
  campo: CampoCondicao;
  operador: OperadorCondicao;
  valor: number | number[];
}

export interface Regra extends Auditoria {
  id: number;
  codigo: string;
  nome: string;
  prioridade: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  tipoAcao: TipoAcao;
  valorAcao: ValorDecimal | null;
  grupoId: number | null;
  grupo: { id: number; nome: string } | null;
  condicoes: Condicao[];
  criadoPor: { id: number; nome: string };
  atualizadoPor: { id: number; nome: string };
}

export interface DadosRegra {
  codigo: string;
  nome: string;
  prioridade: number;
  vigenciaInicio: string;
  vigenciaFim: string | null;
  tipoAcao: TipoAcao;
  valorAcao: number | null;
  grupoId: number | null;
  condicoes: Condicao[];
}

export interface CampoVocabulario {
  chave: CampoCondicao;
  rotulo: string;
  tipoValor: 'catalogo' | 'numero';
  operadores: OperadorCondicao[];
}

export interface Vocabulario {
  campos: CampoVocabulario[];
  operadores: { chave: OperadorCondicao; rotulo: string }[];
  tiposAcao: { chave: TipoAcao; rotulo: string }[];
}

export interface CondicaoMemoria {
  campo: CampoCondicao;
  campoRotulo: string;
  operador: OperadorCondicao;
  operadorRotulo: string;
  valorRotulo: string;
  valorContextoRotulo: string;
  atendida: boolean;
}

export interface RegraAvaliada {
  id: number;
  ordemAvaliacao: number;
  regraId: number;
  regraCodigo: string;
  regraNome: string;
  prioridade: number;
  grupoNome: string | null;
  tipoAcao: TipoAcao;
  valorAcao: ValorDecimal | null;
  condicoes: CondicaoMemoria[];
  resultado: ResultadoAvaliacao;
  valorAntes: ValorDecimal;
  valorDepois: ValorDecimal;
  delta: ValorDecimal;
}

export interface CalculoResumo {
  id: number;
  executadoEm: string;
  usuario: { id: number; nome: string };
  servicoNome: string;
  categoriaNome: string;
  regiaoNome: string;
  quantidade: number;
  valorUnitarioFinal: ValorDecimal;
  valorTotal: ValorDecimal;
}

export interface MemoriaCalculo extends CalculoResumo {
  valorBase: ValorDecimal;
  fatorPreco: ValorDecimal;
  faixaDescricao: string | null;
  valorUnitarioInicial: ValorDecimal;
  regrasAvaliadas: RegraAvaliada[];
}

export interface DadosCalculo {
  servicoId: number;
  categoriaClienteId: number;
  regiaoId: number;
  quantidade: number;
}
