import type { DadosRegra, Regra, Vocabulario } from '../tipos/api.ts';
import { requisitar } from './api.ts';

export const listarRegras = () => requisitar<Regra[]>('/regras');
export const obterRegra = (id: number) => requisitar<Regra>(`/regras/${id}`);
export const criarRegra = (dados: DadosRegra) => requisitar<Regra>('/regras', 'POST', dados);
export const atualizarRegra = (id: number, dados: DadosRegra) =>
  requisitar<Regra>(`/regras/${id}`, 'PUT', dados);
export const alterarAtivoRegra = (id: number, ativo: boolean) =>
  requisitar<Regra>(`/regras/${id}/ativo`, 'PATCH', { ativo });
export const obterVocabulario = () => requisitar<Vocabulario>('/vocabulario');
