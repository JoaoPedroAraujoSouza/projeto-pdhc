# Projeto PDHC

Aplicação mobile de agendamento hospitalar simplificado, voltada ao uso administrativo, com backend em NestJS, autenticação via Supabase local, cadastro de pacientes, profissionais e especialidades, além de criação e gerenciamento de consultas com regras de negócio, documentação e testes.

## Objetivo

Este projeto foi pensado para demonstrar:

- arquitetura backend organizada e escalável
- integração entre React Native, NestJS e Supabase
- modelagem de domínio aderente a um cenário hospitalar
- boas práticas de documentação, testes e gestão de projeto
- foco em fluxo administrativo realista, sem complexidade clínica desnecessária

## Escopo do MVP

### Incluído

- autenticação com Supabase Auth em ambiente local
- validação do token no backend NestJS
- cadastro e listagem de especialidades
- cadastro, edição, detalhe e listagem de profissionais
- cadastro, edição, detalhe e listagem de pacientes
- criação, listagem, detalhe e gerenciamento de agendamentos
- ações de confirmar, remarcar, cancelar e concluir consulta
- dashboard simples do dia
- filtros por data, status, profissional e especialidade
- documentação técnica
- testes estratégicos no backend
- organização via GitHub Projects, issues e sub-issues

### Fora do escopo

- portal do paciente
- múltiplos perfis de acesso
- prontuário clínico
- notificações
- tempo real
- integração com sistemas externos
- exclusão física de registros

## Público-alvo

Equipe administrativa hospitalar responsável por cadastrar pacientes, manter profissionais e organizar a agenda de atendimentos.

## Stack

### Mobile
- React Native
- Expo
- TypeScript

### Backend
- NestJS
- TypeScript
- PostgreSQL (via Supabase local)
- Swagger / OpenAPI
- Jest

### Infra e produtividade
- Docker
- Supabase CLI
- GitHub Projects
- GitHub Actions
- ESLint
- Prettier

## Setup local rápido

1. `cp .env.example .env`
2. `npm run setup`
3. `npm run supabase:start`
4. `npm run dev`

### Variáveis Supabase (referência do `supabase status`)

| Nome no `supabase status` | Nome no `.env` raiz | Serviço consumidor | Obrigatório? |
| --- | --- | --- | --- |
| API URL | `SUPABASE_URL` | backend e mobile | obrigatório |
| anon key | `SUPABASE_ANON_KEY` | backend e mobile | obrigatório |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` | backend | obrigatório |
| JWT secret | `SUPABASE_JWT_SECRET` | backend | obrigatório |
| DB URL | `DATABASE_URL` | backend | obrigatório |
| _(não vem do Supabase status)_ | `EXPO_PUBLIC_APP_ENV` | mobile | opcional |

> Observação: no mobile, use os equivalentes `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no `.env` de `mobile/` para apontar para o host correto (emulador/dispositivo físico).

## Arquitetura

```text
mobile (React Native + Expo)
        |
        | Bearer Token
        v
backend (NestJS + regras de negócio)
        |
        v
PostgreSQL + Auth (Supabase local)
```

### Decisões principais
- autenticação delegada ao Supabase para reduzir complexidade inicial
- backend NestJS focado em domínio, validação, regras e contratos de API
- duração fixa implícita de 30 minutos por consulta
- uma especialidade por profissional no MVP
- cancelamento por mudança de status, preservando histórico

## Entidades principais

### Specialty
- id
- name
- createdAt

### Professional
- id
- fullName
- specialtyId
- createdAt
- updatedAt

### Patient
- id
- fullName
- cpf
- birthDate
- phone
- createdAt
- updatedAt

### Appointment
- id
- patientId
- professionalId
- specialtyId
- startAt
- status
- notes
- createdAt
- updatedAt

### Status do agendamento
- SCHEDULED
- CONFIRMED
- CANCELLED
- COMPLETED

## Regras de negócio

- não permitir agendamento no passado
- não permitir conflito de horário para o mesmo profissional
- cada profissional pertence a uma única especialidade
- toda consulta deve estar associada a paciente e profissional válidos
- a especialidade do agendamento deve corresponder à do profissional
- cancelamento preserva histórico
- remarcação revalida conflito e data
- conclusão só pode ocorrer em consulta ativa
- toda consulta possui duração implícita de 30 minutos

## Estrutura do repositório

```text
hospagenda/
  backend/
  mobile/
  docs/
  .github/
```

## Estrutura esperada do backend

```text
backend/
  src/
    modules/
      auth/
      specialties/
      professionals/
      patients/
      appointments/
      dashboard/
    common/
```

## Estrutura esperada do mobile

```text
mobile/
  src/
    screens/
    components/
    services/
    hooks/
    navigation/
    types/
    utils/
    constants/
```

## Endpoints do MVP

### Auth
- `GET /auth/me`

### Specialties
- `POST /specialties`
- `GET /specialties`

### Professionals
- `POST /professionals`
- `GET /professionals`
- `GET /professionals/:id`
- `PATCH /professionals/:id`

### Patients
- `POST /patients`
- `GET /patients`
- `GET /patients/:id`
- `PATCH /patients/:id`

### Appointments
- `POST /appointments`
- `GET /appointments`
- `GET /appointments/:id`
- `PATCH /appointments/:id/confirm`
- `PATCH /appointments/:id/reschedule`
- `PATCH /appointments/:id/cancel`
- `PATCH /appointments/:id/complete`

### Dashboard
- `GET /dashboard/today`

## Fluxos principais

1. usuário administrativo autentica no app
2. app recebe token do Supabase
3. app envia token para API NestJS
4. backend valida o token e libera rotas protegidas
5. usuário cadastra paciente, profissional e especialidade
6. usuário cria e gerencia agendamentos
7. dashboard apresenta o resumo operacional do dia

## Estratégia de testes

### Unitários
- criação de consulta válida
- bloqueio de consulta no passado
- bloqueio de conflito de horário
- confirmação, cancelamento e conclusão de consulta
- remarcação com revalidação das regras

### Integração
- rota protegida com token válido
- criação de consulta autenticada
- erro em conflito de horário
- listagem com filtro por data

## Gestão do projeto

O projeto será organizado com:
- GitHub Projects
- parent issues por fase e área
- sub-issues por tarefa executável
- pipeline inicial com GitHub Actions para lint, build e testes

## Documentação planejada

- `docs/product-overview.md`
- `docs/architecture.md`
- `docs/api-contract.md`
- `docs/testing-strategy.md`
- `docs/delivery-plan.md`
- `docs/internal-execution-guide.md`

## Roadmap pós-MVP

- portal do paciente
- cancelamento pelo paciente
- múltiplos perfis de acesso
- disponibilidade médica avançada
- notificações
- integração com calendário
- dashboard mais analítico

## Como rodar localmente

### Pré-requisitos
- Node.js
- Docker
- Supabase CLI
- Expo CLI ou ambiente equivalente
- npm ou pnpm

### Etapas gerais
1. subir o Supabase local
2. configurar variáveis de ambiente do backend (colocar dentro da pasta config) e mobile
3. iniciar o backend NestJS
4. iniciar o app mobile
5. autenticar e validar o fluxo ponta a ponta

### Mapeamento de variáveis do Supabase

Para evitar ambiguidade entre os nomes exibidos pela Supabase CLI e os nomes usados no projeto, utilize o mapeamento abaixo:

| Origem (Supabase CLI) | Variável no projeto | Onde usar |
| --- | --- | --- |
| `anon key` / `ANON_KEY` | `SUPABASE_ANON_KEY` | backend |
| `anon key` / `ANON_KEY` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | mobile (Expo) |

> Observação: durante o desenvolvimento mobile, a API deve ser consumida pelo IP da máquina hospedeira, e não por `localhost`, quando o app estiver rodando em dispositivo físico.

### Scripts iniciais (raiz)

- `npm run setup`: instala dependências de backend e mobile
- `npm run dev` ou `npm run dev:all`: sobe Supabase local e roda backend + mobile juntos
- `npm run dev:android`: sobe Supabase local e roda backend + mobile no Android Emulator
- `npm run dev:services`: sobe Supabase local e roda apenas backend (ideal para Swagger)
- `npm run dev:backend`: inicia backend em modo watch
- `npm run dev:mobile`: inicia app mobile
- `npm run dev:mobile:emulator`: inicia app mobile direto no Android Emulator
- `npm run dev:mobile:android`: tenta abrir o app automaticamente no Android Emulator
- `npm run supabase:start`: sobe os containers do Supabase local
- `npm run supabase:status`: exibe status e credenciais locais do Supabase
- `npm run supabase:stop`: para os containers do Supabase local
- `npm run lint`: executa lint em backend e mobile
- `npm run format`: aplica Prettier em backend e mobile
- `npm run format:check`: valida formatação em backend e mobile
- `npm run typecheck`: valida TypeScript em backend e mobile
- `npm run test`: executa testes unitários do backend
- `npm run test:e2e`: executa testes e2e do backend

### Fluxo recomendado (Android Studio)

1. `npm run dev:services`
2. abrir Swagger no backend (`http://localhost:3000/docs`)
3. em outro terminal, `npm run dev:mobile:emulator`
4. com o emulador já aberto, pressione `a` no terminal do Expo (ou use `npm run dev:mobile:android`)

> No Android Emulator, o app usa `10.0.2.2` para acessar serviços do host (`backend` e `supabase`).

## Autor

Projeto desenvolvido como entrega técnica para processo seletivo, com foco em demonstrar domínio de backend, integração full stack, testes, documentação e organização de engenharia.
