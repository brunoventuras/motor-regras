-- Dados iniciais do enunciado.
-- Executado a cada inicialização, mas só insere quando o banco está vazio,
-- para nunca sobrescrever ou duplicar o que o usuário já alterou.

DO $$
BEGIN
IF EXISTS (SELECT 1 FROM usuario) THEN
  RAISE NOTICE 'Banco já possui dados; carga inicial ignorada.';
  RETURN;
END IF;

-- Usuários de demonstração (senhas: admin123 e consulta123)
INSERT INTO usuario (id, login, senha_hash, nome, autorizado, atualizado_em) VALUES
  (1, 'admin',    '$2b$10$./esy9dq2/6GUAWJF262beyhCfLyZA7kwDkJLJfn96a8CeWVLCh6q', 'Administrador', true,  now()),
  (2, 'consulta', '$2b$10$cBS/QXBb3UhruqqJrVq8fucnrJCMfRC9X7QP1nd5NTT9djAh3vtZm', 'Consulta',      false, now());

INSERT INTO servico (id, codigo, nome, valor_base, atualizado_em) VALUES
  (1, '1', 'Suporte Técnico', 100.00, now()),
  (2, '2', 'Consultoria',     200.00, now()),
  (3, '3', 'Desenvolvimento', 300.00, now());

INSERT INTO categoria_cliente (id, codigo, nome, atualizado_em) VALUES
  (1, '1', 'Público',     now()),
  (2, '2', 'Privado',     now()),
  (3, '3', 'Estratégico', now());

INSERT INTO regiao (id, codigo, nome, fator_preco, atualizado_em) VALUES
  (1, '1', 'Local',    1.00, now()),
  (2, '2', 'Regional', 1.10, now()),
  (3, '3', 'Nacional', 1.25, now());

INSERT INTO faixa_utilizacao (id, quantidade_inicial, quantidade_final, acrescimo, atualizado_em) VALUES
  (1, 1,   10,   0.00,  now()),
  (2, 11,  50,   5.00,  now()),
  (3, 51,  100,  10.00, now()),
  (4, 101, NULL, 20.00, now());

-- Regras 1, 2 e 3 do enunciado, exatamente como descritas.
INSERT INTO regra (id, codigo, nome, prioridade, tipo_acao, valor_acao, grupo_id, criado_por_id, atualizado_por_id, vigencia_inicio, criado_em, atualizado_em) VALUES
  (1, 'R001', 'Desconto para cliente Estratégico acima de 50 unidades', 10, 'desconto_percentual',  5.00,  NULL, 1, 1, '2026-01-01 00:00:00-03', '2026-01-01 00:00:00-03', now()),
  (2, 'R002', 'Acréscimo para Desenvolvimento em âmbito Nacional',      20, 'acrescimo_percentual', 15.00, NULL, 1, 1, '2026-01-01 00:00:00-03', '2026-01-01 00:00:00-03', now()),
  (3, 'R003', 'Acréscimo para quantidade entre 51 e 100',                30, 'acrescimo_percentual', 10.00, NULL, 1, 1, '2026-01-01 00:00:00-03', '2026-01-01 00:00:00-03', now());

INSERT INTO condicao (id, regra_id, campo, operador, valor, atualizado_em) VALUES
  (1, 1, 'categoria_cliente', 'igual', '3',         now()),
  (2, 1, 'quantidade',        'maior', '50',        now()),
  (3, 2, 'regiao',            'igual', '3',         now()),
  (4, 2, 'servico',           'igual', '3',         now()),
  (5, 3, 'quantidade',        'entre', '[51, 100]', now());

-- Ajusta as sequências para que novos cadastros continuem a partir dos ids já usados.
PERFORM setval(pg_get_serial_sequence('usuario', 'id'),           GREATEST((SELECT MAX(id) FROM usuario), 1));
PERFORM setval(pg_get_serial_sequence('servico', 'id'),           GREATEST((SELECT MAX(id) FROM servico), 1));
PERFORM setval(pg_get_serial_sequence('categoria_cliente', 'id'), GREATEST((SELECT MAX(id) FROM categoria_cliente), 1));
PERFORM setval(pg_get_serial_sequence('regiao', 'id'),            GREATEST((SELECT MAX(id) FROM regiao), 1));
PERFORM setval(pg_get_serial_sequence('faixa_utilizacao', 'id'),  GREATEST((SELECT MAX(id) FROM faixa_utilizacao), 1));
PERFORM setval(pg_get_serial_sequence('regra', 'id'),             GREATEST((SELECT MAX(id) FROM regra), 1));
PERFORM setval(pg_get_serial_sequence('condicao', 'id'),          GREATEST((SELECT MAX(id) FROM condicao), 1));

END $$;
