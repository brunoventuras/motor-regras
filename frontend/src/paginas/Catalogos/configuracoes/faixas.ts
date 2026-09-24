import { z } from 'zod';
import { ENDERECOS_CATALOGO } from '../../../servicos/catalogos.ts';
import type { FaixaUtilizacao } from '../../../tipos/api.ts';
import { descreverFaixa, formatarPercentual } from '../../../utilitarios/formatacao.ts';
import { colunaSituacao } from './colunasComuns.tsx';
import type { ConfiguracaoCatalogo } from './tipos.ts';
import { decimal, inteiro, inteiroOpcional } from './validacoes.ts';

export const configuracaoFaixas: ConfiguracaoCatalogo<FaixaUtilizacao> = {
  titulo: 'Faixas de utilização',
  descricao:
    'Acréscimo por quantidade contratada, aplicado pelas regras do tipo "acréscimo da faixa". Faixas ativas não podem se sobrepor.',
  nomeItem: 'faixa',
  endereco: ENDERECOS_CATALOGO.faixas,
  colunas: [
    {
      titulo: 'Quantidade',
      conteudo: (faixa) => descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal),
    },
    {
      titulo: 'Acréscimo',
      conteudo: (faixa) => formatarPercentual(faixa.acrescimo),
      alinhamento: 'direita',
    },
    colunaSituacao(),
  ],
  campos: [
    {
      nome: 'quantidadeInicial',
      rotulo: 'Quantidade inicial',
      tipo: 'numero',
      obrigatorio: true,
      passo: 1,
      minimo: 1,
    },
    {
      nome: 'quantidadeFinal',
      rotulo: 'Quantidade final',
      tipo: 'numero',
      passo: 1,
      minimo: 1,
      dica: 'Deixe vazio para "ou mais", sem limite superior.',
    },
    {
      nome: 'acrescimo',
      rotulo: 'Acréscimo (%)',
      tipo: 'numero',
      obrigatorio: true,
      passo: 0.01,
      minimo: 0,
    },
  ],
  esquema: z
    .object({
      quantidadeInicial: inteiro(1),
      quantidadeFinal: inteiroOpcional(1),
      acrescimo: decimal(2, { permitirZero: true }),
    })
    .refine(
      (faixa) => faixa.quantidadeFinal === null || faixa.quantidadeFinal >= faixa.quantidadeInicial,
      {
        message: 'A quantidade final deve ser maior ou igual à inicial.',
        path: ['quantidadeFinal'],
      },
    ),
  valoresIniciais: { quantidadeInicial: '', quantidadeFinal: '', acrescimo: '' },
  paraFormulario: (faixa) => ({
    quantidadeInicial: String(faixa.quantidadeInicial),
    quantidadeFinal: faixa.quantidadeFinal === null ? '' : String(faixa.quantidadeFinal),
    acrescimo: String(Number(faixa.acrescimo)),
  }),
  textoBusca: (faixa) => descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal),
  identificar: (faixa) => `faixa ${descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal)}`,
};
