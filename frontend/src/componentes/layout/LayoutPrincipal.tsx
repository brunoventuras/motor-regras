import { NavLink, Outlet } from 'react-router';
import {
  Calculator,
  History,
  Layers,
  LogOut,
  MapPin,
  Package,
  SlidersHorizontal,
  Tags,
  Users,
} from 'lucide-react';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto.tsx';
import estilos from './LayoutPrincipal.module.css';

const MENU_PRINCIPAL = [
  { caminho: '/simulador', rotulo: 'Simulador', icone: Calculator },
  { caminho: '/historico', rotulo: 'Histórico', icone: History },
  { caminho: '/regras', rotulo: 'Regras', icone: SlidersHorizontal },
];

const MENU_CADASTROS = [
  { caminho: '/cadastros/servicos', rotulo: 'Serviços', icone: Package },
  { caminho: '/cadastros/categorias', rotulo: 'Categorias de cliente', icone: Users },
  { caminho: '/cadastros/regioes', rotulo: 'Regiões', icone: MapPin },
  { caminho: '/cadastros/faixas', rotulo: 'Faixas de utilização', icone: Layers },
  { caminho: '/cadastros/grupos', rotulo: 'Grupos de regras', icone: Tags },
];

const classeLink = ({ isActive }: { isActive: boolean }) =>
  `${estilos.link} ${isActive ? estilos.ativo : ''}`;

/** Estrutura das telas autenticadas: menu lateral escuro e conteúdo claro. */
export function LayoutPrincipal() {
  const { usuario, sair } = useAutenticacao();

  return (
    <div className={estilos.layout}>
      <aside className={estilos.menu}>
        <div className={estilos.marca}>
          <img src="/icone.svg" alt="" width={32} height={32} />
          <div>
            <strong>Motor de Regras</strong>
            <span>EMTEC · Juiz de Fora</span>
          </div>
        </div>

        <nav className={estilos.navegacao}>
          {MENU_PRINCIPAL.map(({ caminho, rotulo, icone: Icone }) => (
            <NavLink key={caminho} to={caminho} className={classeLink}>
              <Icone size={18} />
              {rotulo}
            </NavLink>
          ))}
          <span className={estilos.secao}>Cadastros</span>
          {MENU_CADASTROS.map(({ caminho, rotulo, icone: Icone }) => (
            <NavLink key={caminho} to={caminho} className={classeLink}>
              <Icone size={18} />
              {rotulo}
            </NavLink>
          ))}
        </nav>

        <div className={estilos.usuario}>
          <div className={estilos.dadosUsuario}>
            <strong>{usuario?.nome}</strong>
          </div>
          <button
            type="button"
            className={estilos.sair}
            onClick={sair}
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className={estilos.conteudo}>
        <Outlet />
      </main>
    </div>
  );
}
