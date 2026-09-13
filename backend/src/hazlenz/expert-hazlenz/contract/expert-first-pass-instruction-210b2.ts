/**
 * §210B-2 -- SEMANTIC INVARIANTS S1-S6 FOR THE FIRST-PASS INSTRUCTION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DEVELOPMENT SCOPE ONLY.
 *
 * Built the way vNext is built: ONE appended block, inserted before the same unique closing anchor,
 * with a reconstruct function that reproduces the vNext prompt byte for byte. "210b2 is vNext plus
 * one block" is therefore a checkable claim rather than a comment, and the pinned v15 file
 * (`expert-prompt.ts`, sha256 bfe564c2..., pinned by §187 and §192) is never edited.
 *
 * ==================== WHY THE BLOCK IS SHAPED THIS WAY ====================
 *
 * Reading the existing instruction before writing new prose turned up two sentences that do not
 * merely fail to prevent the §209 defects -- they AUTHORIZE them. Adding rules beside them would
 * have produced an instruction that contradicts itself, so both are refined by name:
 *
 *   1. "A question with no declaration is still a legitimate question."
 *      This is correct for a question about something that does not change today's action. It is
 *      also the exact permission AC-03 used: CAND-SPILL was INSUFFICIENT_EVIDENCE, CLAR-SPILL-ID
 *      asked the right question, no declaration was emitted, and G1/G2/G3 failed. S2 narrows the
 *      sentence to the case it was written for and leaves it otherwise intact.
 *
 *   2. "ONE FACT PER ENTRY: if two different things are unknown, write two entries. Never join
 *      them with 'and'."
 *      This is correct for two INDEPENDENT unknowns. Applied to a property whose settlement needs
 *      two conjuncts -- boards rated for a person AND the materials (AC-18), what was done about
 *      compressed air AND accumulator energy (AC-22) -- it reads as an instruction to split or drop
 *      a conjunct, which is what happened. S3 draws the distinction the sentence is missing.
 *
 * S5 (false-gap restraint) is NOT restated. v15 already carries THE COUNTERFACTUAL TEST with five
 * conditions, and "an unestablished fact whose answers all lead to the same action today is still
 * silence" is already there almost verbatim. AC-05 and AC-07 are compliance failures against an
 * existing rule, not gaps in it, and repeating it would spend static tokens to say what the prompt
 * says three hundred lines earlier. One cross-reference line is added instead.
 */

import { createHash } from 'crypto';

import {
  EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION, EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
} from './expert-first-pass-instruction-vnext';

export const EXPERT_FIRST_PASS_INSTRUCTION_210B2_VERSION =
  'hazlenz.expert.first-pass-instruction.210b2-S1-S6' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION;

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

/**
 * The appended block. Every line is mapped to the rule it serves in `SENTENCE_TO_RULE` below, and
 * the suite asserts the mapping covers the block, so no sentence can enter the instruction without
 * a stated reason for being there.
 */
export const SEMANTIC_INVARIANT_LINES: readonly string[] = [
  '',
  '================ BEFORE YOU EMIT: FOUR CHECKS ON WHAT YOU HAVE WRITTEN ================',
  '',
  'These are checks on the entries you have already decided to make. They add no new reason to',
  'declare anything, and the counterfactual test above still decides what belongs here at all.',
  '',
  '1. THE PROPERTY, NOT THE EVIDENCE FOR IT.',
  '',
  '   Two different questions have two different answers, and only one of them is the missing fact:',
  '     what proposition must be true or false for today\'s decision to change?   <- the property',
  '     what would establish it?                                                  <- the evidence',
  '',
  '   Whether something is available, exists, is provided, can be done, was checked, was inspected,',
  '   was recorded, or is required, is ordinarily evidence ABOUT a state. The state itself is',
  '   whether the thing is actually so, right now, on this job. Write the state.',
  '',
  '   Availability is not use. A method existing is not that method having been applied. A check',
  '   having happened is not the checked condition being acceptable. A rule requiring a control is',
  '   not that control being present.',
  '',
  '   The proxy IS the property in one case only: when settling the proxy itself is what changes',
  '   today\'s action. If nobody would do anything differently once the proxy is settled, it was',
  '   evidence and you have named the wrong fact.',
  '',
  '2. NOTHING DECISION-CRITICAL LEAVES WITHOUT A HOME.',
  '',
  '   Before you finish, read back your own hazard candidates and clarifications. For each one you',
  '   yourself treated as unresolved AND as changing what is done today, exactly one of these must',
  '   be true:',
  '     - an entry in `unresolvedFactDeclarations` states it; or',
  '     - you have concluded it does not change today\'s action after all, and it is therefore not',
  '       an unresolved fact.',
  '',
  '   Both are acceptable answers. Neither is silence. Earlier you were told a question with no',
  '   declaration is still a legitimate question -- that remains true for a question about something',
  '   that does not govern today\'s action, and it is not a licence for a decision-critical gap you',
  '   raised yourself to end up in no list at all.',
  '',
  '   Being unresolved is still not enough on its own. Unresolved AND decision-critical is the test,',
  '   and most unresolved things are neither owed nor asked.',
  '',
  '3. EVERY PART THE ANSWER NEEDS.',
  '',
  '   Two unknowns that stand alone are two entries -- that rule is unchanged. But some single',
  '   properties are only settled by more than one part at once: a board rated for the person AND',
  '   the materials carried; energy released from BOTH sources before entry; a reading proved before',
  '   AND after the test. Those are one property, and splitting or shortening them settles nothing.',
  '',
  '   So for each entry, ask: if this clarification were answered in full, and branchA were true,',
  '   could the property still be unresolved? If it could, a part is missing. Put it back into',
  '   `missingFact`, both branches and the question -- not into one of them.',
  '',
  '   The parts most often dropped are quantities, loads, identities, time windows, sequence, who or',
  '   what is exposed, and the state a control or verification is actually in.',
  '',
  '4. EACH DECISION IS ABOUT ITS OWN FACT.',
  '',
  '   `decisionIfA` and `decisionIfB` say what changes because THIS fact is settled. They do not say',
  '   the work is safe, that operation may continue generally, that the controls are adequate or',
  '   that nothing further is required, while another fact you have declared is still open. Settling',
  '   one gap resolves one gap.',
  '',
];

/** The additional line for the governed-binding variant only. S6. */
export const GOVERNED_SEPARATION_LINES: readonly string[] = [
  '5. A REQUIREMENT IS NOT AN OBSERVATION.',
  '',
  '   A governed record can tell you what is required, what is regulated, and why an observed fact',
  '   matters. It cannot tell you what was done here, what equipment this machine has, or that a',
  '   control is in place, however plainly it says those things ought to be so. If the record states',
  '   a requirement and the observation does not say whether it was met, the fact is open -- naming',
  '   the record explains why it matters and settles nothing.',
  '',
];

/** Which rule each part of the block serves. Asserted by the suite to cover the whole block. */
export const SENTENCE_TO_RULE: readonly { heading: string; rule: string; addresses: string }[] = [
  { heading: '1. THE PROPERTY, NOT THE EVIDENCE FOR IT.', rule: 'S1',
    addresses: 'RC-A — AC-19 availability, AC-22 existence, AC-08 effect, AC-02 process' },
  { heading: '2. NOTHING DECISION-CRITICAL LEAVES WITHOUT A HOME.', rule: 'S2',
    addresses: 'RC-D — AC-03 recognised-not-emitted; refines the sentence that authorized it' },
  { heading: '3. EVERY PART THE ANSWER NEEDS.', rule: 'S3',
    addresses: 'RC-C — AC-18 materials conjunct, AC-10 before/after sequence, AC-22 air conjunct' },
  { heading: '4. EACH DECISION IS ABOUT ITS OWN FACT.', rule: 'S4',
    addresses: 'RC-E downstream overclaim — AC-07 decisionIfA' },
  { heading: '5. A REQUIREMENT IS NOT AN OBSERVATION.', rule: 'S6',
    addresses: 'RC-A requirement-for-fact — AC-22 governed N and T (governed variant only)' },
];

/**
 * S5 is deliberately absent from the block. Recorded here so its absence is a decision on the
 * record rather than an oversight.
 */
export const DELIBERATELY_NOT_RESTATED = {
  rule: 'S5',
  reason: 'v15 already carries THE COUNTERFACTUAL TEST and the sentence "An unestablished fact '
    + 'whose answers all lead to the same action today is still silence." AC-05 and AC-07 are '
    + 'compliance failures against an existing rule, not an absent one. Restating it would add '
    + 'static tokens to repeat the prompt to itself, which TBR-11 forbids.',
  crossReferenceOnly: 'the counterfactual test above still decides what belongs here at all',
} as const;

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_210B2_ABORT: the closing anchor appears ${hits.length} times in the vNext system `
      + 'prompt, expected 1. This successor is built by construction from vNext and refuses to load '
      + 'against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR,
    SEMANTIC_INVARIANT_LINES,
  ).join('\n');

export const EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n'), PROMPT_ANCHOR,
    [...SEMANTIC_INVARIANT_LINES, ...GOVERNED_SEPARATION_LINES],
  ).join('\n');

export function build210b2SystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove the block again. Must reproduce the vNext prompt byte for byte. */
export function reconstructVNextSystemPrompt(prompt: string, governed: boolean): string {
  const block = governed
    ? [...SEMANTIC_INVARIANT_LINES, ...GOVERNED_SEPARATION_LINES]
    : SEMANTIC_INVARIANT_LINES;
  const lines = prompt.split('\n');
  const joined = block.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('FIRST_PASS_210B2: block not found; cannot reconstruct');
  void lines;
  return (prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1));
}

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * Bytes per token observed on the frozen §208 first-pass leg: 69,968 transmitted body bytes against
 * 24,512 input tokens. Used to ESTIMATE the token delta. It is a derived estimate from real
 * cohort data, not a tokenizer result, and is labelled as such wherever it is reported.
 */
export const OBSERVED_BYTES_PER_TOKEN = 69968 / 24512;

export function instructionIdentities(): Record<string, unknown> {
  const base = EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT;
  const baseG = EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const nextG = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const addedChars = next.length - base.length;
  const addedCharsG = nextG.length - baseG.length;
  return {
    oldVersion: BASE_INSTRUCTION_VERSION,
    newVersion: EXPERT_FIRST_PASS_INSTRUCTION_210B2_VERSION,
    withoutGovernedBinding: {
      oldIdentity: sha256(base), newIdentity: sha256(next),
      oldChars: base.length, newChars: next.length, addedChars,
      estimatedAddedTokens: Math.round(addedChars / OBSERVED_BYTES_PER_TOKEN),
    },
    withGovernedBinding: {
      oldIdentity: sha256(baseG), newIdentity: sha256(nextG),
      oldChars: baseG.length, newChars: nextG.length, addedChars: addedCharsG,
      estimatedAddedTokens: Math.round(addedCharsG / OBSERVED_BYTES_PER_TOKEN),
    },
    tokenEstimateBasis: 'derived from the frozen §208 first-pass leg (69,968 body bytes / 24,512 '
      + 'input tokens). An estimate from real cohort data, not a tokenizer result.',
    netProseRemoved: 0,
    note: 'no existing prose was deleted. S2 and S3 REFINE two existing sentences by naming them '
      + 'rather than replacing them, so the earlier text stays readable in place and the change is '
      + 'auditable as an addition.',
  };
}
