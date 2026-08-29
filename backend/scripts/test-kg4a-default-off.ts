/**
 * KG-4A (Phase 21) -- THE MANDATORY DEFAULT-OFF PROOF.
 *
 * KG-4A builds the controlled-cutover mechanism. It does NOT perform the cutover. This suite is the
 * evidence for that sentence, and it is deliberately the most adversarial one in the slice: it
 * assumes the implementer wanted the cutover on and tries to catch them.
 *
 * IT SUPERSEDES KG-3F PHASE 16 (`test:kg3f-customer-path-disconnection`). That suite asserted the
 * governed path was UNREACHABLE from the customer path. KG-4A deliberately makes it reachable, so
 * that claim is no longer the right one -- and, importantly, the KG-3F suite still reports 9/9
 * because KG-4A's resolver lives under `standards/`, which it excludes. Rather than weaken the
 * KG-3F record by editing it, this suite states the stronger, mode-aware property:
 *
 *   1. the customer path reaches governed data through EXACTLY ONE named seam, enumerated here;
 *   2. that seam is INERT under ordinary configuration;
 *   3. with the seam inert, both customer paths produce byte-identical output to pre-KG-4A;
 *   4. nothing in the repository's own configuration turns it on.
 *
 * DATABASE: read-only. Creates an owned clone for the behavioural comparison and drops it.
 *
 * Usage: SOURCE_DB=test_kg3f_remediation_20260820 npx ts-node scripts/test-kg4a-default-off.ts
 */
import { execFileSync } from 'child_process';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { userInfo } from 'os';
import { DataSource } from 'typeorm';
import { GovernedCutoverContext } from '../src/standards/cutover/governed-cutover-context';
import { resolveCutoverMode, resolveCutoverEnablement } from '../src/standards/cutover/cutover-mode';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { Standard } from '../src/standards/entities/standard.entity';

const USER = process.env.PGUSER || userInfo().username;
const HOST = '127.0.0.1';
const SOURCE_DB = process.env.SOURCE_DB || 'test_kg3f_remediation_20260820';
const OWNED_DB = 'test_kg4a_defaultoff_run';
const SRC = join(__dirname, '..', 'src');
const REPO = join(__dirname, '..', '..');

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
function section(t: string) { console.log(`\n--- ${t}`); }

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}
/** Strips comments so a module named in prose is not mistaken for an import. */
const code = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');

const CUSTOMER_DIRS = ['safescope-v2', 'applicable-standards', 'inspection', 'reports', 'safescope'];
const GOVERNED_DATA_MODULES = [
  'standards/releases/governed-corpus-lookup',
  'standards/releases/release-record-review.service',
  'standards/releases/regulatory-release-lifecycle.service',
  'standards/releases/approval-contract',
  'standards/cutover/governed-resolution',
];
/** The ONE module a customer path may import to REACH GOVERNED DATA. */
const PERMITTED_SEAM = 'standards/cutover/governed-cutover-context';
/**
 * Additionally permitted, and deliberately distinguished from the seam: the pure configuration
 * contract. `cutover-mode.ts` parses environment variables and answers "is this principal enabled".
 * It has no database access, no import of any governed module, and cannot reach the corpus, so
 * importing it is not a path to governed data -- it is a path to the ANSWER "no".
 *
 * `inspection.service.ts` imports it for the anti-spoofing gate: before honouring a client-supplied
 * `knowledgeReleaseId`, the persistence layer must independently confirm the server has governed
 * mode enabled for this principal. That check must live where the write happens.
 */
const PERMITTED_CONFIG = 'standards/cutover/cutover-mode';

/**
 * KG-4D. The permitted surface grew, by design, and the assertion below is updated rather than
 * relaxed.
 *
 * KG-4A's rule was "customer paths import ONLY the seam and the pure config contract", and its
 * purpose was to stop governed/shadow logic being scattered across HazLenz services. KG-4D wires
 * the KG-4C safety modules into the request path through ONE new orchestration boundary
 * (`shadow-request-orchestration`), plus two narrow hooks in the persistence layer
 * (`shadow-provenance-invariant` for the SHADOW provenance gate and `shadow-operational-metrics`
 * for its counter). Those three are now legitimate customer-path imports.
 *
 * The PROPERTY is unchanged and still enforced: anything outside this list -- the telemetry sink,
 * the circuit breaker, the authorization gate, the invariance hash -- must still be reached only
 * through the orchestration boundary, and this assertion still fails if one is imported directly.
 * `test:kg4d-default-off` carries the stronger form of the same check for the integrated
 * architecture.
 */
const PERMITTED_KG4D_INTEGRATION = [
  'standards/cutover/shadow-request-orchestration',
  'standards/cutover/shadow-provenance-invariant',
  'standards/cutover/shadow-operational-metrics',
];

async function main() {
  // ============================================================ Part 1 -- exactly one seam
  section('Part 1 — the customer path reaches governed data through exactly one named seam');

  const customerFiles = CUSTOMER_DIRS
    .map(dir => join(SRC, dir)).filter(existsSync).flatMap(walk);
  assert(customerFiles.length > 0, `enumerated ${customerFiles.length} customer-path source files`);

  const directGovernedImporters: string[] = [];
  const seamImporters: string[] = [];
  const cutoverImporters = new Map<string, string[]>();
  for (const file of customerFiles) {
    const body = code(readFileSync(file, 'utf8'));
    const rel = relative(SRC, file);
    for (const mod of GOVERNED_DATA_MODULES) {
      if (new RegExp(`from\\s+['"][^'"]*${mod.replace(/\//g, '\\/')}['"]`).test(body)) directGovernedImporters.push(`${rel} -> ${mod}`);
    }
    const matches = [...body.matchAll(/from\s+['"][^'"]*standards\/cutover\/([a-z-]+)['"]/g)].map(m => `standards/cutover/${m[1]}`);
    if (matches.length) {
      cutoverImporters.set(rel, [...new Set(matches)]);
      if (matches.includes(PERMITTED_SEAM)) seamImporters.push(rel);
    }
  }

  assert(directGovernedImporters.length === 0,
    `HARD: NO customer module imports a governed data module directly (${directGovernedImporters.join(', ') || 'none'})`);
  console.log('      customer-path importers of standards/cutover/:');
  for (const [file, mods] of cutoverImporters) console.log(`        ${file} -> ${mods.join(', ')}`);
  const forbidden = [...cutoverImporters.values()].flat()
    .filter(m => m !== PERMITTED_SEAM && m !== PERMITTED_CONFIG
      && !PERMITTED_KG4D_INTEGRATION.includes(m));
  assert(forbidden.length === 0,
    `HARD: customer paths import ONLY the seam, the pure config contract and the KG-4D integration `
    + `boundary (${[...new Set(forbidden)].join(', ') || 'nothing else'})`);
  // And the pure config contract must STAY pure -- if it ever gained a governed import, importing
  // it would silently become a second path to the corpus.
  //
  // UPDATED, NOT RELAXED -- 2026-08-29, and the same discipline as the KG-4D note above.
  //
  // The property this protects is "importing `cutover-mode.ts` cannot reach governed data". It was
  // implemented as the blunter "imports nothing at all", which was true and sufficient while the
  // module stood alone. The governed-cutover emergency stop then had to become part of the
  // authoritative enablement answer -- a kill switch consulted only DOWNSTREAM of that answer let
  // an engaged switch still bind a new inspection to the active release and still write
  // `inspection.knowledgeReleaseId` -- so `cutover-mode.ts` now imports `cutover-kill-switch.ts`.
  //
  // The check is therefore made TRANSITIVE rather than removed: exactly one import is permitted,
  // it must be that module, and THAT module must itself import nothing. A route to the corpus
  // would need an import somewhere on this chain, and there is nowhere left to put one. Inlining
  // the environment read instead was rejected as the weaker design: it would duplicate the parse
  // and leave the in-process RUNTIME LATCH -- the one the circuit breaker pulls with no operator
  // present -- unable to stop governed authority at all.
  const PERMITTED_CONFIG_IMPORT = 'standards/cutover/cutover-kill-switch';
  const configBody = code(readFileSync(join(SRC, 'standards', 'cutover', 'cutover-mode.ts'), 'utf8'));
  const configImports = [...configBody.matchAll(/from\s+['"]([^'"]+)['"]/g)]
    .map(m => m[1].replace(/^\.\//, 'standards/cutover/'));
  assert(configImports.every(mod => mod === PERMITTED_CONFIG_IMPORT),
    `HARD: the pure config contract imports ONLY the emergency stop (${configImports.join(', ') || 'nothing'})`);
  const killSwitchBody = code(
    readFileSync(join(SRC, 'standards', 'cutover', 'cutover-kill-switch.ts'), 'utf8'));
  assert(!/from\s+['"]/.test(killSwitchBody),
    'HARD: the emergency stop itself imports NOTHING — the config chain cannot become a route to governed data');
  assert(seamImporters.length <= 3,
    `the seam has a small, enumerable set of customer importers (${seamImporters.length}: ${seamImporters.join(', ')})`);

  // The mode is read in exactly one place.
  const modeReaders = walk(SRC)
    .filter(f => /GOVERNED_CUTOVER_MODE|GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST/.test(code(readFileSync(f, 'utf8'))))
    .map(f => relative(SRC, f));
  assert(modeReaders.every(f => f.startsWith('standards/cutover/')),
    `HARD: the cutover configuration is read ONLY inside standards/cutover/ (${modeReaders.join(', ')})`);

  // No client-controlled toggle anywhere.
  const clientToggles: string[] = [];
  for (const file of walk(SRC)) {
    const body = code(readFileSync(file, 'utf8'));
    if (/(?:body|query|params|headers)\s*(?:\.|\[['"])\s*[a-zA-Z"'\[\].]*(?:governedMode|cutoverMode|governedCutover|forceGoverned)/i.test(body)) {
      clientToggles.push(relative(SRC, file));
    }
  }
  assert(clientToggles.length === 0,
    `HARD: no request body, query, param or header can select a cutover mode (${clientToggles.join(', ') || 'none'})`);

  // ============================================================ Part 2 -- the seam is inert
  section('Part 2 — under ordinary configuration the seam is inert');

  const DEFAULT_ENVS: Array<[string, Record<string, string | undefined>]> = [
    ['completely empty environment', {}],
    ['a typical dev environment', { NODE_ENV: 'development', DATABASE_URL: 'postgresql://localhost/x', JWT_SECRET: 'y' }],
    ['a typical test environment', { NODE_ENV: 'test' }],
    ['a typical production environment', { NODE_ENV: 'production', DATABASE_URL: 'x', JWT_SECRET: 'y' }],
    ['mode set but no allowlist', { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK' }],
    ['allowlist set but no mode', { GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'user-1,user-2' }],
    ['a misspelled mode with a full allowlist', { GOVERNED_CUTOVER_MODE: 'GOVERNED', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'user-1' }],
    ['production governed mode without acknowledgement', { NODE_ENV: 'production', GOVERNED_CUTOVER_MODE: 'GOVERNED_STRICT', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'user-1' }],
  ];
  for (const [label, env] of DEFAULT_ENVS) {
    assert(resolveCutoverEnablement({ userId: 'user-1', organizationId: 'org-1' }, env).effectiveMode === 'LEGACY',
      `HARD: ${label} -> effective mode is LEGACY`);
    const context = await GovernedCutoverContext.create({ dataSource: null, principal: { userId: 'user-1' }, env });
    assert(context === null,
      `HARD: ${label} -> GovernedCutoverContext.create() returns null (the seam does not exist)`);
  }

  // The repository's own configuration files must not enable it.
  section('Part 2b — the repository ships no configuration that enables cutover');
  const configFiles = ['.env', '.env.example', '.env.local', '.env.production', '.env.test',
    'render.yaml', 'docker-compose.yml', 'Dockerfile']
    .flatMap(name => [join(REPO, name), join(REPO, 'backend', name)])
    .filter(existsSync);
  const offenders: string[] = [];
  for (const file of configFiles) {
    const body = readFileSync(file, 'utf8');
    for (const line of body.split('\n')) {
      const match = /^\s*(?:-\s*)?(?:name:\s*)?GOVERNED_CUTOVER_(MODE|ACCOUNT_ALLOWLIST|ORG_ALLOWLIST|PRODUCTION_ACK)\s*[:=]\s*(.*)$/.exec(line);
      if (match && match[2].trim() && !/^(LEGACY|""|'')$/i.test(match[2].trim())) {
        offenders.push(`${relative(REPO, file)}: ${line.trim()}`);
      }
    }
  }
  assert(offenders.length === 0,
    `HARD: no shipped config file sets a governed cutover variable (${offenders.join(' | ') || `checked ${configFiles.length} files`})`);
  assert(!process.env.GOVERNED_CUTOVER_MODE || process.env.GOVERNED_CUTOVER_MODE === 'LEGACY',
    'HARD: the AMBIENT environment this suite runs in has no governed cutover mode set');
  assert(resolveCutoverMode(process.env).mode === 'LEGACY',
    'HARD: the ambient environment resolves to LEGACY');

  // ============================================================ Part 3 -- behavioural identity
  section('Part 3 — with the seam inert, suggest() is byte-identical to pre-KG-4A');

  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);
  execFileSync('createdb', ['-h', HOST, '-U', USER, OWNED_DB]);
  execFileSync('bash', ['-c',
    `pg_dump -h ${HOST} -U ${USER} ${SOURCE_DB} | psql -q -h ${HOST} -U ${USER} ${OWNED_DB}`]);
  const ds = new DataSource({
    type: 'postgres', url: `postgresql://${USER}@${HOST}:5432/${OWNED_DB}`,
    // Explicit, not a glob: this repository's glob/minimatch pairing throws inside TypeORM's
    // DirectoryExportedClassesLoader under ts-node. `Standard` is the only entity `suggest()`
    // needs a repository for; everything else this suite touches is a raw query.
    entities: [Standard], synchronize: false, logging: false,
  });
  await ds.initialize();
  // Activate a release inside the OWNED clone, so that if the seam were live it WOULD have data to
  // find. A default-off proof against an empty corpus proves nothing.
  await ds.query(`UPDATE regulatory_releases SET status='active' WHERE "releaseId"='federal-core-2026-08-20.5'`);
  assert((await ds.query(`SELECT count(*)::int AS n FROM regulatory_releases WHERE status='active'`))[0].n === 1,
    'the owned clone HAS an active release — so an enabled seam would have had governed data available');

  const service = new ApplicableStandardsService(ds.getRepository(Standard) as any);
  const QUERIES: Array<[string, string]> = [
    ['electrical', 'Damaged conductor on electrical equipment with arc flash exposure during maintenance.'],
    ['guarding', 'Rotating shaft on the mixer has no guard and the operator works beside it.'],
    ['fall', 'Worker on an unguarded leading edge at 12 feet with no fall protection.'],
    ['msha-traffic', 'Haul truck reversing near the stockpile without a functioning backup alarm.'],
  ];
  for (const [label, text] of QUERIES) {
    const withoutParam = await service.suggest(text, undefined, 'OSHA_GENERAL_INDUSTRY', 10);
    const withNullContext = await service.suggest(text, undefined, 'OSHA_GENERAL_INDUSTRY', 10, undefined, undefined, null);
    assert(JSON.stringify(withoutParam) === JSON.stringify(withNullContext),
      `HARD: [${label}] suggest() with no cutover argument === suggest() with an explicit null context`);
    assert(!JSON.stringify(withoutParam).includes('governedDeliveryState'),
      `HARD: [${label}] the default payload carries NO governed keys at all`);
    assert(!JSON.stringify(withoutParam).includes('knowledgeReleaseId'),
      `HARD: [${label}] the default payload carries no knowledgeReleaseId`);
    const statuses = new Set((withoutParam as any[]).map(r => r.backingStatus));
    assert(!statuses.has('APPROVED_GOVERNED_CONTENT'),
      `HARD: [${label}] NOTHING is reported as APPROVED_GOVERNED_CONTENT by default, despite an active release with 41 approvals`);
    assert((withoutParam as any[]).every(r => r.corpusBacked === false),
      `HARD: [${label}] corpusBacked is false for every default result`);
  }

  // And the context genuinely WOULD have activated had it been configured -- otherwise Part 3 is
  // vacuous. This is the falsification check for the whole suite.
  section('Part 4 — the proof is not vacuous: the seam DOES activate when explicitly configured');
  const enabledContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: { userId: 'allowed-user' },
    env: { GOVERNED_CUTOVER_MODE: 'GOVERNED_WITH_FALLBACK', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'allowed-user' },
  });
  assert(enabledContext !== null, 'with an explicit mode AND allowlist the context IS created');
  assert(enabledContext?.pin.releaseId === 'federal-core-2026-08-20.5',
    'the enabled context pins the active release — governed data was genuinely reachable all along');
  const approvedCitation = (await ds.query(
    `SELECT r.citation FROM regulatory_release_records r
      WHERE r."releaseId"='federal-core-2026-08-20.5'
        AND EXISTS (SELECT 1 FROM regulatory_release_record_reviews v
                    WHERE v."releaseId"=r."releaseId" AND v."citationKey"=r."citationKey"
                      AND v."recordChecksum"=r."recordChecksum" AND v.decision='approved')
        AND coalesce(r.payload->>'canonicalText','') <> '' ORDER BY r.citation LIMIT 1`))[0]?.citation;
  const enabledDecision = await enabledContext!.resolveStandard({ citation: approvedCitation, applicabilityStatus: 'SUPPORTED' });
  assert(enabledDecision.governedBackingInput !== null && enabledDecision.decision.textIsVerified,
    `HARD: the enabled seam DOES return verified governed content for ${approvedCitation} — so Part 3's silence is a real default-off, not an empty corpus`);

  // Same citation, default configuration: nothing.
  const defaultContext = await GovernedCutoverContext.create({
    dataSource: ds, principal: { userId: 'allowed-user' }, env: {},
  });
  assert(defaultContext === null,
    'HARD: the SAME user, the SAME database, the SAME approved citation — with default config there is no context at all');

  await ds.destroy();
  execFileSync('dropdb', ['-h', HOST, '-U', USER, '--if-exists', OWNED_DB]);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => { console.error(error); process.exit(1); });
