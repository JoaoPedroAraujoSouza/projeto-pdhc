FROM node:20-alpine

ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
ENV DATABASE_URL=${DATABASE_URL}

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./prisma.config.ts
RUN npm ci

COPY backend .

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
