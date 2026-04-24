# Backend PDHC (NestJS)

API do projeto PDHC responsável por autenticação (validação de token), regras de negócio e persistência dos módulos de especialidades, profissionais, pacientes, consultas e dashboard.

## Pré-requisitos

- Node.js LTS
- npm
- Acesso ao projeto Supabase Cloud (Auth + Postgres)

## Configuração de ambiente

A configuração é centralizada no `.env` da **raiz do monorepo**.

1. Na raiz do projeto:

```bash
cp .env.example .env
```

2. Preencha as variáveis usadas pelo backend:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `DATABASE_URL`
- `DATABASE_DIRECT_URL` (recomendado para `prisma db push`/migrations)

## Endereços locais

- API base: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`

## Comandos principais

No diretório raiz:

- `npm run dev:backend` — sobe backend em watch
- `npm run build:backend` — build de produção
- `npm run test:backend` — testes backend (Jest)
- `npm run test:e2e` — testes e2e

No diretório `backend/` (se preferir execução direta):

- `npm run start:dev`
- `npm run build`
- `npm run test`
- `npm run test:e2e`
- `npm run prisma:db:push`
- `npm run prisma:migrate:status`
- `npm run prisma:migrate:dev`
- `npm run prisma:studio`

## Fluxo recomendado

1. Configure `.env` com credenciais do Supabase Cloud
2. `npm run dev:backend`
3. acessar `http://localhost:3000/docs`

## Troubleshooting rápido

### 401 em rota protegida

- confirmar envio de `Authorization: Bearer <token>`
- validar `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_JWT_SECRET`

### erro de banco (Prisma)

- validar conectividade com o banco do Supabase Cloud
- em Docker/Windows, prefira `DATABASE_URL` com pooler (`:6543`) para evitar erro de rede IPv6
- use `DATABASE_DIRECT_URL` (porta `5432`) para `prisma db push` e migrations
- rodar `npm --prefix backend run prisma:migrate:status`
