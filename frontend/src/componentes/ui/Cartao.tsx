import type { ReactNode } from 'react';
import { Ajuda } from './Ajuda.tsx';
import estilos from './Cartao.module.css';

interface PropriedadesCartao {
  titulo?: string;
  descricao?: string;
  ajuda?: string;
  acoes?: ReactNode;
  children: ReactNode;
  semEspaco?: boolean;
  compacto?: boolean;
}

/** Superfície branca arredondada que agrupa um bloco de conteúdo. */
export function Cartao({
  titulo,
  descricao,
  ajuda,
  acoes,
  children,
  semEspaco,
  compacto,
}: PropriedadesCartao) {
  return (
    <section
      className={[estilos.cartao, compacto && estilos.compacto, semEspaco && estilos.semEspaco]
        .filter(Boolean)
        .join(' ')}
    >
      {(titulo || acoes) && (
        <header className={estilos.cabecalho}>
          <div>
            {titulo && (
              <h2 className={estilos.titulo}>
                {titulo}
                {ajuda && <Ajuda texto={ajuda} />}
              </h2>
            )}
            {descricao && <p className={estilos.descricao}>{descricao}</p>}
          </div>
          {acoes}
        </header>
      )}
      <div className={semEspaco ? undefined : estilos.corpo}>{children}</div>
    </section>
  );
}
