# Mobile App (Expo)

Aplicativo React Native do projeto PDHC, com rotas públicas de autenticação e rotas protegidas para operação administrativa.

## Pré-requisitos

- Node.js + npm
- Expo (via `npx`)
- Android Emulator ou dispositivo físico (Expo Go)

## Configuração de ambiente

O app consome variáveis `EXPO_PUBLIC_*` geradas automaticamente em `mobile/.env` a partir do `.env` da raiz.

1. Na raiz do projeto, configure:

```bash
cp .env.example .env
```

2. Preencha ao menos:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

3. Gere o `mobile/.env`:

```bash
npm run sync:mobile-env
```

> `npm run dev:mobile` e `npm run dev` já executam esse sync automaticamente.

## Configuração de rede (`EXPO_PUBLIC_API_URL`)

- Android Emulator: `http://10.0.2.2:3000`
- Dispositivo físico (mesma LAN): `http://192.168.x.x:3000`

O app adiciona `/api` automaticamente no cliente HTTP.

## Como executar

Na raiz do monorepo:

- `npm run dev` → fluxo completo recomendado (backend + mobile emulador, usando Supabase Cloud)
- `npm run dev:mobile` → apenas Expo start
- `npm run dev:mobile:emulator` → Expo localhost (bom para emulador)
- `npm run dev:mobile:android` → tenta abrir Android automaticamente

## Checklist rápido

- app inicia sem erro
- login/cadastro funcionam
- listagens de especialidades/profissionais/pacientes carregam
- criação/edição de consulta funciona com backend autenticado
