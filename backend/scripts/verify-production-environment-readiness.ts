import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

type EnvMap = Record<string, string>;

function parseEnvFile(path: string): EnvMap {
  if (!existsSync(path)) return {};

  const env: EnvMap = {};
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const index = trimmed.indexOf('=');
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const rawValue = trimmed.slice(index + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    env[key] = value;
  }

  return env;
}

function getEnvValue(envFiles: EnvMap[], key: string): string | undefined {
  return (
    process.env[key] ||
    envFiles.find((env) => env[key] !== undefined)?.[key]
  );
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertScript(packageJsonPath: string, scriptName: string): void {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  assert(
    Boolean(pkg.scripts?.[scriptName]),
    `Missing script "${scriptName}" in ${packageJsonPath}`,
  );
}

const root = join(__dirname, '..', '..');
const backendRoot = join(root, 'backend');
const frontendRoot = join(root, 'frontend-next');

const backendEnvFiles = [
  parseEnvFile(join(backendRoot, '.env')),
  parseEnvFile(join(root, '.env')),
];

const frontendEnvFiles = [
  parseEnvFile(join(frontendRoot, '.env.local')),
  parseEnvFile(join(root, '.env.local')),
];

const nodeEnv = getEnvValue(backendEnvFiles, 'NODE_ENV') || 'development';
const isProduction = nodeEnv === 'production';

const devAuthBypass = getEnvValue(backendEnvFiles, 'DEV_AUTH_BYPASS');
const jwtSecret =
  getEnvValue(backendEnvFiles, 'JWT_SECRET') ||
  getEnvValue(backendEnvFiles, 'JWT_ACCESS_SECRET');

const databaseUrl = getEnvValue(backendEnvFiles, 'DATABASE_URL');
const dbHost = getEnvValue(backendEnvFiles, 'DB_HOST');
const dbName =
  getEnvValue(backendEnvFiles, 'DB_NAME') ||
  getEnvValue(backendEnvFiles, 'DB_DATABASE') ||
  getEnvValue(backendEnvFiles, 'POSTGRES_DB');

const frontendUrl = getEnvValue(backendEnvFiles, 'FRONTEND_URL');
const nextApiUrl =
  getEnvValue(frontendEnvFiles, 'NEXT_PUBLIC_API_BASE_URL') ||
  getEnvValue(frontendEnvFiles, 'NEXT_PUBLIC_API_URL');

const nextDisableAuth = getEnvValue(frontendEnvFiles, 'NEXT_PUBLIC_DISABLE_AUTH');

console.log('\nProduction Environment Readiness Verification');
console.log('=============================================\n');

assert(
  existsSync(join(backendRoot, 'package.json')),
  'backend/package.json is missing.',
);

assert(
  existsSync(join(frontendRoot, 'package.json')),
  'frontend-next/package.json is missing.',
);

assertScript(join(backendRoot, 'package.json'), 'build');
assertScript(join(backendRoot, 'package.json'), 'migration:run');
assertScript(join(frontendRoot, 'package.json'), 'build');

assert(
  existsSync(join(root, 'scripts', 'verify-production-readiness.sh')),
  'Top-level production readiness script is missing.',
);

assert(
  existsSync(join(backendRoot, 'scripts', 'verify-safescope-production-readiness.ts')),
  'Backend SafeScope production readiness script is missing.',
);

if (isProduction) {
  assert(
    devAuthBypass !== 'true',
    'Production cannot run with DEV_AUTH_BYPASS=true.',
  );

  assert(
    nextDisableAuth !== 'true',
    'Production frontend cannot run with NEXT_PUBLIC_DISABLE_AUTH=true.',
  );

  assert(
    Boolean(jwtSecret),
    'Production requires JWT_SECRET or JWT_ACCESS_SECRET.',
  );

  assert(
    String(jwtSecret || '').length >= 32,
    'Production JWT secret must be at least 32 characters.',
  );

  assert(
    !['dev-only-secret-change-me', 'development-only-secret-change-me', 'local_dev_secret_only', 'supersecretkey'].includes(
      String(jwtSecret),
    ),
    'Production JWT secret cannot use a known development/default value.',
  );

  assert(
    Boolean(databaseUrl || (dbHost && dbName)),
    'Production requires DATABASE_URL or DB_HOST plus DB_NAME/DB_DATABASE/POSTGRES_DB.',
  );

  assert(
    Boolean(frontendUrl),
    'Production backend should define FRONTEND_URL for CORS.',
  );

  assert(
    Boolean(nextApiUrl),
    'Production frontend should define NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL.',
  );

  assert(
    !String(nextApiUrl || '').includes('localhost'),
    'Production frontend API URL cannot point to localhost.',
  );
} else {
  console.log(`ℹ NODE_ENV is "${nodeEnv}", so strict production secret checks are advisory.`);
}

if (devAuthBypass === 'true') {
  console.log('⚠ DEV_AUTH_BYPASS=true is present. This is acceptable only outside production.');
}

if (nextDisableAuth === 'true') {
  console.log('⚠ NEXT_PUBLIC_DISABLE_AUTH=true is present. This is acceptable only outside production.');
}

console.log('✅ Package scripts verified.');
console.log('✅ Verification scripts verified.');
console.log('✅ Environment safety checks passed.');
console.log('\n=============================================');
console.log('✅ Production environment readiness verification passed.');
console.log('=============================================\n');
