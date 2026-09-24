import type { ReactNode } from 'react';
import estilos from './Tabela.module.css';

export interface ColunaTabela<T> {
  titulo: string;
  conteudo: (item: T) => ReactNode;
  alinhamento?: 'esquerda' | 'direita' | 'centro';
  largura?: string;
}

interface PropriedadesTabela<T> {
  colunas: ColunaTabela<T>[];
  itens: T[];
  chave: (item: T) => string | number;
  aoClicarLinha?: (item: T) => void;
  realcarInativo?: (item: T) => boolean;
  vazio?: ReactNode;
}

/** Tabela genérica: cada coluna define como exibir o item. */
export function Tabela<T>({
  colunas,
  itens,
  chave,
  aoClicarLinha,
  realcarInativo,
  vazio,
}: PropriedadesTabela<T>) {
  if (itens.length === 0)
    return <div className={estilos.vazio}>{vazio ?? 'Nenhum registro encontrado.'}</div>;

  return (
    <div className={estilos.rolagem}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.titulo}
                className={estilos[coluna.alinhamento ?? 'esquerda']}
                style={{ width: coluna.largura }}
              >
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => (
            <tr
              key={chave(item)}
              onClick={aoClicarLinha ? () => aoClicarLinha(item) : undefined}
              className={[
                aoClicarLinha && estilos.clicavel,
                realcarInativo?.(item) && estilos.inativo,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {colunas.map((coluna) => (
                <td key={coluna.titulo} className={estilos[coluna.alinhamento ?? 'esquerda']}>
                  {coluna.conteudo(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
