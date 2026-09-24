import type {
  CategoriaCliente,
  FaixaUtilizacao,
  GrupoRegra,
  Regiao,
  Servico,
} from '../tipos/api.ts';
import { requisitar } from './api.ts';

export const ENDERECOS_CATALOGO = {
  servicos: '/servicos',
  categorias: '/categorias-cliente',
  regioes: '/regioes',
  faixas: '/faixas',
  grupos: '/grupos-regra',
} as const;

export const listarCatalogo = <T>(endereco: string) => requisitar<T[]>(endereco);

export const criarItemCatalogo = <T>(endereco: string, dados: unknown) =>
  requisitar<T>(endereco, 'POST', dados);

export const atualizarItemCatalogo = <T>(endereco: string, id: number, dados: unknown) =>
  requisitar<T>(`${endereco}/${id}`, 'PUT', dados);

export const alterarAtivoCatalogo = <T>(endereco: string, id: number, ativo: boolean) =>
  requisitar<T>(`${endereco}/${id}/ativo`, 'PATCH', { ativo });

export const listarServicos = () => listarCatalogo<Servico>(ENDERECOS_CATALOGO.servicos);
export const listarCategorias = () =>
  listarCatalogo<CategoriaCliente>(ENDERECOS_CATALOGO.categorias);
export const listarRegioes = () => listarCatalogo<Regiao>(ENDERECOS_CATALOGO.regioes);
export const listarFaixas = () => listarCatalogo<FaixaUtilizacao>(ENDERECOS_CATALOGO.faixas);
export const listarGrupos = () => listarCatalogo<GrupoRegra>(ENDERECOS_CATALOGO.grupos);
