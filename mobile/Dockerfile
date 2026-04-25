FROM node:20-alpine

WORKDIR /app

COPY mobile/package*.json ./
RUN npm ci

COPY mobile .

EXPOSE 8082 19000 19001 19002

CMD ["npm", "run", "start"]
