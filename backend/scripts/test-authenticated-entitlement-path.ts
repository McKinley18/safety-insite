// pg is a runtime dependency; the repository does not ship @types/pg.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('pg');

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4210';
const databaseUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV !== 'test' || !/127\.0\.0\.1|localhost/.test(databaseUrl) || !/phase|test|closure|hazlenz/i.test(databaseUrl)) {
  throw new Error('This test requires a disposable test database and NODE_ENV=test.');
}

async function json(path: string, init: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init.headers || {}) },
  });
  const text = await response.text();
  return { status: response.status, body: text ? JSON.parse(text) : {} };
}

async function createUser(label: string) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `entitlement-path-${label}-${suffix}@example.test`;
  const password = 'Disposable!Strong123';
  const registered = await json('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: label, type: 'individual' }) });
  if (registered.status !== 201) throw new Error(`registration failed: ${registered.status}`);
  const login = await json('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (login.status !== 201 || !login.body.token) throw new Error(`login failed: ${login.status}`);
  return { token: String(login.body.token), userId: String(registered.body.userId || registered.body.id) , email, password };
}

async function grant(userId: string) {
  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    await db.query(`INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt",reason)
      VALUES ($1,'test','expert','active',now()-interval '1 minute',now()+interval '2 hours','Authenticated entitlement path regression')`, [userId]);
  } finally { await db.end(); }
}

async function classify(token: string) {
  return json('/safescope-v2/classify', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({ text: 'A clearly guarded, de-energized machine is awaiting maintenance.', scopes: ['osha_general_industry'] }),
  });
}

async function main() {
  if (process.env.DEV_AUTH_BYPASS === 'true') throw new Error('DEV_AUTH_BYPASS must not be enabled.');
  const entitled = await createUser('entitled');
  const free = await createUser('free');
  await grant(entitled.userId);
  const refreshed = await json('/auth/login', { method: 'POST', body: JSON.stringify({ email: entitled.email, password: entitled.password }) });
  if (refreshed.status !== 201 || !refreshed.body.token) throw new Error('entitlement refresh login failed');
  entitled.token = String(refreshed.body.token);
  const denied = await classify(free.token);
  if (denied.status !== 402 || denied.body.code !== 'PAID_SUBSCRIPTION_REQUIRED') throw new Error(`free user was not denied: ${denied.status}`);
  const concurrent = await Promise.all(Array.from({ length: 8 }, () => classify(entitled.token)));
  if (concurrent.some((result) => result.status !== 201)) throw new Error(`concurrent entitled requests failed: ${concurrent.map((r) => r.status).join(',')}`);
  const sequential = await Promise.all([classify(entitled.token), classify(entitled.token), classify(entitled.token)]);
  if (sequential.some((result) => result.status !== 201)) throw new Error('sequential entitled request failed');
  console.log(JSON.stringify({ passed: true, negative: '402', concurrent: 8, sequential: 3, bypass: false }));
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
