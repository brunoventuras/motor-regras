import { Search } from 'lucide-react';
import estilos from './BarraFiltros.module.css';

interface PropriedadesBarraFiltros {
  busca: string;
  aoBuscar: (texto: string) => void;
  mostrarInativos: boolean;
  aoAlternarInativos: (mostrar: boolean) => void;
  placeholder?: string;
  rotuloInativos?: string;
}

/** Busca por texto e opção de exibir registros desativados. */
export function BarraFiltros({
  busca,
  aoBuscar,
  mostrarInativos,
  aoAlternarInativos,
  placeholder = 'Buscar...',
  rotuloInativos = 'Mostrar desativados',
}: PropriedadesBarraFiltros) {
  return (
    <div className={estilos.barra}>
      <label className={estilos.busca}>
        <Search size={16} />
        <input
          value={busca}
          onChange={(evento) => aoBuscar(evento.target.value)}
          placeholder={placeholder}
        />
      </label>
      <label className={estilos.alternar}>
        <input
          type="checkbox"
          checked={mostrarInativos}
          onChange={(evento) => aoAlternarInativos(evento.target.checked)}
        />
        {rotuloInativos}
      </label>
    </div>
  );
}
