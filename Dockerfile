FROM node:22-alpine3.22 AS deps
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci

RUN npm run prisma:generate

FROM node:22-alpine3.22 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine3.22 AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
