FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma
COPY backend/prisma.config.ts ./prisma.config.ts
RUN npm ci

COPY backend .

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
