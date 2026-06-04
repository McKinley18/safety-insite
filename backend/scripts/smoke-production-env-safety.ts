import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

type EnvMap = Record<string, string>;

const root = join(__dirname, '..', '..');
const repoRoot = join(root, '..');

const activeEnvFiles = [
  join(repoRoot, '.env'),
  join(repoRoot, '.env.local'),
  join(root, '.env'),
  join(root, '.env.example'),
  join(repoRoot, 'frontend-next', '.env.local'),
  join(repoRoot, 'frontend-next', '.env.local.backup'),
].filter(existsSync);

function parseEnvFile(path: string): EnvMap {
  const content = readFileSync(path, 'utf8');
  const parsed: EnvMap = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    const value = line
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');

    parsed[key] = value;
  }

  return parsed;
}

function fail(message: string): never {
  throw new Error(message);
}

function assertNotTrue(env: EnvMap, key: string, filePath: string) {
  if (env[key] === 'true') {
    fail(`${key}=true is not allowed in active env file: ${filePath}`);
  }
}

function assertProductionSafe(env: EnvMap, filePath: string) {
  const isProduction = env.NODE_ENV === 'production';

  assertNotTrue(env, 'DEV_AUTH_BYPASS', filePath);
  assertNotTrue(env, 'NEXT_PUBLIC_DISABLE_AUTH', filePath);

  if (env.TYPEORM_SYNCHRONIZE === 'true') {
    fail(`TYPEORM_SYNCHRONIZE=true is not production-safe in active env file: ${filePath}`);
  }

  if (isProduction && !env.JWT_SECRET) {
    fail(`NODE_ENV=production requires JWT_SECRET in active env file: ${filePath}`);
  }

  if (isProduction && env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    fail(`JWT_SECRET should be at least 32 characters in active env file: ${filePath}`);
  }
}

function main() {
  for (const filePath of activeEnvFiles) {
    const env = parseEnvFile(filePath);
    assertProductionSafe(env, filePath);
  }

  console.log('PASS: Production env safety smoke test passed.');
}

main();
