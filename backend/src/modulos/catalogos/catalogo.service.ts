import { erroNaoEncontrado } from '../../compartilhado/erros.ts';
import type { RepositorioCatalogo } from './catalogo.repository.ts';

export interface RegrasCatalogo<Registro, Dados> {
  mensagemNaoEncontrado: string;
  antesDeSalvar?: (dados: Dados, idAtual?: number) => Promise<void>;
  antesDeAtivar?: (registro: Registro) => Promise<void>;
}

/**
 * Regras de negócio comuns aos catálogos: consultar, criar, editar, ativar e desativar.
 * Catálogos não são excluídos, porque regras e cálculos antigos continuam referenciando seus ids.
 */
export function criarServiceCatalogo<Registro, Dados>(
  repositorio: RepositorioCatalogo<Registro, Dados>,
  regras: RegrasCatalogo<Registro, Dados>,
) {
  async function obter(id: number) {
    const registro = await repositorio.buscarPorId(id);
    if (!registro) throw erroNaoEncontrado(regras.mensagemNaoEncontrado);
    return registro;
  }

  async function criar(dados: Dados) {
    await regras.antesDeSalvar?.(dados);
    return repositorio.criar(dados);
  }

  async function atualizar(id: number, dados: Dados) {
    await obter(id);
    await regras.antesDeSalvar?.(dados, id);
    return repositorio.atualizar(id, dados);
  }

  async function alterarAtivo(id: number, ativo: boolean) {
    const registro = await obter(id);
    if (ativo) await regras.antesDeAtivar?.(registro);
    return repositorio.alterarAtivo(id, ativo);
  }

  return { listar: () => repositorio.listar(), obter, criar, atualizar, alterarAtivo };
}

export type ServiceCatalogo<Registro, Dados> = ReturnType<
  typeof criarServiceCatalogo<Registro, Dados>
>;
