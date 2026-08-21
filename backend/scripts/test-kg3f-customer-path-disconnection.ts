/**
 * KG-3F (Phase 16) -- proof that the governed knowledge path is NOT wired to customers.
 *
 * WHY THIS IS A TEST AND NOT A PARAGRAPH. Every slice from KG-1 to KG-3F has built machinery that
 * would change what customers are told is authoritative regulation: an immutable release snapshot,
 * a reviewer approval log, an approved-only resolver, a governed backing contract. None of it is
 * supposed to be reachable from the customer path yet, and "we didn't wire it up" is exactly the
 * kind of claim that is true right up until someone adds one import.
 *
 * The failure this guards against is silent and one-directional: wiring the governed resolver into
 * customer retrieval would make HazLenz filter candidates down to reviewer-approved records. Today
 * that would empty most hazard families (Phase 14 measures which), so a customer would simply stop
 * being told about hazards -- with no error, no log line, and no visible defect. A grep in a
 * markdown file does not catch that on the day it happens; an assertion in the suite does.
 *
 * Deliberately STATIC + DATA, not behavioral: it reads the source tree for wiring and the database
 * for state. It does not need a server, so it cannot be defeated by a server that happens to be
 * configured differently from production.
 *
 * Usage: DATABASE_URL=…test_… npx ts-node scripts/test-kg3f-customer-path-disconnection.ts
 */
import 'dotenv/config';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { dataSource } from '../src/database/data-source';

const SRC = join(__dirname, '..', 'src');

const checks: string[] = [];
let failed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { checks.push(msg); console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}

/** Every .ts file under a directory, recursively. */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/**
 * The modules that constitute the governed knowledge path. Importing any of these from a customer
 * request path is the wiring this phase forbids.
 */
const GOVERNED_MODULES = [
  'standards/releases/governed-corpus-lookup',
  'standards/releases/release-record-review.service',
  'standards/releases/regulatory-release-lifecycle.service',
  'standards/releases/approval-contract',
];

/**
 * The customer HazLenz request path: what actually runs when a customer submits an observation and
 * reads a finding. `standards/` and `database/migrations/` are the governed subsystem itself and
 * are excluded — the question is whether the CUSTOMER path reaches into them.
 */
const CUSTOMER_PATH_DIRS = [
  'safescope-v2',
  'applicable-standards',
  'inspection',
  'reports',
  'safescope',
];

/** Strips comments so a REFERENCE to a module in prose is not mistaken for an import. */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(line => line.replace(/\/\/.*$/, '')).join('\n');
}

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }
  console.log(`\n=== KG-3F Phase 16 — customer-path disconnection (db ${dbName})\n`);
  await dataSource.initialize();

  // ---- 1. no customer path imports the governed resolver ------------------------------------
  const offenders: string[] = [];
  for (const dir of CUSTOMER_PATH_DIRS) {
    let files: string[];
    try { files = walk(join(SRC, dir)); } catch { continue; }
    for (const file of files) {
      const body = code(readFileSync(file, 'utf8'));
      for (const mod of GOVERNED_MODULES) {
        // An import of the module by path, in any form (import ... from, require, dynamic import).
        const short = mod.split('/').pop() as string;
        const re = new RegExp(`(?:from\\s+['"][^'"]*${short}['"])|(?:require\\(\\s*['"][^'"]*${short}['"])`);
        if (re.test(body)) offenders.push(`${relative(SRC, file)} -> ${mod}`);
      }
    }
  }
  assert(offenders.length === 0,
    `CP-1 no customer HazLenz path imports a governed-knowledge module `
    + `(${CUSTOMER_PATH_DIRS.length} trees scanned)${offenders.length ? ': ' + offenders.join('; ') : ''}`);

  // ---- 2. no approved-only filter in customer retrieval --------------------------------------
  const suggestSource = code(readFileSync(
    join(SRC, 'applicable-standards', 'applicable-standards.service.ts'), 'utf8'));
  assert(!/reviewer_approved|effectiveReviewState|approvalDigest/.test(suggestSource),
    'CP-2 candidate retrieval does not filter on any reviewer-approval column');
  assert(!/regulatory_release_records|regulatory_release_record_reviews/.test(suggestSource),
    'CP-3 candidate retrieval does not read the governed release tables at all');

  // ---- 3. analyses still carry a NULL knowledge release --------------------------------------
  //
  // Fixture releases are excluded BY NAME, not by count. `knowledgeReleaseId` is a KG-1
  // fixture-only column (the same framing KG-3D asserts), and the KG-1 provenance suite writes
  // `kg1-fixture-release.*` rows into whatever verification database it runs against. A bare
  // "must be zero" check therefore fails as soon as two verification suites share a database --
  // for a reason that has nothing to do with the customer path -- and a check that fires on
  // unrelated causes gets muted rather than heeded.
  //
  // The property that actually matters is preserved and is in fact SHARPER: no analysis may carry
  // a REAL release id. A cutover would stamp `federal-core-*`, which this still catches.
  const [analyses] = await dataSource.query(
    `SELECT COUNT(*)::int AS total,
            COUNT("knowledgeReleaseId")::int AS with_release,
            COUNT(*) FILTER (
              WHERE "knowledgeReleaseId" IS NOT NULL
                AND "knowledgeReleaseId" NOT LIKE 'kg%-fixture-release%'
            )::int AS with_real_release
       FROM hazlenz_analyses`);
  assert(Number(analyses.with_real_release) === 0,
    `CP-4 no persisted analysis carries a REAL governed release id `
    + `(${analyses.with_real_release} of ${analyses.total}; `
    + `${analyses.with_release} carry an explicitly-named KG fixture release)`);

  // ---- 4. findings do not claim governed-release provenance -----------------------------------
  const [claims] = await dataSource.query(
    `SELECT COUNT(*)::int AS n FROM inspection_findings f
      WHERE f."sourceCandidate"::text LIKE '%"releaseId"%'`);
  assert(Number(claims.n) === 0,
    `CP-5 no persisted finding claims a governed release in its candidate payload (${claims.n})`);

  // ---- 5. no release has been activated for customer use --------------------------------------
  // Fixture releases excluded by name, for the same reason as CP-4: verification suites activate
  // their OWN releases on purpose (`test:governed-corpus-matrix` activates `kg3b-matrix.A` to
  // exercise the KG-2 gate; `test:kg3f-shadow-invariance` activates one per disposable layout).
  // Those activations are the point of those suites and say nothing about customer exposure. What
  // would signal a cutover is a REAL corpus release going active.
  const active = await dataSource.query(
    `SELECT "releaseId", status FROM regulatory_releases WHERE status = 'active'`);
  const realActive = active.filter((r: any) =>
    !/^kg\d[a-z]?[-.]|fixture/i.test(String(r.releaseId)));
  assert(realActive.length === 0,
    `CP-6 no REAL regulatory release is in the 'active' state `
    + `(${realActive.map((r: any) => r.releaseId).join(', ') || 'none'}; `
    + `${active.length} fixture release(s) active: `
    + `${active.map((r: any) => r.releaseId).join(', ') || 'none'})`);

  // ---- 6. no feature flag silently enables governed retrieval ---------------------------------
  // A flag that DEFAULTS to governed retrieval is the quiet version of the cutover: nothing in the
  // diff says "enable", but every deployment without the variable set behaves as if it had been.
  const allSource = CUSTOMER_PATH_DIRS.flatMap(d => {
    try { return walk(join(SRC, d)); } catch { return []; }
  });
  //
  // Matched on a flag READ -- `process.env.X`, a config getter, or a ConfigService lookup -- not on
  // the bare token. The first version matched any occurrence of `APPROVED_ONLY` and flagged
  // `approved-knowledge-search.types.ts`, where `'approved_only'` is a value in a result-type union
  // (`sourceUsability`). A string literal in a type cannot enable retrieval; only a read of
  // external configuration can. Broadening a guard until it fires on unrelated code does not make
  // it stricter, it makes it ignorable.
  const FLAG_READ = new RegExp(
    String.raw`(?:process\.env\s*(?:\.|\[\s*['"])\s*\w*(?:GOVERNED|APPROVED_ONLY)\w*)`
    + String.raw`|(?:config(?:Service)?\s*\.\s*get\s*(?:<[^>]*>)?\s*\(\s*['"][^'"]*(?:GOVERNED|APPROVED_ONLY)[^'"]*['"])`,
    'i');
  const flagOffenders: string[] = [];
  for (const file of allSource) {
    const body = code(readFileSync(file, 'utf8'));
    if (FLAG_READ.test(body)) flagOffenders.push(relative(SRC, file));
  }
  assert(flagOffenders.length === 0,
    `CP-7 no governed-retrieval feature flag is READ from the customer path`
    + `${flagOffenders.length ? ': ' + flagOffenders.join(', ') : ''}`);

  // The token that produced that false positive belongs to `approved-knowledge-search`, a separate
  // subsystem. Asserted positively rather than merely excluded, so the exclusion cannot later hide
  // a real wiring: whatever that subsystem means by "approved", it must not be the regulatory
  // release corpus.
  const aksDir = join(SRC, 'safescope-v2', 'approved-knowledge-search');
  let aksFiles: string[] = [];
  try { aksFiles = walk(aksDir); } catch { /* subsystem absent is fine */ }
  const aksLeaks = aksFiles.filter(file => {
    const body = code(readFileSync(file, 'utf8'));
    return /regulatory_release|governed-corpus-lookup|reviewer_approved|approvalDigest/.test(body);
  }).map(f => relative(SRC, f));
  assert(aksLeaks.length === 0,
    `CP-7b the approved-knowledge-search subsystem's "approved" is unrelated to the regulatory `
    + `release corpus — it reads no governed table or resolver (${aksFiles.length} files)`
    + `${aksLeaks.length ? ': ' + aksLeaks.join(', ') : ''}`);

  // ---- 7. the shadow path is the ONLY consumer of the governed resolver ------------------------
  // Stated positively so the proof is not merely "we found nothing": the governed resolver IS
  // imported, and every importer is a verification script or the governed subsystem itself.
  const scriptDir = join(__dirname);
  const importers: string[] = [];
  for (const file of [...walk(SRC), ...walk(scriptDir)]) {
    const body = code(readFileSync(file, 'utf8'));
    if (/from\s+['"][^'"]*governed-corpus-lookup['"]/.test(body)) {
      importers.push(relative(join(__dirname, '..'), file));
    }
  }
  const customerImporters = importers.filter(f =>
    f.startsWith('src/') && !f.startsWith('src/standards/'));
  assert(customerImporters.length === 0,
    `CP-8 every importer of the governed resolver is a verification script or the governed `
    + `subsystem itself (${importers.length} importers, ${customerImporters.length} in customer src)`);
  console.log('      importers:');
  for (const f of importers.sort()) console.log(`        ${f}`);

  console.log(`\n${checks.length} passed, ${failed} failed`);
  await dataSource.destroy();
  if (failed) process.exit(1);
}

main().catch(async e => {
  console.error(e);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
