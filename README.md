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

## Como rodar o projeto (passo a passo)

### 1) Pré-requisitos (versões mínimas)

- **Node.js**: 20.x ou superior (LTS recomendado)
- **npm**: 10.x ou superior
- **Docker Desktop**: 4.x ou superior (com Docker Engine ativo)
- **Supabase CLI**: 2.x ou superior
- **Android Studio + Emulador Android**: opcional (necessário para executar o app mobile no emulador)

> Dica: valide versões com `node -v`, `npm -v`, `docker --version` e `npx supabase@latest --version`.

### 2) Clonar o repositório e instalar dependências

Na raiz do projeto, rode:

```bash
git clone <url-do-repositorio>
cd projeto-pdhc
npm run setup
```

O comando `npm run setup` instala as dependências de `backend/` e `mobile/`.

### 3) Criar arquivos `.env` a partir dos exemplos

Crie os arquivos de ambiente com base nos exemplos:

- `backend/.env` a partir de `backend/.env.example`
- `mobile/.env` a partir de `mobile/.env.example`

Exemplo (Linux/macOS):

```bash
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

### 4) Obter chaves do Supabase local e preencher no `.env`

Com o Supabase local em execução, rode:

```bash
npm run supabase:status
```

Esse comando (equivalente a `supabase status`) mostra as credenciais locais, incluindo:

- `anon key` → use em `SUPABASE_ANON_KEY` (backend) e `EXPO_PUBLIC_SUPABASE_ANON_KEY` (mobile)
- `service_role key` → use em `SUPABASE_SERVICE_ROLE_KEY` (backend)
- `JWT secret` → use em `SUPABASE_JWT_SECRET` (backend)

Onde preencher:

- **backend/.env**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `DATABASE_URL`
- **mobile/.env**
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

> Para Android Emulator, prefira `10.0.2.2` em vez de `localhost` nas URLs do `mobile/.env`.

### 5) Subir a stack local (`npm run dev` ou `npm run dev:all`)

- `npm run dev`
  - Atalho para `npm run dev:android`
  - Sobe **Supabase local + backend + mobile**
  - Inicia o mobile no modo indicado para emulador (`dev:mobile:emulator`)

- `npm run dev:all`
  - Sobe **Supabase local + backend + mobile**
  - Inicia o mobile com `dev:mobile` (fluxo geral, útil para device físico/Expo)

### 6) Validar backend e Swagger

Com os serviços no ar, valide:

- API backend: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`

### 7) Validar Supabase local (API, Studio e portas de DB)

Com base em `supabase/config.toml`, valide os endpoints/portas principais:

- **Supabase API**: `http://127.0.0.1:54321` (`[api].port = 54321`)
- **Supabase Studio**: `http://127.0.0.1:54323` (`[studio].port = 54323`)
- **Postgres local**: `127.0.0.1:54322` (`[db].port = 54322`)
- **Shadow DB (migrations)**: `127.0.0.1:54320` (`[db].shadow_port = 54320`)

Você também pode confirmar tudo com `npm run supabase:status`.

### 8) Problemas comuns

- **Porta ocupada**
  - Sintoma: erro ao subir backend/Supabase/Expo.
  - Ação: encerre processo na porta em conflito ou ajuste a porta configurada.

- **Emulador sem acesso ao host**
  - Sintoma: app abre, mas não conecta backend/Supabase.
  - Ação: no Android Emulator, use `10.0.2.2` (não `localhost`) em `mobile/.env`.

- **Token/chaves inválidas**
  - Sintoma: 401/403 em rotas protegidas ou erro de autenticação.
  - Ação: recopie `anon key`, `service_role key` e `JWT secret` do `npm run supabase:status` para os arquivos `.env` corretos.

- **CORS bloqueando requisições**
  - Sintoma: erro de CORS ao chamar API.
  - Ação: confira `CORS_ORIGIN` no `backend/.env` e a origem real do app cliente.

- **URL da API incorreta no mobile**
  - Sintoma: timeout/Network Error no app.
  - Ação: valide `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_SUPABASE_URL` no `mobile/.env`.

### 9) Checklist final de validação

- [ ] backend responde em `http://localhost:3000/api`
- [ ] app mobile abre normalmente
- [ ] login funciona com Supabase local
- [ ] rota protegida responde com token válido

## Autor

Projeto desenvolvido como entrega técnica para processo seletivo, com foco em demonstrar domínio de backend, integração full stack, testes, documentação e organização de engenharia.
