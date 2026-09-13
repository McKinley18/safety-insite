/**
 * §224 -- FIRST-PASS DECLARATION CAPABILITY: THE INSTRUCTION SUCCESSOR TO §210J.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== WHAT THIS CLOSES ====================
 *
 * §223 established two Class A capability defects at the first pass's semantic-to-structured
 * emission boundary. §224 Phase A traced both to the instruction, with the evidence quoted below.
 *
 * A. DECLARATION RECALL. The declaration list is SUBORDINATE TO THE CLARIFICATION LIST by
 *    construction. `STATING AN UNRESOLVED FACT IN FULL` says, in as many words: "The test is the
 *    one you have already applied ... If you would not have asked about it, do not declare it."
 *    Every path that can ADD an entry runs through a question: the RETENTION BRIDGE routes a
 *    recognised unknown to `decisionCriticalClarifications`, and the FOUR CHECKS then route a
 *    question to `unresolvedFactDeclarations`. Every other gate can only delete or narrow -- each
 *    says so itself: "They add no new reason to declare anything."
 *
 *    So a first pass that asks nothing declares nothing, and that is CONTRACT-COMPLIANT. §221 IG1
 *    and IG8 both emitted zero clarifications and zero declarations while carrying a candidate at
 *    UNKNOWN / INSUFFICIENT_EVIDENCE with requiresUserConfirmation true. Neither broke the contract.
 *
 * B. CONTROLLING-PROPERTY SELECTION. Every property gate in the base contract separates the STATE
 *    from the EVIDENCE or the PROCESS that would establish it -- GATE 8 lists checked, inspected,
 *    tested, measured, verified, documented, recorded; GATE 12 names the same drift. A CONTROL'S
 *    OPERATING STATE is neither. It is a real state of the world, it passes every one of those
 *    tests, and `affectedDecision: REQUIRED_CONTROL` is defined in the base contract to cover
 *    "whether a specific control was applied" -- which licenses it. §221 IG10 declared "whether the
 *    plant room ventilation fan is currently running" against a frozen controlling property of
 *    whether the atmosphere is safe to enter, and every existing gate passed it.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * NO SCHEMA CHANGE. The §210J wire schema is re-exported unchanged and asserted identical. §223
 * found the required structured representation already exists: a candidate carries
 * `assertedConditionState` with UNKNOWN and INSUFFICIENT_EVIDENCE, and `uncertainty.statements`
 * can carry a witnessed negative. Both blocks below use only fields that already exist.
 *
 * NO NEW SEMANTIC AUTHORITY. No second verifier, no new layer, no taxonomy. The model still
 * authors every semantic judgement; this changes only what the instruction asks it to do.
 *
 * NO DETERMINISTIC SEMANTIC INFERENCE. Nothing deterministic reads prose, reconstructs a
 * declaration, or selects a property. The projection is untouched.
 *
 * ==================== BUILT BY CONSTRUCTION, LIKE EVERY SUCCESSOR BEFORE IT ====================
 *
 * Two blocks inserted at two unique anchors in the §210J prompt, aborting if the base has drifted,
 * with `reconstruct210jSystemPrompt` proving the removal reproduces the base byte for byte. Both
 * prompt variants -- with and without governed binding -- are derived the same way.
 */

import { createHash } from 'crypto';

import type {
  ExpertAnalysisInput,
} from '../expert-contract.types';
import {
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  FIRST_PASS_CONTRACT_210J_VERSION,
  buildExpert210jWireSchema,
} from './expert-210j-first-pass-contract';
import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';

export const FIRST_PASS_CONTRACT_224_VERSION =
  'hazlenz.expert.first-pass-contract.224-declaration-capability' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_CONTRACT_VERSION = FIRST_PASS_CONTRACT_210J_VERSION;

/** Recorded as data so the suite asserts the boundary rather than a reader inferring it. */
export const SLICE_BOUNDARY_224 = {
  schemaChanged: false,
  wireGrammarIdentityMoves: false,
  newSemanticAuthorityIntroduced: false,
  deterministicSemanticInferenceIntroduced: false,
  verifierChanged: false,
  projectionChanged: false,
  runtimeModulesChanged: 0,
  instructionOnly: true,
  basis: '§223 established that the required structured representation already exists. Both blocks '
    + 'use only fields the §210J schema already carries.',
} as const;

/** The root causes this slice acts on, each with the instruction text that demonstrates it. */
export const ROOT_CAUSES_224 = [
  {
    id: 'RC1',
    family: 'DECLARATION_RECALL',
    cause: 'DECLARATION_SUBORDINATED_TO_CLARIFICATION',
    demonstratedBy: 'STATING AN UNRESOLVED FACT IN FULL: "If you would not have asked about it, do '
      + 'not declare it." No path adds a declaration except through a question.',
    observedIn: ['IG1', 'IG8'],
    remedy: 'DECLARATION_TRIGGER_LINES — an independent trigger keyed on the model\'s own '
      + 'candidate states',
  },
  {
    id: 'RC2',
    family: 'DECLARATION_RECALL',
    cause: 'DECLARATION_THRESHOLD_MISSING_THE_WHICH_CONTROL_LIMB',
    demonstratedBy: 'GATE 3 asks whether "the required action today is materially the same either '
      + 'way". IG1 answered at the level of whether to act -- the fall hazard is ACTIVE under both '
      + 'answers -- rather than which fall protection the rise requires, and recorded that reading '
      + 'in its own uncertainty statement.',
    observedIn: ['IG1'],
    remedy: 'the three-limbed test inside DECLARATION_TRIGGER_LINES',
  },
  {
    id: 'RC3',
    family: 'DECLARATION_RECALL',
    cause: 'UNWITNESSED_NEGATIVE_CONCLUSION',
    demonstratedBy: 'The FOUR CHECKS permit discharge by concluding the fact "does not change '
      + 'today\'s action after all", and the RETENTION BRIDGE says "If NO, say nothing." Neither '
      + 'requires any structured record, so a blanket prose negative discharges both. IG8 wrote '
      + '"No decision-critical fact is missing" while its own CAND-3 stood at '
      + 'INSUFFICIENT_EVIDENCE, and left uncertainty.statements empty.',
    observedIn: ['IG8'],
    remedy: 'the witnessed-negative requirement inside DECLARATION_TRIGGER_LINES',
  },
  {
    id: 'RC4',
    family: 'PROPERTY_SELECTION',
    cause: 'INSTRUCTION_PRIORITY_CONFLICT_CONTROL_STATE_VS_HAZARD_STATE',
    demonstratedBy: 'GATE 8 and GATE 12 separate state from evidence and process only. A control\'s '
      + 'operating state is a genuine state and passes both. The affectedDecision vocabulary '
      + 'independently defines REQUIRED_CONTROL as covering "whether a specific control was '
      + 'applied", which licenses it. Nothing subordinates the control\'s state to the hazard state '
      + 'when the hazard state is itself open.',
    observedIn: ['IG10'],
    remedy: 'PROPERTY_ORDER_GATE_LINES — GATE 13',
  },
] as const;

// ---------------------------------------------------------------- block 1: the declaration trigger

/**
 * Inserted immediately after the sentence that subordinates the declaration to the question, so it
 * qualifies that sentence where it is read rather than somewhere else in the prompt.
 */
export const DECLARATION_TRIGGER_LINES: readonly string[] = [
  'THAT LAST SENTENCE BINDS THE STANDARD, NOT THE TRIGGER. A fact you would have asked about',
  'always belongs here. A fact you did not ask about can still belong here, and one test decides',
  'which. Asking is one way a gap gets recorded. It is not the only way, and it is not a',
  'precondition for this list.',
  '',
  'THE DECLARATION TRIGGER. Read back your own candidate list and your own uncertainty statements.',
  'Take every candidate you yourself put at UNKNOWN or INSUFFICIENT_EVIDENCE, every candidate you',
  'marked requiresUserConfirmation true, and every unknown you named in an uncertainty statement.',
  'For each one, apply the test in its full form:',
  '',
  '  would learning this fact change whether the work may proceed,',
  '  WHICH CONTROL IS REQUIRED,',
  '  or what corrective decision is appropriate?',
  '',
  'All three limbs count, and the middle one is the one that gets dropped. A hazard you have',
  'already called ACTIVE stays ACTIVE under both answers, and that is not a reason to let the entry',
  'go. If the two answers call for different controls, a different standard, a different height or',
  'grade of protection, a different stop point or a different sequence, then what must be done',
  'today is not the same and the fact is owed. "Something has to be done either way" does not',
  'answer this test. The test asks whether WHAT must be done is the same.',
  '',
  'IF THE ANSWER IS YES, WRITE THE ENTRY. Not a question instead of it, not a sentence in the',
  'summary, not an uncertainty statement, not a candidate left at UNKNOWN. Each of those is a place',
  'a real gap has been lost before. Writing the question as well is right and usually expected, but',
  'the entry does not wait for the question: a decision-critical property you recognised yourself',
  'belongs in unresolvedFactDeclarations whether or not you chose to ask about it.',
  '',
  'IF THE ANSWER IS NO, SAY SO WHERE IT CAN BE READ. Write one uncertainty statement that names',
  'that candidate or that unknown and says, in your own words, what does not change today whichever',
  'way it turns out. That statement is the only record of a decision you actually made. Without it',
  'nobody downstream can tell a fact you correctly set aside from a fact you dropped, and the two',
  'look identical in the output.',
  '',
  'A BLANKET NEGATIVE IS NOT THAT RECORD. "No decision-critical fact is missing", written in the',
  'summary while one of your own candidates stands at UNKNOWN or INSUFFICIENT_EVIDENCE, contradicts',
  'your own output. Your lists are both yours and they must agree. Either that candidate is not',
  'actually unresolved, in which case say which state it is in and why, or the fact is owed and you',
  'write the entry.',
  '',
  'NONE OF THIS LOWERS THE BAR AND IT IS NOT A QUOTA. Most unknowns are neither owed nor asked.',
  'UNKNOWN on its own is never a reason to declare anything, and neither is INSUFFICIENT_EVIDENCE:',
  'the three-limbed test above still decides, and a fact that fails it is set aside with a witnessed',
  'negative, not written up. Declaring something that changes nothing today is the opposite failure',
  'and it costs just as much.',
  '',
];

// ---------------------------------------------------------------- block 2: the property-order gate

/** Appended at the closing anchor, in the form the other gates take. */
export const PROPERTY_ORDER_GATE_LINES: readonly string[] = [
  '',
  '================ GATE 13. THE PROPERTY IS THE CONDITION, NOT THE CONTROL ================',
  '',
  'One last check on the property you chose. It adds no new reason to declare anything.',
  '',
  'GATE 8 and GATE 12 keep evidence and process out of the property: checked, tested, measured,',
  'recorded, verified. A CONTROL\'S OPERATING STATE is none of those. Whether the fan is running,',
  'whether the interlock is closed, whether the extraction is on, whether the detector is live,',
  'whether the switch is off: each is a real state of the world, each passes every test above, and',
  'each can still be the wrong property.',
  '',
  'THE ORDER DECIDES. A control\'s state is your property only when the condition it bears on is',
  'ALREADY SETTLED and what remains open is genuinely which control is required, or whether this',
  'one was applied. Where the condition is ITSELF open, the control\'s state is one input to it.',
  'Declaring the input leaves the question undeclared, and the question was the decision-critical',
  'part.',
  '',
  'THE TEST, ONE ENTRY AT A TIME: take your own branchA -- the control working exactly as intended',
  '-- and grant it. Is the safety decision now made? If a competent person would still have to ask',
  'whether the condition is actually safe, you have declared an input and not the question. Rewrite',
  'missingFact as the condition: whether the atmosphere is safe to enter, whether the ropes will',
  'carry the load, whether the part is at zero energy, whether the rotor is at rest before anyone',
  'can reach it. Let the control\'s state be what the bound question asks about. Asking about the',
  'control is usually the right question; it is not the property.',
  '',
  'CHOOSING IT IN THE FIRST PLACE: ask what proposition must become known for the safety DECISION',
  'to be made, and declare THAT proposition. Not what observation, test, control, document or act',
  'would help answer it -- unless that act or that artifact is itself the governing requirement,',
  'which GATE 8 already carves out and this gate does not take back. Where performing the act or',
  'holding the document is what the law or the procedure actually requires, the act or the document',
  'IS the condition and naming it is right.',
  '',
  'A LABEL IS NOT A LICENCE. affectedDecision: REQUIRED_CONTROL names the decision this fact blocks.',
  'It does not make a control\'s operating state into the property. The same label is correct on an',
  'entry whose property is the condition itself, and that is the entry you should be writing when',
  'the condition is open.',
];

// ---------------------------------------------------------------- prompt construction

/** Unique in both §210J variants. The block lands after the subordination sentence it qualifies. */
const TRIGGER_ANCHOR =
  'What is new is the SHAPE, not the standard. A question records that something is missing. A';

/** Unique in both §210J variants. The gate lands where the other gates end. */
const GATE_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[], which: string,
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_224_ABORT: the ${which} anchor appears ${hits.length} times in the §210J system `
      + 'prompt, expected 1. This successor is built by construction from §210J and refuses to '
      + 'load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

function build224(base: string): string {
  const withTrigger = insertBeforeUniqueAnchor(
    base.split('\n'), TRIGGER_ANCHOR, DECLARATION_TRIGGER_LINES, 'declaration-trigger');
  return insertBeforeUniqueAnchor(
    withTrigger, GATE_ANCHOR, PROPERTY_ORDER_GATE_LINES, 'property-order-gate').join('\n');
}

export const EXPERT_FIRST_PASS_224_SYSTEM_PROMPT: string =
  build224(EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT);

export const EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  build224(EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING);

export function build224SystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_224_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove both blocks again. Must reproduce the §210J prompt byte for byte. */
export function reconstruct210jSystemPrompt(prompt: string): string {
  let out = prompt;
  for (const [block, which] of [
    [PROPERTY_ORDER_GATE_LINES, 'property-order-gate'],
    [DECLARATION_TRIGGER_LINES, 'declaration-trigger'],
  ] as const) {
    const joined = block.join('\n');
    const idx = out.indexOf(joined);
    if (idx === -1) {
      throw new Error(`FIRST_PASS_224: the ${which} block is not present; cannot reconstruct`);
    }
    out = out.slice(0, idx) + out.slice(idx + joined.length + 1);
  }
  return out;
}

// ---------------------------------------------------------------- the schema, unchanged

/**
 * §224 is instruction-only. The wire schema is the §210J schema, re-exported, and
 * `assertSchemaUnchanged` proves it rather than asserting it in a comment.
 */
export function buildExpert224WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  return buildExpert210jWireSchema(input, governed);
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function assertSchemaUnchanged(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): { readonly identical: true; readonly sha256: string } {
  const a = JSON.stringify(buildExpert210jWireSchema(input, governed));
  const b = JSON.stringify(buildExpert224WireSchema(input, governed));
  if (a !== b) {
    throw new Error('FIRST_PASS_224_ABORT: the wire schema moved. §224 is instruction-only.');
  }
  return { identical: true, sha256: sha(a) };
}

/** Identity of the composed instruction, per variant, for any freeze that pins this slice. */
export function instructionIdentity224(): {
  readonly version: typeof FIRST_PASS_CONTRACT_224_VERSION;
  readonly base: string;
  readonly plain: string;
  readonly governed: string;
} {
  return {
    version: FIRST_PASS_CONTRACT_224_VERSION,
    base: BASE_CONTRACT_VERSION,
    plain: sha(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT),
    governed: sha(EXPERT_FIRST_PASS_224_SYSTEM_PROMPT_WITH_GOVERNED_BINDING),
  };
}
