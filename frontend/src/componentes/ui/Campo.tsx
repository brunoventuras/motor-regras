import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { Ajuda } from './Ajuda.tsx';
import estilos from './Campo.module.css';

interface PropriedadesCampo {
  rotulo: string;
  erro?: string;
  dica?: string;
  obrigatorio?: boolean;
  children: ReactNode;
}

/** Moldura de um campo de formulário: rótulo com dica no ícone de informação, controle e mensagem de erro. */
export function Campo({ rotulo, erro, dica, obrigatorio, children }: PropriedadesCampo) {
  return (
    <label className={estilos.campo}>
      <span className={estilos.rotulo}>
        {rotulo}
        {obrigatorio && <span className={estilos.obrigatorio}> *</span>}
        {dica && <Ajuda texto={dica} />}
      </span>
      {children}
      {erro && <span className={estilos.erro}>{erro}</span>}
    </label>
  );
}

export function Entrada({ className, ...propriedades }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={[estilos.controle, className].filter(Boolean).join(' ')} {...propriedades} />
  );
}

export function Selecao({
  className,
  children,
  ...propriedades
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={[estilos.controle, className].filter(Boolean).join(' ')} {...propriedades}>
      {children}
    </select>
  );
}

export function AreaTexto({
  className,
  ...propriedades
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[estilos.controle, estilos.areaTexto, className].filter(Boolean).join(' ')}
      {...propriedades}
    />
  );
}
