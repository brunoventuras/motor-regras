-- CreateEnum
CREATE TYPE "campo_condicao" AS ENUM ('servico', 'categoria_cliente', 'regiao', 'quantidade', 'faixa_utilizacao');

-- CreateEnum
CREATE TYPE "operador_condicao" AS ENUM ('igual', 'diferente', 'em', 'maior', 'maior_igual', 'menor', 'menor_igual', 'entre');

-- CreateEnum
CREATE TYPE "tipo_acao" AS ENUM ('desconto_percentual', 'acrescimo_percentual', 'desconto_valor', 'acrescimo_valor', 'acrescimo_faixa');

-- CreateEnum
CREATE TYPE "resultado_avaliacao" AS ENUM ('aplicada', 'condicao_nao_atendida', 'superada_no_grupo', 'sem_faixa');

-- CreateTable
CREATE TABLE "servico" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "valor_base" DECIMAL(12,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria_cliente" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "categoria_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regiao" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "fator_preco" DECIMAL(6,4) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "regiao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faixa_utilizacao" (
    "id" SERIAL NOT NULL,
    "quantidade_inicial" INTEGER NOT NULL,
    "quantidade_final" INTEGER,
    "acrescimo" DECIMAL(5,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "faixa_utilizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupo_regra" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "descricao" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "grupo_regra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(60) NOT NULL,
    "senha_hash" VARCHAR(100) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "autorizado" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regra" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "prioridade" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "vigencia_inicio" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigencia_fim" TIMESTAMPTZ(3),
    "tipo_acao" "tipo_acao" NOT NULL,
    "valor_acao" DECIMAL(12,2),
    "grupo_id" INTEGER,
    "criado_por_id" INTEGER NOT NULL,
    "atualizado_por_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "regra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "condicao" (
    "id" SERIAL NOT NULL,
    "regra_id" INTEGER NOT NULL,
    "campo" "campo_condicao" NOT NULL,
    "operador" "operador_condicao" NOT NULL,
    "valor" JSONB NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "condicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculo_executado" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "servico_id" INTEGER NOT NULL,
    "servico_nome" VARCHAR(100) NOT NULL,
    "valor_base" DECIMAL(12,2) NOT NULL,
    "categoria_cliente_id" INTEGER NOT NULL,
    "categoria_nome" VARCHAR(100) NOT NULL,
    "regiao_id" INTEGER NOT NULL,
    "regiao_nome" VARCHAR(100) NOT NULL,
    "fator_preco" DECIMAL(6,4) NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor_unitario_inicial" DECIMAL(12,2) NOT NULL,
    "valor_unitario_final" DECIMAL(12,2) NOT NULL,
    "valor_total" DECIMAL(14,2) NOT NULL,
    "executado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculo_executado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regra_avaliada" (
    "id" SERIAL NOT NULL,
    "calculo_executado_id" INTEGER NOT NULL,
    "regra_id" INTEGER NOT NULL,
    "ordem_avaliacao" INTEGER NOT NULL,
    "regra_codigo" VARCHAR(20) NOT NULL,
    "regra_nome" VARCHAR(100) NOT NULL,
    "prioridade" INTEGER NOT NULL,
    "grupo_nome" VARCHAR(60),
    "tipo_acao" "tipo_acao" NOT NULL,
    "valor_acao" DECIMAL(12,2),
    "condicoes" JSONB NOT NULL,
    "resultado" "resultado_avaliacao" NOT NULL,
    "valor_antes" DECIMAL(12,2) NOT NULL,
    "valor_depois" DECIMAL(12,2) NOT NULL,
    "delta" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "regra_avaliada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "servico_codigo_key" ON "servico"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "servico_nome_key" ON "servico"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_cliente_codigo_key" ON "categoria_cliente"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_cliente_nome_key" ON "categoria_cliente"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "regiao_codigo_key" ON "regiao"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "regiao_nome_key" ON "regiao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "grupo_regra_nome_key" ON "grupo_regra"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_login_key" ON "usuario"("login");

-- CreateIndex
CREATE UNIQUE INDEX "regra_codigo_key" ON "regra"("codigo");

-- CreateIndex
CREATE INDEX "regra_ativo_prioridade_idx" ON "regra"("ativo", "prioridade");

-- CreateIndex
CREATE INDEX "condicao_regra_id_idx" ON "condicao"("regra_id");

-- CreateIndex
CREATE INDEX "calculo_executado_executado_em_idx" ON "calculo_executado"("executado_em");

-- CreateIndex
CREATE INDEX "regra_avaliada_calculo_executado_id_idx" ON "regra_avaliada"("calculo_executado_id");

-- AddForeignKey
ALTER TABLE "regra" ADD CONSTRAINT "regra_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupo_regra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regra" ADD CONSTRAINT "regra_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regra" ADD CONSTRAINT "regra_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "condicao" ADD CONSTRAINT "condicao_regra_id_fkey" FOREIGN KEY ("regra_id") REFERENCES "regra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_executado" ADD CONSTRAINT "calculo_executado_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_executado" ADD CONSTRAINT "calculo_executado_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_executado" ADD CONSTRAINT "calculo_executado_categoria_cliente_id_fkey" FOREIGN KEY ("categoria_cliente_id") REFERENCES "categoria_cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_executado" ADD CONSTRAINT "calculo_executado_regiao_id_fkey" FOREIGN KEY ("regiao_id") REFERENCES "regiao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regra_avaliada" ADD CONSTRAINT "regra_avaliada_calculo_executado_id_fkey" FOREIGN KEY ("calculo_executado_id") REFERENCES "calculo_executado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regra_avaliada" ADD CONSTRAINT "regra_avaliada_regra_id_fkey" FOREIGN KEY ("regra_id") REFERENCES "regra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Regras de integridade que o schema Prisma não expressa

ALTER TABLE "servico"
  ADD CONSTRAINT "servico_valor_base_positivo" CHECK ("valor_base" > 0);

ALTER TABLE "regiao"
  ADD CONSTRAINT "regiao_fator_preco_positivo" CHECK ("fator_preco" > 0);

ALTER TABLE "faixa_utilizacao"
  ADD CONSTRAINT "faixa_quantidade_inicial_minima" CHECK ("quantidade_inicial" >= 1),
  ADD CONSTRAINT "faixa_intervalo_valido" CHECK ("quantidade_final" IS NULL OR "quantidade_final" >= "quantidade_inicial"),
  ADD CONSTRAINT "faixa_acrescimo_nao_negativo" CHECK ("acrescimo" >= 0),
  ADD CONSTRAINT "faixa_sem_sobreposicao" EXCLUDE USING gist (
    int4range("quantidade_inicial", "quantidade_final", '[]') WITH &&
  ) WHERE ("ativo");

ALTER TABLE "regra"
  ADD CONSTRAINT "regra_valor_acao_coerente" CHECK (
    ("tipo_acao" = 'acrescimo_faixa' AND "valor_acao" IS NULL)
    OR ("tipo_acao" <> 'acrescimo_faixa' AND "valor_acao" > 0)
  ),
  ADD CONSTRAINT "regra_desconto_percentual_maximo" CHECK (
    "tipo_acao" <> 'desconto_percentual' OR "valor_acao" <= 100
  ),
  ADD CONSTRAINT "regra_vigencia_valida" CHECK (
    "vigencia_fim" IS NULL OR "vigencia_fim" > "vigencia_inicio"
  );

ALTER TABLE "calculo_executado"
  ADD CONSTRAINT "calculo_quantidade_minima" CHECK ("quantidade" >= 1);
