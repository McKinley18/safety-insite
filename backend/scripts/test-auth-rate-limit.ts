import * as assert from 'node:assert/strict';

const base = process.env.API_BASE_URL || 'http://127.0.0.1:4100';

async function login(headers: Record<string, string> = {}) {
  return fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({
      email: `unknown-${Date.now()}@example.test`,
      password: 'WrongPass1!',
    }),
  });
}

async function main() {
  const unauthorizedBodies: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    const response = await login();
    assert.equal(response.status, 401, `attempt ${index + 1} should be an authentication denial`);
    unauthorizedBodies.push(await response.text());
  }
  assert.equal(new Set(unauthorizedBodies).size, 1, 'authentication denials should not vary by unknown account');

  const limited = await login();
  assert.equal(limited.status, 429);
  const limitedBody = await limited.text();
  assert.doesNotMatch(limitedBody, /password|user id|stack|database/i);

  const bypassHeaders: Array<Record<string, string>> = [
    { 'x-forwarded-for': '203.0.113.10' },
    { 'x-real-ip': '203.0.113.11' },
    { 'user-agent': `phase6-${Date.now()}` },
  ];
  for (const headers of bypassHeaders) {
    assert.equal((await login(headers)).status, 429, 'trivial client headers must not reset the limiter');
  }
  console.log(JSON.stringify({
    passed: true,
    authenticationDenials: 5,
    rateLimitDenials: 4,
    trivialHeaderBypassRejected: true,
  }));
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
});
