import { PrismaPg } from '@prisma/adapter-pg';
import { ambiente } from '../config/ambiente.ts';
import { PrismaClient } from '../generated/prisma/client.ts';

/** Conexão única com o banco, compartilhada por todos os módulos. */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: ambiente.DATABASE_URL }),
});
