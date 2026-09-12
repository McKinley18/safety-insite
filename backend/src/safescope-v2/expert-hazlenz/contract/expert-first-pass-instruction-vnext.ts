/**
 * §196 EXPERT HAZLENZ -- FIRST-PASS PROTOCOL vNext. STRUCTURED UNRESOLVED-FACT DECLARATIONS.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * ==================== THE STAGE THIS EXISTS FOR ====================
 *
 * §195 stopped before spend because the pipeline it was convened to validate has a hole in it:
 *
 *     RAW OBSERVATION -> EXPERT FIRST PASS -> OWED-FACT CONSTRUCTION -> VERIFIER
 *                                             ^^^^^^^^^^^^^^^^^^^^^^ does not exist
 *
 * The first pass emits `DecisionCriticalClarification` -- a question, a reason, a label and a prose
 * `evidenceGap`. An `OwedFact` needs a `factKey`, a VERBATIM `evidenceSpan`, `branchA`, `branchB`
 * and two diverging decisions. Building those from the prose would mean inventing branch semantics,
 * extracting a verbatim span from a sentence that is not one, and authoring safety truth
 * deterministically -- which `structural-questions.ts` and `governed-evidence-derivation.ts` refuse
 * in writing, and which the product owner has refused again at §196.
 *
 * So the remediation is REPRESENTATIONAL. The model authors the semantics; deterministic code
 * validates and projects them. This module is the first half: the protocol by which a first pass
 * may STATE an unresolved fact. `expert-first-pass-owed-fact-projection.ts` is the second half.
 *
 * ==================== WHY vNext AND NOT AN EDIT TO v15 ====================
 *
 * `EXPERT_SYSTEM_PROMPT` is byte-pinned by §187's preregistration (`firstPassIdentity`) and asserted
 * by every integrity gate from §193 onward, and `expert-prompt.ts` is pinned whole. Every recorded
 * first-pass behaviour -- §138's routing, §147/§148's label repair, §176's threshold clause, §183's
 * retained-unknown check -- is attached to those hashes. Editing the file in place would detach all
 * of it. So this is a prospective SUCCESSOR, built exactly the way v3 -> v3.1 -> v3.2 was built on
 * the verifier side, and `expert-prompt.ts` is not modified by §196 at all.
 *
 * BUILT BY CONSTRUCTION FROM v15, AND REVERSIBLE. The prompt is v15's own line array with ONE block
 * inserted at a named anchor. The schema is a structural clone of v15's with ONE collection added
 * and ONE optional back-reference property added to the clarification item. `reconstructV15…`
 * removes exactly those and must reproduce v15 byte-identically -- asserted by the §196 suite and by
 * the source-integrity gate, not assumed. The module refuses to load against a drifted base.
 *
 * ==================== THE CANONICAL SHAPE, REUSED RATHER THAN INVENTED ====================
 *
 * The repository already has a model-emitted owed-fact representation: the verifier's
 * `nominatedFact` (§166 v3), nine fields, validated by `checkBindingDeclarations` against exact
 * rules -- verbatim span, branches that differ, decisions that diverge, closed-vocabulary decision.
 * A first-pass unresolved fact IS that object, produced one stage earlier and carrying a different
 * `source`. So the wire shape here is the v3 nomination shape, with two additions the first pass
 * genuinely needs and the verifier does not:
 *
 *   observationSourceId        the first pass reasons over SEVERAL authoritative sources; the
 *                              verifier over one observation. The span must say which it came from.
 *   governedEvidenceSourceIds  the governed-evidence relationship, bound to supplied ids only.
 *
 * plus `declarationId`, which is a WITHIN-RESPONSE REFERENCE HANDLE and explicitly NOT the fact's
 * identity -- see the projection module for why identity is computed and never accepted.
 *
 * ==================== WHAT THE PROVIDER IS NOT GIVEN A FIELD FOR ====================
 *
 * `factKey`, `priority`, `status`, `source`, `modelAuthored`, `acceptableEvidence`. Every one of
 * them decides something, and §170's rule is that HazLenz populates every field of an `OwedFact`
 * that decides anything. A field that does not exist cannot be filled, which is the same reasoning
 * that made `decisionCriticalClarifications` a sibling collection rather than a candidate-owned one.
 *
 * ==================== THE CARRIER STAYS UNCOUPLED ====================
 *
 * `unresolvedFactDeclarations` is a FIFTH SIBLING, not a field on a hazard candidate and not a field
 * on a clarification. `D-56` recorded what candidate-owned carriers cost: a clarification with
 * nowhere to live in exactly the zero-candidate case that most needed one. The vNext protocol does
 * not reintroduce that shape in a new place. The clarification's link to a declaration is an
 * OPTIONAL back-reference in the direction that cannot create a dependency -- the same mechanism,
 * and the same three-test discipline, as `relatesToCandidateKey`.
 */

import type { ExpertAnalysisInput } from '../expert-contract.types';
import {
  EXPERT_AFFECTED_DECISIONS, EXPERT_CLARIFICATION_CRITICALITY,
} from '../expert-contract.types';
import {
  EXPERT_PROMPT_VERSION, EXPERT_SYSTEM_PROMPT, buildExpertWireSchema, buildExpertUserPrompt,
  redactCitationTokens,
} from '../expert-prompt';

export const EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION =
  'hazlenz.expert.first-pass-instruction.vNext' as const;

/** The base this successor is derived from. Recorded so a drifted base is a loud failure. */
export const VNEXT_BASE_PROMPT_VERSION = EXPERT_PROMPT_VERSION;

/** The name of the fifth sibling collection. Referenced by the projection and by the suite. */
export const UNRESOLVED_FACT_DECLARATIONS_FIELD = 'unresolvedFactDeclarations' as const;

/** The optional clarification back-reference. Named once so nothing spells it twice. */
export const CLARIFICATION_DECLARATION_BACKREF_FIELD =
  'answersUnresolvedFactDeclarationId' as const;

// ---------------------------------------------------------------- the inserted prompt block

/**
 * The block, inserted immediately BEFORE v15's closing line.
 *
 * It is written to be READ AFTER the clarification rules, because it deliberately reuses their
 * test: a fact belongs in a declaration for exactly the reason it would have belonged in a
 * clarification -- two materially different answers leading to two different CURRENT outcomes. The
 * block adds no new reason to raise anything, and says so, because §184's measured failure mode for
 * every added instruction in this programme is a coverage habit rather than a missed capability.
 */
const DECLARATION_BLOCK_HEAD: readonly string[] = [
  '================ STATING AN UNRESOLVED FACT IN FULL ================',
  '',
  'EMPTY BY DEFAULT, exactly like the clarification list. This adds NO new reason to raise anything.',
  'The test is the one you have already applied: a fact belongs here only when you can name two',
  'materially different answers that would lead to two DIFFERENT CURRENT outcomes, and the correct',
  'choice between them cannot be made without it. If you would not have asked about it, do not',
  'declare it.',
  '',
  'What is new is the SHAPE, not the standard. A question records that something is missing. A',
  'declaration records WHAT is missing, WHERE the text shows it is missing, WHICH decision it',
  'blocks, WHAT the two possible answers are, and WHAT WOULD BE DONE DIFFERENTLY under each. That is',
  'the whole point: a downstream reviewer must be able to act on the gap without re-reading your',
  'prose to work out what you meant.',
  '',
  'For each unresolved fact, write ONE entry in `unresolvedFactDeclarations`:',
  '',
  '  missingFact          The unresolved property itself, in one plain phrase. Name the property,',
  '                       not your reaction to it. ONE FACT PER ENTRY: if two different things are',
  '                       unknown, write two entries. Never join them with "and".',
  '',
  '  observationSourceId  Which supplied source your span comes from. Copied exactly.',
  '',
  '  observationSpan      Copied WORD FOR WORD from that source -- the words that show this fact is',
  '                       open or that make it matter. It is matched by EXACT STRING SEARCH, so a',
  '                       correct paraphrase fails exactly like an invented sentence. One CONTIGUOUS',
  '                       run of characters: do not join fragments, do not insert an ellipsis, do',
  '                       not fix grammar, spelling, tense or capitalisation. If you are about to',
  '                       write a phrase you composed rather than copied, you have no span and the',
  '                       declaration must not be made.',
  '',
  '  notEstablishedBecause  Why the fact is not established BY WHAT YOU WERE GIVEN. Read a negative',
  '                       for exactly the predicate it uses: "not visible", "not shown" and "not',
  '                       mentioned" establish that and only that. Your own inference does not',
  '                       establish anything, and a worst-case branch may explain why the gap',
  '                       matters but never settles it.',
  '',
  '  affectedDecision     The ONE decision this missing fact blocks. Same vocabulary, same',
  '                       definitions and the same confusable pairs as a clarification.',
  '',
  '  branchA / branchB    The two factual states that would resolve it. Both must be genuinely',
  '                       possible on what you were given, and they must differ. These are STATES OF',
  '                       THE WORLD, not opinions: "the interlock is fitted and functioning" against',
  '                       "the interlock is absent or defeated", never "it is fine" against "it is',
  '                       not fine".',
  '',
  '  decisionIfA / decisionIfB   What is done TODAY under each branch. THESE MUST DIFFER, and that',
  '                       is checked. If you write the same action twice, the fact does not change',
  '                       what is done and does not belong here at all -- delete the entry rather',
  '                       than inventing a difference to satisfy the rule.',
  '',
  '  whyNecessaryNow      Why this must be settled now rather than noted for later.',
  '',
];

/**
 * §198. The governed-binding paragraph, LIFTED OUT OF THE BLOCK so it can be absent.
 *
 * Under the product owner's Option B this paragraph is emitted ONLY when at least one governed
 * source id was actually supplied. When none was, the model is not told about a field it does not
 * have and could not legitimately fill — which is the whole point of capability omission.
 *
 * The wording changed with the capability. §196 said "Leave it EMPTY unless a record was supplied
 * to you", which was written for a world where the field existed either way. It now says which ids
 * exist, because §197 established that the first pass was previously asked to name an identifier it
 * was never shown.
 */
const GOVERNED_BINDING_LINES: readonly string[] = [
  '  governedEvidenceSourceIds   The governed evidence that bears on THIS fact, named by its exact',
  '                       sourceId. The permissible ids are listed under AVAILABLE GOVERNED',
  '                       EVIDENCE in your input and there are no others — copy one character for',
  '                       character or leave the list empty. Most facts bear on none of them and an',
  '                       empty list is the normal answer. An id you invent, abbreviate or respell',
  '                       is not an id, and the declaration carrying it is discarded whole. Naming a',
  '                       record here is the ONLY way to relate a fact to governed evidence: the',
  '                       hard prohibition on writing a citation anywhere still applies to every',
  '                       field of this list, including reproducing a number from your input.',
  '',
];

const DECLARATION_BLOCK_TAIL: readonly string[] = [
  '  declarationId        A short id unique within this response. It is a handle so a clarification',
  '                       can point at this entry. It is NOT the identity of the fact, you cannot',
  '                       choose that, and reusing an id from anywhere else gains you nothing.',
  '',
  'A DECLARATION AND A QUESTION ARE NOT THE SAME OBJECT AND NEITHER REQUIRES THE OTHER. If you can',
  'also word the question a person should be asked, write it in decisionCriticalClarifications as',
  'you always have, and set that question\'s `answersUnresolvedFactDeclarationId` to this entry\'s',
  'declarationId. If you cannot word it well, declare the fact anyway and leave the question out --',
  'the gap survives and is acted on either way. A question with no declaration is still a legitimate',
  'question. Neither list is a quota and neither is filled to match the other.',
  '',
  'YOU ARE NOT SETTLING ANYTHING BY WRITING IT DOWN. Declaring a fact records that it is open. It',
  'does not resolve it, does not cover it, and does not decide what happens next.',
  '',
];

/**
 * §198. The two block variants, and why there are exactly two.
 *
 * A treatment either has a governed-binding capability or it does not, and the instruction has to
 * agree with the schema in both cases. Building both from ONE head and ONE tail means the two
 * variants cannot drift into saying different things about anything except the capability — the
 * only difference between them is `GOVERNED_BINDING_LINES`, by construction rather than by care.
 */
export const UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING: readonly string[] =
  [...DECLARATION_BLOCK_HEAD, ...DECLARATION_BLOCK_TAIL];

export const UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING: readonly string[] =
  [...DECLARATION_BLOCK_HEAD, ...GOVERNED_BINDING_LINES, ...DECLARATION_BLOCK_TAIL];

const PROMPT_ANCHOR = 'Return only the structured result. Do not narrate your reasoning process.';

function insertBeforeUniqueAnchor(
  lines: readonly string[], anchor: string, block: readonly string[],
): string[] {
  const hits = lines.reduce<number[]>((a, l, i) => (l === anchor ? [...a, i] : a), []);
  if (hits.length !== 1) {
    throw new Error(
      `FIRST_PASS_VNEXT_ABORT: the closing anchor appears ${hits.length} times in the v15 system `
      + 'prompt, expected 1. vNext is built by construction from v15 and refuses to load against a '
      + 'drifted base.');
  }
  return [...lines.slice(0, hits[0]), ...block, ...lines.slice(hits[0])];
}

/**
 * The system prompt for a treatment WITHOUT a governed-binding capability.
 *
 * §198 KEEPS THIS EXPORT NAME. It is what §197's twelve rows used — all twelve supplied no governed
 * evidence — so the historical executor continues to compile and continues to reference a real
 * prompt. Its HASH changes, which is correct and load-bearing: the §197 preregistration pins the
 * old value, so the §197 executor now ABORTS on `vNext prompt moved since freeze` rather than
 * silently re-running a retired protocol instance under a stale freeze. That abort is a feature.
 */
export const EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT: string =
  insertBeforeUniqueAnchor(
    EXPERT_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR,
    UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING,
  ).join('\n');

/** The system prompt for a treatment WITH a governed-binding capability. §198. */
export const EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING: string =
  insertBeforeUniqueAnchor(
    EXPERT_SYSTEM_PROMPT.split('\n'), PROMPT_ANCHOR,
    UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING,
  ).join('\n');

/**
 * Pick the system prompt that AGREES WITH THE SCHEMA this request will carry.
 *
 * One function, so a caller cannot pair a capability-present schema with a capability-absent
 * instruction. Both are derived from the same supplied set, and the §198 suite asserts the pairing
 * on every row rather than trusting the caller to remember.
 */
export function buildExpertVNextSystemPrompt(governed: ExpertVNextGovernedBinding): string {
  return governed.governedEvidenceSourceIds.length === 0
    ? EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT
    : EXPERT_FIRST_PASS_VNEXT_SYSTEM_PROMPT_WITH_GOVERNED_BINDING;
}

/**
 * Remove the block again. The suite asserts this reproduces `EXPERT_SYSTEM_PROMPT` byte for byte
 * FOR BOTH VARIANTS, which is what makes "vNext is v15 plus one block" a checkable claim rather
 * than a comment — and what stops the §198 capability split from quietly becoming a v15 edit.
 */
export function reconstructV15SystemPrompt(
  governed: ExpertVNextGovernedBinding = { governedEvidenceSourceIds: [] },
): string {
  const block = governed.governedEvidenceSourceIds.length === 0
    ? UNRESOLVED_FACT_DECLARATION_LINES_WITHOUT_GOVERNED_BINDING
    : UNRESOLVED_FACT_DECLARATION_LINES_WITH_GOVERNED_BINDING;
  return buildExpertVNextSystemPrompt(governed).replace(`${block.join('\n')}\n`, '');
}

// ---------------------------------------------------------------- the schema additions

/**
 * The governed-evidence ids available to THIS request.
 *
 * `ExpertAnalysisInput.governedStandards` carries `citation`/`title`/`approvedText` and NO id --
 * the first-pass input contract has never keyed governed records by id, while the verifier contract
 * always has (`governedEvidence: { sourceId, text }[]`). Rather than mutate the hash-pinned input
 * contract, vNext takes the closed set alongside it. The harness supplies exactly the ids it
 * supplied the records under, and the projection refuses anything else.
 */
export interface ExpertVNextGovernedBinding {
  readonly governedEvidenceSourceIds: readonly string[];
}

/**
 * §198. Whether a request carries a governed-binding capability at all. Derived, never configured.
 */
export function governedBindingCapability(
  governed: ExpertVNextGovernedBinding,
): 'ABSENT' | 'PRESENT' {
  return governed.governedEvidenceSourceIds.length === 0 ? 'ABSENT' : 'PRESENT';
}

/**
 * The declaration item schema. §198 — CAPABILITY OMISSION.
 *
 * ==================== WHAT §196 DID, AND WHY IT DID NOT SURVIVE CONTACT ====================
 *
 * §196 always emitted the property and, for an empty supplied set, bounded it with `maxItems: 0` so
 * that "the transport itself makes naming a governed source impossible". §197 sent that schema to a
 * real provider twelve times and got twelve HTTP 400s BEFORE INFERENCE:
 *
 *     tools.0.custom: For 'array' type, property 'maxItems' is not supported
 *
 * The transport did not refuse the id. It refused the entire request. A structural guarantee that
 * cannot be transmitted is not a structural guarantee on the hosted path.
 *
 * ==================== WHAT §198 DOES INSTEAD ====================
 *
 * When no governed source id was supplied, the property IS NOT EMITTED AT ALL — not as an empty
 * array, not as a bounded one, not as a sentinel. It is absent from `properties` and absent from
 * `required`, and the instruction that describes it is absent from the system prompt.
 *
 * This is STRONGER than `maxItems: 0` and not merely a workaround for it. A bounded field is a
 * field: the model is told the capability exists and told it must be empty, and the only thing
 * stopping a populated one is a keyword the provider may or may not honour. An ABSENT field cannot
 * be populated by a compliant producer at all, and a non-compliant one is refused by
 * `additionalProperties: false` at the transport and by `DECLARATION_FORBIDDEN_FIELDS` at the
 * boundary. The product owner's Option B, and the reason it was the right call.
 *
 * The `maxItems` keyword is gone from this schema entirely. §198 deliberately does NOT reach for
 * the §108 provider strip to fix this: extending that strip would have made the request
 * transportable while leaving the model told about a capability it does not have.
 */
export function unresolvedFactDeclarationItemSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const str = (description: string): Record<string, unknown> =>
    ({ type: 'string', minLength: 1, description });
  const governedIds = [...governed.governedEvidenceSourceIds];
  const capability = governedBindingCapability(governed);
  return {
    type: 'object',
    properties: {
      declarationId: str('Short id, unique within this response. A handle a clarification can point '
        + 'at. NOT the identity of the fact — you do not choose that.'),
      missingFact: str('The unresolved property itself, in one plain phrase. ONE FACT PER ENTRY: '
        + 'two unknowns are two entries, never joined with "and".'),
      observationSourceId: {
        type: 'string',
        enum: input.authoritativeSources.map(s => s.sourceId),
        description: 'Which supplied source the span below was copied from.',
      },
      observationSpan: str('Copied WORD FOR WORD from the named source. Matched by exact string '
        + 'search, so a paraphrase fails exactly like an invention. ONE CONTIGUOUS run of '
        + 'characters — no joined fragments, no ellipsis, no corrected grammar or capitalisation.'),
      notEstablishedBecause: str('Why the fact is not established by what you were given. Read a '
        + 'negative for exactly the predicate it uses; your own inference establishes nothing.'),
      affectedDecision: {
        type: 'string',
        enum: [...EXPERT_AFFECTED_DECISIONS],
        description: 'The ONE decision this missing fact blocks. Same vocabulary, same definitions '
          + 'and the same confusable pairs as a clarification: "was it isolated / locked out" is '
          + 'REQUIRED_CONTROL; "how much / how many / how long" is HAZARD_SEVERITY; "does this '
          + 'programme reach these facts" is APPLICABILITY.',
      },
      branchA: str('One factual STATE OF THE WORLD that would resolve this. Not an opinion.'),
      decisionIfA: str('What is done TODAY if branchA holds.'),
      branchB: str('The other factual state. It must differ from branchA.'),
      decisionIfB: str('What is done TODAY if branchB holds. MUST DIFFER from decisionIfA — if you '
        + 'would do the same thing either way, delete the entry rather than invent a difference.'),
      whyNecessaryNow: str('Why this must be settled now rather than noted for later.'),
      // §198 CAPABILITY OMISSION. Present only when at least one governed source id was supplied.
      // No `maxItems`, no sentinel, no empty-set placeholder — the property simply is not there.
      ...(capability === 'PRESENT' ? {
        governedEvidenceSourceIds: {
          type: 'array',
          items: { type: 'string', enum: governedIds },
          description: 'EMPTY unless one of the supplied governed records actually bears on THIS '
            + 'fact. Then its exact sourceId, copied character for character from the AVAILABLE '
            + 'GOVERNED EVIDENCE list in your input. Those are the only permissible ids. An '
            + 'invented, abbreviated or respelled id discards this entry.',
        },
      } : {}),
    },
    required: [
      'declarationId', 'missingFact', 'observationSourceId', 'observationSpan',
      'notEstablishedBecause', 'affectedDecision', 'branchA', 'decisionIfA', 'branchB',
      'decisionIfB', 'whyNecessaryNow',
      // Required only when it exists. A required property that is not in `properties` is a
      // malformed schema, and under `additionalProperties: false` it is also unsatisfiable.
      ...(capability === 'PRESENT' ? ['governedEvidenceSourceIds'] : []),
    ],
  };
}

/** The collection schema. Recorded as a builder so the diff against v15 is exactly two edits. */
export function unresolvedFactDeclarationsSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  return {
    type: 'array',
    description: 'EMPTY BY DEFAULT. One entry per unresolved fact that meets the SAME test a '
      + 'decision-critical clarification meets: two materially different answers leading to two '
      + 'different CURRENT outcomes, with the choice between them unmakeable without this fact. '
      + 'This list adds no new reason to raise anything — it records the gap in a shape a reviewer '
      + 'can act on. ONE FACT PER ENTRY. Independent of hazard candidates and independent of '
      + 'clarifications: a declaration needs neither, and neither needs a declaration. Writing an '
      + 'entry does not settle, resolve or cover anything.',
    items: unresolvedFactDeclarationItemSchema(input, governed),
  };
}

/** The optional back-reference added to the clarification item. Never in `required`. */
export const CLARIFICATION_BACKREF_SCHEMA_PROPERTY = {
  type: 'string',
  description: 'OPTIONAL back-reference to a declarationId from unresolvedFactDeclarations. Set it '
    + 'when THIS question is the wording for THAT declared fact. Omitting it is always legal, a '
    + 'question needs no declaration to exist, and a declaration needs no question. Never invent an '
    + 'id: one that names no declaration in this response is discarded and the question survives '
    + 'with no link.',
} as const;

/**
 * The vNext wire schema: v15's, cloned, with exactly two additions.
 *
 * Both additions are checked against the base before they are made, so a v15 that has already grown
 * either of them stops this module rather than silently producing a schema that is no longer
 * "v15 plus two edits".
 */
export function buildExpertVNextWireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const base = JSON.parse(JSON.stringify(buildExpertWireSchema(input)));
  const props = base.properties as Record<string, any>;

  if (props[UNRESOLVED_FACT_DECLARATIONS_FIELD] !== undefined) {
    throw new Error('FIRST_PASS_VNEXT_ABORT: v15 already carries '
      + `${UNRESOLVED_FACT_DECLARATIONS_FIELD}; base drifted`);
  }
  const clarificationProps = props.decisionCriticalClarifications?.items?.properties;
  if (clarificationProps === undefined) {
    throw new Error('FIRST_PASS_VNEXT_ABORT: the v15 clarification item has no properties object; '
      + 'base drifted');
  }
  if (clarificationProps[CLARIFICATION_DECLARATION_BACKREF_FIELD] !== undefined) {
    throw new Error(`FIRST_PASS_VNEXT_ABORT: v15 already carries `
      + `${CLARIFICATION_DECLARATION_BACKREF_FIELD}; base drifted`);
  }

  clarificationProps[CLARIFICATION_DECLARATION_BACKREF_FIELD] =
    JSON.parse(JSON.stringify(CLARIFICATION_BACKREF_SCHEMA_PROPERTY));
  props[UNRESOLVED_FACT_DECLARATIONS_FIELD] = unresolvedFactDeclarationsSchema(input, governed);
  base.required = [...base.required, UNRESOLVED_FACT_DECLARATIONS_FIELD];
  return base;
}

/**
 * Remove both additions again. Asserted to reproduce `buildExpertWireSchema(input)` byte for byte
 * under `stableStringify`, for the same reason the prompt reconstruction is asserted.
 */
export function reconstructV15WireSchema(
  input: ExpertAnalysisInput, governed: ExpertVNextGovernedBinding,
): Record<string, unknown> {
  const v = JSON.parse(JSON.stringify(buildExpertVNextWireSchema(input, governed)));
  delete v.properties[UNRESOLVED_FACT_DECLARATIONS_FIELD];
  delete v.properties.decisionCriticalClarifications.items
    .properties[CLARIFICATION_DECLARATION_BACKREF_FIELD];
  v.required = v.required.filter((r: string) => r !== UNRESOLVED_FACT_DECLARATIONS_FIELD);
  return v;
}

// ---------------------------------------------------------------- the vNext user prompt

/**
 * §198 -- AVAILABLE GOVERNED EVIDENCE, WITH ITS EXACT sourceIds.
 *
 * ==================== THE IMPOSSIBLE CONTRACT §197 FOUND ====================
 *
 * `buildExpertUserPrompt` renders governed records under OPAQUE HANDLES -- `R1`, `R2` -- with their
 * citations stripped by `redactCitationTokens`, and it has never shown a `sourceId`. §139 did that
 * deliberately, to keep the forbidden citation token class out of the model's context.
 *
 * §196 then asked the first pass to name a supplied governed `sourceId`. The model was never shown
 * one. The binding was unexercisable: a compliant producer had no legitimate value to write.
 *
 * §198 does not preserve an impossible contract. When the capability is present, the exact
 * permissible ids are rendered, and they are the ONLY ids rendered.
 *
 * ==================== WHY THE TEXT IS STILL REDACTED AND THE ID IS NOT ====================
 *
 * The authorization requires the exact `sourceId` to be provider-visible and requires the
 * citation-containment rules OUTSIDE the authorized supplied evidence to be unchanged. It does not
 * require the evidence TEXT to be shown with its citations intact, and showing them would be
 * actively wrong here: §196 gave the FIRST PASS no supplied-source citation-reuse allowance -- the
 * v15 HARD PROHIBITIONS block still tells it that reproducing a number from its own input is the
 * same violation as inventing one, and the §196 projection refuses a citation-shaped string in any
 * declaration field.
 *
 * So a first pass shown a citation could only be punished for repeating it. The id is what the
 * contract needs and the id is what is exposed exactly; the text is rendered through the SAME
 * `redactCitationTokens` treatment v15 already applies, unchanged. The mapping from id to text
 * stays deterministic -- the rendered text is a pure function of the supplied text -- and no hidden
 * internal identifier is introduced anywhere.
 *
 * The residual, stated rather than implied: a first pass cannot quote a governed citation. That is
 * v15's rule, not a §198 invention, and the supplied-source reuse allowance §196 built lives on the
 * VERIFIER path where the record arrives with its citation intact.
 */
export interface VNextGovernedEvidenceRecord {
  readonly sourceId: string;
  readonly text: string;
}

/** The id shape a supplied governed record must have. Ids are ours, not prose. */
export const GOVERNED_SOURCE_ID_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/;

export function renderAvailableGovernedEvidence(
  records: readonly VNextGovernedEvidenceRecord[],
): string {
  if (records.length === 0) return '';
  const seen = new Set<string>();
  const lines: string[] = [];
  lines.push('AVAILABLE GOVERNED EVIDENCE — these sourceIds and no others');
  for (const r of records) {
    if (!GOVERNED_SOURCE_ID_SHAPE.test(r.sourceId)) {
      throw new Error(`VNEXT_ABORT: governed sourceId ${JSON.stringify(r.sourceId)} is not a legal `
        + 'id. It is refused rather than normalised, because quietly rewriting an identifier is how '
        + 'two different records end up sharing one.');
    }
    if (seen.has(r.sourceId)) {
      throw new Error(`VNEXT_ABORT: governed sourceId ${r.sourceId} supplied more than once`);
    }
    seen.add(r.sourceId);
    lines.push(`  - sourceId: ${r.sourceId}`);
    lines.push(`      text: ${redactCitationTokens(r.text)}`);
  }
  lines.push('  These are the ids for the governed regulatory records listed earlier in this input;');
  lines.push('  they are the same records, named so you can refer to them exactly.');
  lines.push('  Name one of these ids in governedEvidenceSourceIds when a record bears on a fact.');
  lines.push('  Copy the id character for character. There are no other permissible ids, and an id');
  lines.push('  you invent or respell discards the declaration that carries it.');
  return lines.join('\n');
}

/**
 * The vNext user prompt: v15's, unchanged, with the governed-evidence block APPENDED when the
 * capability is present.
 *
 * Built by construction and reversible, exactly as the system prompt and the schema are: removing
 * the appended block reproduces `buildExpertUserPrompt(input)` byte for byte, and the §198 suite
 * asserts it. `buildExpertUserPrompt` itself is NOT modified — `expert-prompt.ts` remains
 * byte-unchanged at v15.
 */
export function buildExpertVNextUserPrompt(
  input: ExpertAnalysisInput,
  governedRecords: readonly VNextGovernedEvidenceRecord[] = [],
): string {
  const base = buildExpertUserPrompt(input);
  const block = renderAvailableGovernedEvidence(governedRecords);
  return block === '' ? base : `${base}\n\n${block}`;
}

/** Remove the appended block again, for the reversibility proof. */
export function reconstructV15UserPrompt(
  input: ExpertAnalysisInput,
  governedRecords: readonly VNextGovernedEvidenceRecord[] = [],
): string {
  const block = renderAvailableGovernedEvidence(governedRecords);
  const full = buildExpertVNextUserPrompt(input, governedRecords);
  return block === '' ? full : full.replace(`\n\n${block}`, '');
}

/** The binding derived from a set of supplied records. One source of truth for both halves. */
export function governedBindingFor(
  records: readonly VNextGovernedEvidenceRecord[],
): ExpertVNextGovernedBinding {
  return { governedEvidenceSourceIds: records.map(r => r.sourceId) };
}

// ---------------------------------------------------------------- what changed, as data

export const FIRST_PASS_VNEXT_CHANGE_LEDGER = [
  {
    change: `${UNRESOLVED_FACT_DECLARATIONS_FIELD} collection + required entry`,
    kind: 'SCHEMA',
    evidence: '§195 — the owed-fact construction stage does not exist, and no deterministic '
      + 'constructor may invent branch semantics, decision divergence or a verbatim span from '
      + 'generated prose. The model states the semantics instead.',
    testSection: 'B/C',
  },
  {
    change: `optional ${CLARIFICATION_DECLARATION_BACKREF_FIELD} on the clarification item`,
    kind: 'SCHEMA',
    evidence: 'the question and the fact are separate objects and neither requires the other; the '
      + 'link is a declared back-reference, exactly as relatesToCandidateKey is, so that '
      + 'D-56 carrier coupling is not reintroduced in a new place',
    testSection: 'C',
  },
  {
    change: 'STATING AN UNRESOLVED FACT IN FULL block in the system prompt',
    kind: 'INSTRUCTION',
    evidence: '§195 — same finding. The block reuses the clarification test verbatim and states '
      + 'that it adds no new reason to raise anything, because a coverage habit is the measured '
      + 'failure mode of every added instruction in this programme.',
    testSection: 'A',
  },
] as const;

/** Vocabularies re-exported so a caller need not reach past this module into the base contract. */
export { EXPERT_AFFECTED_DECISIONS, EXPERT_CLARIFICATION_CRITICALITY };
