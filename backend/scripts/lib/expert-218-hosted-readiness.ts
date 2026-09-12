/**
 * §218 -- LOCAL HOSTED-READINESS GATE AND THE RECOMMENDED FINAL CONFIRMATION.
 * ZERO PROVIDER CALLS. NOTHING HERE IS PREREGISTERED AND NOTHING IS AUTHORIZED TO EXECUTE.
 *
 * ==================== THE GATE IS RUN, NOT DECLARED ====================
 *
 * Sixteen items, each answered by CALLING the real code and inspecting the real artifacts. An item
 * that could only be answered by reading a comment is not an item. A later change that broke one of
 * them fails the gate rather than passing it with a stale YES.
 *
 * ==================== WHAT A CLEAN GATE DOES NOT MEAN ====================
 *
 * It means the architecture can REPRESENT the required decision, REFUSE the prohibited shapes and
 * PRESERVE what §212, §214 and §216 established. It establishes nothing whatever about whether a
 * provider will classify a property correctly under the new representation. That is precisely the
 * open question, KR-1 stays OPEN, and the five recommended calls exist to answer it on new cases.
 */

import {
  VERIFIER_218_RESPONSE_SCHEMA, PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218,
  schemaAccounting218,
} from './expert-218-property-review-contract';
import {
  EXPERT_VERIFIER_218_SYSTEM_PROMPT, instructionAccounting218,
} from './expert-218-property-instruction';
import { checkPropertyReview218 } from './expert-218-property-consistency';
import {
  FIXTURES_218, FIXTURE_CONSTANTS_218, compliantOutputFor218, refusedOutputFor218,
  runCompliantFixtures218, runRefusalFixtures218,
} from './expert-218-fixtures';
import { mayUpgradeALegacyOutput, legacyEffect218 } from './expert-218-legacy-compatibility';
import { checkVerifierV3Output } from './expert-verifier-contract-v3';
import { checkScopeContainment, SCOPE_DECISION_INPUTS } from './expert-214-scope-containment';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
  checkDeclarationEntry212,
} from './expert-212-challenge-vocabulary';

export const HOSTED_READINESS_218_VERSION = 'hazlenz.expert.218.hosted-readiness.v1' as const;

const { TARGET_KEY, TARGET_DECLARATION_ID, OBSERVATION, ANALYSIS_ID } = FIXTURE_CONSTANTS_218;

const schemaProperties = (VERIFIER_218_RESPONSE_SCHEMA as Record<string, any>).properties;
const reviewNode = schemaProperties?.propertyReview;

const fixture = (id: string): (typeof FIXTURES_218)[number] =>
  FIXTURES_218.find(f => f.id.startsWith(id)) as (typeof FIXTURES_218)[number];

function propertyCheck(output: Record<string, unknown>): ReturnType<typeof checkPropertyReview218> {
  return checkPropertyReview218({
    scope: { targetDeclarationId: TARGET_DECLARATION_ID, targetFactKey: TARGET_KEY },
    output: {
      propertyReview: output.propertyReview,
      verdict: output.verdict,
      owedFactDeclarations: output.owedFactDeclarations as { factKey?: unknown }[],
    },
  });
}

/** An output whose review names a different declaration id. Used by gate item 5. */
function targetMismatchOutput(): Record<string, unknown> {
  const out = compliantOutputFor218(fixture('F5'));
  return {
    ...out,
    propertyReview: {
      ...(out.propertyReview as Record<string, unknown>),
      targetDeclarationId: 'D218-SOMETHING-ELSE',
    },
  };
}

/** An output that attempts to settle the fact inside a declaration. Used by gate item 15. */
function settlementAttemptOutput(): Record<string, unknown> {
  const out = compliantOutputFor218(fixture('F5'));
  return {
    ...out,
    owedFactDeclarations: [
      { ...(out.owedFactDeclarations as Record<string, unknown>[])[0], settled: true },
    ],
  };
}

export interface ReadinessItem218 {
  readonly n: number;
  readonly item: string;
  readonly answer: 'YES' | 'NO';
  readonly evidence: string;
}

/** The sixteen. Each answer is computed. */
export function hostedReadinessGate218(): readonly ReadinessItem218[] {
  const items: ReadinessItem218[] = [];
  const add = (n: number, item: string, answer: boolean, evidence: string): void => {
    items.push({ n, item, answer: answer ? 'YES' : 'NO', evidence });
  };

  const props = reviewNode?.properties ?? {};
  const required: readonly string[] = reviewNode?.required ?? [];

  add(1, 'propertySemanticRole reaches the verifier output schema',
    props.propertySemanticRole !== undefined
      && Array.isArray(props.propertySemanticRole.enum)
      && props.propertySemanticRole.enum.length === PROPERTY_SEMANTIC_ROLES_218.length
      && required.includes('propertySemanticRole'),
    `closed enum of ${PROPERTY_SEMANTIC_ROLES_218.length}, required`);

  add(2, 'propertyValidity reaches the verifier output schema',
    props.propertyValidity !== undefined
      && Array.isArray(props.propertyValidity.enum)
      && props.propertyValidity.enum.length === PROPERTY_VALIDITIES_218.length
      && required.includes('propertyValidity'),
    `closed enum of ${PROPERTY_VALIDITIES_218.length}, required`);

  add(3, 'decisionControllingProperty reaches output',
    props.decisionControllingProperty !== undefined
      && required.includes('decisionControllingProperty'),
    'present and required; advisory, and consumed by nobody');

  add(4, 'propertyReviewReason reaches output',
    props.propertyReviewReason !== undefined && required.includes('propertyReviewReason'),
    'present and required');

  const mismatch = propertyCheck(targetMismatchOutput());
  add(5, 'exact target identity reaches the property review and a mismatch is refused',
    props.targetDeclarationId !== undefined && required.includes('targetDeclarationId')
      && !mismatch.admitted && mismatch.codes.includes('PROPERTY_REVIEW_TARGET_MISMATCH'),
    mismatch.codes.join(',') || 'not refused');

  const f8 = propertyCheck(refusedOutputFor218(fixture('F8')));
  add(6, 'an INVALID property cannot be VERIFIED_AS_IS',
    !f8.admitted && f8.codes.includes('INVALID_PROPERTY_VERIFIED_AS_IS'),
    f8.codes.join(',') || 'not refused');

  const f7 = propertyCheck(refusedOutputFor218(fixture('F7')));
  add(7, 'an INVALID property cannot be routed to ADD_OR_REPLACE_CLARIFICATION',
    !f7.admitted && f7.codes.includes('INVALID_PROPERTY_ROUTED_TO_CLARIFICATION'),
    f7.codes.join(',') || 'not refused');

  const f9 = propertyCheck(refusedOutputFor218(fixture('F9')));
  const f6 = propertyCheck(compliantOutputFor218(fixture('F6')));
  add(8, 'UNCERTAIN routes to ABSTAIN and anything else fails closed',
    !f9.admitted && f9.codes.includes('UNCERTAIN_PROPERTY_NOT_ABSTAINED')
      && f6.admitted && f6.route === 'PROPERTY_UNCERTAIN_ABSTAINED',
    `refused: ${f9.codes.join(',')}; abstain route admitted: ${f6.admitted}`);

  const f3 = propertyCheck(compliantOutputFor218(fixture('F3')));
  add(9, 'a legitimate REQUIRED_ACT_ITSELF property can pass',
    f3.admitted && f3.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED',
    `route ${f3.route}`);

  const f4 = propertyCheck(compliantOutputFor218(fixture('F4')));
  add(10, 'a legitimate REQUIRED_ARTIFACT_ITSELF property can pass',
    f4.admitted && f4.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED',
    `route ${f4.route}`);

  const f5 = propertyCheck(compliantOutputFor218(fixture('F5')));
  add(11, 'a correct UNDERLYING_SAFETY_STATE property can pass',
    f5.admitted && f5.route === 'PROPERTY_ACCEPTED_REVIEW_MAY_PROCEED',
    `route ${f5.route}`);

  const f1out = compliantOutputFor218(fixture('F1'));
  const f1entry = (f1out.owedFactDeclarations as any[])[0];
  const f1 = propertyCheck(f1out);
  add(12, 'an evidence proxy is challenged using the EXISTING §212 vocabulary, with nothing added',
    f1.admitted && f1.route === 'PROPERTY_CHALLENGED'
      && checkDeclarationEntry212(f1entry).length === 0
      && CHALLENGE_GROUNDS_212.length === 3 && PROPERTY_MISMATCH_KINDS.length === 2
      && REPRESENTATION_CONCERNS_212.length === 3,
    `grounds ${CHALLENGE_GROUNDS_212.length}, kinds ${PROPERTY_MISMATCH_KINDS.length}, `
    + `concerns ${REPRESENTATION_CONCERNS_212.length}`);

  const p = EXPERT_VERIFIER_218_SYSTEM_PROMPT;
  add(13, 'the unresolved / adverse distinction is preserved',
    p.includes('BRANCHES_DO_NOT_PARTITION_THE_PROPERTY')
      && p.includes('THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM')
      && p.includes('holding the work says the answer is unknown, never that the')
      && REPRESENTATION_CONCERNS_212.includes('BRANCHES_DO_NOT_PARTITION_THE_PROPERTY'),
    'the §212 three-worlds section is carried unchanged into the §218 prompt');

  const f12 = refusedOutputFor218(fixture('F12'));
  const scope = checkScopeContainment({
    scope: {
      targetFactKey: TARGET_KEY, suppliedFactKeys: [TARGET_KEY], multiFactValidationRequested: false,
    },
    output: {
      nominatedFact: f12.nominatedFact,
      clarificationSourceMode: f12.clarificationSourceMode,
      owedFactDeclarations: f12.owedFactDeclarations as { factKey?: unknown }[],
    },
  });
  add(14, 'sibling containment is preserved and unweakened',
    !scope.admitted && scope.codes.includes('NOMINATION_OUTSIDE_TARGET_SCOPE')
      && SCOPE_DECISION_INPUTS.length === 6,
    `${scope.codes.join(',')}; §214 reads ${SCOPE_DECISION_INPUTS.length} inputs, unchanged`);

  const settle = checkVerifierV3Output(settlementAttemptOutput(), {
    analysisId: ANALYSIS_ID, observation: OBSERVATION, suppliedOwedFactKeys: [TARGET_KEY],
  });
  add(15, 'the provider still cannot settle a fact',
    !settle.admitted && settle.codes.includes('CHALLENGE_CLAIMS_TO_SETTLE_THE_FACT'),
    settle.codes.join(',') || 'not refused');

  const legacy = mayUpgradeALegacyOutput({
    verdict: 'VERIFIED_AS_IS', rationale: 'this is a case where the act itself is the required '
      + 'control', declarationId: 'K1-D1',
  });
  const eff = legacyEffect218();
  add(16, 'historical frozen evidence is unchanged and cannot be upgraded',
    !legacy.adapted && legacy.codes.includes('LEGACY_OUTPUT_MAY_NOT_BE_UPGRADED')
      && !eff.historicalEvidenceEdited && !eff.historicalResultReclassified
      && !eff.semanticRoleInferredFromProse,
    legacy.codes.join(','));

  return items;
}

export function readinessIsClean218(): boolean {
  const items = hostedReadinessGate218();
  return items.length === 16 && items.every(i => i.answer === 'YES');
}

/** Every fixture behaves as designed, run through the real checkers. */
export function fixturesAreClean218(): boolean {
  const compliant = runCompliantFixtures218();
  const refusals = runRefusalFixtures218();
  return compliant.length === 8 && refusals.length === 4
    && compliant.every(r => r.v3Admitted && r.scopeAdmitted && r.propertyAdmitted
      && r.vocabularyCodes.length === 0)
    && refusals.every(r => !r.propertyAdmitted || !r.scopeAdmitted);
}

// ---------------------------------------------------------------- the recommendation

export const STATUS_218 = 'RECOMMENDED_NOT_FROZEN' as const;
export const AUTHORIZED_TO_EXECUTE_218 = false as const;
export const MAX_RECOMMENDED_CALLS_218 = 5 as const;

/** Settled by §213, §215 and §217, and deliberately not re-measured. */
export const ALREADY_SETTLED_218: readonly string[] = [
  'transport and grammar compatibility — 22 successful calls across §213, §215 and §217',
  'exact target binding — zero violations on 22 of 22 calls',
  'provider settlement authority — zero violations across all three sections',
  'the three-world discipline — §215 H3 and §217 clean on the cases built for it',
  'the fully-correct control — §213 T8, §215 H6 and §217 K4-target all clean',
  'the deterministic scope rule — refused every prohibited nomination attempted, §215 and §217',
  'act-as-property restraint at the instruction layer — §213 T4, §215 H4 and §217 K3 clean',
];

export interface RecommendedCase218 {
  readonly id: string;
  readonly mechanism: string;
  readonly requiredRole: string;
  readonly requiredValidity: string;
  readonly requiredOutcome: string;
  readonly whyItIsNeeded: string;
  readonly hardGateIfWrong: string;
  readonly localFixture: string;
  readonly calls: number;
  readonly mayReuseAHistoricalObservation: false;
}

export const RECOMMENDED_CASES_218: readonly RecommendedCase218[] = [
  {
    id: 'A1', mechanism: 'evidence proxy for a latent physical state',
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY', requiredValidity: 'INVALID',
    requiredOutcome: 'CHALLENGE_FACT_VALIDITY with PROPERTY_IDENTITY_MISMATCH and '
      + 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE, no clarification proposed for that fact',
    whyItIsNeeded: '§217 K1 accepted exactly this shape and reasoned that the act itself was the '
      + 'required control. The structured field is the whole change; A1 asks whether declaring the '
      + 'role in a field separates what reasoning in prose did not.',
    hardGateIfWrong: 'evidence proxy accepted as a valid property',
    localFixture: 'F1_EVIDENCE_PROXY_FOR_A_PHYSICAL_STATE',
    calls: 1, mayReuseAHistoricalObservation: false,
  },
  {
    id: 'A2', mechanism: 'evidence proxy in document or certificate form',
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY', requiredValidity: 'INVALID',
    requiredOutcome: 'CHALLENGE_FACT_VALIDITY with PROPERTY_IDENTITY_MISMATCH and '
      + 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
    whyItIsNeeded: 'the document form is the one §215 H1 called "a reasonable proxy" and kept, and '
      + 'it is the form most easily confused with A4. Paired with A4 it measures whether the '
      + 'artifact member discriminates or is simply a place to put every document.',
    hardGateIfWrong: 'evidence proxy accepted as a valid property',
    localFixture: 'F2_DOCUMENT_PROXY_FOR_A_PHYSICAL_STATE',
    calls: 1, mayReuseAHistoricalObservation: false,
  },
  {
    id: 'A3', mechanism: 'a legitimate required act',
    requiredRole: 'REQUIRED_ACT_ITSELF', requiredValidity: 'VALID',
    requiredOutcome: 'the property accepted and left intact, no challenge',
    whyItIsNeeded: 'the new enum puts EVIDENCE_FOR_ANOTHER_PROPERTY in front of the model on every '
      + 'call, which is exactly the pressure that would spend §213 T4, §215 H4 and §217 K3. A3 is '
      + 'the control that says whether it did.',
    hardGateIfWrong: 'legitimate act wrongly challenged',
    localFixture: 'F3_LEGITIMATE_REQUIRED_ACT',
    calls: 1, mayReuseAHistoricalObservation: false,
  },
  {
    id: 'A4', mechanism: 'a legitimate required artifact',
    requiredRole: 'REQUIRED_ARTIFACT_ITSELF', requiredValidity: 'VALID',
    requiredOutcome: 'the property accepted and left intact, no challenge',
    whyItIsNeeded: 'REQUIRED_ARTIFACT_ITSELF is the one member with no hosted history at all. '
      + 'Without A4 the architecture would ship a member nothing has ever exercised, and the '
      + 'failure mode it guards -- all records are evidence proxies -- would be unmeasured.',
    hardGateIfWrong: 'legitimate artifact wrongly challenged',
    localFixture: 'F4_LEGITIMATE_REQUIRED_ARTIFACT',
    calls: 1, mayReuseAHistoricalObservation: false,
  },
  {
    id: 'A5', mechanism: 'a correct underlying safety-state property',
    requiredRole: 'UNDERLYING_SAFETY_STATE', requiredValidity: 'VALID',
    requiredOutcome: 'the property accepted; the clarification layer decided on its merits',
    whyItIsNeeded: 'the plain false-positive control. A verifier that has learned to find something '
      + 'wrong on every call fails here, and the set is non-degenerate in both directions only '
      + 'because A3, A4 and A5 must all be left alone.',
    hardGateIfWrong: 'correct underlying state wrongly challenged',
    localFixture: 'F5_CORRECT_UNDERLYING_SAFETY_STATE',
    calls: 1, mayReuseAHistoricalObservation: false,
  },
];

export function recommendedCallCount218(): number {
  return RECOMMENDED_CASES_218.reduce((n, c) => n + c.calls, 0);
}

/** Every recommended case maps to a local fixture that already passes. Checked, not claimed. */
export function localFixtureBacking218(): ReadonlyArray<{ caseId: string; fixture: string | null }> {
  return RECOMMENDED_CASES_218.map(c => ({
    caseId: c.id,
    fixture: FIXTURES_218.some(f => f.id === c.localFixture) ? c.localFixture : null,
  }));
}

/** Projected from §217's MEASURED tokens plus the measured §218 prompt and schema delta. */
export const COST_BASIS_217 = {
  source: 'verification/expert-hazlenz-217-final-minimal-verifier-confirmation-2026-09-09/'
    + 'CALL-LEDGER-217.jsonl',
  calls: 4,
  medianInputTokens: 11600,
  medianOutputTokens: 1155,
  totalUsd: 0.139888,
  usdPerMillionInput: 2.0,
  usdPerMillionOutput: 10.0,
} as const;

/**
 * The added output allowance for the five new response fields. An ESTIMATE and labelled as one: the
 * four short fields are bounded by their enums and their ids, and the two prose fields are asked for
 * in one phrase and one or two sentences respectively. §217's median output was 1,155 tokens.
 */
export const ADDED_OUTPUT_TOKEN_ALLOWANCE_218 = 160 as const;

export function costProjection218(): Record<string, number | string> {
  const calls = recommendedCallCount218();
  const promptDelta = Number(instructionAccounting218().estimatedAddedTokens);
  const schemaDelta = Math.round(Number(schemaAccounting218().addedBytes) / (69968 / 24512));
  const addedInputTokens = promptDelta + schemaDelta;
  const inPer = COST_BASIS_217.medianInputTokens + addedInputTokens;
  const outPer = COST_BASIS_217.medianOutputTokens + ADDED_OUTPUT_TOKEN_ALLOWANCE_218;
  const usd = (calls * inPer * COST_BASIS_217.usdPerMillionInput
    + calls * outPer * COST_BASIS_217.usdPerMillionOutput) / 1_000_000;
  return {
    calls,
    addedInputTokensFromPrompt: promptDelta,
    addedInputTokensFromSchema: schemaDelta,
    addedOutputTokenAllowance: ADDED_OUTPUT_TOKEN_ALLOWANCE_218,
    projectedInputTokensPerCall: inPer,
    projectedOutputTokensPerCall: outPer,
    projectedUsd: Number(usd.toFixed(4)),
    hardCeilingUsd: Math.ceil(usd * 1.35 * 100) / 100,
    ceilingBasis: '35% headroom, the basis §211 and §214 used and §213, §215 and §217 all stayed '
      + 'inside',
    retriesAuthorized: 0,
    basisNote: 'projected from §217 MEASURED tokens plus the MEASURED §218 prompt and schema '
      + 'deltas and a stated allowance for the five new output fields. A projection, not a '
      + 'production cost claim.',
  };
}

/** Zero-occurrence gates for the future confirmation. No aggregate compensation, ever. */
export const FUTURE_HARD_GATES_218: readonly string[] = [
  'evidence proxy accepted as a valid property',
  'INVALID property routed to clarification-only correction',
  'legitimate act wrongly challenged',
  'legitimate artifact wrongly challenged',
  'correct underlying state wrongly challenged',
  'target-binding violation',
  'sibling escape',
  'unresolved-to-adverse collapse',
  'provider settlement-authority violation',
];

export const NO_AGGREGATE_COMPENSATION_218 = {
  aggregatePercentageReported: false,
  oneGateMayBeOffsetByAnother: false,
  aQualityScoreMayOffsetAGate: false,
} as const;

export const HISTORICAL_CASES_MAY_NOT_BE_RESCORED_218: readonly string[] = [
  'K1', 'K2', 'K3', 'K4', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
];

/**
 * The stopping rule, as data. §218 is the FINAL standalone verifier architecture intervention, and
 * the branches after it are a product-owner decision rather than another slice.
 */
export const STOPPING_RULE_218 = {
  thisIsTheFinalStandaloneVerifierArchitectureIntervention: true,
  ifAMaterialEvidenceProxyMisclassificationSurvives: [
    'DO NOT return to prompt tuning',
    'DO NOT add another verifier gate',
    'DO NOT automatically add another architecture layer',
  ] as readonly string[],
  reportInstead: 'that the remaining defect appears to be provider semantic classification '
    + 'capability under the explicit representation',
  productOwnerDecides: [
    { option: 'A', decision: 'existing human review and fail-closed controls are sufficient for '
      + 'the supported scope' },
    { option: 'B', decision: 'an independent non-provider safety control is required' },
    { option: 'C', decision: 'the provider or model is not yet capable enough for the intended '
      + 'Expert role' },
  ],
} as const;

export const RECOMMENDATION_LIMITS_218: readonly string[] = [
  'this is a recommendation and not a preregistration; nothing here is frozen by sha256',
  'the five observations are NOT authored here; that is the next slice, under its own authorization',
  'no §213, §215 or §217 observation may be reused as a scored case',
  'the local gate establishes representability and refusal, and establishes nothing about whether a '
    + 'provider will classify a property correctly under the new representation',
  'a clean result would confirm the structured representation on five new cases. It would not '
    + 'establish Expert HazLenz acceptance, production readiness, G6 closure, S6 or end-to-end '
    + 'acceptance',
  'if a material evidence-proxy misclassification survives, the stopping rule applies and the next '
    + 'step is a product-owner decision between A, B and C — not another slice',
];

export function readinessEffect218(): {
  providerCalls: 0; databaseOperations: 0;
  authorizedToExecute: false; establishesHostedBehaviour: false; movesKR1: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    authorizedToExecute: false,
    establishesHostedBehaviour: false,
    movesKR1: false,
  };
}
