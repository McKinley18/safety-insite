/**
 * §210E -- FINAL RESIDUAL FIRST-PASS REMEDIATION. R4, R5, R6, R7.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DEVELOPMENT SCOPE ONLY.
 *
 * Built the way §210C is built, and for the same reason: ONE appended block inserted before the
 * same unique closing anchor, with a reconstruct function that reproduces the §210C prompt byte for
 * byte. The §210B-2 and §210C modules are NOT edited, so their identities and suites are untouched.
 *
 * ==================== WHAT §210D ACTUALLY SHOWED ====================
 *
 * Eighteen of twenty-one frozen questions passed. Every declaration count matched. The two checks
 * the authorization singled out both passed: the D3/D5 pair showed neither global suppression nor
 * indiscriminate emission, and the destructive-repair risk §210C introduced did not appear. Those
 * gains are what this slice must not spend.
 *
 * Three failures remained, and each is narrower than the mechanism it descends from:
 *
 *   R4  D1 wrote the correct sufficiency property AND conjoined "was measured" into it. Its own
 *       `notEstablishedBecause` drew the record/state distinction correctly, so this is not a model
 *       that missed the rule -- it is the property field specifically still admitting process
 *       vocabulary. The consequence was real: branchB's "and/or" let a missing record alone drive
 *       the stop decision.
 *   R5  D2 marked a clarification BLOCKING and left `answersUnresolvedFactDeclarationId` unwritten,
 *       on a case whose declaration existed. D1, D4 and D5 all wrote theirs. §210C's GATE 2 asks
 *       the model to name the entry; it does not tie that naming to the BLOCKING marking.
 *   R6  D4 kept two independent facts correctly separate and then let each positive decision say
 *       "drilling may proceed" while the sibling fact was open.
 *
 * A fourth defect was found in D2's raw output and is a CONTRACT defect rather than an instruction
 * gap: `decisionIfA: "unused"`, `branchB: "placeholder"`, `decisionIfB: "placeholder"`. It passed
 * every existing structural check, because the four fields were non-blank and the two branches and
 * two decisions were not identical to each other. R7 addresses it on both sides -- an instruction
 * rule here, and a deterministic REFUSAL in the projection, which is validation and never repair.
 *
 * ==================== WHY R4 IS NARROWED RATHER THAN ABSOLUTE ====================
 *
 * "Never name a test in the property" would be wrong, and would break the cases where carrying out
 * a required act IS what changes today's action. GATE 8 therefore carries a counterfactual that
 * separates the two: imagine the state is correct but unmeasured, and ask whether the property is
 * still false. That question has a different answer in the two situations, which a word list does
 * not. The word list is guidance; the counterfactual is the rule.
 *
 * ==================== WHY R6 IS NARROWED RATHER THAN ABSOLUTE ====================
 *
 * "Never authorize the work from one fact" would over-restrain: where a declaration is the only
 * thing standing in the way, saying the work may go ahead is the correct answer, and hedging it
 * would be a new defect. GATE 10 conditions the containment on a sibling entry actually being open.
 */

import { createHash } from 'crypto';

import {
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION,
} from './expert-first-pass-instruction-210c';
import { OBSERVED_BYTES_PER_TOKEN } from './expert-first-pass-instruction-210b2';

export const EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION =
  'hazlenz.expert.first-pass-instruction.210e-R4-R7' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_210C_VERSION;

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

/**
 * The appended block. Numbered GATE 8-11, continuing §210C's GATE 1-3 without collision in either
 * variant. Every heading is mapped to a rule in `SENTENCE_TO_RULE`, and the suite asserts the
 * mapping covers the block. The rules are stated over the CONTRACT'S OWN FIELD NAMES, which is what
 * keeps them case-independent; no §210D vocabulary appears here.
 */
export const FINAL_GATE_LINES: readonly string[] = [
  '',
  '================ THE DECLARATION GATE, CONTINUED ================',
  '',
  'Four more checks on the same finished entry. They add no new reason to declare anything.',
  '',
  'GATE 8. THE PROPERTY IS THE STATE, NOT THE PROCESS THAT WOULD ESTABLISH IT.',
  '',
  '   Read `missingFact` again. Does it describe the state that has to be true, or does part of it',
  '   describe how anyone would find out?',
  '',
  '   Checked, inspected, tested, measured, verified, confirmed, documented, recorded, available,',
  '   seen earlier: all of those are finding out. None belongs in the property because it is how',
  '   the state would be established, and joining one to the state with "and" does not make it the',
  '   state.',
  '',
  '   THE TEST: picture the state exactly as it should be, with nobody having measured or written',
  '   it down. Is your property still unsatisfied there? Then you have written the process, and it',
  '   must be rewritten to turn on the state alone.',
  '',
  '   One case is different, and it is not rare: where performing the act is itself what changes',
  '   today\'s action, the act IS the state and naming it is right. The same test separates them --',
  '   there the property is still unsatisfied in that picture, because the act has not happened.',
  '',
  '   This narrows the property only. A missing record or an old reading belongs in',
  '   `notEstablishedBecause` and in the span you copied, and stays there.',
  '',
  'GATE 9. A BLOCKING QUESTION MUST NAME THE ENTRY IT SETTLES.',
  '',
  '   For every question you marked BLOCKING, write the id of the entry it settles into',
  '   `answersUnresolvedFactDeclarationId`. Yours, on the record, not left for a reader to infer.',
  '',
  '   If you cannot name one, either the entry is missing and you write it, or the question does',
  '   not govern today\'s action and does not belong at BLOCKING. A BLOCKING question naming no',
  '   entry is incomplete output.',
  '',
  'GATE 10. A POSITIVE DECISION CLEARS ITS OWN FACT, NOT THE WORK.',
  '',
  '   `decisionIfA` says what follows from settling THIS fact. Before writing it, look at your',
  '   other entries. If one is still open and also stands between the work and going ahead,',
  '   settling this one does not release the work, and `decisionIfA` must not say that it does.',
  '',
  '   Say instead that this fact no longer blocks, that nothing further is needed for it, or that',
  '   what follows is subject to the entries still open. Any wording with that meaning will do.',
  '',
  '   Where this entry is the only thing in the way, saying the work may go ahead is correct and',
  '   nothing here asks you to hedge it. The qualification is owed to an open sibling, not to',
  '   caution in general.',
  '',
  'GATE 11. EVERY BRANCH AND EVERY DECISION MUST SAY SOMETHING.',
  '',
  '   `branchA`, `branchB`, `decisionIfA` and `decisionIfB` each need real content: what that',
  '   answer means, and what is done about it. Someone reading only the entry must be able to tell',
  '   the two answers apart and act on either.',
  '',
  '   Placeholder, unused, n/a, tbd, unknown, same, other, none: filler standing in for a branch or',
  '   a decision leaves the entry saying nothing while looking complete, which is worse than an',
  '   obvious gap.',
  '',
  '   If you cannot write all four with real content you do not have an entry yet. Do not emit a',
  '   shaped-but-empty one. The uncertainty is not discarded either: it stays unresolved and is',
  '   reported as unresolved, never as settled.',
  '',
];

/** Which rule each part of the block serves. Asserted by the suite to cover the whole block. */
export const SENTENCE_TO_RULE: readonly { heading: string; rule: string; addresses: string }[] = [
  {
    heading: 'GATE 8. THE PROPERTY IS THE STATE, NOT THE PROCESS THAT WOULD ESTABLISH IT.',
    rule: 'R4',
    addresses: 'D1 conjoined "was measured" into an otherwise correct sufficiency property, and '
      + 'branchB\'s and/or then let a missing record alone drive the stop decision',
  },
  {
    heading: 'GATE 9. A BLOCKING QUESTION MUST NAME THE ENTRY IT SETTLES.',
    rule: 'R5',
    addresses: 'D2 marked a clarification BLOCKING and left answersUnresolvedFactDeclarationId '
      + 'unwritten while the declaration it settles existed',
  },
  {
    heading: 'GATE 10. A POSITIVE DECISION CLEARS ITS OWN FACT, NOT THE WORK.',
    rule: 'R6',
    addresses: 'D4 preserved two independent facts and then let each positive decision authorize '
      + 'the whole task while the sibling fact was open',
  },
  {
    heading: 'GATE 11. EVERY BRANCH AND EVERY DECISION MUST SAY SOMETHING.',
    rule: 'R7',
    addresses: 'D2 emitted decisionIfA "unused", branchB "placeholder", decisionIfB "placeholder", '
      + 'which passed every existing structural check',
  },
];

/**
 * The two narrowings, recorded as data so the suite can assert the instruction states them. Both
 * exist to stop a fix becoming a new defect: R4 must not forbid a legitimately process-shaped
 * property, and R6 must not force a hedge where nothing else blocks the work.
 */
export const OVERCORRECTION_GUARDS = {
  R4: {
    risk: 'forbidding process vocabulary absolutely would break the cases where performing a '
      + 'required act is itself the decision-critical property',
    guard: 'the counterfactual test, which is unsatisfied in the pictured world exactly when the '
      + 'act itself is what is owed',
  },
  R6: {
    risk: 'requiring every positive decision to be hedged would be a new defect where the entry is '
      + 'the only thing standing in the way',
    guard: 'the containment is conditioned on a sibling entry actually being open',
  },
} as const;

/** S6 is still untouched. §210D produced no behavioural evidence about it either. */
export const S6_STATUS = {
  rule: 'S6',
  status: 'NOT_EXERCISED',
  reason: 'no §210D case was capability-PRESENT, and the capability-PRESENT first-pass grammar '
    + 'remains refused by the provider. Nothing in §210D or §210E bears on S6.',
  action: 'unchanged. Governed evidence stays in the separate governed stage.',
} as const;

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_210E_ABORT: the closing anchor appears ${hits.length} times in the §210C system `
      + 'prompt, expected 1. This successor is built by construction from §210C and refuses to '
      + 'load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, FINAL_GATE_LINES,
  ).join('\n');

export const EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n'), PROMPT_ANCHOR,
    FINAL_GATE_LINES,
  ).join('\n');

export function build210eSystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove the block again. Must reproduce the §210C prompt byte for byte. */
export function reconstruct210cSystemPrompt(prompt: string): string {
  const joined = FINAL_GATE_LINES.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('FIRST_PASS_210E: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instructionIdentities210e(): Record<string, unknown> {
  const base = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT;
  const baseG = EXPERT_FIRST_PASS_210C_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const nextG = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const addedChars = next.length - base.length;
  const addedCharsG = nextG.length - baseG.length;
  return {
    oldVersion: BASE_INSTRUCTION_VERSION,
    newVersion: EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION,
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
    note: 'no existing prose was deleted and no §210C or §210B-2 sentence was rewritten. §210E is '
      + 'purely an appended continuation of the declaration gate.',
  };
}
