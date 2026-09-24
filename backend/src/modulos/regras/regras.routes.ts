import { Router } from 'express';
import { autenticar, exigirAutorizado } from '../../compartilhado/middlewares/autenticar.ts';
import { validarCorpo } from '../../compartilhado/middlewares/validar.ts';
import { esquemaAtivo } from '../../compartilhado/esquemas.ts';
import { alterarAtivo, atualizar, criar, listar, obter } from './regras.controller.ts';
import { esquemaRegra } from './regras.schemas.ts';

const escrita = [autenticar, exigirAutorizado];

export const rotasRegras = Router();

rotasRegras.get('/', autenticar, listar);
rotasRegras.get('/:id', autenticar, obter);
rotasRegras.post('/', ...escrita, validarCorpo(esquemaRegra), criar);
rotasRegras.put('/:id', ...escrita, validarCorpo(esquemaRegra), atualizar);
rotasRegras.patch('/:id/ativo', ...escrita, validarCorpo(esquemaAtivo), alterarAtivo);
