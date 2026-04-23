import { config as loadEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { defineConfig, env } from 'prisma/config';

if (existsSync('src/config/.env')) {
  loadEnv({ path: 'src/config/.env' });
} else {
  loadEnv();
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
