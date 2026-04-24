# Backend PDHC (NestJS)

Backend da aplicação **PDHC** (plataforma de agendamento hospitalar simplificado) responsável por:

- expor a API HTTP consumida pelo mobile;
- validar autenticação baseada em Supabase;
- aplicar regras de negócio de pacientes, profissionais, especialidades, consultas e dashboard;
- persistir dados no PostgreSQL do Supabase local.

## Objetivo no contexto do PDHC

No MVP do PDHC, o backend concentra as responsabilidades de domínio e segurança. Ele recebe requisições autenticadas do app, valida dados de entrada, aplica regras de agendamento (como conflitos de horário) e mantém consistência dos dados hospitalares administrativos.

## Pré-requisitos

Antes de iniciar o backend localmente, garanta que você tem:

- **Node.js** (recomendado: versão LTS atual);
- **npm** (instalado junto com Node.js);
- **Supabase local ativo** (Auth + Postgres), com as portas padrão disponíveis.

> Sem o Supabase local em execução, o backend não conseguirá validar token nem conectar ao banco.

## Configuração de ambiente

1. No diretório `backend/`, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Preencha as variáveis obrigatórias:

- `NODE_ENV`: ambiente de execução (`development`, `test`, `production`).
- `PORT`: porta HTTP do NestJS (local padrão: `3000`).
- `CORS_ORIGIN`: origem permitida para acesso ao backend (ex.: app web/mobile em dev).

- `SUPABASE_URL`: URL do Supabase local (padrão: `http://127.0.0.1:54321`).
- `SUPABASE_ANON_KEY`: chave pública (publishable/anon) usada em fluxos de autenticação.
- `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço com privilégios elevados (uso apenas no backend).
- `SUPABASE_JWT_SECRET`: segredo JWT usado para validação de tokens emitidos localmente.

- `DATABASE_URL`: string de conexão PostgreSQL usada pelo Prisma (padrão local: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`).

Referência: `backend/.env.example`.

## Endereços locais

Com o backend em execução:

- **API base:** `http://localhost:3000/api`
- **Swagger (OpenAPI):** `http://localhost:3000/docs`

## Comandos principais

No diretório `backend/`:

### Execução e build

- `npm run start:dev`  
  Inicia o servidor em modo desenvolvimento com watch. Use no dia a dia.

- `npm run build`  
  Gera build de produção em `dist/`. Use para validar compilação antes de deploy/CI.

### Testes

- `npm run test`  
  Executa testes unitários/integrados (Jest). Use durante desenvolvimento de regras e serviços.

- `npm run test:e2e`  
  Executa testes end-to-end (contratos HTTP e fluxos principais). Use antes de abrir PR ou validar regressão.

### Prisma

- `npm run prisma:generate`  
  Regenera o client Prisma após alteração de schema.

- `npm run prisma:validate`  
  Valida o `schema.prisma` sem aplicar mudanças.

- `npm run prisma:migrate:status`  
  Mostra status das migrações entre código e banco atual.

- `npm run prisma:migrate:dev`  
  Cria/aplica migrações em ambiente local de desenvolvimento.

- `npm run prisma:migrate:deploy`  
  Aplica migrações já versionadas (uso típico em staging/prod/CI).

- `npm run prisma:studio`  
  Abre interface visual para inspeção de dados local.

## Ordem recomendada para desenvolvimento local

1. **Subir o Supabase local** (Auth e Postgres disponíveis).
2. **Instalar dependências do backend** (`npm install`, se necessário).
3. **Configurar `.env`** a partir de `.env.example`.
4. **Aplicar/verificar migrações** (`npm run prisma:migrate:dev` ou ao menos `npm run prisma:migrate:status`).
5. **Iniciar o Nest** (`npm run start:dev`).
6. (Opcional) Abrir Swagger para validar rotas.

## Troubleshooting rápido

### Erro de conexão com `DATABASE_URL`

Sintomas comuns:
- falha no bootstrap do Nest;
- erro do Prisma ao conectar (`P1001`, timeout, refused).

Checklist:
- confirme se o Supabase local está ativo;
- valide host/porta da URL (`127.0.0.1:54322` no padrão local);
- confirme usuário/senha (`postgres/postgres` no padrão inicial);
- rode `npm run prisma:migrate:status` para testar conectividade;
- verifique se não há conflito de portas em outro serviço local.

### Erro com chaves Supabase (`SUPABASE_*`)

Sintomas comuns:
- `401 Unauthorized` em rotas protegidas;
- falhas ao validar token no backend.

Checklist:
- confirme se `SUPABASE_URL` aponta para a instância local correta;
- revise `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` sem espaços extras/quebras;
- garanta que `SUPABASE_JWT_SECRET` corresponde ao segredo da instância local;
- reinicie o backend após alterar variáveis de ambiente.
