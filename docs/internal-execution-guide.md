# Internal Execution Guide

## Finalidade do documento
Este documento serve como guia pessoal de execução do projeto. Ele organiza as decisões já tomadas, a ordem de implementação, a estrutura do GitHub Projects, o backlog inicial e os critérios de corte para manter o projeto viável dentro do prazo.

## Decisões já fechadas
### Domínio
- projeto hospitalar
- foco em agendamento hospitalar simplificado
- ator principal: atendente ou administrativo hospitalar

### Autenticação
- Supabase Auth
- ambiente local
- backend apenas valida token e protege rotas

### Backend
- NestJS com TypeScript
- API orientada ao domínio
- documentação com Swagger/OpenAPI

### Mobile
- React Native
- fluxo focado nas telas essenciais

### Modelagem
- uma especialidade por profissional
- sem delete físico
- consulta com `startAt`
- duração fixa implícita de 30 minutos

## Estratégia de execução
### Princípios
- congelar escopo cedo
- evitar features com baixo retorno técnico
- fechar contrato da API antes de aprofundar o mobile
- priorizar regras centrais do backend
- manter rastreabilidade com issues e project

### Ordem macro
1. criar base do projeto
2. estruturar documentação
3. configurar GitHub Projects
4. configurar ambiente técnico local
5. autenticação fim a fim
6. módulos base do backend
7. módulo de agendamento
8. integração mobile
9. testes e refinamento

## Estrutura do GitHub Projects
### Nome sugerido do project
`HospAgenda MVP`

### Campos sugeridos
#### Status
- Todo
- In Progress
- In Review
- Done

#### Area
- Backend
- Mobile
- Docs
- DevOps
- Testing

#### Priority
- P0
- P1
- P2

#### Effort
- XS
- S
- M
- L

#### Type
- Feature
- Bug
- Chore
- Docs
- Test

#### Phase
- Setup
- Backend
- Mobile
- QA
- Finalização

### Views sugeridas
- Backlog
- Board
- Sprint Atual

## Parent issues sugeridas
1. Setup inicial do projeto
2. Documentação base do MVP
3. Configuração de autenticação com Supabase Cloud
4. Backend — especialidades
5. Backend — profissionais
6. Backend — pacientes
7. Backend — agendamentos
8. Backend — dashboard
9. Mobile — autenticação
10. Mobile — cadastros base
11. Mobile — agendamentos
12. Testes, CI e finalização

## Sub-issues sugeridas por parent issue
### 1. Setup inicial do projeto
- criar monorepo
- configurar backend NestJS
- configurar app React Native
- configurar lint e format
- criar `.env.example`
- definir scripts principais

### 2. Documentação base do MVP
- escrever README inicial
- escrever `product-overview.md`
- escrever `architecture.md`
- escrever `api-contract.md`
- escrever `testing-strategy.md`
- escrever `delivery-plan.md`
- escrever `internal-execution-guide.md`

### 3. Configuração de autenticação com Supabase Cloud
- configurar credenciais do Supabase Cloud
- configurar variáveis de ambiente
- implementar login e cadastro no mobile
- validar token no Nest
- criar rota `/auth/me`
- testar fluxo autenticado fim a fim

### 4. Backend — especialidades
- modelar especialidade
- criar endpoint de cadastro
- criar endpoint de listagem
- validar nome obrigatório
- documentar no Swagger

### 5. Backend — profissionais
- modelar profissional
- criar cadastro
- criar listagem
- criar detalhe
- criar edição
- validar especialidade existente
- documentar endpoints

### 6. Backend — pacientes
- modelar paciente
- criar cadastro
- criar listagem
- criar detalhe
- criar edição
- validar campos obrigatórios
- documentar endpoints

### 7. Backend — agendamentos
- modelar agendamento
- criar endpoint de criação
- criar listagem com filtros
- criar detalhe
- implementar confirmação
- implementar remarcação
- implementar cancelamento
- implementar conclusão
- validar data passada
- validar conflito de horário
- documentar endpoints

### 8. Backend — dashboard
- definir métricas do dia
- implementar endpoint `/dashboard/today`
- documentar endpoint

### 9. Mobile — autenticação
- criar tela de login
- criar tela de cadastro
- persistir sessão
- proteger navegação autenticada

### 10. Mobile — cadastros base
- criar listagem de pacientes
- criar formulário de paciente
- criar listagem de profissionais
- criar formulário de profissional
- criar listagem e cadastro de especialidades

### 11. Mobile — agendamentos
- criar listagem de agendamentos
- criar filtros
- criar formulário de agendamento
- criar detalhe da consulta
- implementar ações de confirmar, remarcar, cancelar e concluir
- exibir dashboard

### 12. Testes, CI e finalização
- testes unitários de agendamento
- testes de integração principais
- configurar workflow de backend
- configurar workflow de mobile
- revisar documentação
- capturar screenshots
- preparar entrega final

## Checklist de abertura do projeto
- criar repositório
- criar estrutura `backend/`, `mobile/`, `docs/`, `.github/`
- subir documentação base
- criar GitHub Project
- criar parent issues
- criar sub-issues
- associar items ao project
- definir prioridades e fases
- criar workflows mínimos

## Riscos principais
### Risco 1 — setup local consumir tempo demais
Mitigação:
- subir primeiro a infraestrutura mínima
- validar autenticação antes de aprofundar qualquer outro módulo

### Risco 2 — mobile atrasar integração
Mitigação:
- definir contrato da API cedo
- concluir backend principal primeiro
- limitar telas ao essencial

### Risco 3 — escopo crescer ao longo da semana
Mitigação:
- manter este documento como referência
- registrar novas ideias como roadmap, não como escopo do MVP

## Critérios de corte
Se o tempo apertar, reduzir nesta ordem:

1. refinamentos visuais avançados
2. dashboard mais rico
3. filtros extras
4. detalhes secundários de formulário

Nunca cortar:

- autenticação
- fluxo principal de agendamento
- regra de conflito de horário
- mudança de status
- documentação base
- testes centrais

## Critério de qualidade pessoal
Antes de considerar o projeto pronto, validar:

- consigo explicar toda a arquitetura com clareza
- consigo explicar as decisões de escopo e trade-offs
- consigo justificar por que usei Supabase Auth com NestJS
- consigo demonstrar o fluxo completo no mobile
- consigo apontar os testes mais importantes
- consigo apresentar o board e as issues como evidência de organização
