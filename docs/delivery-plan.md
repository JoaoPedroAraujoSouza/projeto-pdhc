# Delivery Plan

## Objetivo

Organizar a execução do MVP do HospAgenda de forma pragmática, reduzindo riscos e garantindo foco nas entregas que mais contribuem para a qualidade final do projeto.

## Estratégia geral

A entrega será conduzida em fases curtas e orientadas a risco. O fluxo técnico prioriza:

1. definição e organização do projeto
2. setup do ambiente local
3. prova de autenticação funcionando
4. implementação do núcleo de domínio no backend
5. implementação das telas essenciais do mobile
6. testes e refinamento final

## Fase 1 — Estrutura inicial e documentação

### Objetivos

- criar o repositório
- definir estrutura do monorepo
- criar os documentos base
- configurar GitHub Projects
- abrir issues e sub-issues
- preparar GitHub Actions inicial

### Entregas esperadas

- repositório criado
- pasta `docs/` preenchida com base inicial
- Project configurado
- backlog inicial estruturado
- workflows básicos de CI criados

## Fase 2 — Setup técnico e autenticação

### Objetivos

- configurar credenciais do Supabase Cloud
- configurar backend NestJS
- configurar app React Native
- conectar autenticação do app ao Supabase
- validar token no backend
- expor rota protegida mínima

### Entregas esperadas

- ambiente local funcional
- fluxo de login/cadastro funcionando
- rota `/auth/me` funcionando com proteção

## Fase 3 — Cadastros base no backend

### Objetivos

- implementar especialidades
- implementar profissionais
- implementar pacientes
- documentar endpoints no Swagger

### Entregas esperadas

- endpoints funcionando
- validações básicas implementadas
- documentação inicial da API disponível

## Fase 4 — Agendamentos no backend

### Objetivos

- implementar criação de consulta
- implementar listagem com filtros
- implementar confirmação
- implementar remarcação
- implementar cancelamento
- implementar conclusão
- validar conflito de horário
- validar data passada

### Entregas esperadas

- núcleo do domínio funcionando
- regras principais implementadas
- endpoints documentados

## Fase 5 — Dashboard e integração mobile

### Objetivos

- implementar endpoint de dashboard do dia
- criar telas principais do app
- conectar formulários e listagens com a API
- permitir execução dos fluxos administrativos principais

### Entregas esperadas

- dashboard funcional
- app autenticado consumindo a API
- criação e gestão de agendamentos via interface mobile

## Fase 6 — Testes e refinamento

### Objetivos

- criar testes unitários do domínio de agendamento
- criar testes de integração prioritários
- revisar documentação
- melhorar README final
- capturar evidências visuais do projeto

### Entregas esperadas

- suíte mínima de testes concluída
- documentação revisada
- projeto preparado para submissão

## Sugestão de distribuição por dias

### Dia 1

- repositório
- docs base
- GitHub Projects
- setup inicial backend/mobile
- Supabase Cloud

### Dia 2

- autenticação fim a fim
- especialidades
- profissionais
- pacientes

### Dia 3

- agendamentos
- conflito de horário
- regras de status

### Dia 4

- dashboard
- integração mobile base
- listagens principais

### Dia 5

- formulários e ações de agendamento
- testes de backend
- ajustes de UX

### Dia 6

- CI
- revisão final
- README final
- screenshots e preparação de entrega

## Critérios de prioridade

### Prioridade máxima

- autenticação
- criação de consulta
- conflito de horário
- mudança de status
- documentação
- testes centrais

### Prioridade média

- dashboard
- filtros completos
- refinamento visual

### Prioridade baixa

- polimento adicional de interface
- melhorias não essenciais

## Critérios de corte

Se o prazo apertar, reduzir nesta ordem:

1. refinamentos visuais mais avançados
2. dashboard mais elaborado
3. filtros adicionais menos essenciais
4. detalhes extras de formulários

Não reduzir:

- autenticação
- regra de conflito de horário
- fluxo principal de agendamento
- documentação base
- testes principais

## Resultado esperado ao final

Ao final da execução, o projeto deve apresentar:

- arquitetura coerente
- fluxo autenticado funcional
- domínio de agendamento implementado
- app mobile operacional
- documentação clara
- evidência de testes
- organização profissional do processo de desenvolvimento

## Demo em 10 minutos

Esta seção descreve um roteiro direto para demonstração funcional do MVP.

### 1) Comandos exatos para subir o ambiente

No diretório raiz do projeto:

```bash
cp .env.example .env
npm run setup
npm run dev:backend
```

Em outro terminal (na raiz), subir o app:

```bash
npm run dev:mobile
```

Referências úteis durante a demo:

- Swagger: `http://localhost:3000/docs`
- API base: `http://localhost:3000/api`

### 2) Criação de usuário no app (sign-up) e login

1. Abrir o app e acessar a tela de cadastro (`Sign up`).
2. Informar e-mail válido e senha.
3. Concluir cadastro e, em seguida, acessar a tela de login (`Sign in`).
4. Autenticar com o mesmo e-mail/senha.

**Resultado esperado**

- Login concluído com sucesso.
- Usuário redirecionado para área protegida (dashboard/listas).
- Requisições autenticadas passam a funcionar sem erro `401`.

### 3) Sequência mínima de uso (fluxo obrigatório)

Executar nesta ordem para evitar dependências quebradas:

1. **Cadastrar especialidade**
   - Exemplo: `Cardiologia`.
   - **Resultado esperado:** item aparece na listagem de especialidades.

2. **Cadastrar profissional**
   - Exemplo: `Dra. Ana Lima`, vinculada à especialidade criada.
   - **Resultado esperado:** profissional aparece na listagem com especialidade associada.

3. **Cadastrar paciente**
   - Exemplo: nome, CPF, data de nascimento e telefone válidos.
   - **Resultado esperado:** paciente aparece na listagem de pacientes.

4. **Criar consulta**
   - Selecionar paciente + profissional.
   - Definir `startAt` no futuro.
   - **Resultado esperado:** consulta criada com status inicial `SCHEDULED`.

5. **Executar ação de status (escolher ao menos uma)**
   - Confirmar: `CONFIRMED`
   - Remarcar: atualiza data/hora e mantém consulta ativa
   - Cancelar: `CANCELLED`
   - Concluir: `COMPLETED`
   - **Resultado esperado:** status final da consulta refletido corretamente no detalhe/listagem.

### 4) Verificação de API no Swagger para cada fluxo

No Swagger (`/docs`), clicar em **Authorize** e informar:
`Bearer <access_token>`.

Validar os endpoints abaixo em paralelo à navegação no app:

1. **Especialidade**
   - `POST /api/specialties`
   - `GET /api/specialties`

2. **Profissional**
   - `POST /api/professionals`
   - `GET /api/professionals`

3. **Paciente**
   - `POST /api/patients`
   - `GET /api/patients`

4. **Consulta**
   - `POST /api/appointments`
   - `GET /api/appointments`
   - `GET /api/appointments/{id}`

5. **Ações de status**
   - `PATCH /api/appointments/{id}/confirm`
   - `PATCH /api/appointments/{id}/reschedule`
   - `PATCH /api/appointments/{id}/cancel`
   - `PATCH /api/appointments/{id}/complete`

### 5) Resultado esperado por etapa (checklist para avaliação)

- **Ambiente iniciado:** backend responde e Swagger abre em `http://localhost:3000/docs`.
- **Usuário autenticado:** login no app funcionando e rotas protegidas acessíveis.
- **Especialidade criada:** retorno `201` no POST e item visível no GET.
- **Profissional criado:** retorno `201` no POST e vínculo com especialidade válido.
- **Paciente criado:** retorno `201` no POST e item disponível em listagem.
- **Consulta criada:** retorno `201` e `status = SCHEDULED`.
- **Ação de status aplicada:** retorno `200` no PATCH e status atualizado conforme ação.
- **Validação de regras (opcional):**
  - tentativa de consulta no passado retorna `400`;
  - tentativa de conflito de horário retorna `409`.
