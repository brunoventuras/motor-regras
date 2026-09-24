import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

process.loadEnvFile('../.env');
const { criarApp } = await import('./app.ts');
const { prisma } = await import('./compartilhado/prisma.ts');

const app = criarApp();
const PEDIDO_ENUNCIADO = { servicoId: 2, categoriaClienteId: 3, regiaoId: 1, quantidade: 60 };

let tokenAdmin: string;
let tokenConsulta: string;

async function entrar(login: string, senha: string) {
  const resposta = await request(app).post('/api/autenticacao/login').send({ login, senha });
  return resposta.body.token as string;
}

/** Dados da R001 no formato aceito pela API, para alterar e depois restaurar o valor original. */
async function dadosR001(valorAcao: number) {
  const regra = await prisma.regra.findUniqueOrThrow({
    where: { codigo: 'R001' },
    include: { condicoes: true },
  });
  return {
    id: regra.id,
    corpo: {
      codigo: regra.codigo,
      nome: regra.nome,
      prioridade: regra.prioridade,
      vigenciaInicio: regra.vigenciaInicio,
      vigenciaFim: regra.vigenciaFim,
      tipoAcao: regra.tipoAcao,
      valorAcao,
      grupoId: regra.grupoId,
      condicoes: regra.condicoes.map(({ campo, operador, valor }) => ({ campo, operador, valor })),
    },
  };
}

beforeAll(async () => {
  tokenAdmin = await entrar('admin', 'admin123');
  tokenConsulta = await entrar('consulta', 'consulta123');
});

afterAll(async () => {
  const { id, corpo } = await dadosR001(5);
  await request(app)
    .put(`/api/regras/${id}`)
    .set('Authorization', `Bearer ${tokenAdmin}`)
    .send(corpo);
  await prisma.$disconnect();
});

describe('segurança', () => {
  it('recusa requisições sem token', async () => {
    await request(app).get('/api/regras').expect(401);
  });

  it('impede usuário sem autorização de alterar regras', async () => {
    const { id, corpo } = await dadosR001(7);
    await request(app)
      .put(`/api/regras/${id}`)
      .set('Authorization', `Bearer ${tokenConsulta}`)
      .send(corpo)
      .expect(403);
  });
});

describe('alteração de regra sem mudança de código', () => {
  it('aplica 7% nos novos cálculos e mantém 5% na memória dos anteriores', async () => {
    const antes = await request(app)
      .post('/api/calculos')
      .set('Authorization', `Bearer ${tokenConsulta}`)
      .send(PEDIDO_ENUNCIADO)
      .expect(201);
    expect(Number(antes.body.valorUnitarioFinal)).toBe(209);

    const { id, corpo } = await dadosR001(7);
    await request(app)
      .put(`/api/regras/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(corpo)
      .expect(200);

    const depois = await request(app)
      .post('/api/calculos')
      .set('Authorization', `Bearer ${tokenConsulta}`)
      .send(PEDIDO_ENUNCIADO)
      .expect(201);
    expect(Number(depois.body.valorUnitarioFinal)).toBe(204.6);

    const historico = await request(app)
      .get(`/api/calculos/${antes.body.id}`)
      .set('Authorization', `Bearer ${tokenConsulta}`)
      .expect(200);
    const r001 = historico.body.regrasAvaliadas.find(
      (regra: { regraCodigo: string }) => regra.regraCodigo === 'R001',
    );
    expect(Number(r001.valorAcao)).toBe(5);
    expect(Number(historico.body.valorUnitarioFinal)).toBe(209);
  });
});

describe('validações', () => {
  it('recusa faixa sobreposta a outra ativa', async () => {
    const resposta = await request(app)
      .post('/api/faixas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ quantidadeInicial: 90, quantidadeFinal: 150, acrescimo: 15 })
      .expect(409);
    expect(resposta.body.mensagem).toContain('51 a 100');
  });

  it('recusa operador incompatível com o campo', async () => {
    await request(app)
      .post('/api/regras')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        codigo: 'INVALIDA',
        nome: 'Inválida',
        prioridade: 1,
        tipoAcao: 'desconto_percentual',
        valorAcao: 5,
        condicoes: [{ campo: 'categoria_cliente', operador: 'maior', valor: 2 }],
      })
      .expect(400);
  });
});
