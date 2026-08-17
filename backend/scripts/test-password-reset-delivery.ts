import * as assert from 'node:assert/strict';
import { PasswordResetDeliveryService } from '../src/auth/password-reset-delivery.service';

const original = { ...process.env };
function restore() {
  for (const key of Object.keys(process.env)) if (!(key in original)) delete process.env[key];
  Object.assign(process.env, original);
}

async function main() {
  try {
    process.env.NODE_ENV = 'production';
    delete process.env.PASSWORD_RESET_PROVIDER;
    assert.throws(() => new PasswordResetDeliveryService(), /required in production/);

    process.env.NODE_ENV = 'development';
    process.env.PASSWORD_RESET_PROVIDER = 'development';
    process.env.PASSWORD_RESET_FRONTEND_URL = 'http://localhost:3000/ignored?next=https://evil.test';
    const development = new PasswordResetDeliveryService();
    const url = new URL(development.buildResetUrl('secret-token'));
    assert.equal(url.origin, 'http://localhost:3000');
    assert.equal(url.pathname, '/reset-password');
    assert.equal(url.searchParams.get('token'), 'secret-token');
    assert.equal(url.searchParams.has('next'), false);
    await development.send({ email: 'known@example.test', resetUrl: url.toString(), expiresMinutes: 30 });

    process.env.PASSWORD_RESET_PROVIDER = 'test';
    const testProvider = new PasswordResetDeliveryService();
    await testProvider.send({ email: 'known@example.test', resetUrl: url.toString(), expiresMinutes: 30 });

    process.env.NODE_ENV = 'production';
    process.env.PASSWORD_RESET_PROVIDER = 'resend';
    process.env.RESEND_API_KEY = 'test-only-key';
    process.env.PASSWORD_RESET_FROM_EMAIL = 'security@example.test';
    process.env.PASSWORD_RESET_FRONTEND_URL = 'https://pilot.example.test/base';
    const production = new PasswordResetDeliveryService();
    assert.equal(new URL(production.buildResetUrl('token')).origin, 'https://pilot.example.test');
    const priorFetch = global.fetch;
    global.fetch = async () => new Response('', { status: 503 });
    await assert.rejects(
      production.send({ email: 'known@example.test', resetUrl: production.buildResetUrl('token'), expiresMinutes: 30 }),
      /delivery failed/,
    );
    global.fetch = priorFetch;
    console.log('PASS: production fail-closed config, dev/test delivery, fixed reset URL, and provider failure');
  } finally {
    restore();
  }
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
