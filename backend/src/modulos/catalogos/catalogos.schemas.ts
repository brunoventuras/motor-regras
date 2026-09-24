import { z } from 'zod';

const codigo = z
  .string()
  .trim()
  .min(1, 'Informe o código.')
  .max(20, 'Código com no máximo 20 caracteres.');
const nome = z
  .string()
  .trim()
  .min(1, 'Informe o nome.')
  .max(100, 'Nome com no máximo 100 caracteres.');

export const esquemaServico = z.object({
  codigo,
  nome,
  valorBase: z
    .number({ error: 'Informe o valor base.' })
    .positive('O valor base deve ser maior que zero.')
    .max(9_999_999_999.99)
    .multipleOf(0.01, 'Use no máximo 2 casas decimais.'),
});

export const esquemaCategoriaCliente = z.object({ codigo, nome });

export const esquemaRegiao = z.object({
  codigo,
  nome,
  fatorPreco: z
    .number({ error: 'Informe o fator de preço.' })
    .positive('O fator deve ser maior que zero.')
    .max(99.9999)
    .multipleOf(0.0001, 'Use no máximo 4 casas decimais.'),
});

export const esquemaFaixa = z
  .object({
    quantidadeInicial: z
      .number()
      .int('Use números inteiros.')
      .min(1, 'A quantidade inicial mínima é 1.'),
    quantidadeFinal: z.number().int('Use números inteiros.').nullable(),
    acrescimo: z
      .number({ error: 'Informe o acréscimo.' })
      .min(0, 'O acréscimo não pode ser negativo.')
      .max(999.99)
      .multipleOf(0.01, 'Use no máximo 2 casas decimais.'),
  })
  .refine(
    (faixa) => faixa.quantidadeFinal === null || faixa.quantidadeFinal >= faixa.quantidadeInicial,
    {
      message: 'A quantidade final deve ser maior ou igual à inicial.',
      path: ['quantidadeFinal'],
    },
  );

export const esquemaGrupoRegra = z.object({
  nome: z.string().trim().min(1, 'Informe o nome.').max(60, 'Nome com no máximo 60 caracteres.'),
  descricao: z.string().trim().max(255).nullable().default(null),
});

export type DadosServico = z.infer<typeof esquemaServico>;
export type DadosCategoriaCliente = z.infer<typeof esquemaCategoriaCliente>;
export type DadosRegiao = z.infer<typeof esquemaRegiao>;
export type DadosFaixa = z.infer<typeof esquemaFaixa>;
export type DadosGrupoRegra = z.infer<typeof esquemaGrupoRegra>;
