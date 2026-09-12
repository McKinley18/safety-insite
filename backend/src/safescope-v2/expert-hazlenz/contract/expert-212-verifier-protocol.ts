/**
 * §212 -- R-B + R-C APPLIED: THE VERIFIER PROTOCOL SUCCESSOR. REMIT AND VOCABULARY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO PRODUCTION.
 *
 * ==================== BUILT BY CONSTRUCTION FROM v3.2, LIKE EVERY SUCCESSOR BEFORE IT ====================
 *
 * v3 -> v3.1 -> v3.2 each inserted ONE block at a named unique anchor and refused to load against a
 * drifted base. This does the same. Removing the block reproduces the v3.2 prompt BYTE FOR BYTE, and
 * removing the three schema properties reproduces the v3.2 schema exactly. §192's thirty-nine
 * executions stay attached to v3.1, §199's and §208B's to v3.2, and nothing about either moves.
 *
 * NO PROTOCOL VERSION IS CLAIMED. There is no `v3.4` here and no hash is presented as a protocol
 * identity. §201's rule stands and §211 restated it: a version number is earned by a preregistered
 * run, not by a good idea. This module produces an artifact you can hash, diff and cost; promoting
 * it is a separate authorization.
 *
 * ==================== R-B: WHAT THE REMIT BECOMES ====================
 *
 * FROM   which clarification should be asked
 * TO     is this proposed unresolved-fact representation semantically valid for the
 *        decision-critical safety question, and if not, what specific defect exists
 *
 * The verdict set is UNCHANGED. §212 was asked to prefer keeping VERIFIED_AS_IS,
 * CHALLENGE_FACT_VALIDITY and ADD_OR_REPLACE_CLARIFICATION if they remain architecturally useful,
 * and they do: the widened remit changes what a CHALLENGE can be ABOUT, not what the verifier may
 * DO. Adding a verdict would have been the larger change and would have broken every consumer.
 *
 * ==================== THE ANTI-OVERCORRECTION CONTROL IS IN THE SAME BLOCK ====================
 *
 * A block that teaches a model to distrust process language will make it reject the cases where
 * performing an act IS the owed property. §210G learned this the expensive way and carried its
 * narrowing in the same gate that created the risk. This block does the same: the act-as-property
 * paragraph is not a separate rule elsewhere, it is the next paragraph, and the test offered is the
 * perfect-knowledge counterfactual rather than a vocabulary list. THE CHALLENGE MUST DEPEND ON
 * SEMANTIC ROLE, NOT ON VOCABULARY, and no deterministic keyword classifier exists anywhere in
 * §212 to enforce it.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
  VERIFIER_V3_2_RESPONSE_SCHEMA,
} from './expert-verifier-instruction-v3-2';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './expert-212-challenge-vocabulary';

export const VERIFIER_PROTOCOL_212_VERSION =
  'hazlenz.expert.212.verifier-protocol-successor' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_PROTOCOL_VERSION = EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION;

/** Recorded so nobody reads an artifact hash as a protocol identity. */
export const PROTOCOL_VERSION_CLAIMED = null;
export const WHY_NO_VERSION_IS_CLAIMED: string =
  'a version number is earned by a preregistered hosted run. §212 is an architecture slice and has '
  + 'made none.';

// ---------------------------------------------------------------- R-B: the remit block

const g = (n: number): string => CHALLENGE_GROUNDS_212[n];

export const REMIT_BLOCK_LINES: readonly string[] = [
  'BEFORE ANY OF THAT, THE FACT ITSELF. You are not only choosing a question. For each supplied',
  'fact you are asked a prior question: IS THIS THE RIGHT THING TO BE UNRESOLVED ABOUT?',
  '',
  'You are given the property the first pass named, in its own words, together with the two states',
  'it says would resolve it, what it says is done under each, what it says is done meanwhile, why it',
  'says the fact is not established, and the question it bound to the fact. Judge what you were',
  'given. Do not reconstruct the property from the branches: if the property is not in front of you,',
  'say so rather than infer one.',
  '',
  'THE TEST FOR THE PROPERTY. Ask what you would need to know if you could see the workplace exactly',
  'as it is, with nothing measured, inspected or written down. If seeing it would settle the fact,',
  'then the state is the property and any test, check, inspection, record or certificate is the way',
  'of finding out. If seeing it would leave the decision still turning on whether a required act was',
  `carried out, THE ACT IS THE PROPERTY and it is correct as written. ${''}`,
  '',
  'THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT. A property that mentions a procedure, a',
  'briefing, an agreement, a permit, a handover or a test is NOT wrong for containing those words.',
  'Whether the rescue plan was agreed, whether the crane was booked off, whether the isolation was',
  'applied -- each can be exactly the fact the decision turns on, and challenging one because it',
  'sounds like process is a worse error than the one this instruction exists to catch. Decide on the',
  'ROLE the thing plays in the decision, never on the words used.',
  '',
  `WHERE THE PROPERTY IS WRONG, say so with ${g(2)}, and add which kind:`,
  '',
  `   ${PROPERTY_MISMATCH_KINDS[0]}`,
  '     The named property is the way the real property would be established. "Whether the test was',
  '     done" standing in for "whether the thing is sound"; "whether the certificate exists"',
  '     standing in for "whether it holds". Give the property you take to be the real one in your',
  '     reason, in one phrase. You are not being asked to rewrite the fact.',
  '',
  `   ${PROPERTY_MISMATCH_KINDS[1]}`,
  '     The named property is a real and nearby safety property, and it is not the one this decision',
  '     turns on. Name both in your reason so a reviewer can see the pair.',
  '',
  'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW. It settles nothing, removes nothing and authorises no',
  'work. The fact stays open until a person decides. Say plainly what is wrong and why it matters,',
  'in a sentence someone can act on without reading the rest of your answer.',
  '',
  'AND WHERE THE PROPERTY IS RIGHT BUT A FIELD IS NOT, do not challenge the fact. Record it:',
  '',
  `   ${REPRESENTATION_CONCERNS_212[1]}`,
  '     branchA and branchB divide something other than the property -- most often they divide',
  '     confirmed from unconfirmed, or tested from untested. Nothing having been established is what',
  '     leaves the fact open; it is never a finding that the bad state is true.',
  '',
  `   ${REPRESENTATION_CONCERNS_212[2]}`,
  '     what is said to be done while the fact is open only makes sense if one branch were already',
  '     established. What is done meanwhile follows from NOTHING being known yet.',
  '',
  `   ${REPRESENTATION_CONCERNS_212[0]} is the normal answer and you should expect to write it most`,
  '   of the time.',
  '',
  'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN, because both are easy to get wrong. It may',
  'read much like what is done under the adverse branch, and that is CORRECT where holding is the',
  'safe course under uncertainty -- it is not a defect and it is not a duplicate. And it is not',
  'evidence about which branch is true: holding the work says the answer is unknown, never that the',
  'bad answer is the right one.',
  '',
  'YOUR AUTHORITY IS UNCHANGED BY ANY OF THIS. You do not settle the fact, you do not choose between',
  'branchA and branchB, you do not decide that work may go ahead, and nothing you write changes what',
  'the fact is. You describe what you find.',
  '',
];

/** Which rule each part of the block serves. Asserted by the suite to cover the whole block. */
export const BLOCK_TO_RULE_212: readonly { heading: string; rule: string; serves: string }[] = [
  { heading: 'BEFORE ANY OF THAT, THE FACT ITSELF', rule: 'R-B',
    serves: 'widens the remit from clarification selection to semantic validity of the fact' },
  { heading: 'Do not reconstruct the property from the branches', rule: 'R-A',
    serves: 'the architecture principle: judge the representation supplied, never rebuild it' },
  { heading: 'THE TEST FOR THE PROPERTY', rule: 'R-B',
    serves: 'V1 and V2 — property identity, and state against evidence' },
  { heading: 'THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT', rule: 'R-B_NARROWING',
    serves: 'V3 — the mandatory act-as-property anti-overcorrection control' },
  { heading: 'WHERE THE PROPERTY IS WRONG', rule: 'R-C',
    serves: 'the property-identity ground and its two kinds' },
  { heading: 'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW', rule: 'NON_AUTHORITY',
    serves: 'V10 — reviewability, and the settlement boundary' },
  { heading: 'AND WHERE THE PROPERTY IS RIGHT BUT A FIELD IS NOT', rule: 'R-C',
    serves: 'V4 and V7 — branch alignment and the unresolved action, without invalidating the fact' },
  { heading: 'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN', rule: 'R-C_NARROWING',
    serves: 'the two §212 must-nots: similarity to decisionIfB is not a defect, and the unresolved '
      + 'action is not proof branchB is true' },
  { heading: 'YOUR AUTHORITY IS UNCHANGED BY ANY OF THIS', rule: 'NON_AUTHORITY',
    serves: 'the verifier does not settle, does not choose a branch and does not authorise work' },
];

/** The overcorrection this block could create, and the guard carried in the same block. */
export const OVERCORRECTION_GUARD_212 = {
  risk: 'a remit to challenge evidence-proxy properties will make a model challenge every property '
    + 'that mentions a test, a permit or a procedure — including the cases where performing the act '
    + 'IS the owed property',
  guard: 'the perfect-knowledge counterfactual, plus a paragraph naming three legitimate act '
    + 'properties, plus the explicit statement that deciding on words rather than role is the worse '
    + 'error',
  guardIsInTheSameBlock: true,
  deterministicKeywordClassifierAdded: false,
  protects: 'SECTION_211_T4 and SECTION_210H_G3',
} as const;

// ---------------------------------------------------------------- prompt construction

const PROMPT_ANCHOR =
  'WHEN YOU ADD OR REPLACE A QUESTION it must be answerable by someone standing at that workplace,';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `VERIFIER_212_ABORT: the remit anchor appears ${hits.length} times in the v3.2 prompt, `
      + 'expected 1. This successor is built by construction from v3.2 and refuses to load against '
      + 'a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_VERIFIER_212_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, REMIT_BLOCK_LINES,
  ).join('\n');

/** Remove the block again. Must reproduce the v3.2 prompt byte for byte. */
export function reconstructV32SystemPrompt(prompt: string): string {
  const joined = REMIT_BLOCK_LINES.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('VERIFIER_212: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ---------------------------------------------------------------- schema construction

/** The three properties added to the declaration item. Held as data so the diff is assertable. */
export const DECLARATION_SCHEMA_PATCH_212 = {
  challengeGround: {
    type: ['string', 'null'],
    enum: [...CHALLENGE_GROUNDS_212, null],
    description: 'Required for CHALLENGE_FACT_VALIDITY, NULL otherwise. Which ground you are '
      + 'asking to have arbitrated. PROPERTY_IDENTITY_MISMATCH means the named property is not the '
      + 'one this decision turns on.',
  },
  propertyMismatchKind: {
    type: ['string', 'null'],
    enum: [...PROPERTY_MISMATCH_KINDS, null],
    description: 'Required for PROPERTY_IDENTITY_MISMATCH, NULL otherwise. Which kind of mismatch: '
      + 'the named property is the way the real one would be established, or it is a real but '
      + 'adjacent property.',
  },
  representationConcern: {
    type: 'string',
    enum: [...REPRESENTATION_CONCERNS_212],
    description: 'A defect in a FIELD of a fact whose property you accept. NONE is the normal '
      + 'answer. Recording one of the others does NOT challenge the fact and does not settle '
      + 'anything.',
  },
} as const;

export const ADDED_DECLARATION_PROPERTIES: readonly string[] =
  Object.keys(DECLARATION_SCHEMA_PATCH_212);

export function buildVerifier212ResponseSchema(): Record<string, unknown> {
  const out = JSON.parse(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA));
  const item = out.properties?.owedFactDeclarations?.items;
  if (item === undefined) {
    throw new Error('VERIFIER_212_ABORT: the v3.2 schema carries no owedFactDeclarations item '
      + 'node; base drifted');
  }
  for (const name of ADDED_DECLARATION_PROPERTIES) {
    if (item.properties[name] !== undefined) {
      throw new Error(`VERIFIER_212_ABORT: v3.2 already carries ${name}; base drifted`);
    }
  }
  for (const [name, node] of Object.entries(DECLARATION_SCHEMA_PATCH_212)) {
    item.properties[name] = JSON.parse(JSON.stringify(node));
  }
  item.required = [...item.required, ...ADDED_DECLARATION_PROPERTIES];
  return out;
}

export const VERIFIER_212_RESPONSE_SCHEMA = buildVerifier212ResponseSchema();

/** Remove the three properties again. Asserted to reproduce the v3.2 schema exactly. */
export function reconstructV32ResponseSchema(): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA));
  const item = v.properties.owedFactDeclarations.items;
  for (const name of ADDED_DECLARATION_PROPERTIES) delete item.properties[name];
  item.required = (item.required as string[])
    .filter(r => !ADDED_DECLARATION_PROPERTIES.includes(r));
  return v;
}

// ---------------------------------------------------------------- identity and grammar cost

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

function countNodes(node: unknown): { nodes: number; enums: number; enumMembers: number } {
  let nodes = 0; let enums = 0; let enumMembers = 0;
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (typeof n !== 'object' || n === null) return;
    nodes += 1;
    const o = n as Record<string, unknown>;
    if (Array.isArray(o.enum)) { enums += 1; enumMembers += o.enum.length; }
    for (const v of Object.values(o)) walk(v);
  };
  walk(node);
  return { nodes, enums, enumMembers };
}

/**
 * §201's discipline, applied to this change: NO ADDITION MAY BE DESCRIBED AS CHEAP ON BYTES ALONE.
 * §199 was refused at the transport with "the compiled grammar is too large" on a schema whose
 * serialised size looked acceptable, so four figures are reported rather than one.
 */
export function protocolIdentities212(): Record<string, unknown> {
  const basePrompt = EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT;
  const nextPrompt = EXPERT_VERIFIER_212_SYSTEM_PROMPT;
  const baseSchema = JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA);
  const nextSchema = JSON.stringify(VERIFIER_212_RESPONSE_SCHEMA);
  const b = countNodes(VERIFIER_V3_2_RESPONSE_SCHEMA);
  const n = countNodes(VERIFIER_212_RESPONSE_SCHEMA);
  return {
    baseVersion: BASE_PROTOCOL_VERSION,
    successorArtifact: VERIFIER_PROTOCOL_212_VERSION,
    protocolVersionClaimed: PROTOCOL_VERSION_CLAIMED,
    prompt: {
      baseSha256: sha256(basePrompt),
      successorSha256: sha256(nextPrompt),
      baseChars: basePrompt.length,
      successorChars: nextPrompt.length,
      addedChars: nextPrompt.length - basePrompt.length,
      netProseRemoved: 0,
    },
    schema: {
      baseSha256: sha256(baseSchema),
      successorSha256: sha256(nextSchema),
      baseBytes: baseSchema.length,
      successorBytes: nextSchema.length,
      addedBytes: nextSchema.length - baseSchema.length,
      baseNodes: b.nodes,
      successorNodes: n.nodes,
      addedNodes: n.nodes - b.nodes,
      baseEnums: b.enums,
      successorEnums: n.enums,
      addedEnums: n.enums - b.enums,
      baseEnumMembers: b.enumMembers,
      successorEnumMembers: n.enumMembers,
      addedEnumMembers: n.enumMembers - b.enumMembers,
    },
    grammarCostCaveat: 'the provider\'s stated metric is COMPILED GRAMMAR COMPLEXITY and the '
      + 'threshold is undocumented. An enum expands far beyond its serialised length, so byte size '
      + 'alone establishes nothing. §199 was refused at ~19,060 first-pass bytes and accepted at '
      + '~18,620; the verifier schema is a different, much smaller request with visible headroom, '
      + 'and that headroom is the reason this is proposed rather than a claim that it will pass.',
  };
}

export { sha256 as sha256Of };
