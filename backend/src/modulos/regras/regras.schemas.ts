import { z } from 'zod';
import { CampoCondicao, OperadorCondicao, TipoAcao } from '../../generated/prisma/enums.ts';
import { CAMPOS } from '../../motor/campos.ts';

const idPositivo = (valor: unknown) => Number.isInteger(valor) && Number(valor) > 0;

/** Confere se o formato do valor combina com o operador e com o tipo do campo. */
function validarValorCondicao(
  condicao: { campo: CampoCondicao; operador: OperadorCondicao; valor: number | number[] },
  contexto: z.RefinementCtx,
) {
  const campo = CAMPOS[condicao.campo];
  const reportar = (mensagem: string) =>
    contexto.addIssue({ code: 'custom', message: mensagem, path: ['valor'] });

  if (!campo.operadores.includes(condicao.operador)) {
    contexto.addIssue({
      code: 'custom',
      message: `O operador escolhido não se aplica ao campo ${campo.rotulo}.`,
      path: ['operador'],
    });
    return;
  }

  const { operador, valor } = condicao;
  if (operador === 'entre') {
    const intervaloValido =
      Array.isArray(valor) &&
      valor.length === 2 &&
      valor.every(Number.isInteger) &&
      valor[0] >= 0 &&
      valor[0] <= valor[1];
    if (!intervaloValido) reportar('Informe um intervalo com mínimo menor ou igual ao máximo.');
    return;
  }

  if (operador === 'em') {
    if (!Array.isArray(valor) || valor.length === 0 || !valor.every(idPositivo)) {
      reportar('Selecione ao menos uma opção.');
    }
    return;
  }

  if (Array.isArray(valor)) return reportar('Informe um único valor.');
  if (campo.tipoValor === 'catalogo' && !idPositivo(valor)) return reportar('Selecione uma opção.');
  if (campo.tipoValor === 'numero' && (!Number.isInteger(valor) || valor < 0)) {
    reportar('Informe um número inteiro não negativo.');
  }
}

const esquemaCondicao = z
  .object({
    campo: z.enum(CampoCondicao, { error: 'Campo inválido.' }),
    operador: z.enum(OperadorCondicao, { error: 'Operador inválido.' }),
    valor: z.union([z.number(), z.array(z.number())], { error: 'Informe o valor da condição.' }),
  })
  .superRefine(validarValorCondicao);

export const esquemaRegra = z
  .object({
    codigo: z
      .string()
      .trim()
      .min(1, 'Informe o código.')
      .max(20, 'Código com no máximo 20 caracteres.'),
    nome: z
      .string()
      .trim()
      .min(1, 'Informe o nome.')
      .max(100, 'Nome com no máximo 100 caracteres.'),
    prioridade: z.number().int('A prioridade deve ser inteira.').min(0).max(9999),
    vigenciaInicio: z.coerce.date({ error: 'Data de início inválida.' }).default(() => new Date()),
    vigenciaFim: z.coerce.date({ error: 'Data de fim inválida.' }).nullable().default(null),
    tipoAcao: z.enum(TipoAcao, { error: 'Tipo de ação inválido.' }),
    valorAcao: z.number().multipleOf(0.01, 'Use no máximo 2 casas decimais.').nullable(),
    grupoId: z.number().int().positive().nullable().default(null),
    condicoes: z
      .array(esquemaCondicao)
      .max(20, 'Uma regra aceita no máximo 20 condições.')
      .default([]),
  })
  .superRefine((regra, contexto) => {
    const reportar = (path: string, message: string) =>
      contexto.addIssue({ code: 'custom', path: [path], message });

    if (regra.tipoAcao === 'acrescimo_faixa') {
      if (regra.valorAcao !== null) {
        reportar(
          'valorAcao',
          'O acréscimo da faixa usa o percentual cadastrado na faixa; deixe o valor vazio.',
        );
      }
    } else if (regra.valorAcao === null || regra.valorAcao <= 0) {
      reportar('valorAcao', 'Informe um valor maior que zero.');
    } else if (regra.tipoAcao === 'desconto_percentual' && regra.valorAcao > 100) {
      reportar('valorAcao', 'O desconto percentual não pode passar de 100%.');
    }

    if (regra.vigenciaFim && regra.vigenciaFim <= regra.vigenciaInicio) {
      reportar('vigenciaFim', 'O fim da vigência deve ser posterior ao início.');
    }
  });

export type DadosRegra = z.infer<typeof esquemaRegra>;
