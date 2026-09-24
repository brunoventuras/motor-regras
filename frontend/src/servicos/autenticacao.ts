import type { UsuarioSessao } from '../tipos/api.ts';
import { requisitar } from './api.ts';

export const entrar = (login: string, senha: string) =>
  requisitar<{ token: string; usuario: UsuarioSessao }>('/autenticacao/login', 'POST', {
    login,
    senha,
  });

export const obterUsuarioAtual = () => requisitar<UsuarioSessao>('/autenticacao/eu');
