import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.ts';
import { ErroAplicacao } from '../erros.ts';

const MENSAGENS_RESTRICAO: Record<string, string> = {
  faixa_sem_sobreposicao: 'A faixa informada se sobrepõe a outra faixa ativa.',
  regra_valor_acao_coerente: 'Valor da ação incompatível com o tipo de ação.',
  regra_desconto_percentual_maximo: 'Desconto percentual não pode passar de 100%.',
  regra_vigencia_valida: 'O fim da vigência deve ser posterior ao início.',
};

/** Traduz violações de restrições do banco em mensagens de negócio. */
function traduzirErroBanco(erro: unknown): ErroAplicacao | null {
  if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
    return new ErroAplicacao(409, 'Já existe um registro com este código ou nome.');
  }
  const texto = erro instanceof Error ? erro.message : '';
  const restricao = Object.keys(MENSAGENS_RESTRICAO).find((nome) => texto.includes(nome));
  return restricao ? new ErroAplicacao(409, MENSAGENS_RESTRICAO[restricao]) : null;
}

/** Ponto único de tratamento de erros: toda resposta de erro segue o formato { mensagem, detalhes }. */
export function tratarErros(
  erro: unknown,
  _requisicao: Request,
  resposta: Response,
  _proximo: NextFunction,
) {
  const erroConhecido = erro instanceof ErroAplicacao ? erro : traduzirErroBanco(erro);

  if (erroConhecido) {
    resposta.status(erroConhecido.status).json({
      mensagem: erroConhecido.message,
      detalhes: erroConhecido.detalhes,
    });
    return;
  }

  console.error(erro);
  resposta.status(500).json({ mensagem: 'Erro interno. Tente novamente em instantes.' });
}
