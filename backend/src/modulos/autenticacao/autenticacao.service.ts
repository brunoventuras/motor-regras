import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { ambiente } from '../../config/ambiente.ts';
import { ErroAplicacao } from '../../compartilhado/erros.ts';
import type { UsuarioAutenticado } from '../../compartilhado/middlewares/autenticar.ts';
import { prisma } from '../../compartilhado/prisma.ts';
import type { DadosLogin } from './autenticacao.schemas.ts';

/**
 * Confere login e senha e emite o token de acesso.
 * A mensagem de falha é a mesma para login ou senha incorretos, para não revelar quais logins existem.
 */
export async function entrar({ login, senha }: DadosLogin) {
  const usuario = await prisma.usuario.findUnique({ where: { login } });
  const senhaConfere = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;

  if (!usuario || !usuario.ativo || !senhaConfere) {
    throw new ErroAplicacao(401, 'Login ou senha incorretos.');
  }

  const dadosToken: UsuarioAutenticado = {
    id: usuario.id,
    nome: usuario.nome,
    autorizado: usuario.autorizado,
  };
  const token = jwt.sign(dadosToken, ambiente.JWT_SEGREDO, {
    expiresIn: ambiente.JWT_EXPIRACAO as SignOptions['expiresIn'],
  });

  return { token, usuario: dadosToken };
}
