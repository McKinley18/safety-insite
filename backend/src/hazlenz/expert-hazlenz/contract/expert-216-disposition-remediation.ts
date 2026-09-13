/**
 * §216 -- R-V4 DISPOSITION CONSISTENCY AND R-V5 PROPERTY-IDENTITY STANDARD.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO SCHEMA CHANGE. NO NEW VERDICT.
 *
 * ==================== SUPERSESSION, AGAIN, AND FOR THE LAST AUTHORIZED TIME ====================
 *
 * Built from v3.2 at the same anchor §212 and §214 used, so §214's block is REPLACED rather than
 * followed. §216 is recorded as the final authorized verifier instruction-remediation cycle: if a
 * material property-identity failure survives the next confirmation, the answer is a structured
 * semantic decision step, not more instruction text. `PROCESS_STOPPING_RULE` says so in a constant.
 *
 * ==================== R-V4: THE DEFECT IS ROUTING, NOT VOCABULARY ====================
 *
 * §215 H1 and H2 both found something wrong and both routed it through
 * ADD_OR_REPLACE_CLARIFICATION. H2 had already written "EVIDENCE_PROXY_FOR_UNDERLYING_STATE" into
 * its prose and still did not put it in the field. The structural review (see
 * `expert-216-disposition-closure.ts`) shows that once the ground IS declared, every route to a
 * clarification replacement for that same fact is already refused -- so the fix is to make the model
 * declare it, which is a decision procedure rather than more vocabulary.
 *
 * The ladder is therefore ORDERED and the first question is about the property. A better question
 * may not be reached until the property has been accepted.
 *
 * ==================== R-V5: "REASONABLE PROXY" IS NOT A STANDARD ====================
 *
 * §215 H1 called its evidence proxy "a reasonable proxy for the real underlying safety property" and
 * kept it. The §214 role test asked whether the condition survives the artifact; H1 answered that
 * question correctly and then treated a good proxy as good enough. So the successor adds the second
 * half: KNOWING the proposed property must SETTLE the decision. Evidence can be probative, required
 * and the only practical route, and none of that makes it the proposition whose truth decides.
 */

import { createHash } from 'crypto';

import {
  EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT,
} from './expert-verifier-instruction-v3-2';
import {
  REMIT_BLOCK_214, EXPERT_VERIFIER_214_SYSTEM_PROMPT,
} from './expert-214-verifier-semantic-remediation';
import {
  CHALLENGE_GROUNDS_212, PROPERTY_MISMATCH_KINDS, REPRESENTATION_CONCERNS_212,
} from './expert-212-challenge-vocabulary';
import { VERDICT_FOR_A_PROPERTY_CHALLENGE } from './expert-216-disposition-closure';

export const DISPOSITION_REMEDIATION_216_VERSION =
  'hazlenz.expert.216.disposition-and-property-remediation' as const;

export const BASE_PROTOCOL_VERSION = EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION;
export const SUPERSEDES = 'the §214 remit block' as const;

export const VOCABULARY_UNCHANGED_216 = {
  challengeGrounds: [...CHALLENGE_GROUNDS_212],
  propertyMismatchKinds: [...PROPERTY_MISMATCH_KINDS],
  representationConcerns: [...REPRESENTATION_CONCERNS_212],
  membersAdded: [] as readonly string[],
  verdictsAdded: [] as readonly string[],
  schemaChanged: false,
} as const;

/** This is the last authorized instruction-remediation cycle. Recorded as data. */
export const PROCESS_STOPPING_RULE = {
  thisIsTheFinalAuthorizedInstructionRemediation: true,
  ifAMaterialPropertyIdentityFailureSurvives:
    'STOP. Do not author another prompt remediation. Determine whether the verifier needs an '
    + 'explicit structured semantic decision step rather than more instruction text.',
  why: 'to prevent another recursive prompt-and-probe loop',
} as const;

// ---------------------------------------------------------------- the block

export const REMIT_BLOCK_216: readonly string[] = [
  'BEFORE ANY OF THAT, THE FACT ITSELF. You are not only choosing a question. For each supplied',
  'fact you are asked a prior question: IS THIS THE RIGHT THING TO BE UNRESOLVED ABOUT?',
  '',
  'You are given the property the first pass named, in its own words, together with the two states',
  'it says would resolve it, what it says is done under each, what it says is done meanwhile, why it',
  'says the fact is not established, and the question it bound to the fact. Judge what you were',
  'given. Do not reconstruct the property from the branches: if the property is not in front of you,',
  'say so rather than infer one.',
  '',
  // ---- R-V5. Replaces §214's role test with the settlement half added.
  'THE PROPERTY TEST. Two questions, and the property has to pass BOTH.',
  '',
  '   ONE. If you knew this proposed property with certainty, would that ANSWER the safety question',
  '   in front of you? Not narrow it. Not make it likely. Answer it.',
  '',
  '   TWO. Could this proposed property be satisfied, or be absent, while the condition the decision',
  '   really turns on is independently fine or independently bad?',
  '',
  '   If knowing it would not settle the decision, or if the real condition can go either way',
  '   regardless of it, then what you are looking at is EVIDENCE for the property and not the',
  '   property. A weld is sound or unsound whether or not anyone crack tested it. A bund holds or',
  '   leaks whether or not the certificate is in the folder. Do not answer this by asking whether',
  '   LOOKING would settle it -- a great many conditions are invisible and are still conditions.',
  '',
  '   AND A GOOD PROXY IS STILL A PROXY. Evidence can be highly probative. It can be legally',
  '   required. It can be the only practical way anyone would ever find out. None of that makes it',
  '   the thing whose truth decides. "A reasonable proxy", "the usual proof", "the available',
  '   documentation" and "the practical test" are all descriptions of EVIDENCE, and naming a',
  '   property that way is naming the wrong object. Say so.',
  '',
  '   THE ONE CASE WHERE THE ACT IS THE PROPERTY: carrying it out is itself what is required, and',
  '   there is no separate condition underneath. Whether the rescue plan was agreed, whether the',
  '   crane was booked off, whether the pre-lift briefing was held, whether the statutory',
  '   examination was actually done before use. Knowing THAT does answer the safety question,',
  '   because the doing of it IS the requirement.',
  '',
  'THAT LAST CASE IS COMMON AND YOU MUST NOT SPEND IT. A property that mentions a procedure, a',
  'briefing, an agreement, a permit, a handover or a test is NOT wrong for containing those words.',
  'Challenging one because it sounds like process is a worse error than the one this instruction',
  'exists to catch. Decide on the ROLE the thing plays in the decision, never on the words used.',
  '',
  // ---- R-V4. Replaces §214's "where the property is wrong" section with the ordered ladder.
  'NOW DECIDE, AND DECIDE IN THIS ORDER. Each step is only reached if the one before it passed.',
  '',
  '   1. IS THE PROPERTY ITSELF THE RIGHT ONE? If it is not, that is the answer and you STOP HERE.',
  '      Declare CHALLENGE_FACT_VALIDITY on that fact with PROPERTY_IDENTITY_MISMATCH, add the kind',
  '      -- EVIDENCE_PROXY_FOR_UNDERLYING_STATE where the named property is how the real one would',
  '      be established, ADJACENT_PROPERTY_SUBSTITUTED where it is a real but neighbouring property',
  `      -- and return the verdict ${VERDICT_FOR_A_PROPERTY_CHALLENGE.chosen}. Name the property you take to be`,
  '      the real one, in one phrase, in your reason.',
  '',
  '      DO NOT propose a question for a fact whose property you have just said is the wrong',
  '      property. A better question does not make a wrong fact right; it hides it. The fact stays',
  '      open and a person decides.',
  '',
  '   2. THE PROPERTY IS RIGHT. Are the branches and the decisions aligned with it? Record a',
  '      representation concern if not. This does not challenge the fact.',
  '',
  '   3. THE PROPERTY IS RIGHT AND THE FIELDS ARE SOUND. Does the question already bound to this',
  '      fact settle THAT property? If it does not, ADD_OR_REPLACE_CLARIFICATION, and the question',
  '      you propose must settle the property you have just accepted.',
  '',
  '   4. OTHERWISE VERIFIED_AS_IS.',
  '',
  'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW. It settles nothing, removes nothing and authorises no',
  'work. Say plainly what is wrong and why it matters, in a sentence someone can act on without',
  'reading the rest of your answer.',
  '',
  // ---- R-V2, carried from §214 unchanged: it worked on §215 H3.
  'THREE WORLDS, AND EACH FIELD BELONGS TO ONE OF THEM. There is the world where the property is',
  'established SATISFACTORY, the world where it is established ADVERSE, and the world where it is',
  'simply NOT ESTABLISHED because the evidence is not there. That third one is not a third answer.',
  'It is the state you are in right now, on every fact you are shown.',
  '',
  '   branchA is the satisfactory world. branchB is the adverse world. What is done meanwhile',
  '   belongs to the unresolved one, and to nothing else.',
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
  // ---- R-V3, tightened: the sibling rule now sits with the ladder rather than in its own section.
  'YOU ARE REVIEWING ONE FACT, AND YOUR AUTHORITY IS UNCHANGED BY ANY OF THIS. You do not settle the',
  'fact, you do not choose between branchA and branchB, and you do not decide that work may go',
  'ahead. The observation will often describe other hazards and some will be genuinely open: say so',
  'in your reasoning, marked as outside the scope of this review, and nobody is asking you to',
  'pretend you did not notice. What you may not do is raise one as a new fact or offer a question',
  'that settles it instead of this one. Another fact is another review.',
  '',
];

// ---------------------------------------------------------------- supersession ledger

export type LineDisposition216 = 'CARRIED_VERBATIM' | 'REPLACED' | 'ADDED' | 'REMOVED';

export const SUPERSESSION_LEDGER_216: readonly {
  section: string; disposition: LineDisposition216; rule: string | null; why: string;
}[] = [
  {
    section: 'BEFORE ANY OF THAT, THE FACT ITSELF / do not reconstruct the property',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§215 shows the verifier judged the property on every call; the framing works',
  },
  {
    section: 'THE ROLE TEST (§214: does the condition survive the artifact)',
    disposition: 'REPLACED', rule: 'R-V5',
    why: '§215 H1 answered the §214 question correctly and then called the proxy "reasonable" and '
      + 'kept it. The successor adds the settlement half -- would KNOWING it answer the safety '
      + 'question -- and says in terms that a good proxy is still a proxy.',
  },
  {
    section: 'THAT SECOND CASE IS COMMON AND YOU MUST NOT SPEND IT',
    disposition: 'REPLACED', rule: 'R-V5',
    why: 'tightened to four lines from six. The examples moved up into the act-is-the-property '
      + 'branch of the test, where they do more work, so the paragraph no longer repeats them. '
      + '§215 H4 and H6 were both clean and the rule it carries is unchanged.',
  },
  {
    section: 'WHERE THE PROPERTY IS WRONG + the two mismatch kinds',
    disposition: 'REPLACED', rule: 'R-V4',
    why: 'the kinds are now inside an ORDERED ladder whose first step is the property and whose '
      + 'first step ends the decision. §215 H1 and H2 both routed a property finding through a '
      + 'clarification; the ladder makes that route unreachable until the property is accepted, and '
      + 'names the verdict to return so the shape is unambiguous.',
  },
  {
    section: 'A CHALLENGE IS A REQUEST FOR HUMAN REVIEW',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'zero authority violations across §213 and §215',
  },
  {
    section: 'THREE WORLDS + BRANCHES_DO_NOT_PARTITION_THE_PROPERTY',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: '§215 H3 caught the §213 T10 mechanism by name using exactly this wording. It is not '
      + 'reopened.',
  },
  {
    section: 'UNRESOLVED_ACTION_PRESUMES_A_BRANCH',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'unchanged since §212 and clean throughout',
  },
  {
    section: 'TWO THINGS ABOUT WHAT IS DONE WHILE THE FACT IS OPEN',
    disposition: 'CARRIED_VERBATIM', rule: null,
    why: 'no verdict has ever flagged similarity to decisionIfB or read a hold as proof of branchB',
  },
  {
    section: 'YOUR AUTHORITY IS UNCHANGED + AND YOU ARE REVIEWING ONE FACT',
    disposition: 'REPLACED', rule: 'R-V3_TIGHTENED',
    why: 'merged into one paragraph from two, saving lines while keeping both rules and the '
      + 'permitted prose mention. §215 nominated a sibling on four calls, so the wording now says '
      + '"marked as outside the scope of this review" rather than only permitting a mention.',
  },
];

export const OVERCORRECTION_GUARDS_216 = [
  {
    rule: 'R-V5',
    risk: 'a two-part test with a settlement clause could be read as "challenge anything you cannot '
      + 'settle from the property alone", which would take the act-as-property cases with it',
    guard: 'the act branch is INSIDE the test and answers the settlement question affirmatively -- '
      + 'knowing the briefing was held DOES answer the safety question -- and the unchanged "you '
      + 'must not spend it" paragraph follows',
    protects: 'SECTION_215_H4, SECTION_215_H6',
  },
  {
    rule: 'R-V4',
    risk: 'an ordered ladder whose first step is a challenge could push the verifier to challenge '
      + 'early and often, disturbing correct facts',
    guard: 'step 1 ends the decision only when the property is WRONG; steps 2 to 4 are the normal '
      + 'path, and step 4 is VERIFIED_AS_IS. The three-worlds section and NONE-is-normal are '
      + 'carried verbatim.',
    protects: 'SECTION_215_H6, SECTION_213_T8',
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
      `VERIFIER_216_ABORT: the remit anchor appears ${hits.length} times in the v3.2 prompt, `
      + 'expected 1. Built by construction from v3.2; refuses to load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_VERIFIER_216_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, REMIT_BLOCK_216,
  ).join('\n');

export function reconstructV32SystemPrompt216(prompt: string): string {
  const joined = REMIT_BLOCK_216.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('VERIFIER_216: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ---------------------------------------------------------------- size accounting

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const OBSERVED_BYTES_PER_TOKEN = 69968 / 24512;

/**
 * Removed, added, net, and estimated net tokens -- reported against §214, which is the baseline the
 * discipline is about, and against v3.2 for the whole-feature figure.
 *
 * Removed and added are computed by LINE DIFF over the two blocks, so they are measurements rather
 * than a summary of intent.
 */
export function sizeAccounting216(): Record<string, unknown> {
  const b214 = REMIT_BLOCK_214;
  const b216 = REMIT_BLOCK_216;
  const set214 = new Set(b214);
  const set216 = new Set(b216);
  const removedLines = b214.filter(l => l.trim().length > 0 && !set216.has(l));
  const addedLines = b216.filter(l => l.trim().length > 0 && !set214.has(l));
  const removedChars = removedLines.reduce((n, l) => n + l.length + 1, 0);
  const addedChars = addedLines.reduce((n, l) => n + l.length + 1, 0);
  const p214 = EXPERT_VERIFIER_214_SYSTEM_PROMPT;
  const p216 = EXPERT_VERIFIER_216_SYSTEM_PROMPT;
  const v32 = EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT;
  const net = p216.length - p214.length;
  return {
    removedCharacters: removedChars,
    addedCharacters: addedChars,
    netCharactersVs214: net,
    estimatedNetTokensVs214: Math.round(net / OBSERVED_BYTES_PER_TOKEN),
    netCharactersVsV32: p216.length - v32.length,
    estimatedNetTokensVsV32: Math.round((p216.length - v32.length) / OBSERVED_BYTES_PER_TOKEN),
    removedLineCount: removedLines.length,
    addedLineCount: addedLines.length,
    blockChars214: b214.join('\n').length,
    blockChars216: b216.join('\n').length,
    blockLines214: b214.length,
    blockLines216: b216.length,
    promptCharsV32: v32.length,
    promptChars214: p214.length,
    promptChars216: p216.length,
    identityV32: sha256(v32),
    identity214: sha256(p214),
    identity216: sha256(p216),
    schemaChanged: false,
    tokenEstimateBasis: 'OBSERVED_BYTES_PER_TOKEN = 69968 / 24512, from the frozen §208 first-pass '
      + 'leg. An estimate, not a tokenizer result.',
    note: 'the §214 block is SUPERSEDED, not followed. Nothing is layered.',
  };
}

export function carriedVerbatimFraction216(): number {
  const kept = REMIT_BLOCK_214.filter(l => l.trim().length > 0 && REMIT_BLOCK_216.includes(l)).length;
  const total = REMIT_BLOCK_214.filter(l => l.trim().length > 0).length;
  return kept / total;
}

export { sha256 as sha256Of };
