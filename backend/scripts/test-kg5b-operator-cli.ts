import 'dotenv/config';
import 'reflect-metadata';
import { spawn } from 'child_process';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import { prepareGovernedRelease } from '../src/standards/releases/governed-release-builder';
import { ReleaseDefinition, loadReleaseDefinition } from '../src/standards/releases/release-definition';
import { ReleaseRecordReviewService } from '../src/standards/releases/release-record-review.service';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';

/**
 * KG-5B -- the operator activation/rollback command contract (KG5A-DISC-03, Phases 14-17).
 *
 * Every case here runs the REAL CLI as a child process with a real `DATABASE_URL`, because the
 * thing under test is the operator interface -- argument parsing, refusal exit codes and printed
 * output included -- not the service methods underneath it, which KG-2 already covers.
 *
 * The properties this suite exists to hold:
 *   - activation and rollback demand exact identities and refuse stale ones;
 *   - there is no "activate latest", no prefix match and no fuzzy lookup;
 *   - a dry run performs zero writes and emits no lifecycle event;
 *   - a race between two operators resolves to exactly one winner;
 *   - rollback returns the pointer without deleting or rewriting the release rolled off.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SECOND_RELEASE_ID = 'federal-core-2026-07-30.2';
const SUITE = 'kg-5b-operator-cli';
const TEMPLATE = process.env.KG5B_TEMPLATE_DB || 'test_kg5b_prodshape_20260821';
const ADMIN_URL = process.env.KG5B_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const CLI = join(__dirname, 'regulatory-release.ts');
const ACTOR = 'kg5b-operator';

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail?: unknown): void {
  if (condition) { passed++; return; }
  failed++;
  const line = `${name}${detail === undefined ? '' : ` :: ${JSON.stringify(detail)}`}`;
  failures.push(line);
  console.log(`  FAIL  ${line}`);
}

function section(title: string): void {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
}

interface CliResult { code: number; stdout: string; stderr: string; json: any }

/** Runs the operator CLI exactly as a human or a runbook step would. */
function cli(databaseUrl: string, args: string[]): Promise<CliResult> {
  return new Promise(resolve => {
    const child = spawn('npx', ['ts-node', CLI, ...args], {
      cwd: join(__dirname, '..'),
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    let stdout = ''; let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', code => {
      let json: any = null;
      const source = stdout.trim() || stderr.trim();
      const start = source.indexOf('{');
      if (start >= 0) { try { json = JSON.parse(source.slice(start)); } catch { json = null; } }
      resolve({ code: code ?? -1, stdout, stderr, json });
    });
  });
}

async function admin(sql: string): Promise<void> {
  const client = new Client({ connectionString: ADMIN_URL });
  await client.connect();
  try { await client.query(sql); } finally { await client.end(); }
}

function urlFor(database: string): string {
  return ADMIN_URL.replace(/\/[^/]*$/, `/${database}`);
}

async function main() {
  console.log('KG-5B -- operator activation/rollback command contract');

  const database = 'test_kg5b_mut_operator';
  await admin(`DROP DATABASE IF EXISTS ${database}`);
  await admin(`CREATE DATABASE ${database} TEMPLATE ${TEMPLATE}`);
  const url = urlFor(database);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });

  const ds = new DataSource({
    type: 'postgres', url, synchronize: false,
    entities: [RegulatoryRelease, RegulatoryReleaseRecord, RegulatoryReleaseRecordReview,
      KnowledgeReleaseEvent],
  });
  await ds.initialize();

  try {
    const definition = loadReleaseDefinition(RELEASE_ID);

    // ---------------------------------------------------------------- setup: R1 and R2
    // R2 is a genuinely different release (a 20-member subset), so the rollback test moves the
    // pointer between two releases whose manifests differ -- the case that matters.
    const secondDefinition: ReleaseDefinition = {
      ...definition,
      releaseId: SECOND_RELEASE_ID,
      releaseVersion: '2026-07-30.2',
      members: definition.members.slice(0, 20),
      expectedManifestChecksum: undefined,
      expectedRecordCount: undefined,
    };

    section('1. prepare, and what prepare refuses to do');
    const prepareDry = await cli(url, ['prepare', '--release-id', RELEASE_ID, '--dry-run']);
    check('prepare --dry-run exits 0', prepareDry.code === 0, prepareDry.stderr.slice(0, 300));
    check('prepare --dry-run reproduces the pinned manifest',
      prepareDry.json?.reproducedPinnedManifest === true);
    const [afterDryRun] = await ds.query('SELECT COUNT(*)::int AS n FROM regulatory_releases');
    check('prepare --dry-run wrote no release row', afterDryRun.n === 0, afterDryRun.n);

    const prepared = await cli(url, ['prepare', '--release-id', RELEASE_ID]);
    check('prepare exits 0', prepared.code === 0, prepared.stderr.slice(0, 300));
    check('prepare creates a PROVISIONAL release, never an active one',
      prepared.json?.status === 'provisional');
    check('prepare approves nothing', prepared.json?.reviewState?.reviewer_approved === 0);
    const [activeAfterPrepare] = await ds.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE status = 'active'`);
    check('prepare activates nothing', activeAfterPrepare.n === 0);

    const unknownDefinition = await cli(url, ['prepare', '--release-id', 'no-such-release']);
    check('prepare refuses a release with no version-controlled definition',
      unknownDefinition.code === 2 && unknownDefinition.json?.code === 'RELEASE_DEFINITION_INVALID');

    await prepareGovernedRelease(ds, secondDefinition);

    section('2. Activation refusal matrix (Phase 14)');
    const manifest = definition.expectedManifestChecksum as string;

    const noApprovals = await cli(url, ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR]);
    check('activation is refused while no record is approved',
      noApprovals.code === 2 && (noApprovals.json?.failedGates ?? []).includes('governedRecordsPresent'),
      noApprovals.json?.failedGates);

    // Approve the emitted-set records through the EXISTING reviewer command's service, one at a
    // time against an exact checksum. Nothing is bulk-approved and nothing is imported.
    const reviews = new ReleaseRecordReviewService(ds);
    const toApprove = await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation LIMIT 27`, [RELEASE_ID]);
    for (const record of toApprove) {
      await reviews.approveRecord({
        releaseId: RELEASE_ID, citation: record.citation,
        expectedChecksum: record.recordChecksum, reviewerId: 'kg5b-verification-reviewer',
        reviewerRole: 'verification', note: 'KG-5B operator rehearsal.',
      });
    }
    for (const record of (await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY "agencyCode", citation LIMIT 5`, [SECOND_RELEASE_ID]))) {
      await reviews.approveRecord({
        releaseId: SECOND_RELEASE_ID, citation: record.citation,
        expectedChecksum: record.recordChecksum, reviewerId: 'kg5b-verification-reviewer',
        reviewerRole: 'verification', note: 'KG-5B operator rehearsal.',
      });
    }

    const refusalCases: Array<{ name: string; args: string[]; expect: string }> = [
      { name: 'unknown release id', expect: 'UNKNOWN_RELEASE',
        args: ['activate', '--release-id', 'federal-core-9999', '--expected-manifest', manifest,
          '--expected-current', 'none', '--actor', ACTOR] },
      { name: 'prefix of a real release id is NOT accepted', expect: 'UNKNOWN_RELEASE',
        args: ['activate', '--release-id', 'federal-core', '--expected-manifest', manifest,
          '--expected-current', 'none', '--actor', ACTOR] },
      { name: 'wrong expected manifest', expect: 'MANIFEST_MISMATCH',
        args: ['activate', '--release-id', RELEASE_ID, '--expected-manifest', 'b'.repeat(64),
          '--expected-current', 'none', '--actor', ACTOR] },
      { name: 'stale expected-current pointer', expect: 'STALE_EXPECTED_CURRENT',
        args: ['activate', '--release-id', RELEASE_ID, '--expected-manifest', manifest,
          '--expected-current', SECOND_RELEASE_ID, '--actor', ACTOR] },
    ];
    for (const testCase of refusalCases) {
      const result = await cli(url, testCase.args);
      check(`activation refused: ${testCase.name}`,
        result.code === 2
        && (result.json?.refusals ?? []).some((r: string) => r.startsWith(testCase.expect)),
        { code: result.code, refusals: result.json?.refusals });
    }

    const malformed: Array<{ name: string; args: string[] }> = [
      { name: 'missing --release-id', args: ['activate', '--expected-manifest', manifest,
        '--expected-current', 'none', '--actor', ACTOR] },
      { name: 'missing --expected-manifest', args: ['activate', '--release-id', RELEASE_ID,
        '--expected-current', 'none', '--actor', ACTOR] },
      { name: 'missing --expected-current', args: ['activate', '--release-id', RELEASE_ID,
        '--expected-manifest', manifest, '--actor', ACTOR] },
      { name: 'missing --actor', args: ['activate', '--release-id', RELEASE_ID,
        '--expected-manifest', manifest, '--expected-current', 'none'] },
      { name: 'flag given no value swallows the next flag', args: ['activate', '--release-id',
        RELEASE_ID, '--expected-manifest', '--actor', ACTOR, '--expected-current', 'none'] },
      { name: 'no subcommand', args: ['--release-id', RELEASE_ID] },
      { name: 'unknown subcommand', args: ['publish', '--release-id', RELEASE_ID] },
      { name: 'there is no --latest', args: ['activate', '--latest', '--actor', ACTOR] },
    ];
    for (const testCase of malformed) {
      const result = await cli(url, testCase.args);
      check(`malformed arguments refused: ${testCase.name}`, result.code === 2,
        { code: result.code, stderr: result.stderr.slice(0, 160) });
    }
    const [activeStill] = await ds.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE status = 'active'`);
    check('no refusal moved the pointer', activeStill.n === 0);

    section('3. Dry run performs zero writes (Phase 17)');
    const digestBefore = await stateDigest(ds);
    const activateDry = await cli(url, ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR, '--dry-run']);
    check('activation dry run exits 0', activateDry.code === 0, activateDry.stderr.slice(0, 200));
    check('activation dry run reports it would succeed', activateDry.json?.wouldSucceed === true);
    check('activation dry run reports the target manifest',
      activateDry.json?.targetManifest === manifest);
    check('activation dry run reports the current pointer',
      activateDry.json?.pointer?.actualCurrentRelease === null);
    check('activation dry run reports the gate state',
      Array.isArray(activateDry.json?.gates) && activateDry.json.gates.length === 8);
    const digestAfter = await stateDigest(ds);
    check('activation dry run changed nothing at all',
      JSON.stringify(digestBefore) === JSON.stringify(digestAfter),
      { before: digestBefore, after: digestAfter });
    // Lifecycle events already exist at this point -- every reviewer approval and every audited
    // refusal writes one. The property under test is that the dry run ADDED none, which is the
    // failure mode that matters: a rehearsal must not appear in the audit log as a pointer move.
    check('activation dry run emitted no lifecycle event',
      digestAfter.events === digestBefore.events,
      { before: digestBefore.events, after: digestAfter.events });

    section('4. Activation (Phase 14)');
    const activated = await cli(url, ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR,
      '--reason', 'KG-5B rehearsal']);
    check('activation exits 0', activated.code === 0, activated.stderr.slice(0, 300));
    check('activation reports outcome activated', activated.json?.outcome === 'activated');
    check('the active pointer is the named release',
      activated.json?.activeReleaseAfter === RELEASE_ID);
    check('the active manifest is the reviewed manifest',
      activated.json?.activeManifestAfter === manifest);
    const [event] = await ds.query(
      `SELECT event, outcome, actor, "toReleaseId" FROM knowledge_release_events
       ORDER BY "createdAt" DESC LIMIT 1`);
    check('activation recorded an auditable operator event',
      event?.event === 'activation' && event?.outcome === 'succeeded' && event?.actor === ACTOR,
      event);

    const reactivate = await cli(url, ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', RELEASE_ID, '--actor', ACTOR]);
    check('re-activating the already-active release is an idempotent no-op',
      reactivate.code === 0 && reactivate.json?.outcome === 'already_active', reactivate.json?.outcome);

    section('5. Rollback (Phase 15)');
    // R1 active -> activate R2 -> roll back explicitly to R1.
    const secondManifest = (await ds.query(
      `SELECT "manifestChecksum" FROM regulatory_releases WHERE "releaseId" = $1`,
      [SECOND_RELEASE_ID]))[0].manifestChecksum;
    const activateSecond = await cli(url, ['activate', '--release-id', SECOND_RELEASE_ID,
      '--expected-manifest', secondManifest, '--expected-current', RELEASE_ID, '--actor', ACTOR]);
    check('R2 activates over R1', activateSecond.json?.activeReleaseAfter === SECOND_RELEASE_ID,
      activateSecond.json);

    const rollbackStale = await cli(url, ['rollback', '--release-id', RELEASE_ID,
      '--expected-current', 'none', '--actor', ACTOR]);
    check('rollback with a stale --expected-current is refused',
      rollbackStale.code === 2
      && (rollbackStale.json?.refusals ?? []).some((r: string) => r.startsWith('STALE_EXPECTED_CURRENT')));

    const rollbackToActive = await cli(url, ['rollback', '--release-id', SECOND_RELEASE_ID,
      '--expected-current', SECOND_RELEASE_ID, '--actor', ACTOR]);
    check('rollback to the release that is already active is refused',
      rollbackToActive.code === 2
      && (rollbackToActive.json?.refusals ?? []).some((r: string) => r.startsWith('ALREADY_ACTIVE')));

    const rollbackDigestBefore = await stateDigest(ds);
    const rollbackDry = await cli(url, ['rollback', '--release-id', RELEASE_ID,
      '--expected-current', SECOND_RELEASE_ID, '--actor', ACTOR, '--dry-run']);
    check('rollback dry run exits 0 and reports it would succeed',
      rollbackDry.code === 0 && rollbackDry.json?.wouldSucceed === true, rollbackDry.json);
    check('rollback dry run changed nothing at all',
      JSON.stringify(await stateDigest(ds)) === JSON.stringify(rollbackDigestBefore));

    const secondRecordsBefore = await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY citation`, [SECOND_RELEASE_ID]);
    const rolledBack = await cli(url, ['rollback', '--release-id', RELEASE_ID,
      '--expected-current', SECOND_RELEASE_ID, '--actor', ACTOR, '--reason', 'KG-5B rehearsal']);
    check('rollback exits 0', rolledBack.code === 0, rolledBack.stderr.slice(0, 300));
    check('rollback reports outcome rolled_back', rolledBack.json?.outcome === 'rolled_back');
    check('the pointer returned to the named prior release',
      rolledBack.json?.activeReleaseAfter === RELEASE_ID);

    const [secondAfter] = await ds.query(
      `SELECT status, "manifestChecksum", "recordCount" FROM regulatory_releases
       WHERE "releaseId" = $1`, [SECOND_RELEASE_ID]);
    check('the release rolled off is retained, not deleted', !!secondAfter);
    check('the release rolled off is marked rolled_back', secondAfter.status === 'rolled_back',
      secondAfter.status);
    check('the release rolled off keeps its manifest',
      secondAfter.manifestChecksum === secondManifest);
    const secondRecordsAfter = await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY citation`, [SECOND_RELEASE_ID]);
    check('the records of the release rolled off are immutable',
      JSON.stringify(secondRecordsBefore) === JSON.stringify(secondRecordsAfter));
    const [rollbackEvent] = await ds.query(
      `SELECT event, outcome, "fromReleaseId", "toReleaseId", actor FROM knowledge_release_events
       ORDER BY "createdAt" DESC LIMIT 1`);
    check('rollback recorded an auditable operator event',
      rollbackEvent?.event === 'rollback' && rollbackEvent?.outcome === 'succeeded'
      && rollbackEvent?.fromReleaseId === SECOND_RELEASE_ID
      && rollbackEvent?.toReleaseId === RELEASE_ID, rollbackEvent);

    section('6. Concurrency (Phase 16)');
    // A meaningful race needs two operators attempting DIFFERENT, individually-valid transitions
    // from the SAME believed pointer. R2 is `rolled_back` after section 5 and is therefore
    // reachable only through `rollback` -- `activate` correctly refuses a rolled-back release --
    // so the racing pair is "activate a fresh provisional R3" against "roll back to R2".
    const thirdDefinition: ReleaseDefinition = {
      ...definition,
      releaseId: 'federal-core-2026-07-30.3',
      releaseVersion: '2026-07-30.3',
      members: definition.members.slice(0, 15),
      expectedManifestChecksum: undefined,
      expectedRecordCount: undefined,
    };
    await prepareGovernedRelease(ds, thirdDefinition);
    for (const record of (await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records
       WHERE "releaseId" = $1 ORDER BY citation LIMIT 5`, [thirdDefinition.releaseId]))) {
      await reviews.approveRecord({
        releaseId: thirdDefinition.releaseId, citation: record.citation,
        expectedChecksum: record.recordChecksum, reviewerId: 'kg5b-verification-reviewer',
        reviewerRole: 'verification', note: 'KG-5B operator rehearsal.',
      });
    }
    const thirdManifest = (await ds.query(
      `SELECT "manifestChecksum" FROM regulatory_releases WHERE "releaseId" = $1`,
      [thirdDefinition.releaseId]))[0].manifestChecksum;

    const [beforeRace] = await ds.query(
      `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active'`);
    check('the race starts from a known single active release',
      beforeRace?.releaseId === RELEASE_ID, beforeRace);

    const [raceActivate, raceRollback] = await Promise.all([
      cli(url, ['activate', '--release-id', thirdDefinition.releaseId,
        '--expected-manifest', thirdManifest, '--expected-current', beforeRace.releaseId,
        '--actor', 'operator-a']),
      cli(url, ['rollback', '--release-id', SECOND_RELEASE_ID,
        '--expected-current', beforeRace.releaseId, '--actor', 'operator-b']),
    ]);
    const [afterRace] = await ds.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE status = 'active'`);
    const [winner] = await ds.query(
      `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active'`);
    const succeeded = [raceActivate, raceRollback].filter(r => r.code === 0);
    const refused = [raceActivate, raceRollback].filter(r => r.code === 2);

    check('a race never commits two active releases', afterRace.n === 1, afterRace.n);
    check('exactly one racing transition succeeded', succeeded.length === 1,
      { activate: raceActivate.code, rollback: raceRollback.code });
    check('the loser was refused, not silently overwritten', refused.length === 1);
    check('the loser was refused for a stale expected-current pointer',
      refused.length === 1
      && (refused[0].json?.refusals ?? []).some((r: string) => r.startsWith('STALE_EXPECTED_CURRENT')),
      refused[0]?.json?.refusals);
    check('the committed pointer is the winner\'s target, not a blend of the two',
      winner.releaseId === (raceActivate.code === 0 ? thirdDefinition.releaseId : SECOND_RELEASE_ID),
      { winner: winner.releaseId, activateCode: raceActivate.code });

    // Two operators issuing the SAME activation. Exactly one may report a pointer move; the
    // other must report the idempotent no-op or be refused -- never a second 'activated'.
    const [beforeDouble] = await ds.query(
      `SELECT "releaseId" FROM regulatory_releases WHERE status = 'active'`);
    const [doubleA, doubleB] = await Promise.all([
      cli(url, ['activate', '--release-id', RELEASE_ID, '--expected-manifest', manifest,
        '--expected-current', beforeDouble.releaseId, '--actor', 'operator-a']),
      cli(url, ['activate', '--release-id', RELEASE_ID, '--expected-manifest', manifest,
        '--expected-current', beforeDouble.releaseId, '--actor', 'operator-b']),
    ]);
    const [afterDouble] = await ds.query(
      `SELECT COUNT(*)::int AS n FROM regulatory_releases WHERE status = 'active'`);
    check('identical concurrent activations leave exactly one active release',
      afterDouble.n === 1, afterDouble.n);
    check('identical concurrent activations report at most one pointer move',
      [doubleA, doubleB].filter(r => r.json?.outcome === 'activated').length <= 1,
      { a: doubleA.json?.outcome ?? doubleA.code, b: doubleB.json?.outcome ?? doubleB.code });

    section('7. status');
    const status = await cli(url, ['status']);
    check('status exits 0', status.code === 0, status.stderr.slice(0, 200));
    check('status names the active release', typeof status.json?.activeRelease === 'string');
    check('status reports every release in the database',
      (status.json?.releasesInDatabase ?? []).length === 3,
      (status.json?.releasesInDatabase ?? []).length);
    check('status reports manifest verification per release',
      (status.json?.releasesInDatabase ?? []).every((r: any) => r.manifestVerifies === true));
    check('status lists the version-controlled definitions',
      (status.json?.definitionsInRepository ?? []).some((d: any) => d.releaseId === RELEASE_ID));
    const sources = await cli(url, ['sources']);
    check('sources reports the 35 governed candidate records',
      sources.code === 0 && sources.json?.governedSourceRecords === 35,
      sources.json?.governedSourceRecords);

    section('8. The legacy corpus after every operator action');
    const [corpus] = await ds.query(`
      SELECT COUNT(*)::int AS n,
             COUNT(*) FILTER (WHERE source_key IS NOT NULL)::int AS keyed,
             COUNT(*) FILTER (WHERE release_id IS NOT NULL)::int AS scoped
      FROM standards_master`);
    check('the legacy corpus still holds 2,390 rows', corpus.n === 2390, corpus.n);
    check('no operator action stamped source_key on a legacy row', corpus.keyed === 0);
    check('no operator action stamped release_id on a legacy row', corpus.scoped === 0);

  } finally {
    await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${database}`);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5B operator CLI: ${passed}/${passed + failed} checks passed`);
  if (failed) {
    console.log(`\n${failed} FAILED:`);
    for (const failure of failures) console.log(`  - ${failure}`);
    process.exitCode = 1;
  }
}

/** Everything a dry run must leave untouched. */
async function stateDigest(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT
      (SELECT COUNT(*)::int FROM knowledge_release_events) AS events,
      (SELECT md5(coalesce(string_agg("releaseId"||':'||status||':'||
                  coalesce("activatedAt"::text,'~')||':'||coalesce("deactivatedAt"::text,'~')||':'||
                  coalesce("parentReleaseId",'~'), '|' ORDER BY "releaseId"),''))
       FROM regulatory_releases) AS releases,
      (SELECT COUNT(*)::int FROM regulatory_release_records) AS records,
      (SELECT COUNT(*)::int FROM regulatory_release_record_reviews) AS reviews`);
  return row as Record<string, any>;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
