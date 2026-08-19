import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../../backend/package.json', import.meta.url));
const { Client } = require('pg');

const root = new URL('../hazlenz-production-completion-2026-08-03-continuation/', import.meta.url);
const cases = JSON.parse(await readFile(new URL('./raw/independent-corpus-cases.json', root), 'utf8'));
const life = cases.filter((c) => c.lifeCritical);
const nonLife = cases.filter((c) => !c.lifeCritical).slice(0, Math.max(0, 30 - life.length));
const selected = [...life, ...nonLife];
const out = new URL('./THREE_PASS_REPEATABILITY_RESULTS.json', import.meta.url);
const tmp = new URL('./THREE_PASS_REPEATABILITY_RESULTS.tmp', import.meta.url);
const api = process.env.REPEATABILITY_API_BASE_URL || 'http://127.0.0.1:4210';
const dbUrl = process.env.REPEATABILITY_DATABASE_URL || 'postgresql://user:password@127.0.0.1:5432/phase6_adopt_completion_a';

async function save(value) { await writeFile(tmp, JSON.stringify(value, null, 2)); await rename(tmp, out); }
async function request(path, init = {}) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await fetch(`${api}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
    const text = await response.text();
    let body = {}; try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
    if (response.status !== 429) return { status: response.status, body, retries: attempt };
    const retry = Number(response.headers.get('retry-after'));
    const wait = Number.isFinite(retry) && retry > 0 ? retry * 1000 : Math.min(60000, 5000 * (2 ** attempt));
    await new Promise((resolve) => setTimeout(resolve, wait + Math.floor(Math.random() * 500)));
  }
  return { status: 429, body: { error: 'retry-exhausted' }, retries: 6 };
}
async function token() {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `repeatability-${stamp}@example.test`, password = 'Repeatability!Corpus123';
  const reg = await request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: 'Repeatability runner', type: 'individual' }) });
  if (reg.status !== 201) throw new Error(`register ${reg.status}`);
  const first = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  const payload = JSON.parse(Buffer.from(first.body.token.split('.')[1], 'base64url').toString('utf8'));
  const db = new Client({ connectionString: dbUrl }); await db.connect();
  await db.query(`INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt",reason) VALUES ($1,'test','expert','active',now()-interval '1 minute',now()+interval '2 hours','repeatability disposable entitlement')`, [payload.userId]);
  await db.end();
  const refreshed = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  return refreshed.body.token;
}
function semantic(body) {
  const standard = (v) => typeof v === 'string' ? v : (v?.citation || v?.standard || '');
  const standards = [body.primaryCitation, ...(body.primaryStandards || []), ...(body.standardDecisions || []), ...(body.suggestedStandards || [])].map(standard).filter(Boolean).sort();
  const questions = (body.evidenceGapQuestions || body.clarifyingQuestions || []).map((q) => q.id || q.question || q.prompt || '').sort();
  const actions = body.correctiveAction || body.correctiveActions || {};
  return { jurisdiction: body.jurisdiction || null, classification: body.classification || null, standards, questions, risk: body.risk || body.riskLevel || null, immediate: actions.immediateAction || actions.immediate || null, permanent: actions.permanentCorrection || actions.permanent || null, verification: actions.verificationStep || actions.verification || null };
}
const state = { sampleSize: selected.length, passesPerCase: 3, pacingMs: 800, startedAt: new Date().toISOString(), results: [] };
const auth = await token();
for (const c of selected) {
  const runs = [];
  for (let pass = 1; pass <= 3; pass += 1) {
    const started = performance.now();
    const response = await request('/safescope-v2/classify', { method: 'POST', headers: { authorization: `Bearer ${auth}` }, body: JSON.stringify({ text: c.narrative, scopes: c.scopes }) });
    runs.push({ pass, status: response.status, retries: response.retries, durationMs: Math.round(performance.now() - started), semantic: semantic(response.body) });
    await new Promise((resolve) => setTimeout(resolve, 800));
  }
  const baseline = JSON.stringify(runs[0].semantic);
  const stable = runs.every((run) => JSON.stringify(run.semantic) === baseline && run.status === 201);
  state.results.push({ id: c.id, lifeCritical: c.lifeCritical, jurisdiction: c.jurisdiction, stable, runs });
  await save(state);
}
state.completedAt = new Date().toISOString();
state.stableCases = state.results.filter((r) => r.stable).length;
state.unstableCases = state.results.filter((r) => !r.stable).length;
state.transportFailures = state.results.reduce((n, r) => n + r.runs.filter((x) => x.status !== 201).length, 0);
await save(state);
console.log(JSON.stringify({ sampleSize: state.sampleSize, stableCases: state.stableCases, unstableCases: state.unstableCases, transportFailures: state.transportFailures }));
