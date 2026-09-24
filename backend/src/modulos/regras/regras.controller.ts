import type { Request, Response } from 'express';
import { usuarioDaRequisicao } from '../../compartilhado/middlewares/autenticar.ts';
import { lerId } from '../../compartilhado/middlewares/validar.ts';
import {
  alterarAtivoRegra,
  atualizarRegra,
  criarRegra,
  listarRegras,
  obterRegra,
} from './regras.service.ts';

/** GET /api/regras */
export async function listar(_requisicao: Request, resposta: Response) {
  resposta.json(await listarRegras());
}

/** GET /api/regras/:id */
export async function obter(requisicao: Request, resposta: Response) {
  resposta.json(await obterRegra(lerId(requisicao)));
}

/** POST /api/regras */
export async function criar(requisicao: Request, resposta: Response) {
  const usuario = usuarioDaRequisicao(requisicao);
  resposta.status(201).json(await criarRegra(requisicao.body, usuario.id));
}

/** PUT /api/regras/:id */
export async function atualizar(requisicao: Request, resposta: Response) {
  const usuario = usuarioDaRequisicao(requisicao);
  resposta.json(await atualizarRegra(lerId(requisicao), requisicao.body, usuario.id));
}

/** PATCH /api/regras/:id/ativo */
export async function alterarAtivo(requisicao: Request, resposta: Response) {
  const usuario = usuarioDaRequisicao(requisicao);
  resposta.json(await alterarAtivoRegra(lerId(requisicao), requisicao.body.ativo, usuario.id));
}
