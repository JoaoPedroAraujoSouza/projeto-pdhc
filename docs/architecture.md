# Architecture

## Visão geral

O projeto está organizado em monorepo com três blocos principais:

- app mobile em React Native (Expo Router)
- API backend em NestJS
- autenticação + banco local via Supabase

A integração segue o fluxo **mobile → backend → banco/auth**, com o token de acesso emitido pelo Supabase e validado no backend.

## Objetivos arquiteturais

- manter o backend como núcleo das regras de negócio
- separar autenticação da lógica de domínio
- preservar baixo acoplamento entre camadas
- facilitar manutenção e evolução do MVP
- manter setup local reproduzível e simples

## Estrutura real do monorepo

```text
projeto-pdhc/
  backend/
  mobile/
  docs/
  scripts/
```

## Estrutura real do backend

```text
backend/
  prisma/
  src/
    main.ts
    app.module.ts
    health/
    lib/
      prisma/
    modules/
      auth/
      specialties/
      professionals/
      patients/
      appointments/
      dashboard/
  test/
```

### Responsabilidades do backend

- validação do token Supabase (`SupabaseAuthGuard`)
- exposição de API REST em `/api`
- validação de entrada com DTOs + `ValidationPipe`
- aplicação de regras de negócio (conflito de horário, status, datas)
- persistência com Prisma/PostgreSQL
- documentação automática com Swagger em `/docs`

## Estrutura real do mobile

```text
mobile/
  app/
    _layout.tsx
    index.tsx
    auth/
    (protected)/
  src/
    components/
    hooks/
    lib/
    providers/
    schemas/
    services/
    styles/
    types/
```

### Responsabilidades do mobile

- autenticação do usuário no Supabase
- gerenciamento de sessão em contexto (`AuthProvider`)
- consumo da API do backend com `axios`
- fluxo administrativo de cadastros e consultas
- navegação protegida por rotas autenticadas

## Contratos e portas locais

- Backend: `http://127.0.0.1:3000`
- Prefixo global de API: `/api`
- Swagger: `http://127.0.0.1:3000/docs`
- Supabase API local: `http://127.0.0.1:54321`
- Postgres local (Supabase): `127.0.0.1:54322`

## Modelo de autenticação

1. app realiza sign in / sign up no Supabase
2. Supabase devolve `access_token`
3. app envia `Authorization: Bearer <token>` para a API
4. backend valida o token e injeta o usuário autenticado na request
5. módulos de domínio executam rotas protegidas

## Modelo de agendamento

- cada consulta possui `startAt`
- duração é implícita (30 minutos)
- `specialtyId` do agendamento é derivado do profissional
- status possíveis: `SCHEDULED`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

## Regras centrais de domínio

- não criar/remarcar consulta no passado
- não permitir conflito de horário por profissional
- profissional deve ter especialidade válida
- paciente/profissional devem existir para criar consulta
- cancelamento preserva histórico (sem delete físico)
- conclusão só para consultas ativas

## Observação de sincronização documental

Mudanças em rotas, payloads, variáveis de ambiente ou scripts devem atualizar em conjunto:

- `README.md`
- `docs/api-contract.md`
- `backend/README.md` e/ou `mobile/README.md`
