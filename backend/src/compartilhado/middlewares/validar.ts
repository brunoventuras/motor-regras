import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { erroRequisicaoInvalida } from '../erros.ts';

/** Valida o corpo da requisição e o substitui pela versão tipada e normalizada. */
export function validarCorpo(esquema: ZodType) {
  return (requisicao: Request, _resposta: Response, proximo: NextFunction) => {
    const resultado = esquema.safeParse(requisicao.body);
    if (!resultado.success) {
      const problemas = resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.'),
        mensagem: problema.message,
      }));
      throw erroRequisicaoInvalida(problemas[0]?.mensagem ?? 'Dados inválidos.', problemas);
    }
    requisicao.body = resultado.data;
    proximo();
  };
}

/** Converte o parâmetro :id da rota em número inteiro positivo. */
export function lerId(requisicao: Request): number {
  const id = Number(requisicao.params.id);
  if (!Number.isInteger(id) || id <= 0) throw erroRequisicaoInvalida('Identificador inválido.');
  return id;
}
