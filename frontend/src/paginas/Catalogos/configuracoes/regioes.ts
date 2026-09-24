import { z } from 'zod';
import { ENDERECOS_CATALOGO } from '../../../servicos/catalogos.ts';
import type { Regiao } from '../../../tipos/api.ts';
import { formatarNumero } from '../../../utilitarios/formatacao.ts';
import { colunaSituacao } from './colunasComuns.tsx';
import type { ConfiguracaoCatalogo } from './tipos.ts';
import { decimal, textoObrigatorio } from './validacoes.ts';

export const configuracaoRegioes: ConfiguracaoCatalogo<Regiao> = {
  titulo: 'Regiões',
  descricao: 'Regiões de atendimento. O fator multiplica o valor base e forma o preço de tabela.',
  nomeItem: 'região',
  endereco: ENDERECOS_CATALOGO.regioes,
  colunas: [
    { titulo: 'Código', conteudo: (regiao) => regiao.codigo, largura: '90px' },
    { titulo: 'Nome', conteudo: (regiao) => regiao.nome },
    {
      titulo: 'Fator de preço',
      conteudo: (regiao) => formatarNumero(regiao.fatorPreco),
      alinhamento: 'direita',
    },
    colunaSituacao(),
  ],
  campos: [
    { nome: 'codigo', rotulo: 'Código', tipo: 'texto', obrigatorio: true, maximoCaracteres: 20 },
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maximoCaracteres: 100 },
    {
      nome: 'fatorPreco',
      rotulo: 'Fator de preço',
      tipo: 'numero',
      obrigatorio: true,
      passo: 0.0001,
      minimo: 0.0001,
      dica: 'Ex.: 1.10 deixa o preço 10% acima do valor base.',
    },
  ],
  esquema: z.object({
    codigo: textoObrigatorio(20),
    nome: textoObrigatorio(100),
    fatorPreco: decimal(4),
  }),
  valoresIniciais: { codigo: '', nome: '', fatorPreco: '1' },
  paraFormulario: (regiao) => ({
    codigo: regiao.codigo,
    nome: regiao.nome,
    fatorPreco: String(Number(regiao.fatorPreco)),
  }),
  textoBusca: (regiao) => `${regiao.codigo} ${regiao.nome}`,
  identificar: (regiao) => regiao.nome,
};
