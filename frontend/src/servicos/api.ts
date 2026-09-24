const CHAVE_TOKEN = 'motor-regras.token';
export const EVENTO_SESSAO_EXPIRADA = 'motor-regras:sessao-expirada';

/** Erro devolvido pela API, com a mensagem pronta para exibir ao usuário. */
export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.status = status;
  }
}

/** Lê o token salvo; o armazenamento pode estar indisponível em janelas privadas. */
export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export function salvarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(CHAVE_TOKEN, token);
    else localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    return;
  }
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH';

/**
 * Chamada única para a API: envia o token, converte o corpo em JSON e padroniza os erros.
 * Uma resposta 401 encerra a sessão e leva o usuário de volta ao login.
 */
export async function requisitar<T>(
  caminho: string,
  metodo: Metodo = 'GET',
  corpo?: unknown,
): Promise<T> {
  const token = lerToken();
  let resposta: Response;

  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi(0, 'Não foi possível conectar ao servidor.');
  }

  const conteudo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    if (resposta.status === 401 && token) window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    throw new ErroApi(
      resposta.status,
      conteudo?.mensagem ?? 'Não foi possível concluir a operação.',
    );
  }
  return conteudo as T;
}
