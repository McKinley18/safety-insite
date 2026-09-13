/**
 * §210J -- BOUNDED EPISTEMIC SCHEMA REMEDIATION: THE FIRST-PASS CONTRACT SUCCESSOR. GAP 1.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NOT WIRED TO ANY PATH.
 *
 * ==================== WHAT THIS CLOSES, AND WHAT IT DOES NOT CLAIM ====================
 *
 * §210I found a type-level gap: `decisionIfA` and `decisionIfB` are both conditioned on a branch
 * BEING TRUE -- the schema says so in as many words -- and nothing carries what is done while
 * neither holds. This module adds that one carrier.
 *
 * IT IS NOT A REPAIR OF §210H G1, AND NOTHING HERE MAY BE READ AS ONE. The product owner accepted
 * §210I's finding that the existing eleven-field declaration can already express the correct G1
 * semantics -- G2 proved it on the same shape. A declaration whose property is evidence-shaped
 * remains structurally valid under this contract, exactly as it was under the previous one. This is
 * an architecture slice. Behavioural confirmation, if it is ever authorized, is a separate matter.
 *
 * ==================== THE NAME ====================
 *
 * `decisionWhileUnresolved`. The smallest name consistent with the vocabulary already in the block:
 * `decisionIfA` and `decisionIfB` carry "what is done TODAY", and this carries the same kind of
 * thing under a different condition, so it belongs to the same family and reads as its third
 * member. `currentActionWhileUnresolved` says the same thing in eight more characters and
 * introduces a second word for the concept `decision` already names here.
 *
 * ==================== BUILT BY CONSTRUCTION, LIKE EVERY SUCCESSOR BEFORE IT ====================
 *
 * §210B-2, §210C, §210E and §210G each derive their prompt from the previous one by inserting a
 * block at a UNIQUE anchor and abort if the base has drifted. This does the same, with two
 * differences that follow from what is being added rather than from a change of method:
 *
 *   THE ANCHOR IS INTERNAL.  Those slices appended a gate at the closing anchor. A FIELD has to be
 *   described where the other fields are described, so the insertion point is the `whyNecessaryNow`
 *   line and the new paragraph lands between the two branch decisions and it. Verified unique in
 *   both prompt variants; a second occurrence aborts the load.
 *
 *   THE SCHEMA CHANGES TOO.  §210B-2..§210G were instruction-only. This one adds a property and a
 *   `required` entry, so the wire grammar identity moves. That is correct and load-bearing: a
 *   §210J declaration is DISTINGUISHABLE from a legacy one by grammar identity and by field
 *   presence, and no historical freeze silently accepts a new-format request.
 *
 * ==================== R7 PLACEHOLDER PROTECTION: YES, AND WHY ====================
 *
 * §210J was asked to determine whether R7's whole-field literal protection should extend here. It
 * should. `decisionWhileUnresolved` is an action field of exactly the kind §210E R7 exists for --
 * §210D's D2 emitted `decisionIfA: "unused"` and `decisionIfB: "placeholder"`, and the identical
 * failure is available on this field. The protection is EXTENDED, not re-implemented: the closed
 * `NON_SEMANTIC_FILLER` set is imported from the frozen projection module and no member is added.
 * See `R7_EXTENSION_DECISION`.
 *
 * What is NOT added, and the distinction is the whole architecture: nothing reads this field for
 * meaning. There is no check that the action is fail-closed, no check that it suits the property,
 * and -- explicitly, on the product owner's instruction -- NO DIVERGENCE CHECK AGAINST
 * `decisionIfB`. A fail-closed action under uncertainty legitimately resembles the adverse-branch
 * action, and demanding a difference would demand an invention.
 */

import { createHash } from 'crypto';

import type {
  ExpertAnalysisInput,
} from '../expert-contract.types';
import {
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT,
  EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING,
  EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
} from './expert-first-pass-instruction-210g';
import { OBSERVED_BYTES_PER_TOKEN } from './expert-first-pass-instruction-210b2';
import {
  type ExpertVNextGovernedBinding,
  UNRESOLVED_FACT_DECLARATIONS_FIELD,
  buildExpertVNextWireSchema,
  governedBindingCapability,
} from './expert-first-pass-instruction-vnext';
import { isNonSemanticFiller } from './expert-first-pass-owed-fact-projection';

export const FIRST_PASS_CONTRACT_210J_VERSION =
  'hazlenz.expert.first-pass-contract.210j-epistemic' as const;

/** The base this successor is derived from. A drifted base is a loud failure, not a silent one. */
export const BASE_INSTRUCTION_VERSION = EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION;

/** The one added field. Named once so nothing in the repository spells it twice. */
export const UNRESOLVED_ACTION_FIELD = 'decisionWhileUnresolved' as const;

/**
 * Why this name rather than the conceptual one the authorization used. Recorded as data so the
 * choice is auditable rather than merely made.
 */
export const FIELD_NAMING_RATIONALE = {
  chosen: UNRESOLVED_ACTION_FIELD,
  conceptualNameInAuthorization: 'currentActionWhileUnresolved',
  basis: 'the block already calls this kind of content a DECISION -- decisionIfA and decisionIfB '
    + 'carry "what is done TODAY" -- so the third member of that family reads as one. A second '
    + 'noun for the same concept would make the block describe two things where there is one.',
  siblings: ['decisionIfA', 'decisionIfB'] as readonly string[],
} as const;

/** The eleven fields the declaration already required. Order is the schema's own. */
export const LEGACY_REQUIRED_DECLARATION_FIELDS = [
  'declarationId', 'missingFact', 'observationSourceId', 'observationSpan',
  'notEstablishedBecause', 'affectedDecision', 'branchA', 'decisionIfA', 'branchB', 'decisionIfB',
  'whyNecessaryNow',
] as const;

/** The twelve a §210J declaration requires. Exactly the eleven plus one. */
export const REQUIRED_DECLARATION_FIELDS_210J = [
  ...LEGACY_REQUIRED_DECLARATION_FIELDS, UNRESOLVED_ACTION_FIELD,
] as const;

// ---------------------------------------------------------------- the declaration type

/** The declaration as it arrives under §210J. Twelve required fields, one conditional. */
export interface Declaration210J {
  readonly declarationId: string;
  readonly missingFact: string;
  readonly observationSourceId: string;
  readonly observationSpan: string;
  readonly notEstablishedBecause: string;
  readonly affectedDecision: string;
  readonly branchA: string;
  readonly decisionIfA: string;
  readonly branchB: string;
  readonly decisionIfB: string;
  /**
   * What is done NOW, while neither branch has been established. It is not a truth claim, it is not
   * a third branch, and it does not assert that branchA or branchB is true.
   */
  readonly decisionWhileUnresolved: string;
  readonly whyNecessaryNow: string;
  readonly governedEvidenceSourceIds?: readonly string[];
}

// ---------------------------------------------------------------- the instruction block

/**
 * The inserted paragraph. Written over the CONTRACT'S OWN FIELD NAMES so it is case-independent,
 * and deliberately short: it describes a field, it does not add a reason to declare anything.
 *
 * The last two sentences carry the product owner's explicit narrowing. Without them the natural
 * reading of a new action field beside two existing ones is that it must say something different
 * from both, which would push a model to invent a distinction on every fail-closed entry.
 */
export const UNRESOLVED_ACTION_LINES: readonly string[] = [
  '  decisionWhileUnresolved   What is done TODAY while this fact is still open -- before either',
  '                       branch has been established. Neither branch is settled yet, and writing',
  '                       this does not settle one: it is what the situation requires GIVEN that',
  '                       the answer is not yet known.',
  '',
  '                       It is not a third answer and it is not a guess at which branch is true.',
  '                       Do not write "branchA is probably right" or hedge toward either side.',
  '                       Write what actually happens now: hold the lift until the strength is',
  '                       established; nobody enters until the isolation state is established; keep',
  '                       the existing controls in place pending confirmation; or -- where the',
  '                       consequence is small enough -- no additional restriction while this',
  '                       remains open. That last one is a real answer and not a failure to think.',
  '',
  '                       It MAY read much like decisionIfB, and that is correct where holding is',
  '                       the safe course under uncertainty. Nothing checks the two against each',
  '                       other, so do not manufacture a difference between them. What separates',
  '                       them is the condition, not the wording: decisionIfB follows from branchB',
  '                       being TRUE, and this follows from nothing being established yet.',
  '',
];

/** Which rule the block serves, and which defect it is NOT claimed to address. */
export const BLOCK_TO_RULE = {
  addresses: 'the §210I type-level gap: no first-class carrier for the operational consequence '
    + 'while an unresolved fact remains unresolved',
  doesNotAddress: 'the §210H G1 property-selection behaviour. The product owner has ruled that the '
    + 'existing schema did not cause it, and this slice makes no behavioural claim.',
  narrowingCarried: 'no divergence against decisionIfB is required, stated in the block so a model '
    + 'does not infer one from the field\'s existence',
} as const;

/**
 * R7 EXTENSION. Recorded as data so the suite asserts the decision rather than inferring it.
 */
export const R7_EXTENSION_DECISION = {
  question: 'should R7 whole-field literal protection apply to the new field',
  answer: 'YES',
  basis: '§210D D2 emitted decisionIfA: "unused" and decisionIfB: "placeholder". The identical '
    + 'failure is available on an action field under uncertainty, and a filler value there says '
    + 'nothing a reviewer can act on while still satisfying every presence check.',
  method: 'EXTENDED_NOT_REIMPLEMENTED',
  closedSetSource: 'isNonSemanticFiller, imported from the frozen projection module',
  membersAdded: [] as readonly string[],
  semanticValidationAdded: false,
} as const;

/**
 * Stated as a constant because a later reader will otherwise assume the check exists.
 */
export const NO_DIVERGENCE_CHECK_AGAINST_DECISION_IF_B = {
  implemented: false,
  instructedBy: 'PRODUCT_OWNER_210J',
  reason: 'fail-closed behaviour may legitimately make the unresolved action and the adverse-branch '
    + 'action operationally similar; a deterministic divergence check would refuse correct output '
    + 'and push the model to invent a distinction',
} as const;

// ---------------------------------------------------------------- prompt construction

/** Insert before `whyNecessaryNow`, so the field is described where the other fields are. */
const PROMPT_ANCHOR =
  '  whyNecessaryNow      Why this must be settled now rather than noted for later.';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_210J_ABORT: the field anchor appears ${hits.length} times in the §210G system `
      + 'prompt, expected 1. This successor is built by construction from §210G and refuses to '
      + 'load against a drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

export const EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR, UNRESOLVED_ACTION_LINES,
  ).join('\n');

export const EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING.split('\n'), PROMPT_ANCHOR,
    UNRESOLVED_ACTION_LINES,
  ).join('\n');

export function build210jSystemPrompt(governedSourceIdCount: number): string {
  return governedSourceIdCount === 0
    ? EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/** Remove the block again. Must reproduce the §210G prompt byte for byte. */
export function reconstruct210gSystemPrompt(prompt: string): string {
  const joined = UNRESOLVED_ACTION_LINES.join('\n');
  const idx = prompt.indexOf(joined);
  if (idx === -1) throw new Error('FIRST_PASS_210J: block not found; cannot reconstruct');
  return prompt.slice(0, idx) + prompt.slice(idx + joined.length + 1);
}

// ---------------------------------------------------------------- schema construction

/** The property description sent on the wire. One field, described once. */
export const UNRESOLVED_ACTION_SCHEMA_PROPERTY = {
  type: 'string',
  minLength: 1,
  description: 'What is done TODAY while this fact is still open, before either branch has been '
    + 'established. Not a truth claim and not a third branch: it does not say which branch is '
    + 'right. "No additional restriction while this remains open" is a valid answer where the '
    + 'consequence is small. It may read much like decisionIfB where holding is the safe course '
    + 'under uncertainty — nothing compares the two, so do not manufacture a difference.',
} as const;

/**
 * The §210J wire schema: the vNext/§210G schema, cloned, with exactly one added property and one
 * added `required` entry. Aborts if the base already carries the field.
 */
export function buildExpert210jWireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpertVNextWireSchema(input, governed)));
  const decls = (base.properties as Record<string, any>)[UNRESOLVED_FACT_DECLARATIONS_FIELD];
  if (decls === undefined || decls.items === undefined) {
    throw new Error('FIRST_PASS_210J_ABORT: the base schema carries no '
      + `${UNRESOLVED_FACT_DECLARATIONS_FIELD} item node; base drifted`);
  }
  const item = decls.items as Record<string, any>;
  if (item.properties[UNRESOLVED_ACTION_FIELD] !== undefined) {
    throw new Error(`FIRST_PASS_210J_ABORT: the base already carries ${UNRESOLVED_ACTION_FIELD}; `
      + 'base drifted');
  }
  if ((item.required as string[]).includes(UNRESOLVED_ACTION_FIELD)) {
    throw new Error(`FIRST_PASS_210J_ABORT: ${UNRESOLVED_ACTION_FIELD} is already required; `
      + 'base drifted');
  }

  item.properties[UNRESOLVED_ACTION_FIELD] =
    JSON.parse(JSON.stringify(UNRESOLVED_ACTION_SCHEMA_PROPERTY));
  // Inserted before whyNecessaryNow so the required list reads in the same order as the block.
  const at = (item.required as string[]).indexOf('whyNecessaryNow');
  item.required = at === -1
    ? [...(item.required as string[]), UNRESOLVED_ACTION_FIELD]
    : [
      ...(item.required as string[]).slice(0, at), UNRESOLVED_ACTION_FIELD,
      ...(item.required as string[]).slice(at),
    ];
  return base;
}

/** Remove the addition again. Asserted to reproduce the base schema exactly. */
export function reconstructBaseWireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpert210jWireSchema(input, governed)));
  const item = v.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD].items;
  delete item.properties[UNRESOLVED_ACTION_FIELD];
  item.required = (item.required as string[]).filter(r => r !== UNRESOLVED_ACTION_FIELD);
  return v;
}

// ---------------------------------------------------------------- the field check

export const UNRESOLVED_ACTION_CODES = [
  'UNRESOLVED_ACTION_MISSING',
  'UNRESOLVED_ACTION_PLACEHOLDER',
] as const;
export type UnresolvedActionCode = (typeof UNRESOLVED_ACTION_CODES)[number];

/**
 * Validate the one added field. Presence, non-blankness, and the EXISTING closed filler set.
 *
 * Nothing here reads the value for meaning, and there is deliberately no comparison against
 * `decisionIfB` or any other field.
 */
export function checkUnresolvedAction(raw: unknown): UnresolvedActionCode[] {
  const d = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  const v = d[UNRESOLVED_ACTION_FIELD];
  if (typeof v !== 'string' || v.trim().length === 0) return ['UNRESOLVED_ACTION_MISSING'];
  if (isNonSemanticFiller(v)) return ['UNRESOLVED_ACTION_PLACEHOLDER'];
  return [];
}

/** Is this declaration in the §210J format at all? Presence of the key, never a guess. */
export function declarationFormat(raw: unknown): 'SUCCESSOR_210J' | 'LEGACY_PRE_210J' {
  const d = (typeof raw === 'object' && raw !== null && !Array.isArray(raw))
    ? (raw as Record<string, unknown>) : {};
  return UNRESOLVED_ACTION_FIELD in d ? 'SUCCESSOR_210J' : 'LEGACY_PRE_210J';
}

// ---------------------------------------------------------------- identity and cost

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

export function instructionIdentities210j(): Record<string, unknown> {
  const base = EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT;
  const next = EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT;
  const baseG = EXPERT_FIRST_PASS_210G_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  const nextG = EXPERT_FIRST_PASS_210J_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
  return {
    oldVersion: EXPERT_FIRST_PASS_INSTRUCTION_210G_VERSION,
    newVersion: FIRST_PASS_CONTRACT_210J_VERSION,
    withoutGovernedBinding: {
      oldIdentity: sha256(base), newIdentity: sha256(next),
      oldChars: base.length, newChars: next.length,
      addedChars: next.length - base.length,
      estimatedAddedTokens: Math.round((next.length - base.length) / OBSERVED_BYTES_PER_TOKEN),
    },
    withGovernedBinding: {
      oldIdentity: sha256(baseG), newIdentity: sha256(nextG),
      oldChars: baseG.length, newChars: nextG.length,
      addedChars: nextG.length - baseG.length,
      estimatedAddedTokens: Math.round((nextG.length - baseG.length) / OBSERVED_BYTES_PER_TOKEN),
    },
    tokenEstimateBasis: 'derived from the frozen §208 first-pass leg (69,968 body bytes / 24,512 '
      + 'input tokens). An estimate from real cohort data, not a tokenizer result, and not a '
      + 'production cost claim.',
    netProseRemoved: 0,
    note: 'no existing prose was deleted and no §210G, §210E, §210C or §210B-2 sentence was '
      + 'rewritten. The block is inserted inside the field list, where a field must be described.',
  };
}

/** Schema-side cost, measured rather than estimated in bytes. */
export function schemaDelta210j(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const before = JSON.stringify(buildExpertVNextWireSchema(input, governed));
  const after = JSON.stringify(buildExpert210jWireSchema(input, governed));
  return {
    capability: governedBindingCapability(governed),
    beforeBytes: before.length,
    afterBytes: after.length,
    addedBytes: after.length - before.length,
    estimatedAddedTokens: Math.round((after.length - before.length) / OBSERVED_BYTES_PER_TOKEN),
    grammarIdentityBefore: sha256(before),
    grammarIdentityAfter: sha256(after),
    grammarMoved: sha256(before) !== sha256(after),
  };
}

export { sha256 as sha256Of };
