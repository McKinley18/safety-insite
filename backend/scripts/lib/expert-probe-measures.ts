/**
 * EXPERT HAZLENZ -- DEVELOPMENT-PROBE MEASURES. §141.
 *
 * ==================== WHY THIS FILE EXISTS AT ALL ====================
 *
 * §140's hosted probe computed its diagnostics inline in the probe script, and two of them were
 * wrong in the same way: they measured the RIGHT quantity over the WRONG SCOPE. Both would have been
 * reported as product defects.
 *
 *   1. CITATION. The scan read the whole `MergedIntelligence` and counted four citation-shaped
 *      strings "surviving to the customer". All four were `governed.citations[].citation` values the
 *      caller SUPPLIED to `mergeExpertIntelligence` as protected authority input. They are copied
 *      through unfiltered by design and Expert never touched them. The citation contract is about
 *      EXPERT PROSE; counting the governed block made a correct system look like it leaked.
 *
 *   2. UNDERPRODUCTION. The scan compared truth-present families against EXPERT candidates alone and
 *      reported eight "misses". Expert is ADDITIVE and the prompt tells it not to restate a family
 *      the deterministic engine already assessed, so that measure penalised the model for obeying
 *      the contract. The product question is whether a hazard was lost by BOTH layers.
 *
 * A third defect of the same class was found in §141's Phase 0 re-reading and is corrected here too:
 *
 *   3. LINKAGE OPPORTUNITY. §140 counted an "opportunity" as any clarification emitted beside any
 *      candidate, and reported 1 of 3 populated as `LINKAGE_PARTIAL`. That definition conflates
 *      REQUIRED, ALLOWED and FORBIDDEN linkage. Under the §141 contract, required-ness is a
 *      SEMANTIC property of the authored fixture, so it must come from the answer key -- never from
 *      counting collections.
 *
 * The lesson those three share: **a scope error in a measurement is indistinguishable from a defect
 * in the thing measured.** So the measures live here, in one place, exercised by the same code path
 * the probe uses, with self-tests that FAIL under each original buggy calculation
 * (`test:expert-probe-measures`). A measure that cannot be tested is a claim.
 *
 * NOTHING HERE IS A FORMAL SCORER. No frozen threshold, no formal measure, no gate. These are
 * development diagnostics and may never produce a formal result.
 */

import { CITATION_SHAPED_PATTERN } from '../../src/hazlenz/expert-hazlenz/expert-contract.types';

export const PROBE_MEASURES_VERSION = 'hazlenz.expert.probe-measures.v1' as const;

// ---------------------------------------------------------------- shared plumbing

/** Every string reachable in a value. Bounded depth, because these are records, not graphs. */
export function collectStrings(value: unknown, out: string[] = [], depth = 0): string[] {
  if (depth > 12 || value === null || value === undefined) return out;
  if (typeof value === 'string') { out.push(value); return out; }
  if (typeof value !== 'object') return out;
  if (Array.isArray(value)) { value.forEach(v => collectStrings(v, out, depth + 1)); return out; }
  Object.values(value as Record<string, unknown>).forEach(v => collectStrings(v, out, depth + 1));
  return out;
}

const citationHits = (value: unknown): string[] =>
  collectStrings(value).filter(s => CITATION_SHAPED_PATTERN.test(s));

// ---------------------------------------------------------------- A. citation provenance

/**
 * One call's citation-relevant surfaces, separated by WHO PRODUCED THEM. The separation is the
 * measure; a caller that hands the same object to two fields gets a meaningless answer.
 */
export interface CitationCallInput {
  /** Text the SYSTEM put in front of the model: system prompt, user prompt, rendered records. */
  modelInputText: string[];
  /** Governed records as SUPPLIED, before rendering. Input provenance, never Expert output. */
  suppliedGovernedRecordText: string[];
  /** The validated `ExpertAnalysis`, or null when the boundary refused it. EXPERT-PRODUCED. */
  validatedAnalysis: unknown | null;
  /** The Expert-contributed block of merged output ONLY — never the governed authority block. */
  mergedExpertAdvisory: unknown | null;
  /** The governed authority block of merged output. Reported as context; never a defect. */
  mergedGovernedBlock?: unknown | null;
  /** Normalization issue codes for this call, so a boundary refusal is counted as a refusal. */
  issueCodes: string[];
}

export interface CitationDiagnostics {
  /** Citation-shaped strings the SYSTEM placed in the model's input. Leakage, not Expert output. */
  INPUT_CITATION_SHAPED_COUNT: number;
  /** Citation-shaped strings in EXPERT-PRODUCED output, accepted or refused. */
  EXPERT_OUTPUT_CITATION_SHAPED_COUNT: number;
  /** Expert citations that survived the boundary into a validated analysis. Must be 0. */
  ACCEPTED_CITATION_COUNT: number;
  /** Expert citations the boundary refused with CITATION_SHAPED_TEXT_NOT_PERMITTED. */
  REJECTED_CITATION_COUNT: number;
  /** Expert citations reaching the customer-visible Expert advisory block. Must be 0. */
  MERGED_CITATION_COUNT: number;
  /**
   * Citation strings in the GOVERNED AUTHORITY block of merged output. CONTEXT ONLY. These are the
   * supplied records copied through by design. Reported so the number is visible and explained
   * rather than absent and later rediscovered as a scare.
   */
  GOVERNED_AUTHORITY_CITATION_COUNT: number;
  /** Records that carried a citation before rendering — proves redaction was exercised, not assumed. */
  SUPPLIED_RECORD_CITATION_COUNT: number;
}

/**
 * Count citation-shaped text BY PRODUCER.
 *
 * The one rule: a string is Expert output only if Expert produced it. Governed input records,
 * deterministic input and prompt/system/schema text are never counted as Expert output, however
 * citation-shaped they are — and the governed-record surfaces are exactly where citations are
 * SUPPOSED to live.
 */
export function citationDiagnostics(calls: readonly CitationCallInput[]): CitationDiagnostics {
  const d: CitationDiagnostics = {
    INPUT_CITATION_SHAPED_COUNT: 0,
    EXPERT_OUTPUT_CITATION_SHAPED_COUNT: 0,
    ACCEPTED_CITATION_COUNT: 0,
    REJECTED_CITATION_COUNT: 0,
    MERGED_CITATION_COUNT: 0,
    GOVERNED_AUTHORITY_CITATION_COUNT: 0,
    SUPPLIED_RECORD_CITATION_COUNT: 0,
  };
  for (const c of calls) {
    d.INPUT_CITATION_SHAPED_COUNT +=
      c.modelInputText.filter(s => CITATION_SHAPED_PATTERN.test(s)).length;
    d.SUPPLIED_RECORD_CITATION_COUNT +=
      c.suppliedGovernedRecordText.filter(s => CITATION_SHAPED_PATTERN.test(s)).length;

    const accepted = citationHits(c.validatedAnalysis).length;
    const merged = citationHits(c.mergedExpertAdvisory).length;
    const rejected = c.issueCodes.filter(i => i === 'CITATION_SHAPED_TEXT_NOT_PERMITTED').length;

    d.ACCEPTED_CITATION_COUNT += accepted;
    d.MERGED_CITATION_COUNT += merged;
    d.REJECTED_CITATION_COUNT += rejected;
    // Expert PRODUCED a citation if one survived OR if the boundary condemned the analysis for one.
    // Counting only the survivors would report a working fail-closed boundary as "no citations
    // emitted", which hides the model behaviour the probe exists to observe.
    d.EXPERT_OUTPUT_CITATION_SHAPED_COUNT += accepted + rejected;
    d.GOVERNED_AUTHORITY_CITATION_COUNT += citationHits(c.mergedGovernedBlock ?? null).length;
  }
  return d;
}

// ---------------------------------------------------------------- B. additive coverage

export interface CoverageCallInput {
  rowId: string;
  /** Families the authored truth says are genuinely present. */
  truthPresentFamilies: string[];
  /** Families the DETERMINISTIC layer emitted for this row. */
  deterministicFamilies: string[];
  /** Families ACCEPTED Expert candidates carry. Rejected candidates are not coverage. */
  acceptedExpertFamilies: string[];
}

export interface CoverageDiagnostics {
  /** Truth-present families the deterministic layer covered. */
  deterministicCoveredCount: number;
  /** Truth-present families ONLY Expert covered. The additive contribution, isolated. */
  additiveExpertCoveredCount: number;
  /** Truth-present families covered by the UNION. This is the product question. */
  combinedCoveredCount: number;
  /** Truth-present families covered by NEITHER layer. The only real loss. */
  truthMissesAfterUnionCount: number;
  truthPresentTotal: number;
  /** Families Expert supplied that the deterministic layer did not, whether or not in truth. */
  expertOnlyFamiliesCount: number;
  perRow: Array<{
    rowId: string;
    truthPresent: string[];
    deterministicCovered: string[];
    additiveExpertCovered: string[];
    coveredByNeither: string[];
    expertOnlyFamilies: string[];
  }>;
}

/**
 * Coverage over `deterministic ∪ acceptedExpert`.
 *
 * EXPERT IS NEVER REQUIRED TO REPEAT A DETERMINISTIC HAZARD. A family the engine already emitted is
 * counted as covered no matter what Expert did with it, and Expert's contribution is reported as the
 * families it added on top. The union is what a customer receives, so the union is what a miss is
 * measured against.
 */
export function coverageDiagnostics(rows: readonly CoverageCallInput[]): CoverageDiagnostics {
  const perRow: CoverageDiagnostics['perRow'] = rows.map(r => {
    const det = new Set(r.deterministicFamilies);
    const exp = new Set(r.acceptedExpertFamilies);
    return {
      rowId: r.rowId,
      truthPresent: [...r.truthPresentFamilies],
      deterministicCovered: r.truthPresentFamilies.filter(f => det.has(f)),
      additiveExpertCovered: r.truthPresentFamilies.filter(f => !det.has(f) && exp.has(f)),
      coveredByNeither: r.truthPresentFamilies.filter(f => !det.has(f) && !exp.has(f)),
      expertOnlyFamilies: [...new Set(r.acceptedExpertFamilies.filter(f => !det.has(f)))],
    };
  });
  const sum = (pick: (p: CoverageDiagnostics['perRow'][number]) => number) =>
    perRow.reduce((t, p) => t + pick(p), 0);
  return {
    deterministicCoveredCount: sum(p => p.deterministicCovered.length),
    additiveExpertCoveredCount: sum(p => p.additiveExpertCovered.length),
    combinedCoveredCount: sum(p => p.deterministicCovered.length + p.additiveExpertCovered.length),
    truthMissesAfterUnionCount: sum(p => p.coveredByNeither.length),
    truthPresentTotal: sum(p => p.truthPresent.length),
    expertOnlyFamiliesCount: sum(p => p.expertOnlyFamilies.length),
    perRow,
  };
}


// ---------------------------------------------------------------- C. linkage

/**
 * What the ANSWER KEY says about a clarification emitted on this row. §143.
 *
 * ==================== WHY THERE ARE NOW FOUR VALUES ====================
 *
 * §142 had three, and labelled TEN of sixteen rows `FORBIDDEN` because `FORBIDDEN` was the default
 * for every row that was not `REQUIRED` or `ALLOWED`. Nine of those ten were blanket defaults with
 * no linkage rationale at all, and the audit showed the cost precisely:
 *
 *   - 9 of the 10 emitted NO clarification, so no linkage situation ever arose on them;
 *   - the 1 that did emit one, LP-G3, was semantically REQUIRED, not FORBIDDEN;
 *   - therefore **not one row in the whole set produced a valid FORBIDDEN opportunity**, and the
 *     FORBIDDEN measure had no legitimate denominator while still reporting a violation.
 *
 * `NOT_A_LINKAGE_TEST` is the missing value. A row is not a FORBIDDEN control merely because no
 * link is expected on it; FORBIDDEN must be a POSITIVE claim that a link WOULD BE WRONG, with a
 * stated reason. Rows that make no linkage claim are excluded from every linkage denominator
 * instead of silently inflating the violation numerator.
 */
export type LinkageExpectation = 'REQUIRED' | 'ALLOWED' | 'FORBIDDEN' | 'NOT_A_LINKAGE_TEST';

export interface LinkageCallInput {
  rowId: string;
  /** The row's authored expectation. `NOT_A_LINKAGE_TEST` means it makes no linkage claim. */
  expectation: LinkageExpectation;
  /** candidateKeys the analysis actually emitted, so a link can be RESOLVED rather than trusted. */
  emittedCandidateKeys: string[];
  emittedClarifications: Array<{ clarificationId: string; relatesToCandidateKey: string | null }>;
  /** Issue codes for the call, so stripped links and arbitration events are counted, not inferred. */
  issueCodes: string[];
}

/**
 * Opportunity-scoped linkage counters. §143 Phase 4.
 *
 * ==================== THE ONE RULE ====================
 *
 * **AN OPPORTUNITY REQUIRES AN EMITTED CLARIFICATION ON A ROW THAT MAKES A LINKAGE CLAIM.**
 *
 * "The row has a candidate and a clarification" is NOT sufficient — that was §140's broad
 * denominator, which scored a correct model 1-of-3. "The row is labelled FORBIDDEN" is NOT
 * sufficient either — that was §142's blanket-label defect. Both are rejected by self-tests.
 */
export interface LinkageDiagnostics {
  REQUIRED_LINKAGE_OPPORTUNITIES: number;
  REQUIRED_LINKAGE_POPULATED: number;
  REQUIRED_LINKAGE_VALID: number;
  REQUIRED_LINKAGE_MISSING: number;

  ALLOWED_LINKAGE_OPPORTUNITIES: number;
  ALLOWED_LINKAGE_POPULATED: number;
  ALLOWED_LINKAGE_VALID: number;

  /** Clarifications emitted on rows where a link would be WRONG. The honest FORBIDDEN denominator. */
  FORBIDDEN_LINKAGE_OPPORTUNITIES: number;
  /** Links attempted on those rows. */
  FORBIDDEN_LINKAGE_ATTEMPTS: number;
  /** Attempts that RESOLVED, i.e. reached the customer path as a link. The violation count. */
  FORBIDDEN_LINKAGE_ACCEPTED: number;

  /** Rows that made a linkage claim but emitted no clarification. Retention events, never failures. */
  NO_LINKAGE_OPPORTUNITY_ROWS: number;
  /** Rows excluded from every denominator because they make no linkage claim at all. */
  NOT_A_LINKAGE_TEST_ROWS: number;

  /** Links naming a candidate the analysis did not emit. */
  INVALID_LINKAGE_ATTEMPTS: number;
  /** Those the boundary actually stripped (CLARIFICATION_LINK_UNRESOLVED). */
  INVALID_LINKAGE_STRIPPED: number;

  ARBITRATION_EVENTS: number;

  perRow: Array<{
    rowId: string; expectation: LinkageExpectation;
    clarificationsEmitted: number; populated: number; valid: number; unresolved: number;
    status: 'SATISFIED' | 'MISSING' | 'NO_LINKAGE_OPPORTUNITY' | 'VIOLATION' | 'CLEAN'
      | 'NOT_A_LINKAGE_TEST';
  }>;
}

export function linkageDiagnostics(calls: readonly LinkageCallInput[]): LinkageDiagnostics {
  const d: LinkageDiagnostics = {
    REQUIRED_LINKAGE_OPPORTUNITIES: 0, REQUIRED_LINKAGE_POPULATED: 0,
    REQUIRED_LINKAGE_VALID: 0, REQUIRED_LINKAGE_MISSING: 0,
    ALLOWED_LINKAGE_OPPORTUNITIES: 0, ALLOWED_LINKAGE_POPULATED: 0, ALLOWED_LINKAGE_VALID: 0,
    FORBIDDEN_LINKAGE_OPPORTUNITIES: 0, FORBIDDEN_LINKAGE_ATTEMPTS: 0,
    FORBIDDEN_LINKAGE_ACCEPTED: 0,
    NO_LINKAGE_OPPORTUNITY_ROWS: 0, NOT_A_LINKAGE_TEST_ROWS: 0,
    INVALID_LINKAGE_ATTEMPTS: 0, INVALID_LINKAGE_STRIPPED: 0,
    ARBITRATION_EVENTS: 0,
    perRow: [],
  };

  for (const c of calls) {
    const keys = new Set(c.emittedCandidateKeys);
    const links = c.emittedClarifications
      .map(q => q.relatesToCandidateKey)
      .filter((k): k is string => typeof k === 'string' && k.length > 0);
    const valid = links.filter(k => keys.has(k));
    const unresolved = links.length - valid.length;

    d.INVALID_LINKAGE_ATTEMPTS += unresolved;
    d.INVALID_LINKAGE_STRIPPED +=
      c.issueCodes.filter(i => i === 'CLARIFICATION_LINK_UNRESOLVED').length;
    d.ARBITRATION_EVENTS +=
      c.issueCodes.filter(i => i === 'CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE').length;

    let status: LinkageDiagnostics['perRow'][number]['status'];

    if (c.expectation === 'NOT_A_LINKAGE_TEST') {
      // Excluded from every denominator. A link here is neither credited nor penalised, because the
      // fixture never made a claim about it. This is the §142 defect, closed.
      d.NOT_A_LINKAGE_TEST_ROWS += 1;
      status = 'NOT_A_LINKAGE_TEST';
    } else if (c.emittedClarifications.length === 0) {
      // A question never asked cannot be a linkage result in EITHER direction.
      d.NO_LINKAGE_OPPORTUNITY_ROWS += 1;
      status = 'NO_LINKAGE_OPPORTUNITY';
    } else if (c.expectation === 'REQUIRED') {
      d.REQUIRED_LINKAGE_OPPORTUNITIES += 1;
      d.REQUIRED_LINKAGE_POPULATED += links.length > 0 ? 1 : 0;
      if (valid.length > 0) { d.REQUIRED_LINKAGE_VALID += 1; status = 'SATISFIED'; }
      else { d.REQUIRED_LINKAGE_MISSING += 1; status = 'MISSING'; }
    } else if (c.expectation === 'ALLOWED') {
      d.ALLOWED_LINKAGE_OPPORTUNITIES += 1;
      d.ALLOWED_LINKAGE_POPULATED += links.length > 0 ? 1 : 0;
      d.ALLOWED_LINKAGE_VALID += valid.length > 0 ? 1 : 0;
      // Omission is correct on an ALLOWED row and is never scored as a failure.
      status = 'CLEAN';
    } else {
      d.FORBIDDEN_LINKAGE_OPPORTUNITIES += 1;
      d.FORBIDDEN_LINKAGE_ATTEMPTS += links.length;
      d.FORBIDDEN_LINKAGE_ACCEPTED += valid.length;
      status = valid.length > 0 ? 'VIOLATION' : 'CLEAN';
    }

    d.perRow.push({
      rowId: c.rowId, expectation: c.expectation,
      clarificationsEmitted: c.emittedClarifications.length,
      populated: links.length, valid: valid.length, unresolved, status,
    });
  }
  return d;
}

/**
 * The three-way classification, computed from the REQUIRED denominator only.
 *
 * Zero required opportunities returns `LINKAGE_NOT_WORKING` **as an untested verdict, not a failure
 * finding** — a probe that never created an opportunity has learned nothing, and the conservative
 * label is the honest one. That is what §140 was.
 */
export function classifyLinkage(d: LinkageDiagnostics):
'LINKAGE_READY' | 'LINKAGE_PARTIAL' | 'LINKAGE_NOT_WORKING' {
  if (d.REQUIRED_LINKAGE_OPPORTUNITIES === 0) return 'LINKAGE_NOT_WORKING';
  if (d.INVALID_LINKAGE_ATTEMPTS > 0 || d.FORBIDDEN_LINKAGE_ACCEPTED > 0) return 'LINKAGE_PARTIAL';
  const rate = d.REQUIRED_LINKAGE_VALID / d.REQUIRED_LINKAGE_OPPORTUNITIES;
  if (rate >= 0.75) return 'LINKAGE_READY';
  if (rate > 0) return 'LINKAGE_PARTIAL';
  return 'LINKAGE_NOT_WORKING';
}

// ---------------------------------------------------------------- D. output-relative linkage §145

/**
 * ==================== THE CONSTRUCT-VALIDITY DEFECT THIS SECTION CLOSES ====================
 *
 * §144's CL-F1 exposed a problem the earlier repairs did not reach. The fixture authored
 * `FORBIDDEN` on the premise that two trim presses would produce two interchangeable
 * `machine_guarding` candidates, leaving the authorisation question with no unique referent. The
 * model instead decomposed the row PER DEFECT and emitted a third candidate --
 * `unverified_muting_authorisation` -- which IS the missing fact, then linked to it. Against the
 * candidate set the model actually produced, that link is correct.
 *
 * **A fixture cannot author FORBIDDEN-by-ambiguity, because ambiguity is a property of the candidate
 * set, and the candidate set is model-generated.** Scoring it as a linkage defect charged the model
 * for a decomposition choice, not for a linkage error.
 *
 * ==================== TWO QUESTIONS THAT MUST NEVER BE ONE SCORE ====================
 *
 *   QUESTION A -- LINKAGE VALIDITY. Given the ACCEPTED candidate set actually emitted, does the
 *     clarification have a unique semantic relationship to one candidate?
 *
 *   QUESTION B -- CANDIDATE DECOMPOSITION QUALITY. Should that candidate have been emitted at all?
 *
 * A valid link to a spurious candidate is `LINKAGE_VALID = TRUE` and `CANDIDATE_PRECISION = FALSE`.
 * **A bad candidate must never turn a mechanically correct link into a linkage failure**, and a good
 * candidate with a wrongly attached clarification is a linkage failure however clean the candidates
 * are. The two are reported on separate axes and never summed.
 */

/** What a fixture INTENDED to challenge. Never used directly as linkage truth. */
export type ScenarioIntent =
  | 'REQUIRED_LINKAGE_CHALLENGE'
  | 'AMBIGUOUS_CANDIDATE_CHALLENGE'
  | 'DIFFERENT_HAZARD_CHALLENGE'
  | 'GENERIC_FOLLOWUP_CHALLENGE'
  | 'NO_LINKAGE_CLAIM';

export interface ScenarioIntentInput {
  rowId: string;
  intent: ScenarioIntent;
  /**
   * For an AMBIGUOUS intent: the families among which the fixture PRESUMED the referent would be
   * ambiguous. If the model's link resolves to a candidate OUTSIDE these families, it found a
   * referent the fixture never anticipated and the intended ambiguity does not exist for this
   * execution.
   */
  intentPresumedFamilies?: string[];
  /** The ACCEPTED candidate set actually emitted, post-boundary. */
  acceptedCandidates: Array<{ candidateKey: string; hazardFamily: string }>;
  emittedClarifications: Array<{ clarificationId: string; relatesToCandidateKey: string | null }>;
}

export interface ScenarioIntentResult {
  rowId: string;
  intent: ScenarioIntent;
  realized: boolean;
  /** Why, in words a reader can check against the persisted candidate set. */
  reason: string;
  countsInForbiddenDenominator: boolean;
}

/**
 * Was the intended scenario actually realized by the candidate set the model produced?
 *
 * This is the guard that stops a fixture's presumption from becoming a model defect. It is
 * MECHANICAL -- it reads the accepted candidate set and the emitted link, and makes no semantic
 * judgement about what a question is "really about".
 */
export function evaluateScenarioIntent(input: ScenarioIntentInput): ScenarioIntentResult {
  const { rowId, intent } = input;
  const families = input.acceptedCandidates.map(c => c.hazardFamily);
  const keys = new Map(input.acceptedCandidates.map(c => [c.candidateKey, c.hazardFamily]));
  const links = input.emittedClarifications
    .map(q => q.relatesToCandidateKey)
    .filter((k): k is string => typeof k === 'string' && k.length > 0);
  const emitted = input.emittedClarifications.length;

  const no = (reason: string): ScenarioIntentResult =>
    ({ rowId, intent, realized: false, reason, countsInForbiddenDenominator: false });
  const yes = (reason: string, counts: boolean): ScenarioIntentResult =>
    ({ rowId, intent, realized: true, reason, countsInForbiddenDenominator: counts });

  if (intent === 'NO_LINKAGE_CLAIM') {
    return no('the row makes no linkage claim and is excluded from every linkage denominator');
  }
  if (emitted === 0) {
    return no('no clarification was emitted, so no linkage situation arose in either direction');
  }
  if (intent === 'REQUIRED_LINKAGE_CHALLENGE') {
    return yes('a clarification was emitted on a row that owes a uniquely-referring question', false);
  }

  if (intent === 'AMBIGUOUS_CANDIDATE_CHALLENGE') {
    const presumed = input.intentPresumedFamilies ?? [];
    const within = input.acceptedCandidates.filter(c => presumed.includes(c.hazardFamily));
    if (within.length < 2) {
      return no(`the intended ambiguity needs >=2 accepted candidates among [${presumed.join(', ')}] `
        + `and the model emitted ${within.length}`);
    }
    // THE §144 CL-F1 CASE. The model linked to a candidate the fixture never anticipated, so the
    // referent it chose was not ambiguous at all and the intended challenge did not occur.
    const outside = links.filter(k => keys.has(k) && !presumed.includes(keys.get(k)!));
    if (outside.length > 0) {
      return no('the emitted link resolves to an accepted candidate OUTSIDE the presumed families '
        + `(${outside.map(k => `${k}:${keys.get(k)}`).join(', ')}), so the model found a unique `
        + 'referent the fixture did not anticipate and the intended ambiguity does not exist for '
        + 'this execution');
    }
    return yes('two or more accepted candidates sit within the presumed families and no link '
      + 'escaped them', true);
  }

  if (intent === 'DIFFERENT_HAZARD_CHALLENGE') {
    if (new Set(families).size < 2) {
      return no('a cross-hazard link needs accepted candidates in >=2 distinct families and the '
        + `model emitted ${new Set(families).size}`);
    }
    return yes('accepted candidates span two or more families, so a cross-hazard link is possible',
      true);
  }

  // GENERIC_FOLLOWUP_CHALLENGE
  if (input.acceptedCandidates.length < 2) {
    return no('a genuinely generic question needs >=2 accepted candidates for there to be no unique '
      + `subject; the model emitted ${input.acceptedCandidates.length}`);
  }
  return yes('two or more accepted candidates, so a row-level question has no unique subject', true);
}

/** Candidate-quality axis. Deliberately separate from every linkage counter. §145 Phase 1. */
export type CandidateQuality =
  | 'SUPPORTED_ADDITIVE_CANDIDATE'
  | 'PLAUSIBLE_BUT_UNVERIFIED'
  | 'SPURIOUS_CANDIDATE'
  | 'UNRESOLVABLE';

/**
 * Classify one accepted candidate against the row's AUTHORED family truth.
 *
 * `UNRESOLVABLE` is a real answer and must be returned rather than guessed: the partition tells us
 * whether a FAMILY was present, defensible or forbidden, and it says nothing about whether a
 * particular decomposition of that family into one, two or three candidates was right. Fragmentation
 * is a separate question and is routed to `CANDIDATE_PRECISION_AND_DECOMPOSITION` debt, not decided
 * here.
 */
export function classifyCandidateQuality(
  hazardFamily: string,
  truth: { presentHazardFamilies: string[]; defensibleHazardFamilies: string[];
    forbiddenHazardFamilies: string[] },
): { quality: CandidateQuality; reason: string } {
  if (truth.forbiddenHazardFamilies.includes(hazardFamily)) {
    return { quality: 'SPURIOUS_CANDIDATE',
      reason: `${hazardFamily} is in the authored FORBIDDEN bucket for this row` };
  }
  if (truth.presentHazardFamilies.includes(hazardFamily)) {
    return { quality: 'SUPPORTED_ADDITIVE_CANDIDATE',
      reason: `${hazardFamily} is authored as genuinely PRESENT` };
  }
  if (truth.defensibleHazardFamilies.includes(hazardFamily)) {
    return { quality: 'PLAUSIBLE_BUT_UNVERIFIED',
      reason: `${hazardFamily} is authored as DEFENSIBLE — a reviewer would find it defensible but `
        + 'would not require it, so it is neither supported nor spurious' };
  }
  return { quality: 'UNRESOLVABLE',
    reason: `${hazardFamily} is outside the row's authored vocabulary, so the answer key says `
      + 'nothing about it' };
}
