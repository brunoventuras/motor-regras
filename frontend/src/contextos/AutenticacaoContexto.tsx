import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { EVENTO_SESSAO_EXPIRADA, lerToken, salvarToken } from '../servicos/api.ts';
import { entrar as entrarNaApi, obterUsuarioAtual } from '../servicos/autenticacao.ts';
import type { UsuarioSessao } from '../tipos/api.ts';

interface ValorAutenticacao {
  usuario: UsuarioSessao | null;
  verificando: boolean;
  entrar: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

const AutenticacaoContexto = createContext<ValorAutenticacao | null>(null);

/**
 * Mantém o usuário logado disponível para toda a aplicação.
 * Ao abrir o sistema, confirma com a API se o token salvo ainda é válido.
 */
export function AutenticacaoProvedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [verificando, setVerificando] = useState(() => lerToken() !== null);

  const sair = useCallback(() => {
    salvarToken(null);
    setUsuario(null);
  }, []);

  useEffect(() => {
    if (!lerToken()) return;
    obterUsuarioAtual()
      .then(setUsuario)
      .catch(sair)
      .finally(() => setVerificando(false));
  }, [sair]);

  useEffect(() => {
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, sair);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, sair);
  }, [sair]);

  const entrar = useCallback(async (login: string, senha: string) => {
    const resposta = await entrarNaApi(login, senha);
    salvarToken(resposta.token);
    setUsuario(resposta.usuario);
  }, []);

  return (
    <AutenticacaoContexto.Provider value={{ usuario, verificando, entrar, sair }}>
      {children}
    </AutenticacaoContexto.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(AutenticacaoContexto);
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de AutenticacaoProvedor.');
  return contexto;
}
