import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { LayoutPrincipal } from './componentes/layout/LayoutPrincipal.tsx';
import { Carregando } from './componentes/ui/Carregando.tsx';
import { useAutenticacao } from './contextos/AutenticacaoContexto.tsx';
import { configuracaoCategorias } from './paginas/Catalogos/configuracoes/categorias.ts';
import { configuracaoFaixas } from './paginas/Catalogos/configuracoes/faixas.ts';
import { configuracaoGrupos } from './paginas/Catalogos/configuracoes/grupos.tsx';
import { configuracaoRegioes } from './paginas/Catalogos/configuracoes/regioes.ts';
import { configuracaoServicos } from './paginas/Catalogos/configuracoes/servicos.ts';
import { PaginaCatalogo } from './paginas/Catalogos/PaginaCatalogo.tsx';
import { Historico } from './paginas/Historico/Historico.tsx';
import { Login } from './paginas/Login/Login.tsx';
import { FormularioRegra } from './paginas/Regras/FormularioRegra.tsx';
import { ListaRegras } from './paginas/Regras/ListaRegras.tsx';
import { Simulador } from './paginas/Simulador/Simulador.tsx';

/** Libera as telas internas apenas com sessão válida. */
function RotaProtegida({ children }: { children: ReactNode }) {
  const { usuario, verificando } = useAutenticacao();
  if (verificando) return <Carregando texto="Verificando sessão..." />;
  return usuario ? children : <Navigate to="/login" replace />;
}

/** Impede que usuários sem autorização abram o cadastro de regra nova. */
function RotaAutorizada({ children }: { children: ReactNode }) {
  const { usuario } = useAutenticacao();
  return usuario?.autorizado ? children : <Navigate to="/regras" replace />;
}

export const rotas = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <RotaProtegida>
        <LayoutPrincipal />
      </RotaProtegida>
    ),
    children: [
      { index: true, element: <Navigate to="/simulador" replace /> },
      { path: 'simulador', element: <Simulador /> },
      { path: 'historico', element: <Historico /> },
      { path: 'regras', element: <ListaRegras /> },
      {
        path: 'regras/nova',
        element: (
          <RotaAutorizada>
            <FormularioRegra />
          </RotaAutorizada>
        ),
      },
      { path: 'regras/:id', element: <FormularioRegra /> },
      {
        path: 'cadastros/servicos',
        element: <PaginaCatalogo key="servicos" configuracao={configuracaoServicos} />,
      },
      {
        path: 'cadastros/categorias',
        element: <PaginaCatalogo key="categorias" configuracao={configuracaoCategorias} />,
      },
      {
        path: 'cadastros/regioes',
        element: <PaginaCatalogo key="regioes" configuracao={configuracaoRegioes} />,
      },
      {
        path: 'cadastros/faixas',
        element: <PaginaCatalogo key="faixas" configuracao={configuracaoFaixas} />,
      },
      {
        path: 'cadastros/grupos',
        element: <PaginaCatalogo key="grupos" configuracao={configuracaoGrupos} />,
      },
      { path: '*', element: <Navigate to="/simulador" replace /> },
    ],
  },
]);
