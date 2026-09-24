import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AutenticacaoProvedor } from './contextos/AutenticacaoContexto.tsx';
import './estilos/global.css';
import { rotas } from './rotas.tsx';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Elemento raiz não encontrado.');

createRoot(raiz).render(
  <StrictMode>
    <AutenticacaoProvedor>
      <RouterProvider router={rotas} />
      <ToastContainer position="top-right" autoClose={4000} newestOnTop theme="light" />
    </AutenticacaoProvedor>
  </StrictMode>,
);
