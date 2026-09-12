/**
 * §191 EXPERT HAZLENZ -- VERIFIER INSTRUCTION v3.1. BOUNDED REMEDIATION.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== WHY v3.1 AND NOT AN EDIT TO v3 ====================
 *
 * v1 and v2 are byte-unchanged, and v3 is now byte-unchanged too. The fifteen §187B behavioural
 * executions are attached to v3 at system-prompt sha256 678160c9… and schema sha256 1bddc1a5…; the
 * §187A preregistration pins both, and the §188 and §190 source-integrity gates assert them. Editing
 * v3 in place would detach fifteen executions from the protocol that produced them and would falsify
 * two evidence packages that currently record PASS. So v3.1 is a NEW PROSPECTIVE PROTOCOL. It
 * rescores nothing, and §187–§190 remain attached to v3.
 *
 * ==================== HOW v3.1 IS BUILT ====================
 *
 * BY CONSTRUCTION FROM v3, not by retyping it. The prompt is v3's own line array with two blocks
 * INSERTED at named anchors, and the schema is a structural clone of v3's with exactly three
 * descriptions replaced. Every unchanged line and every unchanged field is therefore byte-identical
 * to v3 as a property of the code rather than as a claim about it, and the module refuses to load if
 * an anchor is missing or ambiguous.
 *
 * ==================== THE THREE REPAIRS, AND THE EVIDENCE FOR EACH ====================
 *
 *   1. THREE SCHEMA FIELD DESCRIPTIONS   evidence: §188, MECHANICAL
 *      `bindingFactKey` said "the supplied unresolved fact THIS QUESTION answers" -- agent-neutral
 *      and verdict-independent, so under VERIFIED_AS_IS it reads as the first pass's question.
 *      `clarificationSourceMode` contradicted itself ("null otherwise" versus "must agree with
 *      which of bindingFactKey and nominatedFact are present") the moment a binding appeared under
 *      a non-ADD verdict, and both refused §187B outputs resolved that contradiction toward the
 *      second sentence. `declaration` carried NO description at all, so the enum token
 *      BOUND_BY_CLARIFICATION reached the model stripped of the prompt's scoping.
 *
 *   2. CONJUNCTIVE SUFFICIENCY            evidence: §190, MODEL-DIAGNOSTIC
 *      Step 3 already demanded that an answer "would settle the fact"; it never said to decompose a
 *      fact requiring several things and test the question against each. Stated as a general
 *      correctness principle. No row, no fixture and no trade term is named.
 *
 *   3. ADJACENT-PROPERTY BOUNDARY         evidence: §190, MODEL-DIAGNOSTIC
 *      Step 2's inclusionary heuristic -- "a control that cannot be seen is not a control that was
 *      checked" -- had no stated boundary for a VISIBLE HOUSING WITH AN INVISIBLE PROPERTY. Stated
 *      at the owed-property/evidence level, deliberately NOT as a keyword list.
 *
 * ==================== WHAT v3.1 DELIBERATELY DOES NOT DO ====================
 *
 * It does not touch the admission validator, which stays the hard deterministic fail-closed guard.
 * It adds no field, no enum member, no source mode and no declaration token. It does not change
 * PROVIDER_SETTLEMENT_AUTHORITY, which remains NEVER. And it contains NO instruction to ask more
 * questions: CLARIFICATION_POLICY is INCONCLUSIVE on the §187 evidence, so nothing here tells the
 * verifier to prefer clarification, to ask when unsure, or to propose a question more often. The
 * repairs change WHEN A QUESTION COUNTS AS SUFFICIENT and WHETHER EVIDENCE ESTABLISHES THE OWED
 * PROPERTY. Any change in question frequency is a consequence of judging those two things
 * correctly, never an instruction to produce one.
 */

import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3,
  buildVerifierV3UserPrompt,
  type OwedFactDeclarationV3, type ClarificationSourceModeV3, type V3SuppliedOwedFact,
} from './expert-verifier-instruction-v3';

export const EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION =
  'hazlenz.expert.verifier-instruction.v3.1' as const;

/**
 * The declaration vocabulary, the source modes and the user-prompt builder are CARRIED OVER
 * UNCHANGED. §188 found the contract lacks a token meaning "the first pass's question already
 * reaches this fact" and considered adding a fourth declaration member; that is NOT done here. It
 * needs its own authorization, and the smaller repair is to say in the `declaration` description
 * which existing token records that conclusion. Re-exported so a v3.1 caller never reaches for v3.
 */
export {
  OWED_FACT_DECLARATIONS_V3, CLARIFICATION_SOURCE_MODES_V3, buildVerifierV3UserPrompt,
};
export type { OwedFactDeclarationV3, ClarificationSourceModeV3, V3SuppliedOwedFact };

// ------------------------------------------------------------------ the two inserted blocks

/**
 * REPAIR 2 of 3 -- adjacent-property boundary. Inserted into step 2, immediately after the
 * "a control that cannot be seen" heuristic, because it is the boundary ON that heuristic: §190
 * found HR-04 replicate 3 declining the heuristic precisely because the guard was visible.
 *
 * The distinctions are stated as ILLUSTRATIONS OF ONE PRINCIPLE, not as a list to match against.
 * A keyword list is a free-text semantic gate by another name, and §160 FINDING 1 is why this
 * programme does not run one.
 */
export const ADJACENT_PROPERTY_BOUNDARY_LINES: readonly string[] = [
  '',
  '   AND THE BOUNDARY ON THAT ONE. A component you can SEE is not thereby a property you have',
  '   CHECKED. Seeing a guard in position tells you it is in position; it does not tell you its',
  '   fastenings are tight. Evidence about a component being PRESENT, about an INSPECTION HAVING',
  '   HAPPENED, about a check made AT SOME EARLIER TIME, about SURROUNDING CONDITIONS, or about',
  '   GENERAL adequacy or function, does not settle a DIFFERENT owed property unless the evidence',
  '   you were actually given establishes that property. Name the property the owed fact is about,',
  '   name what each piece of evidence establishes, and if those are not the same thing then the',
  '   fact is still open however reassuring the evidence is.',
  '',
  '   An inspection settles only what that inspection is stated to cover, and no more. A check made',
  '   at some earlier time tells you about then, not about now, whenever the fact is about the',
  '   current state. A control on ONE energy source, guard or system tells you nothing about a',
  '   SEPARATE one. And nothing being wrong that anyone wrote down is not the same as the property',
  '   having been established.',
];

/**
 * REPAIR 3 of 3 -- conjunctive sufficiency. Inserted at the END of step 3, because step 3 is where
 * the sufficiency test already lives ("whether an answer to the question as written would settle
 * the fact") and what was missing is HOW to run that test on a fact requiring several things.
 *
 * Deliberately generic. No row id, no cohort term, no trade vocabulary, and an explicit instruction
 * NOT to let a term's customary meaning supply a conjunct the question does not ask about.
 */
export const CONJUNCTIVE_SUFFICIENCY_LINES: readonly string[] = [
  '',
  '   AND CHECK IT PIECE BY PIECE. An owed fact often requires MORE THAN ONE THING to be true at',
  '   once: a thing done AND proved, a thing done AFTER one event and BEFORE another, a state',
  '   reached AND confirmed. Read the fact you were given, and list every separate thing it',
  '   requires. Then take the question AS WRITTEN and ask, for EACH of those things on its own,',
  '   whether an answer would establish it. The question is sufficient only if an answer would',
  '   establish EVERY one of them. If it would establish some and leave the others open, it is NOT',
  '   sufficient, however exactly it names the topic.',
  '',
  '   Watch the word "or". A question offering alternatives is answered by whichever is easiest to',
  '   say yes to, so read it as satisfied by its WEAKEST branch, and ask whether that branch alone',
  '   would establish the owed property.',
  '',
  '   Judge this from the fact you were handed and the two answers it states -- not from what a term',
  '   usually implies in the trade. If the fact requires two things, and someone who did only one of',
  '   them could answer the question truthfully, the question does not reach the fact.',
];

// ------------------------------------------------------------------ the prompt, built from v3

/** The v3 lines the blocks attach to. Each must appear EXACTLY ONCE or the module refuses to load. */
const ANCHOR_ADJACENT =
  '       same observation and lead to different actions, the fact is unresolved and it matters.';
const ANCHOR_CONJUNCTIVE = '   would settle the fact that changes the decision.';

function insertAfterUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[], label: string,
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `v3.1 ABORT: anchor for ${label} appears ${hits.length} times in the v3 prompt, expected 1. `
      + 'v3.1 is built by construction from v3 and refuses to load against a drifted base.');
  }
  const at = hits[0];
  return [...lines.slice(0, at + 1), ...block, ...lines.slice(at + 1)];
}

const V3_LINES = EXPERT_VERIFIER_V3_SYSTEM_PROMPT.split('\n');
const WITH_ADJACENT = insertAfterUniqueAnchor(
  V3_LINES, ANCHOR_ADJACENT, ADJACENT_PROPERTY_BOUNDARY_LINES, 'ADJACENT_PROPERTY_BOUNDARY');
const WITH_BOTH = insertAfterUniqueAnchor(
  WITH_ADJACENT, ANCHOR_CONJUNCTIVE, CONJUNCTIVE_SUFFICIENCY_LINES, 'CONJUNCTIVE_SUFFICIENCY');

export const EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT: string = WITH_BOTH.join('\n');

// ------------------------------------------------------------------ the schema, cloned from v3

/**
 * REPAIR 1 of 3 -- the three field descriptions. Recorded as data so the diff module can assert the
 * old text was actually present in v3 and the new text is actually present in v3.1, rather than the
 * repair being described in a comment beside the code.
 */
export interface DescriptionRepair {
  readonly field: string;
  readonly path: readonly string[];
  readonly before: string | null;
  readonly after: string;
  readonly defect: string;
  readonly evidence: string;
}

export const DESCRIPTION_REPAIRS: readonly DescriptionRepair[] = [
  {
    field: 'bindingFactKey',
    path: ['properties', 'bindingFactKey'],
    before: 'The factKey of the supplied unresolved fact this question answers, copied EXACTLY. '
      + 'Must be one of the supplied keys. Null when the question answers no supplied fact.',
    after: 'The factKey of the supplied unresolved fact answered by THE CLARIFICATION YOU ARE '
      + 'PROPOSING IN THIS RESPONSE, copied EXACTLY. Must be one of the supplied keys. Null unless '
      + 'verdict is ADD_OR_REPLACE_CLARIFICATION — a question the FIRST PASS already asked is not a '
      + 'binding, and no other verdict may name a key here.',
    defect: 'AGENT_NEUTRAL_AND_VERDICT_INDEPENDENT — "this question" named neither the agent nor '
      + 'the verdict, so under VERIFIED_AS_IS it reads as the first pass\'s question, which does '
      + 'answer the supplied fact. The description licensed the refused output.',
    evidence: '§188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 (mechanical)',
  },
  {
    field: 'clarificationSourceMode',
    path: ['properties', 'clarificationSourceMode'],
    before: 'Required on ADD_OR_REPLACE_CLARIFICATION, null otherwise. Must agree with which of '
      + 'bindingFactKey and nominatedFact are present.',
    after: 'Null unless verdict is ADD_OR_REPLACE_CLARIFICATION. When the verdict IS '
      + 'ADD_OR_REPLACE_CLARIFICATION this field is required, and it must then agree with which of '
      + 'bindingFactKey and nominatedFact are present. These are not two competing rules: the '
      + 'verdict decides whether the field is populated at all, and only then does the payload '
      + 'decide which member.',
    defect: 'SELF_CONTRADICTORY — "null otherwise" and "must agree with the payload" give opposite '
      + 'answers the moment bindingFactKey is non-null under a non-ADD verdict. Both refused §187B '
      + 'outputs resolved the contradiction toward the second sentence and emitted SUPPLIED_FACT. '
      + 'This is a defect in the artifact, independent of any model behaviour.',
    evidence: '§188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 (mechanical)',
  },
  {
    field: 'owedFactDeclarations[].declaration',
    path: ['properties', 'owedFactDeclarations', 'items', 'properties', 'declaration'],
    before: null,
    after: 'BOUND_BY_CLARIFICATION means the clarification YOU are proposing in THIS response '
      + 'answers this fact. It is legal only when verdict is ADD_OR_REPLACE_CLARIFICATION, and its '
      + 'key must be the one in bindingFactKey. IF THE FIRST PASS ALREADY ASKED A QUESTION THAT '
      + 'REACHES THIS FACT, THAT IS NOT A BINDING — record STILL_UNRESOLVED, because the fact stays '
      + 'owed until someone actually answers it. STILL_UNRESOLVED is the right answer whenever you '
      + 'are not supplying the question yourself. CHALLENGE_FACT_VALIDITY is a request for human '
      + 'review and settles nothing.',
    defect: 'NO_DESCRIPTION_AT_ALL — the enum token BOUND_BY_CLARIFICATION reached the model bare, '
      + 'stripped of the system prompt\'s "the question YOU are supplying" scoping, while the '
      + 'sibling challengeReason field carried a description. This is also where §188\'s missing '
      + 'vocabulary member is addressed WITHOUT adding one: the description names the existing '
      + 'token that records "the first pass already asked it".',
    evidence: '§188 CONTRACT-FAILURE-ROOT-CAUSE.md §2 and §3 (mechanical)',
  },
];

function cloneWithDescriptionRepairs(schema: unknown): unknown {
  const out = JSON.parse(JSON.stringify(schema));
  for (const r of DESCRIPTION_REPAIRS) {
    let node: any = out;
    for (const seg of r.path) {
      node = node?.[seg];
      if (node === undefined) throw new Error(`v3.1 ABORT: schema path ${r.path.join('.')} missing`);
    }
    const actual: string | undefined = node.description;
    if (r.before === null) {
      if (actual !== undefined) {
        throw new Error(`v3.1 ABORT: ${r.field} was expected to carry NO description in v3, found one`);
      }
    } else if (actual !== r.before) {
      throw new Error(
        `v3.1 ABORT: ${r.field} v3 description does not match the recorded "before" text. `
        + 'v3.1 is built by construction from v3 and refuses to load against a drifted base.');
    }
    node.description = r.after;
  }
  return out;
}

export const VERIFIER_V3_1_RESPONSE_SCHEMA = cloneWithDescriptionRepairs(VERIFIER_V3_RESPONSE_SCHEMA);

/**
 * What v3.1 changes, in one place, for the post-remediation root-cause-to-diff review. Every entry
 * names the evidence that supports it. An entry with no evidence is scope expansion and the §191
 * proof suite fails on it.
 */
export const V3_1_CHANGE_LEDGER = [
  {
    change: 'schema field descriptions x3',
    kind: 'SCHEMA_DESCRIPTION',
    evidenceClass: 'MECHANICAL',
    evidence: '§188 — schema permits the refused state and its own descriptions license it',
    testSection: 'A',
  },
  {
    change: 'adjacent-property boundary block in step 2',
    kind: 'INSTRUCTION',
    evidenceClass: 'MODEL_DIAGNOSTIC',
    evidence: '§190 — HR-04 x3 category C, adjacent-property substitution = 3 against a gate of 0',
    testSection: 'C',
  },
  {
    change: 'conjunctive sufficiency block in step 3',
    kind: 'INSTRUCTION',
    evidenceClass: 'MODEL_DIAGNOSTIC',
    evidence: '§190 — HR-08 x3 CLARIFICATION_EVIDENCE_SUFFICIENT = FAIL on a conjunctive owed fact',
    testSection: 'B',
  },
] as const;
