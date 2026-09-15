/**
 * §300 / HZ-10 — NO MODULE MAY RE-IMPLEMENT WHAT "NOBODY" MEANS.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. Reads source files only.
 * Runs with `npm run check:bare-person-negation` and inside `hazlenz:test`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS, AND IT IS NOT A STYLE RULE.
 *
 * §299 repaired the bare-negation defect in `shared-evidence-facts.ts` — the words `nobody` and
 * `no one` treated as evidence that nobody was exposed — and proved the repair with 117 local
 * assertions. §300 then ran the same observation through the real production runtime and found
 * THE IDENTICAL DEFECT STILL LIVE, in `hazlenz-evidence-boundary.ts`, a module downstream of
 * everything §299 exercised. Every §299 proof had passed the whole time.
 *
 * One repair, two copies, and nothing held the second to the first. That is the failure this file
 * exists to make impossible a third time: it fails the build if ANY module outside the one that
 * owns the rule matches `nobody` or `no one` as a member of a regular-expression alternation.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS AND IS NOT A VIOLATION.
 *
 * A VIOLATION is a regex literal in executable source that tests observation text for the bare
 * words. That is the shape that makes a negative person quantifier into a claim about exposure,
 * and it is always wrong: what such a quantifier negates is decided by the predicate it scopes
 * over, which is `person-negation-semantics.ts`'s job.
 *
 * NOT a violation, and all of these are deliberately allowed:
 *
 *   - `person-negation-semantics.ts` itself, which owns the rule;
 *   - comments and documentation, including the ones that explain the defect;
 *   - fixtures, evaluation corpora and test scenarios, whose whole purpose is to CONTAIN such
 *     sentences so that the engine can be measured on them;
 *   - `reasoning-l3/word-classes.ts`, whose PRONOUNS list is a closed linguistic word class and
 *     makes no claim about exposure at all.
 *
 * The allowlist is explicit and small. Adding to it should require the same argument this file
 * makes: that the module is not deciding what a negative person quantifier means.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

/*
 * The real source tree. Overridable by environment variable for ONE purpose: proving that this
 * check actually fails. A gate nobody has watched fail is not evidence, so
 * `verification/current/hz10-repair-300/prove-bare-negation-check-fails.mjs` points it at a copy of
 * the PRE-§300 file and asserts a non-zero exit. No product path sets it.
 */
const SRC = process.env.BARE_NEGATION_SCAN_ROOT ?? join(__dirname, '..', 'src');

/** Modules permitted to name the bare words in executable code, each with its reason. */
const ALLOWED: ReadonlyArray<{ path: string; why: string }> = [
  {
    path: 'hazlenz/evidence/person-negation-semantics.ts',
    why: 'Owns the rule. This is the one place the vocabulary is allowed to be spelled out.',
  },
  {
    path: 'hazlenz/reasoning-l3/word-classes.ts',
    why: 'A closed linguistic PRONOUNS list. It classifies parts of speech and asserts nothing '
      + 'about exposure.',
  },
];

/** Directories whose contents are stimulus material, not engine logic. */
const STIMULUS_DIRS = ['/fixtures/', '/eval/', '/tests/', '/__tests__/', '/seed/'];

interface Violation {
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/**
 * Strip comments and string literals before scanning.
 *
 * Prose is not the defect — an alternation is. Without this, every explanatory header that
 * describes HZ-4 and HZ-10 would report itself as a violation, and the check would be turned off
 * within a week. Only regex literals survive the strip.
 */
function executableRegexLiterals(source: string): Array<{ line: number; text: string }> {
  const lines = source.split('\n');
  const found: Array<{ line: number; text: string }> = [];
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    const blockStart = line.indexOf('/*');
    if (blockStart !== -1) {
      const end = line.indexOf('*/', blockStart + 2);
      if (end === -1) { line = line.slice(0, blockStart); inBlockComment = true; }
      else line = line.slice(0, blockStart) + line.slice(end + 2);
    }
    const lineComment = line.indexOf('//');
    if (lineComment !== -1) line = line.slice(0, lineComment);
    if (!line.trim()) continue;
    // Regex literals only. A quoted string containing the word is prose or a fixture.
    for (const match of line.matchAll(/\/(?![/*])(?:\\.|\[(?:\\.|[^\]])*\]|[^/\\\n])+\/[gimsuy]*/g)) {
      found.push({ line: i + 1, text: match[0] });
    }
  }
  return found;
}

const BARE = /\bno\s*(?:body|[- ]?one)\b/i;

const violations: Violation[] = [];
let scanned = 0;
let skippedStimulus = 0;

for (const file of walk(SRC)) {
  const rel = relative(SRC, file).split('\\').join('/');
  if (ALLOWED.some(a => a.path === rel)) continue;
  if (STIMULUS_DIRS.some(d => `/${rel}`.includes(d))) { skippedStimulus += 1; continue; }
  scanned += 1;
  const source = readFileSync(file, 'utf8');
  if (!BARE.test(source)) continue;
  for (const literal of executableRegexLiterals(source)) {
    if (BARE.test(literal.text)) {
      violations.push({ file: rel, line: literal.line, text: literal.text.slice(0, 160) });
    }
  }
}

console.log('\n---- bare person-quantifier check ----\n');
console.log(`  files scanned            : ${scanned}`);
console.log(`  stimulus files skipped   : ${skippedStimulus}`);
for (const a of ALLOWED) console.log(`  allowed                  : ${a.path}\n      ${a.why}`);
console.log('');

if (violations.length === 0) {
  console.log('ok    No module outside person-negation-semantics.ts decides what "nobody" means.\n');
  process.exit(0);
}

console.error(`FAIL  ${violations.length} bare person-quantifier alternation(s) in executable code:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`      ${v.text}`);
}
console.error(
  '\n  A negative person quantifier is not an assertion about exposure. What it negates is decided\n'
  + '  by the predicate it scopes over. Use readPersonNegation() from\n'
  + '  src/hazlenz/evidence/person-negation-semantics.ts rather than matching the words directly.\n'
  + '  This check exists because §299 repaired one copy of exactly this and §300 found a second\n'
  + '  one still live in production.\n');
process.exit(1);
