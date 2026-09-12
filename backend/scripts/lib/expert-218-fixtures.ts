/**
 * §218 -- LOCAL FIXTURES AND NEGATIVE CONTROLS FOR THE STRUCTURED PROPERTY REVIEW.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Twelve fixtures. Each one is RUN through the real checkers -- v3 admission, the §212 vocabulary
 * rule, the §214 scope rule and the §218 consistency layer -- so every claim in this file is a
 * measurement rather than a description, and a later contract change that broke one would fail here.
 *
 * They establish NOTHING about hosted behaviour. KR-1 stays OPEN, and no §213, §215 or §217 result
 * is reclassified, rescored or upgraded.
 *
 * ==================== WHY F11 IS THE INSTRUMENT ====================
 *
 * F11 pairs a WRONG property with an EXCELLENT question about the right underlying condition. It is
 * the §217 K2 shape and the §215 H2 shape: a verifier reasoning from the question sees a good
 * question and moves on, or improves it. Under §218 the property is declared before the question is
 * reached, and an INVALID property with a clarification route is refused by deterministic code
 * rather than talked out of. The good clarification must not rescue the bad property, and F11 is
 * where that is proved.
 *
 * ==================== WHY F3 AND F4 EXIST IN THE SAME SET ====================
 *
 * Every remediation in this programme that taught the verifier to distrust evidence risked taking
 * the legitimate act and artifact cases with it, and §212, §214 and §216 each carried a guard for
 * exactly that. F3 and F4 are that guard made mechanical: a strategy that challenges everything
 * fails them, and `challengeEverythingScore` runs it and shows the failure.
 */

import { checkVerifierV3Output } from './expert-verifier-contract-v3';
import { type DeclarationEntry212, checkDeclarationEntry212 } from './expert-212-challenge-vocabulary';
import { checkScopeContainment } from './expert-214-scope-containment';
import {
  type PropertySemanticRole218, type PropertyValidity218,
} from './expert-218-property-review-contract';
import {
  type PropertyReviewCode218, checkPropertyReview218,
} from './expert-218-property-consistency';

export const FIXTURES_218_VERSION = 'hazlenz.expert.218.fixtures.v1' as const;

export type RequiredOutcome218 =
  | 'CHALLENGE_PROPERTY_IDENTITY'
  | 'ACCEPT_AND_VERIFY'
  | 'ACCEPT_AND_REPLACE_THE_QUESTION'
  | 'ABSTAIN_FAIL_CLOSED'
  | 'DETERMINISTICALLY_REFUSED';

export interface Fixture218 {
  readonly id: string;
  readonly shape: string;
  /** The property the first pass named. Design material, authored here. */
  readonly proposedProperty: string;
  /** The question bound to it. */
  readonly boundClarification: string;
  /** Whether that question would settle the property that actually controls the decision. */
  readonly clarificationSettlesTheControllingProperty: boolean;
  readonly requiredRole: PropertySemanticRole218;
  readonly requiredValidity: PropertyValidity218;
  readonly requiredOutcome: RequiredOutcome218;
  /** For the four refusal fixtures: the code the deterministic layer must produce. */
  readonly requiredRefusalCode: PropertyReviewCode218 | 'NOMINATION_OUTSIDE_TARGET_SCOPE' | null;
  readonly why: string;
  /** A claim the verifier must NOT make about this case. Unresolved is never adverse. */
  readonly mustNotAssert: string | null;
}

const f = (x: Fixture218): Fixture218 => x;

export const FIXTURES_218: readonly Fixture218[] = [
  f({
    id: 'F1_EVIDENCE_PROXY_FOR_A_PHYSICAL_STATE',
    shape: 'a test standing in for the latent physical condition it would reveal',
    proposedProperty: 'whether the ultrasonic thickness survey on the ammonia receiver shell was '
      + 'carried out at the due date',
    boundClarification: 'When was the last thickness survey on the receiver, and was it signed off?',
    clarificationSettlesTheControllingProperty: false,
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    requiredValidity: 'INVALID',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY',
    requiredRefusalCode: null,
    why: 'the shell has the wall thickness it has. The survey is how anyone finds out, and taking '
      + 'the survey out of the scenario leaves the shell independently sound or independently thin. '
      + 'That is the counterfactual, and it decides the role without reading a single word for '
      + 'vocabulary.',
    mustNotAssert: 'the receiver shell is below minimum thickness',
  }),
  f({
    id: 'F2_DOCUMENT_PROXY_FOR_A_PHYSICAL_STATE',
    shape: 'a certificate standing in for the condition it certifies',
    proposedProperty: 'whether a current LOLER thorough examination certificate is held for the '
      + 'gantry hoist',
    boundClarification: 'Is the thorough examination certificate for the hoist on file and in date?',
    clarificationSettlesTheControllingProperty: false,
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    requiredValidity: 'INVALID',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY',
    requiredRefusalCode: null,
    why: 'THE PAIR TO F4, AND THE REASON BOTH ARE IN THE SET. The certificate is a record of a '
      + 'finding about the hoist. The hoist is fit to lift or it is not, whichever way the folder '
      + 'went. Read alone this could teach that certificates are always proxies, which is why F4 '
      + 'sits beside it.',
    mustNotAssert: 'the hoist is unfit to lift',
  }),
  f({
    id: 'F3_LEGITIMATE_REQUIRED_ACT',
    shape: 'performing the act is itself the requirement',
    proposedProperty: 'whether the point-of-work briefing on the buried services was given to the '
      + 'excavation crew before the dig started',
    boundClarification: 'Was the buried-services briefing given to the crew before the dig started?',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'REQUIRED_ACT_ITSELF',
    requiredValidity: 'VALID',
    requiredOutcome: 'ACCEPT_AND_VERIFY',
    requiredRefusalCode: null,
    why: 'THE ACT CONTROL. Knowing the briefing was given DOES answer the safety question, because '
      + 'giving it is the requirement and there is no separate condition underneath. §217 K3 is '
      + 'this shape and was clean; §218 must not spend it.',
    mustNotAssert: null,
  }),
  f({
    id: 'F4_LEGITIMATE_REQUIRED_ARTIFACT',
    shape: 'the artifact itself is the substantive requirement',
    proposedProperty: 'whether a confined-space entry permit was raised and is in force for the '
      + 'digester before anyone enters',
    boundClarification: 'Is an entry permit in force for the digester for this shift?',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'REQUIRED_ARTIFACT_ITSELF',
    requiredValidity: 'VALID',
    requiredOutcome: 'ACCEPT_AND_VERIFY',
    requiredRefusalCode: null,
    why: 'THE ARTIFACT CONTROL, AND THE ANSWER TO "ALL RECORDS ARE PROXIES". The permit is not a '
      + 'record of a finding about the digester; the governed process requires the permit to exist '
      + 'and be in force before entry, and an entry without one is the unsafe act itself. Pair it '
      + 'with F2 and the difference is the ROLE, not the fact that both are documents.',
    mustNotAssert: null,
  }),
  f({
    id: 'F5_CORRECT_UNDERLYING_SAFETY_STATE',
    shape: 'the property is the physical condition the decision turns on',
    proposedProperty: 'whether the temporary edge protection on the third-floor slab withstands the '
      + 'design load without deflecting past its limit',
    boundClarification: 'What does the edge protection do under the design load at the slab edge?',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'UNDERLYING_SAFETY_STATE',
    requiredValidity: 'VALID',
    requiredOutcome: 'ACCEPT_AND_VERIFY',
    requiredRefusalCode: null,
    why: 'the false-positive control for the whole set. Nothing here is a test, a record or an act, '
      + 'and a verifier that finds a defect is inventing one.',
    mustNotAssert: null,
  }),
  f({
    id: 'F6_AMBIGUOUS_SEMANTIC_ROLE',
    shape: 'the supplied property cannot responsibly be placed',
    proposedProperty: 'whether the tank farm arrangement is adequate',
    boundClarification: 'Is the tank farm arrangement adequate?',
    clarificationSettlesTheControllingProperty: false,
    requiredRole: 'AMBIGUOUS_OR_UNRESOLVED',
    requiredValidity: 'UNCERTAIN',
    requiredOutcome: 'ABSTAIN_FAIL_CLOSED',
    requiredRefusalCode: null,
    why: '"adequate" names no condition, no act and no artifact, and nothing supplied says which of '
      + 'them is meant -- bunding capacity, separation distance, or a completed design review. The '
      + 'right answer is to say so and abstain. Guessing a role here is exactly the failure the '
      + 'ambiguous member exists to prevent.',
    mustNotAssert: 'the tank farm arrangement is inadequate',
  }),
  f({
    id: 'F7_INVALID_PLUS_CLARIFICATION_REPLACEMENT',
    shape: 'the property is declared INVALID and a clarification is proposed for it anyway',
    proposedProperty: '(any) — this fixture is about the OUTPUT shape rather than the case',
    boundClarification: '(any)',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    requiredValidity: 'INVALID',
    requiredOutcome: 'DETERMINISTICALLY_REFUSED',
    requiredRefusalCode: 'INVALID_PROPERTY_ROUTED_TO_CLARIFICATION',
    why: 'the §215 H1/H2 and §217 K2 route, closed in code. §216 showed that once the ground is '
      + 'DECLARED every such route is already refused; what was missing was the declaration. The '
      + 'structured field supplies it, so the refusal now fires on the case that used to escape.',
    mustNotAssert: null,
  }),
  f({
    id: 'F8_INVALID_PLUS_VERIFIED_AS_IS',
    shape: 'the property is declared INVALID and the answer verifies the first pass anyway',
    proposedProperty: '(any) — this fixture is about the OUTPUT shape rather than the case',
    boundClarification: '(any)',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    requiredValidity: 'INVALID',
    requiredOutcome: 'DETERMINISTICALLY_REFUSED',
    requiredRefusalCode: 'INVALID_PROPERTY_VERIFIED_AS_IS',
    why: 'the §217 K1 shape. §216 refused to add this rule because a challenge addresses the fact '
      + 'and a verdict addresses the clarification layer. With propertyValidity explicit the two '
      + 'statements are about the same proposition and cannot both hold. The reversal is recorded '
      + 'in SUPERSEDED_REFUSALS_216 rather than made quietly.',
    mustNotAssert: null,
  }),
  f({
    id: 'F9_UNCERTAIN_PLUS_CLARIFICATION_REPLACEMENT',
    shape: 'the property could not be placed and a replacement question is proposed anyway',
    proposedProperty: '(any) — this fixture is about the OUTPUT shape rather than the case',
    boundClarification: '(any)',
    clarificationSettlesTheControllingProperty: false,
    requiredRole: 'AMBIGUOUS_OR_UNRESOLVED',
    requiredValidity: 'UNCERTAIN',
    requiredOutcome: 'DETERMINISTICALLY_REFUSED',
    requiredRefusalCode: 'UNCERTAIN_PROPERTY_NOT_ABSTAINED',
    why: 'proposing a better question about a property you could not place asserts more than you '
      + 'know and reads, downstream, as an accepted property with a tidier question. UNCERTAIN '
      + 'routes fail closed to ABSTAIN and the fact stays open.',
    mustNotAssert: null,
  }),
  f({
    id: 'F10_CORRECT_PROPERTY_INADEQUATE_QUESTION',
    shape: 'the property controls the decision; the question cannot settle it',
    proposedProperty: 'whether the local exhaust ventilation at the welding bay draws fume away '
      + 'from the operator\'s breathing zone',
    boundClarification: 'Is there an extraction arm fitted at the welding bay?',
    clarificationSettlesTheControllingProperty: false,
    requiredRole: 'UNDERLYING_SAFETY_STATE',
    requiredValidity: 'VALID',
    requiredOutcome: 'ACCEPT_AND_REPLACE_THE_QUESTION',
    requiredRefusalCode: null,
    why: 'the clarification route must stay OPEN for accepted properties, or §218 would have '
      + 'replaced one defect with another. Presence of an arm is already visible and answering it '
      + 'changes nothing; the property is right and the question is not.',
    mustNotAssert: 'the extraction fails to clear the breathing zone',
  }),
  f({
    id: 'F11_EVIDENCE_PROXY_WITH_AN_EXCELLENT_QUESTION',
    shape: 'a wrong property beside a question that would settle the right condition',
    proposedProperty: 'whether the weekly free-chlorine check on the hydrotherapy pool was carried '
      + 'out and recorded',
    boundClarification: 'What is the free chlorine reading at the pool now, against the range the '
      + 'pool must be held in?',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    requiredValidity: 'INVALID',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY',
    requiredRefusalCode: null,
    why: 'THE INSTRUMENT. The question is excellent and would settle whether the water is in range. '
      + 'The property is still the wrong object. A verifier working from the question sees nothing '
      + 'to fix, which is the §215 H2 and §217 K2 route exactly. §218 decides the property in a '
      + 'field before the question is reached, and a good clarification cannot rescue a wrong '
      + 'property because the route to one is refused.',
    mustNotAssert: 'the pool water is out of range',
  }),
  f({
    id: 'F12_TWO_FACT_OBSERVATION_TARGET_ONLY',
    shape: 'two independent facts; the property review belongs to the target alone',
    proposedProperty: 'whether the mezzanine guardrail left short after the racking move still '
      + 'stops a person falling to the floor below',
    boundClarification: 'What stops a fall at the open end of the mezzanine as it stands now?',
    clarificationSettlesTheControllingProperty: true,
    requiredRole: 'UNDERLYING_SAFETY_STATE',
    requiredValidity: 'VALID',
    requiredOutcome: 'DETERMINISTICALLY_REFUSED',
    requiredRefusalCode: 'NOMINATION_OUTSIDE_TARGET_SCOPE',
    why: 'the same observation also leaves the sprinkler clearance open and it is genuinely '
      + 'unresolved. It may be named in reasoning as outside the scope of this review. It may not '
      + 'become a structured nomination, and decisionControllingProperty is not a second route to '
      + 'the same thing: the field is checked to name THIS target and is consumed by nobody. §217 '
      + 'HF4 attempted the nomination and the §214 rule refused it; this fixture pins that the new '
      + 'block did not open a way round it.',
    mustNotAssert: 'the mezzanine edge is unprotected',
  }),
];

// ---------------------------------------------------------------- running the real checkers

const TARGET_KEY = 'FP:target';
const TARGET_DECLARATION_ID = 'D218-T1';
const OBSERVATION = 'the observation text used by the §218 fixture harness';
const ANALYSIS_ID = 'AN218';

const PROPOSAL = {
  question: 'q', whyItMatters: 'w', affectedDecision: 'REQUIRED_CONTROL', evidenceGap: 'g',
};
const SIBLING_NOMINATION = {
  factKey: 'FP:sibling', missingFact: 'the sprinkler clearance over the new racking',
  observationSpan: OBSERVATION, notEstablishedBecause: 'nothing supplied says what the clearance is',
  affectedDecision: 'REQUIRED_CONTROL', branchA: 'clearance is held', decisionIfA: 'work continues',
  branchB: 'clearance is lost', decisionIfB: 'the racking is lowered', whyNecessaryNow: 'w',
};

function reviewFor(fx: Fixture218): Record<string, unknown> {
  return {
    targetDeclarationId: TARGET_DECLARATION_ID,
    propertySemanticRole: fx.requiredRole,
    propertyValidity: fx.requiredValidity,
    decisionControllingProperty: fx.requiredValidity === 'VALID'
      ? fx.proposedProperty
      : 'the underlying condition the supplied property would help establish',
    propertyReviewReason: fx.why,
  };
}

/** The declaration entry each outcome requires, in the §212 vocabulary, unchanged by §218. */
export function requiredEntryFor218(fx: Fixture218): DeclarationEntry212 {
  if (fx.requiredValidity === 'INVALID') {
    return {
      factKey: TARGET_KEY,
      declaration: 'CHALLENGE_FACT_VALIDITY',
      challengeReason: fx.why,
      challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
      propertyMismatchKind: fx.requiredRole === 'EVIDENCE_FOR_ANOTHER_PROPERTY'
        ? 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE' : 'ADJACENT_PROPERTY_SUBSTITUTED',
      representationConcern: 'NONE',
    };
  }
  if (fx.requiredOutcome === 'ACCEPT_AND_REPLACE_THE_QUESTION') {
    return {
      factKey: TARGET_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null,
      challengeGround: null, propertyMismatchKind: null, representationConcern: 'NONE',
    };
  }
  return {
    factKey: TARGET_KEY, declaration: 'STILL_UNRESOLVED', challengeReason: null,
    challengeGround: null, propertyMismatchKind: null, representationConcern: 'NONE',
  };
}

/**
 * The verdict each outcome carries. §216 resolved the verdict that accompanies a property challenge
 * to ABSTAIN, from the EXISTING set, and §218 adds no verdict and changes none.
 */
export function requiredVerdictFor218(fx: Fixture218): string {
  switch (fx.requiredOutcome) {
    case 'CHALLENGE_PROPERTY_IDENTITY': return 'ABSTAIN';
    case 'ABSTAIN_FAIL_CLOSED': return 'ABSTAIN';
    case 'ACCEPT_AND_REPLACE_THE_QUESTION': return 'ADD_OR_REPLACE_CLARIFICATION';
    default: return 'VERIFIED_AS_IS';
  }
}

/** The output a CORRECT verifier would return for the fixture. Assembled, never described. */
export function compliantOutputFor218(fx: Fixture218): Record<string, unknown> {
  const verdict = requiredVerdictFor218(fx);
  const isAdd = verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  return {
    verifierContractVersion: 'hazlenz.expert.verifier.v3',
    analysisId: ANALYSIS_ID,
    verdict,
    rationale: fx.why,
    clarificationSourceMode: isAdd ? 'SUPPLIED_FACT' : null,
    proposedClarification: isAdd ? PROPOSAL : null,
    bindingFactKey: isAdd ? TARGET_KEY : null,
    nominatedFact: null,
    owedFactDeclarations: [requiredEntryFor218(fx)],
    propertyReview: reviewFor(fx),
  };
}

/** The output each REFUSAL fixture describes. Built so the refusal is run, not asserted. */
export function refusedOutputFor218(fx: Fixture218): Record<string, unknown> {
  const base = {
    verifierContractVersion: 'hazlenz.expert.verifier.v3',
    analysisId: ANALYSIS_ID,
    rationale: fx.why,
    propertyReview: reviewFor(fx),
  };
  switch (fx.requiredRefusalCode) {
    case 'INVALID_PROPERTY_ROUTED_TO_CLARIFICATION':
    case 'UNCERTAIN_PROPERTY_NOT_ABSTAINED':
      return {
        ...base,
        verdict: 'ADD_OR_REPLACE_CLARIFICATION',
        clarificationSourceMode: 'SUPPLIED_FACT',
        proposedClarification: PROPOSAL,
        bindingFactKey: TARGET_KEY,
        nominatedFact: null,
        owedFactDeclarations: [{
          factKey: TARGET_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null,
          challengeGround: null, propertyMismatchKind: null, representationConcern: 'NONE',
        }],
      };
    case 'INVALID_PROPERTY_VERIFIED_AS_IS':
      return {
        ...base,
        verdict: 'VERIFIED_AS_IS',
        clarificationSourceMode: null,
        proposedClarification: null,
        bindingFactKey: null,
        nominatedFact: null,
        owedFactDeclarations: [{
          factKey: TARGET_KEY, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: fx.why,
          challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
          propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
          representationConcern: 'NONE',
        }],
      };
    default:
      // F12: the target is reviewed correctly and a sibling is nominated beside it.
      return {
        ...base,
        verdict: 'ADD_OR_REPLACE_CLARIFICATION',
        clarificationSourceMode: 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
        proposedClarification: PROPOSAL,
        bindingFactKey: TARGET_KEY,
        nominatedFact: SIBLING_NOMINATION,
        owedFactDeclarations: [{
          factKey: TARGET_KEY, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null,
          challengeGround: null, propertyMismatchKind: null, representationConcern: 'NONE',
        }],
      };
  }
}

export interface FixtureRun218 {
  readonly id: string;
  readonly v3Admitted: boolean;
  readonly v3Codes: readonly string[];
  readonly vocabularyCodes: readonly string[];
  readonly scopeAdmitted: boolean;
  readonly scopeCodes: readonly string[];
  readonly propertyAdmitted: boolean;
  readonly propertyCodes: readonly string[];
  readonly route: string;
  readonly representationReviewMayProceed: boolean;
}

function runOutput(fx: Fixture218, output: Record<string, unknown>): FixtureRun218 {
  const v3 = checkVerifierV3Output(output, {
    analysisId: ANALYSIS_ID, observation: OBSERVATION, suppliedOwedFactKeys: [TARGET_KEY],
  });
  const scope = checkScopeContainment({
    scope: {
      targetFactKey: TARGET_KEY, suppliedFactKeys: [TARGET_KEY], multiFactValidationRequested: false,
    },
    output: {
      nominatedFact: output.nominatedFact,
      clarificationSourceMode: output.clarificationSourceMode,
      owedFactDeclarations: output.owedFactDeclarations as { factKey?: unknown }[],
    },
  });
  const property = checkPropertyReview218({
    scope: { targetDeclarationId: TARGET_DECLARATION_ID, targetFactKey: TARGET_KEY },
    output: {
      propertyReview: output.propertyReview,
      verdict: output.verdict,
      owedFactDeclarations: output.owedFactDeclarations as { factKey?: unknown }[],
    },
  });
  const entries = (output.owedFactDeclarations ?? []) as DeclarationEntry212[];
  const vocabularyCodes = entries.flatMap(e => checkDeclarationEntry212(e));
  return {
    id: fx.id,
    v3Admitted: v3.admitted,
    v3Codes: [...v3.codes],
    vocabularyCodes,
    scopeAdmitted: scope.admitted,
    scopeCodes: [...scope.codes],
    propertyAdmitted: property.admitted,
    propertyCodes: [...property.codes],
    route: property.route,
    representationReviewMayProceed: property.representationReviewMayProceed,
  };
}

/** Run the compliant output for every non-refusal fixture. Each must be admitted by all four. */
export function runCompliantFixtures218(): readonly FixtureRun218[] {
  return FIXTURES_218
    .filter(fx => fx.requiredOutcome !== 'DETERMINISTICALLY_REFUSED')
    .map(fx => runOutput(fx, compliantOutputFor218(fx)));
}

/** Run the prohibited output for every refusal fixture. Each must be refused, by a named code. */
export function runRefusalFixtures218(): readonly FixtureRun218[] {
  return FIXTURES_218
    .filter(fx => fx.requiredOutcome === 'DETERMINISTICALLY_REFUSED')
    .map(fx => runOutput(fx, refusedOutputFor218(fx)));
}

/** Every refusal fixture produced the exact code it was built for, from the layer that owns it. */
export function refusalsFireTheirNamedCode218(): boolean {
  return FIXTURES_218
    .filter(fx => fx.requiredOutcome === 'DETERMINISTICALLY_REFUSED')
    .every(fx => {
      const run = runOutput(fx, refusedOutputFor218(fx));
      const code = String(fx.requiredRefusalCode);
      return run.propertyCodes.includes(code as PropertyReviewCode218)
        || run.scopeCodes.includes(code);
    });
}

/** The minimal contrasts. Each pair moves exactly one variable. */
export function minimalContrasts218(): ReadonlyArray<{ pair: string; members: readonly string[] }> {
  return [
    {
      pair: 'DOCUMENT_ROLE_ONLY_MOVES',
      members: ['F2_DOCUMENT_PROXY_FOR_A_PHYSICAL_STATE', 'F4_LEGITIMATE_REQUIRED_ARTIFACT'],
    },
    {
      pair: 'PROPERTY_ONLY_MOVES',
      members: ['F11_EVIDENCE_PROXY_WITH_AN_EXCELLENT_QUESTION', 'F5_CORRECT_UNDERLYING_SAFETY_STATE'],
    },
    {
      pair: 'QUESTION_ONLY_MOVES',
      members: ['F5_CORRECT_UNDERLYING_SAFETY_STATE', 'F10_CORRECT_PROPERTY_INADEQUATE_QUESTION'],
    },
    {
      pair: 'ACT_AGAINST_PROXY',
      members: ['F3_LEGITIMATE_REQUIRED_ACT', 'F1_EVIDENCE_PROXY_FOR_A_PHYSICAL_STATE'],
    },
  ];
}

// ---------------------------------------------------------------- the negative controls

/**
 * THREE STRATEGIES THAT ARE NOT ARCHITECTURE.
 *
 * None is called by a request builder, a prompt builder, an admission path or a consistency check.
 * They exist to be shown FAILING on the fixtures built for them, which is the only way to establish
 * that the fixture set discriminates rather than agreeing with anything.
 *
 * The suite asserts by source inspection that no production or architecture module imports them.
 */
export const NEGATIVE_CONTROLS_ARE_UNREACHABLE_218 = true as const;

/** The vocabulary in the keyword classifier this architecture has refused since §160. */
const EVIDENCE_SOUNDING_WORDS = [
  'test', 'check', 'survey', 'examination', 'certificate', 'record', 'inspection', 'permit',
  'briefing', 'log', 'sign', 'audit',
];

/**
 * CONTROL 1. Classify the role by looking for evidence-sounding words in the property.
 * Fails every legitimate paired case: F3's briefing, F4's permit and F1's survey read alike.
 */
export function vocabularyOnlyRoleClassifier(fx: Fixture218): PropertySemanticRole218 {
  const text = fx.proposedProperty.toLowerCase();
  return EVIDENCE_SOUNDING_WORDS.some(w => text.includes(w))
    ? 'EVIDENCE_FOR_ANOTHER_PROPERTY' : 'UNDERLYING_SAFETY_STATE';
}

/** CONTROL 2. Decide from the QUESTION. The §215 H1/H2 and §217 K2 route. */
export function clarificationFirstRouting(fx: Fixture218): RequiredOutcome218 {
  return fx.clarificationSettlesTheControllingProperty
    ? 'ACCEPT_AND_VERIFY' : 'ACCEPT_AND_REPLACE_THE_QUESTION';
}

/** CONTROL 3. Challenge everything. The overcorrection every remediation here has had to guard. */
export function challengeEverything(_fx: Fixture218): RequiredOutcome218 {
  return 'CHALLENGE_PROPERTY_IDENTITY';
}

export interface ControlScore218 {
  readonly control: string;
  readonly correct: number;
  readonly wrong: number;
  readonly total: number;
  readonly wrongOn: readonly string[];
}

const SCORABLE = FIXTURES_218.filter(fx => fx.requiredOutcome !== 'DETERMINISTICALLY_REFUSED');

export function vocabularyOnlyScore(): ControlScore218 {
  const wrongOn = SCORABLE.filter(fx => vocabularyOnlyRoleClassifier(fx) !== fx.requiredRole)
    .map(fx => fx.id);
  return {
    control: 'VOCABULARY_ONLY_ROLE_CLASSIFIER',
    correct: SCORABLE.length - wrongOn.length,
    wrong: wrongOn.length,
    total: SCORABLE.length,
    wrongOn,
  };
}

export function clarificationFirstScore(): ControlScore218 {
  const wrongOn = SCORABLE.filter(fx => clarificationFirstRouting(fx) !== fx.requiredOutcome)
    .map(fx => fx.id);
  return {
    control: 'CLARIFICATION_FIRST_ROUTING',
    correct: SCORABLE.length - wrongOn.length,
    wrong: wrongOn.length,
    total: SCORABLE.length,
    wrongOn,
  };
}

export function challengeEverythingScore(): ControlScore218 {
  const wrongOn = SCORABLE.filter(fx => challengeEverything(fx) !== fx.requiredOutcome)
    .map(fx => fx.id);
  return {
    control: 'CHALLENGE_EVERYTHING',
    correct: SCORABLE.length - wrongOn.length,
    wrong: wrongOn.length,
    total: SCORABLE.length,
    wrongOn,
  };
}

export function fixtureEffect218(): {
  providerCalls: 0; databaseOperations: 0;
  establishesHostedBehaviour: false; reclassifiesAnyHistoricalResult: false;
  negativeControlIsReachableFromArchitecture: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    establishesHostedBehaviour: false,
    reclassifiesAnyHistoricalResult: false,
    negativeControlIsReachableFromArchitecture: false,
  };
}

export const FIXTURE_CONSTANTS_218 = {
  TARGET_KEY, TARGET_DECLARATION_ID, OBSERVATION, ANALYSIS_ID,
} as const;
