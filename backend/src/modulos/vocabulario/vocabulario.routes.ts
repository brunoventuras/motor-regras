import { Router } from 'express';
import { CAMPOS } from '../../motor/campos.ts';
import { ROTULOS_OPERADORES, ROTULOS_TIPOS_ACAO } from '../../motor/rotulos.ts';

/** Vocabulário do motor exposto ao front, que monta os formulários de regra a partir dele. */
function montarVocabulario() {
  return {
    campos: Object.entries(CAMPOS).map(([chave, campo]) => ({
      chave,
      rotulo: campo.rotulo,
      tipoValor: campo.tipoValor,
      operadores: campo.operadores,
    })),
    operadores: Object.entries(ROTULOS_OPERADORES).map(([chave, rotulo]) => ({ chave, rotulo })),
    tiposAcao: Object.entries(ROTULOS_TIPOS_ACAO).map(([chave, rotulo]) => ({ chave, rotulo })),
  };
}

export const rotasVocabulario = Router();

rotasVocabulario.get('/', (_requisicao, resposta) => {
  resposta.json(montarVocabulario());
});
