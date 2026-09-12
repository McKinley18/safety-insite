/**
 * §214 -- PROTECTED CONTROLS C1-C6 AND THE PAIRED LOCAL FIXTURES.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO PRODUCTION.
 *
 * ==================== WHAT THESE FIXTURES ESTABLISH, AND WHAT THEY CANNOT ====================
 *
 * They establish that the remediated instruction and the unchanged §212 vocabulary can EXPRESS the
 * required outcome for each shape, that a request assembles and carries what the judgement needs,
 * and -- the point of the pairing -- that no blanket rule over vocabulary can satisfy both members
 * of a pair.
 *
 * They establish NOTHING about hosted behaviour. KR-1 stays OPEN and no §213 failure is reclassified.
 *
 * ==================== WHY PAIRS ====================
 *
 * The authorization asked for paired fixtures where only the semantic role changes, in preference to
 * many unrelated cases. Each pair uses THE SAME KIND OF NOUN -- a thorough examination, a proof load,
 * an absence-shaped branch -- in two roles, and the required outcomes are opposite. A rule that
 * decides on the word gets exactly one member of each pair right, which is what
 * `blanketVocabularyRuleScore` demonstrates by running one.
 *
 * THAT SIMULATOR IS A NEGATIVE CONTROL AND IS NOT ARCHITECTURE. It exists to be shown failing. The
 * suite asserts it is unreachable from any request builder or admission path, and no keyword list is
 * consulted by anything §214 ships.
 */

import {
  type DeclarationEntry212, checkDeclarationEntry212,
} from './expert-212-challenge-vocabulary';

export const CONTROLS_AND_FIXTURES_214_VERSION =
  'hazlenz.expert.214.controls-and-fixtures.v1' as const;

// ---------------------------------------------------------------- protected controls

export const PROTECTED_CONTROLS = [
  { id: 'C1', name: 'ACT_AS_PROPERTY',
    statement: 'where performing the act is itself the requirement, an act-shaped property is valid',
    equivalentTo: '§213 T4, which was clean and must stay clean' },
  { id: 'C2', name: 'FULLY_CORRECT_FACT',
    statement: 'a correct declaration is left alone; the verifier does not invent a problem',
    equivalentTo: '§213 T8, which was clean and must stay clean' },
  { id: 'C3', name: 'MISSING_RECORD_STATE_SATISFACTORY',
    statement: 'evidence is missing and the underlying state is actually fine; the fact stays '
      + 'unresolved and never becomes adverse',
    equivalentTo: 'the R-V2 residual, from §213 T1 and T10' },
  { id: 'C4', name: 'MISSING_RECORD_STATE_ADVERSE',
    statement: 'absence alone does not establish the adverse branch, and separate admissible '
      + 'evidence may',
    equivalentTo: 'the other half of R-V2, so the fix does not become a refusal to ever find B' },
  { id: 'C5', name: 'REQUIRED_RECORD_IS_THE_PROPERTY',
    statement: 'where the existence of the record is itself the controlling requirement, a '
      + 'record-shaped property is valid and an absence-shaped branchB is correct',
    equivalentTo: 'the R-V1 and R-V2 overcorrection guards' },
  { id: 'C6', name: 'TWO_INDEPENDENT_FACTS',
    statement: 'the target fact is evaluated without an additive sibling nomination',
    equivalentTo: '§213 T6, the R-V3 residual' },
] as const;
export type ControlId = (typeof PROTECTED_CONTROLS)[number]['id'];

// ---------------------------------------------------------------- fixture shape

export type RequiredOutcome214 =
  | 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY'
  | 'CHALLENGE_PROPERTY_IDENTITY_ADJACENT'
  | 'ACCEPT_PROPERTY_UNCHANGED'
  | 'ACCEPT_PROPERTY_FLAG_BRANCHES'
  | 'ACCEPT_PROPERTY_FLAG_UNRESOLVED_ACTION'
  | 'ACCEPT_PROPERTY_REPLACE_CLARIFICATION';

/** The semantic role the fixture's noun plays. The only thing that differs within a pair. */
export type SemanticRole = 'EVIDENCE_FOR_ANOTHER_PROPERTY' | 'THE_PROPERTY_ITSELF';

export interface Fixture214 {
  readonly id: string;
  readonly pair: string | null;
  readonly shape: string;
  readonly controls: readonly ControlId[];
  /** The property as the first pass named it. Design material, authored here. */
  readonly proposedProperty: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionWhileUnresolved: string;
  readonly boundClarification: string;
  /** The noun whose role is under test, shared across a pair. */
  readonly nounUnderTest: string;
  readonly semanticRole: SemanticRole;
  /** The role test, answered here before anything is run. */
  readonly roleTestAnswer: string;
  readonly requiredOutcome: RequiredOutcome214;
  /** The claim the verifier must NOT be forced into. Null where there is none. */
  readonly mustNotAssert: string | null;
  /** Whether a structured nomination would be in scope for this fixture. Always false here. */
  readonly siblingNominationInScope: boolean;
  /**
   * What the verifier is expected to DO about a sibling issue. This is the D pair's discriminator:
   * D1 and D2 are identical in every semantic field, and differ only here. Without it the pair
   * would look like a duplicate rather than a contrast.
   */
  readonly siblingHandling: 'NOT_APPLICABLE' | 'MENTION_IN_PROSE_ONLY' | 'MUST_NOT_NOMINATE';
}

const f = (x: Fixture214): Fixture214 => x;

// ---------------------------------------------------------------- the fixtures

export const FIXTURES_214: readonly Fixture214[] = [
  // ============ PAIR A — a thorough examination, in two roles
  f({
    id: 'A1_EXAMINATION_AS_EVIDENCE',
    pair: 'A_THOROUGH_EXAMINATION',
    shape: 'missing certificate; the decision turns on an underlying machine state',
    controls: ['C3'],
    proposedProperty: 'whether the last thorough examination certificate for the air receiver is '
      + 'in the plant file',
    branchA: 'the certificate is in the file and in date',
    branchB: 'the certificate is missing or out of date',
    decisionWhileUnresolved: 'the receiver is not re-pressurised while the position is unestablished',
    boundClarification: 'Can the thorough examination certificate for this receiver be located?',
    nounUnderTest: 'thorough examination',
    semanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    roleTestAnswer: 'take the certificate away entirely and the receiver shell is still either '
      + 'sound enough to hold working pressure or it is not. The condition survives the paperwork, '
      + 'so the paperwork is evidence.',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY',
    mustNotAssert: 'the receiver shell is unsound',
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'A2_EXAMINATION_AS_THE_PROPERTY',
    pair: 'A_THOROUGH_EXAMINATION',
    shape: 'the examination having been carried out is itself the controlling requirement',
    controls: ['C1', 'C5'],
    proposedProperty: 'whether the statutory thorough examination has been carried out on this '
      + 'receiver at all since it was reinstalled, which the scheme requires before it is put back '
      + 'into service',
    branchA: 'the examination was carried out after reinstallation',
    branchB: 'no examination has been carried out since reinstallation',
    decisionWhileUnresolved: 'the receiver stays out of service until the examination position is '
      + 'established',
    boundClarification: 'Has a thorough examination been carried out on this receiver since it was '
      + 'reinstalled?',
    nounUnderTest: 'thorough examination',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'take the examination away and there is no separate condition left to be '
      + 'satisfactory or adverse: the scheme makes having done it the requirement for putting the '
      + 'receiver back into service. The act is the property.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),

  // ============ PAIR B — a proof load, in two roles
  f({
    id: 'B1_PROOF_LOAD_AS_EVIDENCE',
    pair: 'B_PROOF_LOAD',
    shape: 'absent test record; the decision turns on underlying fixing capacity',
    controls: ['C3'],
    proposedProperty: 'whether the davit anchors were proof loaded when the socket was installed',
    branchA: 'the anchors were proof loaded and passed',
    branchB: 'the anchors were not proof loaded, or were and failed',
    decisionWhileUnresolved: 'nobody is suspended from the davit while the anchor position is '
      + 'unestablished',
    boundClarification: 'Was a proof load carried out on the davit anchors at installation?',
    nounUnderTest: 'proof load',
    semanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    roleTestAnswer: 'take the proof load away and the anchors still either carry the davit at its '
      + 'rated load or they do not. The masonry does not change because nobody tested it.',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY',
    mustNotAssert: 'the anchors will not carry the davit',
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'B2_PROOF_LOAD_AS_THE_PROPERTY',
    pair: 'B_PROOF_LOAD',
    shape: 'a pre-use test mandated each shift; performing it is the requirement',
    controls: ['C1'],
    proposedProperty: 'whether the pre-use proof load the scheme of examination requires before the '
      + 'first lift of each shift was carried out on this davit today',
    branchA: 'the pre-use proof load was carried out this shift',
    branchB: 'no pre-use proof load was carried out this shift',
    decisionWhileUnresolved: 'no lift on this davit until the pre-use position is established',
    boundClarification: 'Was the pre-use proof load carried out on this davit at the start of this '
      + 'shift?',
    nounUnderTest: 'proof load',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'take the pre-use test away and the requirement is gone with it: the scheme '
      + 'makes doing it each shift the condition of lifting. There is no separate state underneath.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),

  // ============ PAIR C — an absence-shaped branchB, in two roles
  f({
    id: 'C1F_ABSENCE_INSIDE_THE_ADVERSE_BRANCH',
    pair: 'C_ABSENCE_SHAPED_BRANCH',
    shape: 'correct property; branchB absorbs the unresolved world',
    controls: ['C3'],
    proposedProperty: 'whether the mezzanine column baseplate bolts will carry the racking load '
      + 'now that the slab has been cored beside them',
    branchA: 'the baseplate bolts carry the racking load with the required margin',
    branchB: 'the bolts are unverified, or will not carry the racking load',
    decisionWhileUnresolved: 'the bay stays unloaded while the baseplate position is unestablished',
    boundClarification: 'What does a structural check of the baseplate bolts give against the '
      + 'racking load, given the coring?',
    nounUnderTest: 'an absence-shaped disjunct in branchB',
    semanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    roleTestAnswer: 'the bolts could genuinely carry the load with nobody having checked, so '
      + '"unverified" cannot be the adverse answer. It has taken in the unresolved world.',
    requiredOutcome: 'ACCEPT_PROPERTY_FLAG_BRANCHES',
    mustNotAssert: 'the baseplate bolts will not carry the load',
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'C2F_ABSENCE_IS_THE_ADVERSE_STATE',
    pair: 'C_ABSENCE_SHAPED_BRANCH',
    shape: 'the absence itself IS the substantive adverse property',
    controls: ['C5'],
    proposedProperty: 'whether a hot work permit was raised for the cutting the roofer is about to '
      + 'start over the sprinkler-isolated void',
    branchA: 'a hot work permit was raised for this work',
    branchB: 'no hot work permit was raised for this work',
    decisionWhileUnresolved: 'no cutting starts while the permit position is unestablished',
    boundClarification: 'Was a hot work permit raised for this cutting, and by whom?',
    nounUnderTest: 'an absence-shaped disjunct in branchB',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'there is no separate condition under "a permit was raised". The absence IS the '
      + 'adverse state, so an absence-shaped branchB is correct and must be left alone.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),

  // ============ PAIR D — scope
  f({
    id: 'D1_TEMPTING_SIBLING',
    pair: 'D_FACT_SCOPE',
    shape: 'a correct target beside a genuinely open sibling fact',
    controls: ['C6'],
    proposedProperty: 'whether the temporary edge protection on the open lift shaft will arrest a '
      + 'person who falls against it',
    branchA: 'the edge protection will arrest a person falling against it',
    branchB: 'the edge protection will not arrest a person falling against it',
    decisionWhileUnresolved: 'the shaft opening is kept closed off while the position is '
      + 'unestablished',
    boundClarification: 'What does the edge protection on the shaft opening do under a load test?',
    nounUnderTest: 'a sibling fact in the same observation',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'the property is correct. What is under test is whether the sibling fact — the '
      + 'unlabelled cylinders stored in the same lobby — becomes a structured nomination.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'MUST_NOT_NOMINATE',
  }),
  f({
    id: 'D2_SIBLING_IN_REASONING_ONLY',
    pair: 'D_FACT_SCOPE',
    shape: 'the same row, where the sibling is named in prose and not nominated',
    controls: ['C6'],
    proposedProperty: 'whether the temporary edge protection on the open lift shaft will arrest a '
      + 'person who falls against it',
    branchA: 'the edge protection will arrest a person falling against it',
    branchB: 'the edge protection will not arrest a person falling against it',
    decisionWhileUnresolved: 'the shaft opening is kept closed off while the position is '
      + 'unestablished',
    boundClarification: 'What does the edge protection on the shaft opening do under a load test?',
    nounUnderTest: 'a sibling fact in the same observation',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'identical to D1 in every semantic field. The difference is what the verifier '
      + 'does with the sibling: mentioning it in reasoning is permitted, nominating it is not.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'MENTION_IN_PROSE_ONLY',
  }),

  // ============ singles
  f({
    id: 'E1_PROCESS_COMPLETED_STATE_MAY_REMAIN',
    pair: null,
    shape: 'a required process demonstrably completed while the hazardous state may remain',
    controls: ['C3'],
    proposedProperty: 'whether the nitrogen purge cycle specified in the procedure was completed on '
      + 'the reactor',
    branchA: 'the purge cycle was completed as specified',
    branchB: 'the purge cycle was not completed as specified',
    decisionWhileUnresolved: 'nobody breaks into the reactor while the purge position is '
      + 'unestablished',
    boundClarification: 'Was the nitrogen purge cycle completed as the procedure specifies?',
    nounUnderTest: 'a completed procedure',
    semanticRole: 'EVIDENCE_FOR_ANOTHER_PROPERTY',
    roleTestAnswer: 'the observation establishes the cycle ran. Take the cycle away and the reactor '
      + 'atmosphere at the break-in point is still either safe or not: a compliant purge can leave '
      + 'a pocket. The owed property is the atmosphere, and the cycle is evidence about it.',
    requiredOutcome: 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY',
    mustNotAssert: 'the reactor atmosphere is unsafe',
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'E2_INSUFFICIENT_EVIDENCE_FAIL_CLOSED',
    pair: null,
    shape: 'correct property, insufficient evidence, and a fail-closed unresolved action',
    controls: ['C3'],
    proposedProperty: 'whether the tail lift on the delivery vehicle will hold the cage at the '
      + 'raised position',
    branchA: 'the tail lift holds the cage at the raised position',
    branchB: 'the tail lift creeps or drops under the cage load',
    decisionWhileUnresolved: 'nothing is loaded onto the tail lift while the position is '
      + 'unestablished, and the cage stays on the ground',
    boundClarification: 'What does the tail lift do under a held cage load at the raised position?',
    nounUnderTest: 'a fail-closed hold under uncertainty',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'the property is a physical state and the hold is the right action while it is '
      + 'unknown. Holding the work is not a finding that the lift creeps.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: 'the tail lift creeps under load',
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'E3_ADVERSE_ESTABLISHED_BY_SEPARATE_EVIDENCE',
    pair: null,
    shape: 'the adverse branch established by admissible evidence rather than by absence',
    controls: ['C4'],
    proposedProperty: 'whether the guard interlock on the shredder stops the rotor when the hopper '
      + 'lid is raised',
    branchA: 'raising the lid stops the rotor',
    branchB: 'raising the lid does not stop the rotor',
    decisionWhileUnresolved: 'the shredder stays isolated while the interlock behaviour is '
      + 'unestablished',
    boundClarification: 'What did the rotor do when the hopper lid was raised on test, and when was '
      + 'that observed?',
    nounUnderTest: 'evidence establishing the adverse branch',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'the property is correct. What is under test is that the architecture still '
      + 'lets branchB be ESTABLISHED — by a witnessed test that showed the rotor running — rather '
      + 'than the remediation making the adverse branch unreachable.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
  f({
    id: 'E4_FULLY_CORRECT_DECLARATION',
    pair: null,
    shape: 'everything correct; the verifier must invent no problem',
    controls: ['C2'],
    proposedProperty: 'whether the outriggers on the mobile elevating work platform are on ground '
      + 'that will carry the point loads',
    branchA: 'the ground carries the outrigger point loads',
    branchB: 'the ground will not carry the outrigger point loads',
    decisionWhileUnresolved: 'the platform is not elevated while the ground bearing is '
      + 'unestablished',
    boundClarification: 'What is the made-up ground under the outrigger pads rated to carry, and '
      + 'what do the pads impose?',
    nounUnderTest: 'a correct declaration',
    semanticRole: 'THE_PROPERTY_ITSELF',
    roleTestAnswer: 'nothing is wrong with it. This is the false-positive control.',
    requiredOutcome: 'ACCEPT_PROPERTY_UNCHANGED',
    mustNotAssert: null,
    siblingNominationInScope: false,
    siblingHandling: 'NOT_APPLICABLE',
  }),
];

// ---------------------------------------------------------------- representability

/** The §212 declaration entry a required outcome corresponds to. Vocabulary is UNCHANGED. */
export function requiredEntryFor(fx: Fixture214, factKey: string): DeclarationEntry212 {
  switch (fx.requiredOutcome) {
    case 'CHALLENGE_PROPERTY_IDENTITY_EVIDENCE_PROXY':
      return {
        factKey, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: fx.roleTestAnswer,
        challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
        propertyMismatchKind: 'EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
        representationConcern: 'NONE',
      };
    case 'CHALLENGE_PROPERTY_IDENTITY_ADJACENT':
      return {
        factKey, declaration: 'CHALLENGE_FACT_VALIDITY',
        challengeReason: fx.roleTestAnswer,
        challengeGround: 'PROPERTY_IDENTITY_MISMATCH',
        propertyMismatchKind: 'ADJACENT_PROPERTY_SUBSTITUTED',
        representationConcern: 'NONE',
      };
    case 'ACCEPT_PROPERTY_FLAG_BRANCHES':
      return {
        factKey, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null,
        representationConcern: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
      };
    case 'ACCEPT_PROPERTY_FLAG_UNRESOLVED_ACTION':
      return {
        factKey, declaration: 'STILL_UNRESOLVED', challengeReason: null, challengeGround: null,
        propertyMismatchKind: null,
        representationConcern: 'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
      };
    case 'ACCEPT_PROPERTY_REPLACE_CLARIFICATION':
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

export function requiredOutcomeIsRepresentable(fx: Fixture214): boolean {
  return checkDeclarationEntry212(requiredEntryFor(fx, 'FP:fixture-key')).length === 0;
}

// ---------------------------------------------------------------- the negative control

/**
 * A BLANKET VOCABULARY RULE. THIS IS NOT ARCHITECTURE AND IS NEVER CALLED BY ANY REQUEST BUILDER,
 * ADMISSION PATH OR PROJECTION. It exists to be shown FAILING.
 *
 * It challenges any property mentioning a test, a check, an inspection, a record, a certificate or
 * an examination -- the exact rule the authorization forbids. Run across the pairs it gets one
 * member of each right and the other wrong, which is the demonstration that the pairs discriminate
 * semantic role from vocabulary and that no word list can pass them.
 */
export const BLANKET_RULE_IS_A_NEGATIVE_CONTROL = true as const;
const NEGATIVE_CONTROL_WORDS = [
  'test', 'check', 'inspection', 'record', 'certificate', 'examination', 'proof load', 'permit',
];

export function blanketVocabularyRuleWouldChallenge(fx: Fixture214): boolean {
  const p = fx.proposedProperty.toLowerCase();
  return NEGATIVE_CONTROL_WORDS.some(w => p.includes(w));
}

export function blanketVocabularyRuleScore(): {
  correct: number; wrong: number; total: number; wrongOn: string[];
} {
  let correct = 0;
  let wrong = 0;
  const wrongOn: string[] = [];
  for (const fx of FIXTURES_214) {
    const wouldChallenge = blanketVocabularyRuleWouldChallenge(fx);
    const shouldChallenge = fx.requiredOutcome.startsWith('CHALLENGE_');
    if (wouldChallenge === shouldChallenge) correct += 1;
    else { wrong += 1; wrongOn.push(fx.id); }
  }
  return { correct, wrong, total: FIXTURES_214.length, wrongOn };
}

/** Within a pair, the semantic fields differ but the NOUN and the shape family do not. */
export function pairs(): ReadonlyArray<{ pair: string; members: readonly Fixture214[] }> {
  const names = [...new Set(FIXTURES_214.map(f2 => f2.pair).filter((p): p is string => p !== null))];
  return names.map(pair => ({ pair, members: FIXTURES_214.filter(f2 => f2.pair === pair) }));
}

/** Recorded as literals, asserted by the suite. */
export function fixtureEffect214(): {
  providerCalls: 0; databaseOperations: 0;
  establishesHostedBehaviour: false; reclassifiesAnySection213Failure: false;
  blanketRuleIsReachableFromArchitecture: false;
} {
  return {
    providerCalls: 0,
    databaseOperations: 0,
    establishesHostedBehaviour: false,
    reclassifiesAnySection213Failure: false,
    blanketRuleIsReachableFromArchitecture: false,
  };
}
