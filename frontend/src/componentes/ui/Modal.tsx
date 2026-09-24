import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import estilos from './Modal.module.css';

interface PropriedadesModal {
  titulo: string;
  aberto: boolean;
  aoFechar: () => void;
  children: ReactNode;
  rodape?: ReactNode;
  largo?: boolean;
}

/** Janela sobreposta; fecha com Esc ou clicando fora. */
export function Modal({ titulo, aberto, aoFechar, children, rodape, largo }: PropriedadesModal) {
  useEffect(() => {
    if (!aberto) return;
    const aoTeclar = (evento: KeyboardEvent) => evento.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  return (
    <div
      className={estilos.fundo}
      onMouseDown={(evento) => evento.target === evento.currentTarget && aoFechar()}
    >
      <div
        className={`${estilos.janela} ${largo ? estilos.larga : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <header className={estilos.cabecalho}>
          <h2>{titulo}</h2>
          <button type="button" className={estilos.fechar} onClick={aoFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className={estilos.corpo}>{children}</div>
        {rodape && <footer className={estilos.rodape}>{rodape}</footer>}
      </div>
    </div>
  );
}
