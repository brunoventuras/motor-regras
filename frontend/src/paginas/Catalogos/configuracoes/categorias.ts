import { z } from 'zod';
import { ENDERECOS_CATALOGO } from '../../../servicos/catalogos.ts';
import type { CategoriaCliente } from '../../../tipos/api.ts';
import { colunaSituacao } from './colunasComuns.tsx';
import type { ConfiguracaoCatalogo } from './tipos.ts';
import { textoObrigatorio } from './validacoes.ts';

export const configuracaoCategorias: ConfiguracaoCatalogo<CategoriaCliente> = {
  titulo: 'Categorias de cliente',
  descricao: 'Classificação do cliente, usada como critério nas condições das regras.',
  nomeItem: 'categoria',
  endereco: ENDERECOS_CATALOGO.categorias,
  colunas: [
    { titulo: 'Código', conteudo: (categoria) => categoria.codigo, largura: '90px' },
    { titulo: 'Nome', conteudo: (categoria) => categoria.nome },
    colunaSituacao(),
  ],
  campos: [
    { nome: 'codigo', rotulo: 'Código', tipo: 'texto', obrigatorio: true, maximoCaracteres: 20 },
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maximoCaracteres: 100 },
  ],
  esquema: z.object({ codigo: textoObrigatorio(20), nome: textoObrigatorio(100) }),
  valoresIniciais: { codigo: '', nome: '' },
  paraFormulario: (categoria) => ({ codigo: categoria.codigo, nome: categoria.nome }),
  textoBusca: (categoria) => `${categoria.codigo} ${categoria.nome}`,
  identificar: (categoria) => categoria.nome,
};
