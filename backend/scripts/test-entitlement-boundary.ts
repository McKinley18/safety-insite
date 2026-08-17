const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4104';
const databaseUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV !== 'test' || !/phase[0-9]+|test|closure/i.test(databaseUrl)) {
  throw new Error('Entitlement boundary test requires an isolated test database.');
}

async function call(path: string, options: RequestInit, expected: number) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  if (response.status !== expected) {
    throw new Error(`${path}: expected ${expected}, got ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function main() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const password = 'Phase4!StrongPass123';
  const users = [];
  for (const label of ['entitled', 'free']) {
    const email = `phase4-${label}-${suffix}@example.test`;
    const registered = await call('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name: label, type: 'individual' }),
    }, 201);
    const login = await call('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, 201);
    users.push({ ...registered, token: login.token });
  }
  const classify = (token: string, expected: number) => call('/safescope-v2/classify', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({
      text: 'A bench grinder is unplugged, tagged out, and awaiting replacement of its damaged guard.',
      scopes: ['osha_general'],
    }),
  }, expected);

  await classify(users[0].token, 402);
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  await db.query(
    `INSERT INTO entitlement_grants
     ("userId", source, tier, status, "startsAt", "endsAt", reason)
     VALUES ($1, 'test', 'expert', 'active', now() - interval '2 hour',
             now() - interval '1 hour', 'Expired boundary fixture')`,
    [users[0].userId],
  );
  await classify(users[0].token, 402);
  await db.query(
    `INSERT INTO entitlement_grants
     ("userId", source, tier, status, "startsAt", "endsAt", reason)
     VALUES ($1, 'test', 'expert', 'active', now() - interval '1 minute',
             now() + interval '2 hour', 'Active boundary fixture')`,
    [users[0].userId],
  );
  await db.end();
  await classify(users[0].token, 201);
  await classify(users[1].token, 402);
  console.log(JSON.stringify({
    passed: true,
    assertions: 4,
    freeDenied: true,
    expiredDenied: true,
    activeGrantAllowed: true,
    crossUserIsolation: true,
  }));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
