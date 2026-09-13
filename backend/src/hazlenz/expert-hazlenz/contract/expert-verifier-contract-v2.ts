/**
 * §157 EXPERT HAZLENZ -- VERIFIER CONTRACT v2. BOUNDED FACT NOMINATION. DEVELOPMENT PROTOTYPE ONLY.
 *
 * v1 (`expert-verifier-contract.ts`) is left BYTE-UNCHANGED: it is the contract §156 was executed
 * under and is part of that evidence. v2 imports what it can and extends nothing in place.
 *
 * ==================== THE DEFECT THIS CLOSES, AND ITS EXACT SHAPE ====================
 *
 * §156's verifier was contained enough to preserve legitimate silence perfectly -- 7 of 7, zero
 * manufactured questions -- and that same containment trapped it inside a first-pass framing error:
 *
 *   VC-13  judged the relevance of the DISTRACTOR it was handed, agreed with the first pass's own
 *          denial ("The first pass correctly declined to ask a clarifying question") and never
 *          considered the fact that actually controlled the decision.
 *   VC-02  detected that something was unaddressed, reasoned WELL about it, then re-asked the same
 *          distractor -- and named a fact outside its supplied set, so `UNRESOLVED_FACT_REF_NOT_
 *          SUPPLIED` refused the verdict whole. The rule fired correctly. The rule was the problem.
 *
 * So v2 grants exactly one new power: the verifier may NOMINATE AT MOST ONE fact the first pass did
 * not supply. Nothing else changes. It still cannot touch a candidate, a citation, deterministic
 * output, risk, a corrective action, an insight or a disagreement, and it still returns one verdict.
 *
 * ==================== WHY ONE, AND WHY NOT A LIST ====================
 *
 * A verifier permitted to nominate several facts is a hazard analysis with extra steps, and §101 and
 * §105 both measured what re-analysis costs. One nomination forces a choice: the verifier must
 * decide which single unasked fact controls the decision, which is the judgement being tested. A
 * list would let it hedge, and a hedge scored as a hit is how a recall figure gets inflated.
 *
 * ==================== WHAT THE ADMISSION RULE CAN AND CANNOT CHECK ====================
 *
 * >>> THE BOUNDARY BETWEEN THESE TWO IS THE WHOLE INTEGRITY OF v2, AND §155's POSTCONDITION
 * >>> DOCUMENT ALREADY SETTLED THE PRINCIPLE: a semantic judgement must never be disguised as a
 * >>> deterministic check.
 *
 * DETERMINISTIC, checked here, byte by byte:
 *   - the nomination quotes a span that appears VERBATIM in the observation;
 *   - both counterfactual branches exist, are non-empty, and differ from each other;
 *   - the DECISION under each branch exists and the two DIFFER -- the divergence proof;
 *   - the affected decision is a frozen enum member;
 *   - there is exactly one nomination, not a list;
 *   - the nominated fact is not a restatement of a fact the first pass already supplied;
 *   - no forbidden field is present.
 *
 * SEMANTIC, asserted by the verifier and NOT verifiable by this module:
 *   - that the fact is genuinely unresolved rather than merely unstated;
 *   - that the divergence it describes is real rather than asserted;
 *   - that the answer is needed NOW rather than useful later.
 *
 * The rule therefore checks that the PROOF IS PRESENT AND INTERNALLY CONSISTENT. It cannot check
 * that the proof is true. That is the same discipline as the first pass's quote binding, which
 * verifies a quote exists and never verifies the reasoning built on it -- and it must be stated
 * wherever a nomination figure is reported.
 */

import {
  VERIFIER_VERDICTS, VERIFIER_FORBIDDEN_FIELDS, type ExpertVerifierVerdict,
} from './expert-verifier-contract';

export const EXPERT_VERIFIER_CONTRACT_V2_VERSION = 'hazlenz.expert.verifier.v2' as const;

export { VERIFIER_VERDICTS, VERIFIER_FORBIDDEN_FIELDS };
export type { ExpertVerifierVerdict };

/** Where the clarification came from. Present ONLY on ADD_OR_REPLACE_CLARIFICATION. */
export const CLARIFICATION_SOURCE_MODES = ['SUPPLIED_FACT', 'NOMINATED_FACT'] as const;
export type ClarificationSourceMode = (typeof CLARIFICATION_SOURCE_MODES)[number];

export const EXPERT_AFFECTED_DECISIONS = [
  'HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY', 'REQUIRED_CONTROL',
  'REGULATORY_INTERPRETATION',
] as const;

/**
 * The nomination payload. Every field is a piece of the proof, and the admission rule below refuses
 * a nomination that omits any of them -- so an unproved nomination cannot reach a customer by being
 * merely plausible.
 */
export interface NominatedFact {
  /** The missing fact, stated concisely as a fact rather than as a question. */
  readonly missingFact: string;
  /**
   * A span COPIED VERBATIM from the observation showing why the fact is unresolved. Checked by byte
   * equality against the observation, exactly as the first pass's evidence quotes are.
   */
  readonly observationSpan: string;
  /** Why that span leaves the fact open rather than establishing it. */
  readonly notEstablishedBecause: string;
  readonly affectedDecision: string;
  /** One plausible answer. */
  readonly branchA: string;
  /** What is done at this workplace TODAY if branchA holds. */
  readonly decisionIfA: string;
  /** The other plausible answer. */
  readonly branchB: string;
  /** What is done at this workplace TODAY if branchB holds. MUST DIFFER FROM `decisionIfA`. */
  readonly decisionIfB: string;
  /** Why the difference above matters now rather than at a later review. */
  readonly whyNecessaryNow: string;
}

export interface ExpertVerifierV2Output {
  readonly verifierContractVersion: typeof EXPERT_VERIFIER_CONTRACT_V2_VERSION;
  readonly analysisId: string;
  readonly verdict: ExpertVerifierVerdict;
  readonly rationale: string;
  readonly aboutUnresolvedFactRef: string | null;
  readonly clarificationSourceMode: ClarificationSourceMode | null;
  readonly proposedClarification: {
    readonly question: string;
    readonly whyItMatters: string;
    readonly affectedDecision: string;
    readonly evidenceGap: string;
    readonly replacesClarificationId: string | null;
  } | null;
  /** Present ONLY when `clarificationSourceMode === 'NOMINATED_FACT'`. At most one, ever. */
  readonly nominatedFact: NominatedFact | null;
}

export const NOMINATION_ADMISSION_CODES = [
  'NOMINATION_NOT_PERMITTED_FOR_THIS_VERDICT',
  'NOMINATION_REQUIRED_FOR_THIS_SOURCE_MODE',
  'NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE',
  'NOMINATION_FIELD_MISSING',
  'OBSERVATION_SPAN_NOT_VERBATIM',
  'BRANCHES_IDENTICAL',
  'DECISIONS_DO_NOT_DIVERGE',
  'AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
  'NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT',
  'MORE_THAN_ONE_NOMINATION',
  'SOURCE_MODE_MISSING_ON_A_CLARIFICATION',
  'SUPPLIED_MODE_MUST_NAME_A_SUPPLIED_FACT',
] as const;
export type NominationAdmissionCode = (typeof NOMINATION_ADMISSION_CODES)[number];

/** Which admission conditions this module can actually decide, recorded in code. */
export const ADMISSION_RULE_CLASSIFICATION = {
  FACT_NOT_ALREADY_ESTABLISHED: 'SEMANTIC_ASSERTED_BY_VERIFIER_PROOF_FIELD_REQUIRED',
  FACT_IS_NOT_MERE_BACKGROUND: 'SEMANTIC_ASSERTED_BY_VERIFIER_PROOF_FIELD_REQUIRED',
  TWO_PLAUSIBLE_ANSWER_STATES: 'SAFE_DETERMINISTIC',
  ANSWERS_PRODUCE_DIFFERENT_CURRENT_DECISIONS: 'SAFE_DETERMINISTIC',
  EXACT_DECISION_IDENTIFIED: 'SAFE_DETERMINISTIC',
  NECESSARY_NOW: 'SEMANTIC_ASSERTED_BY_VERIFIER_PROOF_FIELD_REQUIRED',
  NO_INVENTED_HAZARD: 'SAFE_DETERMINISTIC_VIA_VERBATIM_OBSERVATION_SPAN',
  WITHIN_CLARIFICATION_AUTHORITY: 'SAFE_DETERMINISTIC',
  AT_MOST_ONE: 'SAFE_DETERMINISTIC',
  NOT_A_RESTATEMENT_OF_A_SUPPLIED_FACT: 'SAFE_DETERMINISTIC',
} as const;

const norm = (v: unknown): string => typeof v === 'string'
  ? v.trim().toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim() : '';
const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * Overlap between two normalised strings, as a share of the shorter one's content words.
 *
 * Used ONLY for the duplicate check, where the question is whether the verifier has renamed a fact
 * it was already given. A high threshold is deliberate: a nomination that merely SHARES VOCABULARY
 * with a supplied fact -- the same equipment, the same hazard family -- is not a duplicate, and
 * rejecting it would recreate the trap v2 exists to open.
 */
const contentOverlap = (a: string, b: string): number => {
  const stop = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'of', 'to', 'and', 'or',
    'in', 'on', 'it', 'this', 'that', 'not', 'no', 'whether', 'if', 'has', 'have', 'been', 'from',
    'for', 'with', 'at', 'by', 'as', 'its', 'their', 'any', 'been', 'does', 'do', 'did']);
  const words = (s: string) => new Set(norm(s).split(' ').filter(w => w.length > 2 && !stop.has(w)));
  const A = words(a); const B = words(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / Math.min(A.size, B.size);
};

/** A nomination sharing this much content with a supplied fact is treated as a restatement. */
export const DUPLICATE_OVERLAP_THRESHOLD = 0.8;

export interface AdmissionInput {
  analysisId: string;
  /** The observation, verbatim, for the span check. */
  observation: string;
  /** The unresolved facts the first pass supplied, by ref and text. */
  suppliedFacts: ReadonlyArray<{ ref: string; text: string }>;
}

export interface AdmissionResult {
  admitted: boolean;
  codes: NominationAdmissionCode[];
  /** Set when a nomination was present and every deterministic condition held. */
  nominationAdmitted: boolean;
  detail: string[];
}

/**
 * The whole v2 boundary: v1's rules, plus the nomination admission rule.
 *
 * Refuses the verdict WHOLE on any violation, exactly as v1 does. A partly-valid verdict is not a
 * partly-correct one, and refusing it leaves the first pass standing, which is safe by construction.
 */
export function checkVerifierV2Output(raw: unknown, input: AdmissionInput): AdmissionResult {
  const codes: NominationAdmissionCode[] = [];
  const detail: string[] = [];
  const fail = (c: NominationAdmissionCode, d: string) => { codes.push(c); detail.push(d); };

  if (typeof raw !== 'object' || raw === null) {
    return { admitted: false, codes: [], nominationAdmitted: false,
      detail: ['OUTPUT_NOT_AN_OBJECT'] };
  }
  const o = raw as Record<string, unknown>;
  const generic: string[] = [];

  for (const f of VERIFIER_FORBIDDEN_FIELDS) {
    if (f in o) generic.push(`FORBIDDEN_FIELD:${f}`);
  }
  if (o.verifierContractVersion !== EXPERT_VERIFIER_CONTRACT_V2_VERSION) {
    generic.push('CONTRACT_VERSION_MISMATCH');
  }
  if (o.analysisId !== input.analysisId) generic.push('ANALYSIS_ID_MISMATCH');
  if (typeof o.verdict !== 'string'
      || !(VERIFIER_VERDICTS as readonly string[]).includes(o.verdict)) {
    generic.push('INVALID_VERDICT');
  }
  if (blank(o.rationale)) generic.push('RATIONALE_MISSING');

  const isAdd = o.verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  const mode = o.clarificationSourceMode as ClarificationSourceMode | null | undefined;
  const nomination = o.nominatedFact as NominatedFact | null | undefined;
  const proposal = o.proposedClarification as Record<string, unknown> | null | undefined;

  // ---- v1's proposal rules, unchanged.
  if (isAdd) {
    if (typeof proposal !== 'object' || proposal === null) {
      generic.push('PROPOSAL_REQUIRED_FOR_THIS_VERDICT');
    } else {
      for (const f of ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap']) {
        if (blank(proposal[f])) generic.push(`PROPOSAL_FIELD_MISSING:${f}`);
      }
      if ('relatesToCandidateKey' in proposal) generic.push('PROPOSAL_MAY_NOT_DECLARE_LINKAGE');
    }
    if (mode === undefined || mode === null) {
      fail('SOURCE_MODE_MISSING_ON_A_CLARIFICATION',
        'ADD_OR_REPLACE must declare SUPPLIED_FACT or NOMINATED_FACT');
    }
  } else {
    if (proposal !== null && proposal !== undefined) {
      generic.push('PROPOSAL_NOT_PERMITTED_FOR_THIS_VERDICT');
    }
    if (nomination !== null && nomination !== undefined) {
      fail('NOMINATION_NOT_PERMITTED_FOR_THIS_VERDICT',
        `a ${String(o.verdict)} verdict may not carry a nominated fact`);
    }
    if (mode !== null && mode !== undefined) {
      fail('NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE',
        'a source mode is meaningless without a clarification');
    }
  }

  // ---- the ref rule, now MODE-DEPENDENT. This is the §156 defect, closed.
  const refs = new Set(input.suppliedFacts.map(f => f.ref));
  const about = o.aboutUnresolvedFactRef;
  if (mode === 'SUPPLIED_FACT') {
    if (typeof about !== 'string' || !refs.has(about)) {
      fail('SUPPLIED_MODE_MUST_NAME_A_SUPPLIED_FACT',
        `SUPPLIED_FACT mode must name one of ${refs.size} supplied refs; got ${String(about)}`);
    }
    if (nomination !== null && nomination !== undefined) {
      fail('NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE',
        'SUPPLIED_FACT mode may not carry a nomination');
    }
  } else if (mode === 'NOMINATED_FACT') {
    // In NOMINATED mode `aboutUnresolvedFactRef` is expected to be null: the whole point is that the
    // fact is not among the supplied ones. v1 rejected this case, and that rejection was the defect.
    if (typeof about === 'string' && about.length > 0 && !refs.has(about)) {
      detail.push(`note: nominated mode carried a non-supplied ref ${about}; permitted in v2`);
    }
    if (Array.isArray(nomination)) {
      fail('MORE_THAN_ONE_NOMINATION', 'a nomination is one object, never a list');
    } else if (typeof nomination !== 'object' || nomination === null) {
      fail('NOMINATION_REQUIRED_FOR_THIS_SOURCE_MODE',
        'NOMINATED_FACT mode must carry the nomination and its proof');
    } else {
      // ---- the admission rule proper.
      for (const f of ['missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
        'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow'] as const) {
        if (blank(nomination[f])) fail('NOMINATION_FIELD_MISSING', `nominatedFact.${f} is empty`);
      }
      // R1. NO INVENTED HAZARD. The span must be in the observation, byte for byte.
      if (!blank(nomination.observationSpan)
          && !input.observation.includes(nomination.observationSpan.trim())) {
        fail('OBSERVATION_SPAN_NOT_VERBATIM',
          `observationSpan is not a verbatim span of the observation: `
          + `${JSON.stringify(nomination.observationSpan.slice(0, 60))}`);
      }
      // R2. TWO PLAUSIBLE ANSWER STATES.
      if (!blank(nomination.branchA) && !blank(nomination.branchB)
          && norm(nomination.branchA) === norm(nomination.branchB)) {
        fail('BRANCHES_IDENTICAL', 'branchA and branchB state the same thing');
      }
      // R3. THE DIVERGENCE PROOF. Two answers that lead to the same action are not a clarification.
      if (!blank(nomination.decisionIfA) && !blank(nomination.decisionIfB)
          && norm(nomination.decisionIfA) === norm(nomination.decisionIfB)) {
        fail('DECISIONS_DO_NOT_DIVERGE',
          'the same thing is done under both branches, so the answer changes nothing');
      }
      // R4. EXACT DECISION IDENTIFIED.
      if (!(EXPERT_AFFECTED_DECISIONS as readonly string[])
        .includes(String(nomination.affectedDecision))) {
        fail('AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
          `${String(nomination.affectedDecision)} is not a frozen member`);
      }
      // R5. NOT A RESTATEMENT OF SOMETHING ALREADY SUPPLIED.
      for (const s of input.suppliedFacts) {
        const overlap = contentOverlap(String(nomination.missingFact), s.text);
        if (overlap >= DUPLICATE_OVERLAP_THRESHOLD) {
          fail('NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT',
            `overlap ${overlap.toFixed(2)} with supplied ${s.ref}`);
        }
      }
    }
  }

  const admitted = codes.length === 0 && generic.length === 0;
  return {
    admitted,
    codes,
    nominationAdmitted: admitted && mode === 'NOMINATED_FACT',
    detail: [...generic, ...detail],
  };
}

/**
 * What an accepted v2 verdict may affect. Identical to v1's answer, restated so the nomination
 * cannot quietly acquire reach: a nominated fact influences `decisionCriticalClarifications` and
 * nothing else.
 */
export function verifierV2Effect(verdict: ExpertVerifierVerdict, mode: ClarificationSourceMode | null): {
  clarificationsMayChange: boolean;
  candidatesMayChange: false;
  candidateStatesMayChange: false;
  citationsMayChange: false;
  deterministicMayChange: false;
  riskMayChange: false;
  correctiveActionsMayChange: false;
  insightsMayChange: false;
  disagreementsMayChange: false;
  affectedCollections: readonly ['decisionCriticalClarifications'] | readonly [];
} {
  const changes = verdict === 'ADD_OR_REPLACE_CLARIFICATION' && mode !== null;
  return {
    clarificationsMayChange: changes,
    candidatesMayChange: false,
    candidateStatesMayChange: false,
    citationsMayChange: false,
    deterministicMayChange: false,
    riskMayChange: false,
    correctiveActionsMayChange: false,
    insightsMayChange: false,
    disagreementsMayChange: false,
    affectedCollections: changes ? ['decisionCriticalClarifications'] as const : [] as const,
  };
}
