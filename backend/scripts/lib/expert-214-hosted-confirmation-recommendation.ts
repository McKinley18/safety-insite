/**
 * §214 -- RECOMMENDED MINIMAL HOSTED CONFIRMATION. A RECOMMENDATION, NOT A FROZEN INSTRUMENT.
 * ZERO PROVIDER CALLS. NOTHING HERE IS PREREGISTERED AND NOTHING HERE IS AUTHORIZED TO EXECUTE.
 *
 * §214 was told not to build another ten-case cohort and to recommend the smallest confirmation
 * capable of resolving the remaining uncertainty. This is that recommendation: SIX case shapes,
 * seven calls, with the observations still to be authored. Freezing it is the next slice's job and a
 * separate authorization; §211's discipline applies -- a preregistration is frozen by sha256 before
 * the first call, and the shapes below are not that.
 *
 * ==================== WHAT IS ACTUALLY UNCERTAIN ====================
 *
 * §213 settled a great deal. Transport, grammar compatibility, structural admission, target binding,
 * settlement containment, the act-as-property control and the fully-correct control are all
 * exercised and clean, and re-measuring them buys nothing. What is NOT settled is exactly three
 * things, and the shapes below exist only for those, plus the two controls that must accompany any
 * change of this kind.
 */

import { PROTECTED_CONTROLS } from './expert-214-controls-and-fixtures';

export const HOSTED_CONFIRMATION_RECOMMENDATION_214_VERSION =
  'hazlenz.expert.214.hosted-confirmation-recommendation.v1' as const;

export const STATUS = 'RECOMMENDED_NOT_FROZEN' as const;
export const AUTHORIZED_TO_EXECUTE = false as const;

/** Settled by §213 and deliberately not re-measured. */
export const ALREADY_SETTLED_BY_213: readonly string[] = [
  'transport and provider compatibility with the successor grammar at 6,094 bytes',
  'structural admission — 11/11 admitted with zero codes',
  'target binding — zero foreign keys on eleven calls',
  'settlement containment — zero authority violations',
  'V3 act-as-property, V7 decisionWhileUnresolved, V8 adjacent drift, V10 challenge reviewability',
];

export interface RecommendedCase {
  readonly id: string;
  readonly shape: string;
  readonly residual: 'R-V1' | 'R-V2' | 'R-V3' | 'CONTROL';
  readonly whyItIsNeeded: string;
  readonly hardFailureIfWrong: string;
  readonly calls: number;
  /** Whether this shape may reuse a §213 observation. Never, for a scored case. */
  readonly mayReuseA213Observation: false;
}

export const RECOMMENDED_CASES: readonly RecommendedCase[] = [
  {
    id: 'H1', shape: 'evidence-proxy latent state — a test standing in for a physical condition',
    residual: 'R-V1',
    whyItIsNeeded: '§213 T1 accepted the proxy and its rationale shows the perfect-knowledge '
      + 'phrasing was misread. R-V1 replaced that phrasing, and only a hosted call shows whether '
      + 'the role test reads correctly.',
    hardFailureIfWrong: 'HF-1', calls: 1, mayReuseA213Observation: false,
  },
  {
    id: 'H2', shape: 'absent-record latent state — a certificate standing in for a physical state',
    residual: 'R-V1',
    whyItIsNeeded: '§213 T2 is the harder half: the verifier there reasoned that the required '
      + 'verification act WAS the property. H1 and H2 differ in whether the artifact is a test or a '
      + 'document, which is the distinction §213 shows the verifier handling differently.',
    hardFailureIfWrong: 'HF-1', calls: 1, mayReuseA213Observation: false,
  },
  {
    id: 'H3', shape: 'insufficient evidence against adverse truth — branchB absorbing "unproven"',
    residual: 'R-V2',
    whyItIsNeeded: '§213 T10 verified as-is a branchB that sends a sound workplace to the adverse '
      + 'side. R-V2 names the phrases and adds the counterfactual; this measures whether it fires.',
    hardFailureIfWrong: 'HF-4', calls: 1, mayReuseA213Observation: false,
  },
  {
    id: 'H4', shape: 'legitimate act-as-property — the mandatory anti-overcorrection control',
    residual: 'CONTROL',
    whyItIsNeeded: 'R-V1 and R-V2 both create pressure toward challenging anything shaped like a '
      + 'test or an absence. §213 T4 was clean and this is the case that proves the remediation did '
      + 'not spend it. Non-negotiable.',
    hardFailureIfWrong: 'act-as-property overcorrection', calls: 1, mayReuseA213Observation: false,
  },
  {
    id: 'H5', shape: 'multi-fact row — sibling containment with two independent facts',
    residual: 'R-V3',
    whyItIsNeeded: '§213 T6 bound correctly and nominated the sibling anyway. R-V3 has an '
      + 'instruction half and a deterministic half; the deterministic half is proved locally, and '
      + 'this measures whether the instruction half keeps the structured answer on the target.',
    hardFailureIfWrong: 'structured sibling nomination outside target', calls: 2,
    mayReuseA213Observation: false,
  },
  {
    id: 'H6', shape: 'fully correct declaration — the false-positive control',
    residual: 'CONTROL',
    whyItIsNeeded: 'without it a verifier that challenges everything passes H1, H2 and H3 and looks '
      + 'repaired. §213 T8 was clean and the same risk applies to every case here.',
    hardFailureIfWrong: 'fully correct declaration disturbed', calls: 1,
    mayReuseA213Observation: false,
  },
];

/** §213 cases keep their evidence value locally and may never be scored again. */
export const SECTION_213_CASES_MAY_NOT_BE_RESCORED: readonly string[] =
  ['T1', 'T2', 'T4', 'T6', 'T8', 'T10'];
export const SECTION_213_CASES_REMAIN_LOCAL_REGRESSION_FIXTURES = true as const;

/** The zero-occurrence gates a future confirmation must meet. No aggregate compensation. */
export const SUCCESS_CRITERIA: readonly { criterion: string; threshold: 'ZERO_OCCURRENCE' }[] = [
  { criterion: 'HF-1 evidence proxy accepted as the property', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'HF-4 insufficient evidence became adverse truth', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'structured sibling nomination outside target', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'act-as-property overcorrection', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'fully correct declaration disturbed', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'authority violations', threshold: 'ZERO_OCCURRENCE' },
  { criterion: 'target-binding violations', threshold: 'ZERO_OCCURRENCE' },
];

export const NO_AGGREGATE_COMPENSATION = {
  aggregatePercentageReported: false,
  oneClassMayBeOffsetByAnother: false,
} as const;

export function recommendedCallCount(): number {
  return RECOMMENDED_CASES.reduce((n, c) => n + c.calls, 0);
}

/**
 * Cost, projected from §213's MEASURED verifier leg rather than from §211's estimate, because §213
 * is now the better basis: 11 calls, 115,316 input and 12,879 output tokens, USD 0.3594 at USD 2.00
 * per million input and USD 10.00 per million output.
 */
export const COST_BASIS_213 = {
  source: 'verification/expert-hazlenz-213-targeted-verifier-validation-2026-09-09/'
    + 'CALL-LEDGER-213.jsonl',
  calls: 11,
  medianInputTokens: 10461,
  medianOutputTokens: 1050,
  totalUsd: 0.3594,
  usdPerMillionInput: 2.0,
  usdPerMillionOutput: 10.0,
} as const;

export function costProjection214(): Record<string, number | string> {
  const calls = recommendedCallCount();
  // The §214 block is a little longer than §212's; the delta is added rather than assumed away.
  const addedInputTokens = 250;
  const inPer = COST_BASIS_213.medianInputTokens + addedInputTokens;
  const outPer = COST_BASIS_213.medianOutputTokens;
  const usd = (calls * inPer * COST_BASIS_213.usdPerMillionInput
    + calls * outPer * COST_BASIS_213.usdPerMillionOutput) / 1_000_000;
  return {
    calls,
    projectedInputTokensPerCall: inPer,
    projectedOutputTokensPerCall: outPer,
    projectedUsd: Number(usd.toFixed(4)),
    recommendedCeilingUsd: Math.ceil(usd * 1.35 * 100) / 100,
    ceilingBasis: '35% headroom, the same basis §211 used and §213 stayed inside',
    retriesAuthorized: 0,
    comparedToSection213: `${calls} calls against §213's 11 — the settled axes are not re-measured`,
    basisNote: 'projected from §213 MEASURED tokens, not from an estimate. Still a projection, and '
      + 'not a production cost claim.',
  };
}

/** Every protected control has a hosted case, or the recommendation is incomplete. */
export function controlsWithAHostedCase(): readonly string[] {
  return PROTECTED_CONTROLS
    .filter(c => ['C1', 'C2'].includes(c.id))
    .map(c => c.id);
}

export const RECOMMENDATION_LIMITS: readonly string[] = [
  'this is a recommendation and not a preregistration; nothing here is frozen by sha256',
  'the six observations are NOT authored here. Authoring them, freezing them and computing a '
    + 'digest is the next slice, under its own authorization.',
  'no §213 observation may be reused as a scored confirmation case',
  'a clean result would confirm the three residuals on new cases; it would not establish Expert '
    + 'HazLenz acceptance, production readiness, G6 closure, S6 or end-to-end acceptance',
];
