/**
 * §166 EXPERT HAZLENZ -- VERIFIER CONTRACT v3. CLOSED-SET BINDING + ADDITIVE NOMINATION.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * v1 and v2 are BYTE-UNCHANGED and remain the contracts §156-§163 were executed under. v3 is a new
 * prospective contract and rescores nothing.
 *
 * ==================== WHAT CHANGED, AND WHY EXACTLY THIS MUCH ====================
 *
 * §165 proved that v2 cannot express the manipulation §164's experiment tests. Three changes close
 * that and nothing else:
 *
 *   +  `bindingFactKey`            closed-set membership against the supplied keys, by string
 *                                  equality. No fuzzy match, no normalisation, no alternative
 *                                  spelling, no free-text target.
 *   +  `owedFactDeclarations[]`    one explicit line per supplied fact, covering the whole set.
 *   ~  source mode                 v2's two members are kept and one is added --
 *                                  `SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION` -- for the shape v2
 *                                  refused with `NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE`.
 *   -  `aboutUnresolvedFactRef`    superseded by `bindingFactKey`, which is the same idea checked
 *                                  against a closed set. Two fields meaning one thing is how a
 *                                  binding gets asserted in one place and denied in another.
 *
 * Every v2 deterministic nomination rule is carried over unchanged: verbatim observation span,
 * non-identical branches, diverging decisions, frozen affectedDecision, exactly one nomination,
 * no forbidden fields. `NOMINATED_FACT_DUPLICATES_A_SUPPLIED_FACT` is the one v2 rule DELIBERATELY
 * NOT carried over -- see `WHY_THE_v2_DUPLICATE_RULE_IS_GONE` below.
 *
 * ==================== WHAT THE ADMISSION RULE STILL CANNOT CHECK ====================
 *
 * The boundary is unchanged from v2 and is restated because v3 makes it easier to blur: this module
 * checks that a binding NAMES a key in the closed set. It cannot check that the bound question
 * actually ANSWERS that fact. A false binding is possible, it is a `REQUIRES_HUMAN_TRUTH` question,
 * and §164 answers it by human sampling of bound pairs rather than by a runtime matcher.
 *
 * Nothing in this file compares two strings for meaning. The only string comparisons are exact
 * equality (`bindingFactKey` against supplied keys) and substring containment (`observationSpan`
 * inside the observation) -- the same byte checks v2 and the first-pass quote binder already run.
 */

import {
  VERIFIER_VERDICTS, VERIFIER_FORBIDDEN_FIELDS, type ExpertVerifierVerdict,
} from './expert-verifier-contract';
import {
  type NominatedFact, EXPERT_AFFECTED_DECISIONS,
} from './expert-verifier-contract-v2';
import {
  type OwedFactDeclarationV3, type ClarificationSourceModeV3,
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3,
} from './expert-verifier-instruction-v3';

export const EXPERT_VERIFIER_CONTRACT_V3_VERSION = 'hazlenz.expert.verifier.v3' as const;

export { VERIFIER_VERDICTS, VERIFIER_FORBIDDEN_FIELDS, EXPERT_AFFECTED_DECISIONS };
export type { ExpertVerifierVerdict, NominatedFact, OwedFactDeclarationV3,
  ClarificationSourceModeV3 };

/**
 * v2 refused a nomination whose text overlapped a supplied fact's text by >= 0.8, because under v2
 * a nomination was the ONLY way to talk about a fact and a renamed supplied fact would have been
 * scored as a new one.
 *
 * v3 removes the motive: a supplied fact is addressed by BINDING to its key, so a nomination that
 * restates one is not a scoring problem but a plain mistake, and the honest check for it is
 * structural rather than lexical. The lexical threshold is dropped rather than tightened because a
 * content-overlap score IS a free-text semantic gate, and §160's FINDING 1 is why this programme
 * does not run one. The structural replacement is `NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY`
 * plus the §165 ledger's identity-only deduplication.
 */
export const WHY_THE_v2_DUPLICATE_RULE_IS_GONE: string =
  'v2 used a 0.8 content-overlap threshold to catch a renamed supplied fact. v3 addresses supplied '
  + 'facts by key, so the structural check replaces the lexical one. A lexical threshold is a '
  + 'free-text semantic gate and this contract does not run one.';

export const V3_ADMISSION_CODES = [
  // ---- binding
  'BINDING_KEY_MISSING_FOR_SUPPLIED_MODE',
  'BINDING_KEY_NOT_IN_SUPPLIED_SET',
  'BINDING_KEY_MALFORMED',
  'BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION',
  'BINDING_DECLARED_BY_A_NON_ADD_VERDICT',
  // ---- nomination
  'MORE_THAN_ONE_NOMINATION',
  'NOMINATION_REQUIRED_FOR_THIS_SOURCE_MODE',
  'NOMINATION_PRESENT_WITHOUT_A_NOMINATING_SOURCE_MODE',
  'NOMINATION_FIELD_MISSING',
  'OBSERVATION_SPAN_NOT_VERBATIM',
  'BRANCHES_IDENTICAL',
  'DECISIONS_DO_NOT_DIVERGE',
  'AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
  'NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY',
  // ---- source mode
  'SOURCE_MODE_MISSING_ON_A_CLARIFICATION',
  'SOURCE_MODE_NOT_A_MEMBER',
  'SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD',
  'SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION',
  // ---- owed-fact declarations
  'OWED_FACT_DECLARATIONS_MISSING',
  'OWED_FACT_DECLARATION_NOT_A_MEMBER',
  'OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED',
  'OWED_FACT_DECLARATION_DUPLICATED',
  'OWED_FACT_NOT_DECLARED',
  'MORE_THAN_ONE_FACT_DECLARED_BOUND',
  'BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY',
  'BOUND_DECLARATION_WITHOUT_A_CLARIFICATION',
  'CHALLENGE_WITHOUT_A_REASON',
  'CHALLENGE_REASON_WITHOUT_A_CHALLENGE',
  'CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT',
  // ---- shape
  'PROPOSAL_REQUIRED_FOR_THIS_VERDICT',
  'PROPOSAL_NOT_PERMITTED_FOR_THIS_VERDICT',
  'PROPOSAL_FIELD_MISSING',
  'MORE_THAN_ONE_PROPOSED_CLARIFICATION',
  'PROPOSAL_MAY_NOT_DECLARE_LINKAGE',
  'HUMAN_TRUTH_PROVENANCE_IN_RESPONSE',
  'FORBIDDEN_FIELD',
  'CONTRACT_VERSION_MISMATCH',
  'ANALYSIS_ID_MISMATCH',
  'INVALID_VERDICT',
  'RATIONALE_MISSING',
  'OUTPUT_NOT_AN_OBJECT',
] as const;
export type V3AdmissionCode = (typeof V3_ADMISSION_CODES)[number];

/** Which conditions this module actually decides. Recorded in code, as v2 does. */
export const V3_ADMISSION_RULE_CLASSIFICATION = {
  BINDING_KEY_IS_A_MEMBER_OF_THE_SUPPLIED_SET: 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY',
  BINDING_COVERS_ONLY_ITS_OWN_KEY: 'SAFE_DETERMINISTIC',
  EVERY_SUPPLIED_FACT_IS_DECLARED_EXACTLY_ONCE: 'SAFE_DETERMINISTIC',
  AT_MOST_ONE_NOMINATION: 'SAFE_DETERMINISTIC',
  NOMINATION_IS_ADDITIVE: 'SAFE_DETERMINISTIC_BY_CONSTRUCTION',
  NO_INVENTED_HAZARD: 'SAFE_DETERMINISTIC_VIA_VERBATIM_OBSERVATION_SPAN',
  TWO_PLAUSIBLE_ANSWER_STATES: 'SAFE_DETERMINISTIC',
  ANSWERS_PRODUCE_DIFFERENT_CURRENT_DECISIONS: 'SAFE_DETERMINISTIC',
  CHALLENGE_IS_A_REQUEST_NOT_A_SETTLEMENT: 'SAFE_DETERMINISTIC_BY_CONSTRUCTION',
  THE_BOUND_QUESTION_ACTUALLY_ANSWERS_THE_BOUND_FACT: 'REQUIRES_HUMAN_TRUTH',
  THE_CHALLENGE_IS_CORRECT: 'REQUIRES_HUMAN_TRUTH',
  THE_NOMINATED_FACT_IS_GENUINELY_DECISION_CRITICAL: 'REQUIRES_HUMAN_TRUTH',
} as const;

/**
 * Field names that would mean evaluation truth had leaked into a runtime response. Refused, because
 * a verifier that can echo a disposition can be steered by one.
 */
export const HUMAN_TRUTH_PROVENANCE_FIELDS = [
  'humanSemanticTarget', 'acceptableEquivalents', 'authoredClass', 'disposition',
  'expectedSelector', 'rowId', 'semanticOutcome', 'targetReached', 'excludeFromDenominators',
] as const;

export interface OwedFactDeclarationEntry {
  readonly factKey: string;
  readonly declaration: OwedFactDeclarationV3;
  readonly challengeReason: string | null;
}

export interface ExpertVerifierV3Output {
  readonly verifierContractVersion: typeof EXPERT_VERIFIER_CONTRACT_V3_VERSION;
  readonly analysisId: string;
  readonly verdict: ExpertVerifierVerdict;
  readonly rationale: string;
  readonly clarificationSourceMode: ClarificationSourceModeV3 | null;
  readonly proposedClarification: {
    readonly question: string;
    readonly whyItMatters: string;
    readonly affectedDecision: string;
    readonly evidenceGap: string;
  } | null;
  readonly bindingFactKey: string | null;
  readonly nominatedFact: NominatedFact | null;
  readonly owedFactDeclarations: readonly OwedFactDeclarationEntry[];
}

export interface V3AdmissionInput {
  readonly analysisId: string;
  /** The observation, verbatim, for the nomination span check. */
  readonly observation: string;
  /** The closed set. Only these keys may be bound or declared. */
  readonly suppliedOwedFactKeys: readonly string[];
}

export interface V3AdmissionResult {
  readonly admitted: boolean;
  readonly codes: readonly V3AdmissionCode[];
  readonly detail: readonly string[];
  /** Set when a binding was present and every deterministic condition held. */
  readonly bindingAdmitted: boolean;
  /** Set when a nomination was present and every deterministic condition held. */
  readonly nominationAdmitted: boolean;
  /** Keys the verifier asked HazLenz to arbitrate. A request; never a settlement. */
  readonly challengedFactKeys: readonly string[];
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;
/** A key must be a plain non-empty token. Deliberately narrow: keys are ours, not prose. */
const KEY_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/;

/**
 * The v3 boundary. Refuses the verdict WHOLE on any violation, exactly as v1 and v2 do.
 *
 * A partly-valid verdict is not a partly-correct one, and refusing it leaves every owed fact where
 * it was -- which is safe by construction and is why there is no partial-admission path.
 */
export function checkVerifierV3Output(
  raw: unknown, input: V3AdmissionInput,
): V3AdmissionResult {
  const codes: V3AdmissionCode[] = [];
  const detail: string[] = [];
  const fail = (c: V3AdmissionCode, why: string): void => { codes.push(c); detail.push(why); };
  const refuse = (): V3AdmissionResult => ({
    admitted: false, codes, detail, bindingAdmitted: false, nominationAdmitted: false,
    challengedFactKeys: [],
  });

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    fail('OUTPUT_NOT_AN_OBJECT', 'the verdict is not a JSON object');
    return refuse();
  }
  const o = raw as Record<string, unknown>;

  // ---- generic shape, unchanged from v1/v2.
  for (const f of VERIFIER_FORBIDDEN_FIELDS) {
    if (f in o) fail('FORBIDDEN_FIELD', `forbidden field present: ${f}`);
  }
  for (const f of HUMAN_TRUTH_PROVENANCE_FIELDS) {
    if (f in o) fail('HUMAN_TRUTH_PROVENANCE_IN_RESPONSE', `evaluation-truth field present: ${f}`);
  }
  if (o.verifierContractVersion !== EXPERT_VERIFIER_CONTRACT_V3_VERSION) {
    fail('CONTRACT_VERSION_MISMATCH', String(o.verifierContractVersion));
  }
  if (o.analysisId !== input.analysisId) {
    fail('ANALYSIS_ID_MISMATCH', String(o.analysisId));
  }
  if (typeof o.verdict !== 'string'
      || !(VERIFIER_VERDICTS as readonly string[]).includes(o.verdict)) {
    fail('INVALID_VERDICT', String(o.verdict));
  }
  if (blank(o.rationale)) fail('RATIONALE_MISSING', 'rationale is empty');

  const isAdd = o.verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  const mode = o.clarificationSourceMode as ClarificationSourceModeV3 | null | undefined;
  const nomination = o.nominatedFact as NominatedFact | null | undefined;
  const proposal = o.proposedClarification as unknown;
  const bindingKey = o.bindingFactKey;
  const supplied = new Set(input.suppliedOwedFactKeys);

  // ---- the proposal. Single question only, as in v1 and v2.
  if (Array.isArray(proposal)) {
    fail('MORE_THAN_ONE_PROPOSED_CLARIFICATION', 'a proposal is one object, never a list');
  } else if (isAdd) {
    if (typeof proposal !== 'object' || proposal === null) {
      fail('PROPOSAL_REQUIRED_FOR_THIS_VERDICT', 'ADD_OR_REPLACE must carry a clarification');
    } else {
      const p = proposal as Record<string, unknown>;
      for (const f of ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap']) {
        if (blank(p[f])) fail('PROPOSAL_FIELD_MISSING', `proposedClarification.${f} is empty`);
      }
      if ('relatesToCandidateKey' in p) {
        fail('PROPOSAL_MAY_NOT_DECLARE_LINKAGE', 'a clarification may not declare candidate linkage');
      }
      if (!blank(p.affectedDecision)
          && !(EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(String(p.affectedDecision))) {
        fail('AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
          `proposedClarification.affectedDecision ${String(p.affectedDecision)}`);
      }
    }
  } else if (proposal !== null && proposal !== undefined) {
    fail('PROPOSAL_NOT_PERMITTED_FOR_THIS_VERDICT',
      `a ${String(o.verdict)} verdict may not carry a clarification`);
  }

  // ---- the binding key. Closed-set membership by EXACT string equality, nothing else.
  const hasBinding = typeof bindingKey === 'string' && bindingKey.length > 0;
  if (bindingKey !== null && bindingKey !== undefined && typeof bindingKey !== 'string') {
    fail('BINDING_KEY_MALFORMED', `bindingFactKey is ${typeof bindingKey}, not a string or null`);
  } else if (hasBinding) {
    if (!isAdd) {
      fail('BINDING_DECLARED_BY_A_NON_ADD_VERDICT',
        `a ${String(o.verdict)} verdict may not bind a fact; only a supplied clarification can`);
    }
    if (!KEY_SHAPE.test(bindingKey)) {
      fail('BINDING_KEY_MALFORMED', `${JSON.stringify(bindingKey.slice(0, 48))} is not a key`);
    } else if (!supplied.has(bindingKey)) {
      // The whole point: no fuzzy match, no case folding, no nearest neighbour.
      fail('BINDING_KEY_NOT_IN_SUPPLIED_SET',
        `${JSON.stringify(bindingKey)} is not one of the ${supplied.size} supplied keys`);
    }
  }

  // ---- the source mode must AGREE with the payload rather than describe it independently.
  if (isAdd) {
    if (mode === undefined || mode === null) {
      fail('SOURCE_MODE_MISSING_ON_A_CLARIFICATION',
        'ADD_OR_REPLACE must declare its source mode');
    } else if (!(CLARIFICATION_SOURCE_MODES_V3 as readonly string[]).includes(mode)) {
      fail('SOURCE_MODE_NOT_A_MEMBER', String(mode));
    } else {
      const hasNomination = nomination !== null && nomination !== undefined;
      const expected: ClarificationSourceModeV3 | null =
        hasBinding && hasNomination ? 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION'
          : hasBinding ? 'SUPPLIED_FACT'
            : hasNomination ? 'NOMINATED_FACT' : null;
      if (expected === null) {
        fail('SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD',
          `mode ${mode} declared with neither a binding key nor a nomination`);
      } else if (expected !== mode) {
        fail('SOURCE_MODE_DISAGREES_WITH_THE_PAYLOAD',
          `mode ${mode} but the payload is ${expected}`);
      }
      if ((mode === 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION' || mode === 'NOMINATED_FACT')
          && !hasNomination) {
        fail('NOMINATION_REQUIRED_FOR_THIS_SOURCE_MODE', `${mode} must carry the nomination`);
      }
      if (mode === 'SUPPLIED_FACT' && hasNomination) {
        fail('NOMINATION_PRESENT_WITHOUT_A_NOMINATING_SOURCE_MODE',
          'declare SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION to carry both');
      }
      if ((mode === 'SUPPLIED_FACT' || mode === 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION')
          && !hasBinding) {
        fail('BINDING_KEY_MISSING_FOR_SUPPLIED_MODE', `${mode} must name a supplied factKey`);
      }
    }
  } else {
    if (mode !== null && mode !== undefined) {
      fail('SOURCE_MODE_PRESENT_WITHOUT_A_CLARIFICATION',
        'a source mode is meaningless without a clarification');
    }
    if (hasBinding) {
      fail('BINDING_KEY_PRESENT_WITHOUT_A_CLARIFICATION',
        'nothing can bind a fact except a supplied clarification');
    }
  }

  // ---- the nomination. Every v2 deterministic rule, carried over.
  if (Array.isArray(nomination)) {
    fail('MORE_THAN_ONE_NOMINATION', 'a nomination is one object, never a list');
  } else if (nomination !== null && nomination !== undefined) {
    if (!isAdd) {
      fail('NOMINATION_PRESENT_WITHOUT_A_NOMINATING_SOURCE_MODE',
        `a ${String(o.verdict)} verdict may not carry a nomination`);
    }
    if (typeof nomination !== 'object') {
      fail('NOMINATION_FIELD_MISSING', 'nominatedFact is not an object');
    } else {
      const n = nomination as unknown as Record<string, unknown>;
      for (const f of ['missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
        'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow'] as const) {
        if (blank(n[f])) fail('NOMINATION_FIELD_MISSING', `nominatedFact.${f} is empty`);
      }
      if (!blank(n.observationSpan)
          && !input.observation.includes(String(n.observationSpan).trim())) {
        fail('OBSERVATION_SPAN_NOT_VERBATIM',
          `observationSpan is not a verbatim span: `
          + `${JSON.stringify(String(n.observationSpan).slice(0, 60))}`);
      }
      if (!blank(n.branchA) && !blank(n.branchB)
          && String(n.branchA).trim() === String(n.branchB).trim()) {
        fail('BRANCHES_IDENTICAL', 'branchA and branchB state the same thing');
      }
      if (!blank(n.decisionIfA) && !blank(n.decisionIfB)
          && String(n.decisionIfA).trim() === String(n.decisionIfB).trim()) {
        fail('DECISIONS_DO_NOT_DIVERGE',
          'the same thing is done under both branches, so the answer changes nothing');
      }
      if (!(EXPERT_AFFECTED_DECISIONS as readonly string[])
        .includes(String(n.affectedDecision))) {
        fail('AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
          `nominatedFact.affectedDecision ${String(n.affectedDecision)}`);
      }
      // The structural replacement for v2's lexical duplicate rule. A nomination that reuses a
      // supplied key is a rename of a supplied fact, and renaming is how a gap disappears.
      if (typeof n.missingFact === 'string' && supplied.has(n.missingFact.trim())) {
        fail('NOMINATION_MUST_NOT_REUSE_A_SUPPLIED_FACT_KEY',
          `${JSON.stringify(n.missingFact)} is a supplied key; bind to it instead of nominating it`);
      }
    }
  }

  // ---- the owed-fact declarations. Exactly one line per supplied fact, and no others.
  const declarations = o.owedFactDeclarations;
  const challenged: string[] = [];
  let boundDeclarations = 0;
  if (!Array.isArray(declarations)) {
    fail('OWED_FACT_DECLARATIONS_MISSING',
      'owedFactDeclarations must be an array with one entry per supplied fact');
  } else {
    const seen = new Set<string>();
    for (const entry of declarations) {
      if (typeof entry !== 'object' || entry === null) {
        fail('OWED_FACT_DECLARATION_NOT_A_MEMBER', 'a declaration entry is not an object');
        continue;
      }
      const e = entry as Record<string, unknown>;
      const key = e.factKey;
      if (typeof key !== 'string' || !KEY_SHAPE.test(key)) {
        fail('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED', `malformed factKey ${String(key)}`);
        continue;
      }
      if (!supplied.has(key)) {
        fail('OWED_FACT_DECLARATION_KEY_NOT_SUPPLIED',
          `${JSON.stringify(key)} was not supplied with this request`);
        continue;
      }
      if (seen.has(key)) {
        fail('OWED_FACT_DECLARATION_DUPLICATED', `${key} declared more than once`);
        continue;
      }
      seen.add(key);
      const d = e.declaration;
      if (typeof d !== 'string' || !(OWED_FACT_DECLARATIONS_V3 as readonly string[]).includes(d)) {
        fail('OWED_FACT_DECLARATION_NOT_A_MEMBER', `${key}: ${String(d)}`);
        continue;
      }
      const reason = e.challengeReason;
      if (d === 'CHALLENGE_FACT_VALIDITY') {
        if (blank(reason)) {
          fail('CHALLENGE_WITHOUT_A_REASON', `${key} was challenged with no reason`);
        } else {
          challenged.push(key);
        }
      } else if (!blank(reason)) {
        fail('CHALLENGE_REASON_WITHOUT_A_CHALLENGE',
          `${key} declared ${d} but carried a challenge reason`);
      }
      // A challenge may not smuggle a settlement in alongside it.
      for (const forbidden of ['settled', 'resolved', 'covered', 'rejected', 'notDecisionCritical',
        'factNotDecisionCritical']) {
        if (forbidden in e) {
          fail('CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT',
            `${key}: a declaration may not carry '${forbidden}'; HazLenz owns every transition`);
        }
      }
      if (d === 'BOUND_BY_CLARIFICATION') {
        boundDeclarations += 1;
        if (!isAdd) {
          fail('BOUND_DECLARATION_WITHOUT_A_CLARIFICATION',
            `${key} declared BOUND_BY_CLARIFICATION under a ${String(o.verdict)} verdict`);
        }
        if (!hasBinding || key !== bindingKey) {
          fail('BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY',
            `${key} declared bound but bindingFactKey is ${String(bindingKey)}`);
        }
      }
    }
    for (const key of input.suppliedOwedFactKeys) {
      if (!seen.has(key)) {
        fail('OWED_FACT_NOT_DECLARED', `${key} received no declaration; every key must appear once`);
      }
    }
    if (boundDeclarations > 1) {
      fail('MORE_THAN_ONE_FACT_DECLARED_BOUND',
        `${boundDeclarations} facts declared bound; one clarification binds one fact`);
    }
    if (hasBinding && boundDeclarations === 0 && supplied.has(String(bindingKey))) {
      fail('BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY',
        `bindingFactKey ${String(bindingKey)} was not declared BOUND_BY_CLARIFICATION`);
    }
  }

  const admitted = codes.length === 0;
  return {
    admitted,
    codes,
    detail,
    bindingAdmitted: admitted && hasBinding,
    nominationAdmitted: admitted && nomination !== null && nomination !== undefined,
    challengedFactKeys: admitted ? challenged : [],
  };
}

/**
 * What an accepted v3 verdict may affect. Identical to v1's and v2's answer, restated so that the
 * two new fields cannot quietly acquire reach: a binding and a nomination both influence
 * `decisionCriticalClarifications` and the owed-fact ledger's coverage accounting, and nothing else.
 *
 * Note what is NOT here: a challenge affects NO collection. It produces an arbitration request that
 * a human resolves, and until then the fact's status is unchanged.
 */
export function verifierV3Effect(verdict: ExpertVerifierVerdict, hasBinding: boolean): {
  clarificationsMayChange: boolean;
  owedFactCoverageMayChange: boolean;
  candidatesMayChange: false;
  candidateStatesMayChange: false;
  citationsMayChange: false;
  deterministicMayChange: false;
  riskMayChange: false;
  correctiveActionsMayChange: false;
  insightsMayChange: false;
  disagreementsMayChange: false;
  challengeMaySettleAFact: false;
} {
  const isAdd = verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  return {
    clarificationsMayChange: isAdd,
    owedFactCoverageMayChange: isAdd && hasBinding,
    candidatesMayChange: false,
    candidateStatesMayChange: false,
    citationsMayChange: false,
    deterministicMayChange: false,
    riskMayChange: false,
    correctiveActionsMayChange: false,
    insightsMayChange: false,
    disagreementsMayChange: false,
    challengeMaySettleAFact: false,
  };
}

// ------------------------------------------------------------------ bridge to the §165 ledger

export interface ArbitrationRequest {
  readonly factKey: string;
  readonly requestedBy: 'VERIFIER_V3';
  readonly reason: string;
  /** Stated in the type so no caller can read this as a decision. */
  readonly settles: false;
  readonly factStatusUnchanged: true;
}

export interface V3BridgeResult {
  /** Ready for `checkBindingDeclarations` from `expert-owed-fact-binding.ts`. */
  readonly declarations: Array<{
    declarationId: string;
    bindingMode: 'BOUND_TO_OWED_FACT' | 'NOMINATED_NEW';
    coversFactKey: string | null;
    nomination: null | {
      factKey: string; affectedDecision: string; evidenceSpan: string; whyUnresolved: string;
      branchA: string; branchB: string; decisionIfA: string; decisionIfB: string; priority: string;
    };
    question: string;
    affectedDecision: string;
  }>;
  readonly arbitrationRequests: readonly ArbitrationRequest[];
  /** Keys the verifier explicitly left open. Reported so silence is legible, never inferred. */
  readonly stillUnresolvedFactKeys: readonly string[];
}

/**
 * Translate an ADMITTED v3 verdict into the §165 architecture's inputs.
 *
 * Two properties this function has BY CONSTRUCTION rather than by check:
 *
 *   - a binding and a nomination become TWO SEPARATE declarations, so the §165 binding contract
 *     admits each on its own merits and the nomination is added while the binding covers exactly
 *     one key. There is no code path here that removes anything.
 *   - a challenge becomes an `ArbitrationRequest` with `settles: false` typed as a literal, and is
 *     NOT a declaration. It cannot reach `applyAdmittedDeclarations` and therefore cannot move a
 *     fact's status. HazLenz owns the transition, through `transition(…, RECORDED_ARBITRATION)`.
 *
 * `nominatedPriority` is supplied by HazLenz, not by the model: priority governs the question budget
 * and a model-chosen priority would let the provider promote its own nomination past a
 * deterministic life-critical gap.
 */
export function bridgeV3OutputToLedgerInputs(
  output: ExpertVerifierV3Output,
  admission: V3AdmissionResult,
  opts: { analysisId: string; nominatedPriority?: 'LIFE_CRITICAL' | 'REQUIRED_CONTROL' | 'OTHER' },
): V3BridgeResult {
  if (!admission.admitted) {
    return { declarations: [], arbitrationRequests: [], stillUnresolvedFactKeys: [] };
  }
  const declarations: V3BridgeResult['declarations'] = [];
  const question = output.proposedClarification?.question ?? '';
  const affectedDecision = output.proposedClarification?.affectedDecision ?? 'REQUIRED_CONTROL';

  if (output.bindingFactKey) {
    declarations.push({
      declarationId: `${opts.analysisId}:bind`,
      bindingMode: 'BOUND_TO_OWED_FACT',
      coversFactKey: output.bindingFactKey,
      nomination: null,
      question,
      affectedDecision,
    });
  }
  if (output.nominatedFact) {
    const n = output.nominatedFact;
    declarations.push({
      declarationId: `${opts.analysisId}:nominate`,
      bindingMode: 'NOMINATED_NEW',
      coversFactKey: null,
      nomination: {
        factKey: `nominated:${opts.analysisId}`,
        affectedDecision: n.affectedDecision,
        evidenceSpan: n.observationSpan,
        whyUnresolved: n.notEstablishedBecause,
        branchA: n.branchA,
        branchB: n.branchB,
        decisionIfA: n.decisionIfA,
        decisionIfB: n.decisionIfB,
        priority: opts.nominatedPriority ?? 'OTHER',
      },
      question: output.bindingFactKey ? n.missingFact : question,
      affectedDecision: n.affectedDecision,
    });
  }

  const arbitrationRequests: ArbitrationRequest[] = output.owedFactDeclarations
    .filter(d => d.declaration === 'CHALLENGE_FACT_VALIDITY')
    .map(d => ({
      factKey: d.factKey,
      requestedBy: 'VERIFIER_V3' as const,
      reason: String(d.challengeReason ?? ''),
      settles: false as const,
      factStatusUnchanged: true as const,
    }));

  return {
    declarations,
    arbitrationRequests,
    stillUnresolvedFactKeys: output.owedFactDeclarations
      .filter(d => d.declaration !== 'BOUND_BY_CLARIFICATION')
      .map(d => d.factKey),
  };
}
