# Projeto PDHC

Aplicação mobile de agendamento hospitalar simplificado para uso administrativo, com backend em NestJS, autenticação via Supabase Cloud e fluxo completo de cadastros + consultas.

## Status atual do projeto

O MVP está implementado com:

- autenticação (sign in / sign up no app + validação de token no backend)
- CRUD essencial de especialidades, profissionais e pacientes
- criação e gestão de consultas (confirmar, remarcar, cancelar, concluir)
- dashboard diário com resumo operacional
- documentação funcional e técnica em `docs/`
- testes automatizados no backend

## Stack

- **Mobile:** React Native + Expo Router + TypeScript
- **Backend:** NestJS + Prisma + PostgreSQL
- **Auth/DB:** Supabase Cloud (Auth + Postgres)
- **Qualidade:** ESLint, Prettier, Jest, Swagger/OpenAPI

## Estrutura do monorepo

```text
projeto-pdhc/
  backend/      # API NestJS + Prisma + Swagger
  mobile/       # App Expo/React Native
  docs/         # documentação de produto, arquitetura, API e testes
  scripts/      # automações utilitárias (ex.: sync de env do mobile)
```

## Setup rápido (recomendado)

1. Copie o arquivo de ambiente da raiz:

```bash
cp .env.example .env
```

2. Instale dependências:

```bash
npm run setup
```

3. Suba backend + mobile (Android Emulator):

```bash
npm run dev
```

> `npm run dev` executa backend + mobile (porta 8082), com sync automático do `mobile/.env`.

## Variáveis de ambiente (fonte única)

A **fonte de verdade** é o arquivo `.env` na raiz. O script `npm run sync:mobile-env` gera `mobile/.env` contendo apenas variáveis `EXPO_PUBLIC_*`.

### Obrigatórias no `.env`

| Variável                        | Uso                                                 |
| ------------------------------- | --------------------------------------------------- |
| `SUPABASE_URL`                  | Backend (validação de token)                        |
| `SUPABASE_ANON_KEY`             | Backend e mobile                                    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Backend                                             |
| `SUPABASE_JWT_SECRET`           | Backend                                             |
| `DATABASE_URL`                  | Prisma / backend                                    |
| `EXPO_PUBLIC_SUPABASE_URL`      | Mobile                                              |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Mobile                                              |
| `EXPO_PUBLIC_API_URL`           | Mobile (sem `/api`, o app adiciona automaticamente) |

### Exemplo de `EXPO_PUBLIC_API_URL`

- Android Emulator: `http://10.0.2.2:3000`
- Dispositivo físico (mesma LAN): `http://192.168.x.x:3000`

## Endpoints principais do MVP

Todos sob prefixo global `/api`.

- `GET /api/auth/me`
- `POST/GET /api/specialties`
- `POST/GET /api/professionals`, `GET/PATCH /api/professionals/:id`
- `POST/GET /api/patients`, `GET/PATCH /api/patients/:id`
- `POST/GET /api/appointments`, `GET /api/appointments/:id`
- `PATCH /api/appointments/:id/{confirm|reschedule|cancel|complete}`
- `GET /api/dashboard/today`

Swagger local: `http://localhost:3000/docs`

## Scripts úteis (raiz)

- `npm run dev` → backend + mobile (emulador)
- `npm run dev:all` → backend + mobile (modo start padrão)
- `npm run dev:services` → apenas backend
- `npm run dev:backend` → apenas backend
- `npm run dev:mobile` → apenas mobile
- `npm run docker:up|docker:down|docker:logs`
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`


## Docker

O projeto inclui dockerização completa dos serviços de app:

- `docker compose up -d` sobe backend e mobile
- `docker compose down` encerra os containers
- `docker compose -f docker-compose.ci.yml up -d postgres` sobe somente o Postgres usado em testes e2e/CI

## Documentação detalhada

- visão de produto: `docs/product-overview.md`
- arquitetura: `docs/architecture.md`
- contrato da API: `docs/api-contract.md`
- estratégia de testes: `docs/testing-strategy.md`
- plano de entrega: `docs/delivery-plan.md`
- guia interno de execução: `docs/internal-execution-guide.md`

## Regra de manutenção da documentação

Qualquer mudança de rota, payload, script ou variável de ambiente deve atualizar no mesmo PR:

- `README.md`
- `docs/architecture.md`
- `docs/api-contract.md`
- README do módulo impactado (`backend/README.md` e/ou `mobile/README.md`)
