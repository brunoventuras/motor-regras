import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import estilos from './Botao.module.css';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';

interface PropriedadesBotao extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  icone?: ReactNode;
  carregando?: boolean;
  compacto?: boolean;
}

/** Botão padrão do sistema; enquanto carrega fica desabilitado para evitar envio duplicado. */
export function Botao({
  variante = 'primario',
  icone,
  carregando = false,
  compacto = false,
  disabled,
  children,
  className,
  type = 'button',
  ...propriedades
}: PropriedadesBotao) {
  const classes = [estilos.botao, estilos[variante], compacto && estilos.compacto, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || carregando} {...propriedades}>
      {carregando ? <LoaderCircle size={16} className={estilos.girando} /> : icone}
      {children && <span>{children}</span>}
    </button>
  );
}
