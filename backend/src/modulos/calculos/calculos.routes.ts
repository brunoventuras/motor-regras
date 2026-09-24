import { Router } from 'express';
import { autenticar } from '../../compartilhado/middlewares/autenticar.ts';
import { validarCorpo } from '../../compartilhado/middlewares/validar.ts';
import { executar, listar, obter } from './calculos.controller.ts';
import { esquemaCalculo } from './calculos.schemas.ts';

export const rotasCalculos = Router();

rotasCalculos.use(autenticar);
rotasCalculos.post('/', validarCorpo(esquemaCalculo), executar);
rotasCalculos.get('/', listar);
rotasCalculos.get('/:id', obter);
