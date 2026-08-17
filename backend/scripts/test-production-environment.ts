import { validateProductionEnvironment } from '../src/config/validate-production-environment';

const managedKeys = [
  'NODE_ENV', 'DATABASE_URL', 'JWT_SECRET', 'JWT_ACCESS_SECRET', 'FRONTEND_URL',
  'PASSWORD_RESET_FRONTEND_URL', 'PASSWORD_RESET_PROVIDER', 'STORAGE_PROVIDER',
  'STORAGE_S3_BUCKET', 'CORS_ORIGINS', 'CORS_ORIGIN', 'TRUST_PROXY_HOPS',
  'TYPEORM_SYNCHRONIZE', 'DEV_AUTH_BYPASS', 'DEV_FORCE_EXPERT', 'DEV_FORCE_PRO',
  'DEV_EXPOSE_RESET_TOKEN',
];
const original = Object.fromEntries(managedKeys.map((key) => [key, process.env[key]]));

function restore() {
  for (const key of managedKeys) {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
function configureValidProduction() {
  process.env.NODE_ENV = 'production';
  process.env.DATABASE_URL = 'postgresql://user:example@db.invalid:5432/app';
  process.env.JWT_SECRET = 'a-production-shaped-secret-with-32-chars';
  process.env.FRONTEND_URL = 'https://app.example.test';
  process.env.PASSWORD_RESET_FRONTEND_URL = 'https://app.example.test/reset-password';
  process.env.PASSWORD_RESET_PROVIDER = 'resend';
  process.env.STORAGE_PROVIDER = 's3';
  process.env.STORAGE_S3_BUCKET = 'private-example';
  process.env.CORS_ORIGINS = 'https://app.example.test';
  process.env.TRUST_PROXY_HOPS = '1';
  process.env.TYPEORM_SYNCHRONIZE = 'false';
  for (const key of ['DEV_AUTH_BYPASS', 'DEV_FORCE_EXPERT', 'DEV_FORCE_PRO', 'DEV_EXPOSE_RESET_TOKEN']) {
    delete process.env[key];
  }
}
function expectFailure(label: string, mutate: () => void) {
  configureValidProduction();
  mutate();
  let failed = false;
  try {
    validateProductionEnvironment();
  } catch {
    failed = true;
  }
  if (!failed) throw new Error(`${label} did not fail closed.`);
}

try {
  configureValidProduction();
  validateProductionEnvironment();
  expectFailure('development auth bypass', () => { process.env.DEV_AUTH_BYPASS = 'true'; });
  expectFailure('weak JWT secret', () => { process.env.JWT_SECRET = 'short'; });
  expectFailure('HTTP frontend', () => { process.env.FRONTEND_URL = 'http://app.example.test'; });
  expectFailure('wildcard CORS', () => { process.env.CORS_ORIGINS = 'https://*.example.test'; });
  expectFailure('local production storage', () => { process.env.STORAGE_PROVIDER = 'local_test'; });
  expectFailure('schema synchronization', () => { process.env.TYPEORM_SYNCHRONIZE = 'true'; });
  expectFailure('invalid proxy hops', () => { process.env.TRUST_PROXY_HOPS = '9'; });
  console.log(JSON.stringify({ passed: true, assertions: 8 }));
} finally {
  restore();
}
