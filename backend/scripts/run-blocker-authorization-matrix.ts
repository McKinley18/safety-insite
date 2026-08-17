import { writeFile } from 'node:fs/promises';
const { Client } = require('pg') as { Client: new (options: { connectionString: string }) => any };

type Json = Record<string, any>;
type Actor = { name: string; token?: string; userId?: string; orgId?: string; role?: string };
type Row = { actor: string; resource: string; operation: string; path: string; expected: number; disclose: boolean; actual?: number; passed?: boolean; responseShape?: string; auditDelta?: number; reason?: string };

const baseUrl = process.env.API_BASE_URL || 'http://127.0.0.1:4233';
const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required');

async function call(path: string, actor?: Actor, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', ...(actor?.token ? { authorization: `Bearer ${actor.token}` } : {}), ...(options.headers || {}) },
  });
  const text = await response.text(); let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body, shape: body === null ? 'empty' : Array.isArray(body) ? 'array' : typeof body === 'object' ? 'object' : typeof body };
}

async function register(label: string, suffix: string, password: string): Promise<Actor> {
  const email = `blocker-${label}-${suffix}@example.test`;
  if (!process.env.MATRIX_EXISTING_SUFFIX) {
    const result = await call('/auth/register', undefined, { method: 'POST', body: JSON.stringify({ email, password, name: `Blocker ${label}`, type: 'individual' }) });
    if (result.status !== 201) throw new Error(`registration failed ${label}: ${result.status}`);
  }
  const login = await call('/auth/login', undefined, { method: 'POST', body: JSON.stringify({ email, password }) });
  if (login.status !== 201) throw new Error(`login failed ${label}: ${login.status}`);
  await new Promise(resolve => setTimeout(resolve, 1100));
  return { name: label, token: login.body.token, userId: login.body.user?.id || login.body.userId };
}

async function main() {
  const suffix = process.env.MATRIX_EXISTING_SUFFIX || `${Date.now()}`; const password = 'Blocker!Strong123';
  const owner = await register('owner', suffix, password);
  const member = await register('member', suffix, password);
  const foreign = await register('foreign', suffix, password);
  const db = new Client({ connectionString: databaseUrl }); await db.connect();
  try {
    const orgA = await db.query(`INSERT INTO organization (name, "riskProfileId", "planCode") VALUES ($1,'standard_5x5','basic') RETURNING id`, [`Blocker A ${suffix}`]);
    const orgB = await db.query(`INSERT INTO organization (name, "riskProfileId", "planCode") VALUES ($1,'standard_5x5','basic') RETURNING id`, [`Blocker B ${suffix}`]);
    owner.orgId = orgA.rows[0].id; member.orgId = orgA.rows[0].id; foreign.orgId = orgB.rows[0].id;
    await db.query(`UPDATE "user" SET "organizationId"=$1, role='owner' WHERE id=$2`, [owner.orgId, owner.userId]);
    await db.query(`UPDATE "user" SET "organizationId"=$1, role='Auditor' WHERE id=$2`, [member.orgId, member.userId]);
    await db.query(`UPDATE "user" SET "organizationId"=$1, role='Auditor' WHERE id=$2`, [foreign.orgId, foreign.userId]);
    await db.query(`UPDATE organization_memberships SET status='ended' WHERE "userId" = ANY($1::uuid[])`, [[owner.userId, member.userId, foreign.userId]]);
    await db.query(`INSERT INTO organization_memberships ("userId","organizationId",role,status,"joinedAt") VALUES ($1,$2,'manager','active',now()),($3,$2,'member','active',now()),($4,$5,'member','active',now())`, [owner.userId, owner.orgId, member.userId, foreign.userId, foreign.orgId]);
  } finally { await db.end(); }

  const site = await call('/sites', owner, { method: 'POST', body: JSON.stringify({ name: `Blocker site ${suffix}` }) });
  const inspection = await call('/inspections', owner, { method: 'POST', body: JSON.stringify({ siteId: site.body.id, title: `Blocker inspection ${suffix}` }) });
  const observation = await call(`/inspections/${inspection.body.id}/observations`, owner, { method: 'POST', body: JSON.stringify({ rawText: 'Guard leaves access to moving parts while startup state is unknown.' }) });
  const snapshot = { multiHazardDecomposition: { isMultiHazard: true, hazardCount: 2, hazards: [{ domainId: 'machine_guarding', hazardFamily: 'machine_guarding', mechanism: 'access to moving parts' }, { domainId: 'hazardous_energy', hazardFamily: 'hazardous_energy', mechanism: 'unexpected startup' }] }, guidedFinding: { findingCandidates: [] } };
  const analysis = await call(`/inspections/observations/${observation.body.id}/analyses`, owner, { method: 'POST', body: JSON.stringify({ engineVersion: 'blocker-matrix', idempotencyKey: `${suffix}-analysis`, requestVersion: 1, resultSnapshot: snapshot }) });
  const loaded = await call(`/inspections/${inspection.body.id}`, owner); const findings = (loaded.body.findings || []).filter((f: Json) => f.status !== 'superseded');

  const rows: Row[] = [];
  const add = async (actor: Actor | undefined, resource: string, operation: string, path: string, expected: number, disclose = false) => { const before = await call('/audit', actor); const result = await call(path, actor); const after = await call('/audit', actor); rows.push({ actor: actor?.name || 'unauthenticated', resource, operation, path, expected, disclose, actual: result.status, passed: result.status === expected, responseShape: result.shape, auditDelta: (Array.isArray(after.body) ? after.body.length : 0) - (Array.isArray(before.body) ? before.body.length : 0), reason: result.status === expected ? undefined : JSON.stringify(result.body).slice(0, 240) }); };
  await add(undefined, 'inspection', 'read', `/inspections/${inspection.body.id}`, 401);
  await add(owner, 'inspection', 'read', `/inspections/${inspection.body.id}`, 200, true);
  await add(member, 'inspection', 'read', `/inspections/${inspection.body.id}`, 404);
  await add(foreign, 'inspection', 'read', `/inspections/${inspection.body.id}`, 404);
  await add(owner, 'analysis-history', 'read', `/inspections/${inspection.body.id}`, 200, true);
  await add(foreign, 'analysis-history', 'read', `/inspections/${inspection.body.id}`, 404);
  await add(owner, 'current-findings', 'read', `/inspections/${inspection.body.id}`, 200, true);
  await add(foreign, 'current-findings', 'read', `/inspections/${inspection.body.id}`, 404);
  await add(owner, 'tasks', 'list', '/tasks', 200, true);
  await add(foreign, 'tasks', 'list', '/tasks', 200, false);
  await add(owner, 'reports', 'list', '/inspection-reports', 200, true);
  await add(foreign, 'reports', 'list', '/inspection-reports', 200, false);
  await add(owner, 'audit', 'read', '/audit', 402, false);
  await add(member, 'audit', 'read', '/audit', 402, false);
  await add(foreign, 'audit', 'read', '/audit', 402, false);
  const absentReport = '00000000-0000-0000-0000-000000000000';
  await add(undefined, 'reports', 'read', `/inspection-reports/${absentReport}`, 401);
  await add(foreign, 'reports', 'read', `/inspection-reports/${absentReport}`, 404);
  await add(foreign, 'evidence', 'read', '/storage/not-a-real-object', 404);

  const result = { generatedAt: new Date().toISOString(), baseUrl, fixture: { ownerId: owner.userId, memberId: member.userId, foreignId: foreign.userId, inspectionId: inspection.body.id, observationId: observation.body.id, analysisId: analysis.body.id, findingIds: findings.map((f: Json) => f.id) }, rows, totals: { executed: rows.length, passed: rows.filter(r => r.passed).length, failed: rows.filter(r => !r.passed).length } };
  const outDir = process.env.MATRIX_DIR || '../verification/safety-insite-blocker-elimination-2026-08-05';
  await writeFile(process.env.MATRIX_OUTPUT || `${outDir}/AUTHORIZATION_RESULTS.json`, JSON.stringify(result, null, 2));
  await writeFile(process.env.MATRIX_CSV || `${outDir}/AUTHORIZATION_MATRIX.csv`, ['actor,resource,operation,path,expected,actual,passed,auditDelta', ...rows.map(r => [r.actor,r.resource,r.operation,r.path,r.expected,r.actual,r.passed,r.auditDelta].map(v => JSON.stringify(v ?? '')).join(','))].join('\n'));
  await writeFile(`${outDir}/AUTHORIZATION_FAILURES.md`, rows.filter(r => !r.passed).length ? rows.filter(r => !r.passed).map(r => `- ${r.actor} ${r.operation} ${r.path}: expected ${r.expected}, got ${r.actual}; ${r.reason}`).join('\n') : 'No matrix failures.');
  await writeFile(`${outDir}/AUDIT_DENIAL_RESULTS.json`, JSON.stringify(rows.map(r => ({ actor:r.actor, resource:r.resource, operation:r.operation, expected:r.expected, actual:r.actual, passed:r.passed, auditDelta:r.auditDelta })).filter(r => r.expected !== 200), null, 2));
  console.log(JSON.stringify(result.totals));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
