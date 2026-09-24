import { Info } from 'lucide-react';
import estilos from './Ajuda.module.css';

/**
 * Ícone de informação que mostra o texto de ajuda ao passar o mouse ou focar.
 * O balão abre abaixo do elemento posicionado mais próximo, na largura dele.
 */
export function Ajuda({ texto }: { texto: string }) {
  return (
    <span className={estilos.ajuda} tabIndex={0} aria-label={texto}>
      <Info size={14} />
      <span className={estilos.balao} role="tooltip">
        {texto}
      </span>
    </span>
  );
}
