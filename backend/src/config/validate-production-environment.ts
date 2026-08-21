import { assertCutoverConfigurationSafeForProduction } from '../standards/cutover/cutover-mode';

const INSECURE_JWT_VALUES = new Set([
  'dev-only-secret-change-me',
  'development-only-secret-change-me',
  'closure-disposable-secret',
]);

function requireValue(name: string): string {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required in production.`);
  return value;
}

function requireHttpsUrl(name: string): string {
  const value = requireValue(name);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
  if (url.protocol !== 'https:') throw new Error(`${name} must use HTTPS in production.`);
  return url.origin;
}

export function validateProductionEnvironment(): void {
  // KG-4A. Runs FIRST and unconditionally, because it must also refuse an unrecognised
  // GOVERNED_CUTOVER_MODE value -- a class of misconfiguration that resolves to LEGACY at runtime
  // (safe) but that an operator almost certainly intended to be something else (worth failing on).
  assertCutoverConfigurationSafeForProduction();

  if (process.env.NODE_ENV !== 'production') return;

  if (process.env.DEV_AUTH_BYPASS === 'true' ||
      process.env.DEV_FORCE_PRO === 'true' ||
      process.env.DEV_EXPOSE_RESET_TOKEN === 'true') {
    throw new Error('Development authentication and entitlement overrides are forbidden in production.');
  }
  if (process.env.TYPEORM_SYNCHRONIZE === 'true') {
    throw new Error('TYPEORM_SYNCHRONIZE must be false in production.');
  }

  requireValue('DATABASE_URL');
  const jwtSecret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || '';
  if (jwtSecret.length < 32 || INSECURE_JWT_VALUES.has(jwtSecret)) {
    throw new Error('JWT_SECRET must be a non-development secret of at least 32 characters.');
  }

  requireHttpsUrl('FRONTEND_URL');
  const resetUrl = requireHttpsUrl('PASSWORD_RESET_FRONTEND_URL');
  if (!resetUrl) throw new Error('PASSWORD_RESET_FRONTEND_URL is required.');
  requireValue('PASSWORD_RESET_PROVIDER');

  if ((process.env.STORAGE_PROVIDER || 's3') !== 's3') {
    throw new Error('STORAGE_PROVIDER must be s3 in production.');
  }
  requireValue('STORAGE_S3_BUCKET');

  const origins = String(process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!origins.length) throw new Error('CORS_ORIGINS must contain at least one HTTPS origin in production.');
  for (const [index, origin] of origins.entries()) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGINS entry ${index + 1} is not a valid absolute URL.`);
    }
    if (parsed.protocol !== 'https:' || parsed.origin !== origin || /[*]/.test(origin)) {
      throw new Error(`CORS_ORIGINS entry ${index + 1} must be an exact HTTPS origin.`);
    }
  }

  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0 || trustProxyHops > 2) {
    throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 2.');
  }
}
