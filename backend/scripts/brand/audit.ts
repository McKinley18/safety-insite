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

/**
 * Brands that are retired. Safety InSite and HazLenz are the only live names.
 *
 * §275. These are CANONICAL names, matched case-insensitively and separator-tolerantly by
 * `brandPatterns()` below. They are deliberately NOT an enumeration of spellings.
 *
 * The previous list enumerated cases by hand — `SafeScope`, `safescope`, `SAFESCOPE`, `safe-scope`
 * — and matched with a case-SENSITIVE `String.includes`. That list could never be complete, and it
 * demonstrably was not: `SafescopeV2Service` (lowercase `s` in `scope`) matched none of the five
 * SafeScope spellings and was invisible to this gate. Enumerating one more case would have fixed
 * that one identifier and left `safeScope`, `SAFE_SCOPE` and `Safe_Scope` equally invisible. The
 * failure mode of a hand-maintained case list is that it reports PASS because it cannot see, which
 * is worse than reporting a number, so the list is now canonical names and the matching is derived.
 */
export const RETIRED_BRANDS = [
  'SafeScope', 'Sentinel Safety', 'AuditAlly', 'GuideGuard', 'SightSignal', 'ReviewCore',
] as const;

/**
 * One case-insensitive pattern per canonical brand.
 *
 * A canonical name is split on its internal capitals and spaces (`SafeScope` -> `Safe` + `Scope`,
 * `Sentinel Safety` -> `Sentinel` + `Safety`) and rejoined with `[\s_-]*`, so a single entry
 * catches `SafeScope`, `Safescope`, `safescope`, `safeScope`, `SAFESCOPE`, `safe-scope`,
 * `safe_scope` and `Safe Scope` without any of them being written down.
 */
export function brandPatterns(): ReadonlyArray<readonly [string, RegExp]> {
  return RETIRED_BRANDS.map((b) => [
    b,
    new RegExp(b.split(/(?=[A-Z])|\s+/).filter(Boolean).join('[\\s_-]*'), 'i'),
  ] as const);
}

/**
 * IDENTIFIERS RETAINED ON PURPOSE — every entry is a row of
 * `project-docs/current/BRAND-COMPATIBILITY-REGISTER.md`, not a convenience silencer.
 *
 * These carry a retired brand because CHANGING them is the hazard: an applied migration's class
 * name keys the `migrations` table, a physical table name holds governed knowledge rows, an
 * entitlement discriminator sits on the access-control path where a silent mismatch fails open or
 * closed on billing-gated routes, and a `localStorage` key rename silently discards a user's cached
 * bundle or their calendar entries. They are counted and REPORTED SEPARATELY rather than dropped,
 * and they carry their own ratchet, so the set cannot grow quietly.
 */
export const COMPATIBILITY_IDENTIFIERS: ReadonlyArray<readonly [RegExp, string]> = [
  [/safeScopeResult/i, 'persisted finding JSON field; needs a data migration plus a coordinated frontend change'],
  [/fullSafeScope/i, 'entitlement discriminator on the access-control path'],
  [/safescope_knowledge_\w+/i, 'physical table created by applied migration 1780000000000 and successors'],
  [/safescope_reasoning_snapshots/i, 'physical table created by applied migration 1790000000000'],
  [/safescope_supervisor_validations/i, 'physical table created by applied migration 1790000001000'],
  [/(?:Create|Add)SafeScope\w*/i, 'applied migration class name; renaming re-runs or orphans it'],
  [/sentinel_safescope_brain_bundle\w*/i, 'localStorage key for the cached offline knowledge bundle'],
  [/auditally_personal_calendar_events/i, 'localStorage key holding user-authored calendar entries'],
  [/auditally_cache_cleanup_version/i, 'localStorage key gating the one-time client cache cleanup'],
];

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
  /** The canonical retired brand this matched. */
  readonly brand: string;
  /** The spelling actually present in the source, which may differ in case and separators. */
  readonly spelling: string;
  /** The register reason when this is a deliberately retained identifier, else null. */
  readonly compatibility: string | null;
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

/**
 * Which register entry, if any, explains this line. Classified against the FULL line, never the
 * truncated `text` a Hit carries for display — a compatibility identifier that happens to sit past
 * the display cut-off is still a compatibility identifier.
 */
function compatibilityReason(line: string): string | null {
  for (const [re, why] of COMPATIBILITY_IDENTIFIERS) if (re.test(line)) return why;
  return null;
}

export function scan(globs: ReadonlyArray<readonly [string, string]>, visibleOnly: boolean): Hit[] {
  const hits: Hit[] = [];
  const patterns = brandPatterns();
  for (const [g] of globs) {
    const files: string[] = [];
    walk(join(REPO, g), files);
    for (const f of files) {
      let content: string;
      try { content = readFileSync(f, 'utf8'); } catch { continue; }
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        for (const [brand, re] of patterns) {
          const m = line.match(re);
          if (!m) continue;
          // `m[0]` is the spelling actually present, which is what the visibility predicate has to
          // look for; `brand` is the canonical name, which is what a reader wants to be told.
          if (visibleOnly && !isCustomerVisible(line, m[0])) continue;
          hits.push({
            file: relative(REPO, f).split(sep).join('/'),
            line: i + 1, brand, spelling: m[0],
            compatibility: compatibilityReason(line),
            text: line.trim().slice(0, 120),
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
 * §274 lowered this to 390, from the 2669 §272 recorded.
 *
 * A mid-§274 measurement briefly read 353. That number was taken while three path rewrites were
 * broken — the safescope-data corpus references, two applied migration class names, and a
 * historical document filename — and repairing them put those references back. 390 is the settled
 * figure and the lower one was never real. This is a RATCHET: lower it whenever a
 * migration removes references, never raise it. Raising it is how a cleanup silently reverses.
 *
 * The remaining references are concentrated in `src/hazlenz/`, which §272 could not rename —
 * nine of the twenty-nine protected modules live under that path and two of them name it in a
 * comment, so the directory cannot move without editing a protected, §259-digested file. That is a
 * product-owner decision, recorded in docs/hazlenz/current/BRAND-COMPATIBILITY-REGISTER.md.
 */
/**
 * §275 RE-BASELINED THIS, AND THE NUMBER MOVING IS NOT THE RATCHET BEING RAISED.
 *
 * 390 was measured by a case-SENSITIVE matcher that could not see 597 further references —
 * `safeScopeResult` alone accounts for most of them. Nothing was cleaned up and nothing regressed;
 * the instrument simply started measuring the thing it always claimed to measure. Carrying 390
 * forward against a matcher that now sees 987 would have failed the gate for a reason that has
 * nothing to do with anyone's work.
 *
 * The count is now split, because the two halves have different meanings and different futures:
 *
 *   REMAINING DEBT (293, budgeted here)  internal identifiers nobody has decided to keep. This is
 *                                        the ratchet. Lower it whenever a migration removes
 *                                        references; never raise it.
 *   RETAINED (694, budgeted separately)  every line matching a COMPATIBILITY_IDENTIFIERS entry,
 *                                        each of which is a row of the compatibility register with
 *                                        a stated reason it is dangerous to rename.
 *
 * Splitting them is what makes the debt number honest. Under the old single integer, migrating a
 * table name and adding a new `safeScopeResult` reference were the same event.
 */
export const TIER2_BUDGET = Number(process.env.BRAND_TIER2_BUDGET ?? '') || 293;

/** Ratchet over the deliberately retained set, so the register cannot grow without being noticed. */
export const COMPATIBILITY_BUDGET = Number(process.env.BRAND_COMPAT_BUDGET ?? '') || 694;

function main(): void {
  const tier1 = scan(TIER1_GLOBS, true);
  const all = scan(TIER2_GLOBS, false).concat(scan(TIER1_GLOBS, false));
  const retained = all.filter((h) => h.compatibility !== null);
  const tier2 = all.filter((h) => h.compatibility === null);

  console.log('\nSafety InSite — brand audit (read-only, 0 provider calls)\n');
  console.log('  Live brands: Safety InSite (product), HazLenz (engine)');
  console.log('  Matching:    case-insensitive, separator-tolerant, derived from canonical names\n');

  console.log(`  TIER 1  customer-visible retired brand        ${tier1.length === 0 ? 'PASS' : 'FAIL'}   ${tier1.length} hit(s)`);
  for (const h of tier1) console.log(`            ${h.file}:${h.line}  [${h.spelling}]  ${h.text}`);

  const budget = TIER2_BUDGET;
  const t2status = tier2.length <= budget ? 'PASS' : 'FAIL';
  console.log(`  TIER 2  internal identifiers (ratcheted)      ${t2status}   ${tier2.length} reference(s) / budget ${budget}`);

  const cstatus = retained.length <= COMPATIBILITY_BUDGET ? 'PASS' : 'FAIL';
  console.log(`  RETAINED  register-documented identifiers     ${cstatus}   ${retained.length} reference(s) / budget ${COMPATIBILITY_BUDGET}`);
  const byReason = new Map<string, number>();
  for (const h of retained) byReason.set(h.compatibility as string, (byReason.get(h.compatibility as string) ?? 0) + 1);
  for (const [why, n] of [...byReason.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`            ${String(n).padStart(5)}  ${why}`);
  }

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
    retainedCompatibilityIdentifiers: retained.length,
    compatibilityBudget: COMPATIBILITY_BUDGET,
    matching: 'case-insensitive',
    providerCalls: 0, databaseOperations: 0, filesWritten: 0,
  }));

  if (tier1.length > 0) { console.log('\nBRAND AUDIT FAIL — a retired brand reaches the customer\n'); process.exit(1); }
  if (t2status === 'FAIL') { console.log('\nBRAND AUDIT FAIL — Tier 2 budget exceeded\n'); process.exit(1); }
  if (cstatus === 'FAIL') { console.log('\nBRAND AUDIT FAIL — the retained-identifier set grew\n'); process.exit(1); }
  console.log('\nBRAND AUDIT PASS\n');
}

if (require.main === module) main();
