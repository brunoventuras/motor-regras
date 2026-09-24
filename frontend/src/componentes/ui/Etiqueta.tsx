import type { ReactNode } from 'react';
import estilos from './Etiqueta.module.css';

export type TomEtiqueta = 'sucesso' | 'alerta' | 'perigo' | 'neutro' | 'informativo';

/** Selo em formato de pílula para status e classificações. */
export function Etiqueta({ tom = 'neutro', children }: { tom?: TomEtiqueta; children: ReactNode }) {
  return <span className={`${estilos.etiqueta} ${estilos[tom]}`}>{children}</span>;
}
