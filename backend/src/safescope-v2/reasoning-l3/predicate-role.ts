/**
 * L3-2e -- SYNTACTIC ROLE. What is a matched token actually DOING in the sentence?
 *
 * WHY THIS FILE EXISTS. The programme has now recorded the same architectural mistake seven times,
 * and section 32.5 named it: a closed vocabulary consulted as though membership were meaning. L3-2c
 * fixed the POLARITY of one such gate (`impression-scope.ts`). L3-2d then measured the OTHER face of
 * the same mistake and reclassified it as `CAPABLE_OF_HIGH_CONSEQUENCE_LOSS`:
 *
 *     Main plant electrical panel is blocked by a pile of DISCARDED conveyor rollers and debris.
 *
 * `CORRECTION_TOKENS` contains `discarded`. Here it is an adjective on the debris and the asserted
 * predicate is "is blocked", but `checkContradiction` matched the word and deleted a correct,
 * evidence-bound, HIGH-CONSEQUENCE electrical finding (`D-FLD-175`). The same shape deleted a hazcom
 * finding through `hazard` inside "without HAZARD warning labels", where the head noun is *labels*
 * and their absence IS the hazard.
 *
 * L3-2e's root-cause proof found five such deletions AND two admissions running the other way, in a
 * different check: `checkStateSupported` accepted `CORRECTED` on a modifier, and `CONTROLLED` on a
 * NEGATED control-in-place phrase. **The two checks are not the same defect and are not repaired the
 * same way**, which is why this module answers a question rather than making a decision:
 *
 *     given this token occurrence, what role does it play?
 *
 * and each caller decides what that role licenses.
 *
 * THE ASYMMETRY THAT GOVERNS BOTH CALLERS. A vocabulary used to REJECT must be unambiguous, because
 * a false positive deletes a hazard. A vocabulary used to ADMIT a state the model already claimed may
 * be permissive, because a false positive only accepts a label the model chose and the evidence still
 * has to carry. That is the same asymmetry L3-2c established for the impression gate, applied here.
 *
 * BOUNDED BY DESIGN. No parser, no grammar, no dependency. The tests below are the same class of
 * hand-rolled, auditable string analysis as `negation-scope.ts` and `impression-scope.ts`, and like
 * those two this module decides only what a token IS -- never what a hazard is.
 */

import { closesNounPhrase, hasParticipleShape } from './word-classes';

/** Auxiliaries and copulas. A content word directly after one of these is being PREDICATED. */
const AUXILIARIES = [
  'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  'has', 'have', 'had', 'gets', 'get', 'got', 'gotten',
  'will', 'would', 'can', 'could', 'should', 'must', 'may', 'might', 'shall', 'do', 'does', 'did',
];

/** Adverbs that may sit between an auxiliary and its participle without breaking the predication. */
const INTERVENING_ADVERBS = [
  'not', 'never', 'already', 'still', 'now', 'then', 'also', 'just', 'recently', 'subsequently',
  'immediately', 'later', 'since', 'been', 'being', 'all', 'both', 'completely', 'partially',
  'properly', 'correctly', 'fully', 'only', 'ever',
];

/**
 * Function words that end a noun phrase. The NP head is the last content word before one of these.
 *
 * L3-2f, `DISC-05`. This WAS a hand-written list of forty words, and L3-2f measured three separate
 * failures of it -- `against`, `beyond` and `per` -- each of which resolved the head to the object of
 * the preposition instead: "no deficiencies AGAINST the storage standard" returned `standard`, and
 * the guard that should have refused a negated hazard never fired.
 *
 * Adding `against` would have been the fourth repair of this shape in five phases. The list is now
 * DERIVED from the closed function-word classes in `word-classes.ts`, which are complete rather than
 * partial: prepositions, coordinators, subordinators, determiners, pronouns and auxiliaries all
 * close a noun phrase, and English admits no new ones. The two entries below are the only ones that
 * are not function words -- pro-adverbs that terminate a phrase the same way.
 */
const NP_TERMINATOR_EXTRAS = ['anywhere', 'everywhere', 'nowhere', 'somewhere'];

function terminatesNounPhrase(word: string): boolean {
  return closesNounPhrase(word) || NP_TERMINATOR_EXTRAS.includes(word.toLowerCase());
}

/** Connectors that explicitly announce a contrasting fact after what precedes them. */
export const CONTRASTIVE_CONNECTORS = ['although', 'however', 'but', 'though', 'whereas', 'yet', 'while', 'except'];

export type TokenRole =
  /** The token is predicated of a subject: "the lead WAS DISCARDED". */
  | 'ASSERTED_PREDICATE'
  /** An asserted predicate inside a governing negation: "no lockout IS APPLIED". */
  | 'NEGATED_PREDICATE'
  /** The token modifies a following noun: "DISCARDED conveyor rollers", "HAZARD warning labels". */
  | 'ATTRIBUTIVE_MODIFIER'
  /** The token is the head noun of its own phrase: "no DAMAGE was found". */
  | 'NP_HEAD'
  /** Present, but in none of the above roles -- it asserts nothing about anything. */
  | 'OTHER';

const WORD = /[A-Za-z][A-Za-z'-]*/g;

interface Word { text: string; start: number; end: number }

function words(text: string): Word[] {
  const out: Word[] = [];
  let m: RegExpExecArray | null;
  WORD.lastIndex = 0;
  while ((m = WORD.exec(text)) !== null) out.push({ text: m[0].toLowerCase(), start: m.index, end: m.index + m[0].length });
  return out;
}

/** True when a punctuation mark separates two offsets -- a clause break the eye can see. */
function punctuationBetween(text: string, from: number, to: number): boolean {
  return /[.;:!?,]/.test(text.slice(from, to));
}

/**
 * The role of the token occupying [start, end) in `text`.
 *
 * `negationGoverns` is supplied by the caller rather than computed here, so that negation scope stays
 * owned by `negation-scope.ts` alone (L3-INV-11) and this module cannot quietly grow a second,
 * divergent opinion about it.
 */
export function tokenRole(text: string, start: number, end: number, negationGoverns = false): TokenRole {
  const ws = words(text);
  const firstIdx = ws.findIndex(w => w.start >= start && w.start < end);
  if (firstIdx < 0) return 'OTHER';
  const lastIdx = (() => {
    let i = firstIdx;
    while (i + 1 < ws.length && ws[i + 1].start < end) i += 1;
    return i;
  })();

  // ---- PREDICATE? Walk left over permitted adverbs looking for an auxiliary, and refuse to cross
  // punctuation, because "the guard, discarded last year, ..." is not a predication of the guard.
  for (let i = firstIdx - 1; i >= 0 && firstIdx - i <= 4; i -= 1) {
    const w = ws[i];
    if (punctuationBetween(text, w.end, ws[i + 1].start)) break;
    if (AUXILIARIES.includes(w.text)) return negationGoverns ? 'NEGATED_PREDICATE' : 'ASSERTED_PREDICATE';
    if (INTERVENING_ADVERBS.includes(w.text)) continue;
    break;
  }

  // ---- ATTRIBUTIVE? A content word immediately followed by another content word, with no
  // punctuation between them, is modifying it. "discarded conveyor rollers", "hazard warning labels".
  const next = ws[lastIdx + 1];
  if (next && !punctuationBetween(text, ws[lastIdx].end, next.start)
      && !terminatesNounPhrase(next.text)) {
    return 'ATTRIBUTIVE_MODIFIER';
  }

  // ---- NP HEAD? Nothing follows inside the phrase, so the token ends it.
  if (!next || terminatesNounPhrase(next.text)
      || punctuationBetween(text, ws[lastIdx].end, next.start)) {
    return 'NP_HEAD';
  }
  return 'OTHER';
}

/**
 * The HEAD of the noun phrase beginning at `from`. English noun phrases are head-final, so the head
 * is the last content word before a terminator.
 *
 * This is what separates "no HAZARD warning labels" -- head `labels`, a CONTROL whose absence IS the
 * hazard -- from "no DAMAGE was found", head `damage`, where the negation genuinely denies the hazard.
 */
export function nounPhraseHead(text: string, from: number): string | null {
  const rest = text.slice(from);
  const ws = words(rest);
  const phrase: string[] = [];
  for (let i = 0; i < ws.length; i += 1) {
    const w = ws[i];
    if (punctuationBetween(rest, 0, w.start) && phrase.length) break;
    if (terminatesNounPhrase(w.text)) break;
    phrase.push(w.text);
  }
  if (!phrase.length) return null;

  // L3-2f, `DISC-06`, fault (i) of two. A TRAILING PARTICIPLE POST-MODIFIES the phrase; it does not
  // head it. "no hearing protection ISSUED" is not about an issue -- the head is `protection`, a
  // CONTROL whose absence IS the hazard, and taking `issued` as the head deleted the programme's only
  // noise-exposure finding. Measured again on "no accessory guard FITTED" -> head `fitted`.
  //
  // English noun phrases are head-final over their PRE-modifiers, so the head is the last word that
  // is not a post-modifying participle. A phrase that is ONLY a participle keeps it, because then
  // there is nothing else it could be.
  let end = phrase.length;
  while (end > 1 && hasParticipleShape(phrase[end - 1])) end -= 1;
  return phrase[end - 1];
}

/** True when a contrastive connector appears at or after `from` -- "no damage ALTHOUGH the strap ...". */
export function hasContrastiveAfter(text: string, from: number): string | null {
  const rest = text.slice(from).toLowerCase();
  for (const c of CONTRASTIVE_CONNECTORS) {
    if (new RegExp(`\\b${c}\\b`).test(rest)) return c;
  }
  return null;
}

export interface TokenOccurrence { token: string; start: number; end: number; role: TokenRole }

const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Every occurrence of any token, with its role. Multi-word tokens are matched as phrases; single
 * words are matched whole-word so `applied` never matches inside `misapplied`.
 */
export function findTokenOccurrences(
  text: string, tokens: string[], governedBy: (start: number, end: number) => boolean = () => false,
): TokenOccurrence[] {
  const out: TokenOccurrence[] = [];
  const lower = text.toLowerCase();
  for (const raw of tokens) {
    const t = raw.trim().toLowerCase();
    if (!t) continue;
    const pattern = t.includes(' ')
      ? new RegExp(escape(t), 'g')
      : new RegExp(`\\b${escape(t)}\\b`, 'g');
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(lower)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      out.push({ token: t, start, end, role: tokenRole(text, start, end, governedBy(start, end)) });
      if (pattern.lastIndex === m.index) pattern.lastIndex += 1;
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

/** The only role that ASSERTS something. Used by the rejection path, which must be unambiguous. */
export function asserts(role: TokenRole): boolean {
  return role === 'ASSERTED_PREDICATE';
}
