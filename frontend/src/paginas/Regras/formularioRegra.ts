import { z } from 'zod';
import {
  CAMPOS_CONDICAO,
  OPERADORES_CONDICAO,
  TIPOS_ACAO,
  type CampoCondicao,
  type Condicao,
  type DadosRegra,
  type OperadorCondicao,
  type Regra,
} from '../../tipos/api.ts';

const inteiro = (texto: string) => /^\d+$/.test(texto.trim());

const esquemaCondicaoFormulario = z
  .object({
    campo: z.enum(CAMPOS_CONDICAO),
    operador: z.enum(OPERADORES_CONDICAO),
    valorUnico: z.string(),
    valorLista: z.array(z.number()),
    valorMinimo: z.string(),
    valorMaximo: z.string(),
  })
  .superRefine((condicao, contexto) => {
    const reportar = (campo: string, mensagem: string) =>
      contexto.addIssue({ code: 'custom', path: [campo], message: mensagem });

    if (condicao.operador === 'entre') {
      if (!inteiro(condicao.valorMinimo)) reportar('valorMinimo', 'Informe o mínimo.');
      if (!inteiro(condicao.valorMaximo)) reportar('valorMaximo', 'Informe o máximo.');
      else if (Number(condicao.valorMinimo) > Number(condicao.valorMaximo)) {
        reportar('valorMaximo', 'O máximo deve ser maior ou igual ao mínimo.');
      }
    } else if (condicao.operador === 'em') {
      if (condicao.valorLista.length === 0) reportar('valorLista', 'Selecione ao menos uma opção.');
    } else if (!inteiro(condicao.valorUnico)) {
      reportar(
        'valorUnico',
        condicao.campo === 'quantidade' ? 'Informe um número inteiro.' : 'Selecione uma opção.',
      );
    }
  });

/** Validação da tela, espelhando a da API para avisar o usuário antes do envio. */
export const esquemaRegraFormulario = z
  .object({
    codigo: z.string().trim().min(1, 'Informe o código.').max(20, 'No máximo 20 caracteres.'),
    nome: z.string().trim().min(1, 'Informe o nome.').max(100, 'No máximo 100 caracteres.'),
    prioridade: z.string().refine(inteiro, 'Informe um número inteiro.'),
    grupoId: z.string(),
    tipoAcao: z.enum(TIPOS_ACAO, { error: 'Selecione a ação.' }),
    valorAcao: z.string(),
    vigenciaInicio: z.string().min(1, 'Informe o início da vigência.'),
    vigenciaFim: z.string(),
    condicoes: z.array(esquemaCondicaoFormulario),
  })
  .superRefine((regra, contexto) => {
    const reportar = (campo: string, mensagem: string) =>
      contexto.addIssue({ code: 'custom', path: [campo], message: mensagem });
    const valor = Number(regra.valorAcao);

    if (regra.tipoAcao !== 'acrescimo_faixa') {
      if (!regra.valorAcao.trim() || !(valor > 0))
        reportar('valorAcao', 'Informe um valor maior que zero.');
      else if (regra.tipoAcao === 'desconto_percentual' && valor > 100) {
        reportar('valorAcao', 'O desconto não pode passar de 100%.');
      }
    }
    if (regra.vigenciaFim && regra.vigenciaFim <= regra.vigenciaInicio) {
      reportar('vigenciaFim', 'Deve ser posterior ao início.');
    }
  });

export type RegraFormulario = z.infer<typeof esquemaRegraFormulario>;
export type CondicaoFormulario = z.infer<typeof esquemaCondicaoFormulario>;

/** Data no formato do campo de data (aaaa-mm-dd), no fuso local. */
function paraDataCampo(valor: string | Date) {
  const data = new Date(valor);
  const doisDigitos = (numero: number) => String(numero).padStart(2, '0');
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Converte a data do campo em instante ISO, à meia-noite do fuso local. */
const paraInstante = (dataCampo: string) => new Date(`${dataCampo}T00:00:00`).toISOString();

export function condicaoVazia(
  campo: CampoCondicao,
  operador: OperadorCondicao,
): CondicaoFormulario {
  return { campo, operador, valorUnico: '', valorLista: [], valorMinimo: '', valorMaximo: '' };
}

export function regraVazia(): RegraFormulario {
  return {
    codigo: '',
    nome: '',
    prioridade: '100',
    grupoId: '',
    tipoAcao: 'desconto_percentual',
    valorAcao: '',
    vigenciaInicio: paraDataCampo(new Date()),
    vigenciaFim: '',
    condicoes: [],
  };
}

function condicaoParaFormulario({ campo, operador, valor }: Condicao): CondicaoFormulario {
  const base = condicaoVazia(campo, operador);
  if (operador === 'entre' && Array.isArray(valor)) {
    return { ...base, valorMinimo: String(valor[0]), valorMaximo: String(valor[1]) };
  }
  if (operador === 'em' && Array.isArray(valor)) return { ...base, valorLista: valor };
  return { ...base, valorUnico: String(valor) };
}

function condicaoParaApi(condicao: CondicaoFormulario): Condicao {
  const { campo, operador } = condicao;
  if (operador === 'entre') {
    return { campo, operador, valor: [Number(condicao.valorMinimo), Number(condicao.valorMaximo)] };
  }
  if (operador === 'em') return { campo, operador, valor: condicao.valorLista };
  return { campo, operador, valor: Number(condicao.valorUnico) };
}

export function regraParaFormulario(regra: Regra): RegraFormulario {
  return {
    codigo: regra.codigo,
    nome: regra.nome,
    prioridade: String(regra.prioridade),
    grupoId: regra.grupoId ? String(regra.grupoId) : '',
    tipoAcao: regra.tipoAcao,
    valorAcao: regra.valorAcao ? String(Number(regra.valorAcao)) : '',
    vigenciaInicio: paraDataCampo(regra.vigenciaInicio),
    vigenciaFim: regra.vigenciaFim ? paraDataCampo(regra.vigenciaFim) : '',
    condicoes: regra.condicoes.map(condicaoParaFormulario),
  };
}

export function formularioParaApi(formulario: RegraFormulario): DadosRegra {
  return {
    codigo: formulario.codigo.trim(),
    nome: formulario.nome.trim(),
    prioridade: Number(formulario.prioridade),
    grupoId: formulario.grupoId ? Number(formulario.grupoId) : null,
    tipoAcao: formulario.tipoAcao,
    valorAcao: formulario.tipoAcao === 'acrescimo_faixa' ? null : Number(formulario.valorAcao),
    vigenciaInicio: paraInstante(formulario.vigenciaInicio),
    vigenciaFim: formulario.vigenciaFim ? paraInstante(formulario.vigenciaFim) : null,
    condicoes: formulario.condicoes.map(condicaoParaApi),
  };
}
