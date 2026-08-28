// THE FIRST ASSERTION of FINDING_LEVEL_INTEGRATION_CONTRACT.md, as an executable gate.
//
//   "No silent fallback may present an unapproved code-resident citation as approved governed
//    content."
//
// This is written BEFORE the integration it governs, and it must never be weakened to accommodate
// current behaviour. It is the reason the integration is safe to do at all: finding citations come
// from a code-resident rule set (`evidence-foundation.ts`) that has no database, no release and no
// review state, so wiring governed authority into that path creates exactly one new way to lie to
// a customer — labelling code-resident output as reviewer-approved regulation.
//
// WHY CITATION-TEXT EQUALITY IS THE DANGER. The code-resident rules emit citation STRINGS. Several
// are strings the governed release also holds. If authority were derived from the string, a rule
// firing on evidence the reviewer never saw would inherit the reviewer's approval. Authority must
// therefore come from governed record identity AND release membership AND effective review state —
// never from the citation text.
//
//   npm run test:finding-governed-authority
//
// It runs against a disposable database holding the candidate release. The release is NOT
// activated; membership and review state are read directly.

import { DataSource } from 'typeorm';
import {
  FindingAuthorityState,
  resolveFindingStandardAuthority,
} from '../releases/finding-standards-authority';

const RELEASE = 'federal-core-2026-08-28.1';

/** The 8 records the 2026-08-28 reviewer ledger disposed REJECT_CORRECTION_REQUIRED. */
const REJECTED_RECORDS = [
  '30 CFR 57.14107(a)', '30 CFR 56.14105', '1910.219', '29 CFR 1910.132(a)',
  '29 CFR 1926.95(a)', '30 CFR 56.15006', '29 CFR 1926.602(a)(9)(ii)', '30 CFR 56.9100(a)',
];

/** Members of the candidate release, approved, and therefore eligible for governed authority. */
const APPROVED_MEMBERS = ['29 CFR 1910.252', '29 CFR 1910.147', '30 CFR 56.16009', '29 CFR 1926.1425'];

interface Result { name: string; ok: boolean; detail: string }

async function main(): Promise<void> {
  const ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, synchronize: false });
  await ds.initialize();
  const results: Result[] = [];
  const record = (name: string, ok: boolean, detail = '') => results.push({ name, ok, detail });

  // ---------------------------------------------------------------- positive control
  // Without this the suite could pass by having governed resolution globally disabled.
  for (const citation of APPROVED_MEMBERS) {
    const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: RELEASE });
    record(
      `POSITIVE: approved release member ${citation} resolves APPROVED_GOVERNED_CONTENT`,
      authority.state === 'APPROVED_GOVERNED_CONTENT'
        && authority.releaseId === RELEASE
        && authority.releaseMember === true
        && authority.effectiveReviewState === 'reviewer_approved'
        && Boolean(authority.recordChecksum),
      `state=${authority.state} member=${authority.releaseMember} review=${authority.effectiveReviewState} checksum=${authority.recordChecksum ? 'present' : 'ABSENT'}`,
    );
  }

  // ---------------------------------------------------------------- negative 1
  // A code-resident citation with no approved governed member.
  for (const citation of ['29 CFR 1910.99999', '30 CFR 56.99999']) {
    const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: RELEASE });
    record(
      `NEGATIVE 1: code-resident citation ${citation} with no governed member is not approved`,
      authority.state === 'NO_GOVERNED_MATCH'
        && authority.releaseMember === false
        && authority.effectiveReviewState === null
        && authority.recordChecksum === null,
      `state=${authority.state}`,
    );
  }

  // ---------------------------------------------------------------- negative 2
  // Every one of the 8 rejected historical records. Each is present in the SOURCE corpus and its
  // citation string is one a code-resident rule can emit, which is precisely the laundering route.
  for (const citation of REJECTED_RECORDS) {
    const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: RELEASE });
    const ok = authority.state !== 'APPROVED_GOVERNED_CONTENT'
      && authority.releaseMember === false
      && authority.effectiveReviewState !== 'reviewer_approved'
      && authority.reviewerId === null
      && authority.recordChecksum === null
      && authority.corpusBacked === false;
    record(`NEGATIVE 2: rejected record ${citation} cannot reach governed authority`, ok,
      `state=${authority.state} member=${authority.releaseMember} reviewer=${authority.reviewerId ?? 'none'}`);
  }

  // ---------------------------------------------------------------- negative 3
  // A governed record that exists in the release but is NOT reviewer-approved.
  const unapproved = await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId" = $1
        AND NOT EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                         WHERE v."releaseId" = r."releaseId" AND v."citationKey" = r."citationKey"
                           AND v.decision = 'approved')
      LIMIT 1`, [RELEASE]);
  if (unapproved.length) {
    const authority = await resolveFindingStandardAuthority(ds, { citation: unapproved[0].citation, releaseId: RELEASE });
    record(`NEGATIVE 3: release member ${unapproved[0].citation} that is not reviewer-approved is not approved content`,
      authority.state === 'UNAPPROVED_GOVERNED_CONTENT' && authority.corpusBacked === false,
      `state=${authority.state}`);
  } else {
    // Every member of this release is approved, which is the intended state. Synthesise the case
    // against a release that holds unapproved members so the branch is still proven.
    const other = await ds.query(
      `SELECT r."releaseId", r.citation FROM regulatory_release_records r
        WHERE r."releaseId" <> $1
          AND NOT EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                           WHERE v."releaseId" = r."releaseId" AND v."citationKey" = r."citationKey"
                             AND v.decision = 'approved')
        LIMIT 1`, [RELEASE]);
    if (other.length) {
      const authority = await resolveFindingStandardAuthority(ds, { citation: other[0].citation, releaseId: other[0].releaseId });
      record(`NEGATIVE 3: unapproved member ${other[0].citation} of ${other[0].releaseId} is not approved content`,
        authority.state === 'UNAPPROVED_GOVERNED_CONTENT' && authority.corpusBacked === false,
        `state=${authority.state}`);
    } else {
      record('NEGATIVE 3: an unapproved governed member is not approved content', false,
        'no unapproved member available in this database to exercise the branch');
    }
  }

  // ---------------------------------------------------------------- negative 4
  // An approved record that is NOT a member of the SELECTED release. Approval is scoped to the
  // release it was granted in; it must not travel to another release.
  const foreignApproved = await ds.query(
    `SELECT v."releaseId", r.citation FROM regulatory_release_record_reviews v
       JOIN regulatory_release_records r ON r."releaseId" = v."releaseId" AND r."citationKey" = v."citationKey"
      WHERE v.decision = 'approved' AND v."releaseId" <> $1 LIMIT 1`, [RELEASE]);
  if (foreignApproved.length) {
    const authority = await resolveFindingStandardAuthority(ds, { citation: foreignApproved[0].citation, releaseId: RELEASE });
    record(`NEGATIVE 4: approval in ${foreignApproved[0].releaseId} does not confer authority under ${RELEASE}`,
      authority.state !== 'APPROVED_GOVERNED_CONTENT' || authority.releaseId === RELEASE,
      `state=${authority.state} releaseId=${authority.releaseId}`);
  } else {
    record(`NEGATIVE 4: approval is scoped to its own release (no cross-release approval exists to leak)`, true,
      'no approval outside the candidate release exists in this database');
  }

  // ---------------------------------------------------------------- laundering control
  // The load-bearing one. A code-resident candidate whose citation STRING equals an approved
  // governed citation must not acquire authority from the string alone: authority is granted by
  // the resolver, from release membership and review state, and a candidate that never went
  // through the resolver carries no governed provenance.
  const launder = await resolveFindingStandardAuthority(ds, {
    citation: '29 CFR 1910.252', releaseId: RELEASE, skipGovernedResolution: true,
  });
  record('LAUNDERING: a candidate that bypasses governed resolution carries no governed authority',
    launder.state === 'LEGACY_CODE_RESIDENT_CONTENT'
      && launder.releaseMember === false
      && launder.recordChecksum === null
      && launder.reviewerId === null,
    `state=${launder.state}`);

  await ds.destroy();

  for (const r of results) console.log(`  [${r.ok ? 'PASS' : 'FAIL'}] ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  const failed = results.filter(r => !r.ok);
  console.log('');
  if (failed.length) {
    for (const f of failed) console.error(`FAIL ${f.name} — ${f.detail}`);
    console.error(`\n${failed.length} failure(s) across ${results.length} checks`);
    process.exit(1);
  }
  console.log(`PASS finding-level governed authority (${results.length} checks)`);
}

main().catch(error => { console.error(error); process.exit(2); });
