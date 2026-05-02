FROM node:25.6.0-alpine AS client-builder

WORKDIR /build/client

COPY apps/client/package*.json ./
RUN npm ci && npm cache clean --force

COPY apps/client ./
RUN npm run build

FROM node:25.6.0-alpine AS server-builder

WORKDIR /build/server

COPY apps/server/package*.json ./
RUN npm ci && npm cache clean --force

COPY apps/server/prisma ./prisma
COPY apps/server/prisma.config.ts ./
COPY apps/server/nest-cli.json ./
COPY apps/server/tsconfig*.json ./
COPY apps/server/src ./src

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev && npm cache clean --force

FROM node:25.6.0-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DATASTREAM_FRONTEND_ROOT=/app/public

COPY apps/server/package*.json ./
COPY apps/server/prisma ./prisma
COPY apps/server/prisma.config.ts ./
COPY --from=server-builder /build/server/dist ./dist
COPY --from=server-builder /build/server/node_modules ./node_modules
COPY --from=client-builder /build/client/dist ./public

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
