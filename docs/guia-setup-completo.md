# Guia completo de setup (do clone até rodar)

Este guia foi criado para te levar **do zero** (clone do repositório) até o projeto rodando com **Supabase Cloud**, incluindo um passo a passo detalhado de configuração das variáveis de ambiente.

---

## 1) Pré-requisitos

Antes de começar, instale:

- **Git**
- **Node.js 20+**
- **npm 10+**
- **Docker + Docker Compose** (opcional, mas recomendado para rodar serviços em container)

> Dica: valide as instalações com:
>
> ```bash
> git --version
> node --version
> npm --version
> docker --version
> docker compose version
> ```

---

## 2) Clonar o projeto

```bash
git clone <URL_DO_REPOSITORIO>
cd projeto-pdhc
```

---

## 3) Instalar dependências

Na raiz do monorepo:

```bash
npm run setup
```

Esse comando instala dependências de:

- `backend/`
- `mobile/`

---

## 4) Criar projeto no Supabase Cloud

1. Acesse: https://supabase.com/dashboard
2. Clique em **New project**.
3. Defina:
   - **Organization**
   - **Project name**
   - **Database password** (guarde essa senha; será usada na `DATABASE_URL`)
   - **Region** (escolha a mais próxima)
4. Aguarde o provisionamento.

---

## 5) Coletar as variáveis no painel do Supabase

Com o projeto criado, abra o projeto no Dashboard e pegue:

### 5.1 URL e chaves da API

No menu **Project Settings > API**:

- **Project URL** → valor de `SUPABASE_URL`
- **anon / public key** → valor de `SUPABASE_ANON_KEY`
- **service_role key** → valor de `SUPABASE_SERVICE_ROLE_KEY`

### 5.2 JWT Secret

No menu **Project Settings > API** (seção de JWT):

- **JWT Secret** → valor de `SUPABASE_JWT_SECRET`

### 5.3 String de conexão do Postgres

No menu **Project Settings > Database** (ou **Connect**):

- Copie a connection string PostgreSQL e monte `DATABASE_URL` com `sslmode=require`.

Formato esperado:

```text
postgresql://postgres.<project-ref>:[SUA_SENHA]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

---

## 6) Configurar `.env` na raiz

1. Gere o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Edite o `.env` e preencha tudo:

```env
# Backend / Supabase Cloud
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_JWT_SECRET=<jwt_secret>
DATABASE_POOLER_URL=postgresql://postgres.<project-ref>:<senha>@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DATABASE_URL=postgresql://postgres:<senha>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
DATABASE_DIRECT_URL=postgresql://postgres:<senha>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require

# Mobile
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
EXPO_PUBLIC_APP_ENV=development

# URL do backend que o app mobile vai consumir
# Emulador Android:
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
# Computador/dispositivo local (ajuste quando necessário):
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

> Importante:
>
> - `SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_URL` normalmente são iguais.
> - `SUPABASE_ANON_KEY` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` normalmente são iguais.
> - Nunca commitar `.env` com secrets reais.

---

## 7) Gerar `mobile/.env` automaticamente

Após preencher o `.env` da raiz:

```bash
npm run sync:mobile-env
```

Esse comando copia apenas variáveis `EXPO_PUBLIC_*` para `mobile/.env`.

---

## 8) Preparar banco com Prisma (backend)

Com `DATABASE_URL` configurada:

```bash
DATABASE_URL="$DATABASE_URL" npm --prefix backend run prisma:generate
DATABASE_URL="$DATABASE_URL" npm --prefix backend run prisma:db:push
```

### PowerShell (Windows)

```powershell
$env:DATABASE_URL="postgresql://postgres:<senha>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:db:push
```

---

## 9) Rodar o projeto

Você pode rodar de 2 formas.

### Opção A — Sem Docker (local)

Terminal 1 (backend):

```bash
npm run dev:backend
```

Terminal 2 (mobile):

```bash
npm run dev:mobile:emulator
```

### Opção B — Com Docker (serviços em container)

> Se o build do Docker do backend falhar com `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`, confirme que o arquivo `.env` existe na raiz e contém `DATABASE_URL`.

```bash
npm run docker:up
npm run docker:logs
```

Para parar:

```bash
npm run docker:down
```

---

## 10) Validar se subiu corretamente

- Backend health/docs:
  - `http://localhost:3000/docs`
- Mobile (Expo):
  - porta `8082`

Se login falhar:

- revise `SUPABASE_URL`
- revise `SUPABASE_ANON_KEY`
- confira se `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` foram para `mobile/.env`

---

## 11) Erros comuns e como resolver

### Erro de autenticação (401)

- Verifique se `SUPABASE_JWT_SECRET` está correto.
- Confirme se o token vem no header `Authorization: Bearer <token>`.

### Erro de conexão no banco

- Confira `DATABASE_URL`.
- Garanta `sslmode=require`.
- Confirme se a senha do banco está correta.
- Se aparecer `ENETUNREACH` com IPv6 no Docker/Windows, configure `DATABASE_POOLER_URL` com pooler IPv4 (`*.pooler.supabase.com:6543`).
- Mantenha `DATABASE_URL`/`DATABASE_DIRECT_URL` (porta `5432`) para `prisma db push` e migrations.

### Mobile não acha backend

- Emulador Android: use `http://10.0.2.2:3000`.
- Dispositivo físico: use IP da máquina na rede local (ex.: `http://192.168.1.10:3000`).

### `mobile/.env` desatualizado

- Rode novamente:

```bash
npm run sync:mobile-env
```

---

## 12) Fluxo rápido (resumo)

```bash
git clone <URL_DO_REPOSITORIO>
cd projeto-pdhc
cp .env.example .env
# preencher .env com credenciais do Supabase Cloud
npm run setup
npm run sync:mobile-env
DATABASE_URL="$DATABASE_URL" npm --prefix backend run prisma:generate
DATABASE_URL="$DATABASE_URL" npm --prefix backend run prisma:db:push
npm run dev
```

Pronto ✅
