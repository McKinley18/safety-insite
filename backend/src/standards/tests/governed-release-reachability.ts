// GOVERNED RELEASE REACHABILITY — every approved member, every rejected record. 2026-08-28.
//
//   npm run test:governed-release-reachability
//
// WHY THIS EXISTS SEPARATELY FROM THE HAZARD CORPUS. The 43-case HazLenz floor exercises the
// citations its observations happen to reach — roughly a dozen. Passing it says nothing about the
// other fifty regulations a reviewer approved, and the temptation it creates is the wrong one:
// inventing hazards so that all 64 regulations get "covered". That would corrupt the hazard corpus
// to measure something that is not about hazards at all.
//
// So this gate measures GOVERNANCE REACHABILITY, not hazard coverage. For each of the 64 approved
// members it asks a question the hazard corpus cannot: *if* retrieval selected this record under
// this release, would the authority resolver be able to reach APPROVED_GOVERNED_CONTENT, and can
// the claim be reconstructed later from the release id and the record checksum? And for each of
// the 8 rejected records it asks the adversarial converse.
//
// NOTHING HERE FABRICATES A HAZARD, and nothing here asserts that a customer will ever cite these
// regulations. Whether a regulation is ever SELECTED is an applicability question the hazard corpus
// and the coverage matrix own.

import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { dataSource } from '../../database/data-source';
import { loadReleaseDefinition } from '../releases/release-definition';
import { releaseCitationKey } from '../releases/citation-identity';
import { resolveFindingStandardAuthority } from '../releases/finding-standards-authority';
import { pinGovernedRelease, resolveGoverned } from '../cutover/governed-resolution';
import { computeSnapshotManifest } from '../releases/release-manifest';

const CANDIDATE = 'federal-core-2026-08-28.1';

/**
 * The 8 records the 2026-08-28 reviewer ledger disposed REJECT_CORRECTION_REQUIRED. Held here as a
 * literal, deliberately: they are the adversarial fixtures, and deriving them from the database
 * would let a database that had quietly admitted one of them produce an empty adversarial set.
 */
const REJECTED = [
  '30 CFR 57.14107(a)', '30 CFR 56.14105', '1910.219', '29 CFR 1910.132(a)',
  '29 CFR 1926.95(a)', '30 CFR 56.15006', '29 CFR 1926.602(a)(9)(ii)', '30 CFR 56.9100(a)',
];

interface MemberResult {
  citation: string;
  citationKey: string;
  member: boolean;
  effectiveReviewState: string | null;
  releaseId: string | null;
  recordChecksum: string | null;
  checksumReconstructed: boolean;
  usableContent: boolean;
  authorityState: string;
  reachesApproved: boolean;
}

async function main() {
  const ds: DataSource = await dataSource.initialize();
  const failures: string[] = [];
  let checks = 0;
  const check = (ok: boolean, name: string, detail = '') => {
    checks += 1;
    if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  };

  const definition = loadReleaseDefinition(CANDIDATE);
  const members = definition.members ?? [];
  console.log(`-- ${members.length} approved members declared by the version-controlled definition --`);

  const pin = await pinGovernedRelease(ds, 'GOVERNED_WITH_FALLBACK', CANDIDATE);
  if (pin.releaseId !== CANDIDATE) {
    console.error(`Refusing to run: the pin resolved ${pin.releaseId} rather than ${CANDIDATE}.`);
    process.exit(1);
  }

  // The record checksums as they stand in the immutable snapshot, so "reconstructable" means
  // recomputed from the release, not copied out of the resolver's own answer.
  const snapshotRows: Array<{ citationKey: string; recordChecksum: string; payload: any; citation: string; agencyCode: string | null }> =
    await ds.query(
      `SELECT "citationKey", "recordChecksum", payload, citation, "agencyCode"
         FROM regulatory_release_records WHERE "releaseId" = $1`, [CANDIDATE],
    );
  const byKey = new Map(snapshotRows.map(row => [row.citationKey, row]));

  const memberResults: MemberResult[] = [];
  for (const member of members) {
    const citation = member.citation;
    const key = releaseCitationKey(citation);
    const snapshot = byKey.get(key);
    const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: CANDIDATE });
    const governed = await resolveGoverned(ds, pin, citation);
    const usableContent = Boolean(
      String(snapshot?.payload?.summary || '').trim() || String(snapshot?.payload?.canonicalText || '').trim(),
    );
    const result: MemberResult = {
      citation, citationKey: key,
      member: Boolean(snapshot),
      effectiveReviewState: authority.effectiveReviewState,
      releaseId: authority.releaseId,
      recordChecksum: authority.recordChecksum,
      checksumReconstructed: Boolean(snapshot) && authority.recordChecksum === snapshot!.recordChecksum,
      usableContent,
      authorityState: authority.state,
      reachesApproved: authority.state === 'APPROVED_GOVERNED_CONTENT',
    };
    memberResults.push(result);

    check(result.member, `${citation}: is a member of ${CANDIDATE}`);
    check(result.effectiveReviewState === 'reviewer_approved',
      `${citation}: effective review state is reviewer_approved`, String(result.effectiveReviewState));
    check(result.releaseId === CANDIDATE, `${citation}: resolves under the correct release`);
    check(result.checksumReconstructed,
      `${citation}: record checksum is reconstructable from the immutable snapshot`);
    check(result.usableContent, `${citation}: carries usable governed regulatory content`);
    check(result.reachesApproved,
      `${citation}: authority resolution reaches APPROVED_GOVERNED_CONTENT`, result.authorityState);
    check(governed.releaseId === CANDIDATE && governed.backing === 'APPROVED_EXACT',
      `${citation}: release-scoped retrieval resolves it as APPROVED_EXACT`, governed.backing);
  }

  const reachable = memberResults.filter(m => m.reachesApproved).length;
  console.log(`   approved members reaching APPROVED_GOVERNED_CONTENT: ${reachable}/${members.length}`);

  // The manifest must still fold to the pinned identity after every one of those reads.
  const manifest = computeSnapshotManifest(
    [...snapshotRows].sort((a, b) =>
      String(a.agencyCode ?? '').localeCompare(String(b.agencyCode ?? '')) || a.citation.localeCompare(b.citation)),
  );
  check(manifest.manifestChecksum === definition.expectedManifestChecksum,
    'the release still folds to the manifest its definition pins', manifest.manifestChecksum);
  check(manifest.recordCount === definition.expectedRecordCount,
    'the release still holds the declared number of records', String(manifest.recordCount));

  console.log(`\n-- ${REJECTED.length} rejected records, adversarially --`);
  const rejectedResults: Record<string, unknown> = {};
  for (const citation of REJECTED) {
    const key = releaseCitationKey(citation);
    const authority = await resolveFindingStandardAuthority(ds, { citation, releaseId: CANDIDATE });
    const governed = await resolveGoverned(ds, pin, citation);
    const snapshot = byKey.get(key);
    rejectedResults[citation] = {
      member: Boolean(snapshot), authorityState: authority.state,
      reviewerId: authority.reviewerId, recordChecksum: authority.recordChecksum,
      backing: governed.backing, corpusBacked: authority.corpusBacked,
    };
    check(!snapshot, `${citation}: is NOT a member of the release`);
    check(authority.state !== 'APPROVED_GOVERNED_CONTENT',
      `${citation}: cannot reach approved governed content`, authority.state);
    check(authority.reviewerId === null && authority.reviewerRole === null,
      `${citation}: inherits no reviewer identity`);
    check(authority.recordChecksum === null, `${citation}: inherits no checksum provenance`);
    check(authority.corpusBacked === false, `${citation}: is never corpusBacked`);
    check(governed.backing !== 'APPROVED_EXACT',
      `${citation}: release-scoped retrieval refuses it`, governed.backing);
    // Citation-string laundering, per record.
    const laundered = await resolveFindingStandardAuthority(ds, { citation, releaseId: null });
    check(laundered.state === 'LEGACY_CODE_RESIDENT_CONTENT' && laundered.reviewerId === null,
      `${citation}: the citation STRING alone confers nothing`, laundered.state);
    // The approval ledger must hold no approved decision naming it, in ANY release.
    const decisions = await ds.query(
      `SELECT "releaseId", decision FROM regulatory_release_record_reviews
        WHERE "citationKey" = $1 AND decision = 'approved'`, [key],
    );
    check(decisions.length === 0,
      `${citation}: no approved reviewer decision names it in any release`,
      JSON.stringify(decisions));
  }

  const summary = {
    releaseId: CANDIDATE,
    manifestChecksum: manifest.manifestChecksum,
    declaredMembers: members.length,
    membersReachingApproved: reachable,
    rejectedRecordsProbed: REJECTED.length,
    rejectedReachingApproved: Object.values(rejectedResults)
      .filter((r: any) => r.authorityState === 'APPROVED_GOVERNED_CONTENT').length,
    checks,
    failures,
    approvedMembers: memberResults,
    rejectedRecords: rejectedResults,
  };
  if (process.env.REACHABILITY_EVIDENCE_OUT) {
    require('fs').writeFileSync(process.env.REACHABILITY_EVIDENCE_OUT, JSON.stringify(summary, null, 2));
  }
  await ds.destroy();

  console.log('');
  console.log(`GOVERNED RELEASE REACHABILITY: ${checks - failures.length}/${checks} checks passed`);
  console.log(`  approved members reachable: ${reachable}/${members.length}`);
  console.log(`  rejected records reaching approval: ${summary.rejectedReachingApproved}/${REJECTED.length} (must be 0)`);
  if (failures.length) {
    console.error('\nFAILURES:');
    for (const failure of failures.slice(0, 40)) console.error(`  - ${failure}`);
    if (failures.length > 40) console.error(`  ... and ${failures.length - 40} more`);
    process.exit(1);
  }
}

void join; void readFileSync;
main().catch(error => { console.error(error); process.exit(1); });
