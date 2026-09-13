/**
 * §272 — THE CANONICAL BRAND AUDIT. READ-ONLY BY CONSTRUCTION.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS IS NOT `grep -r SafeScope .`
 *
 * A whole-repository grep for a retired brand returns thousands of hits and is therefore useless
 * as a gate: most of them are frozen historical evidence, where the old name is the accurate
 * record of what was actually built and measured. Rewriting those would destroy provenance to
 * satisfy a cosmetic rule. So this audit scopes itself to surfaces that are ACTIVE and CURRENT,
 * and it separates two questions that a flat grep conflates:
 *
 *   TIER 1  Does a retired brand reach a customer? Rendered copy, page metadata, email and report
 *           output, public asset paths. This is the product's face. The budget is zero, always,
 *           and a single hit fails the command.
 *
 *   TIER 2  Does a retired brand survive as an internal identifier — a symbol, a module path, a
 *           route segment? This is real debt, but it is invisible to customers and some of it is
 *           pinned by the protected-module boundary (see EXCLUSIONS). It is measured against a
 *           recorded budget rather than demanded to be zero, so the number can only go down.
 *
 * The distinction matters because the two have different costs. Tier 1 is cheap to fix and
 * expensive to ship. Tier 2 is expensive to fix and cheap to ship.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, sep } from 'path';

const BACKEND = join(__dirname, '..', '..');
const REPO = join(BACKEND, '..');

/** Brands that are retired. Safety InSite and HazLenz are the only live names. */
export const RETIRED_BRANDS = [
  'SafeScope', 'Safe Scope', 'safescope', 'safe-scope', 'SAFESCOPE',
  'Sentinel Safety', 'sentinel_safety', 'sentinel-safety', 'SentinelSafety',
  'AuditAlly', 'auditally', 'GuideGuard', 'SightSignal', 'ReviewCore',
] as const;

/**
 * Paths this audit never reads. Each entry is a REASON, not a convenience.
 *
 * The verification tree and the research tree are frozen historical evidence: the retired brand in
 * them is the accurate record of what was built under that name, and §272 is explicitly forbidden
 * from rewriting it. `safescope-data` and `test-data` are captured corpora whose bytes are
 * provenance-bearing. Everything else is generated or vendored.
 */
export const EXCLUDED_TREES: ReadonlyArray<readonly [string, string]> = [
  ['verification', 'frozen historical evidence — the retired brand is the accurate record'],
  ['research', 'frozen R&D material, superseded by the shipped product'],
  ['project-docs', 'historical product documentation, retained for provenance'],
  ['safescope-data', 'captured corpus whose bytes are provenance-bearing'],
  ['test-data', 'captured fixtures whose bytes are provenance-bearing'],
  ['node_modules', 'vendored'],
  ['.git', 'vcs internals'],
  ['.next', 'build output'],
  ['dist', 'build output'],
];

const SKIP_DIR = new Set(EXCLUDED_TREES.map(([p]) => p.split('/').pop() as string));
const TEXT_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|json|md|css|html|yml|yaml|sh|webmanifest)$/;

/**
 * TIER 1 SURFACES — what a customer can actually see. Anything a browser renders, anything a
 * report or email emits, anything served from a public URL.
 */
const TIER1_GLOBS: ReadonlyArray<readonly [string, string]> = [
  ['frontend-next/app', 'rendered pages and route metadata'],
  ['frontend-next/components', 'rendered components'],
  ['frontend-next/public', 'publicly served assets'],
  ['backend/src/email', 'outbound email copy'],
  ['backend/src/pdf', 'generated PDF copy'],
  ['backend/src/reports', 'generated report copy'],
  ['backend/src/transparency', 'customer-facing report explanations'],
];

/** TIER 2 SURFACES — active internal code. Real debt, measured not demanded. */
const TIER2_GLOBS: ReadonlyArray<readonly [string, string]> = [
  ['frontend-next/lib', 'frontend internals'],
  ['frontend-next/hooks', 'frontend internals'],
  ['frontend-next/types', 'frontend internals'],
  ['backend/src', 'backend runtime'],
];

export interface Hit {
  readonly file: string;
  readonly line: number;
  readonly brand: string;
  readonly text: string;
}

function walk(dir: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR.has(entry)) continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, out);
    else if (TEXT_EXT.test(entry)) out.push(full);
  }
}

/**
 * A line is CUSTOMER-VISIBLE if the brand sits in text the browser paints or a document emits,
 * rather than in a symbol name. Import statements, type names and doc comments are excluded here
 * because they are Tier 2 by definition — this predicate decides tier, not whether a hit exists.
 */
function isCustomerVisible(line: string, brand: string): boolean {
  const t = line.trim();
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) return false;
  if (/^import\s|^export\s+\{|require\(/.test(t)) return false;
  // JSX text node: >  ... Brand ... <
  if (new RegExp(`>[^<>{}]*${brand}[^<>]*<`).test(line)) return true;
  // A user-facing prop or metadata field assigned a string containing the brand.
  const prop = '(title|label|placeholder|aria-label|alt|description|heading|subtitle|name|message|applicationName|short_name|tagline|summary|text)';
  if (new RegExp(`${prop}\\s*[:=]\\s*["'\`][^"'\`]*${brand}`, 'i').test(line)) return true;
  // A public asset URL served to the browser.
  if (new RegExp(`["'\`][^"'\`]*/${brand}[^"'\`]*["'\`]`, 'i').test(line) && /\.(png|jpg|svg|webp|ico|pdf)/i.test(line)) return true;
  return false;
}

export function scan(globs: ReadonlyArray<readonly [string, string]>, visibleOnly: boolean): Hit[] {
  const hits: Hit[] = [];
  for (const [g] of globs) {
    const files: string[] = [];
    walk(join(REPO, g), files);
    for (const f of files) {
      let content: string;
      try { content = readFileSync(f, 'utf8'); } catch { continue; }
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        for (const brand of RETIRED_BRANDS) {
          if (!line.includes(brand)) continue;
          if (visibleOnly && !isCustomerVisible(line, brand)) continue;
          hits.push({
            file: relative(REPO, f).split(sep).join('/'),
            line: i + 1, brand, text: line.trim().slice(0, 120),
          });
          break;
        }
      });
    }
  }
  return hits;
}

/**
 * The Tier 2 budget. This is a ratchet, not a target: §272 recorded what was actually there after
 * the sweep, and the number may only ever be lowered. It is deliberately a single integer rather
 * than a per-file allowlist, because a per-file allowlist grows silently.
 */
/**
 * §272 recorded 2669 internal references after the sweep. This is a RATCHET: lower it whenever a
 * migration removes references, never raise it. Raising it is how a cleanup silently reverses.
 *
 * The remaining references are concentrated in `src/safescope-v2/`, which §272 could not rename —
 * nine of the twenty-nine protected modules live under that path and two of them name it in a
 * comment, so the directory cannot move without editing a protected, §259-digested file. That is a
 * product-owner decision, recorded in docs/hazlenz/current/BRAND-COMPATIBILITY-REGISTER.md.
 */
export const TIER2_BUDGET = Number(process.env.BRAND_TIER2_BUDGET ?? '') || 2669;

function main(): void {
  const tier1 = scan(TIER1_GLOBS, true);
  const tier2 = scan(TIER2_GLOBS, false).concat(scan(TIER1_GLOBS, false));

  console.log('\nSafety InSite — brand audit (read-only, 0 provider calls)\n');
  console.log('  Live brands: Safety InSite (product), HazLenz (engine)\n');

  console.log(`  TIER 1  customer-visible retired brand        ${tier1.length === 0 ? 'PASS' : 'FAIL'}   ${tier1.length} hit(s)`);
  for (const h of tier1) console.log(`            ${h.file}:${h.line}  [${h.brand}]  ${h.text}`);

  const budget = TIER2_BUDGET;
  const t2status = budget === null ? 'RECORDED' : tier2.length <= budget ? 'PASS' : 'FAIL';
  console.log(`  TIER 2  internal identifiers (ratcheted)      ${t2status}   ${tier2.length} reference(s)${budget !== null ? ` / budget ${budget}` : ''}`);

  const byTree = new Map<string, number>();
  for (const h of tier2) {
    const key = h.file.split('/').slice(0, 2).join('/');
    byTree.set(key, (byTree.get(key) ?? 0) + 1);
  }
  for (const [k, v] of [...byTree.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(`            ${String(v).padStart(5)}  ${k}`);
  }

  console.log('\n  Excluded from this audit, deliberately:');
  for (const [p, why] of EXCLUDED_TREES) {
    if (['node_modules', '.git', '.next', 'dist'].includes(p)) continue;
    console.log(`            ${p.padEnd(16)} ${why}`);
  }

  console.log(JSON.stringify({
    tier1CustomerVisible: tier1.length,
    tier2InternalIdentifiers: tier2.length,
    tier2Budget: budget,
    providerCalls: 0, databaseOperations: 0, filesWritten: 0,
  }));

  if (tier1.length > 0) { console.log('\nBRAND AUDIT FAIL — a retired brand reaches the customer\n'); process.exit(1); }
  if (t2status === 'FAIL') { console.log('\nBRAND AUDIT FAIL — Tier 2 budget exceeded\n'); process.exit(1); }
  console.log('\nBRAND AUDIT PASS\n');
}

if (require.main === module) main();
