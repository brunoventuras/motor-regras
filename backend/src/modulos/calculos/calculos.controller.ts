import type { Request, Response } from 'express';
import { usuarioDaRequisicao } from '../../compartilhado/middlewares/autenticar.ts';
import { lerId } from '../../compartilhado/middlewares/validar.ts';
import { executarCalculo, listarCalculos, obterCalculo } from './calculos.service.ts';

/** POST /api/calculos */
export async function executar(requisicao: Request, resposta: Response) {
  const usuario = usuarioDaRequisicao(requisicao);
  resposta.status(201).json(await executarCalculo(requisicao.body, usuario.id));
}

/** GET /api/calculos */
export async function listar(_requisicao: Request, resposta: Response) {
  resposta.json(await listarCalculos());
}

/** GET /api/calculos/:id */
export async function obter(requisicao: Request, resposta: Response) {
  resposta.json(await obterCalculo(lerId(requisicao)));
}
