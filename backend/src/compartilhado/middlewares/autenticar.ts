import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ambiente } from '../../config/ambiente.ts';
import { erroNaoAutenticado, erroProibido } from '../erros.ts';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  autorizado: boolean;
}

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: UsuarioAutenticado;
  }
}

/** Exige um token válido no cabeçalho Authorization e identifica o usuário da requisição. */
export function autenticar(requisicao: Request, _resposta: Response, proximo: NextFunction) {
  const [tipo, token] = requisicao.headers.authorization?.split(' ') ?? [];
  if (tipo !== 'Bearer' || !token) throw erroNaoAutenticado();

  try {
    requisicao.usuario = jwt.verify(token, ambiente.JWT_SEGREDO) as UsuarioAutenticado;
  } catch {
    throw erroNaoAutenticado();
  }
  proximo();
}

/** Libera a rota apenas para usuários autorizados a alterar regras e cadastros. */
export function exigirAutorizado(requisicao: Request, _resposta: Response, proximo: NextFunction) {
  if (!requisicao.usuario?.autorizado) throw erroProibido();
  proximo();
}

/** Usuário da requisição; só deve ser chamado em rotas protegidas por autenticar. */
export function usuarioDaRequisicao(requisicao: Request): UsuarioAutenticado {
  if (!requisicao.usuario) throw erroNaoAutenticado();
  return requisicao.usuario;
}
