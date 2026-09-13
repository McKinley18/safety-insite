/**
 * §263 — STATIC CLASSIFICATION OF EVERY VERIFICATION SCRIPT IN THE REPOSITORY.
 *
 * WHY THIS IS A TOOL AND NOT A HAND-WRITTEN LIST. §259 discovered that two scripts had been
 * silently overwriting members of the frozen §252 evidence package, and that they had done the same
 * thing during §258 without anyone noticing, because the bytes they produced happened to be
 * identical that time. A hand-written registry would have recorded exactly the scripts someone
 * remembered; this one records what the source actually does, and it can be re-run when the source
 * changes.
 *
 * WHAT IT READS AND WHAT IT CANNOT. It is a STATIC reader. It finds write calls, provider reach,
 * database mutation and the literal paths a script names. It cannot follow a path assembled at
 * runtime from a variable, and it says so rather than guessing: a script that writes to a computed
 * destination is classified UNKNOWN_WRITE_BEHAVIOR, which the registry treats as
 * sandbox-required. Defaulting an unreadable script to READ_ONLY is how §258 happened.
 *
 * IT IS READ-ONLY ITSELF unless `--write` is passed, and even then it writes exactly one file:
 * the registry under verification/current/. It never touches a historical package.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';

const BACKEND = join(__dirname, '..', '..');
const REPO = join(BACKEND, '..');
const SCRIPT_ROOTS = [join(BACKEND, 'scripts')];

export const SCRIPT_CLASSES = [
  /** Reads and asserts. Writes nothing anywhere. Safe to run at any time. */
  'READ_ONLY',
  /** Writes only under a §263-or-later successor evidence directory it owns. */
  'WRITES_SUCCESSOR_OUTPUT',
  /** Writes into an accepted historical evidence package. Sandbox required. */
  'WRITES_HISTORICAL_OUTPUT',
  /** Reaches a provider. Never part of a default command. */
  'PROVIDER_CALLING',
  /** Requires a live environment: object storage, billing, a deployed instance, a browser. */
  'LIVE_ENVIRONMENT',
  /** Mutates a database schema or rows. Disposable target only. */
  'MUTATES_DATABASE',
  /** The static reader could not establish where it writes. Treated as sandbox-required. */
  'UNKNOWN_WRITE_BEHAVIOR',
] as const;
export type ScriptClass = (typeof SCRIPT_CLASSES)[number];

/**
 * A write whose destination is a string literal we can read. Anything that writes through a
 * variable falls to the unresolved counter instead, and the script is marked unknown.
 */
const WRITE_CALL = /\b(?:writeFileSync|writeFile|appendFileSync|appendFile|mkdirSync|mkdir|copyFileSync|renameSync|rmSync|unlinkSync|rimraf|cpSync)\s*\(/g;
const WRITE_WITH_LITERAL = /\b(?:writeFileSync|appendFileSync|copyFileSync|renameSync|rmSync|unlinkSync|mkdirSync)\s*\(\s*(?:join|resolve)?\s*\(?\s*([^)]*)/g;
const PROVIDER_REACH = /ANTHROPIC_API_KEY|api\.anthropic\.com|HostedExpertSemanticTransport|OPENAI_API_KEY|OLLAMA_HOST/;
const LIVE_ENVIRONMENT = /STORAGE_S3_BUCKET|puppeteer|API_BASE_URL|RENDER_|STRIPE_SECRET|playwright/;
// §268 added `runMigrations` and `undoLastMigration`. The pattern previously recognised only the
// CLI form (`migration:run`), so `scripts/release/migrate.js` — which applies migrations through
// the TypeORM API and is the one script that mutates PRODUCTION schema — was classified READ_ONLY.
// A registry that mislabels the most consequential mutator is worse than one that omits it.
const DATABASE_MUTATION = /\b(?:INSERT\s+INTO|UPDATE\s+"|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE|DROP\s+TABLE|CREATE\s+DATABASE|DROP\s+DATABASE|migration:run|runMigrations|undoLastMigration|synchronize:\s*true)\b/i;
/**
 * A path literal that lands inside the evidence tree.
 *
 * TWO FORMS, BECAUSE ONE OF THEM MISSED A KNOWN OFFENDER. The obvious form is a literal containing
 * `verification/`. The form that hid `verify-252-admission-matrix` from the first version of this
 * reader is `join(__dirname, '..', '..', 'verification', 'expert-hazlenz-252-...')`, where the
 * package name is its own segment and no literal contains a slash at all. So every string literal
 * is ALSO matched against the actual directory names under `verification/`, which is the only form
 * that cannot be evaded by however the path happens to be assembled from constant segments.
 */
const EVIDENCE_PATH = /['"`]([^'"`]*verification\/[^'"`]+)['"`]/g;
const ANY_STRING_LITERAL = /['"`]([^'"`\n]{3,200})['"`]/g;

/**
 * STRIP COMMENTS AND REGEX LITERALS BEFORE MATCHING.
 *
 * WHY THIS IS NECESSARY AND NOT COSMETIC. The first version classified THIS FILE as
 * PROVIDER_CALLING, LIVE_ENVIRONMENT and MUTATES_DATABASE, because its own detection patterns are
 * written in its own source; and it classified the read-only verifier as PROVIDER_CALLING because
 * that file explains, in a comment, that it calls no provider. A registry whose loudest warnings
 * are on its own safety tooling is a registry people learn to ignore, and then the one true warning
 * is ignored with the rest.
 *
 * Comments carry no behaviour, so removing them cannot hide a write, a credential read or a query —
 * every one of those has to appear in executable code. Regex literals are removed for the same
 * reason: a pattern that DESCRIBES a credential name is not a credential read.
 *
 * The ground-truth check below is what keeps this from quietly becoming under-reading.
 */
function stripNonExecutable(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
    .replace(/=\s*\/(?:[^/\\\n]|\\.)+\/[gimsuy]*/g, '= /pattern/');
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    // §268 extended this from `.ts` only. The release scripts added at §268 are plain JavaScript
    // precisely so they can run in the production image without ts-node — including
    // `scripts/release/migrate.js`, which runs migrations against a real database. A registry that
    // structurally could not see the one script that mutates production schema was not reflecting
    // current known behaviour, which is the property this file exists to have.
    return full.endsWith('.ts') || full.endsWith('.js') ? [full] : [];
  });
}

/** Which § package a path literal belongs to, when it names one. */
function packageOf(path: string): string | null {
  const match = /verification\/([^/'"`]+)/.exec(path);
  return match ? match[1] : null;
}

export interface ScriptRecord {
  readonly script: string;
  readonly classes: ScriptClass[];
  readonly writesLiteralPaths: string[];
  readonly evidencePackagesNamed: string[];
  readonly unresolvedWriteCalls: number;
  readonly sandboxRequired: boolean;
  readonly notes: string[];
}

/**
 * A package is HISTORICAL when it exists in the tree and is not the successor this section owns.
 * Establishing it from the directory listing rather than from a § number keeps the rule from
 * drifting as sections are added.
 */
function historicalPackages(): Set<string> {
  const root = join(REPO, 'verification');
  return new Set(readdirSync(root)
    .filter(name => statSync(join(root, name)).isDirectory())
    .filter(name => name !== 'current'));
}

export function classifyAll(): ScriptRecord[] {
  const historical = historicalPackages();
  const records: ScriptRecord[] = [];

  for (const root of SCRIPT_ROOTS) {
    for (const file of walk(root)) {
      const source = stripNonExecutable(readFileSync(file, 'utf8'));
      const script = relative(REPO, file);
      const classes = new Set<ScriptClass>();
      const notes: string[] = [];

      const writeCalls = [...source.matchAll(WRITE_CALL)].length;
      const literals = new Set<string>();
      for (const match of source.matchAll(EVIDENCE_PATH)) literals.add(match[1]);

      const namedPackages = new Set<string>();
      for (const literal of literals) {
        const pkg = packageOf(literal);
        if (pkg) namedPackages.add(pkg);
      }
      // Segment form: a bare package-name literal, joined onto 'verification' elsewhere.
      for (const match of source.matchAll(ANY_STRING_LITERAL)) {
        if (historical.has(match[1])) {
          namedPackages.add(match[1]);
          literals.add(`verification/${match[1]}`);
        }
      }

      // A write call whose argument we could not read as a literal path.
      const resolvable = [...source.matchAll(WRITE_WITH_LITERAL)].length;
      const unresolved = Math.max(0, writeCalls - resolvable);

      if (PROVIDER_REACH.test(source)) {
        classes.add('PROVIDER_CALLING');
        notes.push('names a provider credential, endpoint or hosted transport');
      }
      if (LIVE_ENVIRONMENT.test(source)) {
        classes.add('LIVE_ENVIRONMENT');
        notes.push('requires a live environment: storage, a running server, a browser or billing');
      }
      if (DATABASE_MUTATION.test(source)) {
        classes.add('MUTATES_DATABASE');
        notes.push('issues schema or row mutation; disposable target only');
      }

      if (writeCalls === 0) {
        classes.add('READ_ONLY');
      } else {
        const writesHistorical = [...namedPackages].some(p => historical.has(p));
        const writesCurrent = [...literals].some(l => l.includes('verification/current'));
        if (writesHistorical) {
          classes.add('WRITES_HISTORICAL_OUTPUT');
          notes.push('writes into an accepted historical evidence package');
        }
        if (writesCurrent) classes.add('WRITES_SUCCESSOR_OUTPUT');
        if (!writesHistorical && !writesCurrent) {
          if (unresolved > 0 || namedPackages.size === 0) {
            classes.add('UNKNOWN_WRITE_BEHAVIOR');
            notes.push(`${writeCalls} write call(s) whose destination the static reader could not `
              + 'resolve to a literal path');
          } else {
            classes.add('WRITES_SUCCESSOR_OUTPUT');
          }
        }
      }

      const sandboxRequired = classes.has('WRITES_HISTORICAL_OUTPUT')
        || classes.has('UNKNOWN_WRITE_BEHAVIOR');

      records.push({
        script,
        classes: [...classes].sort(),
        writesLiteralPaths: [...literals].sort(),
        evidencePackagesNamed: [...namedPackages].filter(p => historical.has(p)).sort(),
        unresolvedWriteCalls: unresolved,
        sandboxRequired,
        notes,
      });
    }
  }
  return records.sort((a, b) => a.script.localeCompare(b.script));
}

/**
 * THE INSTRUMENT CHECKS ITSELF AGAINST WHAT §259 ESTABLISHED BY OBSERVATION.
 *
 * §259 caught two scripts overwriting frozen §252 and §243 members, and recorded them by name. A
 * static reader that does not reproduce that finding is under-reading, and a registry built from an
 * under-reading classifier is worse than no registry: it would state, with machine authority, that
 * scripts known to mutate evidence do not. The first version of this file missed one of the two.
 */
const GROUND_TRUTH_259_MUTATORS = [
  'backend/scripts/verify-252-admission-matrix.ts',
  'backend/scripts/verify-252-section243-replay.ts',
];

export function assertClassifierReproducesKnownMutators(records: ScriptRecord[]): string[] {
  const missed: string[] = [];
  for (const known of GROUND_TRUTH_259_MUTATORS) {
    const record = records.find(r => r.script === known);
    if (!record || !record.classes.includes('WRITES_HISTORICAL_OUTPUT')) missed.push(known);
  }
  return missed;
}

function main(): void {
  const records = classifyAll();
  const missed = assertClassifierReproducesKnownMutators(records);
  if (missed.length > 0) {
    console.error('CLASSIFIER_263_ABORT: the static reader failed to reproduce the accepted-evidence '
      + `mutation §259 established by observation: ${missed.join(', ')}. The reader is `
      + 'under-reading and its registry must not be written.');
    process.exit(1);
  }
  const counts: Record<string, number> = {};
  for (const record of records) {
    for (const c of record.classes) counts[c] = (counts[c] ?? 0) + 1;
  }
  const mutatingHistorical = records.filter(r => r.classes.includes('WRITES_HISTORICAL_OUTPUT'));
  const unknown = records.filter(r => r.classes.includes('UNKNOWN_WRITE_BEHAVIOR'));

  console.log(`scripts classified: ${records.length}`);
  for (const [name, n] of Object.entries(counts).sort()) {
    console.log(`  ${name.padEnd(26)} ${n}`);
  }
  console.log(`\nwrites into accepted historical evidence: ${mutatingHistorical.length}`);
  for (const r of mutatingHistorical) {
    console.log(`  ${r.script}`);
    for (const p of r.evidencePackagesNamed) console.log(`      -> ${p}`);
  }
  console.log(`\nunresolved write behaviour (sandbox by default): ${unknown.length}`);

  // WHICH npm ENTRY POINTS ARE DANGEROUS. A registry keyed by filename answers a question nobody
  // asks; people type npm script names. This maps the classification onto the surface an operator
  // actually touches, which is where the §258 mistake was made.
  const packageScripts = JSON.parse(
    readFileSync(join(BACKEND, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
  const byPath = new Map(records.map(r => [r.script, r]));
  const npmEntryPoints: {
    npmScript: string; script: string; classes: ScriptClass[]; sandboxRequired: boolean;
  }[] = [];
  for (const [name, command] of Object.entries(packageScripts.scripts)) {
    const match = /(?:ts-node|node)\s+(scripts\/[^\s]+\.ts)/.exec(command);
    if (!match) continue;
    const record = byPath.get(`backend/${match[1]}`);
    if (!record) continue;
    if (record.classes.length === 1 && record.classes[0] === 'READ_ONLY') continue;
    npmEntryPoints.push({
      npmScript: name, script: record.script,
      classes: record.classes, sandboxRequired: record.sandboxRequired,
    });
  }
  console.log(`\nnpm entry points that are NOT plain read-only: ${npmEntryPoints.length}`);

  if (process.argv.includes('--write')) {
    const out = join(REPO, 'verification', 'current', 'MUTATING-SCRIPTS.json');
    writeFileSync(out, `${JSON.stringify({
      artifact: 'HAZLENZ_SCRIPT_WRITE_REGISTRY',
      generatedBy: 'backend/scripts/hazlenz/classify-scripts.ts',
      derivation: 'static source analysis, re-runnable; not a hand-maintained list',
      staticReaderLimitation:
        'a write through a computed path cannot be resolved and is recorded as '
        + 'UNKNOWN_WRITE_BEHAVIOR, which the registry treats as sandbox-required',
      classes: SCRIPT_CLASSES,
      totals: { scripts: records.length, ...counts },
      writesAcceptedHistoricalEvidence: mutatingHistorical.map(r => ({
        script: r.script,
        packages: r.evidencePackagesNamed,
        paths: r.writesLiteralPaths.filter(p => r.evidencePackagesNamed
          .some(pkg => p.includes(pkg))),
        sandboxRequired: true,
        safeReplacement: SAFE_REPLACEMENT[r.script] ?? null,
      })),
      unknownWriteBehaviour: unknown.map(r => r.script),
      npmEntryPointsThatAreNotPlainReadOnly: npmEntryPoints
        .sort((a, b) => a.npmScript.localeCompare(b.npmScript)),
      scripts: records,
    }, null, 2)}\n`);
    console.log(`\nregistry written: ${relative(REPO, out)}`);
  }
}

/**
 * Where a read-only successor exists for a script that writes historical evidence, it is named so a
 * future operator reaches for it instead. Absent means none exists yet, which is itself the fact.
 */
const SAFE_REPLACEMENT: Readonly<Record<string, string>> = {
  'backend/scripts/verify-252-admission-matrix.ts':
    'npm run hazlenz:verify (identity and protected modules) — the admission matrix itself has no '
    + 'read-only successor; run it under a sandbox copy when forensic replay is needed',
  'backend/scripts/verify-252-section243-replay.ts':
    'npm run hazlenz:verify — no read-only successor; sandbox for forensic replay',
};

if (require.main === module) main();
