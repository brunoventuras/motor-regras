import { z } from 'zod';

const esquemaAmbiente = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL não informada'),
  JWT_SEGREDO: z.string().min(8, 'JWT_SEGREDO deve ter ao menos 8 caracteres'),
  JWT_EXPIRACAO: z.string().default('8h'),
  PORTA: z.coerce.number().int().positive().default(3000),
  DIRETORIO_FRONTEND: z.string().optional(),
});

/** Variáveis de ambiente validadas na inicialização; a aplicação não sobe com configuração inválida. */
export const ambiente = esquemaAmbiente.parse(process.env);
