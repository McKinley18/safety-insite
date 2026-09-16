/**
 * §308 (LG-3) — THE LEGAL PUBLICATION GATE.
 *
 *   npm run check:legal-documents
 *
 * Deterministic, offline, read-only. Unlike `security:deps` this contacts nothing and depends on
 * no remote service, so it belongs in `hazlenz:precommit` and is wired there: its answer is a pure
 * function of the repository, which is exactly the property §307 said a precommit gate needs.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IT REFUSES, AND WHY EACH ONE IS A REAL FAILURE RATHER THAN A STYLE RULE.
 *
 *   1. A PUBLISHED BODY EDITED WITHOUT A NEW VERSION. This is §308's requirement O and the most
 *      important line here. An acceptance row records a version and a digest; if the body behind a
 *      version can change, every acceptance of it silently becomes a record of text that no longer
 *      exists. The registry recomputes the digest from the file, so the only way to change what a
 *      document says is to publish a new version — which is what makes an accepted version
 *      genuinely immutable rather than immutable by convention.
 *
 *   2. A SYNTHETIC FIXTURE IN THE PRODUCTION REGISTRY. `legalTestFixturesEnabled()` already refuses
 *      fixtures whenever NODE_ENV is production, and `validateProductionEnvironment()` refuses the
 *      flag at boot. Neither of those can see a fixture entry PASTED BY HAND into the production
 *      array, and that is the one mistake a human editing this registry is actually likely to make.
 *      This check is the one that catches it.
 *
 *   3. A DOCUMENT PAST DRAFT WITH NO COUNSEL APPROVAL. §308's central rule. Enforced in the
 *      registry too — this reports it as a finding rather than only as a boot crash, so a developer
 *      sees a sentence instead of a stack trace.
 *
 *   4. MORE THAN ONE ACTIVE DOCUMENT OF A TYPE. "The current Terms" must have exactly one answer.
 *
 *   5. A DRAFT BODY REACHABLE FROM THE PUBLICATION ROOT. The drafts in `project-docs/legal/` carry
 *      `LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED`; a copy of one under `legal-documents/`
 *      would be publishable, so the gate greps the publication root for that marker.
 *
 *   6. A TEMPORARY-BRAND OCCURRENCE IN THE FRAMEWORK. §308 forbids hard-coding the product name
 *      into the publication framework. Document BODIES are exempt and deliberately so — rewriting
 *      legal text is not engineering's to do — and those occurrences are INVENTORIED for counsel
 *      instead, which this prints.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';

import {
  LEGAL_PUBLICATION_ROOT, digestOf, legalTestFixturesEnabled, productionRegistryEntries,
  registryEntriesFor, resolveRegistry,
} from '../src/legal/legal-document-registry';
import { LEGAL_DOCUMENT_TYPES } from '../src/legal/legal-document.types';

const BACKEND = resolve(__dirname, '..');
const REPO = resolve(BACKEND, '..');

const failures: string[] = [];
const notes: string[] = [];
let checks = 0;

function check(condition: unknown, message: string, detail = ''): void {
  checks += 1;
  if (condition) { console.log(`  ok    ${message}${detail ? `  [${detail}]` : ''}`); return; }
  failures.push(message);
  console.log(`  FAIL  ${message}${detail ? `  [${detail}]` : ''}`);
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

console.log('='.repeat(96));
console.log('§308 LEGAL PUBLICATION GATE — deterministic, offline, read-only');
console.log('='.repeat(96));

// ---------------------------------------------------------------------------------------------
console.log('\n-- 1. the registry loads, and every declared digest matches its file --\n');
// ---------------------------------------------------------------------------------------------

/*
 * THE TWO FIXTURE SETS ARE RESOLVED SEPARATELY, AND THAT IS NOT A CONVENIENCE.
 *
 * Both `terms-0.0.0-test.1` and `terms-0.0.0-hostile.1` are ACTIVE terms, so enabling both at once
 * is precisely the "two ACTIVE documents of one type" condition the registry refuses — the first
 * draft of this gate did enable both and the registry correctly refused to load. They are separate
 * flags for the same reason they are separate arrays: the hostile payload must never be sitting in
 * the set an ordinary activation test turns on.
 */
const standardFixtureEnv = { ...process.env, NODE_ENV: 'test', LEGAL_TEST_FIXTURES: 'true', LEGAL_HOSTILE_FIXTURE: '' };
const hostileFixtureEnv = { ...process.env, NODE_ENV: 'test', LEGAL_TEST_FIXTURES: '', LEGAL_HOSTILE_FIXTURE: 'true' };

let resolvedAll: ReturnType<typeof resolveRegistry> = [];
try {
  const standard = resolveRegistry(standardFixtureEnv as NodeJS.ProcessEnv);
  const hostile = resolveRegistry(hostileFixtureEnv as NodeJS.ProcessEnv);
  resolvedAll = [...standard, ...hostile.filter((d) => d.synthetic && !standard.some((s) => s.version === d.version && s.documentType === d.documentType))];
  check(true, 'the registry resolves for the production set, the standard fixture set and the '
    + 'hostile fixture set', `${standard.length} standard + ${hostile.length} hostile document(s)`);
} catch (error) {
  check(false, 'the registry resolves', error instanceof Error ? error.message : String(error));
}

/*
 * AND IT REFUSES THE COMBINATION. Watched to fail rather than assumed: the registry's
 * one-ACTIVE-per-type rule is only a control if it actually throws.
 */
let refusedBoth = false;
try {
  resolveRegistry({ ...process.env, NODE_ENV: 'test', LEGAL_TEST_FIXTURES: 'true', LEGAL_HOSTILE_FIXTURE: 'true' } as NodeJS.ProcessEnv);
} catch { refusedBoth = true; }
check(refusedBoth,
  'the registry REFUSES to load when two ACTIVE documents of one type are present — the '
  + 'one-ACTIVE-per-type rule is enforced by throwing, not by convention');

for (const document of resolvedAll) {
  const recomputed = digestOf(document.body);
  check(recomputed === document.expectedDigest,
    `${document.documentType}@${document.version}: the file's sha256 matches the declared digest — `
    + 'a published version has not been edited underneath the people who accepted it',
    recomputed === document.expectedDigest ? recomputed.slice(0, 16) : `declared ${document.expectedDigest.slice(0, 12)} file ${recomputed.slice(0, 12)}`);
}

// ---------------------------------------------------------------------------------------------
console.log('\n-- 2. production cannot publish a synthetic fixture --\n');
// ---------------------------------------------------------------------------------------------

const productionEntries = productionRegistryEntries();
check(productionEntries.every((e) => !e.synthetic),
  'no synthetic document appears in the PRODUCTION registry — the one mistake the NODE_ENV guard '
  + 'and the boot guard cannot see is a fixture pasted in by hand',
  `${productionEntries.length} production entr(ies), ${productionEntries.filter((e) => e.synthetic).length} synthetic`);

check(legalTestFixturesEnabled({ NODE_ENV: 'production', LEGAL_TEST_FIXTURES: 'true' } as NodeJS.ProcessEnv) === false,
  'fixtures are refused in production even with LEGAL_TEST_FIXTURES=true — NODE_ENV is checked '
  + 'FIRST, so no environment value can enable them');
check(registryEntriesFor({ NODE_ENV: 'production', LEGAL_TEST_FIXTURES: 'true', LEGAL_HOSTILE_FIXTURE: 'true' } as NodeJS.ProcessEnv)
  .every((e) => !e.synthetic),
  'and the production registry resolves to zero synthetic entries under those flags');

// ---------------------------------------------------------------------------------------------
console.log('\n-- 3. publication state is honest --\n');
// ---------------------------------------------------------------------------------------------

for (const document of resolvedAll) {
  const label = `${document.documentType}@${document.version}`;
  if (document.state === 'DRAFT') {
    check(document.counselApproval === null, `${label}: DRAFT carries no counsel approval`);
  } else {
    check(Boolean(document.counselApproval?.approver?.trim()),
      `${label}: ${document.state} records who approved it — code cannot promote a document past DRAFT`,
      document.counselApproval?.approver ?? 'NONE');
    check(Boolean(document.effectiveDate), `${label}: ${document.state} carries an effective date`,
      document.effectiveDate ?? 'NONE');
  }
}

for (const type of LEGAL_DOCUMENT_TYPES) {
  // The STANDARD set, because `resolvedAll` deliberately concatenates two mutually exclusive
  // fixture sets so that every declared digest is verified.
  const active = resolveRegistry(standardFixtureEnv as NodeJS.ProcessEnv)
    .filter((d) => d.documentType === type && d.state === 'ACTIVE');
  check(active.length <= 1, `at most one ACTIVE ${type} document — "the current ${type}" has exactly one answer`,
    active.map((d) => d.version).join(', ') || 'none');
}

// ---------------------------------------------------------------------------------------------
console.log('\n-- 4. no unapproved draft is reachable from the publication root --\n');
// ---------------------------------------------------------------------------------------------

const DRAFT_MARKER = 'LEGAL COUNSEL REVIEW STATUS: NOT YET APPROVED';
const publishedFiles = walk(LEGAL_PUBLICATION_ROOT).filter((f) => f.endsWith('.md'));
const draftMarkerHits = publishedFiles.filter((f) => {
  if (f.endsWith('README.md')) return false;
  return readFileSync(f, 'utf8').includes(DRAFT_MARKER);
});
check(draftMarkerHits.length === 0,
  'no file under the publication root carries the unapproved-draft marker — a copy of a '
  + 'project-docs/legal/ draft placed here would be publishable',
  draftMarkerHits.map((f) => relative(REPO, f)).join(', ') || 'none');

const draftRoot = join(REPO, 'project-docs', 'legal');
check(!resolve(LEGAL_PUBLICATION_ROOT).startsWith(resolve(draftRoot))
  && !resolve(draftRoot).startsWith(resolve(LEGAL_PUBLICATION_ROOT)),
  'the publication root and the draft directory are disjoint trees, so no sourceFile can name a draft',
  `${relative(REPO, LEGAL_PUBLICATION_ROOT)} vs ${relative(REPO, draftRoot)}`);

// BOTH fixture sets, because they are mutually exclusive at load time but both legitimately
// present on disk. Enumerating only one would report the other's file as an orphan.
const registryFiles = new Set([
  ...registryEntriesFor(standardFixtureEnv as NodeJS.ProcessEnv),
  ...registryEntriesFor(hostileFixtureEnv as NodeJS.ProcessEnv),
].map((e) => e.sourceFile));
const unregistered = publishedFiles
  .map((f) => relative(LEGAL_PUBLICATION_ROOT, f))
  .filter((f) => f !== 'README.md' && !registryFiles.has(f));
check(unregistered.length === 0,
  'every .md file under the publication root is enumerated in the registry — an unenumerated file '
  + 'is inert, and its presence means somebody expected a publication that will not happen',
  unregistered.join(', ') || 'none');

// ---------------------------------------------------------------------------------------------
console.log('\n-- 5. the framework does not hard-code the temporary product name --\n');
// ---------------------------------------------------------------------------------------------

/*
 * §308: "Do not hard-code Safety InSite into the legal publication framework." The FRAMEWORK is the
 * source under src/legal/ and the frontend legal surfaces. Document BODIES are explicitly exempt —
 * §308 says not to rewrite substantive legal text automatically, and instead to inventory the
 * occurrences for counsel, which section 6 below does.
 */
const frameworkFiles = [
  ...walk(join(BACKEND, 'src', 'legal')),
  ...walk(join(REPO, 'frontend-next', 'app', 'terms')),
  ...walk(join(REPO, 'frontend-next', 'app', 'privacy')),
  ...walk(join(REPO, 'frontend-next', 'lib', 'legal')),
  ...walk(join(REPO, 'frontend-next', 'components', 'legal')),
].filter((f) => /\.(ts|tsx)$/.test(f));

const brandLiterals: string[] = [];
for (const file of frameworkFiles) {
  const text = readFileSync(file, 'utf8');
  text.split('\n').forEach((line, index) => {
    // Comments are documentation, not behaviour. A literal in CODE is what would survive a rename.
    const trimmed = line.trim();
    if (trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    if (/Safety\s*InSite/i.test(line)) brandLiterals.push(`${relative(REPO, file)}:${index + 1}`);
  });
}
check(brandLiterals.length === 0,
  'no executable line in the legal publication framework hard-codes the temporary product name — '
  + 'the name comes from the configurable authority, so a rename is configuration rather than a '
  + 'code change',
  brandLiterals.join(', ') || 'none');

// ---------------------------------------------------------------------------------------------
console.log('\n-- 6. INVENTORY: the temporary brand inside substantive draft legal text --\n');
// ---------------------------------------------------------------------------------------------

/*
 * NOT A FAILURE. §308 is explicit: if the substantive draft legal text contains the temporary
 * product name, do NOT rewrite it automatically — inventory it for counsel and brand replacement.
 * So this counts and reports, and never fails.
 */
const draftFiles = existsSync(draftRoot)
  ? readdirSync(draftRoot).filter((f) => f.endsWith('.md')).map((f) => join(draftRoot, f))
  : [];
let draftBrandTotal = 0;
for (const file of draftFiles.sort()) {
  const text = readFileSync(file, 'utf8');
  const hits = (text.match(/Safety\s*InSite/gi) || []).length;
  draftBrandTotal += hits;
  notes.push(`${String(hits).padStart(4)}  ${relative(REPO, file)}`);
}
console.log(`  The product name is scheduled to change before external Beta. These occurrences are`);
console.log(`  inside substantive draft legal text and are COUNSEL'S to replace, not engineering's:\n`);
for (const note of notes) console.log(`   ${note}`);
console.log(`\n   ${String(draftBrandTotal).padStart(4)}  TOTAL across ${draftFiles.length} draft document(s)`);

// ---------------------------------------------------------------------------------------------
console.log('\n' + '='.repeat(96));
const result = failures.length === 0 ? 'PASS' : 'FAIL';
console.log(`§308 LEGAL PUBLICATION GATE: ${result} — ${checks - failures.length}/${checks} checks passed`);
console.log(`  published documents in the PRODUCTION registry: ${productionEntries.length}`);
console.log(`  ACTIVE in production: ${productionEntries.filter((e) => e.state === 'ACTIVE').length}`);
console.log(`  temporary-brand occurrences in draft legal text, for counsel: ${draftBrandTotal}`);
if (failures.length) {
  console.log('\nFAILED:');
  for (const failure of failures) console.log(`  - ${failure}`);
}
console.log('='.repeat(96));
process.exit(failures.length === 0 ? 0 : 1);
