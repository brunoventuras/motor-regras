/** Erro de negócio com status HTTP; tratado de forma única pelo middleware de erros. */
export class ErroAplicacao extends Error {
  readonly status: number;
  readonly detalhes?: unknown;

  constructor(status: number, mensagem: string, detalhes?: unknown) {
    super(mensagem);
    this.status = status;
    this.detalhes = detalhes;
  }
}

export const erroRequisicaoInvalida = (mensagem: string, detalhes?: unknown) =>
  new ErroAplicacao(400, mensagem, detalhes);

export const erroNaoAutenticado = (mensagem = 'Sessão inválida ou expirada. Entre novamente.') =>
  new ErroAplicacao(401, mensagem);

export const erroProibido = (mensagem = 'Você não tem permissão para esta operação.') =>
  new ErroAplicacao(403, mensagem);

export const erroNaoEncontrado = (mensagem: string) => new ErroAplicacao(404, mensagem);

export const erroConflito = (mensagem: string) => new ErroAplicacao(409, mensagem);
