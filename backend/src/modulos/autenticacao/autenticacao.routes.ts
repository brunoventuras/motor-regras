import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { autenticar } from '../../compartilhado/middlewares/autenticar.ts';
import { validarCorpo } from '../../compartilhado/middlewares/validar.ts';
import { login, usuarioAtual } from './autenticacao.controller.ts';
import { esquemaLogin } from './autenticacao.schemas.ts';

const limiteTentativas = rateLimit({
  windowMs: 60_000,
  limit: 10,
  message: { mensagem: 'Muitas tentativas de login. Aguarde um minuto.' },
});

export const rotasAutenticacao = Router();

rotasAutenticacao.post('/login', limiteTentativas, validarCorpo(esquemaLogin), login);
rotasAutenticacao.get('/eu', autenticar, usuarioAtual);
