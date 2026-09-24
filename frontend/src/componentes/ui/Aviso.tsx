import type { ReactNode } from 'react';
import { Info, TriangleAlert } from 'lucide-react';
import estilos from './Aviso.module.css';

/** Faixa de aviso dentro da página, para orientar o usuário sem interromper o fluxo. */
export function Aviso({
  tom = 'informativo',
  children,
}: {
  tom?: 'informativo' | 'alerta';
  children: ReactNode;
}) {
  return (
    <div className={`${estilos.aviso} ${estilos[tom]}`}>
      {tom === 'alerta' ? <TriangleAlert size={16} /> : <Info size={16} />}
      <div>{children}</div>
    </div>
  );
}
