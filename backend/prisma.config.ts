import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '../.env', quiet: true });

/**
 * A URL do banco é opcional aqui porque a geração do cliente ocorre no build da imagem,
 * sem banco disponível. Migrations e carga inicial rodam com DATABASE_URL definida.
 */
export default defineConfig({
  schema: '../database/schema.prisma',
  migrations: {
    path: '../database/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
