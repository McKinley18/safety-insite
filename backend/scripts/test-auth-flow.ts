import * as assert from 'node:assert/strict';

const base = process.env.API_BASE_URL || 'http://127.0.0.1:4100';
const email = `phase1-${Date.now()}@example.test`;
const oldPassword = 'AuditPass1!';
const newPassword = 'NewAuditPass2!';

async function request(path: string, body?: unknown, token?: string) {
  return fetch(`${base}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function main() {
  assert.equal((await request('/auth/register', { name: 'Auth Test', email, password: oldPassword, type: 'individual' })).status, 201);
  assert.equal((await request('/auth/register', { name: 'Duplicate', email: email.toUpperCase(), password: oldPassword, type: 'individual' })).status, 400);
  const login = await request('/auth/login', { email, password: oldPassword });
  assert.equal(login.status, 201);
  const loginBody = await login.json() as { token: string };
  assert.ok(loginBody.token);
  assert.equal((await request('/auth/login', { email, password: 'WrongPass1!' })).status, 401);
  assert.equal((await request('/auth/login', { email: 'missing@example.test', password: oldPassword })).status, 401);
  assert.equal((await request('/auth/me')).status, 401);
  assert.equal((await request('/auth/me', undefined, 'malformed')).status, 401);
  assert.equal((await request('/auth/me', undefined, loginBody.token)).status, 200);
  const unknownReset = await request('/auth/password-reset/request', { email: 'missing@example.test' });
  assert.equal(unknownReset.status, 201);
  const unknownResetBody = await unknownReset.json() as Record<string, unknown>;
  assert.equal((await request('/auth/password-reset/complete', { token: 'x'.repeat(64), newPassword })).status, 400);
  const reset = await request('/auth/password-reset/request', { email });
  const resetBody = await reset.json() as { message?: string; developmentResetToken?: string };
  assert.equal(reset.status, 201);
  assert.deepEqual(Object.keys(resetBody).sort(), Object.keys(unknownResetBody).sort());
  assert.equal(resetBody.message, unknownResetBody.message);
  if (!resetBody.developmentResetToken) {
    console.log('PASS: registration, duplicate, login, JWT guard, and enumeration-safe reset request; reset completion is covered by the isolated delivery/reset suite');
    return;
  }
  assert.equal(resetBody.developmentResetToken.length, 64);
  assert.equal((await request('/auth/password-reset/complete', { token: resetBody.developmentResetToken, newPassword })).status, 201);
  assert.equal((await request('/auth/me', undefined, loginBody.token)).status, 401);
  assert.equal((await request('/auth/password-reset/complete', { token: resetBody.developmentResetToken, newPassword: oldPassword })).status, 400);
  assert.equal((await request('/auth/login', { email, password: oldPassword })).status, 401);
  assert.equal((await request('/auth/login', { email, password: newPassword })).status, 201);
  console.log('PASS: registration, duplicate, login, JWT guard, reset invalid/reuse/success, and password rotation');
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.stack || error.message : error}`);
  process.exitCode = 1;
});
