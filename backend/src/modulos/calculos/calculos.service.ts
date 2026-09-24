import { Decimal } from 'decimal.js';
import { erroNaoEncontrado, erroRequisicaoInvalida } from '../../compartilhado/erros.ts';
import { prisma } from '../../compartilhado/prisma.ts';
import { calcular } from '../../motor/motor-calculo.ts';
import type { CondicaoMotor, FaixaMotor, RegraMotor } from '../../motor/tipos.ts';
import { descreverFaixa } from '../catalogos/faixas.regras.ts';
import type { DadosCalculo } from './calculos.schemas.ts';
import { carregarNomesCatalogos, descreverCondicoes } from './rotulos-memoria.ts';

const LIMITE_HISTORICO = 200;

const RELACOES_MEMORIA = {
  usuario: { select: { id: true, nome: true } },
  regrasAvaliadas: { orderBy: { ordemAvaliacao: 'asc' as const } },
};

const paraDecimal = (valor: { toString(): string }) => new Decimal(valor.toString());

/** Busca um item de catálogo ativo; cálculos novos não aceitam cadastros desativados. */
async function exigirAtivo<T extends { ativo: boolean }>(
  busca: Promise<T | null>,
  descricao: string,
) {
  const registro = await busca;
  if (!registro || !registro.ativo) {
    throw erroRequisicaoInvalida(`${descricao} inexistente ou desativado(a).`);
  }
  return registro;
}

/** Carrega as regras ativas no formato do motor; a vigência é verificada pelo próprio motor. */
async function carregarRegras(): Promise<RegraMotor[]> {
  const regras = await prisma.regra.findMany({
    where: { ativo: true },
    include: { grupo: { select: { id: true, nome: true } }, condicoes: true },
  });

  return regras.map((regra) => ({
    ...regra,
    valorAcao: regra.valorAcao ? paraDecimal(regra.valorAcao) : null,
    condicoes: regra.condicoes.map((condicao): CondicaoMotor => ({
      campo: condicao.campo,
      operador: condicao.operador,
      valor: condicao.valor as CondicaoMotor['valor'],
    })),
  }));
}

/** Carrega as faixas ativas no formato do motor. */
async function carregarFaixas(): Promise<FaixaMotor[]> {
  const faixas = await prisma.faixaUtilizacao.findMany({ where: { ativo: true } });
  return faixas.map((faixa) => ({ ...faixa, acrescimo: paraDecimal(faixa.acrescimo) }));
}

/**
 * Executa o cálculo: carrega os dados do banco, entrega ao motor e grava a memória completa.
 * A memória guarda cópias de preços, regras e condições, e por isso não muda se os cadastros mudarem.
 */
export async function executarCalculo(dados: DadosCalculo, usuarioId: number) {
  const [servico, categoriaCliente, regiao] = await Promise.all([
    exigirAtivo(prisma.servico.findUnique({ where: { id: dados.servicoId } }), 'Serviço'),
    exigirAtivo(
      prisma.categoriaCliente.findUnique({ where: { id: dados.categoriaClienteId } }),
      'Categoria de cliente',
    ),
    exigirAtivo(prisma.regiao.findUnique({ where: { id: dados.regiaoId } }), 'Região'),
  ]);
  const [regras, faixas, nomes] = await Promise.all([
    carregarRegras(),
    carregarFaixas(),
    carregarNomesCatalogos(),
  ]);

  const resultado = calcular({
    servico: { ...servico, valorBase: paraDecimal(servico.valorBase) },
    categoriaCliente,
    regiao: { ...regiao, fatorPreco: paraDecimal(regiao.fatorPreco) },
    quantidade: dados.quantidade,
    momento: new Date(),
    regras,
    faixas,
  });

  const faixa = resultado.faixa;
  const calculo = await prisma.calculoExecutado.create({
    data: {
      usuarioId,
      servicoId: servico.id,
      servicoNome: servico.nome,
      valorBase: servico.valorBase,
      categoriaClienteId: categoriaCliente.id,
      categoriaNome: categoriaCliente.nome,
      regiaoId: regiao.id,
      regiaoNome: regiao.nome,
      fatorPreco: regiao.fatorPreco,
      quantidade: dados.quantidade,
      faixaDescricao: faixa
        ? `${descreverFaixa(faixa.quantidadeInicial, faixa.quantidadeFinal)} (+${faixa.acrescimo}%)`
        : null,
      valorUnitarioInicial: resultado.valorUnitarioInicial.toFixed(2),
      valorUnitarioFinal: resultado.valorUnitarioFinal.toFixed(2),
      valorTotal: resultado.valorTotal.toFixed(2),
      regrasAvaliadas: {
        create: resultado.regrasAvaliadas.map((regra) => ({
          ...regra,
          valorAcao: regra.valorAcao?.toFixed(2) ?? null,
          condicoes: descreverCondicoes(regra.condicoes, nomes),
          valorAntes: regra.valorAntes.toFixed(2),
          valorDepois: regra.valorDepois.toFixed(2),
          delta: regra.delta.toFixed(2),
        })),
      },
    },
    include: RELACOES_MEMORIA,
  });

  return calculo;
}

/** Histórico resumido, do mais recente para o mais antigo. */
export function listarCalculos() {
  return prisma.calculoExecutado.findMany({
    include: { usuario: { select: { id: true, nome: true } } },
    orderBy: { executadoEm: 'desc' },
    take: LIMITE_HISTORICO,
  });
}

/** Memória completa de um cálculo já executado. */
export async function obterCalculo(id: number) {
  const calculo = await prisma.calculoExecutado.findUnique({
    where: { id },
    include: RELACOES_MEMORIA,
  });
  if (!calculo) throw erroNaoEncontrado('Cálculo não encontrado.');
  return calculo;
}
