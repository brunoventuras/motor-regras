import { z } from 'zod';
import { ENDERECOS_CATALOGO } from '../../../servicos/catalogos.ts';
import type { Servico } from '../../../tipos/api.ts';
import { formatarMoeda } from '../../../utilitarios/formatacao.ts';
import { colunaSituacao } from './colunasComuns.tsx';
import type { ConfiguracaoCatalogo } from './tipos.ts';
import { decimal, textoObrigatorio } from './validacoes.ts';

export const configuracaoServicos: ConfiguracaoCatalogo<Servico> = {
  titulo: 'Serviços',
  descricao:
    'Serviços contratáveis e o preço unitário de tabela, antes do fator da região e das regras.',
  nomeItem: 'serviço',
  endereco: ENDERECOS_CATALOGO.servicos,
  colunas: [
    { titulo: 'Código', conteudo: (servico) => servico.codigo, largura: '90px' },
    { titulo: 'Nome', conteudo: (servico) => servico.nome },
    {
      titulo: 'Valor base',
      conteudo: (servico) => formatarMoeda(servico.valorBase),
      alinhamento: 'direita',
    },
    colunaSituacao(),
  ],
  campos: [
    { nome: 'codigo', rotulo: 'Código', tipo: 'texto', obrigatorio: true, maximoCaracteres: 20 },
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maximoCaracteres: 100 },
    {
      nome: 'valorBase',
      rotulo: 'Valor base (R$)',
      tipo: 'numero',
      obrigatorio: true,
      passo: 0.01,
      minimo: 0.01,
    },
  ],
  esquema: z.object({
    codigo: textoObrigatorio(20),
    nome: textoObrigatorio(100),
    valorBase: decimal(2),
  }),
  valoresIniciais: { codigo: '', nome: '', valorBase: '' },
  paraFormulario: (servico) => ({
    codigo: servico.codigo,
    nome: servico.nome,
    valorBase: String(Number(servico.valorBase)),
  }),
  textoBusca: (servico) => `${servico.codigo} ${servico.nome}`,
  identificar: (servico) => servico.nome,
};
