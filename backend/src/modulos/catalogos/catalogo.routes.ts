import { Router } from 'express';
import type { ZodType } from 'zod';
import { autenticar, exigirAutorizado } from '../../compartilhado/middlewares/autenticar.ts';
import { validarCorpo } from '../../compartilhado/middlewares/validar.ts';
import { criarControllerCatalogo } from './catalogo.controller.ts';
import { esquemaAtivo } from '../../compartilhado/esquemas.ts';
import type { ServiceCatalogo } from './catalogo.service.ts';

/** Rotas padrão de um catálogo: leitura para usuários autenticados, escrita apenas para autorizados. */
export function criarRotasCatalogo<Registro, Dados>(
  service: ServiceCatalogo<Registro, Dados>,
  esquemaDados: ZodType,
) {
  const controller = criarControllerCatalogo(service);
  const rotas = Router();
  const escrita = [autenticar, exigirAutorizado];

  rotas.get('/', autenticar, controller.listar);
  rotas.get('/:id', autenticar, controller.obter);
  rotas.post('/', ...escrita, validarCorpo(esquemaDados), controller.criar);
  rotas.put('/:id', ...escrita, validarCorpo(esquemaDados), controller.atualizar);
  rotas.patch('/:id/ativo', ...escrita, validarCorpo(esquemaAtivo), controller.alterarAtivo);

  return rotas;
}
