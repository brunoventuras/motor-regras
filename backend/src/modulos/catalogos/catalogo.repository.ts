/** Operações de persistência que todo catálogo oferece; cada catálogo implementa com a sua tabela. */
export interface RepositorioCatalogo<Registro, Dados> {
  listar(): Promise<Registro[]>;
  buscarPorId(id: number): Promise<Registro | null>;
  criar(dados: Dados): Promise<Registro>;
  atualizar(id: number, dados: Dados): Promise<Registro>;
  alterarAtivo(id: number, ativo: boolean): Promise<Registro>;
}
