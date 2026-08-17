export function normalized(value: unknown): string {
  return String(value || '').toLowerCase();
}

export function hasNonNegatedTerm(text: string, term: string, options?: { requireWordBoundary?: boolean }): boolean {
  const value = normalized(text);
  const target = normalized(term).trim();
  const requireWordBoundary = options?.requireWordBoundary !== false;

  if (!target) return false;

  let index = value.indexOf(target);

  while (index !== -1) {
    const isWordBoundaryBefore = index === 0 || !/[a-z0-9_]/i.test(value[index - 1]);
    const isWordBoundaryAfter = index + target.length === value.length || !/[a-z0-9_]/i.test(value[index + target.length]);

    if (!requireWordBoundary || (isWordBoundaryBefore && isWordBoundaryAfter)) {
      const before = value.slice(Math.max(0, index - 45), index);
      const after = value.slice(index + target.length, index + target.length + 35);

      const negatedBefore = /\b(no|not|none|without|never|neither|nor|wasn't|weren't|isn't|aren't|was not|were not|is not|are not|no evidence of|not observed|not present|not occurring|was not occurring|were not occurring)\b[\w\s,;:-]*$/i.test(before);

      const negatedAfter = /^[\w\s,;:-]*\b(not present|not observed|not occurring|was not occurring|were not occurring|absent|ruled out)\b/i.test(after);

      if (!negatedBefore && ! negatedAfter) {
        return true;
      }
    }

    index = value.indexOf(target, index + target.length);
  }

  return false;
}

// Same negation-window semantics as hasNonNegatedTerm, but matches on a raw
// substring rather than a whole word (requireWordBoundary: false) — needed by
// callers (e.g. the deterministic classifier) whose existing keyword scoring
// already relies on substring matching (e.g. "conductor" matching within
// "conductors") for recall, and which negation-awareness must not narrow.
export function hasNonNegatedSubstring(text: string, substring: string): boolean {
  return hasNonNegatedTerm(text, substring, { requireWordBoundary: false });
}

export function hasAnyNonNegatedTerm(text: string, terms: string[]): boolean {
  return terms.some((term) => hasNonNegatedTerm(text, term));
}

export function nonNegatedHits(text: string, terms: string[]): string[] {
  return terms.filter((term) => hasNonNegatedTerm(text, term));
}

export function removeNegatedClauses(text: string): string {
  const value = String(text || '');

  return value
    .replace(/\b(no|not|none|without|never|neither|nor)\s+[^.;]*?\b(welding|torch cutting|cutting|hot work|silica|respirable crystalline silica|concrete|stone|sand|drilling|grinding)\b[^.;]*(?=[.;]|$)/gi, ' ')
    .replace(/\b(welding|torch cutting|cutting|hot work|silica|respirable crystalline silica|concrete|stone|sand|drilling|grinding)\b[^.;]*?\b(not present|not observed|not occurring|absent|ruled out)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

