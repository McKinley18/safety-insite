// V5-C03 reusable live-fixture harness: registers a disposable user, grants a disposable
// entitlement (mirrors hazlenz-clarification-gauntlet.ts's establishDisposableTestAuthentication),
// then calls POST /safescope-v2/classify for each named fixture and prints resultStage/mayFinalize/
// clarificationQuestions/humanReviewRequired for direct before/after comparison.
//
// Requires: API_BASE_URL, DATABASE_URL (== HAZLENZ_TEST_DATABASE_URL), NODE_ENV=test.
// Run: cd backend && npx ts-node ../verification/hazlenz-v5-c03-evidence-finalization-2026-08-16/c03_live_harness.ts

const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };

const apiBaseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4320';

const FIXTURES: Array<{ name: string; body: any }> = [
  { name: 'sufficient', body: { text: 'The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running.', scopes: ['osha_general_industry'] } },
  { name: 'insufficient_vague', body: { text: 'There is a problem with the equipment.' } },
  { name: 'clarification_required_energy_unknown', body: { text: 'A worker was servicing the conveyor drive.', scopes: ['osha_general_industry'] } },
  { name: 'optional_enrichment_jurisdiction_unknown', body: { text: 'The machine guard is missing and the operator can reach the rotating shaft while the conveyor is running.' } },
  { name: 'ambiguity', body: { text: 'Something unsafe was noted near the equipment area.' } },
  { name: 'negation', body: { text: 'No exposed energized conductors were observed. The panel cover is intact.', scopes: ['osha_general_industry'] } },
  { name: 'historical_resolved', body: { text: 'The guard was missing last week but was replaced before this inspection.', scopes: ['osha_general_industry'] } },
  { name: 'planned_future', body: { text: "The guard is missing. Replacement is scheduled tomorrow's shutdown.", scopes: ['osha_general_industry'] } },
  { name: 'safe_controlled', body: { text: 'The machine guard is installed and prevents access to the rotating shaft, which is locked out and de-energized.', scopes: ['osha_general_industry'] } },
  { name: 'failed_control', body: { text: 'Local exhaust ventilation is running but fumes remain in the worker breathing zone.', scopes: ['osha_general_industry'] } },
  { name: 'multi_hazard', body: { text: 'An employee reached through an unguarded rotating pulley on a running conveyor drive while a nearby open junction box had exposed live parts.', scopes: ['osha_general_industry'] } },
];

async function fetchJson(path: string, options: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(options.headers || {}) },
  });
  const text = await response.text();
  let body: any = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

async function establishAuth(): Promise<string> {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `c03-harness-${suffix}@example.test`;
  const password = 'HazLenz!Disposable123';
  const reg = await fetchJson('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'C03 harness', type: 'individual' }),
  });
  if (reg.status !== 201) throw new Error(`register failed: ${reg.status} ${JSON.stringify(reg.body)}`);
  let login = await fetchJson('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (login.status !== 201 || !login.body?.token) throw new Error(`login failed: ${login.status}`);
  let token = String(login.body.token);
  await grantEntitlement(token);
  login = await fetchJson('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  if (login.status !== 201 || !login.body?.token) throw new Error(`refreshed login failed: ${login.status}`);
  token = String(login.body.token);
  return token;
}

async function grantEntitlement(token: string) {
  const databaseUrl = String(process.env.HAZLENZ_TEST_DATABASE_URL || '').trim();
  if (!databaseUrl) throw new Error('HAZLENZ_TEST_DATABASE_URL is required.');
  const parsed = new URL(databaseUrl);
  if (
    process.env.NODE_ENV !== 'test' ||
    !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
    !/^(test|phase|closure|hazlenz)(?:[_-]|\d)/i.test(parsed.pathname.slice(1))
  ) {
    throw new Error('Refusing to grant entitlement against a non-disposable-looking database target.');
  }
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await client.query(
      `INSERT INTO entitlement_grants
       ("userId", source, tier, status, "startsAt", "endsAt", reason)
       VALUES ($1, 'test', 'expert', 'active', NOW(), NOW() + INTERVAL '2 hours',
               'C03 disposable harness entitlement')`,
      [payload.userId],
    );
  } finally {
    await client.end();
  }
}

async function main() {
  const token = await establishAuth();
  const results: any[] = [];
  for (const fixture of FIXTURES) {
    const res = await fetchJson('/safescope-v2/classify', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(fixture.body),
    });
    const d = res.body || {};
    results.push({
      name: fixture.name,
      status: res.status,
      resultStage: d.resultStage,
      mayFinalize: d.mayFinalize,
      humanReviewRequired: d.humanReviewRequired,
      clarificationQuestionCount: (d.clarificationQuestions || []).length,
      clarificationQuestionIds: (d.clarificationQuestions || []).map((q: any) => q.id),
      guidedClarificationCount: (d.guidedFinding?.clarificationQuestions || []).length,
      primaryCitation: d.primaryCitation,
    });
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
