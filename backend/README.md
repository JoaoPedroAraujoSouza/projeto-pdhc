# Backend PDHC (NestJS)

API do projeto PDHC responsável por autenticação (validação de token), regras de negócio e persistência dos módulos de especialidades, profissionais, pacientes, consultas e dashboard.

## Pré-requisitos

- Node.js LTS
- npm
- Supabase local ativo (`npx supabase start`)

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
- `npm run prisma:migrate:status`
- `npm run prisma:migrate:dev`
- `npm run prisma:studio`

## Fluxo recomendado

1. `npm run supabase:start`
2. `npm run dev:backend`
3. acessar `http://localhost:3000/docs`

## Troubleshooting rápido

### 401 em rota protegida

- confirmar envio de `Authorization: Bearer <token>`
- validar `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_JWT_SECRET`

### erro de banco (Prisma)

- confirmar Supabase ativo
- validar `DATABASE_URL` com porta `54322`
- rodar `npm --prefix backend run prisma:migrate:status`
