import { z } from 'zod';
import { ENDERECOS_CATALOGO } from '../../../servicos/catalogos.ts';
import type { GrupoRegra } from '../../../tipos/api.ts';
import { colunaSituacao } from './colunasComuns.tsx';
import type { ConfiguracaoCatalogo } from './tipos.ts';
import { textoObrigatorio } from './validacoes.ts';

export const configuracaoGrupos: ConfiguracaoCatalogo<GrupoRegra> = {
  titulo: 'Grupos de regras',
  descricao:
    'Regras do mesmo grupo não se acumulam: apenas a primeira atendida, pela prioridade, é aplicada. Um grupo desativado deixa de ser oferecido para novas regras, mas continua valendo nas que já o usam.',
  nomeItem: 'grupo',
  endereco: ENDERECOS_CATALOGO.grupos,
  colunas: [
    { titulo: 'Nome', conteudo: (grupo) => <strong>{grupo.nome}</strong> },
    { titulo: 'Descrição', conteudo: (grupo) => grupo.descricao ?? '·' },
    colunaSituacao(),
  ],
  campos: [
    { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true, maximoCaracteres: 60 },
    { nome: 'descricao', rotulo: 'Descrição', tipo: 'textoLongo', maximoCaracteres: 255 },
  ],
  esquema: z.object({
    nome: textoObrigatorio(60),
    descricao: z
      .string()
      .trim()
      .max(255, 'No máximo 255 caracteres.')
      .transform((texto) => texto || null),
  }),
  valoresIniciais: { nome: '', descricao: '' },
  paraFormulario: (grupo) => ({ nome: grupo.nome, descricao: grupo.descricao ?? '' }),
  textoBusca: (grupo) => `${grupo.nome} ${grupo.descricao ?? ''}`,
  identificar: (grupo) => `grupo ${grupo.nome}`,
};
