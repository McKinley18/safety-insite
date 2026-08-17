const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };
const api = process.env.API_BASE_URL || 'http://127.0.0.1:4105';
const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

async function call(path: string, token: string, method: string, body: any, expected: number) {
  const response = await fetch(`${api}${path}`, {
    method, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status !== expected) throw new Error(`${method} ${path}: expected ${expected}, got ${response.status}: ${await response.text()}`);
  return response.json();
}
async function main() {
  const suffix = Date.now(); const password = 'Phase5!GrantPass123';
  const emails = [`phase5-admin-${suffix}@example.test`, `phase5-target-${suffix}@example.test`];
  const registrations: any[] = [];
  for (const email of emails) {
    const response = await fetch(`${api}/auth/register`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, name: email, type: 'individual' }),
    });
    registrations.push(await response.json());
  }
  const db = new Client({ connectionString: databaseUrl }); await db.connect();
  await db.query(`UPDATE "user" SET role='platform_admin' WHERE id=$1`, [registrations[0].userId]);
  const login = async (email: string) => {
    const response = await fetch(`${api}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }),
    });
    return (await response.json()).token;
  };
  const [admin, ordinary] = await Promise.all(emails.map(login));
  await call('/admin/entitlement-grants', ordinary, 'POST', {
    userId: registrations[1].userId, source: 'pilot', tier: 'expert',
    endsAt: new Date(Date.now() + 3600000).toISOString(), reason: 'Escalation attempt',
  }, 403);
  const grant = await call('/admin/entitlement-grants', admin, 'POST', {
    userId: registrations[1].userId, source: 'pilot', tier: 'expert',
    endsAt: new Date(Date.now() + 3600000).toISOString(), reason: 'Approved controlled pilot',
  }, 201);
  await call(`/admin/entitlement-grants/${grant.id}`, admin, 'DELETE', { reason: 'Pilot access withdrawn' }, 200);
  const result = await db.query(
    `SELECT (SELECT status FROM entitlement_grants WHERE id=$1) status,
       (SELECT count(*)::int FROM security_audit_events WHERE "resourceId"=$1) audits`,
    [grant.id],
  );
  await db.end();
  if (result.rows[0].status !== 'revoked' || result.rows[0].audits !== 2) throw new Error('Grant audit/revocation persistence failed.');
  console.log(JSON.stringify({ passed: true, scenarios: 4, ordinaryEscalationDenied: true, auditedEvents: 2 }));
}
main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
