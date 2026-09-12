/**
 * §216 -- LOCAL CONTRAST FIXTURES FOR R-V4 AND R-V5. ZERO PROVIDER CALLS.
 *
 * These establish that the remediated decision procedure and the UNCHANGED §212 vocabulary can
 * express the required disposition for each shape, and -- the point of the set -- that a strategy
 * which decides on the QUESTION rather than the PROPERTY gets exactly the wrong answer on the case
 * built for it.
 *
 * They establish nothing about hosted behaviour. KR-1 stays OPEN and no §215 result is reclassified.
 *
 * ==================== WHY F1 IS THE INSTRUMENT ====================
 *
 * F1 pairs a WRONG property with a GOOD question -- a question that would settle the underlying
 * condition. A verifier working from the question alone sees nothing wrong. Only the ordered ladder,
 * whose first step is the property and whose first step ends the decision, gets it right. That is
 * the §215 H1 and H2 failure isolated to one variable.
 */

import {
  type DeclarationEntry212, checkDeclarationEntry212,
} from './expert-212-challenge-vocabulary';
import { closureMatrix, dispositionRoutingIsClosed } from './expert-216-disposition-closure';

export const FIXTURES_216_VERSION = 'hazlenz.expert.216.fixtures.v1' as const;

export type Disposition216 =
  | 'CHALLENGE_PROPERTY_IDENTITY'
  | 'ADD_OR_REPLACE_CLARIFICATION'
  | 'VERIFIED_AS_IS'
  | 'ACCEPT_PROPERTY_FLAG_BRANCHES'
  | 'STRUCTURALLY_REFUSED';

export interface Fixture216 {
  readonly id: string;
  readonly shape: string;
  /** The property the first pass named. Design material, authored here. */
  readonly proposedProperty: string;
  readonly propertyIsCorrect: boolean;
  /** The question bound to it, and whether it would settle the property that actually controls. */
  readonly boundClarification: string;
  readonly clarificationSettlesTheControllingProperty: boolean;
  readonly requiredDisposition: Disposition216;
  /** Which step of the §216 ladder decides this fixture. */
  readonly decidedAtLadderStep: 1 | 2 | 3 | 4 | null;
  readonly why: string;
  readonly mustNotAssert: string | null;
}

const f = (x: Fixture216): Fixture216 => x;

export const FIXTURES_216: readonly Fixture216[] = [
  f({
    id: 'F1_WRONG_PROPERTY_GOOD_CLARIFICATION',
    shape: 'an evidence-proxy property with a question that would settle the real condition',
    proposedProperty: 'whether the annual insulation resistance test on the site distribution board '
      + 'was carried out and logged',
    propertyIsCorrect: false,
    boundClarification: 'What insulation resistance does the board read now, against the minimum '
      + 'the installation requires?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'CHALLENGE_PROPERTY_IDENTITY',
    decidedAtLadderStep: 1,
    why: 'THE INSTRUMENT. The question is good: its answer would settle whether the insulation is '
      + 'adequate. The property is still the wrong object -- the annual test is how you find out, '
      + 'and the insulation is fine or degraded whether or not it was logged. A verifier reasoning '
      + 'from the question alone sees nothing to fix, which is exactly the §215 H1 and H2 route. '
      + 'The ladder decides at step 1 and stops; a better question may not rescue a wrong property.',
    mustNotAssert: 'the insulation is inadequate',
  }),
  f({
    id: 'F2_CORRECT_PROPERTY_BAD_CLARIFICATION',
    shape: 'the property controls the decision; the question cannot settle it',
    proposedProperty: 'whether the emergency stop on the packing line drops power to the wrap head',
    propertyIsCorrect: true,
    boundClarification: 'Is an emergency stop button fitted at the wrap head?',
    clarificationSettlesTheControllingProperty: false,
    requiredDisposition: 'ADD_OR_REPLACE_CLARIFICATION',
    decidedAtLadderStep: 3,
    why: 'presence is already established and answering it changes nothing. The property is right, '
      + 'so step 1 passes, the fields are sound so step 2 passes, and the question fails step 3.',
    mustNotAssert: null,
  }),
  f({
    id: 'F3_CORRECT_PROPERTY_CORRECT_CLARIFICATION',
    shape: 'nothing is wrong',
    proposedProperty: 'whether the emergency stop on the packing line drops power to the wrap head',
    propertyIsCorrect: true,
    boundClarification: 'What does the wrap head do when the emergency stop is pressed?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'VERIFIED_AS_IS',
    decidedAtLadderStep: 4,
    why: 'the false-positive control. Identical property to F2, and only the question moves. A '
      + 'verifier that challenges or replaces here is inventing a problem.',
    mustNotAssert: null,
  }),
  f({
    id: 'F4_PROXY_DESCRIBED_AS_REASONABLE',
    shape: 'an evidence proxy that is genuinely the usual, required and practical route',
    proposedProperty: 'whether the six-monthly gas tightness test on the boiler house pipework was '
      + 'completed and certificated',
    propertyIsCorrect: false,
    boundClarification: 'Was the six-monthly gas tightness test completed, and what was the result?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'CHALLENGE_PROPERTY_IDENTITY',
    decidedAtLadderStep: 1,
    why: 'R-V5 DIRECTLY. This test is required, probative and the only practical way anyone would '
      + 'establish tightness. §215 H1 called such a thing "a reasonable proxy" and kept it. All '
      + 'three of those are descriptions of EVIDENCE: the pipework leaks or it does not, whichever '
      + 'way the certificate went.',
    mustNotAssert: 'the pipework is leaking',
  }),
  f({
    id: 'F5_ACT_IS_THE_PROPERTY',
    shape: 'performing the act is itself the requirement',
    proposedProperty: 'whether the shift handover briefing required before the reactor is left in '
      + 'automatic overnight was given to the incoming operator',
    propertyIsCorrect: true,
    boundClarification: 'Was the handover briefing given to the incoming operator before the plant '
      + 'was left in automatic?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'VERIFIED_AS_IS',
    decidedAtLadderStep: 4,
    why: 'THE COUNTER-CONTROL. Knowing the briefing was given DOES answer the safety question, '
      + 'because giving it is the requirement, and there is no separate condition underneath. It '
      + 'passes both halves of the property test. Challenging it because it is communication-shaped '
      + 'is the overcorrection R-V5 must not cause.',
    mustNotAssert: null,
  }),
  f({
    id: 'F6_TWO_FACT_ROW_SIBLING_IN_REASONING',
    shape: 'two independent facts; the sibling belongs in prose and not in the structure',
    proposedProperty: 'whether the racking upright damaged by the truck still carries its rated '
      + 'load',
    propertyIsCorrect: true,
    boundClarification: 'What does an inspection of the damaged upright give against its rated '
      + 'load?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'VERIFIED_AS_IS',
    decidedAtLadderStep: 4,
    why: 'the same observation also leaves the pallet wrapping open, and that is genuinely '
      + 'unresolved. It may be named in reasoning as outside the scope of this review. It may not '
      + 'become a structured nomination or the target\'s replacement question.',
    mustNotAssert: null,
  }),
  f({
    id: 'F7_GROUND_PLUS_NOMINATION_DISPOSITION',
    shape: 'a property-identity ground emitted alongside a clarification route for the same target',
    proposedProperty: '(any) — this fixture is about the OUTPUT shape rather than the case',
    propertyIsCorrect: false,
    boundClarification: '(any)',
    clarificationSettlesTheControllingProperty: false,
    requiredDisposition: 'STRUCTURALLY_REFUSED',
    decidedAtLadderStep: null,
    why: 'the structural review found every such route already refused, by v3 admission or by the '
      + '§214 scope rule. This fixture runs the closure matrix so the property is pinned and a '
      + 'later contract change that reopened the hole would fail here.',
    mustNotAssert: null,
  }),
  f({
    id: 'F8_THREE_WORLD_BEHAVIOUR_CLEAN',
    shape: 'branchB has taken in the unresolved world; the property is right',
    proposedProperty: 'whether the anchor straps on the temporary grandstand are tensioned to the '
      + 'figure the design requires',
    propertyIsCorrect: true,
    boundClarification: 'What tension do the anchor straps read against the design figure?',
    clarificationSettlesTheControllingProperty: true,
    requiredDisposition: 'ACCEPT_PROPERTY_FLAG_BRANCHES',
    decidedAtLadderStep: 2,
    why: 'branchB reads "the straps are unchecked, or are below the design tension". §215 H3 caught '
      + 'exactly this and the wording that caught it is carried verbatim into §216. The ladder '
      + 'decides at step 2: the property is right, so this is a concern and not a challenge.',
    mustNotAssert: 'the straps are below tension',
  }),
];

// ---------------------------------------------------------------- representability

export function requiredEntryFor216(fx: Fixture216, factKey: string): DeclarationEntry212 {
  switch (fx.requiredDisposition) {
    case 'CHALLENGE_PROPERTY_IDENTITY':
      return {
        factKey, declaration: 'CHALLENGE_FACT_VALIDITY', challengeReason: fx.why,
        challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
        propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
        representationConcern: 'NONE',
      };
    case 'ACCEPT_PROPERTY_FLAG_BRANCHES':
      return {
        factKey, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null,
        representationConcern: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
      };
    case 'ADD_OR_REPLACE_CLARIFICATION':
      return {
        factKey, declaration: 'BOUND_BY_CLARIFICATION', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null, representationConcern: 'NONE',
      };
    default:
      return {
        factKey, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null, representationConcern: 'NONE',
      };
  }
}

export function requiredDispositionIsRepresentable(fx: Fixture216): boolean {
  if (fx.requiredDisposition === 'STRUCTURALLY_REFUSED') return dispositionRoutingIsClosed();
  return checkDeclarationEntry212(requiredEntryFor216(fx, 'FP:fixture')).length === 0;
}

// ---------------------------------------------------------------- the negative control

/**
 * A CLARIFICATION-FIRST STRATEGY. NOT ARCHITECTURE, NEVER CALLED BY ANY REQUEST BUILDER OR ADMISSION
 * PATH. It decides from the question alone: if the bound question would settle the controlling
 * property, accept; otherwise replace it. It is the §215 H1 and H2 route, and it exists to be shown
 * failing on the case built for it.
 */
export const CLARIFICATION_FIRST_IS_A_NEGATIVE_CONTROL = true as const;

export function clarificationFirstStrategy(fx: Fixture216): Disposition216 {
  return fx.clarificationSettlesTheControllingProperty
    ? 'VERIFIED_AS_IS' : 'ADD_OR_REPLACE_CLARIFICATION';
}

export function clarificationFirstScore(): {
  correct: number; wrong: number; total: number; wrongOn: string[];
} {
  let correct = 0;
  let wrong = 0;
  const wrongOn: string[] = [];
  for (const fx of FIXTURES_216) {
    if (fx.requiredDisposition === 'STRUCTURALLY_REFUSED') continue;
    if (clarificationFirstStrategy(fx) === fx.requiredDisposition) correct += 1;
    else { wrong += 1; wrongOn.push(fx.id); }
  }
  return { correct, wrong, total: correct + wrong, wrongOn };
}

/** The F2/F3 pair differs only in the question; F1/F4 differ from them only in the property. */
export function minimalContrasts(): ReadonlyArray<{ pair: string; members: readonly string[] }> {
  return [
    { pair: 'QUESTION_ONLY_MOVES', members: ['F2_CORRECT_PROPERTY_BAD_CLARIFICATION',
      'F3_CORRECT_PROPERTY_CORRECT_CLARIFICATION'] },
    { pair: 'PROPERTY_ONLY_MOVES', members: ['F1_WRONG_PROPERTY_GOOD_CLARIFICATION',
      'F3_CORRECT_PROPERTY_CORRECT_CLARIFICATION'] },
    { pair: 'PROXY_AGAINST_ACT', members: ['F4_PROXY_DESCRIBED_AS_REASONABLE',
      'F5_ACT_IS_THE_PROPERTY'] },
  ];
}

export function closureRows(): ReturnType<typeof closureMatrix> {
  return closureMatrix();
}

export function fixtureEffect216(): {
  providerCalls: 0; databaseOperations: 0;
  establishesHostedBehaviour: false; reclassifiesAnySection215Result: false;
  negativeControlIsReachableFromArchitecture: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    establishesHostedBehaviour: false,
    reclassifiesAnySection215Result: false,
    negativeControlIsReachableFromArchitecture: false,
  };
}
