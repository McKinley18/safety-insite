/**
 * §210C -- RESIDUAL FIRST-PASS SEMANTIC REMEDIATION. R1, R2, R3.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DEVELOPMENT SCOPE ONLY.
 *
 * Built exactly the way §210B-2 is built, and for the same reason: ONE appended block inserted
 * before the same unique closing anchor, with a reconstruct function that reproduces the §210B-2
 * prompt byte for byte. "210c is 210b2 plus one block" is therefore a checkable claim rather than a
 * comment. The §210B-2 module is NOT edited, so its suite and its pinned identities are untouched.
 *
 * ==================== WHAT THE HOSTED PROBE ACTUALLY SHOWED ====================
 *
 * §210B-3B ran the eight frozen cases uncached. Two were clean. Axes F, G and H passed everywhere
 * they were exercised, and those gains are what this slice must not spend. The six failures fall
 * into three mechanisms, and all three share one shape: THE MODEL'S REASONING WAS BETTER THAN THE
 * PROPERTY IT WROTE DOWN.
 *
 *   R1  PB-05 and PB-07 kept the joint semantics in the branches and the clarification while
 *       `missingFact` carried only one half. PB-08 wrote a check-history proxy into `missingFact`
 *       while its branches named the actual functional state. The authoritative property statement
 *       under-encoded what the rest of the entry already knew.
 *
 *   R2  PB-03 asked a clarification capable of settling the right fact, at IMPORTANT criticality,
 *       and then declared a different fact. S2 tells the model to give decision-critical gaps a
 *       home; it does not make the model walk its own question list and check. PB-03 proves that
 *       gap is real.
 *
 *   R3  PB-06 declared a fact on a case whose frozen expectation is zero declarations. Its own
 *       branches show the error: they diverge only about returning equipment to service later, not
 *       about anything done today. The counterfactual test exists and was not applied at the moment
 *       the entry was admitted.
 *
 * ==================== WHY THESE ARE GATES AND NOT MORE ADVICE ====================
 *
 * §210B-2's four checks shape what the model writes. Every residual failure survived them, so more
 * prose of the same kind is not the remedy. These three are ADMISSION checks: each is applied to
 * one finished entry, immediately before output, and each has a defined consequence -- move the
 * meaning up, write the missing entry, or delete the entry. R1's direction of correction is stated
 * explicitly, because the destructive way to make an entry self-consistent is to cut the branches
 * down to the impoverished property, and that would convert a §210C fix into a new defect.
 *
 * NONE OF THIS IS PERFORMED DETERMINISTICALLY. No code here reads a declaration, compares it to its
 * branches, infers a clarification-to-declaration binding, or removes an entry. The model authors
 * the property, authors the binding and makes the admission decision; deterministic code may later
 * validate or refuse what the model wrote, never invent or repair it.
 */

import { createHash } from 'crypto';

import {
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210B2_VERSION, OBSERVED_BYTES_PER_TOKEN,
} from './expert-first-pass-instruction-210b2';

export const EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION =
  'hazlenz.expert.first-pass-instruction.210c-R1-R3' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_210B2_VERSION;

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

/**
 * The appended block. Headed GATE rather than continuing the §210B-2 numbering, because the
 * governed variant already ends at 5 and the plain one does not: a shared "6, 7, 8" would read as
 * a gap in one variant and a continuation in the other. Every line is mapped to a rule in
 * `SENTENCE_TO_RULE`, and the suite asserts the mapping covers the block.
 *
 * No case-specific vocabulary appears here. The rules are stated over the CONTRACT'S OWN FIELD
 * NAMES, which is what makes them general.
 */
export const DECLARATION_GATE_LINES: readonly string[] = [
  '',
  '================ THE DECLARATION GATE: APPLIED TO ONE ENTRY AT A TIME ================',
  '',
  'The checks above shape what you write. These three decide whether what you wrote survives. Take',
  'each entry you are about to emit on its own, after it is finished, and put it through all three.',
  'They add no new reason to declare anything.',
  '',
  'GATE 1. THE PROPERTY MUST SAY WHAT THE REST OF THE ENTRY IS ABOUT.',
  '',
  '   Read your own `missingFact` against your own `branchA`, `branchB`, `decisionIfA`, `decisionIfB`',
  '   and the question you wrote for this entry. Then answer three things:',
  '     - does `missingFact` name the exact proposition those two branches decide between?',
  '     - does it carry every part that the branches and the question rely on?',
  '     - does it state the safety state itself, rather than the evidence for it -- an inspection, a',
  '       test, a check, a record, a history, an availability, an existence or a requirement?',
  '',
  '   If the branches or the question carry meaning the property does not, the entry disagrees with',
  '   itself, and THE PROPERTY IS THE HALF THAT IS WRONG. Move that meaning up into `missingFact`.',
  '',
  '   Correct in that direction only. Never cut detail out of the branches or the question to make',
  '   them agree with a property that says less -- that throws the information away instead of',
  '   recording it, and it is the one repair this instruction forbids.',
  '',
  'GATE 2. NO DECISION-CRITICAL QUESTION LEAVES WITHOUT AN ENTRY.',
  '',
  '   Go through the questions you have written, one at a time, and for each one name the entry in',
  '   `unresolvedFactDeclarations` that it would settle. Do this explicitly; do not assume the link',
  '   exists because both lists look reasonable.',
  '',
  '   If a question exists to obtain something that changes what is done today, and no entry states',
  '   that fact, the response is not finished yet. Either write the entry, or conclude that the',
  '   question does not change today\'s action and handle it as the contract already allows. A',
  '   question that governs today\'s action while pointing at nothing is precisely the gap you were',
  '   asked to record, left unrecorded.',
  '',
  'GATE 3. AN ENTRY MUST CHANGE WHAT IS DONE NOW.',
  '',
  '   For each entry, read `decisionIfA` against `decisionIfB` and ask what would have to happen NOW',
  '   under each answer. If the required action today is materially the same either way, DELETE THE',
  '   ENTRY. Wording that differs while the action does not is still the same action.',
  '',
  '   A fact can be unknown, safety-related, required by law, worth recording, and needed for a',
  '   decision that comes later, and still not be owed now.',
  '',
  '   A difference that appears only in a later decision -- what must happen before something goes',
  '   back into service, at the next examination, at handover, before the next phase starts -- is',
  '   not a difference today. It counts only if that later decision is the one you were asked about.',
  '',
];

/** Which rule each part of the block serves. Asserted by the suite to cover the whole block. */
export const SENTENCE_TO_RULE: readonly { heading: string; rule: string; addresses: string }[] = [
  {
    heading: 'GATE 1. THE PROPERTY MUST SAY WHAT THE REST OF THE ENTRY IS ABOUT.',
    rule: 'R1',
    addresses: 'PB-05 and PB-07 kept conjuncts in the branches but not in missingFact; PB-08 wrote '
      + 'a check-history proxy into missingFact while its branches named the functional state',
  },
  {
    heading: 'GATE 2. NO DECISION-CRITICAL QUESTION LEAVES WITHOUT AN ENTRY.',
    rule: 'R2',
    addresses: 'PB-03 asked a clarification that could settle the owed fact and declared a '
      + 'different fact; S2 alone did not make the model reconcile its own question list',
  },
  {
    heading: 'GATE 3. AN ENTRY MUST CHANGE WHAT IS DONE NOW.',
    rule: 'R3',
    addresses: 'PB-06 declared on a zero-declaration control; its branches diverged only about a '
      + 'future return to service, not about today\'s action',
  },
];

/**
 * The correction direction R1 forbids, recorded as data so the suite can assert the instruction
 * states it. §210C would otherwise be able to "fix" an inconsistent entry by destroying meaning.
 */
export const FORBIDDEN_CORRECTION_DIRECTION = {
  rule: 'R1',
  forbidden: 'delete semantic detail from the branches or the clarification so they agree with an '
    + 'incomplete property',
  required: 'move the missing semantics up into missingFact so the authoritative property carries '
    + 'everything the reasoning already relies on',
} as const;

/** S6 is untouched. §210B-3B produced no behavioural evidence about it. */
export const S6_STATUS = {
  rule: 'S6',
  status: 'NOT_EXERCISED',
  reason: 'PB-02 was rejected by the provider before inference with COMPILED_GRAMMAR_TOO_LARGE, so '
    + 'no model ever saw the governed request. Tuning S6 on that would convert a structural '
    + 'transport failure into a semantic verdict.',
  action: 'unchanged in §210C; the grammar-size problem is recorded as a separate structural '
    + 'transport issue for later remediation.',
} as const;

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_210C_ABORT: the closing anchor appears ${hits.length} times in the §210B-2 system `
      + 'prompt, expected 1. This successor is built by construction from §210B-2 and refuses to '
      + 'load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, DECLARATION_GATE_LINES,
  ).join('\n');

export const EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n'), PROMPT_ANCHOR,
    DECLARATION_GATE_LINES,
  ).join('\n');

export function build210cSystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove the block again. Must reproduce the §210B-2 prompt byte for byte. */
export function reconstruct210b2SystemPrompt(prompt: string): string {
  const joined = DECLARATION_GATE_LINES.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('FIRST_PASS_210C: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instructionIdentities210c(): Record<string, unknown> {
  const base = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT;
  const baseG = EXPERT_FIRST_PASS_210B2_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const nextG = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const addedChars = next.length - base.length;
  const addedCharsG = nextG.length - baseG.length;
  return {
    oldVersion: BASE_INSTRUCTION_VERSION,
    newVersion: EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION,
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
    note: 'no existing prose was deleted and no §210B-2 sentence was rewritten. §210C is purely an '
      + 'appended admission gate, so the whole §210B-2 instruction stays readable in place.',
  };
}
