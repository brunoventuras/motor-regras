import type { CalculoResumo, DadosCalculo, MemoriaCalculo } from '../tipos/api.ts';
import { requisitar } from './api.ts';

export const executarCalculo = (dados: DadosCalculo) =>
  requisitar<MemoriaCalculo>('/calculos', 'POST', dados);
export const listarCalculos = () => requisitar<CalculoResumo[]>('/calculos');
export const obterCalculo = (id: number) => requisitar<MemoriaCalculo>(`/calculos/${id}`);
