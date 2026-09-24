import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

/** Carrega dados da API ao montar a tela e expõe uma função para recarregar após alterações. */
export function useConsulta<T>(buscar: () => Promise<T>, valorInicial: T) {
  const [dados, setDados] = useState<T>(valorInicial);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      setDados(await buscar());
    } catch (erro) {
      toast.error((erro as Error).message);
    } finally {
      setCarregando(false);
    }
  }, [buscar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, carregando, recarregar };
}
