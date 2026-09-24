import { criarApp } from './app.ts';
import { prisma } from './compartilhado/prisma.ts';
import { ambiente } from './config/ambiente.ts';

const servidor = criarApp().listen(ambiente.PORTA, () => {
  console.log(`Aplicação disponível em http://localhost:${ambiente.PORTA}`);
});

/** Encerra conexões de forma ordenada quando o container é parado. */
function encerrar() {
  servidor.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', encerrar);
process.on('SIGINT', encerrar);
