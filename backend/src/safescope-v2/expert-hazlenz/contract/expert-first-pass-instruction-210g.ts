/**
 * §210G -- FINAL R4 DECLARATION-WIDE SEMANTIC ALIGNMENT. R4B.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DEVELOPMENT SCOPE ONLY.
 *
 * Built the way §210C and §210E are built, and for the same reason: ONE appended block inserted
 * before the same unique closing anchor, with a reconstruct function that reproduces the §210E
 * prompt byte for byte. The §210B-2, §210C and §210E modules are NOT edited, so their identities
 * and suites are untouched.
 *
 * ==================== WHAT §210F ACTUALLY SHOWED ====================
 *
 * Thirty of thirty-four frozen questions passed. Every declaration count matched, every BLOCKING
 * clarification was bound, both positive decisions on the two-fact case stayed local and
 * symmetric, all twenty branch and decision fields carried real content, and BOTH §210E narrowings
 * survived. R5, R6 and R7 are closed on that targeted evidence and are NOT touched here.
 *
 * All four failures were one family, R4, and the diagnosis is specific: GATE 8 narrowed the field
 * it names and the drift moved one field across.
 *
 *   SHAPE 1  EVIDENCE-CONDITIONED BRANCHES. E1's `missingFact` was exactly right -- the strength
 *            of the concrete -- and its branches read "the cube tests show" against "the cube tests
 *            have not yet confirmed, or show under-strength". A panel that had genuinely reached
 *            strength with its cubes still at the laboratory therefore satisfied branchB, whose
 *            decision was to hold the lift. GATE 8 says in terms "This narrows the property only",
 *            and it did exactly that.
 *   SHAPE 2  THE ESTABLISHMENT PROCESS SUBSTITUTED FOR THE STATE. E2 asked whether the cleaning
 *            circuit completed rather than whether the tank interior was clear of caustic; E3's
 *            second entry asked whether the soft deck area had been inspected rather than whether
 *            the deck would carry the axle. Distinct from the record-as-property defect GATE 8
 *            addresses, which is why E2's purity question passed while its exact-property question
 *            failed.
 *
 * ==================== WHY THERE IS NO DETERMINISTIC HALF ====================
 *
 * R7 had one, because filler is a closed set of whole-field literals and matching it invents
 * nothing. R4B has NONE, deliberately.
 *
 * "The cube tests have not yet confirmed adequate strength" is a well-formed sentence. Deciding
 * that it tracks the evidence rather than the state requires reading it AS safety semantics, which
 * is the one thing deterministic code in this architecture may never do. A regex over "confirmed",
 * "tested" or "shows" would refuse legitimate branches -- including every branch on the E4 shape
 * this slice is required to protect -- and would be inventing a semantic verdict rather than
 * validating one. So R4B is instruction-only, and the suite asserts that no refusal code was added.
 *
 * ==================== WHY R4B IS NARROWED RATHER THAN ABSOLUTE ====================
 *
 * The E4 result is the thing this slice must not spend. Where performing an act is itself what
 * changes today's action, the act belongs in `missingFact` AND in the branches, and a rule that
 * pushed branches toward "states only" would break exactly that case. GATE 12 therefore carries the
 * same counterfactual GATE 8 carries, and adds the property-selection question in its own terms:
 * would perfect direct sight of the workplace settle this entry, or would the decision still turn
 * on whether the required act was carried out?
 */

import { createHash } from 'crypto';

import {
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION,
} from './expert-first-pass-instruction-210e';
import { OBSERVED_BYTES_PER_TOKEN } from './expert-first-pass-instruction-210b2';

export const EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION =
  'hazlenz.expert.first-pass-instruction.210g-R4B' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION;

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

/**
 * The appended block. ONE gate, numbered GATE 12, continuing §210E's GATE 8-11 without collision in
 * either variant. The rules are stated over the CONTRACT'S OWN FIELD NAMES, which is what keeps
 * them case-independent; no §210F vocabulary appears here.
 */
export const ALIGNMENT_GATE_LINES: readonly string[] = [
  '',
  '================ THE DECLARATION GATE, CONTINUED ================',
  '',
  'One last check, on the finished entry as a whole. It adds no new reason to declare anything.',
  '',
  'GATE 12. THE WHOLE ENTRY ANSWERS ONE PROPERTY: THE ONE YOU WROTE.',
  '',
  '   `missingFact` fixes what this entry is about. Now read `branchA`, `branchB`, `decisionIfA`,',
  '   `decisionIfB`, and every question you bound to this entry, back against it. Each one must',
  '   answer, or act on, THAT property. Not a near neighbour of it.',
  '',
  '   The drift to watch is a single step. The property is a state, and the branches quietly become',
  '   whether anyone has established it: was it checked, inspected, tested, measured, recorded,',
  '   verified; did the procedure finish; did the instrument give a reading. Those are ways of',
  '   finding out. GATE 8 kept them out of the property. They do not belong in the branches or the',
  '   decisions either, and the same near neighbour can capture `missingFact` itself -- asking',
  '   whether the cleaning ran instead of whether anything harmful is still there, or whether the',
  '   thing was examined instead of whether it will carry the load.',
  '',
  '   THE TEST, ONE ENTRY AT A TIME: picture the world where the state is TRUE and nobody has',
  '   measured, inspected or written anything down. Read your own branchA and branchB. Do they put',
  '   that world on the TRUE side?',
  '',
  '   If they put it on the adverse side, the entry has slid off the property onto its evidence.',
  '   Bring every field back to the property. Never the other way round: do not cut detail out of',
  '   the property to make it agree with the branches, because the property is the part that is',
  '   right.',
  '',
  '   branchA and branchB divide the PROPERTY. They do not divide known from unknown, confirmed',
  '   from unconfirmed, tested from untested, or written down from not written down. Nothing having',
  '   been established is exactly what leaves the entry unresolved, and reporting it unresolved is',
  '   the whole job of this entry. It is never a finding that the bad state is true.',
  '',
  '   The decisions follow the same line. `decisionIfA` follows from branchA BEING TRUE, not from',
  '   somebody having produced a result to that effect.',
  '',
  '   A bound question may still ask for evidence, and usually should. Where the property is',
  '   whether something is adequate now, asking what reading or check would establish it is the',
  '   right question. Asking it does not turn the property into whether the reading was taken. What',
  '   it does mean is that the answer has to settle the property.',
  '',
  '   AND BEFORE ANY OF THAT, CHOOSING THE PROPERTY: ask what you would need to know if you could',
  '   simply see the workplace exactly as it is. If seeing it would settle this entry, the checking',
  '   is evidence and the state is your property. If seeing it would leave the decision still',
  '   turning on whether the required act was carried out, then the act IS your property -- write',
  '   it, in `missingFact` and in the branches both. GATE 8 said that case is not rare. This gate',
  '   does not take it back.',
  '',
];

/** Which rule each part of the block serves. Asserted by the suite to cover the whole block. */
export const SENTENCE_TO_RULE: readonly { heading: string; rule: string; addresses: string }[] = [
  {
    heading: 'GATE 12. THE WHOLE ENTRY ANSWERS ONE PROPERTY: THE ONE YOU WROTE.',
    rule: 'R4B',
    addresses: 'E1 wrote a correct state property and then partitioned it on whether the cube '
      + 'tests had confirmed it, so the adequate-but-untested world drove the stop decision; E2 '
      + 'and E3 wrote the establishment process itself as the property, asking whether cleaning '
      + 'completed and whether an area had been inspected rather than whether residue remained and '
      + 'whether the deck would carry the load',
  },
];

/**
 * The narrowing, recorded as data so the suite can assert the instruction states it. It exists to
 * stop the fix becoming the next defect: R4B must not push branches toward states-only where
 * performing the act is genuinely the owed property, which is the behaviour §210F E4 demonstrated
 * and which this slice is required to preserve.
 */
export const OVERCORRECTION_GUARDS = {
  R4B: {
    risk: 'a declaration-wide push toward state-shaped branches would break the entries where '
      + 'performance of a required act is itself the owed property -- exactly the E4 shape, which '
      + 'passed both mandatory overcorrection questions and must not be spent',
    guard: 'the same counterfactual GATE 8 carries, restated over the branches, plus the '
      + 'property-selection question: perfect direct sight of the workplace settles an evidence '
      + 'case and does not settle an act case',
    protects: 'SECTION_210F_E4_Q3_AND_E4_Q4',
  },
} as const;

/**
 * R4B adds NO deterministic refusal code, and this is a design decision rather than an omission.
 * Recorded as data so the suite can assert the projection was not extended.
 */
export const DETERMINISTIC_HALF = {
  hasDeterministicHalf: false,
  refusalCodesAdded: [] as readonly string[],
  reason: 'deciding whether a branch tracks the state or its evidence requires reading the branch '
    + 'AS safety semantics. Deterministic code here may validate, project and refuse '
    + 'model-authored semantics; it may never invent or reconstruct them, and a keyword rule over '
    + 'confirmed, tested or shows would both refuse legitimate act-shaped branches and manufacture '
    + 'a semantic verdict it has no authority to reach.',
  contrastWithR7: 'R7 could carry a deterministic half because filler is a closed set of '
    + 'whole-field literals, matched after trimming and never as a substring. Nothing is inferred '
    + 'from meaning.',
} as const;

/** Mechanisms this slice is forbidden to disturb. Asserted by the suite against the real prompts. */
export const CLOSED_MECHANISMS = {
  R5_CLARIFICATION_BINDING: 'GATE 9',
  R6_FACT_LOCAL_CONTAINMENT: 'GATE 10',
  R7_PLACEHOLDER_REJECTION: 'GATE 11',
  SECTION_210C_GATE_2: 'GATE 2',
  SECTION_210C_GATE_3: 'GATE 3',
  status: 'CLOSED_ON_SECTION_210F_TARGETED_EVIDENCE',
  rule: 'not modified, not rewritten, not reworded. §210G is purely additive and every §210E and '
    + '§210C line survives byte for byte.',
} as const;

/** S6 is still untouched. §210F produced no behavioural evidence about it either. */
export const S6_STATUS = {
  rule: 'S6',
  status: 'NOT_EXERCISED',
  reason: 'every §210F case was capability-ABSENT and the capability-PRESENT first-pass grammar '
    + 'remains refused by the provider. Nothing in §210F or §210G bears on S6.',
  action: 'unchanged. Governed evidence stays in the separate governed stage.',
} as const;

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_210G_ABORT: the closing anchor appears ${hits.length} times in the §210E system `
      + 'prompt, expected 1. This successor is built by construction from §210E and refuses to '
      + 'load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, ALIGNMENT_GATE_LINES,
  ).join('\n');

export const EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n'), PROMPT_ANCHOR,
    ALIGNMENT_GATE_LINES,
  ).join('\n');

export function build210gSystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove the block again. Must reproduce the §210E prompt byte for byte. */
export function reconstruct210eSystemPrompt(prompt: string): string {
  const joined = ALIGNMENT_GATE_LINES.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('FIRST_PASS_210G: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instructionIdentities210g(): Record<string, unknown> {
  const base = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT;
  const baseG = EXPERT_FIRST_PASS_210E_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const nextG = EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const addedChars = next.length - base.length;
  const addedCharsG = nextG.length - baseG.length;
  return {
    oldVersion: EXPERT_FIRST_PASS_INSTRUCTION_210E_VERSION,
    newVersion: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
    withoutGovernedBinding: {
      oldIdentity: sha256(base),
      newIdentity: sha256(next),
      oldChars: base.length,
      newChars: next.length,
      addedChars,
      estimatedAddedTokens: Math.round(addedChars / OBSERVED_BYTES_PER_TOKEN),
    },
    withGovernedBinding: {
      oldIdentity: sha256(baseG),
      newIdentity: sha256(nextG),
      oldChars: baseG.length,
      newChars: nextG.length,
      addedChars: addedCharsG,
      estimatedAddedTokens: Math.round(addedCharsG / OBSERVED_BYTES_PER_TOKEN),
    },
    tokenEstimateBasis: 'derived from the frozen §208 first-pass leg (69,968 body bytes / 24,512 '
      + 'input tokens). An estimate from real cohort data, not a tokenizer result.',
    netProseRemoved: 0,
    note: 'no existing prose was deleted and no §210E, §210C or §210B-2 sentence was rewritten. '
      + '§210G is purely an appended continuation of the declaration gate.',
  };
}
