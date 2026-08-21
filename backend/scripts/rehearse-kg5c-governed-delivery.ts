import 'dotenv/config';
import 'reflect-metadata';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { claimDatabaseOwnership } from './lib/test-database-ownership';
import { loadReleaseDefinition } from '../src/standards/releases/release-definition';
import { RegulatoryRelease } from '../src/standards/releases/regulatory-release.entity';
import { RegulatoryReleaseRecord } from '../src/standards/releases/regulatory-release-record.entity';
import { RegulatoryReleaseRecordReview } from '../src/standards/releases/regulatory-release-record-review.entity';
import { KnowledgeReleaseEvent } from '../src/standards/releases/knowledge-release-event.entity';
import { Standard } from '../src/standards/entities/standard.entity';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { SafescopeV2Service } from '../src/safescope-v2/safescope-v2.service';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';

/**
 * KG-5C -- governed CUSTOMER DELIVERY rehearsal (Phase 8).
 *
 * KG-5B rehearsed the OPERATOR sequence: prepare, review, activate, SHADOW, rollback. This
 * rehearses the same sequence with the CUSTOMER PATH exercised at each pointer state, which is the
 * thing KG-5B could not measure and the reason KG5B-DISC-01 stayed open.
 *
 * Every mutating step is a reviewed operator command run as a child process. No ad-hoc mutation
 * snippet is used anywhere.
 */

const RELEASE_ID = 'federal-core-2026-07-30.1';
const SUITE = 'kg-5c-governed-delivery-rehearsal';
const TEMPLATE = process.env.KG5C_PREKG_DB || 'test_kg5b_prekg_20260821';
const ADMIN_URL = process.env.KG5C_ADMIN_URL
  || `postgres://${process.env.USER || process.env.LOGNAME}@localhost:5432/postgres`;
const DATABASE = 'test_kg5c_mut_delivery';
const ACTOR = 'kg5c-rehearsal-operator';
const REVIEWER = 'kg5c-rehearsal-reviewer';
const ALLOWED_ACCOUNT = 'kg5c-rehearsal-principal';
const EVIDENCE = join(__dirname, '..', '..',
  'verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-5c');

const { Client } = require('pg') as { Client: new (o: { connectionString: string }) => any };

const transcript: Array<Record<string, unknown>> = [];
let failedCount = 0;
function must(name: string, condition: boolean, detail?: unknown): void {
  transcript.push({ assertion: name, passed: condition, detail: detail ?? null });
  if (!condition) { failedCount++; console.log(`  FAIL  ${name} :: ${JSON.stringify(detail)}`); }
}
function step(n: number, t: string): void { console.log(`\n[${n}] ${t}`); }
async function admin(sql: string): Promise<void> {
  const c = new Client({ connectionString: ADMIN_URL });
  await c.connect(); try { await c.query(sql); } finally { await c.end(); }
}

interface Run { command: string; code: number; stdout: string; stderr: string; json: any }
const commandLog: Run[] = [];
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
      const src = stdout.trim() || stderr.trim();
      const i = src.indexOf('{');
      if (i >= 0) { try { json = JSON.parse(src.slice(i)); } catch { /* not json */ } }
      const r = { command, code: code ?? -1, stdout, stderr, json };
      commandLog.push(r);
      console.log(`      $ ${command}`);
      console.log(`        exit ${r.code}`);
      resolve(r);
    });
  });
}

async function corpusFingerprint(ds: DataSource) {
  const [row] = await ds.query(`
    SELECT COUNT(*)::int AS row_count,
           md5(string_agg(whole, '|' ORDER BY whole)) AS digest,
           COUNT(*) FILTER (WHERE source_key IS NOT NULL)::int AS with_source_key
    FROM (SELECT md5(coalesce(agency_code,'')||coalesce(citation,'')||coalesce(title,'')||
                     coalesce(standard_text,'')||coalesce(plain_language_summary,'')||
                     coalesce(source_key,'')||coalesce(release_id,'')) AS whole, source_key
          FROM standards_master) t`);
  return row as Record<string, any>;
}

async function main() {
  console.log('KG-5C -- governed customer-delivery rehearsal on a production-shaped database');

  await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  await admin(`CREATE DATABASE ${DATABASE} TEMPLATE ${TEMPLATE}`);
  const url = ADMIN_URL.replace(/\/[^/]*$/, `/${DATABASE}`);
  await claimDatabaseOwnership({ suite: SUITE, databaseUrl: url, initializeOwnership: true });

  const definition = loadReleaseDefinition(RELEASE_ID);
  const manifest = definition.expectedManifestChecksum as string;
  let ds: DataSource | null = null;
  const evidence: Record<string, unknown> = {};

  try {
    step(1, 'Apply the six migrations to the production-shaped pre-KG database');
    const migrated = await run(url, 'migration:run', []);
    must('migrations applied', migrated.code === 0, migrated.stderr.slice(0, 200));

    ds = new DataSource({
      type: 'postgres', url, synchronize: false,
      entities: [Standard, RegulatoryRelease, RegulatoryReleaseRecord,
        RegulatoryReleaseRecordReview, KnowledgeReleaseEvent],
    });
    await ds.initialize();
    const corpusStart = await corpusFingerprint(ds);
    must('the legacy corpus holds 2,390 production-shaped rows', corpusStart.row_count === 2390,
      corpusStart.row_count);

    step(2, 'Prepare the governed release with the reviewed operator command');
    const prepared = await run(url, 'release', ['prepare', '--release-id', RELEASE_ID]);
    must('prepare succeeded', prepared.code === 0, prepared.stderr.slice(0, 200));
    must('the pinned manifest reproduced', prepared.json?.manifestChecksum === manifest);

    step(3, 'Append the 27 reviewer re-attestations, one record at a time');
    const packet = require(join(EVIDENCE, '..', 'kg-5a', 'contracts',
      'production-release-review-packet.json'));
    const reattest: string[] = packet.rows
      .filter((r: any) => r.recommendedDecision === 'REATTEST').map((r: any) => r.citation);
    const checksums = new Map<string, string>((await ds.query(
      `SELECT citation, "recordChecksum" FROM regulatory_release_records WHERE "releaseId" = $1`,
      [RELEASE_ID])).map((r: any) => [r.citation, r.recordChecksum]));
    let approved = 0;
    for (const citation of reattest) {
      const r = await run(url, 'review:release-record', ['approve', '--release', RELEASE_ID,
        '--citation', citation, '--expected-checksum', checksums.get(citation) as string,
        '--reviewer', REVIEWER, '--role', 'safety-regulatory-reviewer',
        '--note', 'KG-5C delivery rehearsal re-attestation.']);
      if (r.code === 0) approved++;
    }
    must('27 approvals appended through the reviewed command', approved === 27, approved);

    // ---------------------------------------------------------------- customer path, no release
    const applicable = new ApplicableStandardsService(ds.getRepository(Standard) as any);
    const safescope = Object.create(SafescopeV2Service.prototype) as SafescopeV2Service;
    (safescope as any).applicableStandards = applicable;
    const governedEnv = {
      GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK',
      GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: ALLOWED_ACCOUNT,
    } as Record<string, string>;
    const shadowEnv = {
      GOVERNED_CUTOVER_MODE: 'SHADOW',
      GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: ALLOWED_ACCOUNT,
    } as Record<string, string>;

    async function customerPayload(citation: string, env: Record<string, string> | null) {
      const result: any = { standardDecisions: [{ citation, applicabilityStatus: 'confirmed' }] };
      const cutover = env
        ? await GovernedCutoverContext.create({
            principal: { userId: ALLOWED_ACCOUNT }, dataSource: ds!, env,
            analysisTraceId: 'kg5c-rehearsal' })
        : null;
      const out = await (safescope as any).hydrateFindingScopedStandards(result, cutover);
      return out.standardDecisions[0];
    }
    const sample = reattest.slice(0, 8);

    step(4, 'Exercise the customer path BEFORE activation');
    const beforeActivation: any[] = [];
    for (const c of sample) beforeActivation.push(await customerPayload(c, governedEnv));
    must('with no active release, nothing is presented as approved',
      beforeActivation.every(p => p.backingStatus !== 'APPROVED_GOVERNED_CONTENT'),
      beforeActivation.map(p => p.backingStatus));
    must('with no active release, the fallback reason is NO_ACTIVE_GOVERNED_RELEASE',
      beforeActivation.every(p => p.governedFallbackReason === 'NO_ACTIVE_GOVERNED_RELEASE'),
      Array.from(new Set(beforeActivation.map(p => p.governedFallbackReason))));

    step(5, 'Activate with the reviewed operator command');
    const activateDry = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR, '--dry-run']);
    must('the activation dry run reports all eight gates would pass',
      activateDry.json?.wouldSucceed === true, activateDry.json?.failedGates);
    const activated = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR,
      '--reason', 'KG-5C delivery rehearsal']);
    must('activation succeeded', activated.json?.activeReleaseAfter === RELEASE_ID);

    step(6, 'Exercise the customer path AFTER activation (cutover controls in test config only)');
    const legacyAfter: any[] = [];
    const governedAfter: any[] = [];
    const shadowAfter: any[] = [];
    for (const c of sample) {
      legacyAfter.push(await customerPayload(c, null));
      governedAfter.push(await customerPayload(c, governedEnv));
      shadowAfter.push(await customerPayload(c, shadowEnv));
    }
    must('LEGACY customers are unaffected by the active release',
      legacyAfter.every(p => p.backingStatus === 'UNAPPROVED_CONTENT'
        || p.backingStatus === 'CITATION_ONLY'),
      Array.from(new Set(legacyAfter.map(p => p.backingStatus))));
    must('LEGACY payloads carry NO governed keys',
      legacyAfter.every(p => p.governedDeliveryState === undefined
        && p.knowledgeReleaseId === undefined));
    must('SHADOW payloads are byte-identical to LEGACY payloads',
      JSON.stringify(shadowAfter) === JSON.stringify(legacyAfter));
    must('SHADOW payloads carry NO governed keys',
      shadowAfter.every(p => p.governedDeliveryState === undefined
        && p.knowledgeReleaseId === undefined));
    must('GOVERNED customers receive APPROVED_GOVERNED_CONTENT',
      governedAfter.every(p => p.backingStatus === 'APPROVED_GOVERNED_CONTENT'),
      Array.from(new Set(governedAfter.map(p => p.backingStatus))));
    must('GOVERNED delivery is GOVERNED_VERIFIED_TEXT',
      governedAfter.every(p => p.governedDeliveryState === 'GOVERNED_VERIFIED_TEXT'));

    step(7, 'Collect legacy vs governed equivalence evidence');
    const frozen = new Map<string, string>((await ds.query(
      `SELECT citation, payload FROM regulatory_release_records WHERE "releaseId" = $1`,
      [RELEASE_ID])).map((r: any) =>
        [r.citation, String(r.payload.canonicalText || r.payload.summary || '')]));
    const pairs = sample.map((c, i) => ({
      citation: c,
      legacyBodyLength: String(legacyAfter[i].standardText
        || legacyAfter[i].plainLanguageSummary || '').length,
      governedBodyLength: String(governedAfter[i].standardText
        || governedAfter[i].plainLanguageSummary || '').length,
      deliveredIsFrozenArtifact: String(governedAfter[i].standardText
        || governedAfter[i].plainLanguageSummary || '') === frozen.get(c),
    }));
    must('every governed delivery is byte-for-byte the frozen reviewed artifact',
      pairs.every(p => p.deliveredIsFrozenArtifact),
      pairs.filter(p => !p.deliveredIsFrozenArtifact).map(p => p.citation));
    evidence.customerDelivery = pairs;

    step(8, 'Stale-operator and concurrency cases');
    const stale = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', manifest, '--expected-current', 'none', '--actor', ACTOR]);
    must('a stale --expected-current is refused after activation', stale.code === 2, stale.code);
    const wrongManifest = await run(url, 'release', ['activate', '--release-id', RELEASE_ID,
      '--expected-manifest', 'a'.repeat(64), '--expected-current', RELEASE_ID, '--actor', ACTOR]);
    must('a wrong --expected-manifest is refused', wrongManifest.code === 2);

    step(9, 'Roll back with the reviewed operator command, then re-check the customer path');
    const rollbackNoTarget = await run(url, 'release', ['rollback', '--release-id', RELEASE_ID,
      '--expected-current', RELEASE_ID, '--actor', ACTOR]);
    must('rolling back to the active release is refused', rollbackNoTarget.code === 2);

    // A real rollback needs a prior release. Prepare and activate a second, then roll back to the
    // first -- all through reviewed commands.
    const secondId = 'federal-core-2026-07-30.2';
    const secondPath = join(__dirname, '..', 'src', 'standards', 'releases', 'definitions',
      `${secondId}.json`);
    writeFileSync(secondPath, `${JSON.stringify({
      ...definition, releaseId: secondId, releaseVersion: '2026-07-30.2',
      description: 'KG-5C rehearsal only. Deleted at the end of the rehearsal.',
      members: definition.members.slice(0, 20), expectedRecordCount: 20,
      expectedManifestChecksum: undefined,
    }, null, 2)}\n`);
    try {
      const p2 = await run(url, 'release', ['prepare', '--release-id', secondId]);
      must('the second release prepares', p2.code === 0);
      const secondManifest = p2.json?.manifestChecksum;
      for (const r of (await ds.query(
        `SELECT citation, "recordChecksum" FROM regulatory_release_records
         WHERE "releaseId" = $1 ORDER BY citation LIMIT 3`, [secondId]))) {
        await run(url, 'review:release-record', ['approve', '--release', secondId,
          '--citation', r.citation, '--expected-checksum', r.recordChecksum,
          '--reviewer', REVIEWER, '--note', 'KG-5C rehearsal.']);
      }
      const a2 = await run(url, 'release', ['activate', '--release-id', secondId,
        '--expected-manifest', secondManifest, '--expected-current', RELEASE_ID, '--actor', ACTOR]);
      must('the second release activates', a2.json?.activeReleaseAfter === secondId);

      const rb = await run(url, 'release', ['rollback', '--release-id', RELEASE_ID,
        '--expected-current', secondId, '--actor', ACTOR, '--reason', 'KG-5C rehearsal']);
      must('rollback returned the pointer to the exact prior release',
        rb.json?.activeReleaseAfter === RELEASE_ID, rb.json);

      const afterRollback: any[] = [];
      for (const c of sample) afterRollback.push(await customerPayload(c, governedEnv));
      must('after rollback the customer path serves the first release again',
        afterRollback.every(p => p.knowledgeReleaseId === RELEASE_ID),
        Array.from(new Set(afterRollback.map(p => p.knowledgeReleaseId))));
      must('after rollback the delivered text is still the frozen reviewed artifact',
        afterRollback.every((p, i) => String(p.standardText || p.plainLanguageSummary || '')
          === frozen.get(sample[i])));
      const [second] = await ds.query(
        `SELECT status FROM regulatory_releases WHERE "releaseId" = $1`, [secondId]);
      must('the release rolled off is retained as rolled_back', second?.status === 'rolled_back');
    } finally {
      require('fs').rmSync(secondPath, { force: true });
    }

    step(10, 'Legacy corpus non-mutation across the entire rehearsal');
    const corpusEnd = await corpusFingerprint(ds);
    must('legacy row count unchanged', corpusEnd.row_count === corpusStart.row_count);
    must('legacy corpus digest unchanged', corpusEnd.digest === corpusStart.digest);
    must('source_key still NULL on every legacy row', corpusEnd.with_source_key === 0);
    evidence.legacyCorpus = {
      rows: corpusEnd.row_count, digestUnchanged: corpusEnd.digest === corpusStart.digest,
      rowsWithSourceKey: corpusEnd.with_source_key,
    };

  } finally {
    if (ds) await ds.destroy().catch(() => undefined);
    await admin(`DROP DATABASE IF EXISTS ${DATABASE}`);
  }

  const passedCount = transcript.filter(t => t.passed).length;
  writeFileSync(join(EVIDENCE, 'contracts', 'governed-delivery-rehearsal.json'),
    `${JSON.stringify({
      rehearsedOn: `${TEMPLATE} clone (production pre-KG shape, 2,390 legacy rows)`,
      assertionsPassed: passedCount, assertionsTotal: transcript.length,
      evidence, assertions: transcript,
      commands: commandLog.map(c => ({ command: c.command, exitCode: c.code })),
    }, null, 2)}\n`);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`KG-5C governed delivery rehearsal: ${passedCount}/${transcript.length} assertions passed`);
  console.log(`${commandLog.length} reviewed commands run; 0 ad-hoc snippets required.`);
  if (failedCount) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
