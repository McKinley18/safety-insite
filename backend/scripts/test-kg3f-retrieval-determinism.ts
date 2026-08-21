/**
 * KG-3F (Phases 3 and 18) -- the physical-layout adversarial determinism harness.
 *
 * KG-3E proved that `suggest()` returns different citations for the same query depending on
 * PostgreSQL heap layout, and left it as the top cutover blocker: approved-only filtering cannot
 * sit downstream of a candidate set that is chosen by where rows happen to sit on disk.
 *
 * This harness builds several logically IDENTICAL corpora with deliberately DIFFERENT physical row
 * layouts, runs the real retrieval path against each, and requires the results to be byte-identical.
 * "Logically identical" is proved, not assumed: a content digest over every row is compared across
 * layouts before any retrieval result is trusted.
 *
 * There is no flaky tolerance. Any difference in membership OR ordering, for any query, fails.
 *
 * Usage: SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg3f-retrieval-determinism.ts
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_remediation_20260820';
const HOST = '127.0.0.1';
const USER = 'mckinley';

/**
 * Physical layouts. Each is a full copy of the same logical corpus, rewritten so the heap order
 * differs. `CLUSTER` rewrites the table in index order without changing any value, which is exactly
 * the transform KG-3E used to prove the defect causally.
 *
 * `random-*` layouts rebuild the heap in an order derived from a fixed seed, so they are adversarial
 * but reproducible -- a genuinely random order would make a failure impossible to re-examine.
 */
const LAYOUTS: Array<{ name: string; sql: string[] }> = [
  { name: 'original', sql: [] },
  { name: 'citation-asc', sql: [
    'CREATE INDEX kg3f_lay ON standards_master (citation ASC)',
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'citation-desc', sql: [
    'CREATE INDEX kg3f_lay ON standards_master (citation DESC)',
    'CLUSTER standards_master USING kg3f_lay'] },
  // parent-before-child and child-before-parent for the 1910.303 pair specifically: length ordering
  // puts bare sections before their paragraphs, and the reverse puts paragraphs first.
  { name: 'parent-before-child', sql: [
    'CREATE INDEX kg3f_lay ON standards_master (length(citation) ASC, citation ASC)',
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'child-before-parent', sql: [
    'CREATE INDEX kg3f_lay ON standards_master (length(citation) DESC, citation DESC)',
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'reverse-insertion', sql: [
    'CREATE INDEX kg3f_lay ON standards_master (created_at DESC, id DESC)',
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'random-seed-1', sql: [
    "CREATE INDEX kg3f_lay ON standards_master (md5(id::text || 'seed1'))",
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'random-seed-2', sql: [
    "CREATE INDEX kg3f_lay ON standards_master (md5(id::text || 'seed2'))",
    'CLUSTER standards_master USING kg3f_lay'] },
  { name: 'random-seed-3', sql: [
    "CREATE INDEX kg3f_lay ON standards_master (md5(id::text || 'seed3'))",
    'CLUSTER standards_master USING kg3f_lay'] },
];

const CONTENT_DIGEST_SQL = `
  SELECT md5(string_agg(
    citation || coalesce(title,'') || coalesce(standard_text,'') ||
    coalesce(plain_language_summary,'') || coalesce(keywords,'') ||
    coalesce(agency_code,'') || coalesce(scope_code,'') || coalesce(source_key,''),
    '|' ORDER BY citation)) AS digest FROM standards_master`;

const sh = (cmd: string, args: string[], env?: Record<string, string>) =>
  execFileSync(cmd, args, { env: { ...process.env, ...(env || {}) }, stdio: 'pipe' }).toString();

const psql = (db: string, sql: string) =>
  sh('psql', ['-t', '-A', '-h', HOST, '-U', USER, db, '-c', sql]).trim();

function guard(db: string) {
  if (db === 'safescope' || !/^test_/.test(db)) throw new Error(`Refusing to touch database '${db}'.`);
}

function buildLayout(name: string, sql: string[]): string {
  const db = `test_kg3f_det_${name.replace(/-/g, '_')}`;
  guard(db);
  try { sh('dropdb', ['-h', HOST, '-U', USER, '--if-exists', db]); } catch { /* ignore */ }
  sh('createdb', ['-h', HOST, '-U', USER, db]);
  // Streamed through a shell pipe rather than buffered in Node: the dump is ~1 MB and
  // execFileSync's default maxBuffer truncates it, which would silently produce a partial corpus.
  execFileSync('/bin/sh', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${db}`],
    { stdio: 'pipe' });
  for (const stmt of sql) psql(db, stmt);
  psql(db, 'ANALYZE standards_master');
  return db;
}

function main() {
  guard(SOURCE_DB);
  const tmp = mkdtempSync(join(tmpdir(), 'kg3f-det-'));
  const checks: string[] = [];
  let failed = 0;
  const assert = (cond: unknown, msg: string) => {
    if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
    else { failed++; console.log(`FAIL  ${msg}`); }
  };

  console.log(`\n=== KG-3F retrieval determinism — source corpus ${SOURCE_DB}\n`);

  const runs: Array<{ layout: string; db: string; digest: string; head: string[]; probe: any }> = [];

  for (const layout of LAYOUTS) {
    const db = buildLayout(layout.name, layout.sql);
    const digest = psql(db, CONTENT_DIGEST_SQL);
    const out = join(tmp, `${layout.name}.json`);
    sh('npx', ['ts-node', 'scripts/probe-kg3f-retrieval.ts', '--out', out], {
      DATABASE_URL: `postgresql://${USER}@${HOST}:5432/${db}`,
    });
    const probe = JSON.parse(readFileSync(out, 'utf8'));
    runs.push({ layout: layout.name, db, digest, head: probe.physicalHead, probe });
    console.log(`  built ${layout.name.padEnd(21)} heap head: ${probe.physicalHead[0]}`);
  }

  // ---- 1. the corpora must be logically identical, or nothing below means anything -------------
  console.log('');
  const digests = new Set(runs.map(r => r.digest));
  assert(digests.size === 1,
    `all ${runs.length} layouts hold logically IDENTICAL content (content digest ${[...digests][0]?.slice(0, 12)}…)`);

  // ---- 2. the layouts must actually differ, or the test proves nothing -------------------------
  const heads = new Set(runs.map(r => r.head[0]));
  assert(heads.size > 1,
    `the layouts genuinely differ physically (${heads.size} distinct heap heads across ${runs.length} layouts)`);

  // ---- 3. retrieval must be invariant ------------------------------------------------------------
  const base = runs[0];
  for (const run of runs.slice(1)) {
    for (let i = 0; i < base.probe.results.length; i++) {
      const a = base.probe.results[i], b = run.probe.results[i];
      const sameOrder = JSON.stringify(a.citations) === JSON.stringify(b.citations);
      if (!sameOrder) {
        console.log(`      ${a.id} [${a.family}]`);
        console.log(`        ${base.layout.padEnd(21)}: ${a.citations.join(', ') || '(none)'}`);
        console.log(`        ${run.layout.padEnd(21)}: ${b.citations.join(', ') || '(none)'}`);
      }
      assert(sameOrder,
        `${a.id} identical under '${run.layout}' vs '${base.layout}' (membership AND order)`);
    }
  }

  console.log(`\n${checks.length} passed, ${failed} failed`);
  console.log(`layout databases retained for inspection: ${runs.map(r => r.db).join(', ')}`);
  rmSync(tmp, { recursive: true, force: true });
  if (failed) process.exitCode = 1;
}

main();
