# Etapa 1: compila o front (React) em arquivos estáticos
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Na versão publicada na internet, a tela de login não exibe a senha do admin
ARG VITE_OCULTAR_ADMIN=false
RUN npm run build

# Etapa 2: gera o cliente do banco e compila a API
FROM node:22-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY database/ /app/database/
COPY backend/ ./
RUN npm run db:generate && npm run build

# Etapa 3: imagem final, apenas com o necessário para executar
FROM node:22-alpine
ENV NODE_ENV=production \
    PORTA=3000 \
    DIRETORIO_FRONTEND=/app/frontend \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    PRISMA_HIDE_UPDATE_MESSAGE=1
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY backend/prisma.config.ts ./
COPY database/ /app/database/
COPY --from=backend /app/backend/dist ./dist
COPY --from=frontend /app/frontend/dist /app/frontend
USER node
EXPOSE 3000
# Aplica as migrations, carrega os dados iniciais (só em banco vazio) e sobe a aplicação
CMD ["sh", "-c", "npm run db:deploy && npm run db:seed && exec node dist/server.js"]
