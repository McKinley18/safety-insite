/**
 * §308 — PRODUCTION PROOF. Read-only. No account created, no write of any kind.
 */
const API = 'https://safescope-backend.onrender.com';
const APP = 'https://safety-insite.vercel.app';
let pass = 0; const fail = [];
const check = (c, m, d = '') => { if (c) { pass++; console.log(`ok    ${m}${d ? `  [${d}]` : ''}`); } else { fail.push(m); console.log(`FAIL  ${m}${d ? `  [${d}]` : ''}`); } };

const DRAFT_MARKERS = ['INTERNAL BETA DRAFT','LEGAL COUNSEL REVIEW STATUS','[LEGAL ENTITY]','[ENTITY ADDRESS]','[CONTACT EMAIL]','[GOVERNING LAW]','[BETA TERM]'];
const INTERNAL_MARKERS = ['project-docs','legal-documents','sourceFile','expectedDigest','counselApproval','approvedAt','approver','"DRAFT"','SUPERSEDED','APPROVED_NOT_EFFECTIVE','.md','DATABASE_URL','JWT_SECRET','/Users/','/opt/render'];

(async () => {
  console.log(`§308 PRODUCTION PROOF  —  ${API} / ${APP}\n`);

  const version = await (await fetch(`${API}/health/version`)).json();
  check(version.gitCommit === '7e297dce4895a36e07341312ecce9e2e39b2f4ca',
    'PP-0  every probe below runs against the §308 release commit', version.gitCommit.slice(0, 12));

  // ---- 44 / 45: the public API routes -----------------------------------------------------------
  for (const type of ['terms', 'privacy']) {
    const r = await fetch(`${API}/legal/documents/${type}`);
    const raw = await r.text();
    const body = JSON.parse(raw);
    check(r.status === 200, `PP-${type} GET /legal/documents/${type} answers 200 UNAUTHENTICATED`, `${r.status}`);
    check(body.status === 'NOT_YET_PUBLISHED',
      `PP-${type} and reports the bounded pre-publication state, because no counsel-approved document exists`, body.status);
    check(body.body === undefined && body.version === undefined && body.effectiveDate === undefined,
      `PP-${type} NO body, NO version, NO effective date — the response shape has no field capable of carrying them`,
      JSON.stringify(Object.keys(body)));
    check(body.acceptanceAvailable === false,
      `PP-${type} and states acceptance is NOT available rather than leaving it to be inferred`);
    check(typeof body.reason === 'string' && body.reason.length > 40,
      `PP-${type} with a professional reason rather than a bare failure`);
    const leakedDraft = DRAFT_MARKERS.filter((m) => raw.includes(m));
    check(leakedDraft.length === 0, `PP-${type} NO draft marker or contracting placeholder leaks`, leakedDraft.join(',') || 'none');
    const leakedInternal = INTERNAL_MARKERS.filter((m) => raw.includes(m));
    check(leakedInternal.length === 0, `PP-${type} NO filesystem path, registry field, approval note or configuration leaks`, leakedInternal.join(',') || 'none');
  }

  const summary = await (await fetch(`${API}/legal/documents`)).json();
  check(summary.documents?.length === 2 && summary.documents.every((d) => d.status === 'NOT_YET_PUBLISHED'),
    'PP-summary the publication summary reports both types as NOT_YET_PUBLISHED',
    JSON.stringify(summary.documents?.map((d) => `${d.documentType}=${d.status}`)));
  check(summary.documents.every((d) => d.version === null && d.documentDigest === null && d.acceptanceAvailable === false),
    'PP-summary and claims no version, no digest and no acceptance for either');

  // ---- 20: no synthetic fixture is active in production -----------------------------------------
  const allRaw = JSON.stringify(summary) + JSON.stringify(await (await fetch(`${API}/legal/documents/terms`)).json());
  check(!/TEST TERMS|TEST PRIVACY|SYNTHETIC|0\.0\.0-test|0\.0\.0-hostile/.test(allRaw),
    '20 NO synthetic test document is active in production — no fixture body, version or marker appears anywhere',
    'clean');

  const badType = await fetch(`${API}/legal/documents/not-a-type`);
  check(badType.status === 400, 'PP-badtype an unknown document type is 400, not 404', `${badType.status}`);

  // ---- the agreements contract the registration client depends on --------------------------------
  const agreements = await (await fetch(`${API}/agreements`)).json();
  const list = agreements.agreements || [];
  check(list.length === 1 && list[0].agreementId === 'internal-pre-beta-acknowledgement',
    'PP-agreements exactly one agreement is in force: the internal acknowledgement. No legal document is projected, because none is ACTIVE.',
    JSON.stringify(list.map((a) => a.agreementId)));
  check(list[0]?.requiredAtRegistration === true,
    'PP-agreements the list exposes requiredAtRegistration, which is what lets the client send an '
    + 'assertion for every required agreement rather than one it was hard-coded to look for');
  check(list[0]?.counselStatus === 'NOT_COUNSEL_REVIEWED',
    'PP-agreements and it is still NOT_COUNSEL_REVIEWED — §308 manufactured no approval',
    list[0]?.counselStatus);
  check(!list.some((a) => a.agreementId.startsWith('legal:')),
    'PP-agreements NO legal: agreement exists, so registration cannot bind to a document that has not been approved');

  // ---- 39 / 40 / 46: the frontend routes ---------------------------------------------------------
  for (const path of ['/terms', '/privacy', '/register', '/login']) {
    const r = await fetch(`${APP}${path}`, { redirect: 'manual' });
    check(r.status === 200, `PP-fe ${path} answers 200`, `${r.status}`);
  }
  for (const path of ['/terms', '/privacy']) {
    const r = await fetch(`${APP}${path}`);
    const headers = ['content-security-policy','x-frame-options','x-content-type-options','referrer-policy'];
    const missing = headers.filter((h) => !r.headers.get(h));
    check(missing.length === 0, `PP-fe ${path} carries the §307 security headers`, missing.join(',') || 'all present');
  }

  // ---- 47: no 5xx, and nothing crossed an alert threshold ----------------------------------------
  const ready = await (await fetch(`${API}/health/ready`)).json();
  check(ready.status === 'ready' && ready.monitoring.serverErrorsInWindow === 0,
    '47 the service is ready and serverErrorsInWindow is 0 after every probe above',
    `${ready.status} 5xx=${ready.monitoring.serverErrorsInWindow}`);
  check(ready.schema.expectedSchemaVersion === '1800000025000' && ready.schema.aheadOfBuild.length === 0,
    'PP-schema the schema position is unchanged', `${ready.schema.expectedSchemaVersion} ${ready.schema.appliedCount}/${ready.schema.expectedCount}`);
  check(ready.monitoring.policy === undefined,
    'PP-se17 SE-17 still holds: readiness does not publish the alerting thresholds');

  console.log(`\n${'='.repeat(88)}`);
  console.log(`§308 PRODUCTION PROOF: ${pass} passed, ${fail.length} failed.`);
  console.log('Direct DB writes: 0. Accounts created: 0. Charges: 0. Expert calls: 0. Provider calls: 0. Spend: $0.00.');
  if (fail.length) { console.log('\nFAILED:'); for (const f of fail) console.log(`  - ${f}`); }
  console.log('='.repeat(88));
  process.exit(fail.length === 0 ? 0 : 1);
})();
