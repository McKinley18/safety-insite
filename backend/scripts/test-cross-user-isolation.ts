/**
 * V1-ISOLATION-01 -- strict per-user isolation of customer inspection data.
 *
 * Run (disposable stack only):
 *   NODE_ENV=test DATABASE_URL=postgresql://…/test_… API_BASE_URL=http://localhost:4001 \
 *     npx ts-node scripts/test-cross-user-isolation.ts
 *
 * The authoritative predicate under test lives in InspectionService.findAccessible():
 *
 *     const sameScope = inspection.organizationId
 *       ? inspection.organizationId === user.organizationId   // authorised org sharing
 *       : inspection.ownerUserId === user.userId;             // strict individual ownership
 *     if (!sameScope) throw new NotFoundException('Inspection not found.');
 *
 * Two individual accounts (organizationId null) therefore fall on the ownerUserId branch and must
 * be completely opaque to each other. This asserts that SERVER-SIDE, by ID, not by list filtering:
 * a caller who already knows the exact UUID must still be refused. NotFound (404) rather than
 * Forbidden (403) is the correct answer -- 403 would confirm the row exists.
 */

const baseUrl = process.env.API_BASE_URL || 'http://localhost:4001';
const databaseUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV !== 'test' || !/test|phase[0-9]+|closure|_qa_/i.test(databaseUrl)) {
  throw new Error('Cross-user isolation test requires an isolated, disposable test database.');
}

let passes = 0;
const failures: string[] = [];

function check(condition: unknown, label: string, detail?: string) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }
  failures.push(label);
  console.error(`FAIL ${label}${detail ? ` -- ${detail}` : ''}`);
}

async function api(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<{ status: number; body: any }> {
  const { token, ...rest } = init;
  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(rest.headers || {}),
    },
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function makeUser(label: string) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `isolation-${label}-${suffix}@insite-verify.test`;
  const password = 'Isolation!Pass123';
  const reg = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: `Isolation ${label}`, email, password, type: 'individual' }),
  });
  if (reg.status !== 201) throw new Error(`register ${label} failed: ${reg.status}`);
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (login.status !== 201 && login.status !== 200) {
    throw new Error(`login ${label} failed: ${login.status}`);
  }
  const token = login.body.accessToken || login.body.token;
  const me = await api('/auth/me', { token });
  return { label, email, token, userId: me.body.id, organizationId: me.body.organizationId };
}

async function seed(user: { token: string }, siteName: string, text: string) {
  const site = await api('/sites', {
    method: 'POST', token: user.token, body: JSON.stringify({ name: siteName }),
  });
  const inspection = await api('/inspections', {
    method: 'POST', token: user.token,
    body: JSON.stringify({ siteId: site.body.id, title: 'Quick Capture', regulatoryContext: 'msha' }),
  });
  const observation = await api(`/inspections/${inspection.body.id}/observations`, {
    method: 'POST', token: user.token, body: JSON.stringify({ rawText: text }),
  });
  return { siteId: site.body.id, inspectionId: inspection.body.id, observationId: observation.body.id };
}

async function main() {
  const A = await makeUser('a');
  const B = await makeUser('b');

  check(A.userId && B.userId && A.userId !== B.userId, 'two distinct accounts created');
  check(!A.organizationId && !B.organizationId,
    'both accounts are individual (organizationId null) -> strict ownerUserId branch');

  const dataA = await seed(A, 'Site A — isolation', 'USER A observation: tail pulley guard missing.');
  const dataB = await seed(B, 'Site B — isolation', 'USER B observation: handrail absent on catwalk.');

  // --- each user sees their own, and ONLY their own ---
  for (const [self, own, other] of [[A, dataA, dataB], [B, dataB, dataA]] as const) {
    const list = await api('/inspections', { token: self.token });
    const ids: string[] = (list.body || []).map((i: any) => i.id);
    check(list.status === 200 && ids.includes(own.inspectionId),
      `${self.label.toUpperCase()}: own inspection appears in own list`);
    check(!ids.includes(other.inspectionId),
      `${self.label.toUpperCase()}: other user's inspection is ABSENT from list`,
      `list returned ${ids.length} id(s)`);
    check(ids.length === 1, `${self.label.toUpperCase()}: list contains exactly one inspection`);

    const own_read = await api(`/inspections/${own.inspectionId}`, { token: self.token });
    check(own_read.status === 200 && (own_read.body.observations || []).length === 1,
      `${self.label.toUpperCase()}: can read own inspection with its observation`);
  }

  // --- cross-user reads BY KNOWN ID must fail server-side, both directions ---
  const crossReads: Array<[string, string, string, string]> = [
    ['A->B', A.token, `/inspections/${dataB.inspectionId}`, "B's inspection"],
    ['B->A', B.token, `/inspections/${dataA.inspectionId}`, "A's inspection"],
  ];
  for (const [dir, token, path, what] of crossReads) {
    const res = await api(path, { token });
    check(res.status === 404, `${dir}: reading ${what} by known ID is refused (404)`,
      `got ${res.status}`);
    check(res.status !== 200, `${dir}: no data leaked for ${what}`);
  }

  // --- cross-user WRITES must fail too ---
  const crossWrites: Array<[string, string, string, string, any]> = [
    ['A->B', A.token, `/inspections/${dataB.inspectionId}/observations`, 'add observation to B inspection', { rawText: 'intrusion attempt' }],
    ['B->A', B.token, `/inspections/${dataA.inspectionId}/observations`, 'add observation to A inspection', { rawText: 'intrusion attempt' }],
    ['A->B', A.token, `/inspections/observations/${dataB.observationId}`, 'edit B observation', { rawText: 'tampered', version: 1 }],
    ['B->A', B.token, `/inspections/observations/${dataA.observationId}`, 'edit A observation', { rawText: 'tampered', version: 1 }],
  ];
  for (const [dir, token, path, what, payload] of crossWrites) {
    const method = path.includes('/observations/') ? 'PATCH' : 'POST';
    const res = await api(path, { method, token, body: JSON.stringify(payload) });
    check(res.status >= 400, `${dir}: ${what} is refused`, `got ${res.status}`);
    check(res.status !== 200 && res.status !== 201, `${dir}: ${what} did not succeed`);
  }

  // --- cross-user report generation / reads ---
  const reportCross = await api(`/inspections/${dataB.inspectionId}/reports`, {
    method: 'POST', token: A.token, body: '{}',
  });
  check(reportCross.status >= 400,
    "A->B: generating a report from B's inspection is refused",
    `got ${reportCross.status}`);

  for (const [dir, token] of [['A', A.token], ['B', B.token]] as const) {
    const reports = await api('/inspection-reports', { token });
    check(reports.status === 200 && Array.isArray(reports.body) && reports.body.length === 0,
      `${dir}: report list is empty and scoped to self`);
  }

  // --- unauthenticated access must fail ---
  for (const [path, what] of [
    [`/inspections/${dataA.inspectionId}`, "A's inspection"],
    ['/inspections', 'inspection list'],
  ] as const) {
    const res = await api(path);
    check(res.status === 401, `unauthenticated: ${what} requires auth (401)`, `got ${res.status}`);
  }

  // --- a random/guessed UUID must not disclose existence differently ---
  const guessed = await api('/inspections/00000000-0000-4000-8000-000000000000', { token: A.token });
  check(guessed.status === 404,
    'guessed UUID returns the same 404 as a real-but-unauthorised one (no existence disclosure)',
    `got ${guessed.status}`);

  console.log(
    failures.length === 0
      ? `\nCross-user isolation: ${passes} passed, 0 failed — individual accounts are opaque to each other server-side.`
      : `\nCross-user isolation: ${passes} passed, ${failures.length} FAILED.`,
  );
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Cross-user isolation test errored:', error);
  process.exit(1);
});
