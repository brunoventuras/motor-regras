import type { ZodType } from 'zod';
import type { ColunaTabela } from '../../../componentes/ui/Tabela.tsx';

export type ValoresFormulario = Record<string, string>;

export interface CampoFormulario {
  nome: string;
  rotulo: string;
  tipo: 'texto' | 'numero' | 'textoLongo';
  obrigatorio?: boolean;
  passo?: number;
  minimo?: number;
  maximoCaracteres?: number;
  dica?: string;
}

export interface ItemCatalogo {
  id: number;
  ativo: boolean;
}

/**
 * Ficha de um catálogo: tudo o que muda de um cadastro para outro.
 * A página genérica usa a ficha para montar a tabela, o formulário e as chamadas à API.
 */
export interface ConfiguracaoCatalogo<T extends ItemCatalogo> {
  titulo: string;
  descricao: string;
  nomeItem: string;
  endereco: string;
  colunas: ColunaTabela<T>[];
  campos: CampoFormulario[];
  esquema: ZodType<unknown, ValoresFormulario>;
  valoresIniciais: ValoresFormulario;
  paraFormulario: (item: T) => ValoresFormulario;
  textoBusca: (item: T) => string;
  identificar: (item: T) => string;
}
