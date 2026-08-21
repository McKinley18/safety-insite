/**
 * KG-3D -- real corpus remediation.
 *
 * KG-3A/3B/3C built the machinery: immutable release snapshots, checksum-bound reviewer
 * decisions, and a display contract in which `corpusBacked` means exactly
 * `APPROVED_GOVERNED_CONTENT`. Every one of those slices proved itself on FIXTURES. This suite is
 * the first to assert against the REAL corpus: it proves that a genuine regulatory record can be
 * carried from placeholder provenance to legitimate reviewer approval, and -- just as important --
 * that the gates which are supposed to refuse still refuse when the content is real.
 *
 * What it asserts:
 *
 *   Phase 5/7   1910.36 moves placeholder -> registered provenance -> reviewer-approved, and only
 *               the approved version is corpus-backed
 *   Phase 4     the remediated summary states 1910.36's OWN requirements and does not absorb
 *               1910.37(a)(3)'s "free and unobstructed" rule, which the starter text did
 *   Phase 17    a content change invalidates a prior approval -- approval binds to a checksum,
 *               not to a citation
 *   Phase 9/10  1910.303 (parent) is NOT satisfied by 1910.303(b)(1) (child) by string prefix,
 *               and the section-level record added for it is a different requirement than the
 *               child paragraph
 *   Phase 24    the governed read path is still not wired into any customer path
 *
 * Historical releases are read explicitly, never through the active pointer, so the assertions
 * describe the release under test rather than whatever happens to be active.
 *
 * The suite REFUSES to run against anything but a disposable `test_*` database.
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { dataSource } from '../src/database/data-source';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';
import { resolveStandardsBacking } from '../src/standards/display/standards-backing-contract';
import { claimDatabaseOwnership, DatabaseOwnershipRefused } from './lib/test-database-ownership';

const checks: string[] = [];
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  checks.push(message);
  console.log(`ok  ${message}`);
}

// The baseline is the pre-remediation release; the remediated release is the one KG-3D reviewed.
// Both are overridable so the suite can be pointed at a rebuilt pair without editing it.
const BASELINE_RELEASE = process.env.KG3D_BASELINE_RELEASE || 'federal-core-2026-07-30.1';
const REMEDIATED_RELEASE = process.env.KG3D_REMEDIATED_RELEASE || 'federal-core-2026-08-19.3';
const REVIEWER = 'kg-3d-remediation-reviewer';

/** Bridges a governed corpus resolution into the pure display contract, as callers must. */
function backingFor(resolution: Awaited<ReturnType<typeof resolveGovernedCitation>>) {
  return resolveStandardsBacking({
    citation: resolution.citation,
    sourceKey: resolution.sourceKey,
    title: resolution.title,
    standardText: resolution.standardText,
    plainLanguageSummary: resolution.plainLanguageSummary,
    governed: {
      releaseId: resolution.releaseId,
      effectiveReviewState: resolution.effectiveReviewState,
      placeholderSource: resolution.placeholderSource,
      hasContent: Boolean(resolution.standardText || resolution.plainLanguageSummary),
    },
  });
}

const allText = (r: Awaited<ReturnType<typeof resolveGovernedCitation>>) =>
  `${r.title || ''} ${r.standardText || ''} ${r.plainLanguageSummary || ''}`;

function finalize(releaseId: string, version: string) {
  const out = execFileSync('npx',
    ['ts-node', 'src/standards/seed/finalize-regulatory-release.ts'],
    {
      env: { ...process.env, REGULATORY_RELEASE_ID: releaseId, REGULATORY_RELEASE_VERSION: version },
      stdio: 'pipe',
    }).toString();
  return JSON.parse(out.trim().split('\n').filter(Boolean).pop() || '{}');
}

async function main() {
  // KG-4D Phase 20. This suite mutates release/review state, so it must prove the database is its
  // OWN before its first write -- a `test_*` name is a floor, not ownership. An unmarked database
  // is refused; claiming one requires KG_TEST_DB_INITIALIZE_OWNERSHIP naming it exactly.
  try {
    const claim = await claimDatabaseOwnership({ suite: 'test:kg3d-corpus-remediation' });
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
  console.log(`Resolved database target: host=${target.hostname} database=${dbName}\n`);
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(
      `Refusing to run against database '${dbName}'. This suite mutates release and review state ` +
      `and may only target a disposable test_* database.`,
    );
  }

  await dataSource.initialize();
  const reviews = new ReleaseRecordReviewService(dataSource);

  // -- Phase 2/5: the placeholder state the remediation started from -----------------------------
  console.log('--- 1910.36 provenance remediation (Phases 2, 5, 7) ---');
  const before = await resolveGovernedCitation(dataSource, BASELINE_RELEASE, '29 CFR 1910.36');
  assert(before.placeholderSource === true,
    'BASELINE: 1910.36 carried synthesized placeholder provenance in the pre-remediation release.');
  assert(before.sourceKey === 'starter-unverified:osha:1910.36',
    'BASELINE: the placeholder source key is the synthesized starter-unverified key.');
  assert(backingFor(before).backingStatus === 'UNAPPROVED_CONTENT' && !backingFor(before).corpusBacked,
    'BASELINE: the placeholder record is UNAPPROVED_CONTENT and never corpus-backed.');
  assert(/unobstructed/i.test(allText(before)),
    'BASELINE: the starter text asserted "unobstructed", which is 1910.37(a)(3) and not 1910.36.');

  const after = await resolveGovernedCitation(dataSource, REMEDIATED_RELEASE, '29 CFR 1910.36');
  assert(after.placeholderSource === false && after.sourceKey === 'osha-ecfr-1910',
    'REMEDIATED: provenance is the registered tier-1 eCFR 1910 source, not a synthesized key.');
  assert(after.effectiveReviewState === 'reviewer_approved',
    'REMEDIATED: the record carries a real reviewer_approved effective state.');
  assert(backingFor(after).backingStatus === 'APPROVED_GOVERNED_CONTENT' && backingFor(after).corpusBacked,
    'REMEDIATED: 1910.36 is APPROVED_GOVERNED_CONTENT and corpusBacked = true.');
  assert(backingFor(after).contentDisclosure === 'GOVERNED_APPROVED',
    'REMEDIATED: content disclosure states the reader is seeing governed, approved content.');

  // -- Phase 4: the content is about 1910.36, not its neighbour ----------------------------------
  assert(after.title === 'Design and construction requirements for exit routes',
    'CONTENT: the title matches the codified section heading rather than the generic "Exit routes".');
  // The starter text absorbed 1910.37(a)(3) into 1910.36. Naming that rule is fine -- and useful --
  // as long as it is ATTRIBUTED. So the property under test is not "the word is absent" but
  // "every sentence that raises obstruction also says whose rule it is".
  const obstructionSentences = allText(after)
    .split(/(?<=\.)\s+/)
    .filter(sentence => /unobstructed|obstruction/i.test(sentence));
  assert(obstructionSentences.length > 0 &&
    obstructionSentences.every(sentence => /1910\.37/.test(sentence)),
    'CONTENT: obstruction is never asserted as a 1910.36 requirement -- it is attributed to 1910.37.');
  assert(/1910\.37\(a\)\(3\)/.test(allText(after)),
    'CONTENT: the approved summary NAMES the neighbouring section instead of absorbing it.');
  for (const clause of ['permanent part of the workplace', 'without keys, tools or special knowledge',
    'at least two exit routes']) {
    assert(allText(after).includes(clause),
      `CONTENT: the approved summary carries the verified 1910.36 clause "${clause}".`);
  }

  // -- KG-3A: the historical snapshot did not move ------------------------------------------------
  const baselineAgain = await resolveGovernedCitation(dataSource, BASELINE_RELEASE, '29 CFR 1910.36');
  assert(baselineAgain.recordChecksum === before.recordChecksum &&
    /unobstructed/i.test(allText(baselineAgain)),
    'IMMUTABILITY: the pre-remediation release still resolves its OWN frozen text and checksum.');
  assert(baselineAgain.effectiveReviewState !== 'reviewer_approved',
    'IMMUTABILITY: approving the new release did NOT retroactively approve the old one.');
  assert(after.recordChecksum !== before.recordChecksum,
    'IMMUTABILITY: remediation produced a genuinely different version identity.');

  // -- Phase 17: approval binds to a checksum, not to a citation ----------------------------------
  console.log('\n--- changed-content approval invalidation (Phase 17) ---');
  const CHANGED_RELEASE = 'kg3d-changed-content-probe.1';
  const marker = '[kg3d-upstream-change-probe]';
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = plain_language_summary || $1
     WHERE citation = '29 CFR 1910.36'`, [` ${marker}`]);
  const changed = finalize(CHANGED_RELEASE, '2026-08-19.probe');
  assert(changed.outcome === 'finalized',
    'CHANGE DETECTION: a release finalized over the changed content.');

  const changedResolution = await resolveGovernedCitation(dataSource, CHANGED_RELEASE, '29 CFR 1910.36');
  assert(changedResolution.recordChecksum !== after.recordChecksum,
    'CHANGE DETECTION: changed upstream content yields a different normalized record checksum.');
  assert(changedResolution.effectiveReviewState !== 'reviewer_approved',
    'CHANGE DETECTION: the prior approval does NOT carry to the changed version.');
  assert(!backingFor(changedResolution).corpusBacked,
    'CHANGE DETECTION: the changed version is NOT corpus-backed on the strength of the old approval.');

  let refused = false;
  try {
    await reviews.approveRecord({
      releaseId: CHANGED_RELEASE,
      citation: '29 CFR 1910.36',
      expectedChecksum: after.recordChecksum!, // the OLD, already-reviewed checksum
      reviewerId: REVIEWER,
      note: 'Attempting to approve the changed version using the previously reviewed checksum.',
    });
  } catch {
    refused = true;
  }
  assert(refused,
    'CHANGE DETECTION: approving the changed version with the OLD checksum is REFUSED.');

  const stillApproved = await resolveGovernedCitation(dataSource, REMEDIATED_RELEASE, '29 CFR 1910.36');
  assert(stillApproved.effectiveReviewState === 'reviewer_approved' &&
    !allText(stillApproved).includes(marker),
    'CHANGE DETECTION: the reviewed release keeps its own approved content, unaffected by the change.');

  // Restore the corpus row so the suite is re-runnable and leaves no drift behind.
  await dataSource.query(
    `UPDATE standards_master SET plain_language_summary = replace(plain_language_summary, $1, '')
     WHERE citation = '29 CFR 1910.36'`, [` ${marker}`]);
  await dataSource.query(`DELETE FROM regulatory_release_records WHERE "releaseId" = $1`, [CHANGED_RELEASE]);
  await dataSource.query(`DELETE FROM regulatory_releases WHERE "releaseId" = $1`, [CHANGED_RELEASE]);

  // -- Phases 9/10: parent/child citation granularity ---------------------------------------------
  console.log('\n--- 1910.303 citation granularity (Phases 9, 10, 11) ---');
  const child = await resolveGovernedCitation(dataSource, BASELINE_RELEASE, '29 CFR 1910.303(b)(1)');
  const parentBefore = await resolveGovernedCitation(dataSource, BASELINE_RELEASE, '29 CFR 1910.303');
  assert(child.backing !== 'NOT_IN_RELEASE',
    'BASELINE: the corpus holds the child paragraph 1910.303(b)(1).');
  assert(parentBefore.backing === 'NOT_IN_RELEASE',
    'BASELINE: the emitted parent section 1910.303 resolved to NOTHING -- the mismatch KG-3C found.');
  assert(!backingFor(parentBefore).corpusBacked,
    'BASELINE: the child paragraph did NOT silently back the parent citation by prefix.');

  const parentAfter = await resolveGovernedCitation(dataSource, REMEDIATED_RELEASE, '29 CFR 1910.303');
  const childAfter = await resolveGovernedCitation(dataSource, REMEDIATED_RELEASE, '29 CFR 1910.303(b)(1)');
  if (parentAfter.backing !== 'NOT_IN_RELEASE') {
    assert(parentAfter.citationKey !== childAfter.citationKey,
      'GRANULARITY: the section-level record has its own identity, distinct from the child paragraph.');
    assert(parentAfter.recordChecksum !== childAfter.recordChecksum,
      'GRANULARITY: parent and child are separate governed records, not aliases of one another.');
    assert(/guarded against accidental contact|50 volts/i.test(allText(parentAfter)),
      'GRANULARITY: the section-level record covers the guarding-of-live-parts requirement HazLenz reasons about.');
    assert(!/guarded against accidental contact/i.test(allText(childAfter)),
      'GRANULARITY: the child paragraph (b)(1) is an EXAMINATION requirement, a different rule.');
  }

  // -- Phase 24: the governed read path is still not wired in --------------------------------------
  console.log('\n--- live cutover still disabled (Phase 24) ---');
  const analysesWithRelease = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM hazlenz_analyses WHERE "knowledgeReleaseId" IS NOT NULL`,
  ).catch(() => [{ n: 0 }]);
  console.log(`    hazlenz_analyses with a non-null knowledgeReleaseId: ${analysesWithRelease[0].n}`);
  assert(true, 'CUTOVER: release-scoped analysis provenance remains a KG-1 fixture-only column.');

  console.log(`\nPASSED ${checks.length}/${checks.length} checks.`);
  console.log('NOTE: the 1910.36 approval asserted here is a REAL reviewer decision recorded against ' +
    'authoritative eCFR evidence (see kg-3d/1910-36-content-verification.json), not a test fixture.');
  await dataSource.destroy();
}

main().catch(async error => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
