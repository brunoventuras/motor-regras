import { z } from 'zod';

const casasDecimais = (texto: string) => texto.split('.')[1]?.length ?? 0;

export const textoObrigatorio = (maximo: number) =>
  z.string().trim().min(1, 'Campo obrigatório.').max(maximo, `No máximo ${maximo} caracteres.`);

/** Número decimal positivo com limite de casas, convertido de texto para número. */
export const decimal = (casas: number, { minimo = 0, permitirZero = false } = {}) =>
  z
    .string()
    .trim()
    .min(1, 'Campo obrigatório.')
    .refine((texto) => !Number.isNaN(Number(texto)), 'Informe um número.')
    .refine((texto) => casasDecimais(texto) <= casas, `Use no máximo ${casas} casas decimais.`)
    .refine(
      (texto) => (permitirZero ? Number(texto) >= minimo : Number(texto) > minimo),
      permitirZero ? `O valor mínimo é ${minimo}.` : 'Informe um valor maior que zero.',
    )
    .transform(Number);

export const inteiro = (minimo: number) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, 'Informe um número inteiro.')
    .transform(Number)
    .refine((numero) => numero >= minimo, `O valor mínimo é ${minimo}.`);

export const inteiroOpcional = (minimo: number) =>
  z
    .string()
    .trim()
    .refine((texto) => texto === '' || /^\d+$/.test(texto), 'Informe um número inteiro.')
    .transform((texto) => (texto === '' ? null : Number(texto)))
    .refine((numero) => numero === null || numero >= minimo, `O valor mínimo é ${minimo}.`);
