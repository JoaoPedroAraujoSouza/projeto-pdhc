import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

const envCandidates = ['src/config/.env', '.env', '../.env'];
const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (envPath) {
  loadEnv({ path: envPath });
}

const directUrl = process.env.DATABASE_DIRECT_URL;
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/postgres';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: databaseUrl,
    ...(directUrl ? { directUrl } : {}),
  },
});
