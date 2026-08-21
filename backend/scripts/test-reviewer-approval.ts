/**
 * KG-3B -- reviewer approval: provenance, checksum binding, change semantics, revocation,
 * and activation-gate integration.
 *
 * Proves the properties the approval mechanism exists to guarantee:
 *
 *   Phase 5   a stale review (content changed after the reviewer read it) is REFUSED
 *   Phase 6   a changed version does NOT inherit the prior version's approval
 *   Phase 6   identical content does NOT silently carry approval forward
 *   Phase 6   revocation is possible and does NOT erase the record of prior approval
 *   Phase 8   approval metadata does NOT invalidate the immutable content checksum
 *   Phase 10  the KG-2 activation gate consumes the corrected approval model
 *
 * Runs entirely against a disposable database and drives the real finalizer as a child process,
 * so the production finalization path is what is under test.
 *
 * PHASE 20 -- WHAT THIS SUITE DOES NOT ESTABLISH. The approvals recorded here are TEST FIXTURES.
 * They prove the workflow is sound. They are not, and must never be read as, substantive
 * regulatory review of the real 26-record corpus, which remains 0/26 approved.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { dataSource } from '../src/database/data-source';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import {
  CARRY_FORWARD_ON_IDENTICAL_CONTENT,
  ReleaseRecordReviewRefused,
  ReleaseRecordReviewService,
} from '../src/standards/releases/release-record-review.service';
import { claimDatabaseOwnership, DatabaseOwnershipRefused } from './lib/test-database-ownership';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
  console.log(`ok  ${message}`);
}

async function refuses(fn: () => Promise<unknown>, gate: string, message: string) {
  try {
    await fn();
  } catch (error) {
    if (error instanceof ReleaseRecordReviewRefused) {
      assert(error.failedGates.includes(gate as any),
        `${message} (failed gate: ${error.failedGates.join(', ')})`);
      return;
    }
    throw error;
  }
  throw new Error(`FAILED: expected a refusal on gate '${gate}': ${message}`);
}

const REVIEWER = 'kg3b-fixture-reviewer';
const ROLE = 'regulatory-analyst';
/** An OSHA General Industry citation present in the seeded corpus with a registered source. */
const CITATION = '1910.212(a)(1)';
/** The same logical standard with its agency prefix -- must resolve to the same record. */
const CITATION_PREFIXED = '29 CFR 1910.212(a)(1)';

function finalize(releaseId: string, version: string) {
  const out = execFileSync('npx',
    ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'],
    {
      env: { ...process.env, REGULATORY_RELEASE_ID: releaseId, REGULATORY_RELEASE_VERSION: version },
      stdio: 'pipe',
    }).toString();
  return JSON.parse(out.trim().split('\n').filter(Boolean).pop() || '{}');
}


/**
 * KG-3E. This suite's placeholder-provenance assertions used to find their subject by querying the
 * REAL corpus for a row whose source_key was still `starter-unverified:`. That worked only because
 * the corpus contained unprovenanced records. KG-3E Phase 6 remediated the last three, so the query
 * returns nothing and the assertions could no longer run at all.
 *
 * The contract being tested -- placeholder provenance NEVER confers backing, even when the legacy
 * `reviewer_approved` boolean is set -- is unchanged and still worth enforcing. What was wrong was
 * sourcing its fixture from production data: the test depended on the corpus having a defect, so
 * fixing the defect silently disabled the test. This inserts a fixture the suite owns instead.
 *
 * The row carries source_key NULL, so finalization synthesizes a `starter-unverified:` key for it
 * exactly as it did for the real placeholders. The citation is deliberately outside any real CFR
 * numbering so it can never collide with corpus content.
 */
const PLACEHOLDER_FIXTURE_CITATION = '99 CFR 9999.1(a)';
async function installPlaceholderFixture() {
  await dataSource.query(
    `INSERT INTO standards_master (agency_code, citation, title, standard_text,
       plain_language_summary, scope_code, source_key, authority_tier, is_active)
     VALUES ('OSHA', $1, 'KG-3E placeholder fixture (not a real standard)',
       'Fixture row with no registered source, used to prove placeholder provenance never confers backing.',
       'Fixture row with no registered source.', 'general_industry', NULL, 1, true)
     ON CONFLICT DO NOTHING`, [PLACEHOLDER_FIXTURE_CITATION]);
}

async function main() {
  // KG-4D Phase 20. This suite mutates release/review state, so it must prove the database is its
  // OWN before its first write -- a `test_*` name is a floor, not ownership. An unmarked database
  // is refused; claiming one requires KG_TEST_DB_INITIALIZE_OWNERSHIP naming it exactly.
  try {
    const claim = await claimDatabaseOwnership({ suite: 'test:reviewer-approval' });
    console.log(`[db-ownership] suite=${claim.suite} database=${claim.database} claim=${claim.freshlyClaimed ? 'NEW' : 'RECLAIMED'}`);
  } catch (error) {
    if (error instanceof DatabaseOwnershipRefused) {
      console.error(`\n  ${error.message}\n  No mutation was attempted.\n`);
      process.exit(1);
    }
    throw error;
  }
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against a non-disposable database: ${dbName}`);
  }

  await dataSource.initialize();
  await installPlaceholderFixture();
  const lifecycle = new RegulatoryReleaseLifecycleService(dataSource);
  const review = new ReleaseRecordReviewService(dataSource);

  // Self-resetting so the suite is re-runnable. Disposable DB only; guarded above.
  await dataSource.query(`DELETE FROM regulatory_release_record_reviews`);
  await dataSource.query(`DELETE FROM knowledge_release_events`);
  await dataSource.query(`DELETE FROM regulatory_release_records`);
  await dataSource.query(`DELETE FROM regulatory_releases`);
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = replace(plain_language_summary, ' [kg3b-revised]', '')`,
  );

  // =============================================================== release A
  const RELEASE_A = 'kg3b-release.A';
  const summaryA = finalize(RELEASE_A, 'a.1');
  assert(summaryA.outcome === 'finalized', 'Release A finalizes.');
  assert(summaryA.reviewState.reviewer_approved === 0,
    'Finalization still approves nothing (KG-3A defect B stays closed).');

  const scopeA0 = await lifecycle.describeReleaseScope(RELEASE_A);
  assert(scopeA0.governedRecords === 0,
    `Before any review, release A reports 0 governed records of ${scopeA0.totalRecords}.`);

  const statusA0 = await review.describeRecordReview(RELEASE_A, CITATION);
  assert(!!statusA0, `Release A holds ${CITATION}.`);
  assert(statusA0!.frozenReviewState === 'mechanically_validated',
    'The record is frozen as mechanically_validated -- eligible for review, not yet approved.');
  assert(statusA0!.effectiveReviewState === 'mechanically_validated',
    'With no decision recorded, effective state equals frozen state.');
  assert(statusA0!.latestDecision === null && statusA0!.history.length === 0,
    'No reviewer decision exists yet.');

  const checksumA = statusA0!.recordChecksum;

  // Prefixed and bare forms must reach the same record -- approval attaches to logical identity
  // resolved through the SAME normalization the snapshot used, not to a formatting variant.
  const viaPrefixed = await review.describeRecordReview(RELEASE_A, CITATION_PREFIXED);
  assert(viaPrefixed?.recordChecksum === checksumA,
    'A prefixed citation resolves to the same release record as the bare form.');

  // --------------------------------------------------------- Phase 5: stale review refused
  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER,
      expectedChecksum: 'f'.repeat(64),
    }),
    'checksumMatches',
    'Approving a checksum the release does not hold is REFUSED (stale review protection).');

  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER,
      expectedChecksum: 'not-a-checksum',
    }),
    'checksumMatches',
    'A malformed expected checksum is refused rather than coerced.');

  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_A, citation: CITATION, reviewerId: '  ',
      expectedChecksum: checksumA,
    }),
    'reviewerIdentified',
    'Approval without a reviewer identity is refused -- provenance is mandatory.');

  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_A, citation: '29 CFR 9999.999', reviewerId: REVIEWER,
      expectedChecksum: checksumA,
    }),
    'recordExists',
    'Approving a citation the release does not contain is refused.');

  await refuses(
    () => review.approveRecord({
      releaseId: 'kg3b-release.DOES-NOT-EXIST', citation: CITATION, reviewerId: REVIEWER,
      expectedChecksum: checksumA,
    }),
    'releaseExists',
    'Approving against a non-existent release is refused.');

  // --------------------------------------------- Phase 7: placeholder provenance not approvable
  const [placeholder] = await dataSource.query(
    `SELECT citation, "recordChecksum" FROM regulatory_release_records
      WHERE "releaseId" = $1 AND "reviewState" = 'unreviewed' LIMIT 1`, [RELEASE_A],
  );
  assert(!!placeholder, `An unreviewed (placeholder-provenance) record exists to test: ${placeholder?.citation}.`);
  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_A, citation: placeholder.citation, reviewerId: REVIEWER,
      expectedChecksum: placeholder.recordChecksum,
    }),
    'frozenStateEligible',
    'A placeholder-provenance record CANNOT be approved to improve coverage; provenance must be ' +
    'remediated and the release re-finalized first.');

  // --------------------------------------------------------- Phase 3/8: a legitimate approval
  const approved = await review.approveRecord({
    releaseId: RELEASE_A, citation: CITATION_PREFIXED, reviewerId: REVIEWER, reviewerRole: ROLE,
    expectedChecksum: checksumA,
    note: 'Fixture review: text compared against the registered eCFR source for this release.',
  });
  assert(approved.outcome === 'approved', 'A checksum-matched approval succeeds.');
  assert(approved.effectiveReviewState === 'reviewer_approved',
    'The record is now effectively reviewer_approved.');
  assert(approved.recordChecksum === checksumA,
    'The recorded decision is bound to the exact version reviewed.');

  const statusA1 = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(statusA1.effectiveReviewState === 'reviewer_approved', 'Approval survives a reload.');
  assert(statusA1.frozenReviewState === 'mechanically_validated',
    'The FROZEN snapshot state is unchanged -- the immutable row was not mutated.');
  assert(statusA1.reviewerId === REVIEWER && statusA1.reviewerRole === ROLE,
    'Reviewer identity and role are recorded.');
  assert(statusA1.decidedAt instanceof Date, 'A decision timestamp is recorded.');
  assert(!!statusA1.note, 'The review note is retained.');
  assert(statusA1.history.length === 1, 'Exactly one decision is logged.');

  const [auditApproval] = await dataSource.query(
    `SELECT event, outcome, actor, details FROM knowledge_release_events
      WHERE event = 'record_approval' AND outcome = 'succeeded' AND "toReleaseId" = $1`, [RELEASE_A],
  );
  assert(!!auditApproval && auditApproval.actor === REVIEWER,
    'The approval is audited in the shared knowledge_release_events trail.');
  assert(auditApproval.details.recordChecksum === checksumA,
    'The audit event records the exact version approved.');

  const [refusalAudit] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM knowledge_release_events
      WHERE event = 'record_approval' AND outcome = 'refused'`,
  );
  assert(refusalAudit.n >= 5, `Refused approvals are audited too (${refusalAudit.n} recorded).`);

  // ------------------------------------- Phase 8: approval does not invalidate content integrity
  const integrityAfterApproval = await lifecycle.verifyIntegrity(RELEASE_A);
  assert(integrityAfterApproval.matches,
    'The immutable CONTENT manifest still verifies after approval -- approval state and content ' +
    'integrity are separately auditable (Phase 9 model B).');
  assert(integrityAfterApproval.storedChecksum === summaryA.manifestChecksum,
    'The finalized content manifest was not rewritten because approval changed.');

  const approvalChecksum1 = await review.computeApprovalStateChecksum(RELEASE_A);
  assert(/^[0-9a-f]{64}$/.test(approvalChecksum1.approvalStateChecksum),
    'Approval state has its own separately auditable integrity digest.');

  // Idempotence
  const again = await review.approveRecord({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER, expectedChecksum: checksumA,
  });
  assert(again.outcome === 'already_approved', 'Re-approving the same version is an idempotent no-op.');
  const historyAfterRepeat = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(historyAfterRepeat.history.length === 1, 'No duplicate decision row is written.');

  // ---------------------------------------------------- Phase 10: activation gate integration
  const scopeA1 = await lifecycle.describeReleaseScope(RELEASE_A);
  assert(scopeA1.governedRecords === 1,
    'The activation gate now sees exactly 1 governed record -- the one actually reviewed.');
  assert(scopeA1.mechanicallyValidatedRecords === scopeA0.mechanicallyValidatedRecords - 1,
    'The approved record moved OUT of mechanically_validated; totals are conserved.');

  const eligibilityA = await lifecycle.evaluateActivation(RELEASE_A, ['provisional']);
  assert(eligibilityA.eligible,
    'Release A is now activation-eligible; before any review it failed governedRecordsPresent.');

  const activation = await lifecycle.activate(RELEASE_A, 'kg3b-verification', 'fixture activation');
  assert(activation.outcome === 'activated', 'Release A activates.');
  const active = await lifecycle.getActiveRelease();
  assert(active?.releaseId === RELEASE_A, 'Release A is the active pointer.');

  // =============================================================== release B: changed content
  await dataSource.query(
    `UPDATE standards_master
        SET plain_language_summary = plain_language_summary || ' [kg3b-revised]'
      WHERE citation = $1`, [CITATION],
  );
  const RELEASE_B = 'kg3b-release.B';
  const summaryB = finalize(RELEASE_B, 'b.1');
  assert(summaryB.outcome === 'finalized', 'Release B finalizes with revised content.');

  const statusB = (await review.describeRecordReview(RELEASE_B, CITATION))!;
  assert(statusB.recordChecksum !== checksumA,
    'Release B holds a DIFFERENT version of the same citation (content changed).');

  // ------------------------------------------- Phase 6: a changed version inherits nothing
  assert(statusB.effectiveReviewState === 'mechanically_validated',
    'Release B\'s revised record is NOT approved -- approval did not follow the citation.');
  assert(statusB.latestDecision === null && statusB.history.length === 0,
    'No decision from release A applies to release B\'s version.');

  const scopeB0 = await lifecycle.describeReleaseScope(RELEASE_B);
  assert(scopeB0.governedRecords === 0,
    'Release B reports 0 governed records despite release A having an approved copy of the citation.');

  // Release A's approval is untouched by B's existence.
  const statusA2 = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(statusA2.effectiveReviewState === 'reviewer_approved',
    'Release A\'s approval survives release B\'s finalization.');
  assert(statusA2.recordChecksum === checksumA,
    'Release A still resolves the exact version that was reviewed.');

  // Approving A's checksum against B must be refused: that content is not what B holds.
  await refuses(
    () => review.approveRecord({
      releaseId: RELEASE_B, citation: CITATION, reviewerId: REVIEWER, expectedChecksum: checksumA,
    }),
    'checksumMatches',
    'Approving release B using release A\'s checksum is refused -- no cross-version approval.');

  // ------------------------------- Phase 6: identical content does not carry approval forward
  const [identical] = await dataSource.query(
    `SELECT a.citation, a."recordChecksum"
       FROM regulatory_release_records a
       JOIN regulatory_release_records b
         ON b."releaseId" = $2 AND b."citationKey" = a."citationKey"
        AND b."recordChecksum" = a."recordChecksum"
      WHERE a."releaseId" = $1 AND a.citation <> $3
        AND a."reviewState" = 'mechanically_validated'
      LIMIT 1`, [RELEASE_A, RELEASE_B, CITATION],
  );
  assert(!!identical,
    `A citation with byte-identical content in A and B exists to test: ${identical?.citation}.`);
  await review.approveRecord({
    releaseId: RELEASE_A, citation: identical.citation, reviewerId: REVIEWER, reviewerRole: ROLE,
    expectedChecksum: identical.recordChecksum, note: 'Fixture review of unchanged content.',
  });
  const identicalInB = (await review.describeRecordReview(RELEASE_B, identical.citation))!;
  assert(CARRY_FORWARD_ON_IDENTICAL_CONTENT === false,
    'Carry-forward on identical content is explicitly DISABLED, not merely unimplemented.');
  assert(identicalInB.effectiveReviewState === 'mechanically_validated',
    'Byte-identical content in release B is still NOT approved: identity of text is not identity ' +
    'of regulatory standing (the citation may have been withdrawn upstream between releases).');

  const carryForward = await review.describeCarryForwardCandidates(RELEASE_B);
  const carryCitations = carryForward.map(row => row.citation);
  assert(carryCitations.includes(identical.citation),
    'The identical-content record is SURFACED as a carry-forward candidate so re-review is targeted.');
  assert(!carryCitations.includes(CITATION),
    'The genuinely revised citation is NOT offered as a carry-forward candidate.');

  // =============================================================== Phase 6: revocation
  const revoked = await review.revokeApproval({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: 'kg3b-governance-lead',
    expectedChecksum: checksumA, note: 'Fixture revocation: approval recorded against the wrong edition.',
  });
  assert(revoked.outcome === 'revoked', 'An approval can be revoked.');
  assert(revoked.effectiveReviewState === 'mechanically_validated',
    'Revocation returns the record to its FROZEN state, which remains a true statement about it.');

  const statusA3 = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(statusA3.history.length === 2, 'Both decisions are retained -- nothing was deleted.');
  assert(statusA3.history[0].decision === 'approved' && statusA3.history[0].reviewerId === REVIEWER,
    'The record that it WAS approved, and by whom, survives the revocation.');
  assert(statusA3.history[1].decision === 'revoked' && !!statusA3.history[1].note,
    'The revocation is retained with its stated grounds.');

  let revocationWithoutNote = false;
  try {
    await review.revokeApproval({
      releaseId: RELEASE_A, citation: identical.citation, reviewerId: REVIEWER,
      expectedChecksum: identical.recordChecksum,
    });
  } catch (error) {
    revocationWithoutNote = error instanceof ReleaseRecordReviewRefused;
  }
  assert(revocationWithoutNote, 'Revocation without stated grounds is refused.');

  const alreadyNot = await review.revokeApproval({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER,
    expectedChecksum: checksumA, note: 'repeat',
  });
  assert(alreadyNot.outcome === 'already_not_approved',
    'Revoking a record that is not approved is an idempotent no-op.');

  // Re-approval after revocation must be possible and must be logged as a third decision.
  await review.approveRecord({
    releaseId: RELEASE_A, citation: CITATION, reviewerId: REVIEWER, reviewerRole: ROLE,
    expectedChecksum: checksumA, note: 'Fixture re-approval after correction.',
  });
  const statusA4 = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(statusA4.history.length === 3 && statusA4.effectiveReviewState === 'reviewer_approved',
    'A record can be re-approved after revocation, and all three decisions are retained.');

  const approvalChecksum2 = await review.computeApprovalStateChecksum(RELEASE_A);
  assert(approvalChecksum2.approvalStateChecksum !== approvalChecksum1.approvalStateChecksum,
    'The approval-state digest changed when approval state changed...');
  const integrityFinal = await lifecycle.verifyIntegrity(RELEASE_A);
  assert(integrityFinal.matches && integrityFinal.storedChecksum === summaryA.manifestChecksum,
    '...while the CONTENT manifest stayed identical throughout every approval and revocation.');

  // =============================================================== rollback preserves approval
  const eligibilityB = await lifecycle.evaluateActivation(RELEASE_B, ['provisional']);
  assert(!eligibilityB.eligible && eligibilityB.failedGates.includes('governedRecordsPresent'),
    'Release B is correctly NOT activatable: it has no reviewer-approved record.');

  const statusAfterAll = (await review.describeRecordReview(RELEASE_A, CITATION))!;
  assert(statusAfterAll.effectiveReviewState === 'reviewer_approved' &&
    statusAfterAll.recordChecksum === checksumA,
    'After every operation, release A still resolves the exact approved version.');

  console.log(`\nPASSED ${checks.length}/${checks.length} checks.`);
  console.log('NOTE (Phase 20): every approval above is a TEST FIXTURE. It proves the workflow, ' +
    'not that any real regulatory record has been substantively reviewed.');
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});

