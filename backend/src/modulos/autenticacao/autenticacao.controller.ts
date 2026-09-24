import type { Request, Response } from 'express';
import { usuarioDaRequisicao } from '../../compartilhado/middlewares/autenticar.ts';
import { entrar } from './autenticacao.service.ts';

/** POST /api/autenticacao/login */
export async function login(requisicao: Request, resposta: Response) {
  resposta.json(await entrar(requisicao.body));
}

/** GET /api/autenticacao/eu */
export function usuarioAtual(requisicao: Request, resposta: Response) {
  resposta.json(usuarioDaRequisicao(requisicao));
}
