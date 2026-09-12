/**
 * §211 -- VERIFIER ARCHITECTURE INSPECTION. WHAT SEMANTIC INFORMATION REACHES THE VERIFIER TODAY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOTHING IS REMEDIATED HERE.
 *
 * ==================== THE HEADLINE, STATED BEFORE THE DETAIL ====================
 *
 * The verifier as built CANNOT answer the question §211 wants it to answer, and the reason is
 * three-layered rather than one missing field:
 *
 *   PAYLOAD   the exact proposed safety property is NOT IN THE REQUEST. `V3SuppliedOwedFact` has
 *             seven members and `missingFact` is not among them, because the projection drops it
 *             and `projectOwedFact` cannot carry what `OwedFact` does not hold. Of the eleven
 *             fields the §211 authorization requires, FOUR are absent outright and ONE arrives
 *             unbound to the fact it belongs to -- five of eleven unusable as required.
 *
 *   REMIT     the verifier is not ASKED about the property. The v3 instruction says a nominated
 *             fact "changes ONE thing and one thing only -- which clarification is asked", and all
 *             four verdicts are clarification-selection verdicts. Property identity is outside the
 *             contract's stated job.
 *
 *   VOCABULARY  there is nowhere for a property-collapse finding to LAND. The three owed-fact
 *             declarations are BOUND_BY_CLARIFICATION, STILL_UNRESOLVED and CHALLENGE_FACT_VALIDITY,
 *             and the challenge has exactly two stated grounds: the observation already settles the
 *             fact, or both answers lead to the same action. "The property you named is the
 *             evidence for the property" is neither.
 *
 * Any one of the three would block V1 and V2. All three hold.
 *
 * ==================== THREE REMEDIATIONS ARE ALREADY BUILT AND NOT WIRED ====================
 *
 * This is the useful half of the finding. The repository already contains, tested and reversible:
 *
 *   §210B-1  the owed-property sidecar (`explicitOwedProperty`), byte-exact
 *   §210B-1  ancillary-context isolation (`isolateClarifications`, `isolateCandidates`)
 *   §210J    the unresolved-action sidecar and `buildVerifier210jView`, which already assembles
 *            seven of the eleven required slots
 *
 * NONE of them is imported by `assembleVerifierRequests`. They are imported only by their own
 * suites and by each other. So the payload half of the remediation is a WIRING task over modules
 * that already pass, not new design.
 *
 * The remit and vocabulary halves are NOT already built, and §201's candidate registry -- which is
 * where a verifier protocol change belongs -- does not contain them either. See
 * `CANDIDATE_COVERAGE`.
 *
 * ==================== WHAT THIS MODULE IS NOT ====================
 *
 * It remediates nothing, imports no prompt builder, and proposes no protocol version. §201's rule
 * stands: a version number is earned by a preregistered run, not by a good idea.
 */

import {
  CLARIFICATION_SOURCE_MODES_V3, OWED_FACT_DECLARATIONS_V3,
} from './expert-verifier-instruction-v3';
import { VERIFIER_VERDICTS } from './expert-verifier-contract';
import { VNEXT_CANDIDATES } from './expert-201-verifier-vnext-candidates';
import { UNRESOLVED_ACTION_FIELD } from './expert-210j-first-pass-contract';
import { VERIFIER_SLOTS_210J } from './expert-210j-declaration-projection';

export const VERIFIER_INSPECTION_211_VERSION =
  'hazlenz.expert.211.verifier-inspection.v1' as const;

// ---------------------------------------------------------------- 1. the payload today

/**
 * Every member of `V3SuppliedOwedFact`, which is the ONLY per-fact object the verifier user prompt
 * renders. Read from the interface, not assumed.
 */
export const SUPPLIED_OWED_FACT_FIELDS_TODAY: readonly string[] = [
  'factKey', 'affectedDecision', 'whyUnresolved', 'branchA', 'branchB', 'decisionDivergence',
  'evidenceSpan',
];

/** The eleven the §211 authorization requires reach the verifier without reconstruction. */
export const REQUIRED_VERIFIER_FIELDS_211: readonly string[] = [
  'exactProposedSafetyProperty',
  'branchA',
  'branchB',
  'decisionIfA',
  'decisionIfB',
  UNRESOLVED_ACTION_FIELD,
  'evidenceGapNotEstablishedBecause',
  'acceptableEvidence',
  'boundClarification',
  'declarationId',
  'targetFactIdentifier',
];

export type FieldPresence = 'PRESENT' | 'ABSENT' | 'PRESENT_BUT_UNBOUND';

export interface PayloadAuditRow {
  readonly required: string;
  readonly presence: FieldPresence;
  readonly carriedBy: string | null;
  readonly note: string;
}

/**
 * WHAT REACHES THE VERIFIER TODAY, field by field.
 *
 * Source of truth for every row: `V3SuppliedOwedFact` in `expert-verifier-instruction-v3.ts`, and
 * the object literal `assembleVerifierRequests` builds in `expert-208b-verifier-recovery.ts`, which
 * is the one assembly path both the preflight and the executor use.
 */
export const PAYLOAD_AUDIT: readonly PayloadAuditRow[] = [
  {
    required: 'exactProposedSafetyProperty', presence: 'ABSENT', carriedBy: null,
    note: 'declaration.missingFact is dropped by the projection and has no OwedFact field, so '
      + 'projectOwedFact cannot carry it. The §210B-1 sidecar exists and is imported by nothing on '
      + 'the request path. The verifier would have to RECONSTRUCT the property from branchA and '
      + 'branchB, which is the semantic reconstruction the authorization forbids.',
  },
  {
    required: 'branchA', presence: 'PRESENT', carriedBy: 'V3SuppliedOwedFact.branchA',
    note: 'copied from the pinned projection',
  },
  {
    required: 'branchB', presence: 'PRESENT', carriedBy: 'V3SuppliedOwedFact.branchB',
    note: 'copied from the pinned projection',
  },
  {
    required: 'decisionIfA', presence: 'PRESENT',
    carriedBy: 'V3SuppliedOwedFact.decisionDivergence.ifA', note: 'copied from the pinned projection',
  },
  {
    required: 'decisionIfB', presence: 'PRESENT',
    carriedBy: 'V3SuppliedOwedFact.decisionDivergence.ifB', note: 'copied from the pinned projection',
  },
  {
    required: UNRESOLVED_ACTION_FIELD, presence: 'ABSENT', carriedBy: null,
    note: 'added to the declaration by §210J and carried on the §210J sidecar. The sidecar is '
      + 'imported by its own suite and by §210I, and by nothing that builds a verifier request.',
  },
  {
    required: 'evidenceGapNotEstablishedBecause', presence: 'PRESENT',
    carriedBy: 'V3SuppliedOwedFact.whyUnresolved',
    note: 'the declaration\'s notEstablishedBecause, projected as whyUnresolved',
  },
  {
    required: 'acceptableEvidence', presence: 'ABSENT', carriedBy: null,
    note: 'ProjectedOwedFact carries it, but the assembled owedFacts object does not copy it. §201 '
      + 'candidate C2b is the prototyped input-side render and carries a provenance gate, because '
      + 'DEVELOPMENT_HUMAN_TRUTH and ADJUDICATION_LABEL must never be shown to the model.',
  },
  {
    required: 'boundClarification', presence: 'PRESENT_BUT_UNBOUND',
    carriedBy: 'firstPass.clarifications',
    note: 'the FULL flat clarification list is rendered with clarificationId, question and '
      + 'affectedDecision. The model-authored answersUnresolvedFactDeclarationId is NOT rendered, '
      + 'so nothing tells the verifier which question belongs to the fact it is judging. This is '
      + 'the channel §210A measured as the adjacent-drift carrier and §210B-1 built isolation for; '
      + 'the isolation is not wired.',
  },
  {
    required: 'declarationId', presence: 'ABSENT', carriedBy: null,
    note: 'the projection drops it deliberately once the computed factKey exists. Without it a '
      + 'clarification back-reference cannot be resolved on the verifier side even if it were '
      + 'rendered.',
  },
  {
    required: 'targetFactIdentifier', presence: 'PRESENT', carriedBy: 'V3SuppliedOwedFact.factKey',
    note: 'the request already carries a single-element owedFacts array, so the target is '
      + 'unambiguous at the fact level',
  },
];

export function payloadGapCount(): { absent: number; unbound: number; present: number } {
  return {
    absent: PAYLOAD_AUDIT.filter(r => r.presence === 'ABSENT').length,
    unbound: PAYLOAD_AUDIT.filter(r => r.presence === 'PRESENT_BUT_UNBOUND').length,
    present: PAYLOAD_AUDIT.filter(r => r.presence === 'PRESENT').length,
  };
}

/** Modules that already solve part of this and are imported by no request builder. */
export const BUILT_BUT_UNWIRED = [
  {
    module: 'scripts/lib/section-210b-verifier-payload.ts',
    provides: 'explicitOwedProperty — the byte-exact owed property sidecar (O4)',
    importedByRequestPath: false,
    importedBy: ['test-210b1-structural-remediation.ts', 'expert-210i-*', 'expert-210j-*'],
  },
  {
    module: 'scripts/lib/section-210b-verifier-payload.ts',
    provides: 'isolateClarifications / isolateCandidates — ancillary-context isolation',
    importedByRequestPath: false,
    importedBy: ['test-210b1-structural-remediation.ts'],
  },
  {
    module: 'scripts/lib/expert-210j-declaration-projection.ts',
    provides: 'buildVerifier210jView — seven of the eleven required slots, already assembled',
    importedByRequestPath: false,
    importedBy: ['test-210j-epistemic-schema-remediation.ts'],
  },
] as const;

// ---------------------------------------------------------------- 2. the remit today

/**
 * What the verifier is asked to decide. Every verdict is a clarification-selection verdict, and the
 * instruction says so in terms.
 */
export const VERIFIER_REMIT_TODAY = {
  verdicts: [...VERIFIER_VERDICTS],
  everyVerdictIsAboutClarificationSelection: true,
  instructionQuote: 'A nominated fact changes ONE thing and one thing only -- which clarification '
    + 'is asked.',
  isTheVerifierAskedWhetherTheStatedPropertyIsTheRightProperty: false,
  consequence: 'V1 to V4 are outside the contract\'s stated job. A verifier that noticed an '
    + 'evidence-proxy property has been given no question it answers by saying so.',
} as const;

// ---------------------------------------------------------------- 3. the vocabulary today

export const OWED_FACT_DECLARATION_VOCABULARY = [...OWED_FACT_DECLARATIONS_V3];
export const CLARIFICATION_SOURCE_MODES = [...CLARIFICATION_SOURCE_MODES_V3];

/**
 * The two grounds a challenge may rest on. Taken from the v3 instruction, and from §201 candidate
 * C6a which CLOSES them into a two-member enum.
 */
export const CHALLENGE_GROUNDS_TODAY: readonly string[] = [
  'THE_OBSERVATION_ALREADY_ESTABLISHES_IT',
  'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
];

/**
 * THE SHARPEST FINDING IN THIS INSPECTION, AND THE EASIEST TO ADOPT A CANDIDATE STRAIGHT PAST.
 *
 * §201's C6a is the highest-ranked candidate in the registry and it is a genuine improvement to
 * challenge reviewability -- V10. But it makes `challengeGround` a CLOSED TWO-MEMBER ENUM. Adopting
 * it as designed would make a property-identity challenge structurally unrepresentable rather than
 * merely unnamed, which moves V2 backwards.
 *
 * So the remediation is C6a PLUS a third ground, not C6a.
 */
export const C6A_CLOSES_THE_GROUND_VOCABULARY = {
  candidate: 'C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE',
  effect: 'challengeGround becomes a closed enum of exactly two members plus null',
  consequenceIfAdoptedUnchanged: 'a property-identity challenge becomes structurally '
    + 'unrepresentable, not merely unnamed. V2 and V4 would be worse off than today.',
  requiredAdjustment: 'a third ground for property identity, with the evidence that ground requires',
  status: 'IDENTIFIED_NOT_IMPLEMENTED',
} as const;

// ---------------------------------------------------------------- 4. V1..V10 coverage

export const TARGETED_CAPABILITIES = [
  'V1_EXACT_PROPERTY_IDENTITY',
  'V2_STATE_VERSUS_EVIDENCE',
  'V3_ACT_AS_PROPERTY_NARROWING',
  'V4_BRANCH_ALIGNMENT',
  'V5_UNRESOLVED_STATE_CONTAINMENT',
  'V6_CLARIFICATION_SUFFICIENCY',
  'V7_DECISION_WHILE_UNRESOLVED',
  'V8_ADJACENT_FACT_DRIFT',
  'V9_MULTI_FACT_ISOLATION',
  'V10_CHALLENGE_REVIEWABILITY',
] as const;
export type TargetedCapability = (typeof TARGETED_CAPABILITIES)[number];

export type CapabilityReadiness =
  | 'BLOCKED_PAYLOAD'
  | 'BLOCKED_REMIT'
  | 'BLOCKED_VOCABULARY'
  | 'PARTIAL_CANDIDATE_EXISTS'
  | 'EXERCISABLE_TODAY';

export interface CapabilityRow {
  readonly capability: TargetedCapability;
  readonly readiness: readonly CapabilityReadiness[];
  /** §201 candidates that bear on it, by id. Empty where the registry has nothing. */
  readonly candidates: readonly string[];
  readonly whatIsMissing: string;
}

/** Which §211 capability the current architecture can exercise, and what stands in the way. */
export const CAPABILITY_COVERAGE: readonly CapabilityRow[] = [
  {
    capability: 'V1_EXACT_PROPERTY_IDENTITY',
    readiness: ['BLOCKED_PAYLOAD', 'BLOCKED_REMIT'],
    candidates: ['C1a_OWED_PROPERTY_RESTATEMENT'],
    whatIsMissing: 'the property is not in the request, and the verifier is not asked to judge it. '
      + 'C1a makes the verifier restate the property IT takes the fact to be about, which makes '
      + 'drift visible to a reviewer -- but C1a explicitly checks nothing for correctness, so it '
      + 'is a reviewability aid and not a detection capability.',
  },
  {
    capability: 'V2_STATE_VERSUS_EVIDENCE',
    readiness: ['BLOCKED_PAYLOAD', 'BLOCKED_REMIT', 'BLOCKED_VOCABULARY'],
    candidates: [],
    whatIsMissing: 'no candidate in the registry addresses it. The verifier cannot see the '
      + 'property, is not asked about it, and has no declaration or challenge ground that means '
      + '"this names the evidence, not the state".',
  },
  {
    capability: 'V3_ACT_AS_PROPERTY_NARROWING',
    readiness: ['BLOCKED_REMIT'],
    candidates: [],
    whatIsMissing: 'the mandatory anti-overcorrection control has no representation at all. '
      + 'Nothing in the verifier contract distinguishes an act that IS the property from process '
      + 'language standing in for a state. Adding V2 without V3 is the §210G overcorrection risk '
      + 'moved to a new layer.',
  },
  {
    capability: 'V4_BRANCH_ALIGNMENT',
    readiness: ['BLOCKED_PAYLOAD', 'BLOCKED_REMIT'],
    candidates: [],
    whatIsMissing: 'the branches are in the payload, but without the property there is nothing to '
      + 'align them against, and no verdict expresses misalignment.',
  },
  {
    capability: 'V5_UNRESOLVED_STATE_CONTAINMENT',
    readiness: ['BLOCKED_REMIT'],
    candidates: ['C5a_SUFFICIENCY_REVIEW_PAIR'],
    whatIsMissing: 'nothing asks whether branchB has absorbed "unconfirmed". C5a is '
      + 'DERIVED_REPORT_ONLY and depends on two other candidates.',
  },
  {
    capability: 'V6_CLARIFICATION_SUFFICIENCY',
    readiness: ['PARTIAL_CANDIDATE_EXISTS'],
    candidates: ['C2a_SETTLEMENT_TEST', 'C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION'],
    whatIsMissing: 'C2a supplies a NECESSARY and deliberately weak condition, and its own record '
      + 'says it must never be reported as sufficiency. C2b needs acceptableEvidence populated, '
      + 'which is null on a capability-absent first pass.',
  },
  {
    capability: 'V7_DECISION_WHILE_UNRESOLVED',
    readiness: ['BLOCKED_PAYLOAD'],
    candidates: [],
    whatIsMissing: 'the field exists on the §210J declaration and reaches no verifier request. '
      + 'This is the cheapest gap to close: the sidecar and the assembly function already exist.',
  },
  {
    capability: 'V8_ADJACENT_FACT_DRIFT',
    readiness: ['BLOCKED_PAYLOAD', 'PARTIAL_CANDIDATE_EXISTS'],
    candidates: ['C1b_NEAREST_NEIGHBOUR_DISCRIMINATION'],
    whatIsMissing: 'the unisolated clarification and candidate blocks are the measured drift '
      + 'channel and the isolation built for them is unwired. C1b asks the verifier to name the '
      + 'nearest other supplied fact, which needs more than one fact in the request -- and the '
      + 'assembly supplies exactly one.',
  },
  {
    capability: 'V9_MULTI_FACT_ISOLATION',
    readiness: ['BLOCKED_PAYLOAD'],
    candidates: [],
    whatIsMissing: 'owedFacts is already a single-element array, so fact-level isolation holds. '
      + 'The contamination channel is the FULL clarification list and the FULL candidate block, '
      + 'neither isolated. §210B-1 measured that its own isolation is partial: four of eight slots '
      + 'fully isolated, two partial, two not at all, because the binding field is inconsistently '
      + 'populated.',
  },
  {
    capability: 'V10_CHALLENGE_REVIEWABILITY',
    readiness: ['PARTIAL_CANDIDATE_EXISTS'],
    candidates: ['C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE'],
    whatIsMissing: 'C6a is prototyped and highest-ranked, and closes the ground vocabulary at two '
      + 'members. See C6A_CLOSES_THE_GROUND_VOCABULARY.',
  },
];

/** Which §201 candidates the registry actually holds. Read from the registry, not listed by hand. */
export const CANDIDATE_COVERAGE = {
  registrySize: VNEXT_CANDIDATES.length,
  prototyped: VNEXT_CANDIDATES.filter(c => c.build === 'PROTOTYPED').map(c => c.id),
  capabilitiesWithNoCandidate: CAPABILITY_COVERAGE
    .filter(r => r.candidates.length === 0).map(r => r.capability),
} as const;

// ---------------------------------------------------------------- 5. the remediation, specified

export const REMEDIATION_IDS = ['R-A_PAYLOAD', 'R-B_VOCABULARY', 'R-C_REMIT'] as const;
export type RemediationId = (typeof REMEDIATION_IDS)[number];

export interface RemediationSpec {
  readonly id: RemediationId;
  readonly blocks: readonly TargetedCapability[];
  readonly change: string;
  readonly alreadyBuilt: string;
  readonly stillToBuild: string;
  readonly touchesPinnedFile: boolean;
  readonly implementedHere: false;
}

/**
 * The minimal remediation that would make the §211 instrument executable. SPECIFIED, NOT BUILT --
 * §211 authorizes inspection and design, and a protocol change is its own authorization.
 */
export const REQUIRED_REMEDIATION: readonly RemediationSpec[] = [
  {
    id: 'R-A_PAYLOAD',
    blocks: ['V1_EXACT_PROPERTY_IDENTITY', 'V4_BRANCH_ALIGNMENT', 'V7_DECISION_WHILE_UNRESOLVED',
      'V8_ADJACENT_FACT_DRIFT', 'V9_MULTI_FACT_ISOLATION'],
    change: 'render the eleven required fields in the verifier user prompt, and apply the §210B-1 '
      + 'clarification and candidate isolation to the ancillary blocks',
    alreadyBuilt: 'buildVerifier210jView assembles seven slots; explicitOwedProperty carries the '
      + 'property byte-exact; isolateClarifications and isolateCandidates exist and are tested',
    stillToBuild: 'the wiring into assembleVerifierRequests and buildVerifierV3UserPrompt, the '
      + 'declarationId carriage, and C2b\'s provenance gate for acceptableEvidence',
    touchesPinnedFile: false,
    implementedHere: false,
  },
  {
    id: 'R-B_VOCABULARY',
    blocks: ['V2_STATE_VERSUS_EVIDENCE', 'V4_BRANCH_ALIGNMENT', 'V10_CHALLENGE_REVIEWABILITY'],
    change: 'adopt C6a AND add a third challenge ground for property identity, with the evidence '
      + 'that ground requires; so a property-collapse finding has somewhere to land',
    alreadyBuilt: 'C6a is prototyped, reversible and grammar-costed',
    stillToBuild: 'the third ground, its required evidence field, and its admission rule. C6a as '
      + 'designed would CLOSE the vocabulary against it.',
    touchesPinnedFile: false,
    implementedHere: false,
  },
  {
    id: 'R-C_REMIT',
    blocks: ['V1_EXACT_PROPERTY_IDENTITY', 'V2_STATE_VERSUS_EVIDENCE',
      'V3_ACT_AS_PROPERTY_NARROWING', 'V4_BRANCH_ALIGNMENT', 'V5_UNRESOLVED_STATE_CONTAINMENT'],
    change: 'the verifier instruction must ask the property question, and must carry the '
      + 'act-as-property narrowing as a mandatory counter-control in the same block',
    alreadyBuilt: 'nothing. The registry has no candidate for the remit.',
    stillToBuild: 'the instruction block and its narrowing, built by construction from v3.2 at a '
      + 'unique anchor and reversible byte for byte, as every successor in this lineage is',
    touchesPinnedFile: false,
    implementedHere: false,
  },
];

/** The one sentence a reader must not be able to miss. */
export const HOSTED_VALIDATION_READINESS = {
  executableToday: false,
  because: 'V1, V2, V3 and V4 are the capabilities §211 exists to validate, and all four are '
    + 'blocked by the payload, the remit or the vocabulary. Executing the instrument against '
    + "today's verifier would measure a verifier that was never asked the question, and a clean "
    + 'result would mean nothing.',
  blockedCapabilities: CAPABILITY_COVERAGE
    .filter(r => r.readiness.some(x => x.startsWith('BLOCKED'))).map(r => r.capability),
  slotsAlreadyAssembledBy210J: VERIFIER_SLOTS_210J.length,
} as const;
