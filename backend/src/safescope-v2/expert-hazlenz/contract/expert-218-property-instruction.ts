/**
 * §218 -- THE INSTRUCTION HALF OF THE STRUCTURED PROPERTY REVIEW.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT WIRED TO PRODUCTION.
 *
 * ==================== THIS IS NOT ANOTHER PROMPT REMEDIATION ====================
 *
 * §216's typed stopping rule forbids one, and the primary remedy here is the SCHEMA: five fields the
 * model must fill before it may reach a verdict, and a deterministic consistency layer that reads
 * them. This block exists because a new required field with no explanation is a worse instrument
 * than a new required field with one. It is the smallest text that makes the fields answerable, and
 * `TEXT_IS_NOT_THE_REMEDY` records that as a constant.
 *
 * ==================== WHAT §217 ACTUALLY SHOWED, AND WHAT THIS SAYS ABOUT IT ====================
 *
 * The §217 adjudication named the mechanism: on K1 and K2 the verifier reached for the
 * absence-is-the-substantive-adverse-state exception -- which §216 carries, correctly, for BRANCHES
 * -- and used it to decide the PROPERTY question. Two frames, both applicable-sounding, and the
 * model picked the easier one twice.
 *
 * So the block does one thing the earlier blocks did not: it separates the two frames by name and
 * says which question each answers. That is not a new argument for the role test; it is a boundary
 * between two rules that already exist and were being confused.
 *
 * ==================== BUILT BY CONSTRUCTION FROM THE §216 PROMPT ====================
 *
 * Inserted at ONE named unique anchor, immediately before the §216 ladder, because the ladder's
 * first step is now answered in fields before it is reasoned about in prose. Removing the block
 * reproduces the §216 prompt byte for byte and the module refuses to load against a drifted base.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_216_SYSTEM_PROMPT, REMIT_BLOCK_216,
} from './expert-216-disposition-remediation';
import {
  PROPERTY_SEMANTIC_ROLES_218, PROPERTY_VALIDITIES_218,
} from './expert-218-property-review-contract';

export const PROPERTY_INSTRUCTION_218_VERSION =
  'hazlenz.expert.218.property-instruction.v1' as const;

/**
 * §216's stopping rule, honoured. The remedy is the structured decision; the text only makes the
 * fields answerable.
 */
export const TEXT_IS_NOT_THE_REMEDY = {
  primaryRemedy: 'STRUCTURED_OUTPUT_PLUS_DETERMINISTIC_CROSS_FIELD_CONSISTENCY',
  instructionRole: 'explains five new required fields; adds no new argument for a rule that was '
    + 'already stated three times',
  isAnotherInstructionRemediationCycle: false,
  section216StoppingRuleHonoured: true,
} as const;

const role = (n: number): string => PROPERTY_SEMANTIC_ROLES_218[n];
const validity = (n: number): string => PROPERTY_VALIDITIES_218[n];

export const PROPERTY_REVIEW_BLOCK_218: readonly string[] = [
  'FIRST, AND IN FIELDS RATHER THAN IN REASONING: THE PROPERTY REVIEW. Before you consider the',
  'question, the branches or the verdict, fill in propertyReview. It is required on every answer and',
  'the rest of your answer has to agree with it.',
  '',
  '   targetDeclarationId    the declaration id from the fact block, copied exactly.',
  `   propertySemanticRole   what the SUPPLIED property IS, from the five below.`,
  '   propertyValidity       whether that supplied property is the proposition whose truth decides.',
  '   decisionControllingProperty   one phrase naming the proposition you believe actually decides.',
  '   propertyReviewReason   one or two sentences a reviewer can act on.',
  '',
  'THE FIVE ROLES. Choose on the ROLE the thing plays in the decision, never on the words used.',
  '',
  `   ${role(0)}`,
  '     the physical, operational, exposure, energy, structural or environmental condition itself.',
  '     Whether the ground will carry the outrigger. Whether the atmosphere is breathable.',
  '',
  `   ${role(1)}`,
  '     carrying the act out is itself what is required and there is no separate condition',
  '     underneath it. Whether the rescue plan was agreed. Whether the isolation was applied.',
  '     THIS IS COMMON AND YOU MUST NOT SPEND IT: a property is not evidence merely because it',
  '     mentions a procedure or a test.',
  '',
  `   ${role(2)}`,
  '     the existence, condition or availability of the artifact is itself the substantive',
  '     requirement -- the permit that must be raised before entry, the manifest that must travel',
  '     with the load. NOT every certificate, record or permit. Ask what the requirement is ON.',
  '',
  `   ${role(3)}`,
  '     a test, a measurement, a certificate, a record, an inspection result, a verification',
  '     activity, documentation, or any other way of FINDING OUT about a different property.',
  '     THE TEST: take the evidence out of the scenario entirely. Could the underlying condition',
  '     still be independently fine, or independently bad? If it could, and that condition is what',
  '     the decision turns on, then you are looking at the evidence and not the property.',
  '',
  `   ${role(4)}`,
  '     you cannot responsibly tell from what you were given. Say so rather than guess. This is a',
  '     fail-closed answer, and it is a better one than a confident wrong role.',
  '',
  'TWO RULES THAT SOUND ALIKE AND ANSWER DIFFERENT QUESTIONS. Keep them apart.',
  '',
  '   The absence rule is about a BRANCH. Where nothing having been done is ITSELF the substantive',
  '   adverse state -- no permit was ever raised, no examination was ever carried out -- an',
  '   absence-shaped branchB is correct and you should leave it alone.',
  '',
  '   The role question is about the PROPERTY. It asks what the fact is ABOUT. That a record is',
  '   missing never decides it. Ask instead: if the record existed and said the right thing, would',
  '   the safety question be answered, or would it still turn on the condition the record describes?',
  '',
  '   Do not answer the property question with the absence rule. It is the commonest way to talk',
  '   yourself into treating a test, a log or a certificate as the thing the decision turns on.',
  '',
  `NOW propertyValidity, AND IT DECIDES WHAT FOLLOWS. ${validity(0)} where the supplied property is`,
  `the proposition whose truth decides. ${validity(1)} where it is not. ${validity(2)} where you`,
  'cannot establish it responsibly.',
  '',
  `   ${role(3)} means the property is ${validity(1)}. Those two go together and your answer is`,
  '   refused whole if they do not.',
  `   ${role(4)} means ${validity(2)}, for the same reason.`,
  '',
  `   ${validity(1)}: declare CHALLENGE_FACT_VALIDITY on the target with PROPERTY_IDENTITY_MISMATCH,`,
  '   with EVIDENCE_PROXY_FOR_UNDERLYING_STATE where you said it was evidence and',
  '   ADJACENT_PROPERTY_SUBSTITUTED where you said it was a real state, act or artifact and simply',
  '   not this one. DO NOT propose a question for it. A better question does not make a wrong',
  '   property right; it hides it, and the answer is refused whole.',
  '',
  `   ${validity(2)}: ABSTAIN. Do not challenge the property identity of a property you could not`,
  '   place, and do not propose a question in place of saying so.',
  '',
  `   ${validity(0)}: and only then, go on to the branches, the question and the verdict below.`,
  '',
  'decisionControllingProperty IS FOR A PERSON TO READ. Where the supplied property is right it may',
  'restate it. Where it is evidence, name the property the evidence would establish. It concerns',
  'THIS target and nothing else: it is not a route to raise another issue, it does not become a new',
  'fact, and nothing is settled by it.',
  '',
];

// ---------------------------------------------------------------- prompt construction

const PROMPT_ANCHOR = REMIT_BLOCK_216[0];

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `VERIFIER_218_ABORT: the §216 ladder anchor appears ${hits.length} times, expected 1. `
      + 'Built by construction from the §216 prompt; refuses to load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_VERIFIER_218_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_VERIFIER_216_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, PROPERTY_REVIEW_BLOCK_218,
  ).join('\n');

/** Remove the block again. Must reproduce the §216 prompt byte for byte. */
export function reconstruct216SystemPrompt(prompt: string): string {
  const joined = PROPERTY_REVIEW_BLOCK_218.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('VERIFIER_218: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ---------------------------------------------------------------- what the block is answerable for

export const BLOCK_TO_RULE_218: readonly { heading: string; serves: string }[] = [
  {
    heading: 'FIRST, AND IN FIELDS RATHER THAN IN REASONING',
    serves: 'the decision order: the property question is answered in fields before the '
      + 'clarification question is reached',
  },
  {
    heading: 'THE FIVE ROLES',
    serves: 'the closed enum, with the act and the artifact given their own members so the '
      + 'architecture cannot degenerate into "all records are evidence proxies"',
  },
  {
    heading: 'THE TEST (take the evidence out of the scenario entirely)',
    serves: 'the semantic counterfactual that separates EVIDENCE_FOR_ANOTHER_PROPERTY from the '
      + 'three roles that may stand',
  },
  {
    heading: 'TWO RULES THAT SOUND ALIKE AND ANSWER DIFFERENT QUESTIONS',
    serves: 'the §217 mechanism by name: the absence exception is about a BRANCH and was used to '
      + 'answer the PROPERTY question on K1 and K2',
  },
  {
    heading: 'NOW propertyValidity, AND IT DECIDES WHAT FOLLOWS',
    serves: 'the routing the deterministic layer enforces, stated to the model so a refusal is '
      + 'predictable rather than a surprise',
  },
  {
    heading: 'decisionControllingProperty IS FOR A PERSON TO READ',
    serves: 'the advisory limit and the sibling-containment half that no deterministic rule can '
      + 'check',
  },
];

/** The overcorrection this block could create, and the guard carried in the same block. */
export const OVERCORRECTION_GUARDS_218 = [
  {
    risk: 'a required role field with EVIDENCE_FOR_ANOTHER_PROPERTY in it invites a verifier to '
      + 'reach for that member on every property that mentions a test, a permit or a record -- '
      + 'which would take the legitimate act and artifact cases with it',
    guard: 'REQUIRED_ACT_ITSELF and REQUIRED_ARTIFACT_ITSELF are their own members, each with the '
      + '"you must not spend it" warning attached, and the evidence member is defined by the '
      + 'counterfactual rather than by a vocabulary',
    protects: 'SECTION_217_K3, SECTION_215_H4, SECTION_213_T4, and the F3/F4 fixtures',
  },
  {
    risk: 'naming the absence rule in order to bound it could be read as retiring it, which would '
      + 'send a genuine no-permit-was-ever-raised case the wrong way',
    guard: 'the paragraph states the absence rule affirmatively FIRST and says an absence-shaped '
      + 'branchB is correct and should be left alone, before saying which question it does not '
      + 'answer',
    protects: 'SECTION_215_H3 and the three-worlds section carried verbatim from §212',
  },
] as const;

// ---------------------------------------------------------------- size accounting

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const OBSERVED_BYTES_PER_TOKEN = 69968 / 24512;

/**
 * Reported against §216, which is the prompt §217 executed under. Additive by construction, so
 * nothing is removed and the added figure is the whole change.
 */
export function instructionAccounting218(): Record<string, unknown> {
  const p216 = EXPERT_VERIFIER_216_SYSTEM_PROMPT;
  const p218 = EXPERT_VERIFIER_218_SYSTEM_PROMPT;
  const added = p218.length - p216.length;
  return {
    blockLines: PROPERTY_REVIEW_BLOCK_218.length,
    blockChars: PROPERTY_REVIEW_BLOCK_218.join('\n').length,
    promptChars216: p216.length,
    promptChars218: p218.length,
    addedCharacters: added,
    removedCharacters: 0,
    estimatedAddedTokens: Math.round(added / OBSERVED_BYTES_PER_TOKEN),
    identity216: sha256(p216),
    identity218: sha256(p218),
    tokenEstimateBasis: 'OBSERVED_BYTES_PER_TOKEN = 69968 / 24512, from the frozen §208 first-pass '
      + 'leg. An estimate, not a tokenizer result.',
    note: 'ADDITIVE. The §216 block is carried unchanged and the ladder still runs; its step 1 is '
      + 'now entered with the property already declared in fields.',
  };
}

export { sha256 as sha256Of };
