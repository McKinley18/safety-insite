/**
 * §201 EXPERT HAZLENZ -- VERIFIER vNEXT CANDIDATE REPRESENTATIONS.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 * ZERO DATABASE OPERATIONS.
 *
 * ==================== WHAT THIS MODULE IS, AND WHAT IT IS NOT ====================
 *
 * It is a CANDIDATE REGISTRY. Every entry is a proposed representational change to the verifier
 * protocol, expressed as (a) prompt lines inserted at a named anchor, (b) JSON-schema property
 * patches, and (c) deterministic admission rules -- all built BY CONSTRUCTION from the current head
 * of the lineage (`v3.2` instruction, `v3.2` admission) and all REVERSIBLE to it byte-for-byte.
 *
 * NOTHING HERE IS A PROTOCOL VERSION. No candidate is `v3.4`. Naming one would attach a hash to a
 * design that has had no hosted validation, and the lineage discipline in this repository is that a
 * version number is earned by a preregistered run, not by a good idea. `applyCandidates` produces
 * an artifact you can hash, diff and cost; promoting one to `v3.4` is a separate authorization.
 *
 * ==================== THE ONE THING THIS MODULE MAY NOT DO ====================
 *
 * No candidate here was derived from, tuned against, or justified by any §199 semantic verdict.
 * **There are none: 0 of the 152 §200 slots are filled.** Every argument below is STRUCTURAL --
 * it names a state the current representation can enter, or a distinction it cannot carry, and it
 * is checkable by reading the artifacts rather than by knowing what a model answered. Where a class
 * cannot be argued structurally, that is said instead of filled in.
 *
 * ==================== ADDITIVE SCHEMA GROWTH IS NOT FREE ====================
 *
 * §199 rejected both capability-PRESENT rows before generation:
 *
 *     HTTP 400 invalid_request_error -- "The compiled grammar is too large, which would cause
 *     performance issues. Simplify your tool schemas or reduce the number of strict tools."
 *
 * The FIRST-PASS schema at ~19,060 sent bytes was refused and ~18,620 was accepted. The verifier
 * schema is a DIFFERENT request and is much smaller (v3.2 measures 4,998 bytes, 52 nodes, 25 enum
 * members), so it has visible headroom the first pass does not -- but the provider's stated metric
 * is COMPILED GRAMMAR COMPLEXITY, the threshold is undocumented, and an `enum`-constrained
 * construct expands far beyond its serialised length. So `grammarCost` reports four figures, not
 * one, and every candidate carries its measured delta. **No candidate may be described as cheap on
 * bytes alone, and no combination may be sent without an offline build plus a single-row transport
 * canary -- the §199 pattern that worked and cost one call.**
 *
 * ==================== THE UNSCANNED-PROSE HAZARD, WHICH IS EASY TO MISS ====================
 *
 * `verifierFreeTextStrings` (§193) is a FIXED, HAND-WRITTEN FIELD LIST. v3.2 had to scan its one
 * new prose field (`regulatoryBasis.proposition`) itself, precisely because §193 could not know
 * about it. Every candidate here that adds a prose field therefore ADDS AN UNSCANNED CITATION
 * SURFACE unless it also extends the scan. `vnextScannedStrings` does that extension, each
 * candidate declares its own `newFreeTextFields`, and the proof suite fails if a declared field is
 * not actually scanned. This is a structural property of adding prose to this contract, and it
 * costs something on every single candidate that does.
 */

import {
  EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './expert-verifier-instruction-v3-2';
import {
  checkVerifierV3_2Output, type V3_2AdmissionInput, type V3_2AdmissionResult,
} from './expert-verifier-contract-v3-2';
import { v3_3ScannedStrings } from './expert-verifier-contract-v3-3';
import { CITATION_SHAPED_PATTERN } from
  '../../src/hazlenz/expert-hazlenz/expert-contract.types';

export const EXPERT_201_VERIFIER_VNEXT_VERSION =
  'hazlenz.expert.verifier-vnext.candidates.201' as const;

/** Stated in code so no caller can read a candidate as an enabled protocol. */
export const CANDIDATE_STATUS = {
  IS_A_PROTOCOL_VERSION: false,
  REACHABLE_FROM_PRODUCTION: false,
  HOSTED_VALIDATION_PERFORMED: false,
  DERIVED_FROM_ANY_SECTION_199_SEMANTIC_VERDICT: false,
  SECTION_200_VERDICT_SLOTS_FILLED_BY_THIS_MODULE: 0,
} as const;

// ==================================================================== the six defect classes

export const VNEXT_CLASSES = [
  'C1_EXACT_OWED_TARGET',
  'C2_RESOLUTION_SUFFICIENCY',
  'C3_COMPOUND_QUESTION',
  'C4_TEMPORAL_SCOPE',
  'C5_FUNCTION_VS_APPEARANCE',
  'C6_CHALLENGE_REVIEWABILITY',
] as const;
export type VnextClass = (typeof VNEXT_CLASSES)[number];

/**
 * The structural defect for each class, stated as something you can check by reading the current
 * artifacts. Not one of these sentences refers to a model answer.
 */
export const STRUCTURAL_DEFECTS: Readonly<Record<VnextClass, string>> = {
  C1_EXACT_OWED_TARGET:
    'A `bindingFactKey` is an OPAQUE IDENTIFIER. The admission rule proves the verifier NAMED a '
    + 'member of the supplied set; no field carries what the verifier took that member to be ABOUT, '
    + 'so a verdict aimed at a neighbouring property and a verdict aimed at the owed property are '
    + 'THE SAME ARTIFACT. The asymmetry is visible in the code: `V3SuppliedOwedFact` renders '
    + 'factKey, affectedDecision, whyUnresolved, both branches and both decisions, and the '
    + 'first-pass `missingFact` reaches neither the projected `OwedFact` nor the verifier prompt.',
  C2_RESOLUTION_SUFFICIENCY:
    '`proposedClarification` carries question, whyItMatters, affectedDecision and evidenceGap -- '
    + 'four prose fields, none of which states what an ANSWER would have to consist of. A '
    + 'nomination, by contrast, is REQUIRED to state two answer states and two diverging decisions '
    + 'and is refused if they do not diverge. The verifier is therefore held to a higher '
    + 'representational standard for a fact it invents than for a question it proposes.',
  C3_COMPOUND_QUESTION:
    'The contract admits AT MOST ONE `proposedClarification` and AT MOST ONE `bindingFactKey`, and '
    + 'refuses a second bound declaration with MORE_THAN_ONE_FACT_DECLARED_BOUND. A verifier facing '
    + 'two supplied facts that each need a question has NO LEGAL WAY to supply two. The compound '
    + 'string is not a lapse the representation permits; it is the only shape the representation '
    + 'leaves. `structural-questions.ts` already refuses to equate one string with one fact at the '
    + 'HazLenz assembly layer, so the two layers currently disagree about the same invariant.',
  C4_TEMPORAL_SCOPE:
    'Nothing in the proposal expresses the MOMENT an answer must speak for. "Was the interlock '
    + 'verified?" and "was the interlock verified after the overhaul and before restart?" are '
    + 'indistinguishable to every deterministic rule in the contract, and to a reviewer reading the '
    + 'structured output rather than the prose. The first-pass prompt gained an explicit '
    + 'verification-time rule (v14/§176) and a property rule (v15/§178); the VERIFIER OUTPUT gained '
    + 'no field in which either determination is recorded.',
  C5_FUNCTION_VS_APPEARANCE:
    '`OwedFact.acceptableEvidence` ALREADY EXISTS, already carries `requirement`, `examples` and '
    + '`insufficientExamples`, and already has a provenance vocabulary restricting who may author '
    + 'it. `V3SuppliedOwedFact` DOES NOT CARRY IT. The component whose declared job includes '
    + 'judging whether a question would settle a fact is never shown the architecture\'s own '
    + 'statement of what would settle it, and emits no field naming what its question would accept.',
  C6_CHALLENGE_REVIEWABILITY:
    'A challenge is one enum token plus one free-text `challengeReason`. The prompt names TWO '
    + 'grounds -- the observation already settles it, or both answers lead to the same action -- '
    + 'which need DIFFERENT evidence and DIFFERENT arbitration, and the representation collapses '
    + 'them into one string. The sharpest asymmetry: a NOMINATION asserting the observation leaves '
    + 'a fact open MUST quote a verbatim span, checked by containment. A CHALLENGE asserting the '
    + 'observation settles a fact need not point anywhere at all.',
};

// ==================================================================== patch shapes

export interface PromptPatch {
  /** Must appear EXACTLY ONCE in the base prompt, or application aborts. */
  readonly anchor: string;
  readonly lines: readonly string[];
  /** Why HERE. Placement is part of the fix in this repository, never an afterthought. */
  readonly placementRationale: string;
}

export type SchemaPatchSite = 'ROOT' | 'PROPOSAL' | 'DECLARATION_ITEM';

export interface SchemaPatch {
  readonly site: SchemaPatchSite;
  readonly name: string;
  readonly node: Record<string, unknown>;
  /** Whether the property joins its object's `required` list. */
  readonly required: boolean;
}

export interface CandidateScore {
  readonly value: 1 | 2 | 3 | 4 | 5;
  readonly feasibility: 1 | 2 | 3 | 4 | 5;
  readonly risk: 1 | 2 | 3 | 4 | 5;
  readonly valueWhy: string;
  readonly feasibilityWhy: string;
  readonly riskWhy: string;
}

export interface VnextCandidate {
  readonly id: string;
  readonly klass: VnextClass;
  readonly title: string;
  /** PROTOTYPED carries patches and rules; RECORDED_ONLY is analysed and deliberately not built. */
  readonly build: 'PROTOTYPED' | 'DERIVED_REPORT_ONLY' | 'RECORDED_ONLY';
  readonly summary: string;
  /** Conditions this candidate's admission rules DECIDE, by byte comparison only. */
  readonly deterministicallyDecides: readonly string[];
  /** Conditions it explicitly does NOT decide. Every candidate must name at least one. */
  readonly requiresHumanTruth: readonly string[];
  /** Prose fields it adds. Each MUST be reachable from `vnextScannedStrings`. */
  readonly newFreeTextFields: readonly string[];
  /** A change to what the verifier is SHOWN, not to what it returns. Null when there is none. */
  readonly inputSideChange: string | null;
  readonly hostedValidation: string;
  readonly dependsOn: readonly string[];
  readonly promptPatches: readonly PromptPatch[];
  readonly schemaPatches: readonly SchemaPatch[];
  readonly score: CandidateScore;
}

// ==================================================================== C1 -- exact owed target

const C1A: VnextCandidate = {
  id: 'C1a_OWED_PROPERTY_RESTATEMENT',
  klass: 'C1_EXACT_OWED_TARGET',
  title: 'The verifier restates, in its own words, the property it takes each addressed fact to be '
    + 'about',
  build: 'PROTOTYPED',
  summary:
    'One required sentence per declaration that BINDS or CHALLENGES: "the property I take this fact '
    + 'to be about is X". Nothing checks X for correctness -- that is the point. Today a reviewer '
    + 'comparing a verdict against an owed fact must RECONSTRUCT the verifier\'s target from '
    + 'rationale prose; with this field the comparison is between two named properties and the '
    + 'drift is visible rather than inferred. It also restores, on the verifier side only, the '
    + 'information the projection drops when `missingFact` does not reach `OwedFact`.',
  deterministicallyDecides: [
    'the restatement is present and non-blank exactly when the declaration BINDS or CHALLENGES',
    'the restatement is null on STILL_UNRESOLVED, so output stays bounded by work actually done',
  ],
  requiresHumanTruth: [
    'whether the restated property is the property the owed fact is actually about',
    'whether the restatement describes the question the verifier wrote, or merely re-reads the fact',
  ],
  newFreeTextFields: ['owedFactDeclarations[].owedPropertyAsUnderstood'],
  inputSideChange: null,
  hostedValidation:
    'A prospective cohort measuring only that the field is populated legally and that a human '
    + 'reviewer can adjudicate exact-target binding FROM THE STRUCTURED OUTPUT ALONE. The '
    + 'reviewability claim is the claim; no behavioural improvement is claimed or measurable here.',
  dependsOn: [],
  promptPatches: [{
    anchor: '   exactly where it was, however closely related the two sound.',
    placementRationale:
      'Immediately after "ONE FACT DOES NOT COVER ANOTHER", which is the existing statement of the '
      + 'exact-target rule. The restatement is the evidence for that rule, so it belongs beside it '
      + 'rather than in the question-quality paragraph, where it would read as a wording exercise.',
    lines: [
      '',
      '   AND FOR EACH FACT YOU BIND OR CHALLENGE, NAME THE PROPERTY. One sentence, in your own',
      '   words: the property of this fact that you take to be unknown. Not the topic, not the',
      '   equipment, not the hazard -- the property whose answer is missing. Write it from the fact',
      '   as you were given it, before you look at any question. Where you are declaring',
      '   STILL_UNRESOLVED, leave this null: you are not addressing that fact and there is nothing',
      '   to name.',
      '',
      '   Nothing checks this sentence and nothing is graded on it. It exists so a person reviewing',
      '   your verdict can see WHICH property you were aiming at instead of guessing it from your',
      '   reasoning. If naming it makes you realise you were aiming at a neighbouring property,',
      '   that is the sentence doing its work; change your answer, not the sentence.',
    ],
  }],
  schemaPatches: [{
    site: 'DECLARATION_ITEM',
    name: 'owedPropertyAsUnderstood',
    required: true,
    node: {
      type: ['string', 'null'],
      description:
        'One sentence naming the PROPERTY of this fact you take to be unknown, in your own words. '
        + 'Required for BOUND_BY_CLARIFICATION and CHALLENGE_FACT_VALIDITY. NULL for '
        + 'STILL_UNRESOLVED. This is read by a person and is not checked automatically.',
    },
  }],
  score: {
    value: 4, feasibility: 5, risk: 2,
    valueWhy: 'It converts axis-L review from inference over prose into comparison of two named '
      + 'properties, and it does so without granting the model any authority.',
    feasibilityWhy: 'One nullable string on an existing array item. No enum, no new object, no '
      + 'input-side change, no interaction with any existing admission rule.',
    riskWhy: 'Adds prose that must be added to the citation scan, and lengthens output on every '
      + 'bound or challenged fact. A restatement is also an invitation to post-hoc rationalise the '
      + 'target after choosing it, which the prompt block explicitly counter-instructs.',
  },
};

const C1B: VnextCandidate = {
  id: 'C1b_NEAREST_NEIGHBOUR_DISCRIMINATION',
  klass: 'C1_EXACT_OWED_TARGET',
  title: 'When more than one fact was supplied, a binding names the nearest other supplied fact and '
    + 'says why not that one',
  build: 'PROTOTYPED',
  summary:
    'The failure mode this class names is DRIFT TO A NEIGHBOUR, and a neighbour is by definition '
    + 'another member of the supplied set. So the discrimination is expressible in the closed-set '
    + 'discipline the contract already uses: name a second supplied key, and it must be a supplied '
    + 'key that is not the bound one. Only the KEY is checked; the reason beside it is prose for a '
    + 'reviewer. Inapplicable, and refused, when only one fact was supplied -- there is no '
    + 'neighbour to discriminate from.',
  deterministicallyDecides: [
    'the named neighbour key is a member of the supplied set, by exact string equality',
    'the neighbour key is not the binding key',
    'the discrimination is present exactly when a binding exists and >= 2 facts were supplied',
  ],
  requiresHumanTruth: [
    'whether the named neighbour is genuinely the nearest one',
    'whether the stated distinction is the distinction that matters',
  ],
  newFreeTextFields: ['targetDiscrimination.whyNotThatOne'],
  inputSideChange: null,
  hostedValidation:
    'A prospective cohort restricted to rows supplying >= 2 owed facts, which is the only '
    + 'population where the field is live. Sample size must be computed over that population and '
    + 'not over all rows -- the denominator is the executions where the behaviour was available.',
  dependsOn: [],
  promptPatches: [{
    anchor: '   exactly where it was, however closely related the two sound.',
    placementRationale:
      'Same anchor as C1a and for the same reason: this is the exact-target rule, and the '
      + 'discrimination is the closed-set half of the evidence for it.',
    lines: [
      '',
      '   AND WHEN YOU BIND WHILE HOLDING MORE THAN ONE FACT, SAY WHICH OTHER ONE YOU DID NOT MEAN.',
      '   Name the supplied key closest to the one you bound, copied exactly, and say in one line',
      '   what separates them. If you cannot say what separates them, you are not yet sure which of',
      '   the two you are answering, and the honest answer is to bind neither.',
    ],
  }],
  schemaPatches: [{
    site: 'ROOT',
    name: 'targetDiscrimination',
    required: true,
    node: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['nearestOtherFactKey', 'whyNotThatOne'],
      description:
        'Required when you bind a fact AND more than one fact was supplied. NULL otherwise -- '
        + 'including when only one fact was supplied, where there is no neighbour to name.',
      properties: {
        nearestOtherFactKey: {
          type: 'string',
          description: 'A supplied factKey OTHER than the one in bindingFactKey, copied EXACTLY.',
        },
        whyNotThatOne: {
          type: 'string',
          description: 'One line separating the two. Read by a person; not checked automatically.',
        },
      },
    },
  }],
  score: {
    value: 3, feasibility: 4, risk: 2,
    valueWhy: 'Turns "did it drift to a neighbour" from an open semantic question into a claim the '
      + 'verifier has to make explicitly and a reviewer can check against the supplied set.',
    feasibilityWhy: 'A nullable object with one closed-set string. Its applicability is conditional '
      + 'on the supplied-fact count, which the admission input already carries.',
    riskWhy: 'A conditional required field is the shape that produced the v3 `clarificationSource'
      + 'Mode` self-contradiction; the description must state the condition once and only once. It '
      + 'also does nothing on single-fact rows, which may be most rows.',
  },
};

// ==================================================================== C2 -- resolution sufficiency

const C2A: VnextCandidate = {
  id: 'C2a_SETTLEMENT_TEST',
  klass: 'C2_RESOLUTION_SUFFICIENCY',
  title: 'A proposed question must state the two answers it admits and what is done under each',
  build: 'PROTOTYPED',
  summary:
    'The nomination path already requires branchA/branchB and decisionIfA/decisionIfB and is '
    + 'refused when the decisions are byte-identical. This candidate applies the SAME structure to '
    + 'the proposed question: state the answer that would establish the property, the answer that '
    + 'would refute it, and what is done today under each. The check is byte inequality -- the '
    + 'identical rule already in the contract, applied to the artifact that reaches the customer.\n'
    + 'THE REPO HAS REPEATEDLY REFUSED DETERMINISTIC MATCHERS OVER PROSE, AND THIS IS NOT ONE. '
    + 'Nothing reads the question text, nothing compares the question to the fact, and nothing '
    + 'scores similarity. The verifier DECLARES a structure and the structure is checked for '
    + 'internal consistency, exactly as `clarificationSourceMode` is checked against the payload. '
    + 'What it establishes is a NECESSARY condition -- a question whose two admitted answers lead '
    + 'to the same action cannot settle anything -- and never a sufficient one.',
  deterministicallyDecides: [
    'the two declared answers are not byte-identical',
    'the two declared decisions are not byte-identical',
    'all four fields are present and non-blank whenever a clarification is proposed',
  ],
  requiresHumanTruth: [
    'whether the question as written actually admits only those two answers',
    'whether either declared answer would establish the owed property',
    'whether the declared decisions are the decisions that would really follow',
  ],
  newFreeTextFields: [
    'proposedClarification.settlementTest.answerEstablishing',
    'proposedClarification.settlementTest.answerRefuting',
    'proposedClarification.settlementTest.decisionIfEstablishing',
    'proposedClarification.settlementTest.decisionIfRefuting',
  ],
  inputSideChange: null,
  hostedValidation:
    'A prospective cohort on rows where a clarification is actually proposed. Two things must be '
    + 'measured separately: that the four fields are legally populated, and -- by human sampling -- '
    + 'whether the declared answers are answers the written question would actually receive. The '
    + 'second is the whole risk and cannot be measured mechanically.',
  dependsOn: [],
  promptPatches: [{
    anchor: 'HAZARD_SEVERITY, EXPOSURE, APPLICABILITY, REQUIRED_CONTROL, REGULATORY_INTERPRETATION.',
    placementRationale:
      'At the end of the question-quality paragraph, which is where the contract already states '
      + 'what a supplied question must be. Step 3 tests whether the FIRST PASS\'s question is '
      + 'sufficient; this tests the same thing about the verifier\'s own, and belongs where the '
      + 'verifier\'s own question is specified.',
    lines: [
      '',
      'AND BEFORE YOU SUBMIT A QUESTION, ANSWER IT YOURSELF, BOTH WAYS. Write the answer that would',
      'establish the property, and the answer that would refute it, in the words the person at the',
      'workplace would actually use. Then write what is done TODAY under each. If the same thing is',
      'done under both, your question does not settle anything and you should not ask it. If you',
      'cannot write an answer that would ESTABLISH the property -- only ones that would make it',
      'seem likely -- the question reaches the topic and not the fact, and it needs rewriting',
      'rather than submitting.',
    ],
  }],
  schemaPatches: [{
    site: 'PROPOSAL',
    name: 'settlementTest',
    required: true,
    node: {
      type: 'object',
      additionalProperties: false,
      required: ['answerEstablishing', 'answerRefuting', 'decisionIfEstablishing',
        'decisionIfRefuting'],
      description:
        'The two answers your question admits and what is done TODAY under each. The two answers '
        + 'must differ, and the two decisions must differ -- a question whose answers lead to the '
        + 'same action settles nothing.',
      properties: {
        answerEstablishing: {
          type: 'string',
          description: 'The answer that would ESTABLISH the property, in the answerer\'s words.',
        },
        answerRefuting: {
          type: 'string',
          description: 'The answer that would REFUTE it. Must differ from answerEstablishing.',
        },
        decisionIfEstablishing: { type: 'string', description: 'What is done TODAY under it.' },
        decisionIfRefuting: {
          type: 'string',
          description: 'What is done TODAY under it. MUST DIFFER from decisionIfEstablishing.',
        },
      },
    },
  }],
  score: {
    value: 4, feasibility: 5, risk: 2,
    valueWhy: 'It supplies the first deterministic necessary condition on resolution sufficiency '
      + 'this contract has ever had, and it does so by reusing a rule already in the file.',
    feasibilityWhy: 'A structural clone of the nomination branch pattern, checked by the same two '
      + 'byte comparisons. No new vocabulary and no input-side change.',
    riskWhy: 'Four prose fields on every proposed clarification is the largest prose addition of '
      + 'any candidate here, and a verifier can satisfy byte inequality with two answers that '
      + 'differ only in wording. The condition is necessary and weak, and must never be reported '
      + 'as sufficiency.',
  },
};

const C2B: VnextCandidate = {
  id: 'C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION',
  klass: 'C2_RESOLUTION_SUFFICIENCY',
  title: 'Show the verifier the fact\'s own `acceptableEvidence`, and make it declare which class '
    + 'its question would accept',
  build: 'PROTOTYPED',
  summary:
    'The architecture already holds, per fact, a governed statement of what would settle it: '
    + '`OwedFact.acceptableEvidence` with `requirement`, `examples`, `insufficientExamples` and a '
    + 'restricted `provenance`. `V3SuppliedOwedFact` does not render it and the verifier has no '
    + 'field naming what its question accepts. This candidate closes both halves: render the '
    + 'criterion (provenance-gated) and require the verifier to name the evidence class its '
    + 'question would accept, BOUND BY EXACT STRING EQUALITY to one of the supplied lists.\n'
    + 'The one refusal it adds is PROPERTY-RELATIVE and never blanket: a question is refused only '
    + 'when the verifier\'s own declared accepted class is exact-string-equal to a member of THIS '
    + 'FACT\'S OWN `insufficientExamples`, authored under a production-permitted provenance. No '
    + 'evidence class is declared weak anywhere; the same class may settle the fact next door.',
  deterministicallyDecides: [
    'the declared class is exact-string-equal to a member of one of the supplied lists, or is '
      + 'declared NOT_AMONG_THOSE_SUPPLIED',
    'the declared binding agrees with which list the class actually appears in',
    'the declared class is not a member of THIS fact\'s own insufficientExamples',
    'the criterion is only enforced when its provenance is production-permitted',
  ],
  requiresHumanTruth: [
    'whether the question as written really would accept only that class',
    'whether the governed criterion is itself correct for this fact',
    'whether a class absent from both lists would settle the fact',
  ],
  newFreeTextFields: ['acceptedEvidence.evidenceClass'],
  inputSideChange:
    'The verifier user prompt renders `acceptableEvidence.requirement`, `examples` and '
    + '`insufficientExamples` for each supplied fact -- BUT ONLY where `provenance` is one of '
    + 'PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES. DEVELOPMENT_HUMAN_TRUTH, ADJUDICATION_LABEL and '
    + 'MODEL_SELF_AUTHORED must never be rendered: the first two are grading truth, and the v3 '
    + 'prompt builder already asserts that no human disposition reaches the model. This is a '
    + 'leak surface, `renderableAcceptableEvidence` is the gate, and it fails closed to null.',
  hostedValidation:
    'Two separate things. (1) A prospective cohort on rows whose facts carry a non-null criterion '
    + 'with a permitted provenance -- the only population where the refusal is live. (2) A '
    + 'PRECISION cohort on rows where the criterion is null or non-permitted, proving the field '
    + 'degrades to an ungated declaration and refuses nothing. Both must precede any use.',
  dependsOn: [],
  promptPatches: [{
    anchor: 'HAZARD_SEVERITY, EXPOSURE, APPLICABILITY, REQUIRED_CONTROL, REGULATORY_INTERPRETATION.',
    placementRationale:
      'Also at the end of the question-quality paragraph, and deliberately AFTER C2a in reading '
      + 'order when both are applied: answering your own question both ways is what tells you what '
      + 'class of evidence the answer consists of, so the declaration follows the test rather than '
      + 'preceding it.',
    lines: [
      '',
      'AND NAME WHAT YOUR QUESTION WOULD ACCEPT. Where the fact you are answering came with a',
      'statement of what would settle it, that statement lists classes of evidence that would, and',
      'classes that would not. Copy the class YOUR question would accept exactly from one of those',
      'lists, and say which list it came from. If your question would accept something on neither',
      'list, say NOT_AMONG_THOSE_SUPPLIED and name it in your own words.',
      '',
      'If the class you would accept is on the list of things that would NOT settle THIS fact, your',
      'question does not settle it either, whatever it names. Rewrite the question to demand',
      'evidence of the property itself. This says nothing about that class of evidence in general:',
      'the same evidence may settle the next fact completely, and where a fact came with no such',
      'statement there is nothing here to check against and you simply name what you would accept.',
    ],
  }],
  schemaPatches: [{
    site: 'ROOT',
    name: 'acceptedEvidence',
    required: true,
    node: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['evidenceClass', 'boundTo'],
      description:
        'Required when you propose a clarification bound to a supplied fact. NULL otherwise. Names '
        + 'the class of evidence AN ANSWER to your question would consist of.',
      properties: {
        evidenceClass: {
          type: 'string',
          description: 'Copied EXACTLY from one of the supplied lists where it appears on one, and '
            + 'in your own words where it appears on neither.',
        },
        boundTo: {
          type: 'string',
          enum: ['SUPPLIED_ACCEPTABLE_EXAMPLE', 'SUPPLIED_INSUFFICIENT_EXAMPLE',
            'NOT_AMONG_THOSE_SUPPLIED'],
          description: 'Which supplied list the class was copied from. Must agree with where the '
            + 'string actually appears.',
        },
      },
    },
  }],
  score: {
    value: 5, feasibility: 3, risk: 3,
    valueWhy: 'It is the only candidate that makes sufficiency CHECKABLE against an authority '
      + 'outside the model, using governance the repository already built and does not currently '
      + 'connect to anything.',
    feasibilityWhy: 'It needs an input-side prompt change, a provenance gate, and a criterion that '
      + 'is null on most facts today -- so its live population may be small until '
      + '`acceptableEvidence` is populated from a trustworthy production source.',
    riskWhy: 'The input-side render is a genuine grading-truth leak surface and must fail closed. '
      + 'Rendering the criterion also tells the model what a good answer looks like, which can '
      + 'improve the declaration without improving the question -- so the human sample is not '
      + 'optional here.',
  },
};

// ==================================================================== C3 -- compound question

const C3A: VnextCandidate = {
  id: 'C3a_SECOND_CLARIFICATION_SLOT',
  klass: 'C3_COMPOUND_QUESTION',
  title: 'One additional clarification slot, binding a DIFFERENT supplied fact',
  build: 'PROTOTYPED',
  summary:
    'Raises the ceiling from one question to two while keeping the invariant that ONE QUESTION '
    + 'BINDS ONE FACT, which is `structural-questions.ts`\'s invariant expressed in the verifier '
    + 'contract for the first time. A fixed second slot rather than an array: the grammar cost is '
    + 'one object clone rather than an unbounded repetition, and reverting is a property deletion.\n'
    + 'IT COLLIDES WITH A FROZEN RULE AND IS HANDLED THE WAY §196 HANDLED THE SAME PROBLEM. Two '
    + 'legal bindings trip MORE_THAN_ONE_FACT_DECLARED_BOUND and BOUND_DECLARATION_DISAGREES_WITH_'
    + 'BINDING_KEY in the unmodified v3 layer. Rather than edit v3 -- which would detach §187-§199 '
    + 'from the hashes that produced them -- the composed checker WITHDRAWS exactly those two '
    + 'refusals, and only when they are the SOLE objections and the offending key is exactly the '
    + 'second slot\'s declared binding. That is the v3.3 citation-reuse pattern applied unchanged.',
  deterministicallyDecides: [
    'the second slot exists only under ADD_OR_REPLACE_CLARIFICATION and only alongside a first',
    'its binding key is a supplied key and differs from the first slot\'s',
    'its four proposal fields are present and its affectedDecision is a contract member',
    'the withdrawal fires only when those two codes are the only objections and the detail strings '
      + 'reconstruct exactly',
  ],
  requiresHumanTruth: [
    'whether two questions were genuinely needed rather than one',
    'whether either question reaches the fact it binds',
  ],
  newFreeTextFields: [
    'additionalProposedClarification.question',
    'additionalProposedClarification.whyItMatters',
    'additionalProposedClarification.evidenceGap',
  ],
  inputSideChange: null,
  hostedValidation:
    'The heaviest of any candidate here. A prospective cohort must measure question INFLATION '
    + 'first: raising a ceiling is an invitation to fill it, and the §165 question budget governs '
    + 'assembly rather than the verifier. Rows supplying one fact are the control -- the slot must '
    + 'stay null there. Nothing may be concluded before the inflation arm reads out.',
  dependsOn: [],
  promptPatches: [{
    anchor: '     nominate one fact of your own in the same answer.',
    placementRationale:
      'Inside the ADD_OR_REPLACE_CLARIFICATION verdict description, which is the one place the '
      + 'contract states how many questions a verdict may carry. Stating it anywhere else would '
      + 'leave the verdict description saying "the question" while the schema offered two.',
    lines: [
      '',
      '     TWO FACTS NEED TWO QUESTIONS. If a second supplied fact also needs asking about, write',
      '     a SECOND question for it and bind that one to its own key. Never write one question',
      '     covering both: a person answering it will answer the easier half, and the other fact',
      '     will look handled when nothing about it was established. There is no third slot, and',
      '     there is no expected number of questions -- one, or none, is the usual answer, and a',
      '     second slot you fill because it is there is a question you should not have asked.',
    ],
  }],
  schemaPatches: [{
    site: 'ROOT',
    name: 'additionalProposedClarification',
    required: true,
    node: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap', 'bindingFactKey'],
      description:
        'A SECOND question, for a DIFFERENT supplied fact. NULL unless a second supplied fact '
        + 'genuinely needs asking about. Legal only alongside a first clarification under '
        + 'ADD_OR_REPLACE_CLARIFICATION.',
      properties: {
        question: { type: 'string' },
        whyItMatters: { type: 'string' },
        affectedDecision: {
          type: 'string',
          enum: ['HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY',
            'REQUIRED_CONTROL', 'REGULATORY_INTERPRETATION'],
        },
        evidenceGap: { type: 'string' },
        bindingFactKey: {
          type: 'string',
          description: 'A supplied factKey, copied EXACTLY, and NOT the one in bindingFactKey.',
        },
      },
    },
  }],
  score: {
    value: 4, feasibility: 3, risk: 4,
    valueWhy: 'It removes the representational cause of compound questions rather than trying to '
      + 'detect them, and it aligns the verifier contract with an invariant the assembly layer '
      + 'already enforces.',
    feasibilityWhy: 'The schema and prompt work is small, but it requires a v3.3-style withdrawal '
      + 'of two frozen refusals, and every downstream consumer -- the ledger bridge, the budget, '
      + 'the projection -- currently assumes at most one proposal.',
    riskWhy: 'Raising a question ceiling is the classic route to question inflation, which this '
      + 'programme has repeatedly refused to buy recall with. A withdrawal path is also the most '
      + 'delicate construct in the lineage and gets one wrong condition away from admitting a '
      + 'genuinely double-bound verdict.',
  },
};

const C3B: VnextCandidate = {
  id: 'C3b_UNBOUNDED_CLARIFICATION_ARRAY',
  klass: 'C3_COMPOUND_QUESTION',
  title: 'Replace the single proposal with an array of one-fact proposals',
  build: 'RECORDED_ONLY',
  summary:
    'The general form of C3a, and the honest one: N facts, N questions. It is RECORDED AND NOT '
    + 'PROTOTYPED for three reasons, each structural. (1) An array of objects is the construct the '
    + '§199 grammar failure names -- repetition plus an inner enum is precisely what expands. (2) '
    + '`MORE_THAN_ONE_PROPOSED_CLARIFICATION` is a v1 invariant carried unchanged through v2 and '
    + 'v3; withdrawing it is not a composition, it is a rewrite of the layer §187-§199 are '
    + 'attached to. (3) It removes any ceiling on questions at exactly the layer that has no '
    + 'budget, so the budget would have to move before the array could exist. C3a is the same idea '
    + 'bounded at two, which is where it can be validated cheaply.',
  deterministicallyDecides: [],
  requiresHumanTruth: [],
  newFreeTextFields: [],
  inputSideChange: null,
  hostedValidation:
    'Not applicable -- nothing is built. Were it built, it would need the §165 question budget '
    + 'relocated to the verifier boundary first, and that is a separate architectural decision.',
  dependsOn: ['C3a_SECOND_CLARIFICATION_SLOT'],
  promptPatches: [],
  schemaPatches: [],
  score: {
    value: 4, feasibility: 2, risk: 5,
    valueWhy: 'Same value as C3a in principle, and it generalises instead of capping at two.',
    feasibilityWhy: 'Requires rewriting a v1 invariant rather than composing over it, and lands on '
      + 'the grammar construct §199 already failed on.',
    riskWhy: 'Unbounded questions at a layer with no budget, plus a rewrite of the admission layer '
      + 'that every frozen evidence package depends on.',
  },
};

// ==================================================================== C4 -- temporal scope

const C4A: VnextCandidate = {
  id: 'C4a_TEMPORAL_SCOPE_DECLARATION',
  klass: 'C4_TEMPORAL_SCOPE',
  title: 'A proposed question declares the moment its answer must speak for',
  build: 'PROTOTYPED',
  summary:
    'A four-member closed vocabulary plus one prose field naming the event. "Verified" and '
    + '"verified before return to service" stop being the same artifact, and the difference becomes '
    + 'visible to a reviewer reading structured output. The vocabulary is about the SHAPE of a '
    + 'moment -- now, at or before a named event, between two named events, or not time-dependent '
    + '-- and never about intervals, ages or schedules: the §176 remediation explicitly denies any '
    + 'interval reading, and this must not smuggle one back in as an enum.',
  deterministicallyDecides: [
    'the scope is a member of the closed vocabulary',
    'a moment description is present exactly for the two event-bounded members',
    'the scope is present exactly when a clarification is proposed',
  ],
  requiresHumanTruth: [
    'whether the declared moment is the moment the decision actually turns on',
    'whether the question as written would obtain an answer about that moment',
  ],
  newFreeTextFields: ['temporalScope.moment'],
  inputSideChange: null,
  hostedValidation:
    'A prospective cohort measuring vocabulary FIT before anything else: the count of proposals '
    + 'landing on each member, and a human sample of whether the chosen member represents the '
    + 'actual moment or was force-fitted. A vocabulary that collects most of its traffic on one '
    + 'member is a vocabulary that is not carrying the distinction.',
  dependsOn: [],
  promptPatches: [{
    anchor: 'HAZARD_SEVERITY, EXPOSURE, APPLICABILITY, REQUIRED_CONTROL, REGULATORY_INTERPRETATION.',
    placementRationale:
      'The question-quality paragraph, because the moment is a property of the QUESTION rather '
      + 'than of the fact: the same fact can need the current state on one row and a state at a '
      + 'past event on another, and it is the question that has to reach the right one.',
    lines: [
      '',
      'AND SAY WHICH MOMENT YOUR QUESTION IS ABOUT. A question can be answered truthfully about the',
      'wrong moment. Say whether you need the state as it is when the question is answered, the',
      'state at or before a particular event, the state between two events, or a fact that does not',
      'depend on time at all -- and where an event is involved, name it in the words the',
      'observation uses.',
      '',
      'THIS IS ABOUT THE DECISION AND NEVER ABOUT AGE. No interval, schedule, due date or elapsed',
      'period makes an answer stale or fresh, and none of them is a reason to pick one of these',
      'over another. Pick the moment the decision turns on, and where the decision does not turn on',
      'a moment at all, say so and move on.',
    ],
  }],
  schemaPatches: [{
    site: 'PROPOSAL',
    name: 'temporalScope',
    required: true,
    node: {
      type: 'object',
      additionalProperties: false,
      required: ['scope', 'moment'],
      description:
        'The moment your question\'s answer must speak for. About the decision, never about age: '
        + 'no interval, schedule or elapsed period bears on this.',
      properties: {
        scope: {
          type: 'string',
          enum: ['NOT_TIME_DEPENDENT', 'STATE_AT_THE_TIME_OF_ANSWER', 'AT_OR_BEFORE_A_NAMED_EVENT',
            'BETWEEN_TWO_NAMED_EVENTS'],
        },
        moment: {
          type: ['string', 'null'],
          description: 'The event or events, in the observation\'s own words. Required for '
            + 'AT_OR_BEFORE_A_NAMED_EVENT and BETWEEN_TWO_NAMED_EVENTS. NULL for the other two.',
        },
      },
    },
  }],
  score: {
    value: 3, feasibility: 4, risk: 3,
    valueWhy: 'Makes a distinction the first-pass prompt already reasons about visible in the '
      + 'verifier\'s output, where today it is invisible to every rule and every reviewer.',
    feasibilityWhy: 'A four-member enum and one conditional string. Small, but an enum is the '
      + 'expensive grammar construct and this is the only candidate that adds one to the proposal.',
    riskWhy: 'A closed vocabulary invites force-fitting, and a member chosen because it was nearest '
      + 'distorts the record rather than enriching it. There is also a live hazard that the '
      + 'vocabulary is read as an interval rule, which §176 spent an entire remediation denying.',
  },
};

// ==================================================================== C5 -- function vs appearance

const C5A: VnextCandidate = {
  id: 'C5a_SUFFICIENCY_REVIEW_PAIR',
  klass: 'C5_FUNCTION_VS_APPEARANCE',
  title: 'Project the owed property and the accepted evidence class as one reviewable pair',
  build: 'DERIVED_REPORT_ONLY',
  summary:
    'Adds NO field and costs NO grammar. Given C1a\'s restated property and C2b\'s declared '
    + 'evidence class, the pair (property, accepted class) is exactly the comparison a reviewer '
    + 'must make to answer "is this a status indicator standing in for a protective function", and '
    + 'today that comparison has to be assembled by hand from three artifacts. The projection '
    + 'assembles it and CLASSIFIES THE RELATION AS REQUIRES_HUMAN_TRUTH. It does not answer it.',
  deterministicallyDecides: [
    'the pair is assembled from fields that were actually admitted, never from refused output',
    'the relation between them is recorded as REQUIRES_HUMAN_TRUTH and carries no verdict field',
  ],
  requiresHumanTruth: [
    'whether the accepted evidence class can establish the restated property -- the whole question',
  ],
  newFreeTextFields: [],
  inputSideChange: null,
  hostedValidation:
    'None of its own. It is a reporting projection over C1a and C2b and inherits their validation; '
    + 'it can be exercised entirely offline against admitted fixtures.',
  dependsOn: ['C1a_OWED_PROPERTY_RESTATEMENT', 'C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION'],
  promptPatches: [],
  schemaPatches: [],
  score: {
    value: 3, feasibility: 3, risk: 1,
    valueWhy: 'Turns the §169 failure shape -- right fact, insufficient evidence -- into a two-cell '
      + 'comparison a reviewer can make in seconds instead of reconstructing it from prose.',
    feasibilityWhy: 'Trivial in itself; it cannot exist until both of its dependencies do.',
    riskWhy: 'It asserts nothing and gates nothing. The only real risk is a reader mistaking the '
      + 'pair for a verdict, which the projection\'s own literal type prevents.',
  },
};

const C5B: VnextCandidate = {
  id: 'C5b_AUTHORED_SUFFICIENCY_MATRIX',
  klass: 'C5_FUNCTION_VS_APPEARANCE',
  title: 'A frozen property-class x evidence-class sufficiency matrix',
  build: 'RECORDED_ONLY',
  summary:
    'The obvious next step from C2b, and it is RECORDED AND DELIBERATELY NOT BUILT. A matrix saying '
    + '"a status indicator never establishes a protective function" is a BLANKET evidence-class '
    + 'insufficiency rule, and this repository\'s settled position is that remediation rules stay '
    + 'property-relative and evidence-relative: the same status indicator can be exactly the right '
    + 'evidence for a fact about whether the indicator itself annunciates. Building the matrix also '
    + 'freezes a semantic judgement into code where a governed, per-fact criterion already exists '
    + 'and carries a provenance -- C2b uses that criterion instead, which is why C2b is '
    + 'property-relative and this is not.',
  deterministicallyDecides: [],
  requiresHumanTruth: [],
  newFreeTextFields: [],
  inputSideChange: null,
  hostedValidation: 'Not applicable -- nothing is built.',
  dependsOn: [],
  promptPatches: [],
  schemaPatches: [],
  score: {
    value: 2, feasibility: 2, risk: 5,
    valueWhy: 'It would gate the §169 failure shape automatically, which is genuinely attractive.',
    feasibilityWhy: 'Requires authoring and freezing a cross-product of semantic judgements, and '
      + 'requires a property vocabulary that the first-pass prompt explicitly refuses to close.',
    riskWhy: 'A blanket insufficiency rule mislabels every legitimate use of the named class, and '
      + 'once frozen it is enforced everywhere by construction.',
  },
};

// ==================================================================== C6 -- challenge review

export const CHALLENGE_GROUNDS = [
  'THE_OBSERVATION_ALREADY_ESTABLISHES_IT',
  'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
] as const;
export type ChallengeGround = (typeof CHALLENGE_GROUNDS)[number];

const C6A: VnextCandidate = {
  id: 'C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE',
  klass: 'C6_CHALLENGE_REVIEWABILITY',
  title: 'A challenge names which of the two grounds it rests on and carries the evidence that '
    + 'ground requires',
  build: 'PROTOTYPED',
  summary:
    'The prompt already names two grounds; the schema carries one prose field for both. Splitting '
    + 'them is what makes a challenge REVIEWABLE, because the two need different evidence and '
    + 'different arbitration. Ground one -- the observation settles it -- demands a VERBATIM SPAN, '
    + 'checked by containment, which is the rule a NOMINATION asserting the opposite already has to '
    + 'satisfy; today the contract requires proof for "the text leaves this open" and accepts bare '
    + 'assertion for "the text closes this". Ground two -- both answers lead to the same action -- '
    + 'demands one statement of the single action done either way, which is the claim, made '
    + 'explicit and placed beside the fact\'s own ifA/ifB so a reviewer can compare three '
    + 'statements instead of parsing one.\n'
    + 'None of this settles anything. `settles: false` stays a literal type and the fact stays '
    + 'UNRESOLVED, exactly as v3 specifies.',
  deterministicallyDecides: [
    'the ground is a member and is present exactly on a CHALLENGE_FACT_VALIDITY declaration',
    'the span is present for the ESTABLISHES ground and absent for the SAME_ACTION ground',
    'the span is a verbatim substring of the observation -- the nomination rule, applied here',
    'the common action is present for the SAME_ACTION ground and absent for the other',
  ],
  requiresHumanTruth: [
    'whether the quoted span actually establishes the fact',
    'whether the stated common action is really what would be done under both branches',
    'whether the challenge should be granted -- which no field here may express',
  ],
  newFreeTextFields: [
    'owedFactDeclarations[].challengeObservationSpan',
    'owedFactDeclarations[].commonActionUnderBothBranches',
  ],
  inputSideChange: null,
  hostedValidation:
    'A prospective cohort on rows carrying at least one supplied fact -- but note the base rate. '
    + '§199 produced CHALLENGE_FACT_VALIDITY on 1 of 8 admitted verifier calls; that is one '
    + 'observation and it is not a rate, so the cohort must be sized to obtain challenges rather '
    + 'than assumed to contain them. If challenges stay rare, the honest readout is a literal x/n '
    + 'and NOT_MEANINGFULLY_ESTIMABLE, never a percentage.',
  dependsOn: [],
  promptPatches: [{
    anchor: '     you write here removes it.',
    placementRationale:
      'Directly under the CHALLENGE_FACT_VALIDITY description in step 6, which is where the two '
      + 'grounds are already named. The evidence obligation has to arrive with the ground it '
      + 'attaches to, or the model reads the grounds in one place and the proof burden in another.',
    lines: [
      '',
      '     SAY WHICH OF THE TWO IT IS, AND SHOW THE THING THAT MAKES IT SO.',
      '     If your ground is that the observation ALREADY ESTABLISHES the fact, quote the span of',
      '     the observation that establishes it, copied word for word. A span you paraphrase is not',
      '     a span. If you cannot find one, the observation does not establish it and this is not',
      '     your ground.',
      '     If your ground is that BOTH ANSWERS LEAD TO THE SAME ACTION, state that one action --',
      '     the single thing done today whichever way the fact turns out. You were given what the',
      '     analysis expects under each answer; if you cannot write one action covering both, the',
      '     answers do diverge and this is not your ground either.',
      '     A challenge on neither ground is not a challenge. Record STILL_UNRESOLVED instead.',
    ],
  }],
  schemaPatches: [
    {
      site: 'DECLARATION_ITEM',
      name: 'challengeGround',
      required: true,
      node: {
        type: ['string', 'null'],
        enum: ['THE_OBSERVATION_ALREADY_ESTABLISHES_IT', 'BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION',
          null],
        description: 'Required for CHALLENGE_FACT_VALIDITY, NULL otherwise. Which of the two '
          + 'grounds you are asking to have arbitrated.',
      },
    },
    {
      site: 'DECLARATION_ITEM',
      name: 'challengeObservationSpan',
      required: true,
      node: {
        type: ['string', 'null'],
        description: 'Required for THE_OBSERVATION_ALREADY_ESTABLISHES_IT and NULL for everything '
          + 'else. Copied WORD FOR WORD from the observation. Checked by exact containment.',
      },
    },
    {
      site: 'DECLARATION_ITEM',
      name: 'commonActionUnderBothBranches',
      required: true,
      node: {
        type: ['string', 'null'],
        description: 'Required for BOTH_ANSWERS_LEAD_TO_THE_SAME_ACTION and NULL for everything '
          + 'else. The single thing done today whichever way the fact turns out.',
      },
    },
  ],
  score: {
    value: 5, feasibility: 5, risk: 1,
    valueWhy: 'A challenge is a request for human arbitration and is the one output here whose '
      + 'entire purpose is to be reviewed. It currently arrives without the evidence its own '
      + 'stated ground requires, and the fix removes an asymmetry already visible in the file.',
    feasibilityWhy: 'Three nullable fields on an existing array item, one two-member enum, and one '
      + 'containment check copied from the nomination rule. No withdrawal, no input-side change, '
      + 'no interaction with any existing code path.',
    riskWhy: 'The fields are inert on every declaration that is not a challenge, so the blast '
      + 'radius is confined to a state that must already be reviewed by a person. The one real '
      + 'risk is that requiring a span suppresses challenges the reviewer would have wanted to '
      + 'see, which the cohort must measure as a count.',
  },
};

// ==================================================================== the registry

export const VNEXT_CANDIDATES: readonly VnextCandidate[] = [
  C6A, C2A, C1A, C5A, C1B, C2B, C4A, C3A, C3B, C5B,
];

export function candidateById(id: string): VnextCandidate {
  const c = VNEXT_CANDIDATES.find(x => x.id === id);
  if (!c) throw new Error(`§201 ABORT: no candidate ${id}`);
  return c;
}

/** (value x feasibility) / risk, COMPUTED. No ranking is written down anywhere as a literal. */
export function candidateRank(c: VnextCandidate): number {
  return (c.score.value * c.score.feasibility) / c.score.risk;
}

export function rankedCandidates(): readonly VnextCandidate[] {
  return [...VNEXT_CANDIDATES].sort((a, b) => {
    const d = candidateRank(b) - candidateRank(a);
    return d !== 0 ? d : a.id.localeCompare(b.id);
  });
}

// ==================================================================== prompt application

function insertAfterUniqueAnchor(
  lines: readonly string[], patch: PromptPatch, label: string,
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === patch.anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `§201 ABORT: anchor for ${label} appears ${hits.length} times, expected 1. Candidates are `
      + 'built by construction from v3.2 and refuse to apply against a drifted base.');
  }
  return [...lines.slice(0, hits[0] + 1), ...patch.lines, ...lines.slice(hits[0] + 1)];
}

/**
 * Removal is by UNIQUE BLOCK MATCH rather than by position, so reverting does not depend on the
 * order candidates were applied in. If the block is absent or appears twice, reverting aborts --
 * a half-reverted prompt is worse than a refusal.
 */
function removeUniqueBlock(lines: readonly string[], block: readonly string[], label: string): string[] {
  if (block.length === 0) return [...lines];
  const at: number[] = [];
  for (let i = 0; i + block.length <= lines.length; i += 1) {
    if (block.every((b, j) => lines[i + j] === b)) at.push(i);
  }
  if (at.length !== 1) {
    throw new Error(`§201 ABORT: block for ${label} found ${at.length} times on revert, expected 1`);
  }
  return [...lines.slice(0, at[0]), ...lines.slice(at[0] + block.length)];
}

export function applyPromptPatches(base: string, ids: readonly string[]): string {
  let lines = base.split('\n');
  for (const id of ids) {
    for (const p of candidateById(id).promptPatches) {
      lines = insertAfterUniqueAnchor(lines, p, id);
    }
  }
  return lines.join('\n');
}

export function revertPromptPatches(applied: string, ids: readonly string[]): string {
  let lines = applied.split('\n');
  for (const id of [...ids].reverse()) {
    for (const p of [...candidateById(id).promptPatches].reverse()) {
      lines = removeUniqueBlock(lines, p.lines, id);
    }
  }
  return lines.join('\n');
}

// ==================================================================== schema application

function siteNode(schema: any, site: SchemaPatchSite): any {
  if (site === 'ROOT') return schema;
  if (site === 'PROPOSAL') return schema.properties.proposedClarification;
  return schema.properties.owedFactDeclarations.items;
}

export function applySchemaPatches(base: unknown, ids: readonly string[]): unknown {
  const out = JSON.parse(JSON.stringify(base));
  for (const id of ids) {
    for (const p of candidateById(id).schemaPatches) {
      const node = siteNode(out, p.site);
      if (node === undefined) throw new Error(`§201 ABORT: schema site ${p.site} missing`);
      if (node.properties[p.name] !== undefined) {
        throw new Error(`§201 ABORT: ${p.site}.${p.name} already exists; base drifted`);
      }
      node.properties[p.name] = JSON.parse(JSON.stringify(p.node));
      if (p.required) node.required = [...node.required, p.name];
    }
  }
  return out;
}

export function revertSchemaPatches(applied: unknown, ids: readonly string[]): unknown {
  const out = JSON.parse(JSON.stringify(applied));
  for (const id of [...ids].reverse()) {
    for (const p of [...candidateById(id).schemaPatches].reverse()) {
      const node = siteNode(out, p.site);
      if (node?.properties?.[p.name] === undefined) {
        throw new Error(`§201 ABORT: ${p.site}.${p.name} absent on revert`);
      }
      delete node.properties[p.name];
      if (p.required) node.required = node.required.filter((r: string) => r !== p.name);
    }
  }
  return out;
}

export interface AppliedArtifacts {
  readonly prompt: string;
  readonly schema: unknown;
  readonly ids: readonly string[];
}

export function applyCandidates(ids: readonly string[]): AppliedArtifacts {
  return {
    prompt: applyPromptPatches(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, ids),
    schema: applySchemaPatches(VERIFIER_V3_2_RESPONSE_SCHEMA, ids),
    ids: [...ids],
  };
}

export function revertCandidates(a: AppliedArtifacts): { prompt: string; schema: unknown } {
  return {
    prompt: revertPromptPatches(a.prompt, a.ids),
    schema: revertSchemaPatches(a.schema, a.ids),
  };
}

/** Every candidate that actually carries patches. The set `applyCandidates` is normally given. */
export const PROTOTYPED_IDS: readonly string[] =
  VNEXT_CANDIDATES.filter(c => c.build === 'PROTOTYPED').map(c => c.id);

// ==================================================================== grammar cost

export interface GrammarCost {
  /** Serialised length. The figure §199 reported, and the least meaningful of the four. */
  readonly bytes: number;
  /** Object/array nodes. A proxy for compiled structure. */
  readonly nodes: number;
  /** Total enum members across the schema. The construct §200 names as expanding worst. */
  readonly enumMembers: number;
  /** Bytes of `description` text, which is instruction rather than structure. */
  readonly descriptionBytes: number;
  /** Entries across every `required` list. */
  readonly requiredEntries: number;
}

export function grammarCost(schema: unknown): GrammarCost {
  let nodes = 0; let enumMembers = 0; let descriptionBytes = 0; let requiredEntries = 0;
  const walk = (s: any): void => {
    if (s === null || typeof s !== 'object') return;
    nodes += 1;
    if (Array.isArray(s)) { for (const x of s) walk(x); return; }
    for (const k of Object.keys(s)) {
      const v = s[k];
      if (k === 'enum' && Array.isArray(v)) { enumMembers += v.length; continue; }
      if (k === 'description' && typeof v === 'string') {
        descriptionBytes += Buffer.byteLength(v, 'utf8'); continue;
      }
      if (k === 'required' && Array.isArray(v)) { requiredEntries += v.length; continue; }
      walk(v);
    }
  };
  walk(schema);
  return {
    bytes: Buffer.byteLength(JSON.stringify(schema), 'utf8'),
    nodes, enumMembers, descriptionBytes, requiredEntries,
  };
}

export function costDelta(base: GrammarCost, after: GrammarCost): GrammarCost {
  return {
    bytes: after.bytes - base.bytes,
    nodes: after.nodes - base.nodes,
    enumMembers: after.enumMembers - base.enumMembers,
    descriptionBytes: after.descriptionBytes - base.descriptionBytes,
    requiredEntries: after.requiredEntries - base.requiredEntries,
  };
}

/**
 * The §199 reference points, recorded so a cost is always read against a measured datum rather
 * than against intuition. These are FIRST-PASS schema figures and the verifier is a different
 * request; they bound nothing about the verifier and are recorded to prevent the opposite error.
 */
export const SECTION_199_GRAMMAR_REFERENCE = {
  firstPassCapabilityAbsentBytes: 18620,
  firstPassCapabilityPresentBytes: 19060,
  absentAccepted: true,
  presentAccepted: false,
  providerMetric: 'COMPILED_GRAMMAR_COMPLEXITY_NOT_BYTES',
  thresholdIsDocumented: false,
  appliesToTheVerifierRequest: false,
  requiredValidation: 'OFFLINE_REQUEST_BUILD_THEN_SINGLE_ROW_TRANSPORT_CANARY',
} as const;

// ==================================================================== citation scan extension

/**
 * §193's `verifierFreeTextStrings` is a fixed list and cannot know about any field added here.
 * v3.2 had to scan `regulatoryBasis.proposition` itself for exactly this reason. Every prose field
 * a candidate adds is scanned here, and the proof suite asserts that each declared
 * `newFreeTextFields` entry is actually reachable from this function.
 */
export function vnextScannedStrings(raw: unknown, ids: readonly string[]): string[] {
  const out = v3_3ScannedStrings(raw);
  if (typeof raw !== 'object' || raw === null) return out;
  const o = raw as Record<string, any>;
  const push = (v: unknown): void => { if (typeof v === 'string' && v.length > 0) out.push(v); };
  const on = (id: string): boolean => ids.includes(id);

  if (on('C1a_OWED_PROPERTY_RESTATEMENT') && Array.isArray(o.owedFactDeclarations)) {
    for (const d of o.owedFactDeclarations) push(d?.owedPropertyAsUnderstood);
  }
  if (on('C1b_NEAREST_NEIGHBOUR_DISCRIMINATION')) push(o.targetDiscrimination?.whyNotThatOne);
  if (on('C2a_SETTLEMENT_TEST')) {
    const t = o.proposedClarification?.settlementTest;
    for (const k of ['answerEstablishing', 'answerRefuting', 'decisionIfEstablishing',
      'decisionIfRefuting']) push(t?.[k]);
  }
  if (on('C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION')) {
    push(o.acceptedEvidence?.evidenceClass);
  }
  if (on('C3a_SECOND_CLARIFICATION_SLOT')) {
    const p = o.additionalProposedClarification;
    for (const k of ['question', 'whyItMatters', 'evidenceGap']) push(p?.[k]);
  }
  if (on('C4a_TEMPORAL_SCOPE_DECLARATION')) push(o.proposedClarification?.temporalScope?.moment);
  if (on('C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE') && Array.isArray(o.owedFactDeclarations)) {
    for (const d of o.owedFactDeclarations) {
      push(d?.challengeObservationSpan); push(d?.commonActionUnderBothBranches);
    }
  }
  return out;
}

// ==================================================================== admission

export const VNEXT_ADMISSION_CODES = [
  // C1a
  'OWED_PROPERTY_RESTATEMENT_MISSING',
  'OWED_PROPERTY_RESTATEMENT_WITHOUT_A_BINDING_OR_CHALLENGE',
  // C1b
  'TARGET_DISCRIMINATION_MISSING',
  'TARGET_DISCRIMINATION_PRESENT_WITHOUT_A_BINDING',
  'TARGET_DISCRIMINATION_KEY_NOT_IN_SUPPLIED_SET',
  'TARGET_DISCRIMINATION_KEY_EQUALS_THE_BINDING_KEY',
  'TARGET_DISCRIMINATION_FIELD_MISSING',
  // C2a
  'SETTLEMENT_TEST_MISSING',
  'SETTLEMENT_TEST_FIELD_MISSING',
  'SETTLEMENT_ANSWERS_IDENTICAL',
  'SETTLEMENT_DECISIONS_DO_NOT_DIVERGE',
  'SETTLEMENT_TEST_PRESENT_WITHOUT_A_CLARIFICATION',
  // C2b
  'ACCEPTED_EVIDENCE_MISSING',
  'ACCEPTED_EVIDENCE_PRESENT_WITHOUT_A_BOUND_CLARIFICATION',
  'ACCEPTED_EVIDENCE_FIELD_MISSING',
  'ACCEPTED_EVIDENCE_BINDING_NOT_A_MEMBER',
  'ACCEPTED_EVIDENCE_BINDING_DISAGREES_WITH_THE_SUPPLIED_LISTS',
  'CLARIFICATION_ACCEPTS_EVIDENCE_DECLARED_INSUFFICIENT_FOR_THIS_FACT',
  // C3a
  'SECOND_CLARIFICATION_UNDER_A_NON_ADD_VERDICT',
  'SECOND_CLARIFICATION_WITHOUT_A_FIRST',
  'SECOND_CLARIFICATION_FIELD_MISSING',
  'SECOND_CLARIFICATION_KEY_NOT_IN_SUPPLIED_SET',
  'SECOND_CLARIFICATION_BINDS_THE_SAME_FACT',
  'SECOND_CLARIFICATION_AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
  'SECOND_CLARIFICATION_NOT_DECLARED_BOUND',
  // C4a
  'TEMPORAL_SCOPE_MISSING',
  'TEMPORAL_SCOPE_NOT_A_MEMBER',
  'TEMPORAL_MOMENT_MISSING_FOR_AN_EVENT_SCOPE',
  'TEMPORAL_MOMENT_PRESENT_WITHOUT_AN_EVENT_SCOPE',
  'TEMPORAL_SCOPE_PRESENT_WITHOUT_A_CLARIFICATION',
  // C6a
  'CHALLENGE_GROUND_MISSING',
  'CHALLENGE_GROUND_NOT_A_MEMBER',
  'CHALLENGE_GROUND_WITHOUT_A_CHALLENGE',
  'CHALLENGE_SPAN_MISSING_FOR_THE_ESTABLISHES_GROUND',
  'CHALLENGE_SPAN_NOT_VERBATIM',
  'CHALLENGE_SPAN_PRESENT_ON_THE_WRONG_GROUND',
  'COMMON_ACTION_MISSING_FOR_THE_SAME_ACTION_GROUND',
  'COMMON_ACTION_PRESENT_ON_THE_WRONG_GROUND',
  // composition
  'VNEXT_CITATION_IN_A_NEW_PROSE_FIELD',
  'SECOND_SLOT_WITHDRAWAL_PRECONDITION_NOT_RECONSTRUCTED',
] as const;
export type VnextAdmissionCode = (typeof VNEXT_ADMISSION_CODES)[number];

export const VNEXT_ADMISSION_RULE_CLASSIFICATION = {
  RESTATEMENT_IS_PRESENT_WHERE_OWED: 'SAFE_DETERMINISTIC',
  DISCRIMINATION_KEY_IS_A_SUPPLIED_NON_BOUND_KEY: 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY',
  SETTLEMENT_ANSWERS_AND_DECISIONS_DIFFER: 'SAFE_DETERMINISTIC_BYTE_INEQUALITY',
  ACCEPTED_CLASS_IS_A_MEMBER_OF_A_SUPPLIED_LIST: 'SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY',
  ACCEPTED_CLASS_IS_NOT_ON_THIS_FACTS_INSUFFICIENT_LIST: 'SAFE_DETERMINISTIC_PROPERTY_RELATIVE',
  SECOND_SLOT_BINDS_A_DIFFERENT_SUPPLIED_KEY: 'SAFE_DETERMINISTIC',
  TEMPORAL_SCOPE_IS_A_MEMBER_AND_ITS_MOMENT_AGREES: 'SAFE_DETERMINISTIC',
  CHALLENGE_GROUND_CARRIES_THE_EVIDENCE_IT_REQUIRES: 'SAFE_DETERMINISTIC',
  CHALLENGE_SPAN_IS_VERBATIM: 'SAFE_DETERMINISTIC_SUBSTRING_CONTAINMENT',
  // and what none of it decides
  THE_RESTATED_PROPERTY_IS_THE_OWED_PROPERTY: 'REQUIRES_HUMAN_TRUTH',
  THE_QUESTION_WOULD_ACTUALLY_SETTLE_THE_FACT: 'REQUIRES_HUMAN_TRUTH',
  THE_DECLARED_ANSWERS_ARE_THE_ANSWERS_THE_QUESTION_WOULD_RECEIVE: 'REQUIRES_HUMAN_TRUTH',
  THE_QUOTED_SPAN_ESTABLISHES_THE_FACT: 'REQUIRES_HUMAN_TRUTH',
  THE_CHALLENGE_SHOULD_BE_GRANTED: 'REQUIRES_HUMAN_TRUTH',
} as const;

/** The provenances a criterion may carry before it is allowed to gate or to be rendered. */
export const PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES: readonly string[] = [
  'DETERMINISTIC_RULE_METADATA',
  'GOVERNED_EVIDENCE',
  'AUTHORED_HAZLENZ_SAFETY_CONTRACT',
  'VALIDATED_DOMAIN_CONTROL_DEFINITION',
];

export interface VnextAcceptableEvidence {
  readonly requirement: string;
  readonly examples?: readonly string[];
  readonly insufficientExamples?: readonly string[];
  readonly provenance: string;
}

export interface VnextSuppliedFact {
  readonly factKey: string;
  readonly acceptableEvidence: VnextAcceptableEvidence | null;
}

export interface VnextAdmissionInput extends V3_2AdmissionInput {
  /** The supplied facts WITH their governed settlement criteria. Used by C2b only. */
  readonly suppliedFacts: readonly VnextSuppliedFact[];
}

export interface VnextAdmissionResult extends V3_2AdmissionResult {
  readonly vnextCodes: readonly VnextAdmissionCode[];
  readonly vnextDetail: readonly string[];
  /** Set when C3a's two frozen v3 refusals were withdrawn for a legal two-slot verdict. */
  readonly secondSlotWithdrawalApplied: boolean;
  readonly enabledCandidates: readonly string[];
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * C2b's input-side gate. A criterion authored by DEVELOPMENT_HUMAN_TRUTH or ADJUDICATION_LABEL is
 * grading truth and must never reach a prompt; MODEL_SELF_AUTHORED is the model's own output
 * handed back as authority. All three return null, and null is the safe answer.
 */
export function renderableAcceptableEvidence(
  fact: VnextSuppliedFact,
): VnextAcceptableEvidence | null {
  const ae = fact.acceptableEvidence;
  if (!ae) return null;
  return PRODUCTION_PERMITTED_EVIDENCE_PROVENANCES.includes(ae.provenance) ? ae : null;
}

/**
 * The composed candidate boundary. Refuses WHOLE on any violation, exactly as every layer before
 * it does. It COMPOSES `checkVerifierV3_2Output` and never mutates it.
 */
export function checkVnextOutput(
  raw: unknown, input: VnextAdmissionInput, enabled: readonly string[],
): VnextAdmissionResult {
  const base = checkVerifierV3_2Output(raw, input);
  const codes: VnextAdmissionCode[] = [];
  const detail: string[] = [];
  const fail = (c: VnextAdmissionCode, why: string): void => { codes.push(c); detail.push(why); };
  const on = (id: string): boolean => enabled.includes(id);

  const o = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? raw as Record<string, any> : null;

  let baseCodes: string[] = [...base.codes as readonly string[]];
  let baseDetail: string[] = [...base.detail];
  let withdrawal = false;

  if (o === null) {
    return {
      ...base, codes: baseCodes as never[], detail: baseDetail,
      vnextCodes: codes, vnextDetail: detail, secondSlotWithdrawalApplied: false,
      enabledCandidates: [...enabled],
    };
  }

  const isAdd = o.verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  const supplied = new Set(input.suppliedOwedFactKeys);
  const bindingKey = typeof o.bindingFactKey === 'string' && o.bindingFactKey.length > 0
    ? o.bindingFactKey : null;
  const proposal = (o.proposedClarification && typeof o.proposedClarification === 'object'
    && !Array.isArray(o.proposedClarification)) ? o.proposedClarification : null;
  const decls: any[] = Array.isArray(o.owedFactDeclarations) ? o.owedFactDeclarations : [];
  const second = (o.additionalProposedClarification
    && typeof o.additionalProposedClarification === 'object'
    && !Array.isArray(o.additionalProposedClarification)) ? o.additionalProposedClarification : null;

  // ---------------------------------------------------------- C3a withdrawal, before anything else
  //
  // Reconstructed from `raw` rather than trusted from `base`, and the withdrawal fires only when
  // the two expected refusals are the ONLY objections and both detail strings rebuild EXACTLY.
  // Anything else leaves the refusal standing, which is the safe direction.
  if (on('C3a_SECOND_CLARIFICATION_SLOT') && second !== null && isAdd && bindingKey !== null) {
    const k2 = typeof second.bindingFactKey === 'string' ? second.bindingFactKey : null;
    const boundKeys = decls.filter(d => d?.declaration === 'BOUND_BY_CLARIFICATION')
      .map(d => d?.factKey);
    const expectA = '2 facts declared bound; one clarification binds one fact';
    const expectB = `${k2} declared bound but bindingFactKey is ${bindingKey}`;
    const only = new Set(baseCodes);
    const preconditions = k2 !== null && k2 !== bindingKey && supplied.has(k2)
      && boundKeys.length === 2 && boundKeys.includes(bindingKey) && boundKeys.includes(k2)
      && only.size === 2
      && only.has('MORE_THAN_ONE_FACT_DECLARED_BOUND')
      && only.has('BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY')
      && baseDetail.includes(expectA) && baseDetail.includes(expectB);
    if (preconditions) {
      baseCodes = baseCodes.filter(c => c !== 'MORE_THAN_ONE_FACT_DECLARED_BOUND'
        && c !== 'BOUND_DECLARATION_DISAGREES_WITH_BINDING_KEY');
      baseDetail = baseDetail.filter(d => d !== expectA && d !== expectB);
      withdrawal = true;
      if (baseCodes.length > 0) {
        // Defensive: `only.size === 2` makes this unreachable. If it ever fires the composition
        // has drifted and refusing is correct.
        fail('SECOND_SLOT_WITHDRAWAL_PRECONDITION_NOT_RECONSTRUCTED',
          'withdrawal left residual codes; refusing');
      }
    }
  }

  // ---------------------------------------------------------- C1a
  if (on('C1a_OWED_PROPERTY_RESTATEMENT')) {
    for (const d of decls) {
      if (!d || typeof d !== 'object') continue;
      const owes = d.declaration === 'BOUND_BY_CLARIFICATION'
        || d.declaration === 'CHALLENGE_FACT_VALIDITY';
      const v = d.owedPropertyAsUnderstood;
      if (owes && blank(v)) {
        fail('OWED_PROPERTY_RESTATEMENT_MISSING',
          `${String(d.factKey)} declared ${String(d.declaration)} without naming the property`);
      }
      if (!owes && v !== null && v !== undefined) {
        fail('OWED_PROPERTY_RESTATEMENT_WITHOUT_A_BINDING_OR_CHALLENGE',
          `${String(d.factKey)} declared ${String(d.declaration)} but named a property`);
      }
    }
  }

  // ---------------------------------------------------------- C1b
  if (on('C1b_NEAREST_NEIGHBOUR_DISCRIMINATION')) {
    const td = (o.targetDiscrimination && typeof o.targetDiscrimination === 'object'
      && !Array.isArray(o.targetDiscrimination)) ? o.targetDiscrimination : null;
    const owed = bindingKey !== null && input.suppliedOwedFactKeys.length >= 2;
    if (owed && td === null) {
      fail('TARGET_DISCRIMINATION_MISSING',
        `a binding was declared while ${input.suppliedOwedFactKeys.length} facts were supplied`);
    }
    if (!owed && o.targetDiscrimination !== null && o.targetDiscrimination !== undefined) {
      fail('TARGET_DISCRIMINATION_PRESENT_WITHOUT_A_BINDING',
        bindingKey === null ? 'no binding was declared' : 'only one fact was supplied');
    }
    if (td !== null) {
      if (blank(td.whyNotThatOne)) {
        fail('TARGET_DISCRIMINATION_FIELD_MISSING', 'whyNotThatOne is empty');
      }
      const nk = td.nearestOtherFactKey;
      if (typeof nk !== 'string' || nk.length === 0) {
        fail('TARGET_DISCRIMINATION_FIELD_MISSING', 'nearestOtherFactKey is empty');
      } else if (nk === bindingKey) {
        fail('TARGET_DISCRIMINATION_KEY_EQUALS_THE_BINDING_KEY', nk);
      } else if (!supplied.has(nk)) {
        fail('TARGET_DISCRIMINATION_KEY_NOT_IN_SUPPLIED_SET',
          `${JSON.stringify(nk)} is not one of the ${supplied.size} supplied keys`);
      }
    }
  }

  // ---------------------------------------------------------- C2a
  if (on('C2a_SETTLEMENT_TEST')) {
    const t = proposal?.settlementTest;
    if (isAdd && proposal !== null) {
      if (t === null || t === undefined || typeof t !== 'object') {
        fail('SETTLEMENT_TEST_MISSING', 'a proposed clarification must carry its settlement test');
      } else {
        for (const f of ['answerEstablishing', 'answerRefuting', 'decisionIfEstablishing',
          'decisionIfRefuting']) {
          if (blank(t[f])) fail('SETTLEMENT_TEST_FIELD_MISSING', `settlementTest.${f} is empty`);
        }
        if (!blank(t.answerEstablishing) && !blank(t.answerRefuting)
            && String(t.answerEstablishing).trim() === String(t.answerRefuting).trim()) {
          fail('SETTLEMENT_ANSWERS_IDENTICAL', 'the two admitted answers state the same thing');
        }
        if (!blank(t.decisionIfEstablishing) && !blank(t.decisionIfRefuting)
            && String(t.decisionIfEstablishing).trim() === String(t.decisionIfRefuting).trim()) {
          fail('SETTLEMENT_DECISIONS_DO_NOT_DIVERGE',
            'the same thing is done under both answers, so the question settles nothing');
        }
      }
    } else if (t !== null && t !== undefined) {
      fail('SETTLEMENT_TEST_PRESENT_WITHOUT_A_CLARIFICATION',
        'a settlement test is meaningless without a proposed question');
    }
  }

  // ---------------------------------------------------------- C2b
  if (on('C2b_ACCEPTED_EVIDENCE_BOUND_TO_SUPPLIED_CRITERION')) {
    const ae = (o.acceptedEvidence && typeof o.acceptedEvidence === 'object'
      && !Array.isArray(o.acceptedEvidence)) ? o.acceptedEvidence : null;
    const owed = isAdd && proposal !== null && bindingKey !== null;
    if (owed && ae === null) {
      fail('ACCEPTED_EVIDENCE_MISSING', 'a bound clarification must name what it would accept');
    }
    if (!owed && o.acceptedEvidence !== null && o.acceptedEvidence !== undefined) {
      fail('ACCEPTED_EVIDENCE_PRESENT_WITHOUT_A_BOUND_CLARIFICATION',
        'nothing accepts evidence without a bound question');
    }
    if (ae !== null) {
      const cls = ae.evidenceClass;
      const boundTo = ae.boundTo;
      if (blank(cls)) fail('ACCEPTED_EVIDENCE_FIELD_MISSING', 'evidenceClass is empty');
      const members = ['SUPPLIED_ACCEPTABLE_EXAMPLE', 'SUPPLIED_INSUFFICIENT_EXAMPLE',
        'NOT_AMONG_THOSE_SUPPLIED'];
      if (typeof boundTo !== 'string' || !members.includes(boundTo)) {
        fail('ACCEPTED_EVIDENCE_BINDING_NOT_A_MEMBER', String(boundTo));
      } else if (!blank(cls) && bindingKey !== null) {
        const fact = input.suppliedFacts.find(f => f.factKey === bindingKey);
        const crit = fact ? renderableAcceptableEvidence(fact) : null;
        // With no renderable criterion there is nothing to bind against, so the declaration is
        // ungated: the only legal answer is NOT_AMONG_THOSE_SUPPLIED, and no refusal follows.
        const ok = crit?.examples ?? [];
        const bad = crit?.insufficientExamples ?? [];
        const inOk = ok.includes(String(cls));
        const inBad = bad.includes(String(cls));
        const actual = inOk ? 'SUPPLIED_ACCEPTABLE_EXAMPLE'
          : inBad ? 'SUPPLIED_INSUFFICIENT_EXAMPLE' : 'NOT_AMONG_THOSE_SUPPLIED';
        if (actual !== boundTo) {
          fail('ACCEPTED_EVIDENCE_BINDING_DISAGREES_WITH_THE_SUPPLIED_LISTS',
            `declared ${boundTo} but ${JSON.stringify(String(cls))} is ${actual}`);
        }
        if (inBad) {
          // PROPERTY-RELATIVE. This says nothing about the class in general; it says this fact's
          // own governed criterion names it as something that would not settle THIS fact.
          fail('CLARIFICATION_ACCEPTS_EVIDENCE_DECLARED_INSUFFICIENT_FOR_THIS_FACT',
            `${JSON.stringify(String(cls))} is on ${bindingKey}'s own insufficientExamples`);
        }
      }
    }
  }

  // ---------------------------------------------------------- C3a
  if (on('C3a_SECOND_CLARIFICATION_SLOT')) {
    if (second !== null) {
      if (!isAdd) {
        fail('SECOND_CLARIFICATION_UNDER_A_NON_ADD_VERDICT', String(o.verdict));
      }
      if (proposal === null) {
        fail('SECOND_CLARIFICATION_WITHOUT_A_FIRST', 'there is no first clarification to add to');
      }
      for (const f of ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap',
        'bindingFactKey']) {
        if (blank(second[f])) {
          fail('SECOND_CLARIFICATION_FIELD_MISSING', `additionalProposedClarification.${f} is empty`);
        }
      }
      const decisions = ['HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY',
        'REQUIRED_CONTROL', 'REGULATORY_INTERPRETATION'];
      if (!blank(second.affectedDecision) && !decisions.includes(String(second.affectedDecision))) {
        fail('SECOND_CLARIFICATION_AFFECTED_DECISION_NOT_A_CONTRACT_MEMBER',
          String(second.affectedDecision));
      }
      const k2 = second.bindingFactKey;
      if (!blank(k2)) {
        if (k2 === bindingKey) {
          fail('SECOND_CLARIFICATION_BINDS_THE_SAME_FACT', String(k2));
        } else if (!supplied.has(String(k2))) {
          fail('SECOND_CLARIFICATION_KEY_NOT_IN_SUPPLIED_SET', String(k2));
        } else if (!decls.some(d => d?.factKey === k2
            && d?.declaration === 'BOUND_BY_CLARIFICATION')) {
          fail('SECOND_CLARIFICATION_NOT_DECLARED_BOUND',
            `${String(k2)} carries a question but was not declared BOUND_BY_CLARIFICATION`);
        }
      }
    }
  }

  // ---------------------------------------------------------- C4a
  if (on('C4a_TEMPORAL_SCOPE_DECLARATION')) {
    const ts = proposal?.temporalScope;
    const eventScopes = ['AT_OR_BEFORE_A_NAMED_EVENT', 'BETWEEN_TWO_NAMED_EVENTS'];
    const scopes = ['NOT_TIME_DEPENDENT', 'STATE_AT_THE_TIME_OF_ANSWER', ...eventScopes];
    if (isAdd && proposal !== null) {
      if (ts === null || ts === undefined || typeof ts !== 'object') {
        fail('TEMPORAL_SCOPE_MISSING', 'a proposed clarification must declare its moment');
      } else if (typeof ts.scope !== 'string' || !scopes.includes(ts.scope)) {
        fail('TEMPORAL_SCOPE_NOT_A_MEMBER', String(ts.scope));
      } else {
        const needsMoment = eventScopes.includes(ts.scope);
        if (needsMoment && blank(ts.moment)) {
          fail('TEMPORAL_MOMENT_MISSING_FOR_AN_EVENT_SCOPE', ts.scope);
        }
        if (!needsMoment && ts.moment !== null && ts.moment !== undefined) {
          fail('TEMPORAL_MOMENT_PRESENT_WITHOUT_AN_EVENT_SCOPE', ts.scope);
        }
      }
    } else if (ts !== null && ts !== undefined) {
      fail('TEMPORAL_SCOPE_PRESENT_WITHOUT_A_CLARIFICATION',
        'a moment is meaningless without a proposed question');
    }
  }

  // ---------------------------------------------------------- C6a
  if (on('C6a_CHALLENGE_GROUND_AND_ITS_EVIDENCE')) {
    for (const d of decls) {
      if (!d || typeof d !== 'object') continue;
      const isChallenge = d.declaration === 'CHALLENGE_FACT_VALIDITY';
      const g = d.challengeGround;
      const span = d.challengeObservationSpan;
      const common = d.commonActionUnderBothBranches;
      if (isChallenge) {
        if (g === null || g === undefined) {
          fail('CHALLENGE_GROUND_MISSING', `${String(d.factKey)} was challenged without a ground`);
          continue;
        }
        if (!(CHALLENGE_GROUNDS as readonly string[]).includes(String(g))) {
          fail('CHALLENGE_GROUND_NOT_A_MEMBER', `${String(d.factKey)}: ${String(g)}`);
          continue;
        }
        const establishes = g === 'THE_OBSERVATION_ALREADY_ESTABLISHES_IT';
        if (establishes) {
          if (blank(span)) {
            fail('CHALLENGE_SPAN_MISSING_FOR_THE_ESTABLISHES_GROUND', String(d.factKey));
          } else if (!input.observation.includes(String(span).trim())) {
            // The nomination rule, applied to the claim that runs the other way.
            fail('CHALLENGE_SPAN_NOT_VERBATIM',
              `${String(d.factKey)}: ${JSON.stringify(String(span).slice(0, 60))}`);
          }
          if (common !== null && common !== undefined) {
            fail('COMMON_ACTION_PRESENT_ON_THE_WRONG_GROUND', String(d.factKey));
          }
        } else {
          if (blank(common)) {
            fail('COMMON_ACTION_MISSING_FOR_THE_SAME_ACTION_GROUND', String(d.factKey));
          }
          if (span !== null && span !== undefined) {
            fail('CHALLENGE_SPAN_PRESENT_ON_THE_WRONG_GROUND', String(d.factKey));
          }
        }
      } else {
        if (g !== null && g !== undefined) {
          fail('CHALLENGE_GROUND_WITHOUT_A_CHALLENGE',
            `${String(d.factKey)} declared ${String(d.declaration)} with a challenge ground`);
        }
        if (span !== null && span !== undefined) {
          fail('CHALLENGE_SPAN_PRESENT_ON_THE_WRONG_GROUND', String(d.factKey));
        }
        if (common !== null && common !== undefined) {
          fail('COMMON_ACTION_PRESENT_ON_THE_WRONG_GROUND', String(d.factKey));
        }
      }
    }
  }

  // ---------------------------------------------------------- the new prose, scanned
  //
  // The §193 pattern has to run over the fields §193 could not know about, or every candidate
  // adding prose quietly reopens the citation surface the boundary closed.
  {
    const already = new Set(v3_3ScannedStrings(raw));
    for (const s of vnextScannedStrings(raw, enabled)) {
      if (already.has(s)) continue;
      // The CANONICAL §193 pattern, imported rather than restated. A second, differently-worded
      // pattern for the same job is how two boundaries start disagreeing about what a citation is.
      const m = CITATION_SHAPED_PATTERN.exec(s);
      if (m) {
        fail('VNEXT_CITATION_IN_A_NEW_PROSE_FIELD',
          `citation-shaped span ${JSON.stringify(m[0])} in ${JSON.stringify(s.slice(0, 60))}`);
      }
    }
  }

  const admitted = baseCodes.length === 0 && codes.length === 0;
  return {
    admitted,
    codes: baseCodes as never[],
    detail: baseDetail,
    bindingAdmitted: admitted && base.bindingAdmitted,
    nominationAdmitted: admitted && base.nominationAdmitted,
    challengedFactKeys: admitted ? base.challengedFactKeys : [],
    citationViolations: base.citationViolations,
    regulatoryRelianceDeclared: admitted && base.regulatoryRelianceDeclared,
    boundSourceIds: admitted ? base.boundSourceIds : [],
    vnextCodes: codes,
    vnextDetail: detail,
    secondSlotWithdrawalApplied: admitted && withdrawal,
    enabledCandidates: [...enabled],
  };
}

// ==================================================================== C5a projection

export interface SufficiencyReviewPair {
  readonly factKey: string;
  readonly owedPropertyAsUnderstood: string;
  readonly acceptedEvidenceClass: string;
  readonly acceptedEvidenceBoundTo: string;
  /** The governed criterion for this fact, or null where none was renderable. */
  readonly governedRequirement: string | null;
  /** Stated in the type so no reader can take the pair for an answer. */
  readonly relation: 'REQUIRES_HUMAN_TRUTH';
  readonly settles: false;
}

/**
 * Assemble the (property, accepted class) pair for human review. Only ever from an ADMITTED
 * verdict: a refused verdict's fields were not accepted and must not be presented as if they were.
 */
export function sufficiencyReviewPairs(
  raw: unknown, input: VnextAdmissionInput, result: VnextAdmissionResult,
): readonly SufficiencyReviewPair[] {
  if (!result.admitted) return [];
  const o = raw as Record<string, any> | null;
  const key = typeof o?.bindingFactKey === 'string' ? o.bindingFactKey : null;
  const ae = o?.acceptedEvidence;
  if (key === null || !ae || typeof ae !== 'object') return [];
  const decl = (Array.isArray(o?.owedFactDeclarations) ? o.owedFactDeclarations : [])
    .find((d: any) => d?.factKey === key);
  const prop = decl?.owedPropertyAsUnderstood;
  if (typeof prop !== 'string' || prop.trim().length === 0) return [];
  const fact = input.suppliedFacts.find(f => f.factKey === key);
  const crit = fact ? renderableAcceptableEvidence(fact) : null;
  return [{
    factKey: key,
    owedPropertyAsUnderstood: prop,
    acceptedEvidenceClass: String(ae.evidenceClass),
    acceptedEvidenceBoundTo: String(ae.boundTo),
    governedRequirement: crit?.requirement ?? null,
    relation: 'REQUIRES_HUMAN_TRUTH',
    settles: false,
  }];
}

// ==================================================================== C6a projection

export interface ReviewableArbitrationRequest {
  readonly factKey: string;
  readonly ground: ChallengeGround;
  readonly reason: string;
  /** Present and byte-verified against the observation for the ESTABLISHES ground. */
  readonly observationSpan: string | null;
  readonly spanVerbatimVerified: boolean;
  /** Present for the SAME_ACTION ground. */
  readonly commonActionUnderBothBranches: string | null;
  readonly requestedBy: 'VERIFIER_VNEXT_C6a';
  readonly settles: false;
  readonly factStatusUnchanged: true;
}

/**
 * The reviewable packet a challenge should have carried all along. Built only from an ADMITTED
 * verdict, and `settles: false` remains a literal type so no consumer can read it as a decision.
 */
export function reviewableArbitrationRequests(
  raw: unknown, input: VnextAdmissionInput, result: VnextAdmissionResult,
): readonly ReviewableArbitrationRequest[] {
  if (!result.admitted) return [];
  const o = raw as Record<string, any> | null;
  const decls: any[] = Array.isArray(o?.owedFactDeclarations) ? o!.owedFactDeclarations : [];
  return decls
    .filter(d => d?.declaration === 'CHALLENGE_FACT_VALIDITY')
    .map(d => {
      const span = typeof d.challengeObservationSpan === 'string'
        ? d.challengeObservationSpan : null;
      return {
        factKey: String(d.factKey),
        ground: String(d.challengeGround) as ChallengeGround,
        reason: String(d.challengeReason ?? ''),
        observationSpan: span,
        spanVerbatimVerified: span !== null && input.observation.includes(span.trim()),
        commonActionUnderBothBranches: typeof d.commonActionUnderBothBranches === 'string'
          ? d.commonActionUnderBothBranches : null,
        requestedBy: 'VERIFIER_VNEXT_C6a' as const,
        settles: false as const,
        factStatusUnchanged: true as const,
      };
    });
}

// ==================================================================== what a candidate may affect

/**
 * Restated for the candidate layer so no new field quietly acquires reach. Every candidate here is
 * a DECLARATION ABOUT THE VERDICT'S OWN REASONING or an evidence obligation on a state that was
 * already legal. None creates a finding, a citation, a settlement or an escalation.
 */
export function vnextCandidateEffect(): {
  clarificationsMayChange: boolean; owedFactCoverageMayChange: boolean;
  candidatesMayChange: false; citationsMayChange: false; deterministicMayChange: false;
  riskMayChange: false; priorityMayChange: false; settlementMayOccur: false;
  challengeMaySettleAFact: false; regulatoryTruthMayBeCreated: false;
} {
  return {
    // C3a raises the ceiling on questions from one to two, and nothing else here moves either.
    clarificationsMayChange: true,
    owedFactCoverageMayChange: true,
    candidatesMayChange: false,
    citationsMayChange: false,
    deterministicMayChange: false,
    riskMayChange: false,
    priorityMayChange: false,
    settlementMayOccur: false,
    challengeMaySettleAFact: false,
    regulatoryTruthMayBeCreated: false,
  };
}

// ==================================================================== what is NOT resolved here

/**
 * Recorded in code so it cannot be lost in a summary. Each is a question this module raises and
 * deliberately does not answer.
 */
export const OPEN_QUESTIONS_FOR_AUTHORIZATION = [
  'C2b requires `OwedFact.acceptableEvidence` to be POPULATED from a production-permitted '
  + 'provenance. Today it is null on the projected facts, so the candidate would be live on an '
  + 'empty population until that authoring exists. Who authors it is not an engineering question.',
  'C3a requires withdrawing two refusals from the frozen v3 layer. The withdrawal pattern is '
  + 'precedented at v3.3, but every downstream consumer -- the ledger bridge, the question budget, '
  + 'the structural-question projection -- currently assumes at most one proposal.',
  'Promoting any candidate to a numbered protocol version (v3.4) needs its own preregistration, '
  + 'its own hashes and its own hosted validation. Nothing here is a version.',
  'The verifier user prompt is built by `buildVerifierV3UserPrompt`, which this module may not '
  + 'modify. C2b\'s input-side render therefore needs a successor builder owned by whoever owns '
  + 'that file.',
] as const;
