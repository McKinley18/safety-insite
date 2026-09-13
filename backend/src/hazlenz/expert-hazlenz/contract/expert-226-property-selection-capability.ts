/**
 * §226 -- FINAL BOUNDED FIRST-PASS SEMANTIC REMEDIATION: THE INSTRUCTION SUCCESSOR TO §224.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== WHAT THIS CLOSES ====================
 *
 * §225 executed sixteen hosted calls under a frozen paired protocol and established that the §224
 * instruction is DIRECTIONALLY EFFECTIVE AND INSUFFICIENT: declaration recall moved 4/7 -> 6/7 and
 * controlling-property identity 1/7 -> 3/7 with the instruction as the only variable, and four of
 * six primary gates still failed. Output shape was 8/8 clean on both arms, no response truncated,
 * and §223 already established that the structured representation is sufficient. So the remaining
 * blocker is neither transport, nor token pressure, nor representation capacity.
 *
 * ONE MECHANISM EXPLAINS ALL THREE REMAINING FAILURES, AND IT IS THE SAME MECHANISM.
 *
 * EVERY §224 RULE IS KEYED ON AN ENUMERATION THE MODEL MUST FIRST PLACE ITSELF INTO. A model that
 * does not place itself inside the enumeration never reaches the rule. The rule is not overridden;
 * it is simply never evaluated. Three instances, each demonstrated on §225 evidence:
 *
 * A. CANDIDATE-STATE BYPASS (§225 H5, G1 and G3). THE DECLARATION TRIGGER opens "Take every
 *    candidate you yourself put at UNKNOWN or INSUFFICIENT_EVIDENCE, every candidate you marked
 *    requiresUserConfirmation true, and every unknown you named in an uncertainty statement." The
 *    enumerated set is built ENTIRELY out of the model's own self-reported labels. On H5 the
 *    remediated arm asserted every concern ACTIVE at HIGH confidence with requiresUserConfirmation
 *    false and wrote no uncertainty statement, INCLUDING a candidate whose own reasoning reads that
 *    the soil classification "cannot be relied upon to judge whether the unsupported sides will
 *    hold". The enumerated set was empty. The trigger never fired. Zero declarations were emitted
 *    against two owed properties.
 *
 *    The circularity is exact:
 *      MODEL SELECTS STATE -> STATE CONTROLS WHETHER MODEL MUST DECLARE UNCERTAINTY
 *      -> INCORRECT STATE SUPPRESSES DECLARATION OF THE FACT NEEDED TO JUSTIFY THAT STATE.
 *    `assertedConditionState` is an OUTPUT CONCLUSION. §224 used it as an INPUT PREDICATE.
 *
 * B. PROPERTY SELECTION (§225 H2, H3, G2). GATE 13 is written throughout as a rule ABOUT CONTROLS
 *    -- its title, its worked list ("whether the fan is running, whether the interlock is closed"),
 *    and its test ("take your own branchA -- THE CONTROL WORKING EXACTLY AS INTENDED"). The test is
 *    reached only by a model that has already classified its own property as control-shaped. H2
 *    declared "whether the supply circuit has functioning residual current protection" and H3
 *    "whether the extraction system is moving sufficient air". Both ARE control states and GATE 13
 *    forbids both, and the model applied the gate to neither. Enumerating the forbidden kinds
 *    cannot help when the gate depends on the model recognising the kind.
 *
 * C. REQUIRED ARTIFACT (§225 H7, G6). GATE 13 states "unless that act or that artifact is itself
 *    the governing requirement, WHICH GATE 8 ALREADY CARVES OUT". IT DOES NOT. GATE 8's carve-out
 *    reads "where performing THE ACT is itself what changes today's action, the ACT IS the state",
 *    and GATE 8 closes by sending records the other way: "A missing record or an old reading
 *    belongs in `notEstablishedBecause` ... and stays there." GATE 12's choosing test terminates on
 *    the act for the same reason: "If seeing it would leave the decision still turning on whether
 *    THE REQUIRED ACT was carried out, then the ACT IS your property." The base contract carves out
 *    the required ACT in two places and the required ARTIFACT in none, while listing "documented,
 *    recorded, available" among the things to move past. §224 asserted a carve-out that was never
 *    written. On H7 -- a boiler whose written scheme of examination requires a periodic report and
 *    whose last report is five months out of date -- both arms named "whether an examination was
 *    actually carried out and passed", one level BENEATH the artifact that is itself the statutory
 *    precondition. Both arms did it, so this is a base-contract defect §224 inherited, not one it
 *    introduced.
 *
 * ==================== WHAT §226 DOES ABOUT IT ====================
 *
 * REPLACES ENUMERATION-KEYED RULES WITH TESTS APPLIED UNCONDITIONALLY, FROM THE DECISION.
 *
 * Block 1 widens the trigger's input set from "candidates I labelled unresolved" to "every
 * candidate that bears materially on today's decision, whatever I labelled it", and says in terms
 * that the label is a conclusion and not evidence. It is inserted immediately BEFORE the §224 line
 * "For each one, apply the test in its full form:", so the §224 three-limbed test -- which §225
 * showed to work when it is reached -- is what runs over the widened set. The test is not touched.
 *
 * Block 2 adds GATE 14: one sufficiency test, applied to EVERY entry, with no precondition that the
 * model first classify its property as a control, a document or anything else. Grant branchA
 * outright and ask whether the safety decision is then made. GATE 14 also states the STOP rule, so
 * the test bounds over-correction in the other direction, and states the required-ARTIFACT carve-out
 * that GATE 8 and GATE 12 hold for the required ACT and never held for the record.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * NO SCHEMA CHANGE. The §210J wire schema, re-exported unchanged through §224 and asserted
 * identical here by `assertSchemaUnchanged`.
 *
 * NO NEW LAYER, NO NEW VERIFIER, NO NEW SEMANTIC AUTHORITY. The model still authors every semantic
 * judgement. Nothing deterministic reads prose, reconstructs a declaration or selects a property.
 * The projection, the ledger, the verifier and the authority boundary are untouched.
 *
 * NO REWRITE OF §224. Per HAZLENZ_INVARIANTS 26, contracts are extended by additive successors
 * built by construction from the base. §224's own text is left exactly where it is and qualified in
 * place -- the same move §224 made on §210J's subordination sentence. `reconstruct224SystemPrompt`
 * proves the removal reproduces §224 byte for byte, and §224 reconstructs §210J in turn.
 */

import { createHash } from 'crypto';

import type {
  ExpertAnalysisInput,
} from '../expert-contract.types';
import {
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  FIRST_PASS_CONTRACT_224_VERSION,
  buildExpert224WireSchema,
  reconstruct210jSystemPrompt,
} from './expert-224-declaration-capability';
import { buildExpert210jWireSchema } from './expert-210j-first-pass-contract';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';

export const FIRST_PASS_CONTRACT_226_VERSION =
  'hazlenz.expert.first-pass-contract.226-decision-keyed-semantics' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_CONTRACT_VERSION_226 = FIRST_PASS_CONTRACT_224_VERSION;

/** Recorded as data so the suite asserts the boundary rather than a reader inferring it. */
export const SLICE_BOUNDARY_226 = {
  schemaChanged: false,
  wireGrammarIdentityMoves: false,
  newSemanticAuthorityIntroduced: false,
  deterministicSemanticInferenceIntroduced: false,
  newArchitectureLayerIntroduced: false,
  verifierChanged: false,
  projectionChanged: false,
  ledgerChanged: false,
  runtimeModulesChanged: 0,
  instructionOnly: true,
  section224TextRewritten: false,
  basis: '§225 established that output shape, token pressure and representation capacity are not '
    + 'the blocker. The remaining mechanism is reachable by instruction alone.',
} as const;

/** The root causes this slice acts on, each with the §225 evidence that demonstrates it. */
export const ROOT_CAUSES_226 = [
  {
    id: 'RC5',
    family: 'CANDIDATE_STATE_BYPASS',
    cause: 'DECLARATION_TRIGGER_KEYED_ON_SELF_REPORTED_CANDIDATE_STATE',
    demonstratedBy: '§224 THE DECLARATION TRIGGER enumerates its input set out of the model\'s own '
      + 'labels: "Take every candidate you yourself put at UNKNOWN or INSUFFICIENT_EVIDENCE, every '
      + 'candidate you marked requiresUserConfirmation true, and every unknown you named in an '
      + 'uncertainty statement." On §225 H5 the remediated arm asserted every concern ACTIVE at '
      + 'HIGH with requiresUserConfirmation false and no uncertainty statement, including one whose '
      + 'own reasoning says the soil classification "cannot be relied upon to judge whether the '
      + 'unsupported sides will hold". The enumerated set was empty and the trigger never fired.',
    observedIn: ['H5'],
    gatesCost: ['G1_DECLARATION_RECALL', 'G3_INDEPENDENCE'],
    remedy: 'CANDIDATE_STATE_NOT_TRIGGER_LINES — the input set becomes every materially relevant '
      + 'candidate, whatever state the model assigned, and the label is named an output conclusion',
  },
  {
    id: 'RC6',
    family: 'PROPERTY_SELECTION',
    cause: 'PROPERTY_GATE_REACHABLE_ONLY_BY_SELF_CLASSIFICATION',
    demonstratedBy: '§224 GATE 13 is framed throughout as a rule about controls -- its title, its '
      + 'worked list, and its test, which opens "take your own branchA -- THE CONTROL WORKING '
      + 'EXACTLY AS INTENDED". A model reaches the test only after classifying its own property as '
      + 'control-shaped. §225 H2 declared "whether the supply circuit has functioning residual '
      + 'current protection" and H3 "whether the extraction system is moving sufficient air". GATE '
      + '13 forbids both and neither was tested against it.',
    observedIn: ['H2', 'H3'],
    gatesCost: ['G2_PROPERTY_IDENTITY'],
    remedy: 'GATE 14 — one sufficiency test applied to EVERY entry with no self-classification '
      + 'precondition, run from the decision rather than from the shape of the property',
  },
  {
    id: 'RC7',
    family: 'REQUIRED_ARTIFACT',
    cause: 'REQUIRED_ARTIFACT_CARVE_OUT_ASSERTED_BY_224_BUT_ABSENT_FROM_THE_BASE',
    demonstratedBy: '§224 GATE 13 says "unless that act or that artifact is itself the governing '
      + 'requirement, which GATE 8 already carves out". GATE 8 carves out the ACT only -- "where '
      + 'performing the act is itself what changes today\'s action, the act IS the state" -- and '
      + 'closes by sending records away: "A missing record or an old reading belongs in '
      + '`notEstablishedBecause` ... and stays there." GATE 12 terminates its choosing test on the '
      + 'act for the same reason. On §225 H7 both arms named the underlying examination rather than '
      + 'the current examination report that the written scheme makes the precondition for running '
      + 'the boiler, so this is inherited from the base contract and was not introduced by §224.',
    observedIn: ['H7'],
    gatesCost: ['G6_REQUIRED_ARTIFACT_CONTROL'],
    remedy: 'the WHERE THE RECORD IS THE REQUIREMENT paragraph inside GATE 14, which states the '
      + 'artifact carve-out the base holds for the act, and separates a record that is evidence '
      + 'about a state from a record whose existence or currency is itself the requirement',
  },
] as const;

/**
 * Recorded so the report can state what §226 deliberately did NOT touch. §225 named a branch-drift
 * defect on H4 -- the property moved to the condition while branchA and branchB still divided
 * inspected from not-inspected. GATE 12 already forbids exactly that, no §226 gate turns on it, and
 * the authorization for this slice is bounded to the demonstrated remaining mechanism.
 */
export const OUT_OF_SCOPE_226 = [
  {
    defect: 'H4_BRANCH_DRIFT_AFTER_PROPERTY_CORRECTION',
    why: 'GATE 12 already forbids branches that divide inspected from not-inspected. §225 recorded '
      + 'it as material and not gated. Adding instruction for it is outside the bounded '
      + 'authorization for the demonstrated remaining mechanism, and it is reported, not fixed.',
  },
  {
    defect: 'SECTION_225_H5_P2_AUTHORING_ERROR',
    why: 'H5\'s second owed property was stated as established by its own observation. §225 '
      + 'recorded the error and did not revise the frozen protocol. The §226 instrument is authored '
      + 'fresh and preflights against exactly that class of error; the §225 record stands as it is.',
  },
] as const;

// ------------------------------------------- block 1: the candidate state is not the trigger

/**
 * Inserted immediately BEFORE the §224 line "For each one, apply the test in its full form:", so
 * the set the §224 three-limbed test runs over is widened where it is read, and the test itself is
 * left exactly as §225 found it working.
 */
export const CANDIDATE_STATE_NOT_TRIGGER_LINES: readonly string[] = [
  'THAT ENUMERATION IS WHERE YOU START AND NOT WHERE YOU STOP. THE STATE YOU ASSIGNED IS NOT THE',
  'TRIGGER. assertedConditionState, confidence and requiresUserConfirmation are CONCLUSIONS YOU',
  'REACHED. They are output, not evidence, and they cannot decide whether you owe an entry. A',
  'candidate you called ACTIVE at HIGH confidence can still rest on something you do not know:',
  'calling it ACTIVE did not establish that thing, it only stopped you looking at it. The reasoning',
  'runs the wrong way round if the label you chose decides whether you must declare the fact that',
  'would justify the label.',
  '',
  'SO THE SET IS WIDER. Take EVERY candidate that bears materially on the decision in front of you,',
  'whatever state you gave it — ACTIVE, CONTROLLED, CORRECTED, REMOVED_FROM_SERVICE, NEGATED,',
  'HYPOTHETICAL, UNKNOWN, INSUFFICIENT_EVIDENCE — and whatever you set requiresUserConfirmation to.',
  'Add every unknown you named anywhere in your own text. The question is never "which box did I',
  'put this in". The question is the decision.',
  '',
  'ASK IT FROM THE DECISION, ONE CANDIDATE AT A TIME:',
  '',
  '  WHAT PROPOSITION MUST BE TRUE OR FALSE to determine whether this condition is actually',
  '  established, whether the work may proceed, which control is required, or which corrective',
  '  decision is appropriate?',
  '',
  '  DO THE FACTS YOU WERE GIVEN ACTUALLY ESTABLISH THAT PROPOSITION?',
  '',
  'If they do not, and the two answers would materially change the safety decision, the property is',
  'owed and the entry is written — whatever state stands at the top of the candidate.',
  '',
  'READ YOUR OWN REASONING BACK AGAINST YOUR OWN LABEL. Where the words you wrote for a candidate',
  'say that something needed to judge that condition is not established — the ground type is not',
  'known, the load cannot be worked out, the substance cannot be identified, the rating cannot be',
  'read, a fact "cannot be relied upon" to settle the condition — then that is a recognised unknown,',
  'and the state at the top of the candidate does not answer it. Your own two sentences must agree.',
  'If they do not, it is the label that is in doubt, not the gap.',
  '',
  'ONE CANDIDATE DOES NOT ANSWER FOR ANOTHER, AND ONE ENTRY DOES NOT ABSORB A SIBLING. Run this',
  'once per decision-controlling proposition, not once per work activity. Two propositions that bear',
  'on the same job are two runs and, where both are owed, two entries. A hazard you have established',
  'never discharges a different property that is still open, and naming the loudest gap is not a',
  'reason to leave a quieter one unwritten.',
  '',
];

// ------------------------------------------------------------- block 2: the sufficiency gate

/** Appended at the closing anchor, after GATE 13, in the form the other gates take. */
export const SUFFICIENCY_GATE_LINES: readonly string[] = [
  '',
  '================ GATE 14. GRANT THE BRANCH AND SEE IF THE DECISION IS MADE ================',
  '',
  'THIS ONE RUNS ON EVERY ENTRY. Not only the entries that look like a control, or a document, or a',
  'check. GATE 13 asks you to notice that your property is a control before it can help you, and a',
  'property you did not notice never reaches it. This gate needs you to notice nothing. It adds no',
  'new reason to declare anything.',
  '',
  'THE TEST, ONE ENTRY AT A TIME. Take your own branchA exactly as you wrote it. Grant it outright —',
  'it is true, and nothing else has changed. Now ask: IS THE SAFETY DECISION NOW MADE? Would a',
  'competent person, holding that answer and nothing more, know whether the work may proceed and',
  'under what control?',
  '',
  'IF NO, YOU HAVE NAMED AN INPUT AND NOT THE QUESTION. Something else would still have to be',
  'established before anyone could decide, and that something else is the property. Move ONE level',
  'toward it and run the test again. What you are moving off is one of these, and each is worth',
  'recognising by name:',
  '',
  '  EVIDENCE ABOUT THE PROPERTY — the reading, the record, the label, the report consulted',
  '  CONTROL STATE — whether the fan runs, the interlock is closed, the RCD is fitted, the',
  '    extraction is moving air',
  '  VERIFICATION ACT — whether it was checked, tested, measured, examined, assessed',
  '  DOCUMENT OR RECORD — whether a certificate, log or drawing can be produced',
  '  PROCESS STEP — whether the procedure was followed, the method agreed, the briefing given',
  '  ADJACENT PROPERTY — a real state of the world that is simply not the one the decision turns on',
  '',
  'Worked, so the size of the step is not in doubt:',
  '',
  '  NOT: is the ventilation fan operating?        BUT: is the atmosphere safe to enter?',
  '  NOT: has the scaffold been assessed?          BUT: is the scaffold structurally sound for the',
  '                                                     work it is to carry?',
  '  NOT: does the circuit have RCD protection?    BUT: is this appliance in a condition safe to use',
  '                                                     where it is being used?',
  '  NOT: is the extraction moving enough air?     BUT: is this atmosphere safe to occupy without',
  '                                                     respiratory protection?',
  '',
  'In each pair the left-hand fact is worth asking about and usually should be asked about. It is',
  'the bound question. It is not the property.',
  '',
  'IF YES, YOU ARE THERE — AND YOU STOP. The test bounds this in both directions. Once granting',
  'branchA settles the decision, going a level deeper is the same error facing the other way, and it',
  'costs the same. Do not abstract a good property into a vaguer one. Do not replace something that',
  'must actually happen with the state it would produce. "Move toward the proposition" is not a',
  'standing instruction to keep moving.',
  '',
  'WHERE THE ACT IS THE REQUIREMENT, THE ACT IS THE PROPERTY. GATE 8 and GATE 12 both say so and',
  'this gate does not take it back. Where the rule requires the act to be done — the second',
  'isolation applied and proved, the atmosphere retested before re-entry, the load proof-tested —',
  'the act IS the condition and naming it is right.',
  '',
  'WHERE THE RECORD IS THE REQUIREMENT, THE RECORD IS THE PROPERTY. Say this plainly, because the',
  'earlier gates say it of the act and not of the record, and they list documented, recorded and',
  'available among the things to move past. Where a statute, a written scheme of examination, a',
  'permit regime, a certificate regime or a procedure makes the EXISTENCE, the CURRENCY or the',
  'STATUS of a record the precondition for the work, THAT RECORD IS THE CONDITION, and you must not',
  'move beneath it to the act it records.',
  '',
  'THE TWO KINDS OF RECORD, AND HOW TO TELL THEM APART:',
  '',
  '  A RECORD THAT IS EVIDENCE. The log, the reading, the note, the earlier report you would consult',
  '  because it would tell you about a state. Its absence does not stop the work — the state does.',
  '  Name the state, and ask for the record.',
  '',
  '  A RECORD WHOSE EXISTENCE OR STATUS IS ITSELF REQUIRED. The current examination report, the',
  '  thorough-examination certificate, the permit, the authorisation, the statutory notification,',
  '  the in-date test record the scheme demands before the plant may run. Its absence stops the work',
  '  BY ITSELF, whatever the plant looks like and however well it is running. Name the record.',
  '',
  '  THE TEST: grant that everything the record would have told you is true and good — the',
  '  examination was carried out, and it passed — but the record still does not exist, or is out of',
  '  date. MAY THE WORK PROCEED? If NO, the record is your property. Naming the underlying act',
  '  instead leaves the thing that actually stops the work undeclared, and an entry that names the',
  '  act can be closed by someone asserting the act happened while the requirement is still unmet.',
  '',
  'A LABEL IS STILL NOT A LICENCE, AND NEITHER IS A SHAPE. A property is not right because it names',
  'a state rather than a process, and not wrong because it names a record. Only the test decides.',
];

// ---------------------------------------------------------------- prompt construction

/** Unique in both §224 variants. The block lands where the trigger builds its input set. */
const TRIGGER_SET_ANCHOR = 'For each one, apply the test in its full form:';

/** Unique in both §224 variants. The gate lands after GATE 13, where the gates end. */
const GATE_ANCHOR_226 = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[], which: string,
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_226_ABORT: the ${which} anchor appears ${hits.length} times in the §224 system `
      + 'prompt, expected 1. This successor is built by construction from §224 and refuses to load '
      + 'against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

function build226(base: string): string {
  const withTrigger = insertBeforeUniqueAnchor(
    base.split('\n'), TRIGGER_SET_ANCHOR, CANDIDATE_STATE_NOT_TRIGGER_LINES, 'candidate-state');
  return insertBeforeUniqueAnchor(
    withTrigger, GATE_ANCHOR_226, SUFFICIENCY_GATE_LINES, 'sufficiency-gate').join('\n');
}

export const EXPERT_FIRST_PASS_226_SYSTEM_PROMPT: string =
  build226(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT);

export const EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  build226(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);

export function build226SystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_226_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove both §226 blocks again. Must reproduce the §224 prompt byte for byte. */
export function reconstruct224SystemPrompt(prompt: string): string {
  let out = prompt;
  for (const [block, which] of [
    [SUFFICIENCY_GATE_LINES, 'sufficiency-gate'],
    [CANDIDATE_STATE_NOT_TRIGGER_LINES, 'candidate-state'],
  ] as const) {
    const joined = block.join('\n');
    const idx = out.indexOf(joined);
    if (idx === -1) {
      throw new Error(`FIRST_PASS_226: the ${which} block is not present; cannot reconstruct`);
    }
    out = out.slice(0, idx) + out.slice(idx + joined.length + 1);
  }
  return out;
}

/** The whole additive chain, checked end to end: §226 -> §224 -> §210J, byte for byte. */
export function reconstruct210jFrom226(prompt: string): string {
  return reconstruct210jSystemPrompt(reconstruct224SystemPrompt(prompt));
}

// ---------------------------------------------------------------- the schema, unchanged

/** §226 is instruction-only. The wire schema is the §210J schema, re-exported through §224. */
export function buildExpert226WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  return buildExpert224WireSchema(input, governed);
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function assertSchemaUnchanged226(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): { readonly identical: true; readonly sha256: string } {
  const base210j = JSON.stringify(buildExpert210jWireSchema(input, governed));
  const base224 = JSON.stringify(buildExpert224WireSchema(input, governed));
  const here = JSON.stringify(buildExpert226WireSchema(input, governed));
  if (base210j !== base224 || base224 !== here) {
    throw new Error('FIRST_PASS_226_ABORT: the wire schema moved. §226 is instruction-only.');
  }
  return { identical: true, sha256: sha(here) };
}

/** Identity of the composed instruction, per variant, for any freeze that pins this slice. */
export function instructionIdentity226(): {
  readonly version: typeof FIRST_PASS_CONTRACT_226_VERSION;
  readonly base: string;
  readonly plain: string;
  readonly governed: string;
} {
  return {
    version: FIRST_PASS_CONTRACT_226_VERSION,
    base: BASE_CONTRACT_VERSION_226,
    plain: sha(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT),
    governed: sha(EXPERT_FIRST_PASS_226_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
  };
}
