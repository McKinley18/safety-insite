import 'dotenv/config';
import 'reflect-metadata';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import { loadReleaseDefinition } from '../src/standards/releases/release-definition';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';
import { classifyShadowComparison } from '../src/standards/cutover/shadow-comparison';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';
import { normalizeCitationForMatch } from '../src/standards/seed/standards-intelligence-projection';

/**
 * KG-5B -- the FULL operator rehearsal (Phases 19, 20).
 *
 * Runs the exact production sequence, end to end, against a disposable database built to
 * production's pre-KG shape: 40 migrations, latest `RefreshTokens1800000008000`, and the 2,390-row
 * legacy corpus with `source_key` NULL on every row.
 *
 * THE POINT OF THIS SCRIPT IS THE COMMANDS IT RUNS. Every mutating step is a reviewed,
 * version-controlled command invoked as a child process exactly as an operator would type it.
 * KG-5A drove activation from an ad-hoc Node snippet; nothing here does. What this script adds
 * beyond the commands is measurement -- corpus fingerprints, pointer state and the SHADOW
 * comparison -- not capability.
 *
 * A NOTE ON "FINALIZE". The repository's lifecycle is
 * `draft -> provisional -> active -> superseded | rolled_back`, and `provisional` IS its finalized
 * state: `regulatory-release.entity.ts` records the KG-2 decision to reuse it rather than add a
 * second word for one concept, and to add no state nothing can produce or consume. So the five
 * conceptual steps map onto five separate reviewed commands without inventing a lifecycle state:
 *
 *   prepare   `release -- prepare`                 writes the immutable provisional snapshot
 *   review    `review:release-record -- show/list` reads what is about to be attested to
 *   approve   `review:release-record -- approve`   one record, one reviewer, one exact checksum
 *   finalize  `release -- activate --dry-run`      evaluates all eight finalization gates, no writes
 *   activate  `release -- activate`                moves the pointer
 *
 * Nothing is collapsed and there is no `publish`.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5b-operator-rehearsal';
const PREKG_TEMPLATE = process.env.KG5B_PREKG_DB || 'test_kg5b_prekg_20260821';
const ADMIN_URL = process.env.KG5B_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const DATABASE = 'test_kg5b_mut_rehearsal';
const ACTOR = 'kg5b-rehearsal-operator';
const REVIEWER = 'kg5b-rehearsal-reviewer';
const EVIDENCE = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5b');

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

const transcript: Array<Record<string, unknown>> = [];
let failed = 0;
function must(name: string, condition: boolean, detail?: unknown): void {
  transcript.push({ assertion: name, passed: condition, detail: detail ?? null });
  if (!condition) { failed++; console.log(`  FAIL  ${name} :: ${JSON.stringify(detail)}`); }
}
function step(n: number, title: string): void {
  console.log(`\n[${n}] ${title}`);
}

async function admin(sql: string): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try { await client.query(sql); } finally { await client.end(); }
}

interface Run { command: string; code: number; stdout: string; stderr: string; json: any }
const commandLog: Run[] = [];

/** Runs a real npm script, records the exact command line, and returns its parsed output. */
function run(url: string, script: string, args: string[]): Promise<Run> {
  const command = `DATABASE_URL=<disposable> npm run ${script} -- ${args.join(' ')}`;
  return new Promise(resolve => {
    const child = spawn('npm', ['run', script, '--silent', '--', ...args], {
      cwd: join(__dirname, '..'), env: { ...process.env, DATABASE_URL: url },
    });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', c => { stdout += c; });
    child.stderr.on('data', c => { stderr += c; });
    child.on('close', code => {
      let json: any = null;
      const source = stdout.trim() || stderr.trim();
      const start = source.indexOf('{');
      if (start >= 0) { try { json = JSON.parse(source.slice(start)); } catch { /* not json */ } }
      const result = { command, code: code ?? -1, stdout, stderr, json };
      commandLog.push(result);
      console.log(`      $ ${command}`);
      console.log(`        exit ${result.code}`);
      resolve(result);
    });
  });
}

/** Runs a raw CLI (the migration runner has no npm script wrapper for revert). */
function runRaw(url: string, argv: string[]): Promise<Run> {
  const command = `DATABASE_URL=<disposable> ${argv.join(' ')}`;
  return new Promise(resolve => {
    const child = spawn(argv[0], argv.slice(1), {
      cwd: join(__dirname, '..'), env: { ...process.env, DATABASE_URL: url },
    });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', c => { stdout += c; });
    child.stderr.on('data', c => { stderr += c; });
    child.on('close', code => {
      const result = { command, code: code ?? -1, stdout, stderr, json: null };
      commandLog.push(result);
      console.log(`      $ ${command}`);
      console.log(`        exit ${result.code}`);
      resolve(result);
    });
  });
}

async function corpusFingerprint(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT COUNT(*)::int AS row_count,
           md5(string_agg(whole, '|' ORDER BY whole)) AS digest,
           COUNT(*) FILTER (WHERE source_key IS NOT NULL)::int AS with_source_key,
           COUNT(*) FILTER (WHERE release_id IS NOT NULL)::int AS with_release_id
    FROM (
      SELECT md5(coalesce(agency_code,'')||coalesce(citation,'')||coalesce(title,'')||
                 coalesce(standard_text,'')||coalesce(plain_language_summary,'')||
                 coalesce(source_key,'')||coalesce(release_id,'')||
                 coalesce(normalized_record_checksum,'')) AS whole,
             source_key, release_id
      FROM standards_master) t`);
  return row as Record<string, any>;
}

/**
 * The KG-5A blocker-B4 comparison, repeated.
 *
 * For each of the 35 governed citations, the legacy input is taken from the SAME database's live
 * `standards_master` -- so the only variable between the two columns is the active pointer.
 * Legacy rows are located with the repository's own prefix-insensitive normalization, which is
 * how a bare production `1910.147` is matched to a governed `29 CFR 1910.147`.
 */
async function shadowComparison(ds: DataSource, citations: string[]) {
  const legacyRows: Array<Record<string, any>> = await ds.query(
    `SELECT agency_code, citation, standard_text, plain_language_summary, scope_code
     FROM standards_master`);
  const legacyByKey = new Map<string, Record<string, any>>();
  for (const row of legacyRows) {
    const key = normalizeCitationForMatch(row.citation);
    if (!legacyByKey.has(key)) legacyByKey.set(key, row);
  }

  const pin = await pinGovernedRelease(ds, 'SHADOW');
  const rows: Array<{
    citation: string; legacyRowPresent: boolean; resolverHealth: string;
    governedBackingState: string; mismatch: string; severity: string;
  }> = [];
  for (const citation of citations) {
    const governed = await resolveGoverned(ds, pin, citation);
    const legacy = legacyByKey.get(normalizeCitationForMatch(citation)) ?? null;
    const classified = classifyShadowComparison({
      governed,
      legacyCitation: legacy?.citation ?? null,
      legacyText: legacy?.standard_text ?? legacy?.plain_language_summary ?? null,
      legacyBackingState: legacy ? 'CORPUS_BACKED' : 'CITATION_ONLY',
      applicability: 'SUPPORTED',
      legacyJurisdiction: legacy?.scope_code ?? null,
      governedJurisdiction: governed.jurisdiction,
    });
    rows.push({
      citation,
      legacyRowPresent: !!legacy,
      resolverHealth: governed.health,
      governedBackingState: governed.backing,
      mismatch: classified.mismatch,
      severity: classified.severity,
    });
  }

  const tally = (field: 'resolverHealth' | 'governedBackingState' | 'mismatch' | 'severity') => {
    const counts: Record<string, number> = {};
    for (const row of rows) counts[String(row[field])] = (counts[String(row[field])] ?? 0) + 1;
    return counts;
  };
  return {
    pinnedRelease: pin.releaseId, pinReason: pin.reason, comparisons: rows.length,
    resolverHealth: tally('resolverHealth'),
    governedBackingState: tally('governedBackingState'),
    mismatch: tally('mismatch'),
    severity: tally('severity'),
    blocking: rows.filter(r => r.severity === 'BLOCKING').length,
    rows,
  };
}

async function main() {
  console.log('KG-5B -- full operator rehearsal on a production-shaped database');

  await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  await admin(`CREATE DATABASE ${DATABASE} TEMPLATE ${PREKG_TEMPLATE}`);
  const url = ADMIN_URL.replace(/\/[^/]*$/, `/${DATABASE}`);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });

  const definition = loadReleaseDefinition(RELEASE_ID);
  const manifest = definition.expectedManifestChecksum as string;
  let ds: DataSource | null = null;
  const evidence: Record<string, unknown> = {};

  try {
    // ---------------------------------------------------------------- 1. migrations
    step(1, 'Apply the six production migrations');
    const preMigration = new DataSource({ type: 'postgres', url, entities: [], synchronize: false });
    await preMigration.initialize();
    const beforeMigration = await corpusFingerprint(preMigration);
    const [preCount] = await preMigration.query('SELECT COUNT(*)::int AS n FROM migrations');
    await preMigration.destroy();
    must('database starts at production\'s pre-KG shape: 40 migrations', preCount.n === 40, preCount.n);

    const migrated = await run(url, 'migration:run', []);
    must('migrations applied cleanly', migrated.code === 0, migrated.stderr.slice(0, 300));

    ds = new DataSource({
      type: 'postgres', url, synchronize: false,
      entities: [RegulatoryRelease, RegulatoryReleaseRecord, RegulatoryReleaseRecordReview,
        KnowledgeReleaseEvent],
    });
    await ds.initialize();
    const [postCount] = await ds.query('SELECT COUNT(*)::int AS n FROM migrations');
    must('46 migrations recorded', postCount.n === 46, postCount.n);
    const afterMigration = await corpusFingerprint(ds);
    must('migrations did not touch the legacy corpus',
      beforeMigration.digest === afterMigration.digest);
    evidence.migrations = { before: preCount.n, after: postCount.n, corpusUnchanged: true };

    // ---------------------------------------------------------------- 2. prepare
    step(2, 'Prepare the governed release (dry run, then for real)');
    const prepareDry = await run(url, 'release', ['prepare', '--release-id', RELEASE_ID, '--dry-run']);
    must('prepare --dry-run succeeds', prepareDry.code === 0);
    must('prepare --dry-run reproduces the pinned manifest',
      prepareDry.json?.reproducedPinnedManifest === true);
    const [afterDry] = await ds.query('SELECT COUNT(*)::int AS n FROM regulatory_releases');
    must('prepare --dry-run wrote nothing', afterDry.n === 0, afterDry.n);

    const prepared = await run(url, 'release', ['prepare', '--release-id', RELEASE_ID]);
    must('prepare succeeds', prepared.code === 0, prepared.stderr.slice(0, 300));
    must('prepare produced 35 records', prepared.json?.recordCount === 35);
    must('prepare produced the pinned manifest', prepared.json?.manifestChecksum === manifest);
    must('prepare produced a PROVISIONAL release', prepared.json?.status === 'provisional');
    must('prepare approved nothing', prepared.json?.reviewState?.reviewer_approved === 0);
    evidence.prepare = {
      recordCount: prepared.json?.recordCount, manifest: prepared.json?.manifestChecksum,
      reproducedPinnedManifest: prepared.json?.reproducedPinnedManifest,
      placeholderSourceRecords: prepared.json?.placeholderSourceRecords,
    };

    // ---------------------------------------------------------------- 3. corpus unchanged
    step(3, 'Verify the legacy corpus is unchanged');
    const afterPrepare = await corpusFingerprint(ds);
    must('legacy row count unchanged', afterPrepare.row_count === afterMigration.row_count,
      { before: afterMigration.row_count, after: afterPrepare.row_count });
    must('legacy corpus digest unchanged', afterPrepare.digest === afterMigration.digest);
    must('source_key still NULL on every legacy row', afterPrepare.with_source_key === 0);
    must('release_id still NULL on every legacy row', afterPrepare.with_release_id === 0);
    evidence.legacyCorpus = {
      rows: afterPrepare.row_count, digestUnchanged: true,
      rowsWithSourceKey: afterPrepare.with_source_key,
      rowsWithReleaseId: afterPrepare.with_release_id,
    };

    // ---------------------------------------------------------------- 4. status
    step(4, 'Inspect release status');
    const status = await run(url, 'release', ['status']);
    must('status succeeds', status.code === 0);
    must('status reports no active release yet', status.json?.activeRelease === null);

    // ---------------------------------------------------------------- 5. review + approve
    step(5, 'Review, then append reviewer approvals one record at a time');
    const listed = await run(url, 'review:release-record', ['list', '--release', RELEASE_ID]);
    must('the reviewer can list what is about to be attested to', listed.code === 0);

    const packet = require(join(EVIDENCE, '..', 'kg-5a', 'contracts',
      'production-release-review-packet.json'));
    const reattest: string[] = packet.rows
      .filter((row: any) => row.recommendedDecision === 'REATTEST')
      .map((row: any) => row.citation);
    must('the KG-5A packet names 27 REATTEST records', reattest.length === 27, reattest.length);

    const checksums = new Map<string, string>((await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records WHERE "releaseId" = $1`,
      [RELEASE_ID])).map((r: any) => [r.citation, r.recordChecksum]));

    // A deliberately wrong checksum first: the reviewer must be refused.
    const wrongChecksum = await run(url, 'review:release-record', ['approve',
      '--release', RELEASE_ID, '--citation', reattest[0],
      '--expected-checksum', 'd'.repeat(64), '--reviewer', REVIEWER]);
    must('approval is refused when the reviewer names the wrong checksum',
      wrongChecksum.code === 2, wrongChecksum.code);

    let approved = 0;
    for (const citation of reattest) {
      const result = await run(url, 'review:release-record', ['approve',
        '--release', RELEASE_ID, '--citation', citation,
        '--expected-checksum', checksums.get(citation) as string,
        '--reviewer', REVIEWER, '--role', 'safety-regulatory-reviewer',
        '--note', 'KG-5B rehearsal: re-attesting the recorded KG-3D/3E/4A clause comparison.']);
      if (result.code === 0) approved++;
    }
    must('27 approvals were appended, one at a time', approved === 27, approved);
    const [governed] = await ds.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_release_record_reviews
       WHERE "releaseId" = $1 AND decision = 'approved'`, [RELEASE_ID]);
    must('27 approval decisions are recorded', governed.n === 27, governed.n);
    evidence.approvals = { appended: approved, refusedOnWrongChecksum: wrongChecksum.code === 2 };

    // ---------------------------------------------------------------- 6. SHADOW, no active release
    step(6, 'SHADOW comparison BEFORE activation (no active release)');
    const citations = [...checksums.keys()].sort();
    const shadowBefore = await shadowComparison(ds, citations);
    must('with no active release, every citation reports a resolver failure',
      shadowBefore.mismatch.RESOLVER_FAILURE === 35, shadowBefore.mismatch);
    must('with no active release, resolver health is NO_ACTIVE_RELEASE for every citation',
      shadowBefore.resolverHealth.NO_ACTIVE_RELEASE === 35, shadowBefore.resolverHealth);
    must('a resolver failure is never BLOCKING', shadowBefore.blocking === 0, shadowBefore.blocking);
    evidence.shadowBeforeActivation = {
      pinnedRelease: shadowBefore.pinnedRelease, comparisons: shadowBefore.comparisons,
      resolverHealth: shadowBefore.resolverHealth,
      governedBackingState: shadowBefore.governedBackingState,
      mismatch: shadowBefore.mismatch, severity: shadowBefore.severity,
      blocking: shadowBefore.blocking,
    };

    // ---------------------------------------------------------------- 7-8. finalization gates, activate
    step(7, 'Evaluate the finalization gates (activation dry run: zero writes)');
    // Reviewer approvals write lifecycle events of their own, so the property under test is that
    // the dry run ADDS none -- a rehearsal must not appear in the audit log as a pointer move.
    const eventsBeforeDryRun =
      (await ds.query('SELECT COUNT(*)::int AS n FROM knowledge_release_events'))[0].n;
    const activateDry = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR, '--dry-run']);
    must('the activation dry run succeeds', activateDry.code === 0, activateDry.stderr.slice(0, 200));
    must('all eight finalization gates are reported',
      (activateDry.json?.gates ?? []).length === 8);
    must('all eight gates pass with 27 of 35 approved',
      activateDry.json?.wouldSucceed === true, activateDry.json?.failedGates);
    const eventsAfterDryRun =
      (await ds.query('SELECT COUNT(*)::int AS n FROM knowledge_release_events'))[0].n;
    must('the dry run wrote no lifecycle event',
      eventsAfterDryRun === eventsBeforeDryRun,
      { before: eventsBeforeDryRun, after: eventsAfterDryRun });
    evidence.finalizationGates = {
      gates: activateDry.json?.gates, wouldSucceed: activateDry.json?.wouldSucceed,
      approvedAtGateTime: 27, totalRecords: 35,
    };

    step(8, 'Activate');
    const activated = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR,
      '--reason', 'KG-5B rehearsal']);
    must('activation succeeds', activated.code === 0, activated.stderr.slice(0, 300));
    must('the active pointer is the reviewed release',
      activated.json?.activeReleaseAfter === RELEASE_ID);

    step(9, 'Verify the active pointer');
    const statusActive = await run(url, 'release', ['status']);
    must('status reports the active release', statusActive.json?.activeRelease === RELEASE_ID);
    must('status reports the active manifest', statusActive.json?.activeManifest === manifest);
    must('status reports the manifest still verifies',
      (statusActive.json?.releasesInDatabase ?? []).every((r: any) => r.manifestVerifies === true));

    // ---------------------------------------------------------------- 10. SHADOW, active release
    step(10, 'SHADOW comparison AFTER activation');
    const shadowAfter = await shadowComparison(ds, citations);
    must('the resolver is healthy for every citation',
      shadowAfter.resolverHealth.OK === 35, shadowAfter.resolverHealth);
    must('no citation reports a resolver failure',
      !shadowAfter.mismatch.RESOLVER_FAILURE, shadowAfter.mismatch);
    must('27 citations resolve as APPROVED_EXACT',
      shadowAfter.governedBackingState.APPROVED_EXACT === 27,
      shadowAfter.governedBackingState);
    must('the 8 unapproved records resolve as GOVERNED_UNAPPROVED, not as an error',
      shadowAfter.mismatch.GOVERNED_UNAPPROVED === 8, shadowAfter.mismatch);
    must('zero mismatches are caused by a release-construction defect',
      !shadowAfter.mismatch.INTEGRITY_FAILURE && !shadowAfter.mismatch.CITATION_DIFFERENCE
      && !shadowAfter.mismatch.RESOLVER_FAILURE && !shadowAfter.mismatch.GRANULARITY_DIFFERENCE,
      shadowAfter.mismatch);

    // ------------------------------------------------------------------------ KG5B-DISC-01
    //
    // THE FINDING. Against production's REAL corpus, 15 of the 27 approved records classify as
    // CONTENT_DIFFERENCE and therefore BLOCKING. This is not a release defect -- every digest
    // reproduces, the corpus is untouched and the resolver is healthy on all 35. It is the corpus
    // content divergence the KG-5A review packet already documented, measured through the shadow
    // classifier for the first time: production carries the full eCFR section dump (56,026 bytes
    // for 1910.1200) where the governed record carries the reviewed, clause-accurate 1,141-byte
    // artifact.
    //
    // WHY THIS DIFFERS FROM KG-5A's RESULT. KG-5A's "release active" column showed EXACT_MATCH on
    // all 35 because it ran against a corpus that had been REPLACED by the governed rows -- the
    // very step KG-5A then proved unsafe. Under KG-5B the legacy corpus is untouched by
    // construction, so the comparison finally reports what Stage-1 SHADOW would actually report in
    // production.
    //
    // THE CROSS-CHECK. KG-5A's reconciliation found 18 PRODUCTION_ROW_CONTENT_DIFFERS. Three of
    // those (1910.219, 30 CFR 56.14105, 30 CFR 56.15006) are NEW_REVIEW_REQUIRED and therefore
    // never reach a content comparison -- they resolve UNAPPROVED_RECORD first. 18 - 3 = 15,
    // arrived at by a completely different method. The two measurements agree exactly.
    //
    // WHAT IT MEANS. BLOCKING is defined as "would put a materially wrong claim in front of a
    // customer IF GOVERNED MODE WERE ENABLED". It does not block SHADOW, which is
    // customer-invisible, and it does not block activation with the cutover variables absent. It
    // does mean these 15 records must be adjudicated before any governed DELIVERY.
    const packetContentDiffers = packet.rows.filter((row: any) =>
      row.productionRowReconciliation === 'PRODUCTION_ROW_CONTENT_DIFFERS');
    const contentDiffersAndApproved = packetContentDiffers.filter((row: any) =>
      row.recommendedDecision === 'REATTEST');
    must('KG5B-DISC-01: every BLOCKING comparison is a CONTENT_DIFFERENCE, never an integrity, '
      + 'citation, jurisdiction or resolver failure',
      shadowAfter.rows.filter(r => r.severity === 'BLOCKING')
        .every(r => r.mismatch === 'CONTENT_DIFFERENCE'),
      shadowAfter.mismatch);
    must('KG5B-DISC-01: the BLOCKING count equals the KG-5A CONTENT_DIFFERS rows that are also '
      + 'approved, measured two independent ways',
      shadowAfter.blocking === contentDiffersAndApproved.length,
      { shadowBlocking: shadowAfter.blocking,
        packetContentDiffers: packetContentDiffers.length,
        packetContentDiffersAndReattest: contentDiffersAndApproved.length });
    must('KG5B-DISC-01: every BLOCKING record still resolved with a healthy resolver and approved '
      + 'governed backing, so the release itself is sound',
      shadowAfter.rows.filter(r => r.severity === 'BLOCKING')
        .every(r => r.resolverHealth === 'OK' && r.governedBackingState === 'APPROVED_EXACT'));
    evidence.shadowAfterActivation = {
      pinnedRelease: shadowAfter.pinnedRelease, comparisons: shadowAfter.comparisons,
      resolverHealth: shadowAfter.resolverHealth,
      governedBackingState: shadowAfter.governedBackingState,
      mismatch: shadowAfter.mismatch, severity: shadowAfter.severity,
      blocking: shadowAfter.blocking,
      blockingRows: shadowAfter.rows.filter(r => r.severity === 'BLOCKING'),
    };

    // ---------------------------------------------------------------- 11-13. rollback
    step(11, 'Rollback dry run (zero writes)');
    // Rolling back needs a prior release. The rehearsal has exactly one, so it exercises the
    // refusal that protects an operator who names a target that cannot be rolled back to.
    const eventsBeforeRollbackDry =
      (await ds.query('SELECT COUNT(*)::int AS n FROM knowledge_release_events'))[0].n;
    const rollbackNowhere = await run(url, 'release', ['rollback', '--release-id', RELEASE_ID,
      '--expected-current', RELEASE_ID, '--actor', ACTOR, '--dry-run']);
    must('rolling back to the currently-active release is refused',
      rollbackNowhere.code === 2, rollbackNowhere.code);
    must('the refused rollback wrote no lifecycle event',
      (await ds.query('SELECT COUNT(*)::int AS n FROM knowledge_release_events'))[0].n
        === eventsBeforeRollbackDry);

    step(12, 'Activate a second release, then roll back explicitly to the first');
    // A second release makes the rollback real. Its definition is derived from the first with a
    // reduced membership, prepared through the same reviewed command path.
    const secondId = 'federal-core-2026-07-30.2';
    const secondPath = join(__dirname, '..', 'src', 'standards', 'releases', 'definitions',
      `${secondId}.json`);
    writeFileSync(secondPath, `${JSON.stringify({
      ...definition, releaseId: secondId, releaseVersion: '2026-07-30.2',
      description: 'KG-5B rehearsal only. A 20-member subset used to prove rollback moves the '
        + 'pointer between two real releases. Deleted at the end of the rehearsal.',
      members: definition.members.slice(0, 20).map(({ expectedRecordChecksum, ...rest }) => ({
        ...rest, expectedRecordChecksum,
      })),
      expectedRecordCount: 20, expectedManifestChecksum: undefined,
    }, null, 2)}\n`);

    let secondManifest = '';
    try {
      const preparedSecond = await run(url, 'release', ['prepare', '--release-id', secondId]);
      must('the second release prepares', preparedSecond.code === 0, preparedSecond.stderr.slice(0, 200));
      secondManifest = preparedSecond.json?.manifestChecksum;

      const secondChecksums = await ds.query(
        `SELECT citation, "recordChecksum" FROM regulatory_release_records
         WHERE "releaseId" = $1 ORDER BY citation LIMIT 5`, [secondId]);
      for (const record of secondChecksums) {
        await run(url, 'review:release-record', ['approve', '--release', secondId,
          '--citation', record.citation, '--expected-checksum', record.recordChecksum,
          '--reviewer', REVIEWER, '--note', 'KG-5B rehearsal.']);
      }

      const activateSecond = await run(url, 'release', ['activate', '--release-id', secondId,
        '--expected-manifest', secondManifest, '--expected-current', RELEASE_ID, '--actor', ACTOR]);
      must('the second release activates over the first',
        activateSecond.json?.activeReleaseAfter === secondId, activateSecond.json);

      const rollbackDry = await run(url, 'release', ['rollback', '--release-id', RELEASE_ID,
        '--expected-current', secondId, '--actor', ACTOR, '--dry-run']);
      must('the rollback dry run reports it would succeed',
        rollbackDry.code === 0 && rollbackDry.json?.wouldSucceed === true, rollbackDry.json);
      must('the rollback dry run did not move the pointer',
        (await ds.query(`SELECT "releaseId" FROM regulatory_releases WHERE status = 'active'`))[0]
          .releaseId === secondId);

      const rolledBack = await run(url, 'release', ['rollback', '--release-id', RELEASE_ID,
        '--expected-current', secondId, '--actor', ACTOR, '--reason', 'KG-5B rehearsal']);
      must('rollback succeeds', rolledBack.code === 0, rolledBack.stderr.slice(0, 300));
      must('the pointer returned to the first release',
        rolledBack.json?.activeReleaseAfter === RELEASE_ID);

      step(13, 'Verify pointer and history');
      const history = await ds.query(
        `SELECT "releaseId", status, "manifestChecksum", "recordCount" FROM regulatory_releases
         ORDER BY "releaseId"`);
      must('both releases are retained', history.length === 2, history.length);
      must('the release rolled off is marked rolled_back, not deleted',
        history.find((r: any) => r.releaseId === secondId)?.status === 'rolled_back');
      must('the release rolled off keeps its manifest',
        history.find((r: any) => r.releaseId === secondId)?.manifestChecksum === secondManifest);
      const [secondRecords] = await ds.query(
        `SELECT COUNT(*)::int AS n FROM regulatory_release_records WHERE "releaseId" = $1`, [secondId]);
      must('the records of the release rolled off are retained', secondRecords.n === 20, secondRecords.n);

      const events = await ds.query(
        `SELECT event, outcome, "fromReleaseId", "toReleaseId", actor FROM knowledge_release_events
         WHERE event IN ('activation','rollback') ORDER BY "createdAt"`);
      must('every pointer move is auditable with a named operator',
        events.length >= 3 && events.every((e: any) => !!e.actor), events.length);
      evidence.rollback = {
        pointerAfterRollback: RELEASE_ID,
        rolledOffReleaseStatus: 'rolled_back',
        rolledOffRecordsRetained: secondRecords.n,
        lifecycleEvents: events,
      };

      const finalCorpus = await corpusFingerprint(ds);
      must('after the entire rehearsal, the legacy corpus is still byte-identical',
        finalCorpus.digest === afterMigration.digest);
      must('after the entire rehearsal, source_key is still NULL on every legacy row',
        finalCorpus.with_source_key === 0);
      evidence.legacyCorpusAfterRehearsal = {
        rows: finalCorpus.row_count, digestUnchanged: true,
        rowsWithSourceKey: finalCorpus.with_source_key,
      };
    } finally {
      require('fs').rmSync(secondPath, { force: true });
    }

  } finally {
    if (ds) await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  }

  const passedCount = transcript.filter(t => t.passed).length;
  writeFileSync(join(EVIDENCE, 'contracts', 'operator-rehearsal.json'),
    `${JSON.stringify({
      rehearsedOn: `${PREKG_TEMPLATE} clone (production pre-KG shape, 2,390 legacy rows)`,
      assertionsPassed: passedCount, assertionsTotal: transcript.length,
      evidence, assertions: transcript,
      commands: commandLog.map(c => ({ command: c.command, exitCode: c.code })),
    }, null, 2)}\n`);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5B operator rehearsal: ${passedCount}/${transcript.length} assertions passed`);
  console.log(`${commandLog.length} reviewed commands run; 0 ad-hoc snippets required.`);
  if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
