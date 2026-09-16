/**
 * §307 — THE DURABLE PRODUCTION DEPENDENCY-VULNERABILITY GATE.
 *
 * Run:  npm run security:deps                  (report, exit 0/1/2)
 *       npm run security:deps -- --strict      (also fail on UNREVIEWED moderate/low)
 *       npm run security:deps -- --evidence <path>   (additionally write the evidence JSON)
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS A RELEASE COMMAND AND NOT A PRECOMMIT HOOK.
 *
 * §307 is explicit: "avoid a gate whose output changes unpredictably merely because an advisory
 * database changed during an unrelated local precommit." `npm audit` queries a REMOTE advisory
 * service, so its answer is a function of the calendar as much as of the lockfile. Wired into
 * `hazlenz:precommit` it would turn an unrelated typo fix into a red build on a morning when
 * GitHub published something — and the reliable human response to that is to stop believing the
 * gate. It is therefore an INTENTIONAL command, run at release readiness, whose result is captured
 * as evidence with the date and the advisory identifiers it saw.
 *
 * ---------------------------------------------------------------------------------------------
 * A SCAN THAT CANNOT RUN IS `UNKNOWN`, AND `UNKNOWN` IS NOT `PASS`.
 *
 * This is the property §307 names first, and it is the one a naive gate always gets wrong: a
 * `try { audit } catch { (offline) }` reports a green gate on a laptop with no network, which
 * is the single most likely way this check ever silently stops working. So every failure to obtain
 * a usable answer — a non-zero npm exit that is not the documented "vulnerabilities found" exit, an
 * unparseable body, an `error` object in the response, a `metadata` block that is absent, or a
 * production dependency count small enough to mean the audit did not really traverse the tree —
 * exits 2 and says which ecosystem could not be scanned.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT REFUSES TO BE FOOLED BY.
 *
 * `--audit-level` and `.npmrc` `audit-level` change what npm PRINTS and what it EXITS with; they
 * do not change the JSON body. This gate therefore classifies from the body and never from npm's
 * exit code, so lowering an audit level in a config file cannot buy a pass. It also audits with
 * `--omit=dev`, because §307 requires production and dev findings to be weighed differently — and
 * asserts afterwards that the production tree it measured is a plausible size.
 *
 * ---------------------------------------------------------------------------------------------
 * AN EXCEPTION MUST CARRY A PREDICATE, NOT A PARAGRAPH.
 *
 * `security/dependency-exceptions.json` is not a suppression list. Every entry names an
 * `applicabilityCheck`, which is a function in this file that re-derives the non-applicability
 * argument from the CURRENT repository on every run. The @nestjs/core SSE advisory is excepted
 * because this product has no SSE surface — so `no-sse-surface` fails the gate the moment somebody
 * adds an `@Sse()` route, which is exactly the moment the exception stops being true. An entry also
 * expires: a stale rationale nobody has re-read is not evidence, and an expired exception blocks.
 */
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const REPO_ROOT = resolve(__dirname, '..', '..');
const BACKEND = join(REPO_ROOT, 'backend');
const FRONTEND = join(REPO_ROOT, 'frontend-next');
const EXCEPTIONS_FILE = join(BACKEND, 'security', 'dependency-exceptions.json');

const BLOCKING_SEVERITIES = new Set(['critical', 'high']);
const SEVERITY_ORDER = ['critical', 'high', 'moderate', 'low', 'info'];

/** A production tree smaller than this means the audit did not really traverse the lockfile. */
const MIN_PLAUSIBLE_PROD_DEPENDENCIES = 20;

type Severity = 'critical' | 'high' | 'moderate' | 'low' | 'info';

interface Ecosystem {
  readonly name: string;
  readonly directory: string;
  readonly manifest: string;
  readonly lockfile: string;
}

const ECOSYSTEMS: Ecosystem[] = [
  { name: 'backend', directory: BACKEND, manifest: 'package.json', lockfile: 'package-lock.json' },
  { name: 'frontend-next', directory: FRONTEND, manifest: 'package.json', lockfile: 'package-lock.json' },
];

interface RootAdvisory {
  readonly ecosystem: string;
  /** GHSA identifier where npm supplies one, else the package name plus the advisory source id. */
  readonly id: string;
  readonly package: string;
  readonly severity: Severity;
  readonly title: string;
  readonly url: string | null;
  readonly vulnerableRange: string | null;
  readonly direct: boolean;
  readonly fixAvailable: unknown;
}

interface ExceptionEntry {
  readonly id: string;
  readonly ecosystem: string;
  readonly package: string;
  readonly severity: string;
  readonly applicabilityCheck?: string;
  readonly expiresAt?: string;
  readonly reviewedAt?: string;
  readonly rationale?: string[];
  readonly title?: string;
}

// ===============================================================================================
// APPLICABILITY CHECKS — re-derived from the repository on every run, never taken on trust.
// ===============================================================================================

interface CheckResult { readonly holds: boolean; readonly detail: string; }

function walkSourceFiles(root: string, out: string[] = []): string[] {
  if (!existsSync(root)) return out;
  for (const entry of readdirSync(root)) {
    if (entry === 'node_modules' || entry === '.git' || entry === 'dist' || entry.startsWith('.next')) continue;
    const full = join(root, entry);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) walkSourceFiles(full, out);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * GHSA-36xv-jgw5-4q75 is a Server-Sent Events output-neutralisation defect in `SseStream`. It is
 * non-applicable only while the product has no SSE surface, so the proof is the ABSENCE of all
 * three ways one could appear: a Nest `@Sse()` route, a hand-written `text/event-stream` response,
 * or a browser `EventSource` that implies a server producing one.
 */
function checkNoSseSurface(): CheckResult {
  const files = [
    ...walkSourceFiles(join(BACKEND, 'src')),
    ...walkSourceFiles(join(BACKEND, 'scripts')),
    ...walkSourceFiles(join(FRONTEND, 'app')),
    ...walkSourceFiles(join(FRONTEND, 'components')),
    ...walkSourceFiles(join(FRONTEND, 'lib')),
  ];
  const hits: string[] = [];
  for (const file of files) {
    let text: string;
    try { text = readFileSync(file, 'utf8'); } catch { continue; }
    // This file describes the check, so it necessarily contains the strings it looks for.
    if (resolve(file) === resolve(__filename)) continue;
    if (/@Sse\s*\(/.test(text)) hits.push(`${file}: @Sse() route`);
    if (/text\/event-stream/.test(text)) hits.push(`${file}: text/event-stream response`);
    if (/\bnew\s+EventSource\s*\(/.test(text)) hits.push(`${file}: EventSource client`);
  }
  return hits.length === 0
    ? { holds: true, detail: `no SSE surface across ${files.length} source files (no @Sse route, no text/event-stream response, no EventSource client)` }
    : { holds: false, detail: `SSE surface now EXISTS, so the exception no longer holds: ${hits.slice(0, 5).join('; ')}` };
}

const APPLICABILITY_CHECKS: Record<string, () => CheckResult> = {
  'no-sse-surface': checkNoSseSurface,
};

// ===============================================================================================
// THE SCAN
// ===============================================================================================

type ScanOutcome =
  | { readonly kind: 'scanned'; readonly advisories: RootAdvisory[]; readonly metadata: any }
  | { readonly kind: 'unknown'; readonly reason: string };

function runAudit(ecosystem: Ecosystem): ScanOutcome {
  const manifest = join(ecosystem.directory, ecosystem.manifest);
  const lockfile = join(ecosystem.directory, ecosystem.lockfile);
  if (!existsSync(manifest)) return { kind: 'unknown', reason: `${ecosystem.name}: ${manifest} does not exist` };
  if (!existsSync(lockfile)) {
    return { kind: 'unknown', reason: `${ecosystem.name}: ${lockfile} does not exist, so there is no resolved tree to audit` };
  }

  let stdout = '';
  try {
    stdout = execFileSync('npm', ['audit', '--omit=dev', '--json'], {
      cwd: ecosystem.directory, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error: any) {
    /*
     * npm exits NON-ZERO when it finds vulnerabilities, and that is a successful scan. It also
     * exits non-zero when it cannot reach the registry, and that is not. The discriminator is the
     * BODY, not the code: a real result parses and carries `metadata.vulnerabilities`.
     */
    stdout = String(error?.stdout ?? '');
    if (!stdout.trim()) {
      const stderr = String(error?.stderr ?? '').trim().split('\n').slice(0, 4).join(' | ');
      return { kind: 'unknown', reason: `${ecosystem.name}: npm audit produced no output (exit ${error?.status ?? '?'}): ${stderr || 'no stderr'}` };
    }
  }

  let parsed: any;
  try { parsed = JSON.parse(stdout); } catch {
    return { kind: 'unknown', reason: `${ecosystem.name}: npm audit output was not JSON (first 200 chars: ${stdout.slice(0, 200).replace(/\s+/g, ' ')})` };
  }
  if (parsed?.error) {
    const code = parsed.error.code ?? 'unknown';
    return { kind: 'unknown', reason: `${ecosystem.name}: npm audit returned an error object (code ${code}: ${String(parsed.error.summary ?? '').slice(0, 200)})` };
  }
  if (!parsed?.metadata?.vulnerabilities || !parsed?.metadata?.dependencies) {
    return { kind: 'unknown', reason: `${ecosystem.name}: npm audit response carried no metadata block, so nothing was actually measured` };
  }
  const prodCount = Number(parsed.metadata.dependencies.prod ?? 0);
  if (!Number.isFinite(prodCount) || prodCount < MIN_PLAUSIBLE_PROD_DEPENDENCIES) {
    return {
      kind: 'unknown',
      reason: `${ecosystem.name}: the audit reported only ${prodCount} production dependencies, below the `
        + `${MIN_PLAUSIBLE_PROD_DEPENDENCIES} this gate requires before it will believe a tree was traversed`,
    };
  }

  /*
   * ROOT ADVISORIES ONLY. npm repeats one advisory on every dependent, so a single @nestjs/core
   * finding appears against three packages. Only the object-valued `via` entries are real
   * advisories; a string-valued `via` names a dependent and is propagation. Counting propagation
   * would inflate every report and make an exception file that has to list packages rather than
   * defects.
   */
  const advisories: RootAdvisory[] = [];
  for (const [name, entry] of Object.entries<any>(parsed.vulnerabilities ?? {})) {
    for (const via of entry.via ?? []) {
      if (typeof via !== 'object' || via === null) continue;
      const url = typeof via.url === 'string' ? via.url : null;
      const ghsa = url?.match(/GHSA-[a-z0-9-]+/i)?.[0] ?? null;
      advisories.push({
        ecosystem: ecosystem.name,
        id: ghsa ?? `${via.name ?? name}@source-${via.source ?? 'unknown'}`,
        package: String(via.name ?? name),
        severity: String(via.severity ?? entry.severity ?? 'info').toLowerCase() as Severity,
        title: String(via.title ?? 'untitled advisory'),
        url,
        vulnerableRange: typeof via.range === 'string' ? via.range : null,
        direct: Boolean(entry.isDirect),
        fixAvailable: entry.fixAvailable ?? null,
      });
    }
  }
  // One advisory can be reported against several nodes of the same package; collapse by id+package.
  const deduped = new Map<string, RootAdvisory>();
  for (const advisory of advisories) deduped.set(`${advisory.id}::${advisory.package}`, advisory);
  return { kind: 'scanned', advisories: [...deduped.values()], metadata: parsed.metadata };
}

// ===============================================================================================

function loadExceptions(): { entries: ExceptionEntry[]; policy: any } {
  if (!existsSync(EXCEPTIONS_FILE)) {
    throw new Error(`§307 GATE REFUSED: ${EXCEPTIONS_FILE} is missing. An absent exception register is `
      + 'not an empty one — the gate cannot tell a reviewed finding from a new one without it.');
  }
  const parsed = JSON.parse(readFileSync(EXCEPTIONS_FILE, 'utf8'));
  if (!Array.isArray(parsed?.exceptions)) throw new Error(`§307 GATE REFUSED: ${EXCEPTIONS_FILE} has no exceptions array.`);
  return { entries: parsed.exceptions as ExceptionEntry[], policy: parsed.policy ?? {} };
}

function matches(entry: ExceptionEntry, advisory: RootAdvisory): boolean {
  if (entry.ecosystem !== advisory.ecosystem) return false;
  if (entry.package !== advisory.package) return false;
  const base = entry.id.split(':')[0];
  return base === advisory.id || entry.id === advisory.id;
}

function main(): void {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const evidenceIndex = args.indexOf('--evidence');
  const evidencePath = evidenceIndex >= 0 ? args[evidenceIndex + 1] : null;

  const { entries, policy } = loadExceptions();
  const startedAt = new Date().toISOString();

  const scans: Record<string, any> = {};
  const unknowns: string[] = [];
  const allAdvisories: RootAdvisory[] = [];

  for (const ecosystem of ECOSYSTEMS) {
    const outcome = runAudit(ecosystem);
    if (outcome.kind === 'unknown') {
      unknowns.push(outcome.reason);
      scans[ecosystem.name] = { state: 'UNKNOWN', reason: outcome.reason };
      continue;
    }
    scans[ecosystem.name] = {
      state: 'SCANNED',
      productionDependencies: outcome.metadata.dependencies.prod,
      devDependencies: outcome.metadata.dependencies.dev,
      totalDependencies: outcome.metadata.dependencies.total,
      npmReportedCounts: outcome.metadata.vulnerabilities,
      rootAdvisories: outcome.advisories.length,
    };
    allAdvisories.push(...outcome.advisories);
  }

  console.log('='.repeat(96));
  console.log('§307 PRODUCTION DEPENDENCY-VULNERABILITY GATE');
  console.log(`scanner: npm audit --omit=dev --json   (npm ${execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim()}, node ${process.version})`);
  console.log(`started: ${startedAt}`);
  console.log('='.repeat(96));

  for (const [name, scan] of Object.entries(scans)) {
    if (scan.state === 'UNKNOWN') { console.log(`  ${name.padEnd(16)} UNKNOWN — ${scan.reason}`); continue; }
    const counts = scan.npmReportedCounts;
    console.log(`  ${name.padEnd(16)} ${String(scan.productionDependencies).padStart(4)} production deps  |  `
      + `critical ${counts.critical}  high ${counts.high}  moderate ${counts.moderate}  low ${counts.low}  `
      + `|  ${scan.rootAdvisories} distinct root advisor${scan.rootAdvisories === 1 ? 'y' : 'ies'}`);
  }

  /*
   * UNKNOWN SHORT-CIRCUITS. An ecosystem that could not be scanned may contain anything, so there
   * is no honest way to combine "clean" from one tree with "unmeasured" from the other.
   */
  if (unknowns.length) {
    console.log('\nRESULT: UNKNOWN');
    for (const reason of unknowns) console.log(`  - ${reason}`);
    console.log('\nA scan that cannot execute is UNKNOWN, not PASS. Re-run with registry access before release.');
    if (evidencePath) writeEvidence(evidencePath, { schema: 'insite.dependency-gate.v1', section: '307', startedAt, result: 'UNKNOWN', policy, scans, unknowns });
    process.exit(2);
  }

  // ---- classify -----------------------------------------------------------------------------
  const blocking: Array<{ advisory: RootAdvisory; reason: string }> = [];
  const excepted: Array<{ advisory: RootAdvisory; entry: ExceptionEntry; check: CheckResult | null }> = [];
  const unreviewed: RootAdvisory[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const advisory of allAdvisories) {
    const entry = entries.find((candidate) => matches(candidate, advisory));
    const isBlockingSeverity = BLOCKING_SEVERITIES.has(advisory.severity);

    if (!entry) {
      if (isBlockingSeverity) blocking.push({ advisory, reason: `${advisory.severity.toUpperCase()} production finding with no recorded exception` });
      else unreviewed.push(advisory);
      continue;
    }

    if (entry.expiresAt && entry.expiresAt < today) {
      blocking.push({ advisory, reason: `exception ${entry.id} EXPIRED on ${entry.expiresAt}; an un-re-read rationale is not evidence` });
      continue;
    }

    let check: CheckResult | null = null;
    if (entry.applicabilityCheck) {
      const fn = APPLICABILITY_CHECKS[entry.applicabilityCheck];
      if (!fn) {
        blocking.push({ advisory, reason: `exception ${entry.id} names applicabilityCheck "${entry.applicabilityCheck}", which this gate does not implement` });
        continue;
      }
      check = fn();
      if (!check.holds) {
        blocking.push({ advisory, reason: `exception ${entry.id} no longer holds: ${check.detail}` });
        continue;
      }
    } else if (isBlockingSeverity) {
      blocking.push({ advisory, reason: `exception ${entry.id} excuses a ${advisory.severity.toUpperCase()} finding with prose only; a blocking severity requires a mechanically re-checkable applicabilityCheck` });
      continue;
    }
    excepted.push({ advisory, entry, check });
  }

  const staleExceptions = entries.filter((entry) => !allAdvisories.some((advisory) => matches(entry, advisory)));

  // ---- report -------------------------------------------------------------------------------
  const bySeverity = (a: RootAdvisory, b: RootAdvisory) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);

  if (blocking.length) {
    console.log(`\nBLOCKING (${blocking.length}):`);
    for (const { advisory, reason } of blocking) {
      console.log(`  [${advisory.severity.toUpperCase()}] ${advisory.ecosystem}/${advisory.package} — ${advisory.id}`);
      console.log(`      ${advisory.title}`);
      console.log(`      ${reason}`);
      if (advisory.url) console.log(`      ${advisory.url}`);
    }
  }

  if (excepted.length) {
    console.log(`\nEXCEPTED, RE-PROVEN THIS RUN (${excepted.length}):`);
    for (const { advisory, entry, check } of excepted.sort((x, y) => bySeverity(x.advisory, y.advisory))) {
      console.log(`  [${advisory.severity}] ${advisory.ecosystem}/${advisory.package} — ${entry.id}`
        + (entry.expiresAt ? `  (expires ${entry.expiresAt})` : ''));
      if (check) console.log(`      ${entry.applicabilityCheck}: ${check.detail}`);
    }
  }

  if (unreviewed.length) {
    console.log(`\nUNREVIEWED, NON-BLOCKING BY SEVERITY (${unreviewed.length}) — record a decision for each in security/dependency-exceptions.json:`);
    for (const advisory of unreviewed.sort(bySeverity)) {
      console.log(`  [${advisory.severity}] ${advisory.ecosystem}/${advisory.package} — ${advisory.id}: ${advisory.title}`);
    }
  }

  if (staleExceptions.length) {
    console.log(`\nSTALE EXCEPTIONS (${staleExceptions.length}) — the finding is gone; delete the entry so the register stays readable:`);
    for (const entry of staleExceptions) console.log(`  ${entry.ecosystem}/${entry.package} — ${entry.id}`);
  }

  const failed = blocking.length > 0 || (strict && unreviewed.length > 0);
  const result = failed ? 'FAIL' : 'PASS';
  console.log(`\nRESULT: ${result}`);
  if (result === 'PASS') {
    console.log(`  0 blocking production findings. ${excepted.length} excepted and re-proven, ${unreviewed.length} unreviewed non-blocking.`);
  } else if (strict && !blocking.length) {
    console.log('  --strict: unreviewed non-blocking findings are treated as failures in this mode.');
  }

  if (evidencePath) {
    writeEvidence(evidencePath, {
      schema: 'insite.dependency-gate.v1', section: '307', startedAt, finishedAt: new Date().toISOString(),
      strict, result, policy, scans,
      blocking: blocking.map(({ advisory, reason }) => ({ ...advisory, blockingReason: reason })),
      excepted: excepted.map(({ advisory, entry, check }) => ({ ...advisory, exceptionId: entry.id, applicabilityCheck: entry.applicabilityCheck ?? null, applicabilityDetail: check?.detail ?? null, expiresAt: entry.expiresAt ?? null })),
      unreviewed, staleExceptions,
    });
    console.log(`  evidence written to ${evidencePath}`);
  }

  process.exit(failed ? 1 : 0);
}

function writeEvidence(path: string, payload: unknown): void {
  mkdirSync(dirname(resolve(path)), { recursive: true });
  writeFileSync(resolve(path), `${JSON.stringify(payload, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  // A gate that throws must not look like a gate that passed.
  console.error('\nRESULT: UNKNOWN');
  console.error(`  the gate itself failed to run: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}
