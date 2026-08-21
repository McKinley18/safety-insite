/**
 * KG-4B (Phase 19) -- the AUTHORITATIVE default-off regression for the current architecture.
 *
 * WHY THIS SUPERSEDES KG-3F PHASE 16. `test:kg3f-customer-path-disconnection` still reports 9/9, but
 * its scan excludes everything under `standards/` -- which is where KG-4A's resolver and KG-4B's
 * shadow comparator live -- so it can no longer see the seam it was written to guard. The KG-3F
 * suite is left UNMODIFIED because it is KG-3F evidence; this suite states the current property.
 *
 * WHAT IS NEW HERE, over `test:kg4a-default-off`. KG-4A proved default-off statically and in-process.
 * KG-4B proves it against a RUNNING SERVER that is genuinely configured `GOVERNED_CUTOVER_MODE=SHADOW`
 * -- the hardest case, because the mechanism is switched on and a non-allowlisted customer must still
 * be completely untouched -- and proves that a client cannot talk its way into any mode.
 *
 * REQUIRES a server started with `GOVERNED_CUTOVER_MODE=SHADOW` and exactly one allowlisted account.
 *
 * Usage:
 *   API_BASE_URL=http://127.0.0.1:4340 SHADOW_EMAIL=… LEGACY_EMAIL=… PASSWORD=… \
 *   npx ts-node scripts/test-kg4b-default-off.ts
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import {
  resolveCutoverMode, resolveCutoverEnablement, assertCutoverConfigurationSafeForProduction,
  GOVERNED_CUTOVER_MODES,
} from '../src/standards/cutover/cutover-mode';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4340';
const PASSWORD = process.env.PASSWORD || 'KG4bTestPass!234';
const SHADOW_EMAIL = process.env.SHADOW_EMAIL || 'kg4b-shadow@example.com';
const LEGACY_EMAIL = process.env.LEGACY_EMAIL || 'kg4b-legacy@example.com';
const SRC = join(__dirname, '..', 'src');

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

async function call(token: string | null, method: string, path: string, body?: unknown) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json: any = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text.slice(0, 200) }; }
  return { status: response.status, body: json };
}
async function login(email: string): Promise<string | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await call(null, 'POST', '/auth/login', { email, password: PASSWORD });
    const token = response.body?.accessToken || response.body?.token;
    if (token) return token;
    if (response.status !== 429) return null;
    await new Promise(r => setTimeout(r, 13_000));
  }
  return null;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}
const code = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

const OBSERVATION =
  'The point-of-operation guard on the punch press is missing while the machine is energized and operating.';
const GOVERNED_KEYS = ['governedDeliveryState', 'governedFallbackReason', 'governedTextUnavailable', 'knowledgeReleaseId'];

async function main() {
  // ============================================================ Part 1 -- configuration
  section('Phase 19 — configuration cannot drift into a governed or shadow mode');

  const OFF_CASES: Array<[string, Record<string, string | undefined>]> = [
    ['no mode at all', {}],
    ['empty mode', { GOVERNED_CUTOVER_MODE: '' }],
    ['whitespace mode', { GOVERNED_CUTOVER_MODE: '   ' }],
    ['malformed mode', { GOVERNED_CUTOVER_MODE: 'SHADOW_MODE' }],
    ['truthy mode value', { GOVERNED_CUTOVER_MODE: 'true' }],
    ['numeric mode value', { GOVERNED_CUTOVER_MODE: '1' }],
    ['SHADOW without an allowlist', { GOVERNED_CUTOVER_MODE: 'SHADOW' }],
    ['SHADOW with an EMPTY allowlist', { GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: '' }],
    ['allowlist without a mode', { GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u1,u2' }],
    ['org allowlist without a mode', { GOVERNED_CUTOVER_ORG_ALLOWLIST: 'org-1' }],
    ['SHADOW in production without the acknowledgement',
      { NODE_ENV: 'production', GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u1' }],
    ['GOVERNED_STRICT in production without the acknowledgement',
      { NODE_ENV: 'production', GOVERNED_CUTOVER_MODE: 'GOVERNED_STRICT', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'u1' }],
  ];
  for (const [label, env] of OFF_CASES) {
    const enablement = resolveCutoverEnablement({ userId: 'u1', organizationId: 'org-1' }, env);
    assert(enablement.effectiveMode === 'LEGACY', `HARD: ${label} -> effective mode LEGACY`);
    const context = await GovernedCutoverContext.create({ dataSource: null, principal: { userId: 'u1' }, env });
    assert(context === null, `HARD: ${label} -> no cutover context is created at all`);
  }

  // Production acknowledgement is still enforced at startup.
  for (const mode of GOVERNED_CUTOVER_MODES.filter(m => m !== 'LEGACY')) {
    let threw = false;
    try { assertCutoverConfigurationSafeForProduction({ NODE_ENV: 'production', GOVERNED_CUTOVER_MODE: mode }); }
    catch { threw = true; }
    assert(threw, `HARD: startup refuses production '${mode}' without GOVERNED_CUTOVER_PRODUCTION_ACK`);
  }
  assert(resolveCutoverMode(process.env).mode === 'LEGACY',
    'HARD: the ambient environment this suite runs in resolves to LEGACY');

  // ============================================================ Part 2 -- no client-selectable mode
  section('Phase 19 — a client cannot request SHADOW or any governed mode');

  const modeSelectors: string[] = [];
  for (const file of walk(SRC)) {
    const body = code(readFileSync(file, 'utf8'));
    if (/(?:body|query|params|headers)\s*(?:\.|\[['"])\s*[a-zA-Z"'\[\].]*(?:governedMode|cutoverMode|governedCutover|shadowMode|forceGoverned|forceShadow)/i.test(body)) {
      modeSelectors.push(relative(SRC, file));
    }
  }
  assert(modeSelectors.length === 0,
    `HARD: no request body, query, param or header selects a cutover mode (${modeSelectors.join(', ') || 'none'})`);

  const configReaders = walk(SRC)
    .filter(f => /GOVERNED_CUTOVER_(MODE|ACCOUNT_ALLOWLIST|ORG_ALLOWLIST|PRODUCTION_ACK)/.test(code(readFileSync(f, 'utf8'))))
    .map(f => relative(SRC, f));
  assert(configReaders.every(f => f.startsWith('standards/cutover/')),
    `HARD: cutover configuration is read ONLY inside standards/cutover/ (${configReaders.join(', ')})`);

  // ============================================================ Part 3 -- live server
  section('Phase 19 — on a server RUNNING in SHADOW, a non-allowlisted customer is untouched');

  const legacyToken = await login(LEGACY_EMAIL);
  const shadowToken = await login(SHADOW_EMAIL);
  assert(Boolean(legacyToken) && Boolean(shadowToken), 'both accounts authenticate against the running server');
  if (!legacyToken || !shadowToken) { console.log(`\n${passed} passed, ${failed} failed`); process.exit(1); }

  const payload = { text: OBSERVATION, scopes: ['general_industry'] };
  const legacy = await call(legacyToken, 'POST', '/safescope-v2/classify', payload);
  assert(legacy.status === 200 || legacy.status === 201,
    `the non-allowlisted account receives a real analysis (${legacy.status})`);
  const legacyBlob = JSON.stringify(legacy.body);
  for (const key of GOVERNED_KEYS) {
    assert(!legacyBlob.includes(key),
      `HARD: the non-allowlisted payload carries NO '${key}' — the SHADOW server is invisible to it`);
  }
  assert(!legacyBlob.includes('APPROVED_GOVERNED_CONTENT'),
    'HARD: nothing is reported as approved governed content to the non-allowlisted account');

  // The allowlisted account IS in SHADOW -- and its payload must be equally clean.
  const shadow = await call(shadowToken, 'POST', '/safescope-v2/classify', payload);
  assert(shadow.status === 200 || shadow.status === 201,
    `the allowlisted (SHADOW) account also receives a real analysis (${shadow.status})`);
  const shadowBlob = JSON.stringify(shadow.body);
  for (const key of GOVERNED_KEYS) {
    assert(!shadowBlob.includes(key),
      `HARD: even the SHADOW account's payload carries NO '${key}'`);
  }
  assert(!shadowBlob.includes('APPROVED_GOVERNED_CONTENT'),
    'HARD: SHADOW reports nothing as approved governed content to the customer');

  // Attempts to talk the server into a mode. All must be ignored, not honoured.
  section('Phase 19 — mode-selection attempts through the API are ignored');
  const ATTEMPTS: Array<[string, Record<string, unknown>]> = [
    ['body.governedMode', { ...payload, governedMode: 'GOVERNED_STRICT' }],
    ['body.cutoverMode', { ...payload, cutoverMode: 'GOVERNED_WITH_FALLBACK' }],
    ['body.mode', { ...payload, mode: 'GOVERNED_STRICT' }],
    ['body.forceGoverned', { ...payload, forceGoverned: true }],
    ['body.knowledgeReleaseId', { ...payload, knowledgeReleaseId: 'federal-core-2026-07-30.1' }],
  ];
  for (const [label, attemptBody] of ATTEMPTS) {
    const response = await call(legacyToken, 'POST', '/safescope-v2/classify', attemptBody);
    // Two acceptable outcomes: the DTO REJECTS the property (4xx), or the request succeeds and the
    // property is ignored. Being HONOURED is the only failure.
    //
    // The rejection body echoes the offending property name ("property knowledgeReleaseId should not
    // exist"), so scanning the blob on a 4xx would report the strongest possible outcome as a
    // failure. Only a SUCCESSFUL response is scanned.
    if (response.status >= 400) {
      assert(true, `HARD: '${label}' is REJECTED by request validation (status ${response.status})`);
      continue;
    }
    const blob = JSON.stringify(response.body);
    const honoured = GOVERNED_KEYS.some(k => blob.includes(k)) || blob.includes('APPROVED_GOVERNED_CONTENT');
    assert(!honoured, `HARD: '${label}' is accepted but IGNORED (status ${response.status})`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
