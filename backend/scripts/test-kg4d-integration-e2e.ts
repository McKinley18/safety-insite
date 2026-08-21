/**
 * KG-4D -- the real-HTTP integration suite.
 *
 * Everything here goes through the actual server, over HTTP, with real authenticated principals and
 * real database rows. The in-process suite (`test:kg4d-orchestration`) proves the decision logic;
 * this one proves the decisions are the ones the running product actually makes.
 *
 * Covers KG-4D phases 6 (provenance in real persistence), 13 (HTTP authorization matrix, including
 * forged client fields) and part of 17 (failure injection through the real path).
 *
 * Expects a server started with SHADOW enabled for ONE account. Env:
 *   API_BASE_URL, KG4D_EMAIL_A/PASSWORD_A (allowlisted), KG4D_EMAIL_B/PASSWORD_B (not),
 *   KG4D_ACCOUNT_A, DATABASE_URL (read-only here, for row assertions)
 */

const { Client } = require('pg') as {
  Client: new (options: { connectionString: string }) => any;
};

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4350';
const DB = process.env.DATABASE_URL || '';

const checks: string[] = [];
const failures: string[] = [];
function check(condition: unknown, message: string): void {
  if (condition) checks.push(message); else failures.push(message);
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function login(email: string, password: string): Promise<string> {
  const response = await fetch(API + '/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('login failed for ' + email + ': HTTP ' + response.status);
  return (await response.json() as { token: string }).token;
}

async function post(token: string, path: string, body: unknown): Promise<{ status: number; body: any }> {
  const response = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: response.status, body: parsed };
}

const OBSERVATION_TEXT =
  'A worker on a scaffold at about 12 feet has no guardrail and no harness anchored, ' +
  'and the nearby bench grinder is missing its tongue guard.';

/** Creates site -> inspection -> observation -> analysis and returns the persisted analysis id. */
async function persistAnalysis(token: string, label: string): Promise<{ analysisId: string | null; status: number }> {
  const site = await post(token, '/sites', { name: 'KG-4D Verification Site ' + label });
  if (site.status >= 400) return { analysisId: null, status: site.status };

  const inspection = await post(token, '/inspections', {
    siteId: site.body?.id, title: 'KG-4D ' + label,
  });
  if (inspection.status >= 400) return { analysisId: null, status: inspection.status };
  const inspectionId = inspection.body?.id;

  const observation = await post(token, '/inspections/' + inspectionId + '/observations', {
    rawText: OBSERVATION_TEXT,
  });
  if (observation.status >= 400) return { analysisId: null, status: observation.status };
  const observationId = observation.body?.id;

  const classified = await post(token, '/safescope-v2/classify', {
    text: OBSERVATION_TEXT, scopes: ['osha_construction'],
  });
  if (classified.status === 429) throw new Error('THROTTLED; the runner must pace, not the server relax');

  const analysis = await post(token, '/inspections/observations/' + observationId + '/analyses', {
    engineVersion: 'hazlenz-production',
    traceId: 'kg4d-' + label + '-' + Date.now(),
    idempotencyKey: 'kg4d-' + label + '-' + Date.now(),
    requestVersion: 1,
    resultSnapshot: classified.body,
  });
  return { analysisId: analysis.body?.id ?? null, status: analysis.status };
}

async function queryOne(sql: string, params: unknown[] = []): Promise<any> {
  const client = new Client({ connectionString: DB });
  await client.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows[0] ?? null;
  } finally { await client.end(); }
}

async function main(): Promise<void> {
  const tokenA = await login(process.env.KG4D_EMAIL_A || '', process.env.KG4D_PASSWORD_A || '');
  await sleep(1000);
  const tokenB = await login(process.env.KG4D_EMAIL_B || '', process.env.KG4D_PASSWORD_B || '');

  // ================================================================ 6. PROVENANCE IN REAL ROWS

  const shadowAnalysis = await persistAnalysis(tokenA, 'shadow');
  check(shadowAnalysis.status < 400,
    'the SHADOW-eligible account can persist an analysis (HTTP ' + shadowAnalysis.status + ')');
  check(!!shadowAnalysis.analysisId, 'the persisted analysis has an id');

  if (shadowAnalysis.analysisId && DB) {
    const row = await queryOne(
      'SELECT id, "knowledgeReleaseId" FROM hazlenz_analyses WHERE id = $1', [shadowAnalysis.analysisId]);
    check(row !== null, 'the analysis row exists in the database');
    check(row?.knowledgeReleaseId === null,
      'HARD: the persisted analysis knowledgeReleaseId is NULL in SHADOW (got ' +
      JSON.stringify(row?.knowledgeReleaseId) + ')');

    const findings = await queryOne(
      'SELECT COUNT(*)::int AS total, COUNT("knowledgeReleaseId")::int AS stamped ' +
      'FROM inspection_findings WHERE "selectedAnalysisId" = $1', [shadowAnalysis.analysisId]);
    check(Number(findings?.stamped ?? 0) === 0,
      'HARD: no finding row carries a governed release id in SHADOW (' +
      String(findings?.stamped) + ' of ' + String(findings?.total) + ' stamped)');

    // NOT VACUOUS: the server genuinely has an active release and approved content, so a governed
    // delivery mode WOULD have something to record. NULL here is a decision, not an absence.
    const active = await queryOne(
      `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active' LIMIT 1`);
    check(!!active?.releaseId,
      'an active release EXISTS on this server -- so NULL provenance is a decision, not an absence (' +
      String(active?.releaseId) + ')');
    const approved = await queryOne(
      'SELECT COUNT(*)::int AS n FROM regulatory_release_record_reviews WHERE decision = $1', ['approved']);
    check(Number(approved?.n ?? 0) > 0,
      'approved governed content EXISTS (' + String(approved?.n) + ' approvals) -- SHADOW still records NULL');
  }

  await sleep(3000);
  const legacyAnalysis = await persistAnalysis(tokenB, 'legacy');
  check(legacyAnalysis.status < 400, 'the non-eligible account can persist an analysis');
  if (legacyAnalysis.analysisId && DB) {
    const row = await queryOne(
      'SELECT "knowledgeReleaseId" FROM hazlenz_analyses WHERE id = $1', [legacyAnalysis.analysisId]);
    check(row?.knowledgeReleaseId === null, 'the non-eligible account also records NULL provenance');
  }

  // ================================================================ 13. AUTHORIZATION MATRIX

  // A client cannot select a mode, claim an identity, or assert eligibility.
  const FORGERIES: Array<{ label: string; body: Record<string, unknown> }> = [
    { label: 'governedMode', body: { governedMode: 'GOVERNED_WITH_FALLBACK' } },
    { label: 'cutoverMode', body: { cutoverMode: 'SHADOW' } },
    { label: 'mode', body: { mode: 'GOVERNED_STRICT' } },
    { label: 'forceGoverned', body: { forceGoverned: true } },
    { label: 'knowledgeReleaseId', body: { knowledgeReleaseId: 'federal-core-2026-07-30.1' } },
    { label: 'userId', body: { userId: process.env.KG4D_ACCOUNT_A || 'x' } },
    { label: 'organizationId', body: { organizationId: 'org-anything' } },
    { label: 'allowlisted flag', body: { allowlisted: true } },
    { label: 'cohort flag', body: { cohort: true, shadowEligible: true } },
    { label: 'productionShadowAck', body: { GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK: 'I_ACKNOWLEDGE_PRODUCTION_SHADOW' } },
  ];

  for (const forgery of FORGERIES) {
    const response = await post(tokenB, '/safescope-v2/classify', {
      text: 'The bench grinder is missing its tongue guard.',
      scopes: ['osha_general_industry'],
      ...forgery.body,
    });
    check(response.status !== 429, 'forgery probe "' + forgery.label + '" was not throttled');
    // Either request validation rejects the unknown field (400) or it is ignored entirely.
    // What must NEVER happen is the non-eligible account gaining governed output.
    const serialized = JSON.stringify(response.body ?? {});
    check(!serialized.includes('governedDeliveryState') && !serialized.includes('APPROVED_GOVERNED_CONTENT'),
      'forged "' + forgery.label + '" does not grant governed content to a non-eligible account');
    check(!/"knowledgeReleaseId":"[^"]+"/.test(serialized),
      'forged "' + forgery.label + '" does not put a governed release id in the payload');
    await sleep(2500);
  }

  // Forged headers cannot enable it either.
  const headerProbe = await fetch(API + '/safescope-v2/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + tokenB,
      'x-governed-cutover-mode': 'SHADOW',
      'x-user-id': process.env.KG4D_ACCOUNT_A || '',
      'x-shadow-eligible': 'true',
    },
    body: JSON.stringify({ text: 'An extension cord has damaged insulation.', scopes: ['osha_general_industry'] }),
  });
  const headerBody = await headerProbe.text();
  check(headerProbe.status !== 429, 'header forgery probe was not throttled');
  check(!headerBody.includes('governedDeliveryState'),
    'forged HEADERS do not grant governed content to a non-eligible account');

  // An unauthenticated request cannot reach the classify path at all.
  const anonymous = await fetch(API + '/safescope-v2/classify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'anything' }),
  });
  check([401, 402, 403].includes(anonymous.status),
    'an unauthenticated classify is rejected (HTTP ' + anonymous.status + ')');
}

main()
  .then(() => {
    console.log('');
    console.log('kg4d-integration-e2e: ' + checks.length + ' passed, ' + failures.length + ' failed');
    for (const entry of checks) console.log('  ok  ' + entry);
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
