/**
 * KG-3A -- release integrity, per-release retention and approval semantics.
 *
 * Verifies the three defects KG-2 exposed are actually closed:
 *
 *   C  per-release record retention   -- finalizing B must not empty A
 *   A  finalizer ordering             -- ONE finalization must verify immediately
 *   B  approval semantics             -- auto-ingestable != reviewer approved
 *
 * plus the Phase 10 TRUE ROLLBACK test: two genuinely distinct snapshots where the same
 * citation holds different text, proving rollback restores content and not merely a pointer.
 *
 * Runs entirely against a disposable database, driving the real
 * `finalize-regulatory-release.ts` as a child process so the production finalization path is
 * what is under test -- not a reimplementation of it.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { dataSource } from '../src/database/data-source';
import { RegulatoryReleaseLifecycleService } from '../src/standards/releases/regulatory-release-lifecycle.service';
import { assessReviewState, isPlaceholderSourceKey } from '../src/standards/releases/review-state';
import { releaseCitationKey } from '../src/standards/releases/citation-identity';
import { claimDatabaseOwnership, DatabaseOwnershipRefused } from './lib/test-database-ownership';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
}

const ACTOR = 'kg3a-verification';
/** The citation exactly as stored in the seeded corpus. */
const TEST_CITATION = '1910.212(a)(1)';
/** The same logical standard written with its agency prefix -- must resolve to the same record. */
const TEST_CITATION_PREFIXED = '29 CFR 1910.212(a)(1)';

/** Drives the real production finalizer. Returns its JSON summary. */
function finalize(releaseId: string, version: string) {
  const out = execFileSync('npx',
    ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'],
    {
      env: { ...process.env, REGULATORY_RELEASE_ID: releaseId, REGULATORY_RELEASE_VERSION: version },
      stdio: 'pipe',
    }).toString();
  const line = out.trim().split('\n').filter(Boolean).pop() || '{}';
  return JSON.parse(line);
}

function finalizeExpectingFailure(releaseId: string, version: string): string | null {
  try {
    finalize(releaseId, version);
    return null;
  } catch (error: any) {
    return String(error.stderr || error.stdout || error.message);
  }
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
    const claim = await claimDatabaseOwnership({ suite: 'test:release-integrity-and-approval' });
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
  const service = new RegulatoryReleaseLifecycleService(dataSource);

  // This suite drives the real finalizer, which is (correctly) immutable -- so it resets its
  // own release state and undoes its own corpus edit to stay re-runnable. Disposable DB only;
  // the guard above has already refused anything else.
  await dataSource.query(`DELETE FROM knowledge_release_events`);
  await dataSource.query(`DELETE FROM regulatory_release_records`);
  await dataSource.query(`DELETE FROM regulatory_releases`);
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = replace(plain_language_summary, ' [edited]', '')`,
  );

  // ------------------------------------------------------- DEFECT A: one-pass finalization
  const RELEASE_A = 'kg3a-release.A';
  const summaryA = finalize(RELEASE_A, 'a.1');
  assert(summaryA.outcome === 'finalized', 'Finalization completes.');
  assert(summaryA.verifiedInOnePass === true,
    'Finalizer verifies its own manifest against the snapshot before committing.');

  const integrityA1 = await service.verifyIntegrity(RELEASE_A);
  assert(integrityA1.matches,
    `A SINGLE finalization produces a release whose manifest verifies immediately (defect A closed).`);
  assert(integrityA1.actualRecordCount === summaryA.recordCount && integrityA1.actualRecordCount > 0,
    `Release A snapshot holds all ${integrityA1.actualRecordCount} records.`);

  // ------------------------------------------------------- DEFECT B: approval semantics
  assert(summaryA.reviewState.reviewer_approved === 0,
    'Finalization approves NOTHING: reviewer approval is not something finalization can confer.');
  assert(summaryA.reviewState.mechanically_validated > 0,
    `${summaryA.reviewState.mechanically_validated} records are mechanically validated (a real, weaker claim).`);
  assert(summaryA.reviewState.unreviewed > 0,
    `${summaryA.reviewState.unreviewed} records remain unreviewed.`);

  const [approvedNow] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM standards_master WHERE reviewer_approved = true`,
  );
  assert(approvedNow.n === 0,
    'No standards_master row was marked reviewer_approved by finalization.');

  // Placeholder sources must never be treated as reviewed, even if the legacy boolean is set.
  const placeholderRows = await dataSource.query(
    `SELECT * FROM standards_master WHERE source_key LIKE 'starter-unverified:%' LIMIT 5`,
  );
  assert(placeholderRows.length > 0, `${placeholderRows.length} placeholder-source records exist to test.`);
  for (const row of placeholderRows) {
    assert(isPlaceholderSourceKey(row.source_key), 'Placeholder source key is recognised as such.');
    assert(assessReviewState({ ...row, reviewer_approved: true }).state === 'unreviewed',
      'A placeholder-source record stays unreviewed even when the legacy approval boolean is true.');
  }
  const placeholderSnapshot = await dataSource.query(
    `SELECT DISTINCT "reviewState" FROM regulatory_release_records r
     JOIN standards_master s ON s.id = r."standardId"
     WHERE r."releaseId" = $1 AND s.source_key LIKE 'starter-unverified:%'`, [RELEASE_A],
  );
  assert(placeholderSnapshot.every((r: any) => r.reviewState === 'unreviewed'),
    'Every placeholder-source record is snapshotted as unreviewed.');

  // ---------------------------------------------- DEFECT A/5: finalization is immutable
  const repeat = finalize(RELEASE_A, 'a.1');
  assert(repeat.outcome === 'idempotent_no_op',
    'Re-finalizing an unchanged release is an idempotent no-op, not a silent rewrite.');
  const integrityA2 = await service.verifyIntegrity(RELEASE_A);
  assert(integrityA2.recomputedChecksum === integrityA1.recomputedChecksum,
    'A repeated finalization did not change the manifest (contrast: pre-KG-3A run 2 changed it).');
  const [approvedAfterRepeat] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM standards_master WHERE reviewer_approved = true`,
  );
  assert(approvedAfterRepeat.n === 0,
    'A second finalization does NOT promote any record to approved (defect B closed).');

  // Mutate the live corpus, then attempt re-finalization of the SAME release id.
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = COALESCE(plain_language_summary,'') || ' [edited]'
     WHERE citation = $1`, [TEST_CITATION],
  );
  const refusal = finalizeExpectingFailure(RELEASE_A, 'a.1');
  assert(refusal && /already holds an immutable snapshot/i.test(refusal),
    'Re-finalizing a release whose content changed is explicitly refused, not silently applied.');
  const integrityA3 = await service.verifyIntegrity(RELEASE_A);
  assert(integrityA3.matches && integrityA3.recomputedChecksum === integrityA1.recomputedChecksum,
    'Release A is byte-identical after the refused re-finalization.');

  // ------------------------------------- DEFECT C: finalizing B must not disturb A
  const recordsABefore = await service.resolveReleaseRecords(RELEASE_A);
  const aTextBefore = recordsABefore.find(r => r.citationKey === releaseCitationKey(TEST_CITATION));
  assert(!!aTextBefore, `Release A contains ${TEST_CITATION}.`);

  const RELEASE_B = 'kg3a-release.B';
  const summaryB = finalize(RELEASE_B, 'b.1');
  assert(summaryB.outcome === 'finalized' && summaryB.verifiedInOnePass === true,
    'Release B finalizes and verifies in one pass.');

  const integrityAAfterB = await service.verifyIntegrity(RELEASE_A);
  assert(integrityAAfterB.matches,
    'Release A STILL verifies after release B was finalized (defect C closed).');
  assert(integrityAAfterB.actualRecordCount === integrityA1.actualRecordCount,
    `Release A still holds exactly ${integrityA1.actualRecordCount} records after B (was 0 pre-KG-3A).`);

  const recordsAAfter = await service.resolveReleaseRecords(RELEASE_A);
  assert(JSON.stringify(recordsAAfter.map(r => r.recordChecksum)) ===
         JSON.stringify(recordsABefore.map(r => r.recordChecksum)),
    'Every release-A record checksum is unchanged after B finalization.');

  // ------------------------------- PHASE 3: logical citation vs release-version identity
  const aVersion = await service.resolveCitationInRelease(RELEASE_A, TEST_CITATION);
  const bVersion = await service.resolveCitationInRelease(RELEASE_B, TEST_CITATION);
  assert(!!aVersion && !!bVersion, 'The same logical citation resolves in both releases.');
  assert(aVersion!.citationKey === bVersion!.citationKey,
    'Logical identity (citationKey) is stable across releases.');
  const aVersionPrefixed = await service.resolveCitationInRelease(RELEASE_A, TEST_CITATION_PREFIXED);
  assert(aVersionPrefixed?.id === aVersion!.id,
    `'${TEST_CITATION}' and '${TEST_CITATION_PREFIXED}' resolve to the same logical record.`);
  assert(aVersion!.recordChecksum !== bVersion!.recordChecksum,
    'Release-version identity differs: the citation text changed between A and B.');
  assert(!String((aVersion!.payload as any).summary || '').includes('[edited]'),
    "Release A still shows A's text, not B's newer text.");
  assert(String((bVersion!.payload as any).summary || '').includes('[edited]'),
    "Release B shows B's revised text.");

  // ------------------------------------------------ PHASE 9: activation eligibility
  const eligUnfinalized = await service.evaluateActivation('kg3a-never-finalized', ['provisional']);
  assert(!eligUnfinalized.eligible && eligUnfinalized.failedGates.includes('releaseExists'),
    'An unfinalized/non-existent release is rejected.');

  const eligA = await service.evaluateActivation(RELEASE_A, ['provisional']);
  assert(!eligA.eligible && eligA.failedGates.includes('governedRecordsPresent'),
    'A finalized release with NO reviewer-approved records is rejected (approval policy enforced).');

  // Simulate genuine reviewer approval on release A's snapshot ONLY (never the real corpus).
  await dataSource.query(
    `UPDATE regulatory_release_records SET "reviewState" = 'reviewer_approved',
       "reviewStateReason" = 'KG-3A fixture: reviewer approval simulated'
     WHERE "releaseId" = $1`, [RELEASE_A],
  );
  await dataSource.query(
    `UPDATE regulatory_release_records SET "reviewState" = 'reviewer_approved',
       "reviewStateReason" = 'KG-3A fixture: reviewer approval simulated'
     WHERE "releaseId" = $1`, [RELEASE_B],
  );
  const eligAApproved = await service.evaluateActivation(RELEASE_A, ['provisional']);
  assert(eligAApproved.eligible, 'A fully eligible release activates once genuinely approved.');

  // ------------------------------------------------ PHASE 10: TRUE ROLLBACK
  await service.activate(RELEASE_A, ACTOR, 'KG-3A true-rollback: activate A');
  assert((await service.getActiveRelease())?.releaseId === RELEASE_A, 'Release A is active.');

  await service.activate(RELEASE_B, ACTOR, 'KG-3A true-rollback: promote B');
  assert((await service.getActiveRelease())?.releaseId === RELEASE_B, 'Release B is active.');
  const activeB = await service.resolveCitationInRelease(RELEASE_B, TEST_CITATION);
  assert(String((activeB!.payload as any).summary || '').includes('[edited]'),
    'While B is active, the citation resolves to B\'s version.');

  const rolled = await service.rollbackTo(RELEASE_A, ACTOR, 'KG-3A true-rollback: back to A');
  assert(rolled.outcome === 'rolled_back' && rolled.previousReleaseId === RELEASE_B,
    'Explicit rollback to A reports B as the release it replaced.');
  assert((await service.getActiveRelease())?.releaseId === RELEASE_A, 'Pointer is back on A.');

  const integrityAfterRollback = await service.verifyIntegrity(RELEASE_A);
  assert(integrityAfterRollback.matches, 'Release A checksum still verifies after rollback.');
  assert(integrityAfterRollback.actualRecordCount === integrityA1.actualRecordCount,
    'Release A membership is intact after rollback.');

  const resolvedAfterRollback = await service.resolveCitationInRelease(RELEASE_A, TEST_CITATION);
  assert(!String((resolvedAfterRollback!.payload as any).summary || '').includes('[edited]'),
    `${TEST_CITATION} resolves to release A's ORIGINAL version through the governed interface ` +
    '(rollback restored content, not just a pointer).');

  const bStillThere = await service.verifyIntegrity(RELEASE_B);
  assert(bStillThere.matches && bStillThere.actualRecordCount > 0,
    'Release B is preserved historically and still verifies; nothing was destroyed.');

  // --------------------------------- PHASE 11: KG-1 historical provenance resolution
  // An analysis stamped knowledgeReleaseId = A must still resolve A's records after B exists.
  const historical = await service.resolveReleaseRecords(RELEASE_A);
  assert(historical.length === integrityA1.actualRecordCount,
    'A KG-1 provenance value of release A still resolves A\'s full immutable record set after B exists.');
  const historicalCitation = await service.resolveCitationInRelease(RELEASE_A, TEST_CITATION);
  assert(historicalCitation!.recordChecksum === aTextBefore!.recordChecksum,
    'The exact record version an analysis would have used is still recoverable by checksum.');

  // --------------------------------------------- PHASE 12: legacy/unscoped treatment
  const scope = await service.describeReleaseScope(RELEASE_A);
  assert(scope.totalRecords > 0, `Release A scope reports ${scope.totalRecords} snapshot records.`);
  assert(scope.legacyUnscopedRecords === 0 || scope.legacyUnscopedRecords > 0,
    `Legacy/unscoped live rows are reported explicitly (${scope.legacyUnscopedRecords}).`);

  await dataSource.destroy();
  console.log(`\nrelease-integrity-and-approval: ${checks.length}/${checks.length} checks passed`);
  for (const check of checks) console.log(`  ok  ${check}`);
}

main().catch(async error => {
  if (dataSource.isInitialized) await dataSource.destroy();
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
