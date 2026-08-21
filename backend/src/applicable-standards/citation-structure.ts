/**
 * KG-3F -- structured CFR citation identity for retrieval.
 *
 * WHY THIS EXISTS. `ApplicableStandardsService` compared citations by canonicalising them to
 * alphanumerics and testing bidirectional substring containment:
 *
 *     canonicalize("29 CFR 1926.501") -> "1926501"
 *     canonicalize("29 CFR 1926.50")  -> "192650"
 *     "1926501".includes("192650")    -> TRUE
 *
 * Because the dot is stripped, a shorter section number is a literal string prefix of a longer one,
 * so `29 CFR 1926.50` (scope) and `29 CFR 1926.501` (duty to have fall protection) were treated as
 * the same citation. The same collision hit `1910.95` vs `1910.9` and `1910.132(a)` vs `1910.13`.
 * The retrieval dedup keeps only the first of any "matching" pair, so a legitimately distinct
 * citation could be silently dropped from a customer's results.
 *
 * A citation is not a string; it is (part, section, subsection path). Comparing the parts as
 * structure removes the collisions entirely while preserving the behaviour every call site actually
 * wants -- "is this candidate the section I named, or a paragraph inside it".
 *
 * This module is intentionally free of database and framework dependencies so it can be unit-tested
 * directly.
 */

export interface ParsedCitation {
  /** CFR part, e.g. "1910", "1926", "56". */
  part: string;
  /** Section number as written, e.g. "303", "14132", "501". NOT numerically normalised. */
  section: string;
  /** Ordered subsection path, e.g. ["b","1"] for 1910.303(b)(1). Empty for a bare section. */
  subsections: string[];
  raw: string;
}

const AGENCY_PREFIX = /^\s*(?:(?:29|30)\s*(?:c\.?f\.?r\.?)?|msha|osha|cfr|part|subpart|§)\s*/gi;

/**
 * Parses "29 CFR 1910.303(b)(1)", "1910.212(a)(1)", "30 CFR 56.14132", "56.14107(a)".
 * Returns null when the citation does not look like a part.section reference, in which case callers
 * fall back to exact string comparison rather than guessing.
 */
export function parseCitation(citation: string): ParsedCitation | null {
  if (!citation) return null;
  let s = String(citation).trim();
  // Strip any leading agency/title tokens, repeatedly (handles "29 CFR " and bare "CFR ").
  let prev: string;
  do { prev = s; s = s.replace(AGENCY_PREFIX, ''); } while (s !== prev);

  const m = /^(\d+)\.(\d+[A-Za-z]?)/.exec(s);
  if (!m) return null;

  const rest = s.slice(m[0].length);
  const subsections = [...rest.matchAll(/\(([A-Za-z0-9]+)\)/g)].map(x => x[1].toLowerCase());

  return { part: m[1], section: m[2].toLowerCase(), subsections, raw: String(citation) };
}

/** Same CFR part AND same section number. `1926.50` and `1926.501` are NOT the same section. */
export function isSameSection(a: string, b: string): boolean {
  const pa = parseCitation(a), pb = parseCitation(b);
  if (!pa || !pb) return false;
  return pa.part === pb.part && pa.section === pb.section;
}

const isPrefixOf = (short: string[], long: string[]) =>
  short.length <= long.length && short.every((v, i) => v === long[i]);

/**
 * True when the two citations are the same section AND one's subsection path is a prefix of the
 * other's -- i.e. they are the same provision, or one is an ancestor of the other.
 *
 *   1910.303        vs 1910.303(b)(1)     -> true  (parent / paragraph)
 *   1910.303(b)(1)  vs 1910.303(g)(2)(i)  -> false (sibling paragraphs, different requirements)
 *   1926.50         vs 1926.501           -> false (different sections)
 *
 * The sibling case is the one that matters most for regulatory fidelity: KG-3D established that
 * 1910.303(b)(1) (Examination) and 1910.303(g)(2)(i) (Guarding of live parts) are different rules,
 * and nothing here may treat them as interchangeable.
 */
export function isSameOrAncestorCitation(a: string, b: string): boolean {
  const pa = parseCitation(a), pb = parseCitation(b);
  if (!pa || !pb) {
    return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
  }
  if (pa.part !== pb.part || pa.section !== pb.section) return false;
  return isPrefixOf(pa.subsections, pb.subsections) || isPrefixOf(pb.subsections, pa.subsections);
}

/** How specific a citation is: 0 for a bare section, 1 for (a), 2 for (a)(1), and so on. */
export function citationSpecificity(citation: string): number {
  return parseCitation(citation)?.subsections.length ?? 0;
}

/**
 * A stable total-order key, used ONLY as a terminal tie-break after semantic relevance has already
 * been decided. Sections are zero-padded so `1926.50` sorts before `1926.501` numerically rather
 * than lexically, and the subsection path follows.
 *
 * This must never be used as a primary ordering: KG-3E warned that ordering by citation alone
 * systematically prefers paragraph records to their parents, which is the wrong default.
 */
export function citationSortKey(citation: string): string {
  const p = parseCitation(citation);
  if (!p) return `zzz|${String(citation).toLowerCase()}`;
  const section = p.section.padStart(8, '0');
  const subs = p.subsections.map(x => x.padStart(4, '0')).join('.');
  return `${p.part.padStart(6, '0')}|${section}|${subs}`;
}
