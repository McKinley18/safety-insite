import fs from 'node:fs';
import { scoreRowV4 } from '../hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs';

const base = process.env.HAZLENZ_BASE_URL || 'http://127.0.0.1:4000';
const manifest = JSON.parse(fs.readFileSync(new URL('../hazlenz-temporal-foundation-2026-08-09/FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json', import.meta.url)));

async function q(path, body, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(45000) });
  const x = await r.json().catch(() => ({}));
  return { status: r.status, body: x };
}

console.log('Logging in...');
const loginRes = await q('/auth/login', { email: process.env.HAZLENZ_MATRIX_EMAIL, password: process.env.HAZLENZ_MATRIX_PASSWORD });
if (loginRes.status !== 201 || !loginRes.body.token) throw new Error(`Login failed: ${loginRes.status}`);
const token = loginRes.body.token;
console.log('Login successful. Running', manifest.rows.length, 'cases at single-worker, ~2.2s pace (respects 30/60s route throttle)...');

const rows = [];
for (let i = 0; i < manifest.rows.length; i++) {
  const row = manifest.rows[i];
  let result = await q('/safescope-v2/classify', { text: row.observation, scopes: ['all'], structuredObservation: { narrative: row.observation, jurisdiction: 'unknown' } }, token);
  if (result.status === 200) result.status = 201;
  if (result.status === 429) {
    await new Promise((r) => setTimeout(r, 15000));
    result = await q('/safescope-v2/classify', { text: row.observation, scopes: ['all'], structuredObservation: { narrative: row.observation, jurisdiction: 'unknown' } }, token);
    if (result.status === 200) result.status = 201;
  }
  rows.push({ caseId: row.caseId, sourceFamily: row.sourceFamily, fixtureKind: row.fixtureKind, status: result.status, body: result.body, expected: { requiredFamilies: row.requiredFamilies, forbiddenFamilies: row.forbiddenFamilies } });
  if ((i + 1) % 20 === 0) console.log(`Executed: ${i + 1}/${manifest.rows.length}`);
  await new Promise((r) => setTimeout(r, 2200));
}

console.log('Scoring with V4 authoritative scorer...');
const scored = rows.map(scoreRowV4);
const summary = { version: 'FAMILY_MATRIX_SCORE_V4_AUTHORITATIVE_PACED', rows: scored.length, byKind: {} };
for (const kind of ['positive', 'negative', 'ambiguity', 'safe']) {
  const group = scored.filter((r) => r.fixtureKind === kind);
  summary.byKind[kind] = { total: group.length, pass: group.filter((r) => r.outcome === 'PASS').length, fail: group.filter((r) => r.outcome !== 'PASS').length, outcomes: group.reduce((a, r) => ((a[r.outcome] = (a[r.outcome] || 0) + 1), a), {}) };
}
const failing = scored.filter((r) => r.outcome !== 'PASS').map((r) => r.caseId);
console.log('=== RESULTS ===');
console.log(JSON.stringify(summary, null, 2));
console.log('Failing rows:', JSON.stringify(failing));
fs.writeFileSync(new URL('./P1_228_PACED_RESULT.json', import.meta.url), JSON.stringify({ summary, failing, scored }, null, 2));
