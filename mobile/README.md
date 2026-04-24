# Mobile App

Aplicativo React Native (Expo Router) do projeto PDHC.

## Pré-requisitos

- Node.js e npm instalados.
- Expo CLI via `npx` (não é necessário instalar globalmente).
- Emulador Android é opcional (também é possível rodar em dispositivo físico com Expo Go).

## Configuração de ambiente (`.env`)

1. Copie o arquivo de exemplo:

```bash
cp mobile/.env.example mobile/.env
```

2. Preencha no `mobile/.env` as variáveis obrigatórias do projeto (ex.: URL da API e credenciais públicas usadas pelo app).

## Configuração de rede (obrigatório)

Defina `EXPO_PUBLIC_API_URL` corretamente de acordo com onde o app vai rodar:

- **Emulador Android**:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

- **Dispositivo físico (mesma rede LAN da sua máquina)**:
  - Use o IP local da sua máquina, por exemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000
```

> `mobile/src/lib/api.ts` adiciona o sufixo `/api` automaticamente.  
> Exemplo: se `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000`, as requisições irão para `http://10.0.2.2:3000/api`.

## Fluxos de execução

### 1) Rodar o ambiente completo pela raiz

Na raiz do monorepo:

```bash
npm run dev
```

Esse fluxo sobe:

- Supabase local
- backend NestJS
- mobile Expo na porta 8082

### 2) Rodar somente o mobile

Na raiz do monorepo:

```bash
npm --prefix mobile run emulator
```

(Equivalente a entrar em `mobile/` e executar `npm run emulator`.)

## Checklist de validação

- [ ] O app inicia sem erro no emulador/dispositivo.
- [ ] O login/autenticação funciona com as credenciais esperadas.
- [ ] A listagem de dados do backend é carregada com sucesso no app.

## Erros comuns

- **Timeout da API**
  - Verifique se backend está rodando e acessível na porta `3000`.
  - Confirme se `EXPO_PUBLIC_API_URL` está apontando para host correto do contexto (emulador vs dispositivo físico).

- **Host incorreto**
  - Emulador Android não acessa `localhost` da mesma forma que sua máquina host.
  - Use `10.0.2.2` no emulador ou IP LAN em dispositivo físico.

- **Supabase URL incorreta**
  - Revise variáveis do `.env` copiadas de `mobile/.env.example`.
  - Garanta que a URL/keys utilizadas correspondem ao ambiente em execução.
