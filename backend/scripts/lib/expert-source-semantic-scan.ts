/**
 * §198 -- INTEGRITY-INSTRUMENT PRECISION. Scan CODE, never PROSE. ZERO PROVIDER CALLS.
 *
 * ==================== THE FALSE POSITIVE THIS EXISTS TO PREVENT ====================
 *
 * The §197 pre-spend gate contained:
 *
 *     check('transition authorities do not include a model explanation', 'true',
 *       String(!/TRANSITION_AUTHORITIES[\s\S]{0,200}MODEL/i.test(settlementSurface)));
 *
 * It failed 57/58 — on `owed-fact-ledger.ts`'s own COMMENT explaining that there is deliberately no
 * member for a model explanation. The module was correct. The instrument read the explanation of the
 * rule as a violation of it.
 *
 * §170 had already written the lesson down:
 *
 *   "Comments are stripped before any source scan. Every guard below is a claim about what the CODE
 *    does; a comment stating 'there is no toggle' must not fail a check looking for the word
 *    'toggle', because that would force the modules to be harder to explain in order to pass a test."
 *
 * A codebase that documents its own invariants carefully is one where naive greps fail precisely on
 * the best-documented modules. That is the wrong incentive, and this module removes it.
 *
 * ==================== WHAT IT DOES NOT DO ====================
 *
 * It does not weaken coverage. Stripping comments removes prose from the scanned text and removes
 * NOTHING executable — the same token in an executable position still matches. Where an invariant
 * can be asserted against an exported VALUE instead of scanned for in text, that is strictly better
 * and `preferValueAssertion` says so; this module is for the cases where a scan is genuinely the
 * right instrument.
 */

export const SOURCE_SEMANTIC_SCAN_VERSION = 'hazlenz.expert.source-semantic-scan.v1' as const;

/**
 * Strip comments, leaving executable text and its layout.
 *
 * Line positions are preserved by replacing a stripped block with the newlines it contained, so a
 * reported line number still points at the right line of the original file.
 *
 * String literals are LEFT IN PLACE deliberately. A forbidden token inside a string literal is
 * executable content — it is what a message will say, what a key will be named, what a regex will
 * match — and hiding it would be the coverage weakening this module promises not to do.
 */
export function stripComments(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  type Mode = 'code' | 'line' | 'block' | 'single' | 'double' | 'template';
  let mode: Mode = 'code';
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (mode === 'code') {
      if (c === '/' && next === '/') { mode = 'line'; i += 2; continue; }
      if (c === '/' && next === '*') { mode = 'block'; i += 2; continue; }
      if (c === "'") { mode = 'single'; out += c; i += 1; continue; }
      if (c === '"') { mode = 'double'; out += c; i += 1; continue; }
      if (c === '`') { mode = 'template'; out += c; i += 1; continue; }
      out += c; i += 1; continue;
    }
    if (mode === 'line') {
      if (c === '\n') { mode = 'code'; out += c; }
      i += 1; continue;
    }
    if (mode === 'block') {
      if (c === '*' && next === '/') { mode = 'code'; i += 2; continue; }
      if (c === '\n') out += c; // keep line numbering honest
      i += 1; continue;
    }
    // inside a string literal
    if (c === '\\') { out += c + (next ?? ''); i += 2; continue; }
    if ((mode === 'single' && c === "'") || (mode === 'double' && c === '"')
        || (mode === 'template' && c === '`')) {
      mode = 'code';
    }
    out += c; i += 1; continue;
  }
  return out;
}

export interface SemanticScanResult {
  readonly clean: boolean;
  readonly matches: readonly { line: number; text: string }[];
}

/**
 * Search the EXECUTABLE text of a source file for a pattern.
 *
 * The pattern is applied line by line against comment-stripped source, so a match carries a usable
 * line number and a caller can show the offending line rather than a boolean.
 */
export function scanExecutableSource(src: string, pattern: RegExp): SemanticScanResult {
  const stripped = stripComments(src);
  const matches: { line: number; text: string }[] = [];
  const re = new RegExp(pattern.source, pattern.flags.replace(/g/g, ''));
  stripped.split('\n').forEach((line, idx) => {
    if (line.trim().length === 0) return;
    if (re.test(line)) matches.push({ line: idx + 1, text: line.trim().slice(0, 160) });
  });
  return { clean: matches.length === 0, matches };
}

/** Convenience: the invariant holds when the pattern appears nowhere executable. */
export function assertAbsentFromExecutableSource(src: string, pattern: RegExp): boolean {
  return scanExecutableSource(src, pattern).clean;
}

/**
 * Recorded so the next author reaches for the better instrument first.
 *
 * A scan over text answers "does this token appear". An assertion over an exported value answers
 * "is the invariant true". The second is what an integrity gate actually wants, and the §197
 * false positive was a case where the first was used because it was easier to write.
 */
export const preferValueAssertion = {
  rule: 'where an invariant can be asserted against an EXPORTED VALUE, assert the value. Use a '
    + 'source scan only where no value carries the property — for example, proving that a module '
    + 'never CALLS a function.',
  section197Example: {
    scannedFor: '/TRANSITION_AUTHORITIES[\\s\\S]{0,200}MODEL/i over raw source',
    whyItFailed: 'matched the module\'s own comment explaining the invariant',
    replacedWith: 'an assertion over TRANSITION_AUTHORITIES\' member values',
  },
} as const;
