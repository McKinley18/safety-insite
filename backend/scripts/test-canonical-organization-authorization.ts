const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4104';
const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

type Json = Record<string, any>;

async function request(
  path: string,
  options: RequestInit = {},
  expected = 200,
): Promise<Json> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: any = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { text };
  }
  if (response.status !== expected) {
    throw new Error(
      `${options.method || 'GET'} ${path}: expected ${expected}, got ${response.status}: ${text}`,
    );
  }
  return body;
}

async function main() {
  if (process.env.NODE_ENV !== 'test' || !/phase[0-9]+|test/i.test(databaseUrl)) {
    throw new Error('Organization authorization fixtures require NODE_ENV=test and a disposable test database.');
  }
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const password = 'Phase4!StrongPass123';
  const registrations: Json[] = [];
  for (const label of ['a1', 'a2', 'b1']) {
    registrations.push(await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: `phase4-${label}-${suffix}@example.test`,
        password,
        name: `Phase 4 ${label.toUpperCase()}`,
        type: 'individual',
      }),
    }, 201));
  }

  const db = new Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    await db.query('BEGIN');
    const orgA = await db.query(
      `INSERT INTO organization (name, "riskProfileId", "planCode")
       VALUES ($1, 'standard_5x5', 'basic') RETURNING id`,
      [`Phase 4 Organization A ${suffix}`],
    );
    const orgB = await db.query(
      `INSERT INTO organization (name, "riskProfileId", "planCode")
       VALUES ($1, 'standard_5x5', 'basic') RETURNING id`,
      [`Phase 4 Organization B ${suffix}`],
    );
    await db.query(
      `INSERT INTO organization_memberships
       ("userId", "organizationId", role, status, "joinedAt")
       VALUES ($1, $2, 'manager', 'active', now()),
              ($3, $2, 'member', 'active', now()),
              ($4, $5, 'member', 'active', now())`,
      [
        registrations[0].userId,
        orgA.rows[0].id,
        registrations[1].userId,
        registrations[2].userId,
        orgB.rows[0].id,
      ],
    );
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  } finally {
    await db.end();
  }

  const login = async (label: string) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: `phase4-${label}-${suffix}@example.test`,
      password,
    }),
  }, 201);
  const [a1, a2, b1] = await Promise.all([login('a1'), login('a2'), login('b1')]);
  const auth = (token: string) => ({ authorization: `Bearer ${token}` });

  const site = await request('/sites', {
    method: 'POST',
    headers: auth(a1.token),
    body: JSON.stringify({ name: `Organization site ${suffix}` }),
  }, 201);
  const a2Sites = await request('/sites', { headers: auth(a2.token) });
  if (!a2Sites.data.some((item: Json) => item.id === site.id)) {
    throw new Error('A2 could not view an organization-owned site.');
  }
  await request(`/sites/${site.id}`, { headers: auth(b1.token) }, 404);
  await request(`/sites/${site.id}`, {
    method: 'PATCH',
    headers: auth(a2.token),
    body: JSON.stringify({ name: 'Member must not rename' }),
  }, 403);

  const inspection = await request('/inspections', {
    method: 'POST',
    headers: auth(a1.token),
    body: JSON.stringify({ siteId: site.id, title: 'Organization authorization inspection' }),
  }, 201);
  await request(`/inspections/${inspection.id}`, { headers: auth(a2.token) }, 404);
  await request(`/inspections/${inspection.id}`, { headers: auth(b1.token) }, 404);
  await request(`/inspections/${inspection.id}/assignments`, {
    method: 'POST',
    headers: auth(a1.token),
    body: JSON.stringify({ userId: a2.user.id, role: 'collaborator' }),
  }, 201);
  await request(`/inspections/${inspection.id}`, {
    method: 'PATCH',
    headers: auth(a2.token),
    body: JSON.stringify({ title: 'Updated by assigned A2', version: 1 }),
  }, 200);
  await request(`/inspections/${inspection.id}/assignments`, {
    method: 'POST',
    headers: auth(a1.token),
    body: JSON.stringify({ userId: b1.user.id, role: 'collaborator' }),
  }, 404);
  await request('/tasks', {
    method: 'POST',
    headers: auth(a1.token),
    body: JSON.stringify({
      title: 'Reject foreign assignment',
      dueDate: '2026-08-02',
      priority: 'medium',
      assignedToUserId: b1.user.id,
      inspectionId: inspection.id,
    }),
  }, 404);
  await request('/tasks', {
    method: 'POST',
    headers: auth(b1.token),
    body: JSON.stringify({
      title: 'Reject foreign parent',
      dueDate: '2026-08-02',
      priority: 'medium',
      inspectionId: inspection.id,
    }),
  }, 404);

  console.log(JSON.stringify({
    passed: true,
    identities: ['A1 manager / Organization A', 'A2 member / Organization A', 'B1 member / Organization B'],
    assertions: 11,
    foreignDenialPolicy: 404,
  }));
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
