/**
 * L3-2c -- IMPRESSION SCOPE. Decides whether a piece of evidence is ONLY the observer's impression.
 *
 * WHY THIS FILE EXISTS -- THE PATTERN, NOT THE SENTENCE. Three times across L3-2 and L3-2b a CLOSED
 * POSITIVE VOCABULARY used as an admission gate produced a false rejection:
 *
 *   * L3-2   control-in-place: `CONTROL_IN_PLACE_TOKENS` lacked isolation language, so a locked-out
 *            machine could not be CONTROLLED;
 *   * L3-2b  family relevance: the taxonomy's classifier terms were treated as a relevance oracle
 *            and deleted 8 correct candidates in 30 development scenarios;
 *   * L3-2b  factual condition: `FACTUAL_CONDITION_TOKENS` lacked `sheared`, so
 *            "the lower hinge pin is sheared off" read as pure impression and a correct
 *            high-consequence ACTIVE finding was deleted (`H-AM-05`).
 *
 * Each time the list was extended the defect moved rather than closed, because the defect is the
 * POLARITY, not the contents. A gate that asks "does a word I know appear?" fails open-ended reality:
 * English has an unbounded supply of ways to say a thing is broken, and every one that is missing
 * from the list deletes a real hazard. L3-2c therefore inverts the question. The gate now asks
 *
 *     is this evidence ONLY an unsupported, subjective impression?
 *
 * and not
 *
 *     does this evidence contain one of our known factual-condition words?
 *
 * WHY THE INVERSION IS SAFE IN THE DIRECTION THAT MATTERS. The vocabularies that remain here are on
 * the IMPRESSION side, and the failure mode of a short impression list is that a hedged sentence is
 * ADMITTED, not that a factual one is DELETED. A missing impression word costs precision, which is
 * measured against negative controls and is recoverable; a missing factual word costs a
 * high-consequence hazard, which is the gate the programme cannot fail. The asymmetry is the point.
 *
 * WHAT REPLACES THE VOCABULARY TEST -- SEMANTIC STRUCTURE. Evidence is split into predication
 * segments, and each segment is classified by the SHAPE of what it asserts:
 *
 *   IMPRESSION       its predicate is a perception or epistemic report about the observer
 *                    ("did not look right to me", "struck me as odd", "I was uneasy"), or an
 *                    epistemic hedge governs its entire predication ("may be cut").
 *   OBSERVER_ACTION  a first-person report of what the inspector did ("I walked underneath it").
 *                    It establishes no condition, but it is NOT an impression either -- classifying
 *                    it as one would delete "I saw the guard was missing".
 *   FACTUAL          a non-observer subject with an unhedged predication of any kind. NO condition
 *                    vocabulary is consulted: `sheared`, `parted`, `unpinned` and every word nobody
 *                    has thought of yet are factual for exactly the same structural reason.
 *   NEITHER          no predication at all (a bare noun phrase).
 *
 * Evidence is "only an impression" when at least one segment is an IMPRESSION and NO segment is
 * FACTUAL. An impression standing NEXT TO a fact does not cancel the fact -- that is the H-AM-05
 * rule, and it falls out of the structure rather than being written for that sentence.
 *
 * SEGMENTATION IS LOCAL TO THIS MODULE. It deliberately does not reuse `negation-scope.ts`'s
 * `CLAUSE_STARTERS`: negation scope and impression scope answer different questions and must be
 * able to change independently. `negation-scope.ts` is not imported here and is not modified by it.
 *
 * This module decides only whether an assertion was MADE. It never decides what a hazard is.
 */

/**
 * Verbs that report how something registered on the observer rather than what it is.
 * `saw`, `found`, `noticed`, `measured` are deliberately ABSENT: they are direct observation, and
 * treating them as impressions would delete correct findings.
 */
const PERCEPTION_PREDICATES = [
  'look right', 'looked right', 'looks right', 'look wrong', 'looked wrong', 'looks wrong',
  'look off', 'looked off', 'looks off', 'look odd', 'looked odd', 'looks odd',
  'look safe', 'looked safe', 'looks safe', 'look ok', 'looked ok', 'looks ok',
  'sit right', 'sat right', 'sits right', 'sit well', 'sat well', 'sits well',
  'seem', 'seems', 'seemed', 'seeming',
  'appear to', 'appears to', 'appeared to', 'appear to be', 'appears to be', 'appeared to be',
  'strike me', 'struck me', 'strikes me', 'struck him', 'struck her', 'struck them',
  'feel like', 'feels like', 'felt like', 'sound like', 'sounds like', 'sounded like',
  'gave me the impression', 'came across as',
];

/** Phrases anchoring an assertion to the observer's judgement rather than to the thing observed. */
const OBSERVER_ANCHORS = [
  'to me', 'with me', 'for me', 'in my opinion', 'in my view', 'my sense', 'my impression',
  'my gut', 'personally',
];

/**
 * First-person epistemic or affective states. These make a first-person segment an IMPRESSION;
 * without one, a first-person segment is only an OBSERVER_ACTION.
 */
const FIRST_PERSON_EPISTEMIC = [
  'think', 'believe', 'suspect', 'feel', 'felt', 'reckon', 'guess', 'wonder', 'assume',
  'uneasy', 'uncomfortable', 'concerned', 'worried', 'unsure', 'not sure', 'not certain',
  'could not tell', "couldn't tell", 'cannot tell', "can't tell", 'could not say', "couldn't say",
  'could not work out', "couldn't work out", 'do not know', "don't know", 'did not know',
];

/** Epistemic hedges. When one governs a predication, that predication asserts a suspicion. */
const HEDGES = [
  'may be', 'may have', 'might be', 'might have', 'maybe', 'could be', 'could have',
  'possibly', 'probably', 'perhaps', 'apparently', 'presumably', 'seemingly',
  'looks like it', 'i think', 'i believe', 'i suspect', 'not sure', 'unsure',
  'questionable', 'suspect ', 'appeared to be', 'appears to be', 'seemed to be', 'seems to be',
];

/**
 * Finite-verb markers -- the same syntactic family `negation-scope.ts` uses, duplicated rather than
 * imported so the two scopes stay independently changeable (see the header).
 */
const FINITE_VERBS = [
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'does', 'did', 'do',
  'will', 'would', 'can', 'could', 'should', 'must', 'may', 'might', 'shall', 'be', 'been',
  'remains', 'remained',
  'appears', 'appeared', 'shows', 'showed', 'sits', 'sat', 'stands', 'stood',
  'hangs', 'hung', 'runs', 'ran', 'keeps', 'kept', 'gets', 'got',
];

/** Words that start a new predication for the purpose of IMPRESSION scope only. */
const SEGMENT_STARTERS = [
  'and', 'but', 'yet', 'so', 'while', 'whilst', 'whereas', 'although', 'though', 'however',
  'because', 'since', 'after', 'before', 'when', 'where', 'meanwhile', 'separately', 'then',
];

const lower = (s: string) => s.toLowerCase();
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasPhrase(haystack: string, phrases: string[]): string | null {
  const h = lower(haystack);
  for (const p of phrases) {
    if (p.includes(' ')) { if (h.includes(p)) return p.trim(); continue; }
    if (new RegExp(`\\b${escape(p)}\\b`, 'i').test(h)) return p;
  }
  return null;
}

/** A participle long enough not to be a false positive on `used`, `set`, `bed`. */
function hasParticiple(segment: string): boolean {
  return /\b[a-z]{5,}(?:ing|ed|en)\b/i.test(segment);
}

function hasPredication(segment: string): boolean {
  const s = lower(segment);
  if (FINITE_VERBS.some(v => new RegExp(`\\b${escape(v)}\\b`).test(s))) return true;
  return hasParticiple(s);
}

/**
 * Auxiliaries and copulas. They carry tense but assert nothing on their own -- "is" in
 * "the drum IS possibly leaking" belongs to the hedged predicate, not to a separate claim.
 */
const AUXILIARIES = [
  'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being',
  'has', 'have', 'had', 'does', 'did', 'do',
  'will', 'would', 'can', 'could', 'should', 'must', 'may', 'might', 'shall',
];

/** A predication that stands on its own: a content verb or a participle, never a bare auxiliary. */
function hasContentPredication(segment: string): boolean {
  const s = lower(segment);
  const contentVerbs = FINITE_VERBS.filter(v => !AUXILIARIES.includes(v));
  if (contentVerbs.some(v => new RegExp(`\\b${escape(v)}\\b`).test(s))) return true;
  return hasParticiple(s);
}

/** True when the segment's subject is the observer. */
function isFirstPerson(segment: string): boolean {
  return /^\s*(?:and\s+|but\s+)?(?:i|we)\b/i.test(segment) || /\b(?:i|we)\s+(?:was|were|am|are|had|have|could|couldn't|cannot|can't|did|didn't|do|don't)\b/i.test(segment);
}

export type SegmentClass = 'IMPRESSION' | 'OBSERVER_ACTION' | 'FACTUAL' | 'NEITHER';

export interface ClassifiedSegment {
  text: string;
  klass: SegmentClass;
  /** The phrase that decided an IMPRESSION, for diagnostics and for the rejection detail. */
  marker: string | null;
}

/** Splits on sentence punctuation, commas, and the segment starters above. */
export function impressionSegments(text: string): string[] {
  const starterAlt = SEGMENT_STARTERS.map(escape).join('|');
  return text
    .split(new RegExp(`[.;:!?,]|\\s+(?:${starterAlt})\\s+`, 'i'))
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * The hedge must govern EVERY predication in the segment. "seemed loose and three balusters are
 * missing" is split before this point, so a hedge in one segment cannot reach into another; within
 * a segment, a hedge that sits before the only predication governs it.
 */
function hedgeGovernsSegment(segment: string): string | null {
  const hedge = hasPhrase(segment, HEDGES);
  if (!hedge) return null;
  const s = lower(segment);
  const at = s.indexOf(lower(hedge));
  // Anything predicated BEFORE the hedge is not governed by it -- but only a CONTENT predication
  // counts. `hasPredication` would see the copula in "the drum IS possibly leaking" and conclude the
  // segment had already asserted something, which let a hedged fact through as ACTIVE. The hedge
  // governs the copula's complement, not the copula.
  const before = s.slice(0, at);
  if (hasContentPredication(before)) return null;
  return hedge;
}

export function classifySegment(segment: string): ClassifiedSegment {
  const perception = hasPhrase(segment, PERCEPTION_PREDICATES);
  if (perception) return { text: segment, klass: 'IMPRESSION', marker: perception };

  const anchor = hasPhrase(segment, OBSERVER_ANCHORS);
  if (anchor) return { text: segment, klass: 'IMPRESSION', marker: anchor };

  if (isFirstPerson(segment)) {
    const epistemic = hasPhrase(segment, FIRST_PERSON_EPISTEMIC);
    // A first-person report of an ACTION establishes nothing, but it is not an impression either.
    return epistemic
      ? { text: segment, klass: 'IMPRESSION', marker: epistemic }
      : { text: segment, klass: 'OBSERVER_ACTION', marker: null };
  }

  // THE HEDGE IS TESTED BEFORE THE PREDICATION TEST, and the order is load-bearing. "may be cut"
  // has no finite verb this module recognises and no long participle, so a predication-first order
  // classified `H-AM-02` as NEITHER and let a hedged claim through as ACTIVE -- the precision pole
  // of the R1 repair, failing. A governing hedge is decisive evidence in its own right: whatever the
  // segment predicates, it predicates it as a suspicion.
  const hedge = hedgeGovernsSegment(segment);
  if (hedge) return { text: segment, klass: 'IMPRESSION', marker: hedge };

  if (!hasPredication(segment)) return { text: segment, klass: 'NEITHER', marker: null };

  // A non-observer subject with an unhedged predication. NO condition vocabulary is consulted --
  // this is the whole point of the L3-2c polarity change.
  return { text: segment, klass: 'FACTUAL', marker: null };
}

export interface ImpressionVerdict {
  /** True when the evidence carries an impression and NOTHING it says is a plain factual assertion. */
  onlyImpression: boolean;
  /** The impression phrase that decided it, when one did. */
  impressionMarker: string | null;
  /** The first factual segment found, which is why an impression was NOT the whole basis. */
  factualSegment: string | null;
  segments: ClassifiedSegment[];
}

/**
 * The gate. `onlyImpression` is true only when an impression is present AND no segment states a
 * plain fact. Absence of an impression marker admits: this module can only ever REFUSE a claim.
 */
export function assessImpression(text: string): ImpressionVerdict {
  const segments = impressionSegments(text).map(classifySegment);
  const impression = segments.find(s => s.klass === 'IMPRESSION') ?? null;
  const factual = segments.find(s => s.klass === 'FACTUAL') ?? null;
  return {
    onlyImpression: impression !== null && factual === null,
    impressionMarker: impression?.marker ?? null,
    factualSegment: factual?.text ?? null,
    segments,
  };
}
