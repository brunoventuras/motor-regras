import type { ReactNode } from 'react';
import estilos from './CabecalhoPagina.module.css';

interface PropriedadesCabecalho {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
}

export function CabecalhoPagina({ titulo, descricao, acoes }: PropriedadesCabecalho) {
  return (
    <header className={estilos.cabecalho}>
      <div>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {descricao && <p className={estilos.descricao}>{descricao}</p>}
      </div>
      {acoes && <div className={estilos.acoes}>{acoes}</div>}
    </header>
  );
}
