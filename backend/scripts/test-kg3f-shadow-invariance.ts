/**
 * KG-3F (Phases 13 + 18) -- is the APPROVED-ONLY governed shadow invariant to physical row order?
 *
 * WHY THIS IS A SEPARATE HARNESS FROM THE 9-LAYOUT DETERMINISM RUN. That harness proves candidate
 * RETRIEVAL is layout-invariant. This proves the governed FILTER on top of it is too. They can
 * fail independently: retrieval could be perfectly deterministic while approved-only filtering
 * still varied, because the filter joins the snapshot and the reviewer-decision log, and a
 * `DISTINCT ON` or a `LIMIT 1` over rows with equal sort keys resolves by heap order exactly like
 * the defects KG-3F Phase 2 found in the scorer. A cutover decision rests on the FILTERED result,
 * so that is the thing that has to be shown stable.
 *
 * WHY IT ACTIVATES A RELEASE, AND WHY THAT IS NOT THE CUTOVER. Governed filtering only means
 * anything against an ACTIVE release, so each disposable layout database gets one activated
 * through the real KG-2 gate. This is not "activating governed retrieval for customers": the
 * databases are throwaway clones created and dropped by this script, no customer path reads them
 * (Phase 16 proves the customer path cannot reach the governed resolver at all), and nothing is
 * activated in any durable corpus. The prior session's Phase 13 artifacts recorded
 * `activeRelease: federal-core-2026-08-20.5` for exactly this reason.
 *
 * THE COMPARISON IS BYTE-FOR-BYTE over the whole shadow report, not over a summary line. A summary
 * can agree while the per-case detail underneath it differs -- which candidate survived dedup,
 * which record supplied the backing -- and those are precisely the places a heap-order leak hides.
 *
 * Usage: SOURCE_DB=test_kg3e_remediation_20260820 RELEASE_ID=federal-core-2026-08-20.5 \
 *        npx ts-node scripts/test-kg3f-shadow-invariance.ts
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const HOST = process.env.DB_HOST || 'localhost';
const USER = process.env.DB_USERNAME || process.env.USER || 'postgres';
/**
 * The canonical KG-3F verification corpus: 34 records, `federal-core-2026-08-20.5` with its 26
 * reviewer approvals, and the same corpus the 9-layout determinism harness clones.
 *
 * Deliberately NOT `test_kg3e_remediation_20260820`. That database holds an equivalent corpus but
 * is the target several suites mutate on purpose -- `test:governed-corpus-matrix` finalizes and
 * ACTIVATES its own `kg3b-matrix.A`, and `test:release-integrity-and-approval` inserts a
 * placeholder fixture row. Sourcing a determinism proof from a database other suites rewrite makes
 * the proof unreproducible the moment the suites run in a different order.
 */
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_remediation_20260820';
const RELEASE_ID = process.env.RELEASE_ID || 'federal-core-2026-08-20.5';
const OUT_DIR = process.env.REPORT_DIR || join(__dirname, '..', '..', 'verification',
  'hazlenz-governed-knowledge-growth-2026-08-19', 'kg-3f');

const checks: string[] = [];
let failed = 0;
const assert = (cond: unknown, msg: string) => {
  if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
};

function guard(db: string) {
  if (db === 'safescope' || !/^test_/.test(db)) throw new Error(`Refusing to touch database '${db}'.`);
}

const sh = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: 'pipe' });

/**
 * The physical layouts, chosen to span the extremes of heap ordering rather than to be numerous.
 * `child_before_parent` is the one that matters most: it is the arrangement under which the
 * pre-KG-3F dedup kept the wrong survivor.
 */
const LAYOUTS: Array<{ name: string; sql: string[] }> = [
  { name: 'original', sql: [] },
  { name: 'citation_desc', sql: [
    'CREATE TABLE sm_reordered AS SELECT * FROM standards_master ORDER BY citation DESC',
    'DELETE FROM standards_master',
    'INSERT INTO standards_master SELECT * FROM sm_reordered',
    'DROP TABLE sm_reordered',
  ] },
  { name: 'child_before_parent', sql: [
    // Longer (more specific) citations physically first, so any code that silently takes "the
    // first row" gets the child rather than the parent.
    'CREATE TABLE sm_reordered AS SELECT * FROM standards_master ORDER BY length(citation) DESC, citation',
    'DELETE FROM standards_master',
    'INSERT INTO standards_master SELECT * FROM sm_reordered',
    'DROP TABLE sm_reordered',
  ] },
  { name: 'random_seed_2', sql: [
    'SELECT setseed(0.2)',
    'CREATE TABLE sm_reordered AS SELECT * FROM standards_master ORDER BY random()',
    'DELETE FROM standards_master',
    'INSERT INTO standards_master SELECT * FROM sm_reordered',
    'DROP TABLE sm_reordered',
  ] },
];

function buildLayout(name: string, sql: string[]): string {
  const db = `test_kg3f_shadow_${name}`;
  guard(db);
  try { sh('dropdb', ['-h', HOST, '-U', USER, '--if-exists', db]); } catch { /* ignore */ }
  sh('createdb', ['-h', HOST, '-U', USER, db]);
  // Streamed through a shell pipe: execFileSync's default maxBuffer truncates the dump, which
  // would silently produce a partial corpus and a meaningless "invariant" result.
  execFileSync('/bin/sh', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${db}`],
    { stdio: 'pipe' });
  for (const stmt of sql) {
    sh('psql', ['-q', '-h', HOST, '-U', USER, db, '-c', stmt]);
  }
  sh('psql', ['-q', '-h', HOST, '-U', USER, db, '-c', 'ANALYZE standards_master']);
  return db;
}

/** Activates the release through the real KG-2 gate inside one disposable layout database. */
function activate(db: string) {
  const url = `postgresql://${USER}@${HOST}/${db}`;
  execFileSync('npx', ['ts-node', '-e', `
    require('dotenv/config');
    const { dataSource } = require('./src/database/data-source');
    const { RegulatoryReleaseLifecycleService } =
      require('./src/standards/releases/regulatory-release-lifecycle.service');
    (async () => {
      await dataSource.initialize();
      const svc = new RegulatoryReleaseLifecycleService(dataSource);
      const r = await svc.activate(${JSON.stringify(RELEASE_ID)}, 'kg3f-shadow-invariance',
        'KG-3F Phase 13/18 shadow invariance harness — disposable database');
      console.log(JSON.stringify({ outcome: r.outcome }));
      await dataSource.destroy();
    })().catch(e => { console.error(e.message); process.exit(1); });
  `], { env: { ...process.env, DATABASE_URL: url }, stdio: 'pipe', encoding: 'utf8' });
}

function runShadow(db: string): string {
  const url = `postgresql://${USER}@${HOST}/${db}`;
  const raw = execFileSync('npx', ['ts-node', 'scripts/shadow-governed-standards.ts'],
    { env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', stdio: 'pipe',
      maxBuffer: 64 * 1024 * 1024 });
  // The harness prints a "Resolved database target: …" preamble naming the database, which differs
  // per layout BY CONSTRUCTION. Comparing raw stdout would therefore always differ and the check
  // would be vacuous in the other direction. Compare the JSON body only.
  const start = raw.indexOf('{');
  if (start < 0) throw new Error(`No JSON in shadow output for ${db}: ${raw.slice(0, 300)}`);
  return raw.slice(start);
}

function main() {
  guard(SOURCE_DB);
  console.log(`\n=== KG-3F shadow invariance — source ${SOURCE_DB}, release ${RELEASE_ID}\n`);

  const bodies: Array<{ layout: string; db: string; sha: string; body: string }> = [];
  for (const layout of LAYOUTS) {
    const db = buildLayout(layout.name, layout.sql);
    activate(db);
    const body = runShadow(db);
    const sha = createHash('sha256').update(body).digest('hex');
    bodies.push({ layout: layout.name, db, sha, body });
    const parsed = JSON.parse(body);
    console.log(`  ${layout.name.padEnd(22)} activeRelease=${parsed.activeRelease} `
      + `gold ${parsed.goldSetOutcome.correctUnderGovernedFiltering}/${parsed.goldSetOutcome.casesEvaluated} `
      + `wrongRegime=${parsed.goldSetOutcome.wrongRegimeMatches} `
      + `expectedGoverned=${parsed.goldSetOutcome.expectedCitationsGoverned}/`
      + `${parsed.goldSetOutcome.distinctExpectedCitations} `
      + `losingBacking=${parsed.goldSetOutcome.expectedCitationsLosingCorpusBacking} `
      + `corpus ${parsed.corpus.currentlyRetrievable}->${parsed.corpus.governedRetrievable}`);
    console.log(`  ${''.padEnd(22)} sha256=${sha.slice(0, 32)}…`);
  }

  const first = bodies[0];
  for (const b of bodies.slice(1)) {
    assert(b.sha === first.sha,
      `SI-1 governed shadow byte-identical under '${b.layout}' vs '${first.layout}'`);
  }

  const parsed = JSON.parse(first.body);
  assert(parsed.activeRelease === RELEASE_ID,
    `SI-2 the shadow actually ran against an ACTIVE release (${parsed.activeRelease}) — an inactive `
    + 'release would make every metric trivially equal and the invariance claim vacuous');
  assert(parsed.goldSetOutcome.wrongRegimeMatches === 0,
    `SI-3 no cross-regime match under governed filtering (${parsed.goldSetOutcome.wrongRegimeMatches})`);
  assert(parsed.goldSetOutcome.expectedCitationsLosingCorpusBacking === 0,
    `SI-4 no expected citation loses corpus backing under approved-only filtering `
    + `(${parsed.goldSetOutcome.expectedCitationsLosingCorpusBacking})`);
  assert(parsed.goldSetOutcome.expectedCitationsGoverned
    === parsed.goldSetOutcome.distinctExpectedCitations,
    `SI-5 every distinct expected citation remains governed `
    + `(${parsed.goldSetOutcome.expectedCitationsGoverned}/`
    + `${parsed.goldSetOutcome.distinctExpectedCitations})`);

  for (const b of bodies) {
    writeFileSync(join(OUT_DIR, `shadow-${b.layout.replace(/_/g, '-')}.json`), b.body);
  }
  console.log(`\nwrote ${bodies.length} shadow reports to ${OUT_DIR}`);
  console.log(`layout databases retained for inspection: ${bodies.map(b => b.db).join(', ')}`);
  console.log(`\n${checks.length} passed, ${failed} failed`);
  if (failed) process.exit(1);
}

main();
