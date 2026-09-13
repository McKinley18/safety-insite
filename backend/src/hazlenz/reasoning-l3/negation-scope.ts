/**
 * L3-2b -- negation SCOPE, replacing L3-2's negation PROXIMITY.
 *
 * WHY THIS FILE EXISTS. L3-2's binder asked "does a negation token appear anywhere in the clause
 * containing this span", where a clause was anything between `.;:!?`. On a field note or a compound
 * sentence that is the whole note, so `no fire watch` was read as governing `cardboard and pallets
 * stacked under where the sparks were landing`, and three correct hazards were deleted across B08,
 * C11 and A10. Proximity is not scope.
 *
 * THE TRAP THAT MAKES THIS NON-TRIVIAL. The obvious repair -- treat a comma as a boundary -- breaks
 * the case the whole programme exists to prevent. RC-08's sentence is
 *
 *     "with no guardrail, safety net or personal fall arrest system in use"
 *
 * where the negation legitimately scopes ACROSS commas over a coordinated list. So a comma sometimes
 * ends negation scope and sometimes does not, and the two must be told apart.
 *
 * THE RULE. Scope runs RIGHTWARD from a negation token and ends at the first clause boundary:
 *
 *   * sentence punctuation `.;:!?`;
 *   * a subordinator or clause-coordinator (`while`, `and separately`, `but`, `although`, ...);
 *   * a comma whose following segment carries its own finite verb -- a new predication, not another
 *     list item. "safety net or personal fall arrest system in use" has no finite verb and stays in
 *     scope; "cardboard and pallets stacked under where the sparks WERE landing" has one and ends it.
 *
 * L3-2c ADDS THE SAME TEST AT A BARE CONJUNCTION, and the reason is `H-FLD-141`:
 *
 *     "...; no LOTO is applied AND the guard is missing."
 *
 * The comma rule above never ran, because there is no comma. `and` sits in `CLAUSE_STARTERS` only as
 * the two-word `and separately`, so `no` reached across the conjunction and deleted the guarding
 * hazard. The machinery already existed; it had one missing call site.
 *
 * THE BARE CONJUNCTION IS HELD TO A STRICTER TEST THAN THE COMMA, deliberately. A comma is already a
 * syntactic break, so a participle is enough evidence that a new predication began. A bare `and`
 * is not a break at all -- it is the ordinary way to continue a negated list -- so only a FINITE
 * VERB ends scope there:
 *
 *     "no guardrail and no toeboard"                 no finite verb  -> continuation, scope crosses
 *     "no guardrail and no personal fall arrest"      no finite verb  -> continuation, scope crosses
 *     "no LOTO is applied and the guard IS missing"   finite verb     -> new clause, scope ends
 *
 * Under-scoping is the direction this file already chose to fail in (see the note on
 * `negationScopes`), and the stricter test keeps the bare conjunction on that side.
 *
 * Scope never runs leftward: a span before the negation token is not governed by it.
 *
 * This module decides only what a negation GOVERNS. It never decides what a hazard is.
 */

import { isIrregularFinitePast, isPronoun, isContentWord } from './word-classes';

/** Tokens that invert or cancel the meaning of what they govern. */
export const NEGATION_TOKENS = [
  'no', 'not', "n't", 'never', 'without', 'none', 'nor', 'neither', 'absent', 'lacking',
];

/**
 * Words that begin a NEW predication. A negation does not reach across one.
 * `or` and `nor` are deliberately absent -- they continue a negated list.
 */
const CLAUSE_STARTERS = [
  'while', 'whilst', 'whereas', 'although', 'though', 'however', 'because', 'since',
  'after', 'before', 'when', 'meanwhile', 'separately', 'but', 'yet', 'so', 'then', 'and separately',
];

/** Finite-verb markers. Their presence in a comma segment means a new predication began. */
const FINITE_VERB_MARKERS = [
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'does', 'did', 'do',
  'will', 'would', 'can', 'could', 'should', 'must', 'remains', 'remained',
  'appears', 'appeared', 'shows', 'showed', 'sits', 'sat', 'stands', 'stood',
];

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function containsNegation(text: string): string | null {
  const lower = text.toLowerCase();
  for (const token of NEGATION_TOKENS) {
    if (token === "n't") { if (lower.includes("n't")) return token; continue; }
    if (new RegExp(`\\b${escape(token)}\\b`, 'i').test(lower)) return token;
  }
  return null;
}

/**
 * A participle carries a predicate even without a finite verb: "sparks REACHING the paint locker
 * door" is a new predication, while "safety net or personal fall arrest system in use" -- RC-08's
 * own continuation -- is a noun phrase and stays inside the negation.
 * Short words are excluded so `used`, `set`, `bed` and similar do not create phantom boundaries.
 */
function hasParticiple(segment: string): boolean {
  return /\b[a-z]{5,}(?:ing|ed)\b/i.test(segment);
}

/**
 * L3-2f, `L3_2E_SCOPE_CONTRADICTION`. A LEXICAL FINITE VERB in a subject position.
 *
 * THE DEFECT THIS REPLACES. `hasPredicate` recognised a predicate only through `FINITE_VERB_MARKERS`
 * -- 24 auxiliaries -- plus the participle regex above. `went`, `fell`, `broke`, `took` and every
 * other irregular finite past form were invisible, so:
 *
 *     "...at the manway, and the fitter WAS  inside the vessel"  -> scope ends at the comma
 *     "...at the manway, and the fitter WENT inside the vessel"  -> scope ran to the end
 *
 * and a correct high-consequence confined-space finding (`D-NG-04`) was deleted at the binder.
 *
 * WHY THE REPAIR IS NOT `FINITE_VERB_MARKERS.push('went')`. Lexical verbs are an OPEN class. The
 * bounded structural property is FINITENESS, and `word-classes.ts` decides it from regular
 * morphology plus the CLOSED inventory of irregular past forms -- exhaustive by construction, not a
 * list somebody has to remember to extend.
 *
 * TWO STRUCTURAL GUARDS, and both are load-bearing:
 *
 *  1. A SUBJECT MUST PRECEDE IT. The word before the verb must be a content word (the subject's head)
 *     or a pronoun -- not a determiner, preposition or coordinator, which would make the candidate a
 *     NOUN inside a phrase. "the fitter WENT" predicates; "a FELL of ground" and "and WENT home" do
 *     not. This is what keeps mining and rigging nouns out.
 *  2. IT MUST NOT BE ATTRIBUTIVE. A content word directly following it means it is modifying that
 *     word, not predicating: "a BROKEN retaining clip" is a noun phrase.
 *
 * DIRECTION OF FAILURE, UNCHANGED. This test can only ADD clause boundaries, never remove them, so
 * it can only make scope SHORTER. Under-scoping produces a missed advisory; over-scoping deletes a
 * correct hazard. The module's chosen failure direction is preserved exactly.
 */
function hasLexicalFinitePredicate(segment: string): boolean {
  const words = [...segment.matchAll(/[A-Za-z][A-Za-z'-]*/g)];
  for (let i = 0; i < words.length; i += 1) {
    const w = words[i][0].toLowerCase();
    if (!isIrregularFinitePast(w)) continue;

    // (1) a subject must precede it, and it may not be the first word of the segment.
    const prev = i > 0 ? words[i - 1][0].toLowerCase() : null;
    if (!prev) continue;
    if (!(isPronoun(prev) || isContentWord(prev))) continue;

    // (2) it must not be modifying the word that follows it.
    const next = i + 1 < words.length ? words[i + 1][0].toLowerCase() : null;
    if (next && isContentWord(next) && !isPronoun(next)) continue;

    return true;
  }
  return false;
}

function hasPredicate(segment: string): boolean {
  const lower = segment.toLowerCase();
  if (FINITE_VERB_MARKERS.some(v => new RegExp(`\\b${escape(v)}\\b`).test(lower))) return true;
  if (hasParticiple(lower)) return true;
  return hasLexicalFinitePredicate(segment);
}

/**
 * L3-2c. Whether a bare conjunction ends negation scope. Finite verb ONLY -- see the header for why
 * this is stricter than the comma test in `hasPredicate`.
 */
function hasFiniteVerb(segment: string): boolean {
  const lower = segment.toLowerCase();
  if (FINITE_VERB_MARKERS.some(v => new RegExp(`\\b${escape(v)}\\b`).test(lower))) return true;
  // L3-2f. A lexical finite verb IS a finite verb. The bare-conjunction test stays stricter than the
  // comma test by continuing to exclude the PARTICIPLE path, not by ignoring half the finite verbs:
  // "...no LOTO is applied and the setter TOOK the interlock key out" begins a new clause exactly as
  // "and the guard IS missing" does.
  return hasLexicalFinitePredicate(segment);
}

/** Conjunctions that join without any punctuation. `or`/`nor` are absent: they continue a list. */
const BARE_CONJUNCTIONS = ['and', 'plus'];

function startsNewClause(segment: string): boolean {
  const lower = segment.trim().toLowerCase();
  return CLAUSE_STARTERS.some(s => lower.startsWith(s + ' ') || lower === s);
}

export interface NegationScope {
  /** Offset of the negation token itself. */
  tokenStart: number;
  token: string;
  /** Half-open [from, to) that the token governs. */
  from: number;
  to: number;
}

/**
 * Every negation in `text`, with the half-open range each one governs.
 *
 * Deliberately conservative in one direction: when it cannot tell whether a segment continues a
 * negated list, it ENDS the scope. Under-scoping produces a missed advisory; over-scoping deletes a
 * correct hazard, which is what L3-2 measured.
 */
export function negationScopes(text: string): NegationScope[] {
  const scopes: NegationScope[] = [];
  // LONGEST FIRST. Regex alternation is first-match, so an unsorted list lets `no` match the first
  // two characters of `not`, `none`, `nor` and `neither`; the whole-word guard then rejects it and
  // the real negation is never seen. That is negation blindness reintroduced by a regex detail.
  const ordered = [...NEGATION_TOKENS].sort((a, b) => b.length - a.length);
  const tokenPattern = new RegExp(`(?:${ordered.map(escape).join('|')})`, 'gi');
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    const tokenStart = match.index;
    const token = match[0];
    // Whole-word only, except the "n't" clitic which is a suffix by nature.
    if (token.toLowerCase() !== "n't") {
      const before = tokenStart > 0 ? text[tokenStart - 1] : ' ';
      const after = text[tokenStart + token.length] ?? ' ';
      if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) continue;
    }

    let cursor = tokenStart + token.length;
    let to = text.length;

    while (cursor < text.length) {
      const nextBoundary = text.slice(cursor).search(/[.;:!?,]/);
      if (nextBoundary < 0) break;
      const boundaryAt = cursor + nextBoundary;
      const ch = text[boundaryAt];

      if (ch !== ',') { to = boundaryAt; break; }

      // A comma. Look at what follows: another list item, or a new predication?
      const rest = text.slice(boundaryAt + 1);
      const nextSegmentEnd = rest.search(/[.;:!?,]/);
      const segment = nextSegmentEnd < 0 ? rest : rest.slice(0, nextSegmentEnd);
      if (startsNewClause(segment) || hasPredicate(segment)) { to = boundaryAt; break; }
      cursor = boundaryAt + 1;
    }

    // A clause starter with no comma in front of it also ends scope (B08's bare "while").
    const withinScope = text.slice(tokenStart, to);
    for (const starter of CLAUSE_STARTERS) {
      const at = withinScope.toLowerCase().search(new RegExp(`\\b${escape(starter)}\\b`));
      if (at > 0) to = Math.min(to, tokenStart + at);
    }

    // L3-2c, H-FLD-141. A bare conjunction ends scope only when what follows carries its own finite
    // verb. Each conjunction is judged against the text up to the NEXT boundary, so a long negated
    // list is not ended by a finite verb that belongs three items later.
    const scoped = text.slice(tokenStart, to);
    for (const conj of BARE_CONJUNCTIONS) {
      const pattern = new RegExp(`\\b${escape(conj)}\\b`, 'gi');
      let cm: RegExpExecArray | null;
      while ((cm = pattern.exec(scoped)) !== null) {
        const at = cm.index;
        if (at <= 0) continue;
        const after = scoped.slice(at + cm[0].length);
        const stop = after.search(new RegExp(`[.;:!?,]|\\b(?:${BARE_CONJUNCTIONS.map(escape).join('|')})\\b`, 'i'));
        const following = stop < 0 ? after : after.slice(0, stop);
        if (hasFiniteVerb(following)) { to = Math.min(to, tokenStart + at); break; }
      }
    }

    scopes.push({ tokenStart, token, from: tokenStart, to });
  }
  return scopes;
}

/** The negation governing [start, end), if any. Scope is rightward only. */
export function governingNegation(text: string, start: number, end: number): NegationScope | null {
  for (const scope of negationScopes(text)) {
    if (start >= scope.from && start < scope.to) return scope;
    // A span that begins before the token but swallows it is not "governed" -- it CONTAINS it.
    if (start <= scope.tokenStart && end >= scope.to) return null;
  }
  return null;
}
