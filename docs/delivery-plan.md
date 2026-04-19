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
- subir Supabase local
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
- Supabase local

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
