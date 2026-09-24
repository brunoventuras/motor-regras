import { Etiqueta } from '../../../componentes/ui/Etiqueta.tsx';
import type { ColunaTabela } from '../../../componentes/ui/Tabela.tsx';
import type { ItemCatalogo } from './tipos.ts';

export function colunaSituacao<T extends ItemCatalogo>(): ColunaTabela<T> {
  return {
    titulo: 'Situação',
    largura: '120px',
    conteudo: (item) =>
      item.ativo ? (
        <Etiqueta tom="sucesso">Ativo</Etiqueta>
      ) : (
        <Etiqueta tom="neutro">Desativado</Etiqueta>
      ),
  };
}
