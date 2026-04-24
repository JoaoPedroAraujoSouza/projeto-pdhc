# Architecture

## Visão geral
O HospAgenda será estruturado como um monorepo contendo:

- aplicação mobile em React Native
- API backend em NestJS
- autenticação e banco de dados via Supabase em ambiente local
- documentação técnica e funcional em uma pasta dedicada

A proposta é manter um ambiente simples, reproduzível e adequado ao prazo do MVP, sem abrir mão de boas práticas de organização.

## Objetivos arquiteturais
A arquitetura foi definida para atender aos seguintes objetivos:

- separar autenticação de regras de negócio
- manter o backend como núcleo do domínio da aplicação
- facilitar manutenção e evolução futura
- manter baixo acoplamento entre camadas
- favorecer testabilidade
- preservar simplicidade compatível com o prazo

## Estrutura do sistema
### Mobile
Responsável por:

- autenticação do usuário via Supabase Auth
- navegação entre telas
- formulários e fluxos de cadastro
- consumo da API NestJS
- exibição de dashboard e listagens

### Backend
Responsável por:

- validação do token de autenticação
- proteção de rotas
- regras de negócio do domínio
- validação dos dados recebidos
- operações de leitura e escrita no banco
- documentação da API

### Supabase
Responsável por:

- autenticação local do usuário
- persistência no banco PostgreSQL local

## Decisão sobre autenticação
A autenticação será feita pelo Supabase Auth. O aplicativo mobile realizará login e cadastro diretamente no Supabase, obtendo um token de acesso que será enviado ao backend nas requisições protegidas.

O backend NestJS não emitirá tokens próprios neste MVP. Ele será responsável por validar o token recebido e identificar o usuário autenticado.

### Motivação
Essa decisão reduz a complexidade inicial do projeto, acelera a implementação do fluxo de acesso e permite concentrar esforço no domínio hospitalar, sem perder demonstração de integração e segurança básica.

## Estrutura do monorepo
```text
projeto-pdhc/
  backend/
  mobile/
  docs/
  .github/
```

## Estrutura do backend
```text
backend/
  src/
    main.ts
    app.module.ts
    modules/
      auth/
      specialties/
      professionals/
      patients/
      appointments/
      dashboard/
    common/
      decorators/
      dto/
      enums/
      guards/
      filters/
      interceptors/
      utils/
```

## Estrutura do mobile
```text
mobile/
  app/
    _layout.tsx
    index.tsx
    auth/
    (protected)/
  src/
    components/
    services/
    hooks/
    types/
    utils/
    constants/
```

## Portas e endpoints locais
- backend NestJS: `http://127.0.0.1:3000`
- prefixo global de rotas do backend: `/api`
- Supabase API local: `http://127.0.0.1:54321`
- Postgres local (Supabase): `127.0.0.1:54322`

Exemplo completo de endpoint protegido no ambiente local: `http://127.0.0.1:3000/api/auth/me`.

## Módulos do backend
### Auth
Módulo responsável por:

- validar o token recebido do Supabase
- proteger rotas autenticadas
- disponibilizar dados do usuário autenticado para os demais módulos

### Specialties
Módulo responsável por cadastro e listagem de especialidades.

### Professionals
Módulo responsável por cadastro, edição, visualização e listagem de profissionais.

### Patients
Módulo responsável por cadastro, edição, visualização e listagem de pacientes.

### Appointments
Módulo principal do domínio. Responsável por:

- criação de consultas
- validação de conflito de horário
- confirmação
- remarcação
- cancelamento
- conclusão
- filtros de listagem

### Dashboard
Módulo responsável por consolidar dados do dia para exibição resumida no app.

## Entidades principais
### Specialty
Representa uma especialidade médica cadastrada no sistema.

### Professional
Representa um profissional de saúde vinculado a uma única especialidade.

### Patient
Representa um paciente atendido pelo sistema.

### Appointment
Representa um agendamento de consulta, incluindo vínculo com paciente, profissional, especialidade, horário e status.

## Modelo de agendamento
O sistema adotará uma abordagem simplificada para o tempo da consulta:

- a consulta possui apenas `startAt`
- a duração é implícita e fixa em 30 minutos
- o `endAt` é derivado por cálculo quando necessário

### Motivação
Essa decisão reduz complexidade em:

- modelagem de dados
- formulários
- validação de conflito
- testes

## Status de consulta
Os status do agendamento serão:

- `SCHEDULED`
- `CONFIRMED`
- `CANCELLED`
- `COMPLETED`

## Fluxo de autenticação
1. usuário realiza login ou cadastro no app
2. Supabase Auth autentica o usuário
3. o app recebe a sessão e o access token
4. o token é enviado no header Authorization para a API
5. o backend valida o token
6. a rota protegida executa normalmente

## Fluxo de criação de agendamento
1. usuário autenticado seleciona paciente
2. usuário seleciona profissional
3. sistema considera a especialidade vinculada ao profissional
4. usuário informa data/hora de início
5. backend valida se a data é futura
6. backend valida se não há conflito para o profissional
7. backend cria o agendamento com status inicial

## Princípios adotados
- controllers finos
- regras de negócio centralizadas em services
- validação de entrada com DTOs
- separação entre infraestrutura e domínio
- documentação próxima da implementação
- escopo controlado para preservar qualidade de entrega

## Trade-offs assumidos
- sem múltiplos perfis de usuário no MVP
- sem delete físico
- sem disponibilidade médica avançada
- sem tempo real
- sem múltiplas especialidades por profissional

Esses trade-offs são intencionais e visam maximizar a qualidade do núcleo do sistema dentro do prazo disponível.

## Nota de sincronização documental
Qualquer alteração de rota, script ou variável de ambiente deve ser acompanhada de atualização imediata da documentação (`README.md`, `docs/architecture.md`, `docs/api-contract.md` e demais docs impactados).
