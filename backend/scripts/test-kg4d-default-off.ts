/**
 * KG-4D Phases 20 and 22 -- the authoritative default-off test for the INTEGRATED architecture,
 * plus the mutating-suite inventory.
 *
 * WHY THIS SUPERSEDES THE EARLIER DEFAULT-OFF SUITES (without rewriting them).
 *
 *   KG-3F `test:kg3f-customer-path-disconnection` proved the governed modules were UNREACHABLE.
 *   KG-4C `test:kg4c-disabled-deployment` proved the KG-4C modules were unreachable too.
 *
 * After KG-4D neither statement is true any more, and that is the point of the slice: the modules
 * are now wired into the customer request path. So "default off" can no longer mean "the code is
 * not reachable". It has to mean "the code is reachable and does nothing".
 *
 * This suite therefore proves the harder property. It walks the REAL import graph from the actual
 * controller to establish reachability, then drives the REAL orchestration entry point under the
 * real default environment to establish inertness. Historical artifacts are left exactly as written.
 *
 * Run:  npm run test:kg4d-default-off
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, resolve } from 'path';

import {
  orchestrateShadowRequest, resetShadowBreakerWindow,
} from '../src/standards/cutover/shadow-request-orchestration';
import { resetRuntimeKillSwitch } from '../src/standards/cutover/production-shadow-authorization';
import { shadowMetrics } from '../src/standards/cutover/shadow-operational-metrics';
import { resolveCutoverMode } from '../src/standards/cutover/cutover-mode';

const checks: string[] = [];
const failures: string[] = [];
function check(condition: unknown, message: string): void {
  if (condition) checks.push(message); else failures.push(message);
}

const SRC = resolve(__dirname, '..', 'src');
const CONTROLLER = join(SRC, 'safescope-v2', 'safescope-v2.controller.ts');
const PERSISTENCE = join(SRC, 'inspection', 'inspection.service.ts');

/** Resolves a relative TypeScript import to a file on disk. */
function resolveImport(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [base + '.ts', join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/** Every module transitively reachable from a set of entry files. */
function reachableFrom(entries: string[]): Set<string> {
  const seen = new Set<string>();
  const queue = [...entries];
  while (queue.length) {
    const file = queue.shift() as string;
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    const specifiers = [...source.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    for (const specifier of specifiers) {
      const resolved = resolveImport(file, specifier);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return seen;
}

async function main(): Promise<void> {
  // ================================================================ 22a. REACHABILITY
  //
  // The KG-4D deliverable, stated as an assertion: the six KG-4C safety modules must now be
  // reachable from the real customer request path. KG-4C recorded that none of them was.

  const reachable = reachableFrom([CONTROLLER, PERSISTENCE]);
  const KG4C_MODULES = [
    'production-shadow-authorization', 'shadow-circuit-breaker', 'customer-output-invariance',
    'shadow-telemetry-sink', 'shadow-provenance-invariant', 'shadow-operational-metrics',
  ];
  for (const module of KG4C_MODULES) {
    const found = [...reachable].some((file) => file.endsWith('/' + module + '.ts'));
    check(found, 'KG-4C module "' + module + '" is REACHABLE from the real request path');
  }
  check([...reachable].some((f) => f.endsWith('/shadow-request-orchestration.ts')),
    'the KG-4D orchestration boundary is reachable from the controller');

  // Exactly one orchestration call site, so the logic is not scattered.
  const controllerSource = readFileSync(CONTROLLER, 'utf8');
  // Comments mention the function by name, so strip them before counting -- otherwise the prose
  // that explains the seam is miscounted as a second seam.
  const controllerCode = controllerSource
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((line) => !line.trim().startsWith('//')).join('\n');
  const callSites = (controllerCode.match(/orchestrateShadowRequest\s*\(/g) || []).length;
  check(callSites === 1, 'the controller has exactly ONE orchestration call site (found ' + callSites + ')');

  // No other HazLenz service may import the shadow safety modules directly.
  const offenders: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) { walk(full); continue; }
      if (!entry.name.endsWith('.ts')) continue;
      if (full.includes('/standards/cutover/')) continue;
      if (full === PERSISTENCE) continue;
      const source = readFileSync(full, 'utf8');
      for (const module of ['production-shadow-authorization', 'shadow-circuit-breaker',
        'customer-output-invariance', 'shadow-telemetry-sink']) {
        if (source.includes('cutover/' + module)) offenders.push(entry.name + ' -> ' + module);
      }
    }
  };
  walk(SRC);
  check(offenders.length === 0,
    'no service outside the cutover subsystem imports a shadow safety module directly (' +
    (offenders.join(', ') || 'none') + ')');

  // ================================================================ 22b. INERTNESS

  const DISABLED: Array<{ label: string; env: Record<string, string | undefined> }> = [
    { label: 'nothing configured', env: {} },
    { label: 'the REAL process environment', env: process.env },
    { label: 'empty mode', env: { GOVERNED_CUTOVER_MODE: '' } },
    { label: 'whitespace mode', env: { GOVERNED_CUTOVER_MODE: '   ' } },
    { label: 'malformed mode', env: { GOVERNED_CUTOVER_MODE: 'SHADOW_MODE' } },
    { label: 'truthy mode', env: { GOVERNED_CUTOVER_MODE: 'true' } },
    { label: 'numeric mode', env: { GOVERNED_CUTOVER_MODE: '1' } },
    { label: 'allowlist alone', env: { GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'user-1' } },
    { label: 'org allowlist alone', env: { GOVERNED_CUTOVER_ORG_ALLOWLIST: 'org-1' } },
    { label: 'both acknowledgements alone', env: {
      GOVERNED_CUTOVER_PRODUCTION_ACK: 'I_ACKNOWLEDGE_GOVERNED_CUTOVER',
      GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK: 'I_ACKNOWLEDGE_PRODUCTION_SHADOW' } },
    { label: 'stage alone', env: { GOVERNED_CUTOVER_SHADOW_STAGE: 'STAGE_4_BROAD' } },
    { label: 'SHADOW mode with no allowlist', env: { GOVERNED_CUTOVER_MODE: 'SHADOW' } },
    { label: 'observability enabled but no mode', env: { GOVERNED_CUTOVER_OBSERVABILITY: 'enabled' } },
  ];

  const PAYLOAD = { standards: [{ citation: '29 CFR 1926.501', confidence: 'High' }] };

  for (const scenario of DISABLED) {
    resetRuntimeKillSwitch();
    resetShadowBreakerWindow();
    shadowMetrics.reset();

    let contexts = 0;
    let calls = 0;
    const result = await orchestrateShadowRequest({
      dataSource: { query: async () => [{ releaseId: 'r1' }] } as any,
      principal: { userId: 'user-1', organizationId: 'org-1' },
      env: scenario.env,
      runPipeline: async (ctx) => { calls += 1; if (ctx) contexts += 1; return PAYLOAD; },
    });

    check(result.outcome === 'LEGACY_NO_CONTEXT',
      'default-off "' + scenario.label + '": no SHADOW execution');
    check(contexts === 0, 'default-off "' + scenario.label + '": no cutover context created');
    check(calls === 1, 'default-off "' + scenario.label + '": the pipeline runs exactly once');
    check(result.payload === PAYLOAD,
      'default-off "' + scenario.label + '": the customer payload is returned untouched');
    check(result.telemetry.attempted === 0,
      'default-off "' + scenario.label + '": no telemetry emitted');
    check(result.comparisons === 0,
      'default-off "' + scenario.label + '": no shadow comparison produced');
    check(result.shadowProvenanceNull,
      'default-off "' + scenario.label + '": no governed customer provenance');
    check(result.invariance === null,
      'default-off "' + scenario.label + '": no invariance work performed');
  }

  // The REAL environment this process is running in must resolve LEGACY.
  check(resolveCutoverMode(process.env).mode === 'LEGACY',
    'the REAL process environment resolves to LEGACY');
  check(!process.env.GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK,
    'the production-shadow acknowledgement is NOT set in this environment');

  // Not vacuous: with a mode AND an allowlist, shadow DOES execute.
  resetRuntimeKillSwitch();
  resetShadowBreakerWindow();
  let enabledContexts = 0;
  const enabled = await orchestrateShadowRequest({
    dataSource: { query: async () => [] } as any,
    principal: { userId: 'user-1', organizationId: null },
    env: { GOVERNED_CUTOVER_MODE: 'SHADOW', GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST: 'user-1' },
    runPipeline: async (ctx) => { if (ctx) enabledContexts += 1; return PAYLOAD; },
  });
  check(enabled.outcome === 'SHADOW_EXECUTED' && enabledContexts === 1,
    'FALSIFICATION CHECK: with a mode AND an allowlist, shadow DOES execute -- the suite is not vacuous');

  // ================================================================ 20. MUTATING SUITE INVENTORY

  const scriptsDir = resolve(__dirname);
  // A suite counts as MUTATING only if it both (a) contains a genuinely destructive or
  // state-replacing statement and (b) actually opens a database connection. Requiring both keeps
  // pure contract suites -- which mention `.activate(` or a table name only in a fixture or a
  // comment -- out of the inventory. A detector that over-reports is as useless as one that
  // under-reports: it trains its reader to ignore it.
  const MUTATION_MARKERS = [
    /DELETE\s+FROM\s+regulatory_release/i,
    /DELETE\s+FROM\s+knowledge_release_events/i,
    /TRUNCATE\s+/i,
    /DROP\s+TABLE/i,
    /INSERT\s+INTO\s+regulatory_release/i,
    /UPDATE\s+standards_master/i,
    /\.activate\(/,
  ];
  const CONNECTION_MARKERS = [
    /dataSource\.initialize\(/, /new Client\(/, /DATABASE_URL/, /SOURCE_DB/,
  ];
  /**
   * KG-5B -- OPERATOR COMMANDS, a third category this inventory did not previously have.
   *
   * The KG-4C ownership guard refuses any database not named `test_*`. That is exactly right for a
   * verification suite, and exactly wrong for an operator command: `regulatory-release.ts` exists
   * to activate and roll back a governed release IN PRODUCTION, so wiring it to the disposable
   * database guard would make the production procedure impossible to perform. Marking it
   * "guarded" would be false, and leaving it "NEEDS GUARD" reports a hazard that does not exist.
   *
   * So the category is stated, and the exemption is EARNED rather than granted. An operator
   * command qualifies only if it declares itself one AND carries the substitute safety property
   * that replaces the ownership guard: it refuses to mutate unless the operator states the exact
   * state they believe they are acting on (`--expected-manifest`, `--expected-current`). A script
   * that claims the category without that property still counts as unprotected.
   *
   * The allowlist is asserted to be exactly one entry, so a second exemption cannot be added
   * without changing this contract in a reviewable diff.
   */
  const OPERATOR_COMMANDS = ['regulatory-release.ts'];
  const OPERATOR_SAFETY_MARKERS = [/--expected-manifest/, /--expected-current/];

  const inventory: Array<{
    script: string; guarded: boolean; selfContained: boolean; operatorCommand: boolean;
  }> = [];
  for (const file of readdirSync(scriptsDir)) {
    if (!file.endsWith('.ts')) continue;
    const source = readFileSync(join(scriptsDir, file), 'utf8');
    const mutates = MUTATION_MARKERS.some((marker) => marker.test(source))
      && CONNECTION_MARKERS.some((marker) => marker.test(source));
    if (!mutates) continue;
    inventory.push({
      script: file,
      guarded: source.includes('claimDatabaseOwnership') || source.includes('runOwnedMutatingSuite'),
      // A suite that creates and drops its own database in-process is already self-contained.
      selfContained: /createdb|CREATE DATABASE/i.test(source) && /dropdb|DROP DATABASE/i.test(source),
      operatorCommand: OPERATOR_COMMANDS.includes(file)
        && OPERATOR_SAFETY_MARKERS.every((marker) => marker.test(source)),
    });
  }

  const unprotected = inventory.filter(
    (entry) => !entry.guarded && !entry.selfContained && !entry.operatorCommand);
  console.log('');
  console.log('  mutating-suite inventory (' + inventory.length + ' suites):');
  for (const entry of inventory) {
    const state = entry.guarded ? 'GUARDED'
      : entry.selfContained ? 'SELF-CONTAINED'
      : entry.operatorCommand ? 'OPERATOR CMD' : 'NEEDS GUARD';
    console.log('    ' + state.padEnd(15) + entry.script);
  }
  check(inventory.length > 0, 'the inventory found mutating suites to classify');
  check(inventory.some((entry) => entry.script === 'test-regulatory-release-lifecycle.ts' && entry.guarded),
    'the known hazard test-regulatory-release-lifecycle.ts is GUARDED');
  check(unprotected.length === 0,
    'every mutating suite is guarded, self-contained or a declared operator command (unprotected: ' +
    (unprotected.map((e) => e.script).join(', ') || 'none') + ')');
  // KG-5B. The exemption stays exactly one entry wide, and it stays earned.
  const operatorCommands = inventory.filter((entry) => entry.operatorCommand).map((e) => e.script);
  check(operatorCommands.length === 1 && operatorCommands[0] === 'regulatory-release.ts',
    'exactly one script is exempt as an operator command, and it is the release CLI (found: ' +
    (operatorCommands.join(', ') || 'none') + ')');
  check(OPERATOR_COMMANDS.every((file) => {
    const source = readFileSync(join(scriptsDir, file), 'utf8');
    return OPERATOR_SAFETY_MARKERS.every((marker) => marker.test(source));
  }), 'every allowlisted operator command requires explicit expected-state arguments');
}

main()
  .then(() => {
    console.log('');
    console.log('kg4d-default-off: ' + checks.length + ' passed, ' + failures.length + ' failed');
    if (failures.length) {
      for (const entry of failures) console.error('  FAIL  ' + entry);
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.stack : error);
    process.exitCode = 1;
  });
