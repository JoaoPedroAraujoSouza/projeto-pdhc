import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

const envCandidates = ['src/config/.env', '.env', '../.env'];
const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (envPath) {
  loadEnv({ path: envPath });
}

const directUrl = process.env.DATABASE_DIRECT_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
    ...(directUrl ? { directUrl } : {}),
  },
});
