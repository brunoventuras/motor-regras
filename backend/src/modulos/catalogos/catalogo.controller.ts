import type { Request, Response } from 'express';
import { lerId } from '../../compartilhado/middlewares/validar.ts';
import type { ServiceCatalogo } from './catalogo.service.ts';

/** Traduz as requisições HTTP de um catálogo em chamadas ao seu service. */
export function criarControllerCatalogo<Registro, Dados>(
  service: ServiceCatalogo<Registro, Dados>,
) {
  return {
    async listar(_requisicao: Request, resposta: Response) {
      resposta.json(await service.listar());
    },
    async obter(requisicao: Request, resposta: Response) {
      resposta.json(await service.obter(lerId(requisicao)));
    },
    async criar(requisicao: Request, resposta: Response) {
      resposta.status(201).json(await service.criar(requisicao.body));
    },
    async atualizar(requisicao: Request, resposta: Response) {
      resposta.json(await service.atualizar(lerId(requisicao), requisicao.body));
    },
    async alterarAtivo(requisicao: Request, resposta: Response) {
      resposta.json(await service.alterarAtivo(lerId(requisicao), requisicao.body.ativo));
    },
  };
}
