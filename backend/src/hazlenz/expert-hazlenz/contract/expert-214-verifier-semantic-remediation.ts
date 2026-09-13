/**
 * §214 -- TARGETED VERIFIER SEMANTIC REMEDIATION. R-V1, R-V2, R-V3.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO PRODUCTION.
 *
 * ==================== SUPERSESSION, NOT LAYERING ====================
 *
 * §214 was told to avoid another large prompt expansion, to prefer tightening existing §212 wording
 * where safe, and not to layer contradictory reminders indefinitely. So this block is built from
 * v3.2 at the SAME anchor §212 used, and it REPLACES §212's block rather than following it. Two
 * §212 passages are rewritten and one is extended; everything else is carried verbatim.
 *
 * `SUPERSESSION_LEDGER` names every §212 line that was replaced, kept or added, and
 * `sizeAccounting()` reports the delta against BOTH v3.2 and §212 -- because "how much did the
 * prompt grow" and "how much did this slice add on top of the last one" are different questions and
 * only reporting the first would flatter the answer.
 *
 * ==================== R-V1: THE ROLE TEST REPLACES THE PERFECT-KNOWLEDGE TEST ====================
 *
 * §212's test asked what you would need to know "if you could see the workplace exactly as it is".
 * §213 T1 shows exactly how that fails: the verifier read it as VISUAL INSPECTION and concluded
 *
 *     "a sound-looking weld is consistent with both an untested weld and a tested-and-passed one,
 *      so the act of testing ... is the property, not something visible on inspection"
 *
 * which is true about looking at a weld and false about knowing its condition. The counterfactual
 * was sound and the phrasing invited the wrong reading, so the phrasing is replaced rather than
 * supplemented.
 *
 * The successor test removes the artifact instead of granting perfect sight: IF THE TEST, RECORD OR
 * CERTIFICATE DID NOT EXIST, COULD THE UNDERLYING CONDITION STILL BE EITHER SATISFACTORY OR ADVERSE?
 * A weld is sound or unsound whether or not anyone crack tested it, so the test is evidence. A
 * rescue plan either was or was not agreed, and there is no separate condition underneath, so the
 * act is the property. This is a SEMANTIC ROLE TEST and it is not a vocabulary ban.
 *
 * ==================== R-V2: THREE WORLDS ====================
 *
 * §213 T10 verified as-is a branchB reading "the suspension is UNPROVEN, or does not carry the
 * truss", and §213 T1 affirmed that "unconfirmed or inadequate" genuinely partitions the property.
 * Both let "not established" sit inside the adverse branch. The block now names the three worlds
 * explicitly -- established satisfactory, established adverse, and unresolved -- and says which
 * field belongs to each. WORLD U is an epistemic state and never a third truth branch.
 *
 * The carve-out is preserved and stated: where the absence IS the substantive adverse property, an
 * absence-shaped branchB is correct.
 *
 * ==================== R-V3: FACT SCOPE ====================
 *
 * §213 T6 bound both targets correctly and then nominated the sibling fact additively. That is not
 * target-key corruption, and the block says so: a sibling may be MENTIONED in reasoning. What it may
 * not become is the structured correction for the target. The deterministic half of this lives in
 * `expert-214-scope-containment.ts` and is an ID and request-shape rule, never a semantic one.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
} from './expert-verifier-instruction-v3-2';
import {
  REMIT_BLOCK_LINES as BLOCK_212, EXPERT_VERIFIER_212_SYSTEM_PROMPT,
} from './expert-212-verifier-protocol';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './expert-212-challenge-vocabulary';

export const VERIFIER_SEMANTIC_REMEDIATION_214_VERSION =
  'hazlenz.expert.214.verifier-semantic-remediation' as const;

export const BASE_PROTOCOL_VERSION = EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION;
export const SUPERSEDES = 'the §212 remit block' as const;

/** No new verdict, no new ground, no new concern, no new mismatch kind. Asserted by the suite. */
export const VOCABULARY_UNCHANGED = {
  challengeGrounds: [...CHALLENGE_GROUNDS_212],
  propertyMismatchKinds: [...PROPERTY_MISMATCH_KINDS],
  representationConcerns: [...REPRESENTATION_CONCERNS_212],
  membersAdded: [] as readonly string[],
  verdictsAdded: [] as readonly string[],
  schemaChanged: false,
} as const;

// ---------------------------------------------------------------- the block

export const REMIT_BLOCK_214: readonly string[] = [
  'BEFORE ANY OF THAT, THE FACT ITSELF. You are not only choosing a question. For each supplied',
  'fact you are asked a prior question: IS THIS THE RIGHT THING TO BE UNRESOLVED ABOUT?',
  '',
  'You are given the property the first pass named, in its own words, together with the two states',
  'it says would resolve it, what it says is done under each, what it says is done meanwhile, why it',
  'says the fact is not established, and the question it bound to the fact. Judge what you were',
  'given. Do not reconstruct the property from the branches: if the property is not in front of you,',
  'say so rather than infer one.',
  '',
  // ---- R-V1. Replaces §212's perfect-knowledge test.
  'THE ROLE TEST, AND IT IS THE ONE THAT MATTERS. Where a property is built around a test, a check,',
  'an inspection, a measurement, a record or a certificate, take that thing away and ask:',
  '',
  '   WITH THAT TEST OR RECORD OUT OF THE PICTURE ENTIRELY, COULD THE UNDERLYING CONDITION STILL BE',
  '   EITHER SATISFACTORY OR ADVERSE ON ITS OWN?',
  '',
  '   YES -- then the condition is the property and the test or record is how you would find out.',
  '   A weld is sound or unsound whether or not anyone crack tested it. A bund holds or leaks',
  '   whether or not the certificate is in the folder. The paperwork is missing; the condition is',
  '   not. Do not answer this by asking whether LOOKING would settle it -- a great many conditions',
  '   are invisible and are still conditions.',
  '',
  '   NO, because carrying out the act is itself what is required -- then THE ACT IS THE PROPERTY',
  '   and it is correct as written. Whether the rescue plan was agreed, whether the crane was booked',
  '   off, whether the statutory examination was actually done before use: there is no separate',
  '   condition sitting underneath these. The doing of them IS the requirement.',
  '',
  'THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT. A property that mentions a procedure, a',
  'briefing, an agreement, a permit, a handover or a test is NOT wrong for containing those words.',
  'Whether the rescue plan was agreed, whether the crane was booked off, whether the isolation was',
  'applied -- each can be exactly the fact the decision turns on, and challenging one because it',
  'sounds like process is a worse error than the one this instruction exists to catch. Decide on the',
  'ROLE the thing plays in the decision, never on the words used.',
  '',
  'WHERE THE PROPERTY IS WRONG, say so with PROPERTY_IDENTITY_MISMATCH, and add which kind:',
  '',
  '   EVIDENCE_PROXY_FOR_UNDERLYING_STATE',
  '     The named property is the way the real property would be established. "Whether the test was',
  '     done" standing in for "whether the thing is sound"; "whether the certificate exists"',
  '     standing in for "whether it holds". Give the property you take to be the real one in your',
  '     reason, in one phrase. You are not being asked to rewrite the fact.',
  '',
  '   ADJACENT_PROPERTY_SUBSTITUTED',
  '     The named property is a real and nearby safety property, and it is not the one this decision',
  '     turns on. Name both in your reason so a reviewer can see the pair.',
  '',
  'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW. It settles nothing, removes nothing and authorises no',
  'work. The fact stays open until a person decides. Say plainly what is wrong and why it matters,',
  'in a sentence someone can act on without reading the rest of your answer.',
  '',
  // ---- R-V2. Tightens §212's concern section with the three worlds.
  'THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM. There is the world where the property is',
  'established SATISFACTORY, the world where it is established ADVERSE, and the world where it is',
  'simply NOT ESTABLISHED because the evidence is not there. That third one is not a third answer.',
  'It is the state you are in right now, on every fact you are shown.',
  '',
  '   branchA is the satisfactory world. branchB is the adverse world. What is done meanwhile',
  '   belongs to the unresolved one, and to nothing else.',
  '',
  'AND WHERE THE PROPERTY IS RIGHT BUT A FIELD IS NOT, do not challenge the fact. Record it:',
  '',
  '   BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
  '     branchB has taken in the unresolved world. Watch for "not confirmed", "not documented",',
  '     "not measured", "unproven", "certificate missing", "test absent" -- and for an "or" that',
  '     smuggles one of them in beside the real adverse state. Before you accept such a branch, ask:',
  '     COULD THE CONDITION ACTUALLY BE FINE EVEN THOUGH NOBODY CAN SHOW IT? If it could, then the',
  '     absence cannot be the adverse answer, and a branch that says otherwise sends a sound',
  '     workplace to the adverse side.',
  '     The exception, and it is a real one: where the absence ITSELF is the substantive adverse',
  '     state -- no permit was raised, no examination was ever done -- an absence-shaped branchB is',
  '     correct and you should leave it alone.',
  '',
  '   UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
  '     what is said to be done while the fact is open only makes sense if one branch were already',
  '     established. What is done meanwhile follows from NOTHING being known yet.',
  '',
  '   NONE is the normal answer and you should expect to write it most of the time.',
  '',
  'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN, because both are easy to get wrong. It may',
  'read much like what is done under the adverse branch, and that is CORRECT where holding is the',
  'safe course under uncertainty -- it is not a defect and it is not a duplicate. And it is not',
  'evidence about which branch is true: holding the work says the answer is unknown, never that the',
  'bad answer is the right one.',
  '',
  // ---- R-V3. Extends §212's authority paragraph with fact scope.
  'YOUR AUTHORITY IS UNCHANGED BY ANY OF THIS. You do not settle the fact, you do not choose between',
  'branchA and branchB, you do not decide that work may go ahead, and nothing you write changes what',
  'the fact is. You describe what you find.',
  '',
  'AND YOU ARE REVIEWING ONE FACT. The observation will often describe other hazards, and some of',
  'them will be genuinely open. Say so in your reasoning if it helps a reader -- that is useful and',
  'nobody is asking you to pretend you did not notice. But your structured answer stays on the fact',
  'you were given: do not raise a different one as a new fact, and do not offer a question that',
  'settles a different one in place of a question that settles this one. Another fact is another',
  'review.',
  '',
];

// ---------------------------------------------------------------- supersession ledger

export type LineDisposition = 'CARRIED_VERBATIM' | 'REPLACED' | 'ADDED' | 'REMOVED';

export interface SupersessionEntry {
  readonly section: string;
  readonly disposition: LineDisposition;
  readonly rule: string | null;
  readonly why: string;
}

/** Every §212 passage, and what §214 did with it. */
export const SUPERSESSION_LEDGER: readonly SupersessionEntry[] = [
  {
    section: 'BEFORE ANY OF THAT, THE FACT ITSELF / do not reconstruct the property',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§213 shows the remit widening worked: the verifier judged the property on every call',
  },
  {
    section: 'THE TEST FOR THE PROPERTY (perfect-knowledge counterfactual)',
    disposition: 'REPLACED', rule: 'R-V1',
    why: '§213 T1 read "see the workplace exactly as it is" as VISUAL INSPECTION and concluded the '
      + 'crack test was the property because a sound-looking weld looks like an untested one. The '
      + 'counterfactual was right and the phrasing invited the wrong reading, so the phrasing goes.',
  },
  {
    section: 'THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§213 T4 and T8 were both clean. This paragraph is why, and it is not touched.',
  },
  {
    section: 'WHERE THE PROPERTY IS WRONG + the two mismatch kinds',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§213 T3 used the challenge route correctly. The vocabulary is not the problem.',
  },
  {
    section: 'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'zero settlement-authority violations across eleven calls',
  },
  {
    section: 'THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM',
    disposition: 'ADDED', rule: 'R-V2',
    why: 'names the epistemic state explicitly and assigns each field to a world, so "not '
      + 'established" has somewhere to be that is not branchB',
  },
  {
    section: 'BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
    disposition: 'REPLACED', rule: 'R-V2',
    why: '§213 T10 verified as-is a branchB reading "unproven, or does not carry", and T1 affirmed '
      + '"unconfirmed or inadequate" as a genuine partition. The successor names the phrases, names '
      + 'the "or" smuggle, carries the counterfactual check, and keeps the absence-is-the-state '
      + 'exception explicit so the fix does not become the next overcorrection.',
  },
  {
    section: 'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§213 T9 returned exactly this concern on exactly the case built for it',
  },
  {
    section: 'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'no verdict flagged similarity to decisionIfB and none read a hold as proof of branchB',
  },
  {
    section: 'YOUR AUTHORITY IS UNCHANGED BY ANY OF THIS',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'held on all eleven calls',
  },
  {
    section: 'AND YOU ARE REVIEWING ONE FACT',
    disposition: 'ADDED', rule: 'R-V3',
    why: '§213 T6 bound both targets correctly and then nominated the sibling. The paragraph '
      + 'permits conversational awareness and refuses structured nomination, which is the '
      + 'distinction the authorization drew.',
  },
];

/** The overcorrection each change could cause, and the guard carried with it. */
export const OVERCORRECTION_GUARDS_214 = [
  {
    rule: 'R-V1',
    risk: 'a role test could be read as "anything named after a test is wrong", which would break '
      + 'the act-as-property cases §213 got right',
    guard: 'the NO branch of the test names three legitimate act properties, and the unchanged '
      + '"YOU MUST NOT SPEND IT" paragraph follows immediately',
    protects: 'SECTION_213_T4, SECTION_213_T8',
  },
  {
    rule: 'R-V2',
    risk: 'naming the absence phrases could be read as "an absence-shaped branchB is always wrong"',
    guard: 'the exception is stated in the same list item, with two worked examples, and says to '
      + 'leave such a branch alone',
    protects: 'CONTROL_C5',
  },
  {
    rule: 'R-V3',
    risk: 'a scope rule could be read as "never mention another hazard", suppressing useful review '
      + 'prose',
    guard: 'the paragraph says in terms that saying so in reasoning is useful and that nobody is '
      + 'asking the verifier to pretend it did not notice',
    protects: 'CONTROL_C6, and the authorization\'s "conversational awareness" carve-out',
  },
] as const;

// ---------------------------------------------------------------- prompt construction

const PROMPT_ANCHOR =
  'WHEN YOU ADD OR REPLACE A QUESTION it must be answerable by someone standing at that workplace,';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `VERIFIER_214_ABORT: the remit anchor appears ${hits.length} times in the v3.2 prompt, `
      + 'expected 1. This successor is built by construction from v3.2 and refuses to load against '
      + 'a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_VERIFIER_214_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, REMIT_BLOCK_214,
  ).join('\n');

/** Remove the block again. Must reproduce the v3.2 prompt byte for byte. */
export function reconstructV32SystemPrompt214(prompt: string): string {
  const joined = REMIT_BLOCK_214.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('VERIFIER_214: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ---------------------------------------------------------------- size accounting

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const OBSERVED_BYTES_PER_TOKEN = 69968 / 24512;

/**
 * Reported against BOTH baselines. Against v3.2 alone the number would look like the whole cost of
 * the remit; against §212 alone it would hide it. Both are given.
 */
export function sizeAccounting(): Record<string, unknown> {
  const v32 = EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT;
  const b212 = EXPERT_VERIFIER_212_SYSTEM_PROMPT;
  const b214 = EXPERT_VERIFIER_214_SYSTEM_PROMPT;
  const block212 = BLOCK_212.join('\n');
  const block214 = REMIT_BLOCK_214.join('\n');
  const replaced = SUPERSESSION_LEDGER.filter(e => e.disposition === 'REPLACED');
  const added = SUPERSESSION_LEDGER.filter(e => e.disposition === 'ADDED');
  return {
    promptCharsV32: v32.length,
    promptChars212: b212.length,
    promptChars214: b214.length,
    addedCharsVsV32: b214.length - v32.length,
    addedCharsVs212: b214.length - b212.length,
    estimatedAddedTokensVsV32: Math.round((b214.length - v32.length) / OBSERVED_BYTES_PER_TOKEN),
    estimatedAddedTokensVs212: Math.round((b214.length - b212.length) / OBSERVED_BYTES_PER_TOKEN),
    blockChars212: block212.length,
    blockChars214: block214.length,
    blockLines212: BLOCK_212.length,
    blockLines214: REMIT_BLOCK_214.length,
    sectionsCarriedVerbatim:
      SUPERSESSION_LEDGER.filter(e => e.disposition === 'CARRIED_VERBATIM').length,
    sectionsReplaced: replaced.map(e => e.section),
    sectionsAdded: added.map(e => e.section),
    sectionsRemovedOutright:
      SUPERSESSION_LEDGER.filter(e => e.disposition === 'REMOVED').map(e => e.section),
    identityV32: sha256(v32),
    identity212: sha256(b212),
    identity214: sha256(b214),
    schemaChanged: false,
    tokenEstimateBasis: 'OBSERVED_BYTES_PER_TOKEN = 69968 / 24512, from the frozen §208 first-pass '
      + 'leg. An estimate, not a tokenizer result, and not a production cost claim.',
    note: 'the §212 block is SUPERSEDED, not followed. §214 is built from v3.2 at the same anchor, '
      + 'so no reminder is layered on top of a reminder.',
  };
}

/** How much of §212's wording survives, measured rather than claimed. */
export function carriedVerbatimFraction(): number {
  const kept = BLOCK_212.filter(l => l.trim().length > 0 && REMIT_BLOCK_214.includes(l)).length;
  const total = BLOCK_212.filter(l => l.trim().length > 0).length;
  return kept / total;
}

export { sha256 as sha256Of };
