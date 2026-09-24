import { Decimal } from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { calcular } from './motor-calculo.ts';
import type { EntradaCalculo, FaixaMotor, RegraMotor } from './tipos.ts';

const SERVICOS = {
  suporte: { id: 1, nome: 'Suporte Técnico', valorBase: new Decimal(100) },
  consultoria: { id: 2, nome: 'Consultoria', valorBase: new Decimal(200) },
  desenvolvimento: { id: 3, nome: 'Desenvolvimento', valorBase: new Decimal(300) },
};

const CATEGORIAS = {
  publico: { id: 1, nome: 'Público' },
  privado: { id: 2, nome: 'Privado' },
  estrategico: { id: 3, nome: 'Estratégico' },
};

const REGIOES = {
  local: { id: 1, nome: 'Local', fatorPreco: new Decimal('1.00') },
  regional: { id: 2, nome: 'Regional', fatorPreco: new Decimal('1.10') },
  nacional: { id: 3, nome: 'Nacional', fatorPreco: new Decimal('1.25') },
};

const FAIXAS: FaixaMotor[] = [
  { id: 1, quantidadeInicial: 1, quantidadeFinal: 10, acrescimo: new Decimal(0) },
  { id: 2, quantidadeInicial: 11, quantidadeFinal: 50, acrescimo: new Decimal(5) },
  { id: 3, quantidadeInicial: 51, quantidadeFinal: 100, acrescimo: new Decimal(10) },
  { id: 4, quantidadeInicial: 101, quantidadeFinal: null, acrescimo: new Decimal(20) },
];

const GRUPO_QUANTIDADE = { id: 1, nome: 'acrescimo_por_quantidade' };
const CRIACAO = new Date('2026-01-01T00:00:00Z');
const MOMENTO = new Date('2026-09-24T12:00:00Z');

function criarRegra(
  dados: Partial<RegraMotor> & Pick<RegraMotor, 'id' | 'codigo' | 'tipoAcao'>,
): RegraMotor {
  return {
    nome: dados.codigo,
    prioridade: 100,
    ativo: true,
    vigenciaInicio: CRIACAO,
    vigenciaFim: null,
    criadoEm: CRIACAO,
    grupo: null,
    valorAcao: null,
    condicoes: [],
    ...dados,
  };
}

function regrasDoEnunciado(): RegraMotor[] {
  return [
    criarRegra({
      id: 1,
      codigo: 'R001',
      prioridade: 10,
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(5),
      condicoes: [
        { campo: 'categoria_cliente', operador: 'igual', valor: CATEGORIAS.estrategico.id },
        { campo: 'quantidade', operador: 'maior', valor: 50 },
      ],
    }),
    criarRegra({
      id: 2,
      codigo: 'R002',
      prioridade: 20,
      tipoAcao: 'acrescimo_percentual',
      valorAcao: new Decimal(15),
      condicoes: [
        { campo: 'regiao', operador: 'igual', valor: REGIOES.nacional.id },
        { campo: 'servico', operador: 'igual', valor: SERVICOS.desenvolvimento.id },
      ],
    }),
    criarRegra({
      id: 3,
      codigo: 'R003',
      prioridade: 30,
      grupo: GRUPO_QUANTIDADE,
      tipoAcao: 'acrescimo_percentual',
      valorAcao: new Decimal(10),
      condicoes: [{ campo: 'quantidade', operador: 'entre', valor: [51, 100] }],
    }),
    criarRegra({
      id: 4,
      codigo: 'R004',
      prioridade: 40,
      grupo: GRUPO_QUANTIDADE,
      tipoAcao: 'acrescimo_faixa',
    }),
  ];
}

function montarEntrada(dados: Partial<EntradaCalculo> = {}): EntradaCalculo {
  return {
    servico: SERVICOS.consultoria,
    categoriaCliente: CATEGORIAS.estrategico,
    regiao: REGIOES.local,
    quantidade: 60,
    momento: MOMENTO,
    regras: regrasDoEnunciado(),
    faixas: FAIXAS,
    ...dados,
  };
}

function resumir(entrada: EntradaCalculo) {
  const resultado = calcular(entrada);
  return {
    inicial: resultado.valorUnitarioInicial.toFixed(2),
    final: resultado.valorUnitarioFinal.toFixed(2),
    total: resultado.valorTotal.toFixed(2),
    trilha: resultado.regrasAvaliadas.map((regra) => `${regra.regraCodigo}:${regra.resultado}`),
  };
}

describe('exemplos do enunciado', () => {
  it('reproduz a memória de cálculo do PDF: 200,00 -> 190,00 -> 209,00', () => {
    const resultado = calcular(montarEntrada());

    expect(resultado.valorUnitarioInicial.toFixed(2)).toBe('200.00');
    expect(resultado.valorUnitarioFinal.toFixed(2)).toBe('209.00');
    expect(resultado.valorTotal.toFixed(2)).toBe('12540.00');

    const [r001, r002, r003, r004] = resultado.regrasAvaliadas;
    expect(r001.resultado).toBe('aplicada');
    expect(r001.valorDepois.toFixed(2)).toBe('190.00');
    expect(r002.resultado).toBe('condicao_nao_atendida');
    expect(r003.resultado).toBe('aplicada');
    expect(r003.valorAntes.toFixed(2)).toBe('190.00');
    expect(r003.valorDepois.toFixed(2)).toBe('209.00');
    expect(r004.resultado).toBe('superada_no_grupo');
  });

  it('aplica o fator da região e a faixa quando a Regra 3 não se aplica', () => {
    const resumo = resumir(
      montarEntrada({
        servico: SERVICOS.desenvolvimento,
        categoriaCliente: CATEGORIAS.privado,
        regiao: REGIOES.nacional,
        quantidade: 30,
      }),
    );

    expect(resumo).toEqual({
      inicial: '375.00',
      final: '452.81',
      total: '13584.30',
      trilha: [
        'R001:condicao_nao_atendida',
        'R002:aplicada',
        'R003:condicao_nao_atendida',
        'R004:aplicada',
      ],
    });
  });

  it('usa a faixa de 101 ou mais sem limite superior', () => {
    const resumo = resumir(montarEntrada({ quantidade: 120 }));

    expect(resumo.final).toBe('228.00');
    expect(resumo.total).toBe('27360.00');
  });

  it('reflete a alteração do desconto de 5% para 7% sem mudança de código', () => {
    const regras = regrasDoEnunciado();
    regras[0].valorAcao = new Decimal(7);

    expect(resumir(montarEntrada({ regras })).final).toBe('204.60');
  });
});

describe('grupo exclusivo', () => {
  it('passa a aplicar a faixa quando a Regra 3 é desativada', () => {
    const regras = regrasDoEnunciado();
    regras[2].ativo = false;

    const resumo = resumir(montarEntrada({ regras }));

    expect(resumo.final).toBe('209.00');
    expect(resumo.trilha).toEqual(['R001:aplicada', 'R002:condicao_nao_atendida', 'R004:aplicada']);
  });

  it('troca a regra vencedora quando as prioridades são invertidas', () => {
    const regras = regrasDoEnunciado();
    regras[2].prioridade = 40;
    regras[3].prioridade = 30;

    const resumo = resumir(montarEntrada({ regras }));

    expect(resumo.final).toBe('209.00');
    expect(resumo.trilha).toContain('R004:aplicada');
    expect(resumo.trilha).toContain('R003:superada_no_grupo');
  });

  it('acumula regras sem grupo mesmo quando tratam do mesmo assunto', () => {
    const regras = regrasDoEnunciado().map((regra) => ({ ...regra, grupo: null }));

    expect(resumir(montarEntrada({ regras })).final).toBe('229.90');
  });
});

describe('prioridade', () => {
  const descontoFixo = (prioridade: number) =>
    criarRegra({
      id: 10,
      codigo: 'FIXO',
      prioridade,
      tipoAcao: 'desconto_valor',
      valorAcao: new Decimal(20),
    });
  const descontoPercentual = (prioridade: number) =>
    criarRegra({
      id: 11,
      codigo: 'PERC',
      prioridade,
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(10),
    });

  it('muda o resultado quando há ação de valor fixo', () => {
    const fixoPrimeiro = resumir(
      montarEntrada({ regras: [descontoFixo(1), descontoPercentual(2)] }),
    );
    const percentualPrimeiro = resumir(
      montarEntrada({ regras: [descontoFixo(2), descontoPercentual(1)] }),
    );

    expect(fixoPrimeiro.final).toBe('162.00');
    expect(percentualPrimeiro.final).toBe('160.00');
  });

  it('desempata pela data de criação e depois pelo id', () => {
    const antiga = criarRegra({
      id: 9,
      codigo: 'ANTIGA',
      prioridade: 5,
      tipoAcao: 'acrescimo_valor',
      valorAcao: new Decimal(1),
    });
    const nova = criarRegra({
      id: 2,
      codigo: 'NOVA',
      prioridade: 5,
      criadoEm: new Date('2026-06-01T00:00:00Z'),
      tipoAcao: 'acrescimo_valor',
      valorAcao: new Decimal(1),
    });
    const mesmaDataMenorId = criarRegra({
      id: 1,
      codigo: 'MENOR_ID',
      prioridade: 5,
      tipoAcao: 'acrescimo_valor',
      valorAcao: new Decimal(1),
    });

    const resumo = resumir(montarEntrada({ regras: [nova, antiga, mesmaDataMenorId] }));

    expect(resumo.trilha.map((item) => item.split(':')[0])).toEqual(['MENOR_ID', 'ANTIGA', 'NOVA']);
  });
});

describe('elegibilidade e limites', () => {
  it('ignora regras fora da vigência', () => {
    const futura = criarRegra({
      id: 20,
      codigo: 'FUTURA',
      vigenciaInicio: new Date('2027-01-01T00:00:00Z'),
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(50),
    });
    const encerrada = criarRegra({
      id: 21,
      codigo: 'ENCERRADA',
      vigenciaFim: new Date('2026-06-30T00:00:00Z'),
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(50),
    });

    const resumo = resumir(montarEntrada({ regras: [futura, encerrada] }));

    expect(resumo.final).toBe('200.00');
    expect(resumo.trilha).toEqual([]);
  });

  it('aplica regra sem condições a todos os cálculos', () => {
    const geral = criarRegra({
      id: 30,
      codigo: 'GERAL',
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(10),
    });

    expect(resumir(montarEntrada({ regras: [geral], quantidade: 1 })).final).toBe('180.00');
  });

  it('nunca deixa o valor abaixo de zero', () => {
    const excessivo = criarRegra({
      id: 40,
      codigo: 'EXCESSO',
      tipoAcao: 'desconto_valor',
      valorAcao: new Decimal(500),
    });

    const resumo = resumir(montarEntrada({ regras: [excessivo] }));

    expect(resumo.final).toBe('0.00');
    expect(resumo.total).toBe('0.00');
  });

  it('registra sem_faixa quando a quantidade não pertence a nenhuma faixa', () => {
    const faixasComLacuna = FAIXAS.filter((faixa) => faixa.id !== 2);

    const resumo = resumir(montarEntrada({ quantidade: 30, faixas: faixasComLacuna }));

    expect(resumo.final).toBe('200.00');
    expect(resumo.trilha).toContain('R004:sem_faixa');
  });
});

describe('condições', () => {
  it('interpreta o operador "em" como qualquer um da lista', () => {
    const publicoOuPrivado = criarRegra({
      id: 50,
      codigo: 'EM',
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(4),
      condicoes: [{ campo: 'categoria_cliente', operador: 'em', valor: [1, 2] }],
    });

    const privado = resumir(
      montarEntrada({ regras: [publicoOuPrivado], categoriaCliente: CATEGORIAS.privado }),
    );
    const estrategico = resumir(montarEntrada({ regras: [publicoOuPrivado] }));

    expect(privado.final).toBe('192.00');
    expect(estrategico.final).toBe('200.00');
  });

  it('registra o valor do pedido e o resultado de cada condição', () => {
    const [r001] = calcular(montarEntrada({ quantidade: 40 })).regrasAvaliadas;

    expect(r001.condicoes).toEqual([
      { campo: 'categoria_cliente', operador: 'igual', valor: 3, valorContexto: 3, atendida: true },
      { campo: 'quantidade', operador: 'maior', valor: 50, valorContexto: 40, atendida: false },
    ]);
  });

  it('avalia a faixa de utilização como critério', () => {
    const faixaAlta = criarRegra({
      id: 60,
      codigo: 'FAIXA_ALTA',
      tipoAcao: 'desconto_percentual',
      valorAcao: new Decimal(10),
      condicoes: [{ campo: 'faixa_utilizacao', operador: 'igual', valor: 4 }],
    });

    expect(resumir(montarEntrada({ regras: [faixaAlta], quantidade: 150 })).final).toBe('180.00');
    expect(resumir(montarEntrada({ regras: [faixaAlta], quantidade: 60 })).final).toBe('200.00');
  });
});
