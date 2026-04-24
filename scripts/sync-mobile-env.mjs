import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootEnvPath = resolve(process.cwd(), '.env');
const mobileEnvPath = resolve(process.cwd(), 'mobile/.env');

if (!existsSync(rootEnvPath)) {
  console.warn(
    '[sync-mobile-env] Root .env not found. Skipping mobile/.env generation.',
  );
  process.exit(0);
}

const rootEnvContent = readFileSync(rootEnvPath, 'utf8');

const expoPublicLines = rootEnvContent
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .filter((line) => line.startsWith('EXPO_PUBLIC_'));

const generatedContent = [
  '# Auto-generated from ../.env',
  '# Run `npm run sync:mobile-env` at repository root to refresh.',
  ...expoPublicLines,
  '',
].join('\n');

writeFileSync(mobileEnvPath, generatedContent, 'utf8');
console.log(`[sync-mobile-env] Updated ${mobileEnvPath}`);
