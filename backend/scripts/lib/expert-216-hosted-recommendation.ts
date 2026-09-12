/**
 * §216 -- RECOMMENDED FINAL MINIMAL CONFIRMATION. A RECOMMENDATION, NOT A FROZEN INSTRUMENT.
 * ZERO PROVIDER CALLS. NOTHING HERE IS PREREGISTERED AND NOTHING IS AUTHORIZED TO EXECUTE.
 *
 * Four cases, four calls. The observations are deliberately NOT authored here: authoring them,
 * freezing them and computing a digest is the next slice under its own authorization, exactly as
 * §215 Phase A did.
 *
 * ==================== WHY FOUR AND NOT FIVE ====================
 *
 * §216 permits a fifth fully-correct case ONLY if K1-K4 cannot non-degenerately test restraint.
 * They can, twice over: K3 is an act-as-property case that must be LEFT ALONE, and both K4 targets
 * must be left alone. A verifier that challenges everything fails three of the four calls. So a
 * fifth case would buy a control the set already has, and it is not recommended.
 */

import { FIXTURES_216 } from './expert-216-fixtures';

export const HOSTED_RECOMMENDATION_216_VERSION =
  'hazlenz.expert.216.hosted-recommendation.v1' as const;

export const STATUS = 'RECOMMENDED_NOT_FROZEN' as const;
export const AUTHORIZED_TO_EXECUTE = false as const;
export const MAX_RECOMMENDED_CALLS = 4 as const;

/** Settled by §213 and §215, and deliberately not re-measured. */
export const ALREADY_SETTLED: readonly string[] = [
  'transport and grammar compatibility — 18 successful calls across §213 and §215',
  'exact target binding — zero violations on 18 of 18 calls',
  'provider settlement authority — zero violations',
  'the three-world discipline — §215 H3 clean on the case built for it',
  'the fully-correct control — §213 T8 and §215 H6 both clean',
  'the deterministic scope rule — refused four of four prohibited nominations in §215',
];

export interface RecommendedCase216 {
  readonly id: string;
  readonly mechanism: string;
  readonly residual: 'R-V5' | 'R-V4' | 'CONTROL' | 'R-V3';
  readonly whyItIsNeeded: string;
  readonly requiredOutcome: string;
  readonly hardGateIfWrong: string;
  readonly calls: number;
  readonly mayReuseASection215Observation: false;
}

export const RECOMMENDED_CASES_216: readonly RecommendedCase216[] = [
  {
    id: 'K1', mechanism: 'evidence proxy for a latent physical state',
    residual: 'R-V5',
    whyItIsNeeded: '§215 H1 called its proxy "a reasonable proxy" and kept it. R-V5 added the '
      + 'settlement half of the property test and the statement that a good proxy is still a proxy. '
      + 'Only a hosted call shows whether that standard reads.',
    requiredOutcome: 'CHALLENGE_FACT_VALIDITY with PROPERTY_IDENTITY_MISMATCH and '
      + 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE, and no clarification proposed for that fact',
    hardGateIfWrong: 'evidence proxy accepted', calls: 1, mayReuseASection215Observation: false,
  },
  {
    id: 'K2', mechanism: 'a wrong property beside a tempting better clarification',
    residual: 'R-V4',
    whyItIsNeeded: 'the disposition-routing defect isolated to one variable. §215 H2 identified the '
      + 'mismatch in prose and still routed through a clarification. K2 supplies a question good '
      + 'enough that a clarification-first reading sees nothing wrong, so only the ordered ladder '
      + 'gets it right. This is the local F1 fixture, hosted.',
    requiredOutcome: 'CHALLENGE at ladder step 1, and NOT a clarification replacement',
    hardGateIfWrong: 'property-invalid case routed as a clarification-only correction',
    calls: 1, mayReuseASection215Observation: false,
  },
  {
    id: 'K3', mechanism: 'a legitimate act-as-property',
    residual: 'CONTROL',
    whyItIsNeeded: 'R-V5 pushes toward challenging anything built around a test or a record, and '
      + 'R-V4 makes challenging the first thing the verifier considers. Both create pressure this '
      + 'case exists to resist. §213 T4 and §215 H4 were clean and that must not be spent.',
    requiredOutcome: 'the act-shaped property left intact, no challenge',
    hardGateIfWrong: 'legitimate act-as-property challenged', calls: 1,
    mayReuseASection215Observation: false,
  },
  {
    id: 'K4', mechanism: 'two independent facts on one observation',
    residual: 'R-V3',
    whyItIsNeeded: '§215 nominated the sibling on both H5 calls. The deterministic rule refused '
      + 'them, which is why it is not weakened; what is being measured is whether the tightened '
      + 'scope paragraph stops the attempt being made. One call, one target, with the sibling '
      + 'present and tempting.',
    requiredOutcome: 'the target declared alone, the sibling named in reasoning as outside scope, '
      + 'no structured nomination',
    hardGateIfWrong: 'structured sibling nomination', calls: 1,
    mayReuseASection215Observation: false,
  },
];

/**
 * The fifth-case analysis §216 requires before adding one. Answered here rather than assumed.
 */
export const FIFTH_CASE_ANALYSIS = {
  question: 'can K1-K4 non-degenerately test restraint without a fully correct fifth case',
  answer: 'YES',
  because: 'K3 must be left alone and K4\'s target must be left alone, so two of the four calls '
    + 'fail under a challenge-everything strategy. A verifier that challenges indiscriminately '
    + 'scores 2 of 4, which the gates already catch.',
  fifthCaseRecommended: false,
} as const;

export const SECTION_215_CASES_MAY_NOT_BE_RESCORED: readonly string[] =
  ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

/** The zero-occurrence gates a future confirmation must meet. No aggregate compensation. */
export const FUTURE_HARD_GATES: readonly string[] = [
  'evidence proxy accepted',
  'property-invalid case routed as a clarification-only correction',
  'structured sibling nomination',
  'legitimate act-as-property challenged',
  'target-binding failure',
  'unresolved evidence converted to adverse truth',
  'authority violation',
];

export const NO_AGGREGATE_COMPENSATION_216 = {
  aggregatePercentageReported: false,
  oneGateMayBeOffsetByAnother: false,
} as const;

/** Projected from §215's MEASURED tokens, plus the §216 block delta. */
export const COST_BASIS_215 = {
  source: 'verification/expert-hazlenz-215-minimal-verifier-confirmation-2026-09-09/'
    + 'CALL-LEDGER-215.jsonl',
  calls: 7,
  medianInputTokens: 11307,
  medianOutputTokens: 1635,
  totalUsd: 0.2587,
  usdPerMillionInput: 2.0,
  usdPerMillionOutput: 10.0,
} as const;

export function recommendedCallCount216(): number {
  return RECOMMENDED_CASES_216.reduce((n, c) => n + c.calls, 0);
}

export function costProjection216(): Record<string, number | string> {
  const calls = recommendedCallCount216();
  const addedInputTokens = 245;
  const inPer = COST_BASIS_215.medianInputTokens + addedInputTokens;
  const outPer = COST_BASIS_215.medianOutputTokens;
  const usd = (calls * inPer * COST_BASIS_215.usdPerMillionInput
    + calls * outPer * COST_BASIS_215.usdPerMillionOutput) / 1_000_000;
  return {
    calls,
    projectedInputTokensPerCall: inPer,
    projectedOutputTokensPerCall: outPer,
    projectedUsd: Number(usd.toFixed(4)),
    recommendedCeilingUsd: Math.ceil(usd * 1.35 * 100) / 100,
    ceilingBasis: '35% headroom, the basis §211 and §214 used and §213 and §215 both stayed inside',
    retriesAuthorized: 0,
    basisNote: 'projected from §215 MEASURED tokens plus the measured §216 block delta. A '
      + 'projection, not a production cost claim.',
  };
}

/** Every recommended case maps to a local fixture that already passes. */
export function localFixtureBacking(): ReadonlyArray<{ caseId: string; fixture: string | null }> {
  return [
    { caseId: 'K1', fixture: 'F4_PROXY_DESCRIBED_AS_REASONABLE' },
    { caseId: 'K2', fixture: 'F1_WRONG_PROPERTY_GOOD_CLARIFICATION' },
    { caseId: 'K3', fixture: 'F5_ACT_IS_THE_PROPERTY' },
    { caseId: 'K4', fixture: 'F6_TWO_FACT_ROW_SIBLING_IN_REASONING' },
  ].map(r => ({
    caseId: r.caseId,
    fixture: FIXTURES_216.some(f => f.id === r.fixture) ? r.fixture : null,
  }));
}

export const RECOMMENDATION_LIMITS_216: readonly string[] = [
  'this is a recommendation and not a preregistration; nothing here is frozen by sha256',
  'the four observations are NOT authored here; that is the next slice, under its own authorization',
  'no §215 observation may be reused as a scored case',
  'a clean result would confirm the two residuals on new cases. It would not establish Expert '
    + 'HazLenz acceptance, production readiness, G6 closure, S6 or end-to-end acceptance.',
  'if a material property-identity failure survives, the process stopping rule applies: no further '
    + 'prompt remediation, and an architecture review instead',
];
