import { Router } from 'express';
import { criarRotasCatalogo } from './catalogo.routes.ts';
import { criarServiceCatalogo } from './catalogo.service.ts';
import {
  repositorioCategorias,
  repositorioFaixas,
  repositorioGrupos,
  repositorioRegioes,
  repositorioServicos,
} from './catalogos.repositories.ts';
import {
  esquemaCategoriaCliente,
  esquemaFaixa,
  esquemaGrupoRegra,
  esquemaRegiao,
  esquemaServico,
} from './catalogos.schemas.ts';
import { verificarSobreposicaoFaixa } from './faixas.regras.ts';

const servicos = criarServiceCatalogo(repositorioServicos, {
  mensagemNaoEncontrado: 'Serviço não encontrado.',
});

const categorias = criarServiceCatalogo(repositorioCategorias, {
  mensagemNaoEncontrado: 'Categoria de cliente não encontrada.',
});

const regioes = criarServiceCatalogo(repositorioRegioes, {
  mensagemNaoEncontrado: 'Região não encontrada.',
});

const faixas = criarServiceCatalogo(repositorioFaixas, {
  mensagemNaoEncontrado: 'Faixa de utilização não encontrada.',
  antesDeSalvar: async (dados, idAtual) => {
    const atual = idAtual ? await repositorioFaixas.buscarPorId(idAtual) : null;
    if (!atual || atual.ativo) {
      await verificarSobreposicaoFaixa(dados.quantidadeInicial, dados.quantidadeFinal, idAtual);
    }
  },
  antesDeAtivar: (faixa) =>
    verificarSobreposicaoFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal, faixa.id),
});

const grupos = criarServiceCatalogo(repositorioGrupos, {
  mensagemNaoEncontrado: 'Grupo de regras não encontrado.',
});

/** Registra os cinco catálogos, cada um com o seu endereço e o seu esquema de validação. */
export const rotasCatalogos = Router();

rotasCatalogos.use('/servicos', criarRotasCatalogo(servicos, esquemaServico));
rotasCatalogos.use('/categorias-cliente', criarRotasCatalogo(categorias, esquemaCategoriaCliente));
rotasCatalogos.use('/regioes', criarRotasCatalogo(regioes, esquemaRegiao));
rotasCatalogos.use('/faixas', criarRotasCatalogo(faixas, esquemaFaixa));
rotasCatalogos.use('/grupos-regra', criarRotasCatalogo(grupos, esquemaGrupoRegra));
