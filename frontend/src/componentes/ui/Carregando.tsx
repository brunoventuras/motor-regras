import { LoaderCircle } from 'lucide-react';
import estilos from './Carregando.module.css';

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div className={estilos.carregando} role="status">
      <LoaderCircle size={20} className={estilos.icone} />
      <span>{texto}</span>
    </div>
  );
}
