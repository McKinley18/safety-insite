/**
 * §299 / HZ-4 -- WHAT A NEGATIVE PERSON QUANTIFIER ACTUALLY NEGATES.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. Pure text classification over the observation.
 *
 * ==================== THE DEFECT THIS EXISTS TO REPAIR ====================
 *
 * `shared-evidence-facts.ts` built `noExposure` as an alternation whose last two members were the
 * BARE words `nobody` and `no one`, anchored to nothing about exposure, and then wrote
 * `employeeExposure = false` at confidence 0.98, status `confirmed`. On the §298 observation --
 *
 *     "Nobody working up there had a harness on and I did not see any anchor points."
 *     "Nobody was injured and the forklift was not lifting at the time I was there."
 *
 * -- either sentence fired on its own. `e.noExposure` gates the exposure predicate of five
 * regulatory rules across OSHA general industry, OSHA construction and MSHA, so 29 CFR 1910.28 came
 * back CONTRADICTED at confidence 0.05 -- "Suppressed because submitted evidence contradicts:
 * employee access or exposure" -- on an observation whose first sentence PRESUPPOSES people working
 * at height. The hazard was still escalated Critical; it was its regulatory basis that was
 * suppressed. That is materially unsafe semantic behaviour, and it is a P0 for external Beta.
 *
 * ==================== THE SEMANTIC MODEL, STATED BEFORE THE CODE ====================
 *
 * "Nobody", "no one" and "no <person-noun>" are NEGATIVE QUANTIFIERS OVER PERSONS. They are not
 * assertions about exposure. What they negate is decided entirely by THE PREDICATE THEY SCOPE OVER,
 * and English offers at least four predicate families that a generic negation word cannot tell
 * apart:
 *
 *   PRESENCE_OR_EXPOSURE   "no employees were on the platform", "nobody was in the trench",
 *                          "no workers were exposed", "nobody entered the excavation"
 *                          -> people are genuinely absent. Exposure IS negated.
 *
 *   CONTROL_USE            "nobody was wearing a harness", "no one had fall protection on",
 *                          "nobody up there was tied off"
 *                          -> the CONTROL is negated, not the people. If anything these
 *                             presuppose people. Exposure is NOT negated.
 *
 *   OUTCOME                "nobody was injured", "no one was struck by the load"
 *                          -> the HARM is negated. An unharmed worker is an exposed worker.
 *                             Exposure is NOT negated.
 *
 *   UNRESOLVED             "nobody could tell me how long the chain had been down"
 *                          -> the clause says nothing about presence, control or harm.
 *                             Exposure is NOT negated and is NOT asserted either.
 *
 * ONLY PRESENCE_OR_EXPOSURE NEGATES EXPOSURE. The other three leave `employeeExposure` exactly as
 * it was, which for the §298 observation means UNRESOLVED rather than CONTRADICTED -- the applicable
 * standard becomes a candidate with a missing predicate instead of a suppressed one.
 *
 * ==================== WHAT THIS DELIBERATELY DOES NOT DO ====================
 *
 *   >>> NOTHING HERE ASSERTS EXPOSURE. Invariant: deterministic code may validate, project and
 *   >>> refuse safety semantics but must never invent them. "Nobody working up there had a harness
 *   >>> on" is, strictly, vacuously true if nobody is up there, so the presupposition that people
 *   >>> are present is a PRAGMATIC inference and not an entailment. Repairing a false
 *   >>> `employeeExposure = false` into a true `employeeExposure = true` would replace one invented
 *   >>> semantic with another. The repair REMOVES a claim; it does not add the opposite claim.
 *
 *   >>> NO PHRASE-SPECIFIC EXCEPTION. The §298 sentence is not special-cased and appears nowhere in
 *   >>> this file's matching logic. The repair is to the family.
 *
 *   >>> THE OBJECTIVE IS THE CORRECT DISTINCTION, NOT MAXIMUM CONSERVATISM. A genuine
 *   >>> "no employees were exposed" must still suppress. The regression family asserts both
 *   >>> directions, and a change that only ever stopped negating would fail it.
 *
 * ==================== HOW THE PREDICATE IS FOUND ====================
 *
 * A negative person quantifier may carry a RESTRICTIVE MODIFIER before its predicate:
 *
 *     Nobody [working up there] [had a harness on]
 *      NPQ    restrictor         predicate
 *
 * The restrictor describes WHICH people are quantified over; the predicate says what is denied of
 * them. Reading the restrictor as the predicate is precisely how "working up there" was read as an
 * exposure claim. So the scan skips forward to the first FINITE verb -- the restrictor is
 * participial or prepositional and contains none -- and classifies from there. Within the predicate
 * the EARLIEST family marker wins, so "nobody was on the platform wearing a harness" is PRESENCE
 * (the control noun trails the presence claim) while "nobody working up there had a harness on" is
 * CONTROL_USE (there is no presence claim in the predicate at all).
 */

/** What a negative person quantifier was found to be denying. */
export type PersonNegationSense =
  | 'PRESENCE_OR_EXPOSURE'
  | 'CONTROL_USE'
  | 'OUTCOME'
  | 'UNRESOLVED';

export interface PersonNegationClause {
  /** The quantifier as it appeared, e.g. "Nobody", "No employees". */
  readonly quantifier: string;
  /** The clause the quantifier scopes over, as it appeared in the observation. */
  readonly clause: string;
  /** The span classified as the predicate, after any restrictive modifier was skipped. */
  readonly predicate: string;
  readonly sense: PersonNegationSense;
  /** The marker that decided the sense, or null when the sense is UNRESOLVED. */
  readonly decidedBy: string | null;
}

export interface PersonNegationReading {
  /** True only when at least one clause genuinely denies presence or exposure. */
  readonly negatesEmployeeExposure: boolean;
  readonly clauses: readonly PersonNegationClause[];
}

// ================================================================ the vocabulary

/**
 * The quantifier heads. `no one` / `no-one` / `nobody` are bare; the rest name a person class.
 * `none of the ...` and `not a single ...` are the same quantifier with different morphology and
 * were invisible to the pattern this replaces.
 */
const PERSON_NOUNS = [
  'employee', 'worker', 'miner', 'laborer', 'labourer', 'person', 'people', 'crew member',
  'crew', 'operator', 'contractor', 'inspector', 'mechanic', 'stocker', 'roofer', 'staff',
  'personnel', 'individual',
];

const PERSON_NOUN_ALT = PERSON_NOUNS.map(n => n.replace(/ /g, '\\s+')).join('|');

/**
 * Matches a negative person quantifier and captures it. Deliberately NOT global-flagged at module
 * scope: a `lastIndex` shared across calls is a classic source of order-dependent misses.
 */
const QUANTIFIER_SOURCE =
  `\\b(nobody|no\\s+one|no-one`
  + `|no\\s+(?:${PERSON_NOUN_ALT})s?`
  + `|none\\s+of\\s+the\\s+(?:${PERSON_NOUN_ALT})s?`
  + `|not\\s+a\\s+single\\s+(?:${PERSON_NOUN_ALT})`
  + `)\\b`;

/**
 * FINITE VERBS THAT OPEN A PREDICATE. Anything before the first of these, inside the clause, is a
 * restrictive modifier describing which people are quantified over.
 *
 * The presence verbs appear here in their finite forms as well ("entered", "worked", "climbed"), so
 * "nobody entered the trench" opens its predicate at `entered` rather than running to the end of
 * the clause looking for a copula that is not there.
 */
const FINITE_VERB = new RegExp(
  '\\b('
  + 'was|were|is|are|had|has|have|been|did|does|do|could|can|would|will|should|may|might|must'
  + '|entered|enters|went|goes|worked|works|stood|stands|climbed|climbs|walked|walks|got|gets'
  + '|wore|wears|used|uses|took|takes|tied|ties|clipped|clips|remained|remains|appeared|appears'
  + '|seemed|seems|reported|reports|told|tells|knew|knows|said|says'
  + ')\\b', 'i');

/**
 * CONTROLS AND PPE. Negating the use of one of these says nothing about whether people were there.
 * `guard` is the bare noun deliberately -- "nobody had a guard in place" is control language --
 * and it cannot reach exposure because a CONTROL_USE clause never negates exposure.
 */
const CONTROL_MARKERS = [
  'harness', 'lanyard', 'fall protection', 'fall arrest', 'anchor point', 'anchorage',
  'tied off', 'tie-off', 'tie off', 'clipped in', 'hooked up', 'lifeline', 'life line',
  'guardrail', 'guard rail', 'handrail', 'hand rail', 'toe board', 'toeboard',
  'hard hat', 'hardhat', 'helmet', 'ppe', 'personal protective equipment',
  'respirator', 'respiratory protection', 'dust mask', 'safety glasses', 'eye protection',
  'face shield', 'hearing protection', 'ear plug', 'earplug', 'ear muff', 'earmuff',
  'gloves', 'safety glove', 'safety vest', 'high-visibility', 'high visibility', 'hi-vis',
  'life jacket', 'life vest', 'seat belt', 'seatbelt', 'fall restraint',
  'lockout', 'lock out', 'tagout', 'tag out', 'lock or tag', 'permit', 'barricade',
  'safety net', 'guard in place', 'machine guard', 'warning line', 'gas monitor',
  'atmospheric monitor', 'attendant', 'spotter', 'training', 'trained',
];

/**
 * OUTCOMES. Negating harm never negates exposure -- an unharmed worker standing three feet from an
 * open edge is the exposed worker the rule exists for.
 */
const OUTCOME_MARKERS = [
  'injured', 'injury', 'injuries', 'hurt', 'harmed', 'harm', 'struck', 'hit by', 'killed',
  'fatality', 'fatally', 'died', 'death', 'hospitalized', 'hospitalised', 'amputated',
  'amputation', 'lacerated', 'laceration', 'burned', 'burnt', 'burn', 'shocked',
  'electrocuted', 'fell', 'fallen', 'falls', 'caught in', 'crushed', 'pinned',
  'overcome', 'sickened', 'ill', 'incident', 'accident', 'near miss', 'near-miss',
  'complained', 'complaint', 'reported symptoms',
];

/**
 * PRESENCE AND EXPOSURE. These, and only these, make the quantifier an exposure negation.
 *
 * The prepositional members require a following noun phrase so that "nobody was in a hurry" does
 * not read as a location claim; the bare members are already unambiguous about presence.
 */
const PRESENCE_MARKERS = [
  'exposed', 'exposure', 'present', 'on site', 'onsite', 'on-site', 'in the area',
  'nearby', 'in the vicinity', 'within reach', 'in the fall zone', 'in the swing radius',
  'entered', 'enter', 'entering', 'inside', 'up there', 'down there',
  'working', 'work', 'worked', 'standing', 'stood', 'walking', 'walked', 'climbing',
  'climbed', 'occupied', 'occupying', 'stationed', 'positioned', 'located',
];

/**
 * Prepositional presence, e.g. "on the platform", "in the trench", "under the load". Requires a
 * determiner-or-noun tail so that "on time" and "in charge" are not read as locations.
 */
const PREPOSITIONAL_PRESENCE = new RegExp(
  '\\b(?:on|in|inside|under|underneath|beneath|below|near|beside|alongside|atop|around)\\s+'
  + '(?:the|that|this|a|an|any|their|his|her|its|our)\\s+'
  + '(?:\\w+\\s+){0,2}'
  + '(?:platform|deck|mezzanine|roof|scaffold|scaffolding|floor|level|surface|edge|opening|'
  + 'trench|excavation|pit|hole|ladder|lift|basket|bucket|catwalk|walkway|aisle|bay|'
  + 'area|zone|room|space|tank|vessel|silo|bin|hopper|shaft|tunnel|drift|face|bench|'
  + 'machine|press|conveyor|equipment|load|beam|panel|building|structure|site|job|yard)\\b',
  'i');

// ================================================================ the scan

/**
 * Where a marker list first matches inside a span, or null. Word-bounded, case-insensitive, with an
 * optional plural suffix -- the lists are written in the singular and a field note says
 * "were wearing respirators" as readily as "was wearing a respirator". A marker that is already
 * plural ("gloves", "injuries") is unaffected because the suffix is optional.
 */
function earliestMarker(span: string, markers: readonly string[]): { at: number; marker: string } | null {
  const lower = span.toLowerCase();
  let best: { at: number; marker: string } | null = null;
  for (const marker of markers) {
    const pattern = new RegExp(
      `\\b${marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?:e?s)?\\b`, 'i');
    const hit = pattern.exec(lower);
    if (hit === null) continue;
    if (best === null || hit.index < best.at) best = { at: hit.index, marker };
  }
  return best;
}

/** Where the prepositional-presence pattern first matches inside a span, or null. */
function earliestPrepositionalPresence(span: string): { at: number; marker: string } | null {
  const hit = PREPOSITIONAL_PRESENCE.exec(span);
  return hit === null ? null : { at: hit.index, marker: hit[0].toLowerCase() };
}

/**
 * The clause a quantifier scopes over: from the quantifier to the next clause boundary.
 *
 * Coordination and punctuation both end it, because "nobody was injured AND the forklift was not
 * lifting" contains two independent claims and only the first is quantified. Without the split, a
 * later clause's vocabulary would decide the sense of an earlier clause's quantifier.
 */
function clauseAfter(text: string, from: number): string {
  const rest = text.slice(from);
  const boundary = /[.;:!?]|,\s|\s+(?:and|but|or|so|because|although|though|while|however|then)\s+/i
    .exec(rest);
  return boundary === null ? rest : rest.slice(0, boundary.index);
}

/** Classify one quantified clause. Exported for the regression family. */
export function classifyPersonNegationClause(
  quantifier: string, clause: string,
): { sense: PersonNegationSense; predicate: string; decidedBy: string | null } {
  // The clause still begins with the quantifier; everything after it is restrictor + predicate.
  const afterQuantifier = clause.slice(quantifier.length);

  // Skip the restrictive modifier: the predicate opens at the first finite verb. When the clause
  // carries no finite verb at all ("no employees on the platform"), the whole remainder is read as
  // the predicate -- there is no restrictor/predicate ambiguity to resolve.
  const finite = FINITE_VERB.exec(afterQuantifier);
  const predicate = (finite === null ? afterQuantifier : afterQuantifier.slice(finite.index)).trim();

  const control = earliestMarker(predicate, CONTROL_MARKERS);
  const outcome = earliestMarker(predicate, OUTCOME_MARKERS);
  const presenceWord = earliestMarker(predicate, PRESENCE_MARKERS);
  const presencePrep = earliestPrepositionalPresence(predicate);
  const presence = presenceWord === null ? presencePrep
    : presencePrep === null ? presenceWord
      : (presenceWord.at <= presencePrep.at ? presenceWord : presencePrep);

  // EARLIEST MARKER WINS. "nobody was on the platform wearing a harness" is a presence denial whose
  // predicate happens to mention a control; "nobody working up there had a harness on" has no
  // presence claim in its predicate at all, because "working up there" is the restrictor.
  const candidates: Array<{ at: number; sense: PersonNegationSense; marker: string }> = [];
  if (presence !== null) candidates.push({ at: presence.at, sense: 'PRESENCE_OR_EXPOSURE', marker: presence.marker });
  if (control !== null) candidates.push({ at: control.at, sense: 'CONTROL_USE', marker: control.marker });
  if (outcome !== null) candidates.push({ at: outcome.at, sense: 'OUTCOME', marker: outcome.marker });

  if (candidates.length === 0) return { sense: 'UNRESOLVED', predicate, decidedBy: null };
  candidates.sort((a, b) => a.at - b.at);
  return { sense: candidates[0].sense, predicate, decidedBy: candidates[0].marker };
}

/**
 * Read every negative person quantifier in an observation and report what each one denies.
 *
 * `negatesEmployeeExposure` is true only when at least one clause is PRESENCE_OR_EXPOSURE. A text
 * that says both "nobody was injured" and "no employees were on the platform" still negates
 * exposure -- the genuine denial is present and the harm denial does not cancel it.
 */
export function readPersonNegation(text: string): PersonNegationReading {
  const source = String(text || '');
  const scanner = new RegExp(QUANTIFIER_SOURCE, 'gi');
  const clauses: PersonNegationClause[] = [];

  let hit: RegExpExecArray | null = scanner.exec(source);
  while (hit !== null) {
    const quantifier = hit[1];
    const clause = clauseAfter(source, hit.index);
    const { sense, predicate, decidedBy } = classifyPersonNegationClause(quantifier, clause);
    clauses.push({ quantifier, clause: clause.trim(), predicate, sense, decidedBy });
    // Resume after the clause, not after the quantifier: a quantifier inside a clause already read
    // belongs to that reading rather than opening a second one.
    scanner.lastIndex = Math.max(hit.index + quantifier.length, hit.index + clause.length);
    hit = scanner.exec(source);
  }

  return {
    negatesEmployeeExposure: clauses.some(c => c.sense === 'PRESENCE_OR_EXPOSURE'),
    clauses,
  };
}
