/**
 * §307 — BOUNDED, NON-DESTRUCTIVE PRODUCTION CONFIRMATION.
 *
 * One synthetic account, created and deleted through the product's own routes. No load, no
 * brute force, no injection, no Expert execution, no provider call, no charge.
 */
const BASE = 'https://safescope-backend.onrender.com';
const SUFFIX = Date.now();
const EMAIL = `s307-prod-proof-${SUFFIX}@insite-verify.invalid`;
const PASSWORD = 'Section307!ProdProof123';
const ACCEPTANCES = [{ agreementId: 'internal-pre-beta-acknowledgement', agreementVersion: '2026-09-14.1' }];

let pass = 0; const fail = [];
const check = (c, m, d = '') => { if (c) { pass++; console.log(`ok    ${m}${d ? `  [${d}]` : ''}`); } else { fail.push(m); console.log(`FAIL  ${m}${d ? `  [${d}]` : ''}`); } };

async function call(path, { method = 'GET', body, token, headers = {} } = {}) {
  const h = { 'content-type': 'application/json', ...headers };
  if (token) h.authorization = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  const raw = await r.text();
  let json = {}; try { json = raw ? JSON.parse(raw) : {}; } catch { json = { text: raw }; }
  return { status: r.status, body: json, raw, headers: r.headers };
}

const DISCLOSURE = [
  [/\b(SELECT\s+.+\s+FROM|INSERT\s+INTO|relation ".+" does not exist|syntax error at or near)\b/i, 'SQL'],
  [/\n\s*at\s+\S+\s*\(?(\/|[A-Za-z]:\\)/, 'stack frame'],
  [/\/(Users|home|var\/www|app\/src|opt\/render)\//, 'filesystem path'],
  [/(neon\.tech|rds\.amazonaws\.com|postgres(ql)?:\/\/)/i, 'database host'],
  [/(sk-ant-|sk_live_|sk_test_|whsec_|AKIA[0-9A-Z]{16})/, 'credential'],
  [/\$2[aby]\$\d{2}\$/, 'password hash'],
  [/(QueryFailedError|driverError)/, 'typeorm internals'],
];
const leaks = (raw) => DISCLOSURE.filter(([re]) => re.test(raw)).map(([, n]) => n);

(async () => {
  console.log(`§307 PRODUCTION BOUNDED PROOF  —  ${BASE}\n`);

  // ---- 0. the release is the one under test -------------------------------------------------
  const version = await call('/health/version');
  check(version.body.gitCommit === 'ea06f08373e2daf1090d94a6258c6bf7333023c5',
    'P-0  the instance answering every probe below is serving the §307 release commit',
    version.body.gitCommit?.slice(0, 12));

  // ---- 1. SE-17: readiness no longer publishes the alerting thresholds -----------------------
  const ready = await call('/health/ready');
  check(ready.status === 200 && ready.body.monitoring?.policy === undefined
    && !/serverErrorThreshold|dedupeWindowMinutes|maxAlertsPerWindow|neverAlertsOn/.test(ready.raw),
    'P-1  SE-17: the unauthenticated readiness endpoint no longer publishes the alerting thresholds',
    `policy=${ready.body.monitoring?.policy === undefined ? 'absent' : 'PRESENT'}`);
  check(typeof ready.body.monitoring?.alerting === 'string'
    && typeof ready.body.monitoring?.serverErrorsInWindow === 'number'
    && typeof ready.body.passwordResetEmail?.state === 'string'
    && Array.isArray(ready.body.passwordResetEmail?.missing)
    && ready.body.schema?.expectedSchemaVersion === '1800000025000',
    'P-2  and every operator-facing state is still reported — a threshold was removed, not observability',
    JSON.stringify({ alerting: ready.body.monitoring?.alerting, email: ready.body.passwordResetEmail?.state, schema: ready.body.schema?.expectedSchemaVersion }));
  check(leaks(ready.raw).length === 0, 'P-3  and readiness discloses no host, credential or internal path', leaks(ready.raw).join(','));

  // ---- 2. CORS, unchanged and still exact ----------------------------------------------------
  const good = await call('/health/live', { headers: { origin: 'https://safety-insite.vercel.app' } });
  const evil = await call('/health/live', { headers: { origin: 'https://evil.example.com' } });
  check(good.headers.get('access-control-allow-origin') === 'https://safety-insite.vercel.app',
    'P-4  CORS still returns the exact frontend origin for the frontend', good.headers.get('access-control-allow-origin'));
  check(!evil.headers.get('access-control-allow-origin'),
    'P-5  and returns NO allow-origin for a foreign origin', evil.headers.get('access-control-allow-origin') ?? 'absent');

  // ---- 3. the security headers the backend actually returns ----------------------------------
  for (const [h, expect] of [['strict-transport-security', null], ['x-content-type-options', 'nosniff'],
    ['x-frame-options', null], ['content-security-policy', null], ['referrer-policy', null],
    ['cross-origin-opener-policy', null], ['cross-origin-resource-policy', null]]) {
    const v = good.headers.get(h);
    check(!!v && (expect === null || v.toLowerCase() === expect), `P-6  backend returns ${h}`, v ?? 'ABSENT');
  }
  check(!good.headers.get('x-powered-by'), 'P-7  and does not advertise x-powered-by', good.headers.get('x-powered-by') ?? 'absent');

  // ---- 4. unauthenticated surface fails closed -----------------------------------------------
  for (const [label, path] of [['inspections', '/inspections'], ['reports', '/inspection-reports'],
    ['actions', '/actions'], ['notifications', '/notifications'], ['audit', '/audit'],
    ['organization members', '/organization/me/members']]) {
    const r = await call(path);
    check(r.status === 401 || r.status === 403, `P-8  unauthenticated ${label}: refused`, `${r.status}`);
    check(leaks(r.raw).length === 0, `P-8b unauthenticated ${label}: discloses nothing`, leaks(r.raw).join(','));
  }

  const grantUnauth = await call('/admin/entitlement-grants', { method: 'POST', body: { userId: '00000000-0000-4000-8000-000000000000', entitlement: 'fullSafeScope' } });
  check(grantUnauth.status === 401 || grantUnauth.status === 403,
    'P-8  unauthenticated entitlement grant MINT: refused. (An unauthenticated GET on this path is a '
    + 'router 404 before any guard, because the controller declares POST only — which is why the '
    + 'probe drives the route that exists.)', `${grantUnauth.status}`);
  check(leaks(grantUnauth.raw).length === 0, 'P-8b unauthenticated entitlement grant MINT: discloses nothing', leaks(grantUnauth.raw).join(','));

  // ---- 5. one synthetic account, through the product's own routes -----------------------------
  const reg = await call('/auth/register', { method: 'POST', body: { email: EMAIL, password: PASSWORD, name: 's307 prod proof', type: 'individual', acceptedAgreements: ACCEPTANCES } });
  check(reg.status === 200 || reg.status === 201, 'P-9  a synthetic .invalid account registers', `${reg.status} ${reg.raw.slice(0, 90)}`);
  if (reg.status >= 400) { console.log('\nABORT: could not create the synthetic account; nothing below would be exercised.'); process.exit(1); }

  const login = await call('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  const token = login.body.token;
  check(!!token && login.body.user?.organizationId === null,
    'P-10 it logs in as an individual with organizationId NULL', `${login.status}`);

  // ---- 6. the DTO boundary the SE-18 repair relies on, live -----------------------------------
  for (const [label, body] of [
    ['ownerUserId', { name: 's307 probe', ownerUserId: '00000000-0000-4000-8000-000000000000' }],
    ['organizationId', { name: 's307 probe', organizationId: '00000000-0000-4000-8000-000000000000' }],
    ['workspaceId', { name: 's307 probe', workspaceId: 'someone-elses-workspace' }],
  ]) {
    const r = await call('/sites', { method: 'POST', token, body });
    check(r.status === 400, `P-11 forbidNonWhitelisted is LIVE in production: a site carrying ${label} is refused 400`, `${r.status}`);
  }
  const profilePromotion = await call('/auth/me', { method: 'PATCH', token, body: { role: 'platform_admin', planCode: 'pro' } });
  check(profilePromotion.status === 400, 'P-12 and a profile update carrying role/planCode is refused 400', `${profilePromotion.status}`);

  // ---- 7. SE-16: the synchronize() route is refused in production -----------------------------
  const seed = await call('/maintenance/seed-safescope', { method: 'POST', token, body: { confirm: 'seed-production-safescope' }, headers: { 'x-maintenance-token': 'not-the-real-token' } });
  check(seed.status === 404, 'P-13 SE-16: the route that calls dataSource.synchronize() answers 404 in production', `${seed.status}`);
  check(leaks(seed.raw).length === 0 && !/synchronize|ALTER TABLE/i.test(seed.raw), 'P-13b and says nothing about what it would have done', seed.raw.slice(0, 60));

  // ---- 8. entitlement authority, live ---------------------------------------------------------
  const freeClassify = await call('/hazlenz/classify', { method: 'POST', token, body: { text: 'The fixed guard is missing from the conveyor head pulley nip point.' } });
  check(freeClassify.status === 402, 'P-14 a FREE individual is refused paid HazLenz capability with 402', `${freeClassify.status}`);
  const promoted = await call('/hazlenz/classify', { method: 'POST', token, body: { text: 'The fixed guard is missing.', planCode: 'pro' } });
  check(promoted.status === 402 || promoted.status === 400, 'P-15 and a caller-supplied planCode does not promote (§301 preserved)', `${promoted.status}`);
  const expert = await call('/inspections/observations/00000000-0000-4000-8000-000000000000/expert-analyses', { method: 'POST', token, body: { idempotencyKey: `s307-prod-${SUFFIX}` } });
  check(expert.status === 402 || expert.status === 404 || expert.status === 403,
    'P-16 an unentitled individual cannot invoke paid Expert capability. NO provider call is reachable from here.', `${expert.status}`);

  // ---- 9. object ownership / existence disclosure ---------------------------------------------
  for (const [label, path] of [['inspection', '/inspections/00000000-0000-4000-8000-000000000000'],
    ['site', '/sites/00000000-0000-4000-8000-000000000000'],
    ['report', '/inspection-reports/00000000-0000-4000-8000-000000000000'],
    ['file', '/files/00000000-0000-4000-8000-000000000000']]) {
    const r = await call(path, { token });
    check(r.status >= 400 && r.status < 500, `P-17 a foreign/unknown ${label} id is refused with a client error`, `${r.status}`);
    check(leaks(r.raw).length === 0, `P-17b and discloses nothing internal`, leaks(r.raw).join(','));
  }
  for (const [label, path] of [['inspection', '/inspections/not-a-uuid'], ['file', '/files/not-a-uuid'],
    ['file, SQL-shaped', `/files/${encodeURIComponent("1' OR '1'='1")}`],
    ['file, traversal', `/files/${encodeURIComponent('../../../../etc/passwd')}`]]) {
    const r = await call(path, { token });
    check(r.status >= 400 && r.status < 500, `P-18 a malformed ${label} identifier is a client error, never a 500 (SE-5 preserved)`, `${r.status}`);
    check(leaks(r.raw).length === 0, `P-18b and discloses nothing`, leaks(r.raw).join(','));
  }

  // ---- 10. the retired route the puppeteer removal left behind --------------------------------
  const legacy = await call(`/legacy/pdf/00000000-0000-4000-8000-000000000000`, { token });
  check(legacy.status === 410 || legacy.status === 402,
    'P-19 the retired legacy PDF route still answers the same way after puppeteer was removed from the artifact',
    `${legacy.status} ${legacy.raw.slice(0, 80)}`);

  // ---- 11. deferred team routes ---------------------------------------------------------------
  for (const [label, path, method, body] of [
    ['read organization settings', '/organization/me/settings', 'GET', undefined],
    ['list members', '/organization/me/members', 'GET', undefined],
    ['create an invitation', '/organization/me/invite', 'POST', { email: 's307@example.invalid', role: 'Auditor' }],
    ['mint an entitlement grant', '/admin/entitlement-grants', 'POST', { userId: login.body.user?.id, entitlement: 'fullSafeScope' }],
  ]) {
    const r = await call(path, { method, token, body });
    check(r.status < 500, `P-20 deferred/privileged ${label}: no server error`, `${r.status}`);
    if (method === 'POST') check(r.status >= 400, `P-20b deferred/privileged ${label}: the MUTATION is refused`, `${r.status}`);
    check(leaks(r.raw).length === 0, `P-20c deferred/privileged ${label}: discloses nothing`, leaks(r.raw).join(','));
  }

  // ---- 12. session death on account deletion, in production ------------------------------------
  const before = await call('/auth/me', { token });
  check(before.status === 200, 'P-21 the account works before deletion — so P-22 measures deletion', `${before.status}`);
  const deleted = await call('/auth/me', { method: 'DELETE', token, body: { password: PASSWORD } });
  check(deleted.status === 200, 'P-22 CLEANUP: the synthetic account deletes itself through the product route', `${deleted.status}`);
  const after = await call('/auth/me', { token });
  check(after.status === 401, 'P-23 and the SAME still-unexpired token is refused afterwards', `${after.status}`);
  const relogin = await call('/auth/login', { method: 'POST', body: { email: EMAIL, password: PASSWORD } });
  check(relogin.status >= 400, 'P-24 and the deleted account cannot log in again — no residue', `${relogin.status}`);

  const finalHealth = await call('/health');
  check(finalHealth.status === 200 && finalHealth.body.status === 'ok',
    'P-25 the service is healthy after every probe above', `${finalHealth.status}`);

  console.log(`\n${'='.repeat(90)}`);
  console.log(`§307 PRODUCTION BOUNDED PROOF: ${pass} passed, ${fail.length} failed.`);
  console.log('Expert executions: 0. Provider calls: 0. Charges: 0. Spend: $0.00.');
  console.log('Retained synthetic state: none — the one account created was deleted through DELETE /auth/me.');
  if (fail.length) { console.log('\nFAILED:'); for (const f of fail) console.log(`  - ${f}`); }
  console.log('='.repeat(90));
  process.exit(fail.length === 0 ? 0 : 1);
})();
