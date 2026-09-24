import { prisma } from '../../compartilhado/prisma.ts';
import type {
  CategoriaCliente,
  FaixaUtilizacao,
  GrupoRegra,
  Regiao,
  Servico,
} from '../../generated/prisma/client.ts';
import type { RepositorioCatalogo } from './catalogo.repository.ts';
import type {
  DadosCategoriaCliente,
  DadosFaixa,
  DadosGrupoRegra,
  DadosRegiao,
  DadosServico,
} from './catalogos.schemas.ts';

export const repositorioServicos: RepositorioCatalogo<Servico, DadosServico> = {
  listar: () => prisma.servico.findMany({ orderBy: { codigo: 'asc' } }),
  buscarPorId: (id) => prisma.servico.findUnique({ where: { id } }),
  criar: (dados) => prisma.servico.create({ data: dados }),
  atualizar: (id, dados) => prisma.servico.update({ where: { id }, data: dados }),
  alterarAtivo: (id, ativo) => prisma.servico.update({ where: { id }, data: { ativo } }),
};

export const repositorioCategorias: RepositorioCatalogo<CategoriaCliente, DadosCategoriaCliente> = {
  listar: () => prisma.categoriaCliente.findMany({ orderBy: { codigo: 'asc' } }),
  buscarPorId: (id) => prisma.categoriaCliente.findUnique({ where: { id } }),
  criar: (dados) => prisma.categoriaCliente.create({ data: dados }),
  atualizar: (id, dados) => prisma.categoriaCliente.update({ where: { id }, data: dados }),
  alterarAtivo: (id, ativo) => prisma.categoriaCliente.update({ where: { id }, data: { ativo } }),
};

export const repositorioRegioes: RepositorioCatalogo<Regiao, DadosRegiao> = {
  listar: () => prisma.regiao.findMany({ orderBy: { codigo: 'asc' } }),
  buscarPorId: (id) => prisma.regiao.findUnique({ where: { id } }),
  criar: (dados) => prisma.regiao.create({ data: dados }),
  atualizar: (id, dados) => prisma.regiao.update({ where: { id }, data: dados }),
  alterarAtivo: (id, ativo) => prisma.regiao.update({ where: { id }, data: { ativo } }),
};

export const repositorioFaixas: RepositorioCatalogo<FaixaUtilizacao, DadosFaixa> = {
  listar: () => prisma.faixaUtilizacao.findMany({ orderBy: { quantidadeInicial: 'asc' } }),
  buscarPorId: (id) => prisma.faixaUtilizacao.findUnique({ where: { id } }),
  criar: (dados) => prisma.faixaUtilizacao.create({ data: dados }),
  atualizar: (id, dados) => prisma.faixaUtilizacao.update({ where: { id }, data: dados }),
  alterarAtivo: (id, ativo) => prisma.faixaUtilizacao.update({ where: { id }, data: { ativo } }),
};

export const repositorioGrupos: RepositorioCatalogo<GrupoRegra, DadosGrupoRegra> = {
  listar: () => prisma.grupoRegra.findMany({ orderBy: { nome: 'asc' } }),
  buscarPorId: (id) => prisma.grupoRegra.findUnique({ where: { id } }),
  criar: (dados) => prisma.grupoRegra.create({ data: dados }),
  atualizar: (id, dados) => prisma.grupoRegra.update({ where: { id }, data: dados }),
  alterarAtivo: (id, ativo) => prisma.grupoRegra.update({ where: { id }, data: { ativo } }),
};
