// Finding-level governed standards INTEGRATION gate — Phases 5, 6 and 8.
//
// The companion to `finding-governed-authority.ts`: that one proves the resolver's rules, this one
// proves they survive the trip into a persisted finding, that a persisted finding stays bound to
// the release it was created under, and that resolution is deterministic.
//
//   npm run test:finding-governed-integration
//
// Runs against a disposable database holding BOTH releases. Neither is activated.

import { DataSource } from 'typeorm';
import { annotateFindingStandardsAuthority } from '../../inspection/finding-standards-authority-annotation';
import { resolveFindingStandardAuthority } from '../releases/finding-standards-authority';

const R1 = 'federal-core-2026-07-30.1';   // historical, 35 members, none approved
const R2 = 'federal-core-2026-08-28.1';   // reviewed candidate, 64 members, all approved

const REJECTED = [
  '30 CFR 57.14107(a)', '30 CFR 56.14105', '1910.219', '29 CFR 1910.132(a)',
  '29 CFR 1926.95(a)', '30 CFR 56.15006', '29 CFR 1926.602(a)(9)(ii)', '30 CFR 56.9100(a)',
];

function hazardWith(citations: string[]) {
  return {
    hazardId: 'haz-1', domainId: 'evaluated', hazardFamily: 'evaluated',
    mechanism: 'evaluated hazard', observationFragment: 'an observed condition',
    standardCandidates: citations.map(citation => ({
      citation, family: 'evaluated', status: 'SUPPORTED', confidence: 0.9,
      applicability: 'direct', explanation: 'code-resident predicate matched', missingPredicates: [],
      jurisdictionProvenance: 'USER_CONFIRMED',
    })),
  } as Record<string, unknown>;
}

async function main() {
  const ds = new DataSource({ type: 'postgres', url: process.env.DATABASE_URL, synchronize: false });
  await ds.initialize();
  const manager = ds.manager;
  const failures: string[] = [];
  let checks = 0;
  const check = (ok: boolean, name: string, detail = '') => {
    checks += 1;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
    if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  };

  // ---------------------------------------------------------------- PHASE 5
  console.log('-- Phase 5: the 8 rejected records as adversarial integration fixtures --');
  const rejectedHazard = hazardWith(REJECTED);
  await annotateFindingStandardsAuthority(manager, rejectedHazard, R2);
  const rejectedCandidates = (rejectedHazard as any).standardCandidates as any[];
  for (const candidate of rejectedCandidates) {
    check(
      candidate.authorityState === 'REJECTED_GOVERNED_CONTENT'
        && candidate.governedReleaseMember === false
        && candidate.corpusBacked === false
        && candidate.reviewerId === null
        && candidate.reviewerRole === null
        && candidate.governedRecordChecksum === null
        && candidate.contentDisclosure !== 'GOVERNED_APPROVED',
      `rejected ${candidate.citation} cannot claim governed authority on a persisted finding`,
      `state=${candidate.authorityState} member=${candidate.governedReleaseMember} reviewer=${candidate.reviewerId ?? 'none'}`,
    );
  }
  // Positive control IN THE SAME SUITE, so it cannot pass by governed resolution being disabled.
  const approvedHazard = hazardWith(['29 CFR 1910.252', '29 CFR 1926.1425']);
  await annotateFindingStandardsAuthority(manager, approvedHazard, R2);
  for (const candidate of (approvedHazard as any).standardCandidates as any[]) {
    check(
      candidate.authorityState === 'APPROVED_GOVERNED_CONTENT'
        && candidate.governedReleaseMember === true
        && candidate.corpusBacked === true
        && Boolean(candidate.governedRecordChecksum)
        && Boolean(candidate.reviewerId)
        && candidate.contentDisclosure === 'GOVERNED_APPROVED',
      `approved ${candidate.citation} DOES carry governed authority (positive control)`,
      `state=${candidate.authorityState}`,
    );
  }
  // Laundering: identical citation strings, no governing release.
  const launderHazard = hazardWith(['29 CFR 1910.252', '29 CFR 1926.1425']);
  await annotateFindingStandardsAuthority(manager, launderHazard, null);
  check(
    (launderHazard as any).standardCandidates.every((c: any) =>
      c.authorityState === 'LEGACY_CODE_RESIDENT_CONTENT' && c.corpusBacked === false
      && c.reviewerId === null && c.governedRecordChecksum === null),
    'identical citation STRINGS with no governing release stay legacy — string equality confers nothing',
  );

  // ---------------------------------------------------------------- PHASE 6
  console.log('\n-- Phase 6: inspection release binding --');
  // A finding created under R1 keeps R1's authority after R2 exists. R2 already exists in this
  // database, so this is the exact "another release became available" condition.
  const boundToR1 = hazardWith(['1910.219', '29 CFR 1910.147']);
  await annotateFindingStandardsAuthority(manager, boundToR1, R1);
  const r1Snapshot = JSON.parse(JSON.stringify((boundToR1 as any).standardCandidates));
  check(r1Snapshot.every((c: any) => c.governedReleaseId === R1),
    'a finding created under R1 records R1 as its governing release');
  check(r1Snapshot.find((c: any) => c.citation === '1910.219')?.authorityState === 'UNAPPROVED_GOVERNED_CONTENT',
    'under R1, 1910.219 is an UNAPPROVED member — not approved, not rejected');

  const boundToR2 = hazardWith(['1910.219', '29 CFR 1910.147']);
  await annotateFindingStandardsAuthority(manager, boundToR2, R2);
  const r2Candidates = (boundToR2 as any).standardCandidates as any[];
  check(r2Candidates.find(c => c.citation === '1910.219')?.authorityState === 'REJECTED_GOVERNED_CONTENT',
    'under R2 the SAME citation is REJECTED — authority is release-scoped, not citation-scoped');
  check(r2Candidates.find(c => c.citation === '29 CFR 1910.147')?.authorityState === 'APPROVED_GOVERNED_CONTENT',
    'under R2 an approved member resolves approved');
  check(JSON.stringify(r1Snapshot) === JSON.stringify((boundToR1 as any).standardCandidates),
    'the R1 finding was NOT rewritten when the same hazard was resolved under R2');

  // ---------------------------------------------------------------- PHASE 8
  console.log('\n-- Phase 8: determinism --');
  const runs: string[] = [];
  for (let i = 0; i < 3; i += 1) {
    const hazard = hazardWith(['29 CFR 1910.252', '1910.219', '29 CFR 1910.99999']);
    await annotateFindingStandardsAuthority(manager, hazard, R2);
    runs.push(JSON.stringify((hazard as any).standardCandidates));
  }
  check(runs[0] === runs[1] && runs[1] === runs[2],
    'identical input, jurisdiction, release and ledger resolve identically across three runs');

  const direct = await resolveFindingStandardAuthority(ds, { citation: '29 CFR 1910.252', releaseId: R2 });
  const again = await resolveFindingStandardAuthority(ds, { citation: '29 CFR 1910.252', releaseId: R2 });
  check(JSON.stringify(direct) === JSON.stringify(again), 'the resolver itself is deterministic');
  check(Boolean(direct.recordChecksum) && direct.releaseId === R2,
    'the authority state is reconstructable later from releaseId + recordChecksum',
    `${direct.releaseId} / ${String(direct.recordChecksum).slice(0, 12)}…`);

  await ds.destroy();
  console.log('');
  if (failures.length) {
    for (const f of failures) console.error(`FAIL ${f}`);
    console.error(`\n${failures.length} failure(s) across ${checks} checks`);
    process.exit(1);
  }
  console.log(`PASS finding-level governed integration (${checks} checks)`);
}

main().catch(error => { console.error(error); process.exit(2); });
