/**
 * L3-2 / L3-2b -- the SEMANTIC half of evidence binding (L3-INV-11), which L3-1 deferred.
 *
 * WHAT THIS IS, STATED NARROWLY. `deterministic-safety-validator.ts` proves a span is REAL: it
 * resolves, it matches byte for byte, and an immediately-preceding negation was not clipped. This
 * module answers the different question the entry contract assigns to L3-2: is the real span the
 * RIGHT evidence for the claim? It does NOT prove entailment, and nothing here should be described
 * as if it did -- it tests falsifiable consequences of a claim against the cited text.
 *
 * L3-2b CHANGED TWO THINGS, both because L3-2 measured them failing.
 *
 * 1. SEVERITY. L3-2 had one outcome -- an issue deleted its candidate. That conflated *non-minimal*
 *    evidence with *non-supporting* evidence, and on B08 it deleted three correct hazards because
 *    the model quoted whole sentences. Issues are now FATAL or ADVISORY. Only FATAL removes a
 *    candidate. Quoting more text than strictly necessary is an advisory; quoting text that does not
 *    support the claim is fatal.
 *
 * 2. SCOPE, NOT PROXIMITY. Negation governance moved to `negation-scope.ts`. The old rule asked
 *    whether a negation appeared anywhere between two full stops, which on a field note is the whole
 *    note -- see `ROOT_CAUSE.md`.
 *
 * L3-2c CHANGED ONE MORE, for the same reason both of those changed: it was measured failing.
 *
 * 3. GATE POLARITY. The impression check required a word from a closed FACTUAL vocabulary before it
 *    would let an ACTIVE claim stand. That deleted "the lower hinge pin is sheared off" -- the third
 *    false rejection in two phases caused by a closed positive list used as an admission gate. The
 *    test now asks whether the evidence is ONLY an impression, decided from predication structure in
 *    `impression-scope.ts`, and consults no condition vocabulary at all. A candidate rejected by
 *    that gate is DEMOTED to INSUFFICIENT_EVIDENCE carrying a clarification rather than deleted,
 *    because the binder already knows exactly what it could not establish.
 *
 * L3-2d CHANGED ONE MORE, and again because it was measured failing.
 *
 * 4. CLARIFICATION SCOPE. L3-2c's prompt bought clarification recall with precision: four questions
 *    were attached to candidates whose condition state was already decided. `L3-INV-06` is a
 *    DECISION-BOUNDARY invariant, and six of the eight condition states ARE the decision, so such a
 *    question is not a clarification under the contract at all. It is now dropped deterministically
 *    -- the hazard untouched, the removal recorded -- rather than left to prose.
 *
 * The relevance test uses the engine's own taxonomy signal terms. That is a KEEP_AS_GUARDRAIL use
 * (blueprint section 29.7): the vocabulary can only REFUSE a claim here, never create, name or rate
 * a hazard.
 *
 * RUN ORDER: provider -> offset binding -> deterministic validator -> THIS -> outcome.
 */
import { HAZARD_TAXONOMY } from '../taxonomy/hazard-taxonomy';
import { L3_UNDECIDED_STATES } from './reasoning-contract.types';
import type { EvidenceReference, ReasoningInput } from './reasoning-contract.types';
import type { ValidatedHazard, ValidatedReasoning } from './validated-reasoning.types';
import { containsNegation, governingNegation, negationScopes } from './negation-scope';
import { assessImpression } from './impression-scope';
import {
  findTokenOccurrences, nounPhraseHead, hasContrastiveAfter, asserts,
  type TokenOccurrence,
} from './predicate-role';
import { detectObservationGaps, observationAvailabilityOf, type ObservationAvailability } from './observation-availability';
import { controlAdequacyOf, type ControlAdequacyRecord } from './control-adequacy';
import {
  findWholeWordMatch, couldBeFiniteLexicalVerb, isPreposition, isCoordinator, isSubordinator,
  isDeterminer, isContentWord,
} from './word-classes';

export const L3_SEMANTIC_BINDER_VERSION = 'hazlenz.l3.semantic-binder.v6' as const;

export const L3_SEMANTIC_REASONS = [
  /** FATAL. A negation governs the cited span and the candidate neither quoted nor discussed it. */
  'SEMANTIC_NEGATION_UNADDRESSED',
  /** FATAL. The condition state makes a claim the cited text does not carry. */
  'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE',
  /** FATAL. The evidence describes a planned or recommended action, not a present condition. */
  'SEMANTIC_ACTION_NOT_CONDITION_EVIDENCE',
  /**
   * ADVISORY since L3-2b. Nothing in the cited evidence carries vocabulary for the claimed family.
   *
   * This was FATAL for one development run and deleted 8 candidates in 30 scenarios, including a
   * high-consequence one -- the L3-2 defect recurring under a new rule. The cause is that the
   * taxonomy's term lists are a CLASSIFIER vocabulary, not a relevance oracle: they are mostly
   * multi-word phrases ("blocked walkway", "oil spill") that real observations rarely contain
   * verbatim, so absence of a match says more about the list than about the evidence.
   *
   * The deeper reason it must not be fatal: a wrong family LABEL on a real hazard is a quality
   * defect, measured by family accuracy. Deleting the hazard because its label is wrong turns a
   * labelling error into a missed hazard, which is strictly more dangerous.
   */
  'SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY',
  /** FATAL. The span carries language contradicting the claimed state, and the candidate ignores it. */
  'SEMANTIC_EVIDENCE_CONTRADICTS_STATE',
  /** FATAL. ACTIVE resting on a subjective impression with no factual condition detail. */
  'SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE',
  /** FATAL. Two candidates share family and evidence with no distinguishing rationale. */
  'SEMANTIC_CANDIDATES_NOT_INDEPENDENT',
  /** FATAL. The family appears to come from an advisory hint rather than from the cited text. */
  'SEMANTIC_ADVISORY_ECHO',
  /** ADVISORY. Supporting, but broader than the claim needs. Never fatal (L3-2b, B08). */
  'SEMANTIC_EVIDENCE_NOT_SELECTIVE',
  /** ADVISORY. No family vocabulary found, but nothing positively contradicts the family either. */
  'SEMANTIC_FAMILY_SUPPORT_NOT_EVIDENT',
  /** ADVISORY. Decision-critical ambiguity was detected and no clarification was supplied. */
  'SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED',
  /**
   * ADVISORY (L3-2c). A clarification was attached to a candidate whose condition state is already
   * decided. The question is dropped; the hazard is untouched. See `stripClarification` below.
   */
  'SEMANTIC_CLARIFICATION_ON_DECIDED_STATE',
  /**
   * ADVISORY (L3-2e). The observation explicitly records something the inspector could not see.
   * RECORDED ONLY. It never changes a condition state and never removes a candidate -- see the
   * header of `observation-availability.ts` for why that restraint is deliberate.
   */
  'SEMANTIC_OBSERVATION_GAP_RECORDED',
  /**
   * ADVISORY (L3-2f). What KIND of control language the cited evidence carries -- CONTROL_EFFECTIVE,
   * CONTROL_MENTION, CONTROL_ABSENT. RECORDED ONLY. It never changes a condition state and never
   * removes a candidate; `L3-INV-12` and the header of `control-adequacy.ts` say why.
   */
  'SEMANTIC_CONTROL_ADEQUACY_RECORDED',
] as const;
export type L3SemanticReason = (typeof L3_SEMANTIC_REASONS)[number];

export type L3SemanticSeverity = 'FATAL' | 'ADVISORY';

/** Advisory codes are recorded and reported; they never remove a candidate. */
export const L3_ADVISORY_REASONS: readonly L3SemanticReason[] = [
  'SEMANTIC_EVIDENCE_NOT_SELECTIVE',
  'SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY',
  'SEMANTIC_FAMILY_SUPPORT_NOT_EVIDENT',
  'SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED',
  'SEMANTIC_CLARIFICATION_ON_DECIDED_STATE',
  'SEMANTIC_OBSERVATION_GAP_RECORDED',
  'SEMANTIC_CONTROL_ADEQUACY_RECORDED',
];

export function severityOf(code: L3SemanticReason): L3SemanticSeverity {
  return L3_ADVISORY_REASONS.includes(code) ? 'ADVISORY' : 'FATAL';
}

export interface L3SemanticIssue {
  code: L3SemanticReason;
  severity: L3SemanticSeverity;
  candidateKey: string;
  detail: string;
}

export interface L3SemanticBindingOutcome {
  boundHazards: ValidatedHazard[];
  /**
   * L3-2f. Per-candidate CONTROL_MENTION / CONTROL_EFFECTIVE / CONTROL_ABSENT classification of the
   * cited evidence. RECORDED ONLY -- it decides nothing. See `control-adequacy.ts`.
   */
  controlAdequacy: Array<{ candidateKey: string; adequacy: ControlAdequacyRecord['adequacy']; matchedTerm: string | null; detail: string }>;
  /** Candidates removed by a FATAL issue. Never silently dropped. */
  rejected: Array<{ candidateKey: string; codes: L3SemanticReason[] }>;
  issues: L3SemanticIssue[];
  /** Candidates the binder believes needed a clarification that the provider did not supply. */
  clarificationExpected: string[];
  /**
   * L3-2c. Candidates the impression gate refused as ACTIVE but did NOT delete: they are kept at
   * INSUFFICIENT_EVIDENCE so the question the binder already knows is owed has something to travel
   * on. Recorded separately from `rejected` because the two mean different things to a reader.
   */
  demoted: Array<{ candidateKey: string; from: string; to: string; code: L3SemanticReason; clarificationSynthesized: boolean }>;
  /**
   * L3-2d. Candidates whose clarification was dropped because their condition state was already
   * decided. The hazard itself is never touched. Recorded so a dropped question is never silent.
   */
  clarificationsDropped: Array<{ candidateKey: string; conditionState: string; question: string }>;
  /**
   * L3-2e. What the inspector explicitly could not see, recorded per source. Advisory evidence for
   * the observation-availability report; it changes no state and removes no candidate.
   */
  observationAvailability: Array<{ sourceId: string; availability: ObservationAvailability; unobservedFacts: string[] }>;
  binderVersion: typeof L3_SEMANTIC_BINDER_VERSION;
}

// ---------------------------------------------------------------- guardrail vocabularies

// L3-2b widened this too. `replaced` did not match "issued a REPLACEMENT", and scrapping equipment
// outright is a correction as surely as repairing it is.
const CORRECTION_TOKENS = [
  'corrected', 'repaired', 'replaced', 'replacement', 'fixed', 'reset', 'restored', 'remediated',
  'resolved', 'reinstalled', 'closed out', 'addressed', 'applied', 'destroyed', 'scrapped',
  'discarded', 'rectified', 'made good', 'new one',
];

const REMOVAL_TOKENS = ['removed from service', 'out of service', 'tagged out', 'taken out', 'decommissioned', 'red-tagged', 'red tagged', 'withdrawn', 'removed'];

/**
 * L3-2e. The subset the REJECTION path may use. Bare `removed` is absent, and deliberately.
 *
 * "The belt guard has been removed" and "the conveyor was removed from service" are both asserted
 * predicates -- role analysis cannot separate them, because the difference is WHAT was removed: a
 * control, which creates the hazard, or the equipment, which withdraws it. Bare `removed` is
 * genuinely ambiguous, and a token used to DELETE a finding must not be. The multi-word forms name
 * service withdrawal explicitly and stay.
 *
 * `REMOVAL_TOKENS` in full is still used by `checkStateSupported`, where the model has already
 * claimed REMOVED_FROM_SERVICE and the vocabulary only has to corroborate a claim, not destroy one.
 */
const UNAMBIGUOUS_SERVICE_WITHDRAWAL = [
  'removed from service', 'out of service', 'tagged out', 'decommissioned', 'red-tagged', 'red tagged', 'withdrawn',
];

/**
 * L3-2g. The correction subset the REJECTION path may use -- the exact counterpart of
 * `UNAMBIGUOUS_SERVICE_WITHDRAWAL`, produced by the same argument and the same measurement.
 *
 * §35.1's governing asymmetry: A VOCABULARY USED TO REJECT MUST BE UNAMBIGUOUS; A VOCABULARY USED TO
 * ADMIT MAY BE PERMISSIVE. `checkContradiction` DELETES a finding, so every token it consults must
 * mean "the hazard itself was put right" and nothing else. `checkStateSupported` only corroborates a
 * CORRECTED state the model already chose, so it keeps `CORRECTION_TOKENS` in full.
 *
 * THE LINE IS DRAWN AT SENSE, NOT AT OBJECT -- and that distinction was forced by measurement, not
 * chosen in advance. A first pass at this repair removed every token whose non-correction reading
 * had been demonstrated, and it broke two prior-phase gates: `test:l32b-binder-precision`'s
 * "unhandled contradiction is fatal" (the guard itself was REPLACED) and
 * `test:l32e-syntactic-role`'s "PAIR/unnegated correction" (a full lockout was APPLIED). Both of
 * those fixtures are RIGHT, and a repair that breaks them is over-broad. The audit had conflated two
 * different kinds of ambiguity:
 *
 *   DIFFERENT SENSE -- the token means something else entirely. Role analysis cannot help, the
 *   distractor sits in the same sentence as the hazard, and no rationale wording reliably rescues
 *   it. THESE LEAVE THE REJECTION HALF:
 *
 *     `fixed`      "a DANGER sign is fixed to the handrail post"   attached, not repaired
 *     `destroyed`  "the insulation has been destroyed by heat"     this IS the hazard, not disposal
 *     `reset`      "the breaker was reset twice this shift"        re-armed onto a live fault
 *     `addressed`  "addressed at the safety meeting"               discussed, not repaired
 *     `closed out` "the hot work permit was closed out"            a record, not a repair
 *     `resolved`   "the maintenance ticket was resolved"           a record, not a repair
 *     `restored`   "power was restored after the outage"           supply, not the defect
 *
 *   SAME SENSE, DIFFERENT OBJECT -- the token still means "put right"; only what it attached to
 *   differs. THESE STAY, because they demonstrably catch real corrections, and because their
 *   residual exposure is genuinely narrower: it needs BOTH an unusually broad cited span (the model
 *   is instructed to quote the shortest span that carries the meaning) AND a rationale that does not
 *   already say `still` / `remains` / `not yet`, which `checkContradiction` returns early on:
 *
 *     `replaced` `reinstalled` `applied` `replacement` `new one` `corrected` `repaired` `rectified`
 *     `remediated` `made good` `scrapped` `discarded`
 *
 * `destroyed` is the sharpest of the seven after `fixed`: in the disposal sense it withdraws
 * equipment, and in the damage sense it names the defect itself, so as a rejection token it deletes
 * the very findings it is most likely to appear in.
 *
 * `discarded` STAYS, and that is not an inconsistency with `DISC-03`. Its modifier reading ("a pile
 * of discarded conveyor rollers") is refused by ROLE analysis, which is where that defect was
 * correctly closed at L3-2e; as an asserted predicate it is unambiguously disposal. The paired
 * fixture is kept.
 *
 * KNOWN RESIDUAL, RECORDED RATHER THAN CLOSED: the same-sense-different-object cases can still
 * delete a correct ACTIVE under a broad quote. That is `DISC-02`-shaped -- a precision/recall trade
 * with no measured loss on any sealed set -- and closing it needs the OBJECT of the correction
 * resolved, which is a semantic question this deterministic check has no business answering.
 *
 * FAILURE DIRECTION, PRESERVED EXACTLY. A token removed from this set can only make the binder
 * reject LESS. Under-rejecting lets a provider error stand and is measurable against negative
 * controls; over-rejecting deletes a correct hazard and is not recoverable. That is the same trade
 * `negation-scope.ts` states for scope length, and the same one L3-2e made for bare `removed`.
 */
const UNAMBIGUOUS_CORRECTION = CORRECTION_TOKENS.filter(t => ![
  'fixed', 'destroyed', 'reset', 'addressed', 'closed out', 'resolved', 'restored',
].includes(t));

/**
 * L3-2b widened this. D02 refused CONTROLLED on "shut down … locked out … voltage verified absent",
 * because isolation language lived only in the removal list. Energy isolation IS a control in place;
 * that is the point of lockout/tagout, and the original partition was conceptually wrong.
 */
const CONTROL_IN_PLACE_TOKENS = [
  'in place', 'installed', 'interlocked', 'guarded', 'barricaded', 'ventilated', 'grounded',
  'secured', 'anchored', 'tested', 'functioning', 'operational', 'effective', 'wearing', 'in use',
  'locked out', 'lockout', 'lock', 'shut down', 'shutdown', 'de-energized', 'deenergized',
  'isolated', 'isolation', 'verified', 'zero energy', 'blanked', 'blinded', 'bled down', 'tagged',
];

const HYPOTHETICAL_TOKENS = ['if ', 'were ', 'would', 'could', 'might', 'may ', 'should the', 'in the event', 'potential', 'suppose'];

const PLANNED_ACTION_TOKENS = ['will ', 'plan to', 'planned', 'scheduled', 'schedule', 'intend', 'recommend', 'propose', 'next quarter', 'next week', 'next month', 'upcoming', 'to be ', 'going to'];

const PRESENT_CONDITION_TOKENS = ['is ', 'was ', 'are ', 'were ', 'has ', 'have ', 'observed', 'found', 'noted', 'currently', 'remains'];

/**
 * REMOVED AT L3-2c. This was the ENTRY condition of the impression gate: the check only ran when one
 * of these phrases appeared in the cited evidence. That made it a closed vocabulary in the UNSAFE
 * direction as well as the safe one -- "struck me as odd" was not on it, so `H-AM-01` was admitted
 * as ACTIVE with no gate run at all. `impression-scope.ts` decides entry structurally instead, and
 * both the false rejection and the false admission close with the same change.
 */

/**
 * RETIRED AT L3-2c -- KEPT AS DIAGNOSTIC INPUT ONLY, NEVER AS AN ADMISSION GATE.
 *
 * This list used to decide whether an observation stated a FACT: `checkSubjectiveImpression` deleted
 * an ACTIVE claim unless one of these words appeared unhedged in the cited evidence. `sheared` is
 * not here, so "the lower hinge pin is sheared off" was read as pure impression and a correct
 * high-consequence finding was deleted (`H-AM-05`, L3-2b). That was the THIRD false rejection in two
 * phases caused by a closed positive vocabulary used as a gate, so L3-2c changed the polarity of the
 * test rather than adding a thirty-first word -- see `impression-scope.ts`.
 *
 * It survives only as confidence support in the rejection detail: saying which concrete word was
 * absent helps a reader, and can never again cause a rejection on its own.
 */
const FACTUAL_CONDITION_TOKENS = [
  'missing', 'broken', 'cracked', 'exposed', 'damaged', 'unguarded', 'loose', 'frayed',
  'corroded', 'bent', 'blocked', 'energized', 'leaking', 'spilled', 'torn', 'severed',
  'unlabeled', 'unlabelled', 'open ', 'removed', 'disconnected', 'bypassed', 'defeated',
  'worn through', 'no guard', 'without', 'inches', 'feet', 'foot', 'inch', 'psi', 'volts',
];

const lower = (s: string) => s.toLowerCase();
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function hasAny(haystack: string, tokens: string[]): string | null {
  const h = lower(haystack);
  for (const t of tokens) {
    if (t.includes(' ')) { if (h.includes(t)) return t.trim(); continue; }
    if (new RegExp(`\\b${escape(t)}\\b`, 'i').test(h)) return t;
  }
  return null;
}

/** Sentence-level scope, used where a claim is checked against its immediate surroundings. */
function sentenceAround(text: string, start: number, end: number): string {
  const isBoundary = (ch: string) => '.;:!?'.includes(ch);
  let from = start;
  while (from > 0 && !isBoundary(text[from - 1])) from -= 1;
  let to = end;
  while (to < text.length && !isBoundary(text[to])) to += 1;
  return text.slice(from, to);
}

/**
 * A tighter scope than `sentenceAround`, used ONLY for state support. A correction verb belonging to
 * a neighbouring coordinated clause must not license a CORRECTED claim about this span -- in
 * "the tongue guard is missing, and the extension cord was replaced", "replaced" says nothing about
 * the guard. List commas are left alone; only a comma plus a coordinator splits.
 */
function coordinatedClauseAround(text: string, start: number, end: number): string {
  const clause = sentenceAround(text, start, end);
  const clauseStart = text.indexOf(clause);
  const offsetInClause = clauseStart < 0 ? 0 : start - clauseStart;
  const boundary = /,\s+(?:and|but|while|although|though|however|whereas|then)\s+/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;
  const segments: Array<{ from: number; to: number }> = [];
  while ((match = boundary.exec(clause)) !== null) {
    segments.push({ from: cursor, to: match.index });
    cursor = match.index + match[0].length;
  }
  segments.push({ from: cursor, to: clause.length });
  const spanLength = end - start;
  const hit = segments.find(s => offsetInClause >= s.from && offsetInClause + spanLength <= s.to);
  return hit ? clause.slice(hit.from, hit.to) : clause;
}

function sourceTextFor(ref: EvidenceReference, input: ReasoningInput): string | null {
  return input.authoritativeSources.find(s => s.sourceId === ref.sourceId)?.text ?? null;
}

const spanKey = (e: EvidenceReference) => `${e.sourceId}:${e.startOffset}:${e.endOffset}`;
const citedText = (h: ValidatedHazard) => h.evidence.map(e => e.quotedText).join(' • ');

/**
 * Strong AND moderate terms, used for the comparative contamination test.
 * Strong alone is unusable here: the taxonomy's strong signals are long specific phrases
 * ("eyewash station basin covered in thick grease") while the ordinary vocabulary ("eyewash") sits
 * in moderate. Weak signals and context boosts are deliberately excluded -- they are too loose to
 * justify deleting a candidate.
 */
function familyContaminantTerms(family: string): string[] {
  const profile = HAZARD_TAXONOMY.find(p => p.id === family);
  if (!profile) return [];
  return [...new Set([...profile.strongSignals, ...profile.moderateSignals].map(sig => lower(sig.term)))];
}

/** Signal terms the engine's own taxonomy associates with a family. Guardrail input only. */
function familyTerms(family: string): string[] {
  const profile = HAZARD_TAXONOMY.find(p => p.id === family);
  const terms: string[] = family.split(/[_\-\s]+/).filter(w => w.length > 3);
  if (profile) {
    for (const group of [profile.strongSignals, profile.moderateSignals, profile.weakSignals, profile.contextBoosts]) {
      for (const s of group) terms.push(s.term);
    }
    terms.push(...profile.label.split(/\s+/).filter(w => w.length > 3));
  }
  return [...new Set(terms.map(lower))];
}

// ---------------------------------------------------------------- checks

function push(issues: L3SemanticIssue[], code: L3SemanticReason, candidateKey: string, detail: string): void {
  issues.push({ code, severity: severityOf(code), candidateKey, detail });
}

/** L3-2b: scope, not proximity. */
function checkNegationAddressed(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  if (h.conditionState === 'NEGATED' || h.conditionState === 'CORRECTED' || h.conditionState === 'REMOVED_FROM_SERVICE') return;

  for (const ref of h.evidence) {
    const text = sourceTextFor(ref, input);
    if (!text) continue;
    const scope = governingNegation(text, ref.startOffset, ref.endOffset);
    if (!scope) continue;
    if (containsNegation(ref.quotedText)) continue;      // the span carries its own negation
    if (containsNegation(h.conditionRationale)) continue; // the candidate reasoned about it
    push(issues, 'SEMANTIC_NEGATION_UNADDRESSED', h.candidateKey,
      `'${scope.token}' governs [${scope.from},${scope.to}) which contains the cited span, and appears neither in the span nor in the rationale`);
    return;
  }
}

/**
 * L3-2f, `DISC-07`. Verbs that REPORT or PLAN a correction without performing one.
 *
 * "The supervisor TALKED the crew through the replacement procedure" and "we have SCHEDULED a
 * replacement" both put a correction noun after a finite verb, and neither has corrected anything.
 * This is the `CONTROL_MENTION` / `CONTROL_EFFECTIVE` line drawn at the one place where a nominal
 * correction can now be admitted.
 */
const CORRECTION_MENTION_VERBS = [
  'talked', 'discussed', 'reviewed', 'described', 'mentioned', 'raised', 'noted', 'recorded',
  'covered', 'explained', 'briefed', 'reported', 'logged', 'requested', 'asked', 'considered',
  'planned', 'scheduled', 'proposed', 'recommended', 'ordered', 'agreed', 'promised', 'intended',
  'awaiting', 'awaited', 'needed', 'required', 'wanted',
];

/**
 * L3-2f. Whether a correction NOUN at `nounStart` is the object of a completed action verb.
 *
 * Two guards, both measured in the root-cause proof and both required to survive:
 *   * NEGATION -- "NO replacement has been drawn" asserts the opposite and is refused here;
 *   * MENTION  -- a reporting or planning verb performs nothing.
 *
 * The walk left stops at any preposition, coordinator or punctuation, so "waiting FOR a replacement"
 * finds no governing action and is correctly refused.
 */
function nominalAssertionGoverns(text: string, nounStart: number): boolean {
  if (governingNegation(text, nounStart, nounStart + 1) !== null) return false;
  const ws = [...text.matchAll(/[A-Za-z][A-Za-z'-]*/g)];
  const idx = ws.findIndex(w => (w.index ?? -1) <= nounStart && nounStart < (w.index ?? -1) + w[0].length);
  if (idx < 0) return false;

  for (let i = idx - 1; i >= 0 && idx - i <= 5; i -= 1) {
    const w = ws[i][0].toLowerCase();
    const gapFrom = (ws[i].index ?? 0) + w.length;
    const gapTo = ws[i + 1].index ?? 0;
    if (/[.;:!?,]/.test(text.slice(gapFrom, gapTo))) return false;   // a clause break: not our verb
    if (isPreposition(w) || isCoordinator(w) || isSubordinator(w)) return false;
    if (couldBeFiniteLexicalVerb(w)) return !CORRECTION_MENTION_VERBS.includes(w);
    if (isDeterminer(w) || isContentWord(w)) continue;               // determiner, number or adjective
    return false;
  }
  return false;
}

/**
 * A condition state is a claim about the text. Where it is falsifiable, falsify it.
 *
 * L3-2e -- ADMISSION NOW REQUIRES AN ASSERTED PREDICATE, for the three states whose marker is a
 * VERB. The root-cause proof measured two false admissions here:
 *
 *   CORRECTED   accepted on "a pile of DISCARDED conveyor rollers" -- a modifier, not a correction;
 *   CONTROLLED  accepted on "NO edge protection WAS IN PLACE" -- the negation ignored entirely.
 *
 * The second is the more serious: it labels a live hazard as controlled, which at the customer tier
 * is a missed hazard wearing a reassuring label.
 *
 * NEGATED and HYPOTHETICAL are deliberately left on presence semantics. Their markers are not verbs
 * predicated of a subject -- a negation particle IS the negation and a conditional IS the condition --
 * so a role test would reject correct evidence for no gain.
 */
function checkStateSupported(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  const required: Partial<Record<ValidatedHazard['conditionState'], { tokens: string[]; label: string; requireAssertion: boolean }>> = {
    CORRECTED: { tokens: CORRECTION_TOKENS, label: 'correction', requireAssertion: true },
    REMOVED_FROM_SERVICE: { tokens: [...REMOVAL_TOKENS, 'locked out', 'lockout'], label: 'removal-from-service', requireAssertion: true },
    NEGATED: { tokens: ['no', 'not', 'never', 'without', 'none', 'nor', 'neither', 'absent', 'lacking'], label: 'negation', requireAssertion: false },
    HYPOTHETICAL: { tokens: HYPOTHETICAL_TOKENS, label: 'conditional', requireAssertion: false },
    CONTROLLED: { tokens: CONTROL_IN_PLACE_TOKENS, label: 'control-in-place', requireAssertion: true },
  };
  const rule = required[h.conditionState];
  if (!rule || h.evidence.length === 0) return;

  for (const ref of h.evidence) {
    const text = sourceTextFor(ref, input);
    if (!text) continue;
    const scope = coordinatedClauseAround(text, ref.startOffset, ref.endOffset);
    if (!rule.requireAssertion) {
      if (hasAny(ref.quotedText, rule.tokens) || hasAny(scope, rule.tokens)) return;
      continue;
    }
    // The marker must be PREDICATED, and must not be predicated inside a negation.
    for (const candidateText of [ref.quotedText, scope]) {
      const governs = (start: number, end: number) => governingNegation(candidateText, start, end) !== null;
      const hits = findTokenOccurrences(candidateText, rule.tokens, governs);
      if (hits.some(o => asserts(o.role))) return;
      // L3-2f, `DISC-07`. A NOMINAL correction is still an assertion.
      //
      // L3-2e was right that a CORRECTED claim must be ASSERTED rather than merely mentioned, and
      // wrong to implement "asserted" as VERBHOOD. "the rigger DREW A REPLACEMENT from the store"
      // asserts a completed correction with a correction NOUN as the object of an action verb;
      // `tokenRole` returns NP_HEAD and the claim was refused. This is the mirror of F1-F3 -- a
      // structural test applied too narrowly rather than a lexical one applied too broadly -- and
      // per section 35.1 an ADMISSION vocabulary may be permissive.
      //
      // BOTH GUARDS THAT MADE THE L3-2e RULE WORTH HAVING ARE KEPT, and each was measured:
      //   * a NEGATED nominal correction is not a correction -- "NO replacement has been drawn";
      //   * an ATTRIBUTIVE mention corrects nothing -- "the replacement PROCEDURE".
      // So only an NP_HEAD occurrence qualifies, and only when a real action verb governs it.
      if (hits.some(o => o.role === 'NP_HEAD' && nominalAssertionGoverns(candidateText, o.start))) return;
    }
  }
  const detail = rule.requireAssertion
    ? `conditionState '${h.conditionState}' requires ${rule.label} language ASSERTED of a subject, and every occurrence in the cited span and its coordinated clause is a modifier, a name, or governed by a negation`
    : `conditionState '${h.conditionState}' requires ${rule.label} language, and none appears in any cited span or the coordinated clause containing it`;
  push(issues, 'SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE', h.candidateKey, detail);
}

/** RC-07's class: "we will schedule training" is not evidence that a hazard exists now. */
function checkActionNotCondition(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  if (h.conditionState !== 'ACTIVE') return;
  let sawPresent = false;
  let planned: string | null = null;
  for (const ref of h.evidence) {
    const text = sourceTextFor(ref, input);
    if (!text) continue;
    const scope = coordinatedClauseAround(text, ref.startOffset, ref.endOffset);
    const isPlanned = hasAny(scope, PLANNED_ACTION_TOKENS);
    const isPresent = hasAny(scope, PRESENT_CONDITION_TOKENS) || containsNegation(scope);
    if (isPresent) sawPresent = true;
    if (isPlanned && !isPresent) planned = isPlanned;
  }
  if (planned && !sawPresent) {
    push(issues, 'SEMANTIC_ACTION_NOT_CONDITION_EVIDENCE', h.candidateKey,
      `ACTIVE is grounded only in planned-action language ('${planned}'), which describes intent rather than a present condition`);
  }
}

/**
 * L3-2b, the B08 repair. The acceptance rule is SEMANTIC SUPPORT, not minimal-span perfection.
 * A span that supports the claim passes however broad it is; a span with nothing supporting the
 * claimed family fails however narrow it is.
 */
function checkFamilyRelevance(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  if (h.evidence.length === 0) return;
  const terms = familyTerms(h.hazardFamily);
  if (terms.length === 0) return;

  // Scope is the cited spans PLUS the sentences containing them. A legitimately narrow span often
  // names the STATE ("tagged out of service") while the hazard object ("forklift") sits a few words
  // away; judging the span alone would reject correct narrow evidence.
  const scopes = [citedText(h)];
  for (const ref of h.evidence) {
    const text = sourceTextFor(ref, input);
    if (text) scopes.push(sentenceAround(text, ref.startOffset, ref.endOffset));
  }
  const haystack = lower(scopes.join(' • '));
  if (terms.some(t => haystack.includes(t))) return;

  // No vocabulary for the claimed family. That is NOT proof of unrelatedness -- the taxonomy's term
  // lists are demonstrably sparse (they carry no 'rail', no 'platform', no 'locked out'), and
  // treating absence as fatal would repeat exactly the L3-2 defect this phase exists to fix.
  // It becomes fatal only under POSITIVE evidence that the text is about something else: a STRONG
  // signal for a different permitted family, with none for this one.
  const contaminant = input.allowedHazardFamilies
    .filter(f => f !== h.hazardFamily)
    .find(f => familyContaminantTerms(f).some(t => haystack.includes(t)));

  if (contaminant) {
    push(issues, 'SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY', h.candidateKey,
      `cited evidence carries no '${h.hazardFamily}' vocabulary but does carry a strong '${contaminant}' signal`);
    return;
  }
  push(issues, 'SEMANTIC_FAMILY_SUPPORT_NOT_EVIDENT', h.candidateKey,
    `no vocabulary for family '${h.hazardFamily}' in the cited evidence or its sentence; grounding is weak`);
}

/**
 * Broad evidence is allowed, but not when it drags in language that contradicts the claimed state
 * and the candidate never addresses it.
 */
/**
 * Nouns whose negation cancels a hazard rather than removing a control.
 *
 * This distinction is the whole reason the check exists. "no guardrail" negates a CONTROL and is
 * therefore evidence FOR an active hazard -- the single most common ACTIVE pattern in the corpus.
 * "no access is possible", "no damage was found", "no deficiencies" negate the HAZARD itself, and an
 * ACTIVE claim resting on one of those is asserting the opposite of its own evidence.
 */
const HAZARD_NEGATION_OBJECTS = [
  'access', 'exposure', 'damage', 'deficienc', 'injur', 'violation', 'hazard', 'defect',
  'issue', 'problem', 'concern', 'finding', 'discrepanc', 'incident', 'harm',
];

/**
 * L3-2e -- THE REJECTION PATH, and the one that has cost real high-consequence findings.
 *
 * Two independent sub-checks, repaired independently because they failed independently.
 *
 * (A) ACTIVE resting on a NEGATED HAZARD. The old test asked whether the text a negation governs
 *     CONTAINS a hazard word, by substring. Two things went wrong with that:
 *
 *       * "without HAZARD warning labels" matched `hazard`, but the head of that noun phrase is
 *         `labels` -- a CONTROL, whose absence IS the hazard. English noun phrases are head-final,
 *         so the head is what the negation actually denies.
 *       * "no damage to the enclosure ALTHOUGH the earth conductor has been cut back" matched
 *         `damage`, but the sentence explicitly announces a contrasting fact, and the hazard is
 *         asserted in that second clause.
 *
 *     Both are now required: the negated phrase's HEAD must be the hazard object, AND no contrastive
 *     connector may follow the negation's scope.
 *
 * (B) ACTIVE contradicted by a CORRECTION or REMOVAL. The old test asked whether the token appeared
 *     anywhere in the cited text. `discarded` in "a pile of discarded conveyor rollers" is an
 *     adjective, and it deleted `D-FLD-175`. `applied` in "no lockout is applied" is a predicate
 *     under a negation, and a negated correction is not a correction. Only an ASSERTED, UNNEGATED
 *     predicate contradicts now, and only from the unambiguous service-withdrawal subset.
 */
function checkContradiction(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  if (h.conditionState !== 'ACTIVE' || h.evidence.length === 0) return;
  const cited = citedText(h);

  // ---------------- (A) ACTIVE resting on a negated hazard.
  for (const ref of h.evidence) {
    const text = sourceTextFor(ref, input);
    if (!text) continue;
    for (const scope of negationScopes(ref.quotedText)) {
      // What does this negation actually deny? The HEAD of the phrase it opens.
      const head = nounPhraseHead(ref.quotedText, scope.tokenStart + scope.token.length);
      if (!head) continue;
      // L3-2f, `DISC-06`, fault (ii) of two. WHOLE-WORD, not containment.
      //
      // `head.includes(o)` is an UNBOUNDED admission rule: every word CONTAINING a listed stem joins
      // the set. It matched `issue` inside `issued` and deleted the programme's only noise-exposure
      // finding; L3-2f measured the same shape on `harm`/`harmless`, `concern`/`concerning` and
      // `access`/`accessory`. Containment is not identity.
      //
      // `allowInflection` is the DECLARED normalisation: several entries here are written as noun
      // stems (`deficienc`, `injur`, `discrepanc`) and genuinely mean the lemma and its regular
      // PLURAL. Verbal inflection is deliberately excluded -- `issued` is not an inflection of the
      // noun `issue` for this purpose, and treating it as one is the whole defect.
      const object = findWholeWordMatch(head, HAZARD_NEGATION_OBJECTS, { allowInflection: true });
      if (!object) continue;
      // A contrastive connector after the scope announces that the hazard is asserted elsewhere.
      const contrastive = hasContrastiveAfter(ref.quotedText, scope.to);
      if (contrastive) continue;
      if (hasAny(h.conditionRationale, ['still', 'remains', 'despite', 'however', 'nonetheless'])) continue;
      push(issues, 'SEMANTIC_EVIDENCE_CONTRADICTS_STATE', h.candidateKey,
        `ACTIVE is grounded in '${scope.token}' negating '${head}' -- the head of the negated phrase is the hazard itself ('${object}'), not a control, and no contrasting clause follows`);
      return;
    }
  }

  // ---------------- (B) ACTIVE contradicted by a correction or a service withdrawal.
  const governs = (start: number, end: number) => governingNegation(cited, start, end) !== null;
  // L3-2g. `UNAMBIGUOUS_CORRECTION`, not `CORRECTION_TOKENS`. The rejection path may only consult
  // tokens that mean the HAZARD was put right; ten ambiguous members were measured deleting correct
  // ACTIVE findings and now serve the admission half only. See the vocabulary's own note.
  const occurrences: TokenOccurrence[] = findTokenOccurrences(
    cited, [...UNAMBIGUOUS_CORRECTION, ...UNAMBIGUOUS_SERVICE_WITHDRAWAL], governs,
  );
  const asserted = occurrences.find(o => asserts(o.role));
  if (!asserted) return;

  const rationale = lower(h.conditionRationale);
  if (rationale.includes(asserted.token)) return;               // addressed explicitly
  if (hasAny(h.conditionRationale, ['still', 'remains', 'not yet', 'despite', 'however'])) return;
  push(issues, 'SEMANTIC_EVIDENCE_CONTRADICTS_STATE', h.candidateKey,
    `cited evidence asserts '${asserted.token}' as a predicate, which contradicts ACTIVE, and the rationale does not address it`);
}

/**
 * L3-2c, the H-AM-05 repair -- GENERAL GATE POLARITY, not a sentence-specific exception.
 *
 * L3-2b asked: does a word from `FACTUAL_CONDITION_TOKENS` appear unhedged? A valid factual
 * predicate whose verb nobody had listed therefore failed the gate, and `sheared` was one such verb.
 * The question is now the one the check was always meant to ask -- is this evidence ONLY the
 * observer's impression? -- and it is answered from the SHAPE of the predications in the evidence
 * (`impression-scope.ts`), consulting no condition vocabulary whatsoever.
 *
 * The two poles this must hold simultaneously, and which are paired in every suite:
 *
 *   RECALL     "did not look right to me AND the lower hinge pin is sheared off" -- an impression
 *              beside an unhedged factual predication with a non-observer subject. ADMITTED.
 *   PRECISION  "one of the sling legs may be cut" -- the hedge governs the only predication there
 *              is, so nothing was asserted. REJECTED, and a clarification is owed.
 *
 * `B10` ("the rail did not look right to me") and `H-AM-01` ("the track struck me as odd") are both
 * the precision pole. H-AM-01 additionally shows why the OLD gate was unsafe in the other
 * direction as well: "struck me as" was absent from its subjective list, so the check never ran and
 * the candidate was admitted as ACTIVE. Both errors close with the same structural test.
 */
function checkSubjectiveImpression(h: ValidatedHazard, issues: L3SemanticIssue[]): void {
  if (h.conditionState !== 'ACTIVE' || h.evidence.length === 0) return;
  const cited = citedText(h);
  const verdict = assessImpression(cited);
  if (!verdict.onlyImpression) return;

  // Advisory only: naming the absent concrete word helps a reader and decides nothing.
  const concrete = hasAny(cited, FACTUAL_CONDITION_TOKENS);
  push(issues, 'SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE', h.candidateKey,
    `ACTIVE rests on the observer's impression ('${verdict.impressionMarker}') -- every predication in the cited evidence is a perception, a first-person judgement or governed by a hedge, and none asserts a condition of the thing observed${concrete ? ` (concrete term '${concrete}' present but not asserted)` : ''}`);
  push(issues, 'SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED', h.candidateKey,
    'a decision-critical clarification was warranted and none was supplied');
}

/** ADVISORY only since L3-2b. Weak grounding is worth reporting; it is not fabrication. */
function checkSelectivity(hazards: ValidatedHazard[], input: ReasoningInput, issues: L3SemanticIssue[]): void {
  if (hazards.length < 2) return;
  const whole = new Map<string, string[]>();
  for (const h of hazards) {
    for (const ref of h.evidence) {
      const text = sourceTextFor(ref, input);
      if (!text) continue;
      if (ref.endOffset - ref.startOffset >= text.trim().length * 0.9) {
        const list = whole.get(ref.sourceId) || [];
        list.push(h.candidateKey);
        whole.set(ref.sourceId, list);
      }
    }
  }
  for (const [sourceId, keys] of whole) {
    if (keys.length < 2) continue;
    for (const key of keys) {
      push(issues, 'SEMANTIC_EVIDENCE_NOT_SELECTIVE', key,
        `${keys.length} candidates each cite the whole of source '${sourceId}'; grounding is weak but not absent`);
    }
  }
}

function checkIndependence(hazards: ValidatedHazard[], issues: L3SemanticIssue[]): void {
  for (let i = 0; i < hazards.length; i += 1) {
    for (let j = i + 1; j < hazards.length; j += 1) {
      const a = hazards[i];
      const b = hazards[j];
      if (a.hazardFamily !== b.hazardFamily) continue;
      const aKeys = new Set(a.evidence.map(spanKey));
      if (!b.evidence.some(e => aKeys.has(spanKey(e)))) continue;
      const distinguishes = (x: ValidatedHazard, y: ValidatedHazard) =>
        x.independentHazardRationale.trim().length > 0
        && lower(x.independentHazardRationale) !== lower(y.independentHazardRationale);
      if (distinguishes(a, b) && distinguishes(b, a)) continue;
      push(issues, 'SEMANTIC_CANDIDATES_NOT_INDEPENDENT', b.candidateKey,
        `shares family '${b.hazardFamily}' and evidence with '${a.candidateKey}' without a distinguishing independence rationale`);
    }
  }
}

/** L3-INV-12's semantic edge: a family taken from the hint list rather than from the text. */
function checkAdvisoryEcho(h: ValidatedHazard, input: ReasoningInput, issues: L3SemanticIssue[]): void {
  const hints = (input.advisorySignals || []).map(s => lower(s.value));
  if (hints.length === 0) return;
  const family = lower(h.hazardFamily);
  if (!hints.some(v => v.includes(family) || family.includes(v))) return;
  const terms = familyTerms(h.hazardFamily);
  const cited = lower(citedText(h));
  if (terms.some(t => cited.includes(t))) return;
  if (h.conditionRationale.trim().length > 80) return;
  push(issues, 'SEMANTIC_ADVISORY_ECHO', h.candidateKey,
    `family '${h.hazardFamily}' was supplied as an advisory hint and the cited evidence carries no supporting language`);
}

/**
 * The question the binder is entitled to ask, built from what it actually established.
 *
 * IT ASSERTS NO HAZARD. The candidate it rides on sits at INSUFFICIENT_EVIDENCE, and every word here
 * is derived mechanically from the model's own cited evidence -- the binder invents no family, no
 * state and no condition (L3-INV-08: model output is a proposal; the binder may refuse, never
 * create). It fills the shape L3-INV-06 requires: an unresolved fact, the decision it changes, at
 * least two branches, and a question a human can answer.
 */
function clarificationForImpression(h: ValidatedHazard): ValidatedHazard['clarification'] {
  const quoted = h.evidence.map(e => e.quotedText).join(' ');
  return {
    unresolvedFact: `whether the observation records an actual condition of the ${h.hazardFamily.replace(/_/g, ' ')} or only how it appeared to the observer: ${JSON.stringify(quoted)}`,
    affectedDecision: 'condition_state',
    branches: [
      'a specific physical condition was present and can be described concretely, in which case the hazard is active',
      'only an impression was recorded and no condition can be established from this observation',
    ],
    question: `What specifically did you see that made you note this? Describe the physical condition of the ${h.hazardFamily.replace(/_/g, ' ')} -- what is broken, missing, out of position or out of tolerance.`,
  };
}

/**
 * L3-2d, D1 -- A QUESTION BELONGS ONLY WHERE THE DECISION IS STILL OPEN.
 *
 * WHY THIS IS DETERMINISTIC AND NOT LEFT TO THE PROMPT. L3-2c lifted clarification recall from 1/3
 * to 3/3 by making the required output shape explicit, and paid for it with FOUR unnecessary
 * questions: `C-FLD-138` and `C-AM-04` carried one on an ACTIVE candidate and `C-CS-05` on a
 * HYPOTHETICAL one. The advancement gate demands ZERO. A prompt cannot deliver zero -- it can only
 * make it likely -- so the guarantee is placed where it can be proven.
 *
 * WHAT MAKES THIS SOUND RATHER THAN A SUPPRESSION HACK. `L3-INV-06` is a DECISION-BOUNDARY
 * invariant: a clarification exists to resolve a decision the engine could not make. The eight
 * condition states divide exactly: `INSUFFICIENT_EVIDENCE` and `UNKNOWN` are the two that say
 * "not decided"; the other six ARE the decision. A question hung on one of the six is, by the
 * contract's own definition, not a decision-boundary clarification. Dropping it removes noise, never
 * a needed question.
 *
 * IT NEVER TOUCHES THE HAZARD. The candidate, its family, its state, its evidence and its rationale
 * are returned unchanged; only the question is removed, and the removal is recorded as an advisory.
 * It also runs AFTER demotion, so a candidate the impression gate moved to INSUFFICIENT_EVIDENCE
 * keeps the clarification it was demoted in order to carry.
 */
// L3-2i: the local copy was replaced by the single definition in the contract types. Same values,
// same behaviour -- see L3_UNDECIDED_STATES.
const UNDECIDED_STATES: ReadonlyArray<ValidatedHazard['conditionState']> = L3_UNDECIDED_STATES;

function clarificationBelongsHere(h: ValidatedHazard): boolean {
  return UNDECIDED_STATES.includes(h.conditionState);
}

// ---------------------------------------------------------------- entry point

export function bindEvidenceSemantically(
  validated: ValidatedReasoning, input: ReasoningInput,
): L3SemanticBindingOutcome {
  const issues: L3SemanticIssue[] = [];
  const hazards = validated.hazards;

  // L3-2e. Record observation gaps once per source, before any check runs. RECORDING ONLY.
  const observationAvailability: L3SemanticBindingOutcome['observationAvailability'] = [];
  for (const src of input.authoritativeSources) {
    const gaps = detectObservationGaps(src.text);
    if (gaps.length === 0) continue;
    observationAvailability.push({
      sourceId: src.sourceId,
      availability: observationAvailabilityOf(src.text),
      unobservedFacts: gaps.map(g => g.unobservedFact),
    });
  }

  for (const h of hazards) {
    checkNegationAddressed(h, input, issues);
    checkStateSupported(h, input, issues);
    checkActionNotCondition(h, input, issues);
    checkFamilyRelevance(h, input, issues);
    checkContradiction(h, input, issues);
    checkSubjectiveImpression(h, issues);
    checkAdvisoryEcho(h, input, issues);
  }
  checkSelectivity(hazards, input, issues);
  checkIndependence(hazards, issues);

  // Advisory only. Whether the gap matters is a semantic judgement the prompt makes, not this module.
  for (const rec of observationAvailability) {
    for (const h of hazards) {
      push(issues, 'SEMANTIC_OBSERVATION_GAP_RECORDED', h.candidateKey,
        `the observation records something the inspector could not establish (${rec.availability}): ${JSON.stringify(rec.unobservedFacts.join('; ')).slice(0, 180)}`);
    }
  }

  // L3-2f. Record what KIND of control language each candidate's evidence carries. RECORDING ONLY:
  // it changes no state and removes no candidate. The CONTROLLED-vs-ACTIVE judgement is made by the
  // prompt, where the semantics live; this exists so the distinction is measurable in the evidence.
  const controlAdequacy: L3SemanticBindingOutcome['controlAdequacy'] = [];
  for (const h of hazards) {
    const rec = controlAdequacyOf(citedText(h));
    if (rec.adequacy === 'UNSPECIFIED') continue;
    controlAdequacy.push({ candidateKey: h.candidateKey, adequacy: rec.adequacy, matchedTerm: rec.matchedTerm, detail: rec.detail });
    push(issues, 'SEMANTIC_CONTROL_ADEQUACY_RECORDED', h.candidateKey, `${rec.adequacy}: ${rec.detail}`);
  }

  const fatalByKey = new Map<string, L3SemanticReason[]>();
  for (const issue of issues) {
    if (issue.severity !== 'FATAL') continue;
    const list = fatalByKey.get(issue.candidateKey) || [];
    if (!list.includes(issue.code)) list.push(issue.code);
    fatalByKey.set(issue.candidateKey, list);
  }

  // L3-2c, R3. DEMOTE RATHER THAN DELETE, for one code only.
  //
  // The binder already knew the answer and threw it away. When the impression gate fires it has
  // established two things at once: this is not ACTIVE, AND a specific decision-critical fact is
  // missing -- it raises `SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` in the same breath. Deleting
  // the candidate discarded the only carrier the clarification could travel on, which is exactly
  // why `H-AM-02` scored as a silent miss rather than as the question it was.
  //
  // This does NOT redesign clarification transport: a clarification remains a field on a hazard
  // candidate, which is the carrier-candidate architecture L3-2b introduced. It stops the pipeline
  // destroying the carrier it just decided it needed.
  //
  // ONLY this code demotes, and only from ACTIVE. Any other fatal issue still deletes, and a
  // candidate carrying a second fatal code alongside this one is deleted, not demoted -- an
  // impression is a reason to ask a question, but fabricated or contradicted evidence is not.
  const demoted: L3SemanticBindingOutcome['demoted'] = [];
  const clarificationsDropped: L3SemanticBindingOutcome['clarificationsDropped'] = [];
  const kept: ValidatedHazard[] = [];
  for (const h of hazards) {
    const fatal = fatalByKey.get(h.candidateKey);
    if (!fatal) { kept.push(h); continue; }
    const impressionOnly = fatal.length === 1 && fatal[0] === 'SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE';
    if (!impressionOnly || h.conditionState !== 'ACTIVE') continue;   // deleted, as before
    const synthesize = !h.clarification;
    kept.push({
      ...h,
      conditionState: 'INSUFFICIENT_EVIDENCE',
      clarification: h.clarification ?? clarificationForImpression(h),
    });
    demoted.push({
      candidateKey: h.candidateKey, from: 'ACTIVE', to: 'INSUFFICIENT_EVIDENCE',
      code: 'SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE', clarificationSynthesized: synthesize,
    });
    fatalByKey.delete(h.candidateKey);
  }

  // L3-2d, D1. Runs LAST, so demotion has already placed its carriers at INSUFFICIENT_EVIDENCE.
  const scoped = kept.map(h => {
    if (!h.clarification || clarificationBelongsHere(h)) return h;
    clarificationsDropped.push({
      candidateKey: h.candidateKey, conditionState: h.conditionState,
      question: String(h.clarification.question ?? ''),
    });
    push(issues, 'SEMANTIC_CLARIFICATION_ON_DECIDED_STATE', h.candidateKey,
      `a clarification was attached to a candidate already decided as '${h.conditionState}'; a question there resolves no decision boundary (L3-INV-06) and was dropped without touching the hazard`);
    return { ...h, clarification: null };
  });

  return {
    boundHazards: scoped,
    rejected: [...fatalByKey.entries()].map(([candidateKey, codes]) => ({ candidateKey, codes })),
    issues,
    clarificationExpected: [...new Set(
      issues.filter(i => i.code === 'SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED').map(i => i.candidateKey))],
    demoted,
    clarificationsDropped,
    observationAvailability,
    controlAdequacy,
    binderVersion: L3_SEMANTIC_BINDER_VERSION,
  };
}
