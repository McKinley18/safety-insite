import 'dotenv/config';
import 'reflect-metadata';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import { prepareGovernedRelease } from '../src/standards/releases/governed-release-builder';
import { loadReleaseDefinition } from '../src/standards/releases/release-definition';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';

/**
 * KG-5B -- approval continuity and Stage-1 approval scope (Phases 11, 12).
 *
 * THE QUESTION THIS ANSWERS. KG-5A produced a production review packet recommending 27 REATTEST
 * and 8 NEW_REVIEW_REQUIRED. Those recommendations are anchored to specific `recordChecksum` and
 * `approvalDigest` values -- a reviewer re-attesting is attesting that the content is provably
 * identical to what the recorded KG-3D/3E/4A comparison covered. If KG-5B's architecture moved ANY
 * of those identities, every REATTEST recommendation would be void and 35 fresh clause-by-clause
 * reviews would be required.
 *
 * So this suite compares, field by field, the release KG-5B constructs against the release KG-5A
 * measured. Not just the manifest: the payload, both approval axes, the composed approval digest,
 * the frozen approval payload and the snapshot review state.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5b-approval-continuity';
const TEMPLATE = process.env.KG5B_TEMPLATE_DB || 'test_kg5b_prodshape_20260821';
const ADMIN_URL = process.env.KG5B_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const EVIDENCE = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5b/contracts');
const PACKET = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5a/contracts/production-release-review-packet.json');

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

let passed = 0; let failed = 0; const failures: string[] = [];
function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) { passed++; return; }
  failed++;
  const line = `${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`;
  failures.push(line); console.log(`  FAIL  ${line}`);
}
function section(title: string): void {
  console.log(`\n${title}`); console.log('-'.repeat(title.length));
}
async function admin(sql: string): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try { await client.query(sql); } finally { await client.end(); }
}

/** Recursively sorted JSON, so a jsonb key-order difference is not read as a content difference. */
function canonical(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>).sort()
      .map(k => `${JSON.stringify(k)}:${canonical((value as any)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function main() {
  console.log('KG-5B -- approval continuity and Stage-1 approval scope');

  const database = 'test_kg5b_mut_approval';
  await admin(`DROP DATABASE IF EXISTS ${database}`);
  await admin(`CREATE DATABASE ${database} TEMPLATE ${TEMPLATE}`);
  const url = ADMIN_URL.replace(/\/[^/]*$/, `/${database}`);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });

  const ds = new DataSource({
    type: 'postgres', url, synchronize: false,
    entities: [RegulatoryRelease, RegulatoryReleaseRecord, RegulatoryReleaseRecordReview,
      KnowledgeReleaseEvent],
  });
  await ds.initialize();

  try {
    const definition = loadReleaseDefinition(RELEASE_ID);
    await prepareGovernedRelease(ds, definition);

    const built = await ds.query(
      `SELECT "agencyCode", citation, "citationKey", "recordChecksum", "reviewState",
              "reviewStateReason", payload, "approvalContractVersion", "substantiveContentDigest",
              "sourceIdentityDigest", "approvalDigest", "approvalPayload"
       FROM regulatory_release_records WHERE "releaseId" = $1 ORDER BY "agencyCode", citation`,
      [RELEASE_ID]);
    const reference = JSON.parse(
      readFileSync(join(EVIDENCE, 'kg5a-reference-release-records.json'), 'utf8'));

    section('1. Per-record identity continuity against the KG-5A release (Phase 11)');
    check('same record count', built.length === reference.length,
      { built: built.length, reference: reference.length });

    const fields = ['agencyCode', 'citation', 'citationKey', 'recordChecksum', 'reviewState',
      'reviewStateReason', 'approvalContractVersion', 'substantiveContentDigest',
      'sourceIdentityDigest', 'approvalDigest'] as const;
    const moved: Record<string, string[]> = {};
    for (const field of fields) moved[field] = [];
    const payloadMoved: string[] = [];
    const approvalPayloadMoved: string[] = [];

    for (let index = 0; index < Math.min(built.length, reference.length); index++) {
      const a = built[index]; const b = reference[index];
      for (const field of fields) {
        if (a[field] !== b[field]) moved[field].push(`${b.citation}: ${b[field]} -> ${a[field]}`);
      }
      if (canonical(a.payload) !== canonical(b.payload)) payloadMoved.push(b.citation);
      if (canonical(a.approvalPayload) !== canonical(b.approvalPayload)) {
        approvalPayloadMoved.push(b.citation);
      }
    }
    for (const field of fields) {
      check(`no record moved its ${field}`, moved[field].length === 0, moved[field].slice(0, 5));
    }
    check('no record moved its frozen manifest payload', payloadMoved.length === 0, payloadMoved);
    check('no record moved its frozen approval payload', approvalPayloadMoved.length === 0,
      approvalPayloadMoved);

    section('2. The KG-5A review packet still applies unchanged (Phase 11)');
    const packet = JSON.parse(readFileSync(PACKET, 'utf8'));
    const packetRows: any[] = packet.rows ?? [];
    check('the KG-5A review packet was readable and holds 35 rows', packetRows.length === 35,
      packetRows.length);

    const builtByCitation = new Map(built.map((r: any) => [r.citation, r]));
    const checksumField = 'recordChecksum';
    const decisionField = 'recommendedDecision';
    check('the packet carries a per-record checksum field',
      packetRows.every(row => /^[0-9a-f]{64}$/.test(String(row[checksumField]))));
    check('the packet carries a per-record recommendation field',
      packetRows.every(row => !!row[decisionField]));

    const packetMismatches: string[] = [];
    const decisions: Record<string, number> = {};
    for (const row of packetRows) {
      const citation = row.citation ?? row.Citation;
      const record = builtByCitation.get(citation) as any;
      if (!record) { packetMismatches.push(`${citation}: not in the KG-5B release`); continue; }
      if (row[checksumField] !== record.recordChecksum) {
        packetMismatches.push(
          `${citation}: recordChecksum packet ${row[checksumField]} vs built ${record.recordChecksum}`);
      }
      if (row.approvalDigest !== record.approvalDigest) {
        packetMismatches.push(`${citation}: approvalDigest moved`);
      }
      if (row.substantiveContentDigest !== record.substantiveContentDigest) {
        packetMismatches.push(`${citation}: substantiveContentDigest moved`);
      }
      if (row.sourceIdentityDigest !== record.sourceIdentityDigest) {
        packetMismatches.push(`${citation}: sourceIdentityDigest moved`);
      }
      const decision = String(row[decisionField]);
      decisions[decision] = (decisions[decision] ?? 0) + 1;
    }
    check('every packet row still names a record the KG-5B release contains, at the same checksum',
      packetMismatches.length === 0, packetMismatches.slice(0, 5));
    check('the recommendation split is unchanged: 27 REATTEST, 8 NEW_REVIEW_REQUIRED',
      decisions.REATTEST === 27 && decisions.NEW_REVIEW_REQUIRED === 8, decisions);
    check('no record is recommended for exclusion',
      !decisions.EXCLUDE_FROM_INITIAL_RELEASE && !decisions.EXCLUDE, decisions);

    section('3. Stage-1 approval scope (Phase 12)');
    // The question: must all 35 be approved before Stage-1 SHADOW? Answered by MEASURING the
    // gate, not by reading its comment -- and without lowering it.
    const lifecycle = new RegulatoryReleaseLifecycleService(ds);
    const reviews = new ReleaseRecordReviewService(ds);

    const reattestCitations = packetRows
      .filter(row => String(row[decisionField]) === 'REATTEST')
      .map(row => row.citation ?? row.Citation);
    check('the packet names exactly 27 REATTEST citations', reattestCitations.length === 27,
      reattestCitations.length);

    const beforeAnyApproval = await lifecycle.evaluateActivation(RELEASE_ID, ['provisional']);
    check('with zero approvals, activation is refused on governedRecordsPresent',
      !beforeAnyApproval.eligible
      && beforeAnyApproval.failedGates.includes('governedRecordsPresent'),
      beforeAnyApproval.failedGates);

    // Approve the 27 REATTEST records, one at a time, each against its exact checksum -- the only
    // approval path that exists. Nothing is imported and nothing is bulk-approved.
    let refusedOnWrongChecksum = false;
    try {
      await reviews.approveRecord({
        releaseId: RELEASE_ID, citation: reattestCitations[0],
        expectedChecksum: 'c'.repeat(64), reviewerId: 'kg5b-verification-reviewer',
      });
    } catch { refusedOnWrongChecksum = true; }
    check('approval is refused when the reviewer names the wrong checksum', refusedOnWrongChecksum);

    for (const citation of reattestCitations) {
      const record = builtByCitation.get(citation) as any;
      await reviews.approveRecord({
        releaseId: RELEASE_ID, citation,
        expectedChecksum: record.recordChecksum,
        reviewerId: 'kg5b-verification-reviewer', reviewerRole: 'verification',
        note: 'KG-5B Phase 12 scope measurement.',
      });
    }

    const scope = await lifecycle.describeReleaseScope(RELEASE_ID);
    check('27 of 35 records are reviewer-approved', scope.governedRecords === 27,
      scope.governedRecords);
    check('the remaining 8 are NOT approved', scope.totalRecords - scope.governedRecords === 8);

    const partial = await lifecycle.evaluateActivation(RELEASE_ID, ['provisional']);
    check('activation passes all eight gates with 27 of 35 approved', partial.eligible,
      partial.failedGates);
    check('the governedRecordsPresent gate was NOT lowered to reach this',
      partial.gates.find(g => g.key === 'governedRecordsPresent')?.detail
        .startsWith('27 of 35 snapshot records are reviewer-approved') === true,
      partial.gates.find(g => g.key === 'governedRecordsPresent')?.detail);

    // The approval identities are truthful: each approval names the record's own approvalDigest.
    const approvals = await ds.query(
      `SELECT r.citation, r."approvalDigest" AS record_digest, v."approvalDigest" AS review_digest,
              v."approvalContractVersion" AS version, v."reviewerId"
       FROM regulatory_release_record_reviews v
       JOIN regulatory_release_records r
         ON r."releaseId" = v."releaseId" AND r."citationKey" = v."citationKey"
       WHERE v."releaseId" = $1 AND v.decision = 'approved'`, [RELEASE_ID]);
    check('every recorded approval is approval contract v2',
      approvals.length === 27 && approvals.every((a: any) => a.version === 2),
      { count: approvals.length });
    check('every recorded approval names the record\'s own approval digest',
      approvals.every((a: any) => a.review_digest === a.record_digest));
    check('every recorded approval names a reviewer',
      approvals.every((a: any) => !!a.reviewerId));

    const evidence = {
      releaseId: RELEASE_ID,
      recordCount: built.length,
      manifestChecksum: definition.expectedManifestChecksum,
      identityContinuityWithKg5a: {
        recordChecksumMoved: moved.recordChecksum.length,
        substantiveContentDigestMoved: moved.substantiveContentDigest.length,
        sourceIdentityDigestMoved: moved.sourceIdentityDigest.length,
        approvalDigestMoved: moved.approvalDigest.length,
        manifestPayloadMoved: payloadMoved.length,
        approvalPayloadMoved: approvalPayloadMoved.length,
      },
      reviewPacket: { decisions, mismatches: packetMismatches.length },
      stage1ApprovalScope: {
        approvedRecords: scope.governedRecords,
        totalRecords: scope.totalRecords,
        unapprovedRecords: scope.totalRecords - scope.governedRecords,
        activationEligibleWithPartialApproval: partial.eligible,
        gateThresholdChanged: false,
      },
    };
    require('fs').writeFileSync(
      join(EVIDENCE, 'approval-continuity.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`\nevidence -> ${join(EVIDENCE, 'approval-continuity.json')}`);

  } finally {
    await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${database}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5B approval continuity: ${passed}/${passed + failed} checks passed`);
  if (failed) {
    console.log(`\n${failed} FAILED:`);
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
