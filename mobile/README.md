# Mobile App

Aplicativo React Native (Expo Router) do projeto PDHC.

## Fluxo recomendado

Na raiz do monorepo, use:

```bash
npm run dev
```

Esse comando sobe:

- Supabase local
- backend NestJS
- mobile Expo na porta 8082

## Rodar apenas o mobile

Dentro da pasta mobile:

```bash
npm install
npm run emulator
```

Para tentar abrir automaticamente no Android Emulator:

```bash
npm run android:emulator
```

## Estrutura inicial

O app foi limpo do boilerplate padrão do create-expo-app e começa com uma tela base em:

- app/index.tsx
