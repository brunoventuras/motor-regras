import express from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { ambiente } from './config/ambiente.ts';
import { erroNaoEncontrado } from './compartilhado/erros.ts';
import { tratarErros } from './compartilhado/middlewares/tratar-erros.ts';
import { rotasAutenticacao } from './modulos/autenticacao/autenticacao.routes.ts';
import { rotasCalculos } from './modulos/calculos/calculos.routes.ts';
import { rotasCatalogos } from './modulos/catalogos/catalogos.routes.ts';
import { rotasRegras } from './modulos/regras/regras.routes.ts';
import { rotasVocabulario } from './modulos/vocabulario/vocabulario.routes.ts';

/** Serve o front já compilado e devolve o index.html para as rotas da aplicação (SPA). */
function servirFrontend(app: express.Express, diretorio: string) {
  const caminho = path.resolve(diretorio);
  if (!existsSync(caminho)) return;

  app.use(express.static(caminho));
  app.get('/{*rota}', (_requisicao, resposta) => {
    resposta.sendFile(path.join(caminho, 'index.html'));
  });
}

/**
 * Monta a aplicação: segurança, rotas da API, front e tratamento de erros, nesta ordem.
 * A aplicação é servida em HTTP na VM de avaliação; por isso o helmet não força HTTPS.
 */
export function criarApp() {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: { directives: { upgradeInsecureRequests: null } },
      strictTransportSecurity: false,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const api = express.Router();
  api.use('/autenticacao', rotasAutenticacao);
  api.use('/vocabulario', rotasVocabulario);
  api.use('/regras', rotasRegras);
  api.use('/calculos', rotasCalculos);
  api.use(rotasCatalogos);
  api.use(() => {
    throw erroNaoEncontrado('Endereço não encontrado.');
  });
  app.use('/api', api);

  if (ambiente.DIRETORIO_FRONTEND) servirFrontend(app, ambiente.DIRETORIO_FRONTEND);

  app.use(tratarErros);
  return app;
}
