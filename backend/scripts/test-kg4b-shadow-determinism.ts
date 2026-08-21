/**
 * KG-4B (Phase 15) -- shadow telemetry must not depend on physical row order.
 *
 * WHY THIS PHASE EXISTS. KG-3E proved, with a CLUSTER experiment, that PostgreSQL heap order was
 * silently deciding which citation a customer saw; KG-3F fixed it and locked the fix down with a
 * nine-layout harness (170/170). A mismatch CORPUS has the same exposure one layer up: if the
 * governed resolver's answer, or the classification of that answer, varied with heap order, then the
 * corpus an operator uses to decide a cutover would depend on which physical copy of the database
 * happened to serve it. Aggregates would drift between runs and blocking cases could appear or
 * vanish.
 *
 * WHAT IS COMPARED. Every citation the KG-4B corpus actually exercised is resolved against several
 * logically identical but physically different clones, and the FULL classification is compared:
 * backing state, resolver health, resolved citation, mismatch category, every secondary dimension,
 * severity, root cause -- plus the aggregate distributions, because a per-row match with a different
 * total would still mean something moved.
 *
 * DATABASE OWNERSHIP. Creates one owned clone per layout (`test_kg4b_layout_<name>`), physically
 * reorders `regulatory_release_records` inside each, and drops them all at the end. The read-only
 * source is proven unchanged.
 *
 * Usage:
 *   SOURCE_DB=test_kg4b_shadow_20260820 CORPUS_DIR=<dir> \
 *   npx ts-node scripts/test-kg4b-shadow-determinism.ts
 */
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { userInfo } from 'os';
import { DataSource } from 'typeorm';
import { pinGovernedRelease, resolveGoverned } from '../src/standards/cutover/governed-resolution';
import {
  classifyShadowComparison, type ShadowComparisonInput,
} from '../src/standards/cutover/shadow-comparison';
import type { ApplicabilityState } from '../src/standards/cutover/fallback-contract';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg4b_shadow_20260820';
const CORPUS_DIR = process.env.CORPUS_DIR || '.';
const REPORT_OUT = process.env.REPORT_OUT || '';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }
const psql = (db: string, sql: string) =>
  execFileSync('psql', ['-h', HOST, '-U', USER, '-qtA', db, '-c', sql], { encoding: 'utf8' }).trim();

if (!/^test_/.test(SOURCE_DB)) { console.error(`REFUSED: SOURCE_DB='${SOURCE_DB}' is not test_*`); process.exit(2); }
if (process.env.DATABASE_URL) console.log(`note  DATABASE_URL is set and is IGNORED; every connection names its target.`);

/**
 * Physical layouts. Each holds identical LOGICAL content and a deliberately different heap order.
 * `original` is the control; the rest are the orders most likely to expose a dependency -- citation
 * ascending and descending, parents before their own paragraphs and the reverse, and two random
 * shuffles seeded differently.
 */
const LAYOUTS: Array<{ name: string; orderBy: string }> = [
  { name: 'original', orderBy: 'ctid' },
  { name: 'citation_asc', orderBy: 'citation ASC' },
  { name: 'citation_desc', orderBy: 'citation DESC' },
  { name: 'parent_before_child', orderBy: 'length(citation) ASC, citation ASC' },
  { name: 'child_before_parent', orderBy: 'length(citation) DESC, citation ASC' },
  { name: 'random_seed_1', orderBy: 'md5(citation || \'kg4b-1\')' },
  { name: 'random_seed_2', orderBy: 'md5(citation || \'kg4b-2\')' },
];

/** The full classification of one comparison, as a comparable string. */
function fingerprint(row: Record<string, unknown>): string {
  return JSON.stringify(row);
}

async function main() {
  const events: any[] = readFileSync(join(CORPUS_DIR, 'shadow-events.jsonl'), 'utf8')
    .split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
  // One probe per (citation, applicability) actually observed, deduplicated: layout invariance is a
  // property of the resolution, so repeating identical probes adds cost without adding coverage.
  const probes = [...new Map(events.map(e =>
    [`${e.requestedCitation}|${e.applicability}|${e.legacyTextDigest ?? ''}`, {
      citation: e.requestedCitation as string,
      applicability: e.applicability as ApplicabilityState,
      legacyDigestPresent: e.legacyTextDigest !== null,
      jurisdiction: e.jurisdiction as string | null,
    }])).values()];
  assert(probes.length > 0, `derived ${probes.length} distinct probes from the ${events.length}-event corpus`);

  const sourceRecords = psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records');
  const sourceActive = psql(SOURCE_DB, `SELECT coalesce(max("releaseId"),'none') FROM regulatory_releases WHERE status='active'`);
  const activeRelease = sourceActive;
  assert(activeRelease !== 'none', `the source has an active release to resolve against (${activeRelease})`);

  const perLayout: Record<string, string[]> = {};
  const perLayoutAggregate: Record<string, Record<string, number>> = {};
  const createdDatabases: string[] = [];

  for (const layout of LAYOUTS) {
    const db = `test_kg4b_layout_${layout.name}`;
    createdDatabases.push(db);
    execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', db]);
    execFileSync('createdb', ['-h', HOST, '-U', USER, db]);
    execFileSync('bash', ['-c', `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${db}`]);

    // Physically rewrite the heap in the chosen order. Logical content is untouched.
    psql(db, `CREATE TABLE _kg4b_reorder AS SELECT * FROM regulatory_release_records ORDER BY ${layout.orderBy}`);
    psql(db, `DELETE FROM regulatory_release_records`);
    psql(db, `INSERT INTO regulatory_release_records SELECT * FROM _kg4b_reorder`);
    psql(db, `DROP TABLE _kg4b_reorder`);

    const rowCount = psql(db, 'SELECT count(*) FROM regulatory_release_records');
    if (rowCount !== sourceRecords) {
      assert(false, `[${layout.name}] reorder preserved the row count (${rowCount} vs ${sourceRecords})`);
      continue;
    }

    const ds = new DataSource({ type: 'postgres', url: `postgresql://${USER}@${HOST}:5432/${db}`, synchronize: false, logging: false });
    await ds.initialize();
    const pin = await pinGovernedRelease(ds, 'SHADOW');
    if (pin.releaseId !== activeRelease) {
      assert(false, `[${layout.name}] pinned the same active release (${pin.releaseId})`);
    }

    const fingerprints: string[] = [];
    const aggregate: Record<string, number> = {};
    for (const probe of probes) {
      const governed = await resolveGoverned(ds, pin, probe.citation);
      const input: ShadowComparisonInput = {
        governed,
        legacyCitation: probe.citation,
        // Reproduce whether the legacy side had text, without carrying the text itself.
        legacyText: probe.legacyDigestPresent ? 'legacy-body-placeholder' : null,
        legacyBackingState: 'UNAPPROVED_CONTENT',
        applicability: probe.applicability,
        legacyJurisdiction: probe.jurisdiction,
        governedJurisdiction: governed.jurisdiction,
      };
      const classified = classifyShadowComparison(input);
      fingerprints.push(fingerprint({
        citation: probe.citation,
        applicability: probe.applicability,
        resolvedCitation: governed.resolvedCitation,
        backing: governed.backing,
        health: governed.health,
        granularity: governed.granularity,
        releaseId: governed.releaseId,
        manifest: pin.manifestChecksum,
        mismatch: classified.mismatch,
        dimensions: classified.dimensions,
        severity: classified.severity,
        rootCause: classified.rootCause,
      }));
      aggregate[classified.mismatch] = (aggregate[classified.mismatch] || 0) + 1;
      aggregate[`sev:${classified.severity}`] = (aggregate[`sev:${classified.severity}`] || 0) + 1;
      aggregate[`rc:${classified.rootCause}`] = (aggregate[`rc:${classified.rootCause}`] || 0) + 1;
    }
    await ds.destroy();

    perLayout[layout.name] = fingerprints;
    perLayoutAggregate[layout.name] = aggregate;
    console.log(`      layout ${layout.name.padEnd(22)} ${fingerprints.length} probes resolved`);
  }

  // ---------------------------------------------------------------- comparison
  section('Phase 15 — every layout produces identical shadow telemetry');

  const control = perLayout.original;
  assert(Array.isArray(control) && control.length === probes.length,
    `the control layout resolved every probe (${control?.length ?? 0}/${probes.length})`);

  for (const layout of LAYOUTS) {
    if (layout.name === 'original') continue;
    const other = perLayout[layout.name];
    if (!other) { assert(false, `[${layout.name}] produced results`); continue; }
    let firstDifference: string | null = null;
    for (let index = 0; index < control.length; index++) {
      if (control[index] !== other[index]) {
        firstDifference = `probe ${index}: ${control[index]} !== ${other[index]}`;
        break;
      }
    }
    assert(firstDifference === null,
      `HARD: [${layout.name}] every probe classifies identically to the control` +
      (firstDifference ? ` — ${firstDifference.slice(0, 220)}` : ''));
    assert(JSON.stringify(perLayoutAggregate[layout.name]) === JSON.stringify(perLayoutAggregate.original),
      `HARD: [${layout.name}] the aggregate distribution is identical — no metric moved`);
  }

  // A single digest over the whole run, so a future slice can compare one value.
  const { createHash } = require('crypto');
  const digests: Record<string, string> = {};
  for (const layout of LAYOUTS) {
    if (!perLayout[layout.name]) continue;
    digests[layout.name] = createHash('sha256').update(perLayout[layout.name].join('\n')).digest('hex');
  }
  const distinctDigests = new Set(Object.values(digests));
  assert(distinctDigests.size === 1,
    `HARD: all ${Object.keys(digests).length} layouts share ONE telemetry digest (${[...distinctDigests][0]?.slice(0, 16)}…)`);

  // ---------------------------------------------------------------- cleanup + integrity
  section('Database ownership — layouts dropped, source unchanged');
  for (const db of createdDatabases) execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', db]);
  assert(psql(SOURCE_DB, 'SELECT count(*) FROM regulatory_release_records') === sourceRecords,
    `HARD: source record count unchanged (${sourceRecords})`);
  assert(psql(SOURCE_DB, `SELECT coalesce(max("releaseId"),'none') FROM regulatory_releases WHERE status='active'`) === sourceActive,
    `HARD: the source's active release is unchanged (${sourceActive})`);
  console.log(`      ${createdDatabases.length} layout databases dropped`);

  if (REPORT_OUT) {
    writeFileSync(REPORT_OUT, JSON.stringify({
      generatedBy: 'test-kg4b-shadow-determinism.ts',
      sourceDatabase: SOURCE_DB, activeRelease,
      layouts: LAYOUTS.map(l => l.name),
      probes: probes.length,
      telemetryDigest: [...distinctDigests][0] ?? null,
      digestsByLayout: digests,
      aggregateByLayout: perLayoutAggregate,
    }, null, 2));
    console.log(`\nreport written: ${REPORT_OUT}`);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
