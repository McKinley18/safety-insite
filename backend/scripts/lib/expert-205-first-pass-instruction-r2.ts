/**
 * §205 EXPERT HAZLENZ -- FIRST-PASS PROTOCOL vNext-R2. THE RR-1/RR-2/RR-3/RR-5 REMEDIATION.
 * DEVELOPMENT PROTOTYPE ONLY. NOT ENABLED. NOT REACHABLE FROM PRODUCTION. ZERO PROVIDER CALLS.
 *
 * ==================== WHY A SUCCESSOR AND NOT AN EDIT ====================
 *
 * Same reason §196 built vNext instead of editing v15: `EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT` is
 * the artifact §199 executed and §200/§202/§204 adjudicated. Editing it in place would detach
 * 120 recorded product-owner verdicts from the text they were about. So R2 is built BY
 * CONSTRUCTION from vNext's own exported line arrays with ONE block appended, and
 * `reconstructVNextLines` removes exactly that block and must reproduce vNext byte-identically.
 * The suite asserts the round trip; it is not assumed.
 *
 * ==================== WHAT EACH BLOCK ANSWERS, AND ON WHAT EVIDENCE ====================
 *
 *   RR-1   F1. SF-02 carried one of two genuinely independent decision-critical unresolved facts.
 *          The remedy is instruction-side only: deterministic code MUST NOT recover an omitted gap
 *          by parsing generated prose (that is the §160 semantic matcher, retired).
 *   RR-2A  F2. SF-04 promoted a decision-neutral unknown by inventing an unsupported adverse state.
 *   RR-2B  F7 -- THE ONLY MECHANISM THAT REPLICATED ACROSS FAMILIES (SF-07 `decisionIfA`,
 *          SF-11 `decisionIfB`; `REQUIRED_CONTROL` and `EXPOSURE`; both branch sides). The branch
 *          decision may state only what that branch plus established context justifies.
 *   RR-3   F4. SF-08's voltage-test declaration omitted "performed but the safe state was NOT
 *          established". Written as a THREE-STATE TEST THAT MUST BE APPLIED, not as a mandatory
 *          ternary shape: SF-11's exposure fact is genuinely binary and was recorded CORRECT on
 *          axis E, so a universal ternary rule would have broken a passing case.
 *   RR-5   F5. SF-08's clarification asked whether testing was performed rather than what it
 *          established. SF-07 and SF-11 both got this right and are the positive controls.
 *
 * RR-4 is NOT in this file. It is an invariant about what reaches the verifier, evaluated in
 * `expert-205-property-preservation-audit.ts` after these changes, exactly as the product owner
 * directed -- representation is not mutated on §204 evidence.
 *
 * ==================== WHAT THIS FILE DOES NOT DO ====================
 *
 * It adds no new reason to raise anything, and says so in the text, because §184's measured failure
 * mode for every added instruction in this programme is a coverage habit rather than a missed
 * capability. Every block below either NARROWS what may be declared (RR-2A, RR-2B) or requires a
 * DISTINCTION to be tested before declaring (RR-1, RR-3, RR-5). None of them asks for more output.
 */

import type { ExpertVNextGovernedBinding } from './expert-first-pass-instruction-vnext';
import {
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING,
  UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING,
} from './expert-first-pass-instruction-vnext';
import { EXPERT_SYSTEM_PROMPT } from '../../src/safescope-v2/expert-hazlenz/expert-prompt';

export const EXPERT_FIRST_PASS_INSTRUCTION_R2_VERSION =
  'hazlenz.expert.first-pass-instruction.vNext-R2' as const;

/** The base this successor is derived from. A drifted base is a loud failure, never a silent one. */
export const R2_BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION;

/** Which §204 defect each block answers. Data, so the suite counts coverage rather than trusting it. */
export const R2_BLOCK_PROVENANCE = {
  'RR-1': { answers: 'F1', evidence: 'SF-02 (U04 A=INCORRECT, H=INCORRECT)', narrows: false },
  'RR-2A': { answers: 'F2', evidence: 'SF-04 (U06 B/I=INCORRECT; U07 F/G=INCORRECT)', narrows: true },
  'RR-2B': { answers: 'F7', evidence: 'SF-07 U14 F=PARTIALLY_CORRECT; SF-11 U19 F=PARTIALLY_CORRECT',
    narrows: true },
  'RR-3': { answers: 'F4', evidence: 'SF-08 U17 (C, E=PARTIALLY_CORRECT)', narrows: false },
  'RR-5': { answers: 'F5', evidence: 'SF-08 U17 (M=PARTIALLY_CORRECT)', narrows: false },
} as const;

// ---------------------------------------------------------------- the appended block

const RR_1_LINES: readonly string[] = [
  '---------------- ONE ENTRY PER INDEPENDENT FACT, AND NONE DROPPED ----------------',
  '',
  'Two unresolved facts are INDEPENDENT when settling one leaves the other still open and still',
  'able to change what is done today. When a situation contains more than one such fact, EVERY one',
  'of them gets its own entry. Writing the clearest or the most alarming one and leaving the other',
  'in your prose does not record it: nothing downstream reads your prose for facts, so a fact that',
  'is only mentioned is a fact that was lost.',
  '',
  'This is not a request for more entries. Two entries are owed only where two independent facts',
  'genuinely exist. Where one fact has two parts that must BOTH be true before the situation is',
  'safe, and neither part alone settles it, that is ONE fact stated with both parts -- not two.',
  '',
];

const RR_2A_LINES: readonly string[] = [
  '---------------- AN UNKNOWN IS NOT A GAP UNTIL IT CHANGES SOMETHING ----------------',
  '',
  'Before declaring, check that the difference between the two branches is grounded in what you',
  'were actually given. You may not manufacture the difference by imagining an adverse state the',
  'text does not support and then treating your own imagined state as the reason the fact matters.',
  '',
  'The test is direct: if branch B is something you supposed rather than something the supplied',
  'material leaves genuinely open, there is no gap here and the entry must not be written. Not',
  'every unknown is a hazard, and an unknown that changes nothing about today is not decision-',
  'critical however easy it is to imagine going wrong.',
  '',
];

const RR_2B_LINES: readonly string[] = [
  '---------------- decisionIfA / decisionIfB MAY NOT OUTRUN THEIR OWN BRANCH ----------------',
  '',
  'Each branch decision states what is done today IF THAT BRANCH IS TRUE, and nothing wider. Write',
  'only the conclusion that this branch, plus what the supplied material already establishes,',
  'actually justifies. Do not use the branch decision to settle a broader safety question the fact',
  'does not reach.',
  '',
  'This applies to the reassuring side as much as the alarming one, and the reassuring side is the',
  'one that goes wrong. Two concrete shapes to avoid:',
  '',
  '  * a control is confirmed effective at the one place you asked about, and the decision says no',
  '    further control of any kind is needed -- the fact established one place, not every place,',
  '    and not every route of harm;',
  '',
  '  * people are confirmed absent from a place, and the decision says the exposure is therefore',
  '    controlled by a procedure -- being absent is not the same as being kept out by something,',
  '    and the fact said nothing about what produces the absence.',
  '',
  'If you find yourself writing "so nothing further is required" or "so it is controlled by", stop',
  'and check that THIS branch establishes that. Usually it establishes something narrower, and the',
  'narrower statement is the correct one to write.',
  '',
];

const RR_3_LINES: readonly string[] = [
  '---------------- WHEN A CHECK WAS SUPPOSED TO PROVE SOMETHING ----------------',
  '',
  'Where the unresolved property concerns a check, test, inspection or other verification that was',
  'meant to establish a safe condition, there are usually THREE materially different states, not',
  'two:',
  '',
  '  1. the check was not carried out;',
  '  2. the check was carried out AND established the required safe condition;',
  '  3. the check was carried out and did NOT establish it.',
  '',
  'State 3 is the one that gets lost, and it is often the most dangerous, because a check that was',
  'performed reads as reassurance. Ask yourself explicitly whether state 3 is possible here. If it',
  'is, your two branches must not collapse it into either of the others -- the safe branch means',
  'the condition was ESTABLISHED, not merely that somebody looked.',
  '',
  'THIS IS A TEST TO APPLY, NOT A SHAPE TO IMPOSE. Many facts are genuinely two-state -- whether',
  'people enter an area, whether a part is present -- and forcing a third branch onto them invents',
  'a state that does not exist. Apply the test; follow the answer.',
  '',
];

const RR_5_LINES: readonly string[] = [
  '---------------- A QUESTION MUST BE ABLE TO SETTLE THE FACT ----------------',
  '',
  'When you also write the question, check it against the property you declared, not against the',
  'topic. A question that can be answered YES while the declared property is still open has not',
  'settled anything.',
  '',
  'Two ways this fails, both seen in practice:',
  '',
  '  * asking whether something was DONE when the property is what it SHOWED. "Was a test carried',
  '    out?" leaves the fact open under either answer if the fact is whether the test proved the',
  '    condition safe. Ask what the result was and what it established.',
  '',
  '  * dropping a qualifier the property depends on. If the property is about a state BEFORE',
  '    something was returned to use, at a PARTICULAR position, or AFTER a particular step, the',
  '    question must carry that qualifier. Without it the answer can be true in general and',
  '    irrelevant to the fact.',
  '',
];

/**
 * The appended block, in a fixed order so the construction is deterministic and the reconstruction
 * is a plain tail slice. Order is remediation order, which is also reading order: what to declare,
 * what not to declare, how far the decision may reach, what states exist, and how to ask.
 */
export const R2_REMEDIATION_BLOCK: readonly string[] = [
  ...RR_1_LINES, ...RR_2A_LINES, ...RR_2B_LINES, ...RR_3_LINES, ...RR_5_LINES,
];

// ---------------------------------------------------------------- construction and reversal

export const R2_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING: readonly string[] = [
  ...UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING, ...R2_REMEDIATION_BLOCK,
];

export const R2_DECLARATION_LINES_WITH_GOVERNED_BINDING: readonly string[] = [
  ...UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING, ...R2_REMEDIATION_BLOCK,
];

/**
 * Remove exactly the appended block. Must reproduce the vNext line array byte-identically; the
 * suite asserts it for both variants. A reconstruction that does not match means R2 has drifted
 * into changing vNext rather than extending it, and that is a load-bearing failure.
 */
export function reconstructVNextLines(r2Lines: readonly string[]): readonly string[] {
  return r2Lines.slice(0, r2Lines.length - R2_REMEDIATION_BLOCK.length);
}

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_R2_ABORT: the closing anchor appears ${hits.length} times in the base system `
      + 'prompt, expected 1. R2 is built by construction and refuses to load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR,
    R2_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING,
  ).join('\n');

export const EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR,
    R2_DECLARATION_LINES_WITH_GOVERNED_BINDING,
  ).join('\n');

/**
 * Pick the prompt that AGREES WITH THE SCHEMA this request carries. One function, so a caller
 * cannot pair a capability-present schema with a capability-absent instruction. Same contract as
 * vNext's `buildExpertVNextSystemPrompt`, deliberately.
 */
export function buildExpertR2SystemPrompt(governed: ExpertVNextGovernedBinding): string {
  return governed.governedEvidenceSourceIds.length === 0
    ? EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_R2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/**
 * The base prompts, re-exported so the suite can assert the round trip against the exact objects
 * §199 executed rather than against a second copy of them.
 */
export const R2_BASE_PROMPTS = {
  withoutGovernedBinding: EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  withGovernedBinding: EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} as const;

/** Asserted by the suite as literals. */
export function firstPassR2Effect(): {
  providerCalls: 0; databaseOperations: 0;
  mutatesTheVNextPrompt: false; mutatesTheWireSchema: false;
  addsANewReasonToRaiseAnything: false; recoversOmittedGapsByParsingProse: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    mutatesTheVNextPrompt: false, mutatesTheWireSchema: false,
    addsANewReasonToRaiseAnything: false, recoversOmittedGapsByParsingProse: false,
  };
}
