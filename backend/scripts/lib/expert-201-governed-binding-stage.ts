/**
 * §201 EXPERT HAZLENZ -- THE GOVERNED-BINDING STAGE. OPTION C, AS A PROTOTYPE.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. NOT ENABLED.
 * ZERO PROVIDER CALLS, ZERO DATABASE ACCESS. NOTHING HERE IS WIRED INTO ANY ACTIVE PATH.
 *
 * ==================== THE DEFECT THIS EXISTS TO REMEDIATE ====================
 *
 * §199 sent the capability-PRESENT vNext first-pass schema to Anthropic and was refused BEFORE
 * INFERENCE on both governed rows:
 *
 *     HTTP 400 invalid_request_error
 *     "The compiled grammar is too large, which would cause performance issues."
 *
 * The capability-ABSENT schema was accepted on all ten other rows and produced this programme's
 * first working end-to-end hosted path. The two schemas differ by ~440 serialised bytes, and THAT
 * NUMBER IS NOT THE PROVIDER'S METRIC -- the error names compiled grammar complexity, an
 * `enum`-constrained array of strings expands into far more grammar than its serialised length
 * suggests, and the actual threshold is undocumented. The only sound reading is qualitative: the
 * monolithic first-pass schema sits near a limit we cannot see, and the governed-binding capability
 * does not fit inside what is left.
 *
 * ==================== THE PRINCIPLE THIS MODULE IS ORGANISED AROUND ====================
 *
 *      THE ORDINARY CAPABILITY-ABSENT FIRST PASS IS NOT TOUCHED. NOT ITS PROMPT, NOT ITS
 *      SCHEMA, NOT ITS USER PROMPT, NOT ITS HASH.
 *
 * This module imports from `expert-first-pass-instruction-vnext.ts` and
 * `expert-first-pass-owed-fact-projection.ts` and MODIFIES NEITHER. It adds a stage AFTER them.
 * Under Option C every first-pass request in a cohort -- governed rows included -- is built with an
 * EMPTY governed binding, so `governedBindingCapability()` returns `ABSENT` on every row and every
 * row sends exactly the schema shape that succeeded ten times out of ten. The §201 suite asserts
 * that byte-identity rather than asserting a comment.
 *
 * ==================== WHERE THE STAGE SITS, AND WHY IT IS NOT EARLIER ====================
 *
 *   RAW OBSERVATION
 *     -> FIRST PASS (capability-ABSENT, unchanged)        declarations, no governed field at all
 *     -> DETERMINISTIC PROJECTION (unchanged)             OwedFacts with HazLenz-COMPUTED factKeys
 *     -> GOVERNED-BINDING STAGE  <<-- this module         binds an EXISTING fact to a SUPPLIED id
 *     -> VERIFIER (unchanged)
 *
 * The stage runs AFTER projection, and that is the whole of its safety argument.
 *
 * Before projection, a fact has no identity. The only handle available is the model's own
 * `declarationId`, which the projection is explicit about NOT being an identity -- and a second
 * provider call keyed by a handle the first call's model chose would make the binding's addressing
 * model-authored end to end. Structure does not confer authority: a value is bound only when it is
 * bound to an identifier HazLenz supplied. After projection, both halves of every binding come from
 * closed sets HazLenz owns -- the computed `factKey` and the supplied `sourceId` -- and the model
 * chooses between them rather than naming anything.
 *
 * Running after projection has a second consequence that is worth as much: a declaration the
 * projection REFUSED never reaches this stage. §196's boundary refuses for span-not-verbatim,
 * identical branches, non-diverging decisions and a dozen other reasons. Binding before projection
 * would spend a provider call binding facts that are about to be discarded, and would leave an
 * orphan binding behind when they were.
 *
 * ==================== WHAT THE MODEL IS ALLOWED TO DO HERE, EXHAUSTIVELY ====================
 *
 * SELECT a HazLenz-minted fact reference from a closed set.
 * DECLARE one of three determinations from a closed set.
 * SELECT zero or more supplied `sourceId`s from a closed set.
 * WRITE one sentence of reasoning that is recorded for human review and is NEVER an authority.
 *
 * That is the entire list. There is no `factKey` field on the wire, no `status`, no `priority`, no
 * `acceptableEvidence`, no coverage verdict and no settlement. `BINDING_FORBIDDEN_FIELDS` refuses
 * each of them by name at the boundary, and `additionalProperties: false` refuses them at the
 * transport, so the protection does not depend on either one alone.
 *
 * ==================== SILENCE IS NEVER SUCCESS ====================
 *
 * A fact that receives NO entry is recorded as `NO_DETERMINATION_RETURNED`, which is a distinct
 * outcome from `NOT_BOUND`. "The model considered these records and none bears on this fact" and
 * "the model said nothing about this fact" are different events, and collapsing them would make an
 * omission indistinguishable from a finding. `CANNOT_DETERMINE` is a third, separate outcome for
 * the model's own abstention, and it is deliberately not folded into `NOT_BOUND` either: it is a
 * diagnostic about what THIS STAGE WAS GIVEN, and counting it is how we find out whether the
 * minimal evidence packet below is too thin.
 */

import {
  type AcceptableEvidence, type OwedFact, type OwedFactAffectedDecision,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import { owedFactDefects } from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  CITATION_SHAPED_PATTERN, FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import { redactCitationTokens } from '../../src/hazlenz/expert-hazlenz/expert-prompt';
import { GOVERNED_SOURCE_ID_SHAPE } from './expert-first-pass-instruction-vnext';
import { FACT_KEY_SHAPE } from './expert-first-pass-owed-fact-projection';

export const GOVERNED_BINDING_STAGE_VERSION =
  'hazlenz.expert.governed-binding-stage.201.prototype.v1' as const;

/**
 * The request-contract identity the pre-inference circuit breaker keys on.
 *
 * It is deliberately DIFFERENT from the first pass's, because a rejection of this stage's schema and
 * a rejection of the first pass's schema are different problems and must never share a streak.
 */
export const GOVERNED_BINDING_REQUEST_CONTRACT_ID =
  'hazlenz.expert.governed-binding-stage.v1.request' as const;

// ---------------------------------------------------------------- the closed vocabularies

/**
 * The three answers, and why there are exactly three rather than a boolean.
 *
 * A boolean would make "none of these records bears on this fact" and "I cannot tell from what you
 * gave me" the same answer. The first is a substantive negative result the product wants; the second
 * is evidence that the evidence packet is wrong. Merging them would hide the only signal that would
 * ever tell us the packet was too thin.
 */
export const BINDING_DETERMINATIONS = ['BINDS', 'NO_BINDING', 'CANNOT_DETERMINE'] as const;
export type BindingDetermination = (typeof BINDING_DETERMINATIONS)[number];

/** Per-fact outcomes after the boundary has run. Two of these five never come from the model. */
export const FACT_BINDING_OUTCOMES = [
  'BOUND',
  'NOT_BOUND',
  'CANNOT_DETERMINE',
  /** The entry for this fact was refused by the boundary. No binding, and not a negative result. */
  'REFUSED',
  /** No entry named this fact at all. Distinct from NOT_BOUND, on purpose. */
  'NO_DETERMINATION_RETURNED',
] as const;
export type FactBindingOutcome = (typeof FACT_BINDING_OUTCOMES)[number];

export const BINDING_REFUSAL_CODES = [
  'RESPONSE_NOT_AN_OBJECT',
  'BINDINGS_NOT_AN_ARRAY',
  'BINDING_NOT_AN_OBJECT',
  'FACT_REF_UNKNOWN',
  'FACT_REF_DUPLICATED',
  'DETERMINATION_NOT_A_MEMBER',
  'GOVERNED_SOURCE_IDS_NOT_AN_ARRAY',
  'GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
  'GOVERNED_SOURCE_ID_DUPLICATED',
  'BINDS_NAMES_NO_SOURCE',
  'NON_BINDING_CARRIES_A_SOURCE',
  'BEARING_STATEMENT_MISSING',
  'PROHIBITED_REGULATORY_CITATION',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
] as const;
export type BindingRefusalCode = (typeof BINDING_REFUSAL_CODES)[number];

/**
 * Field names an entry may never carry.
 *
 * `factKey` heads the list for the same reason it heads the projection's: identity is HazLenz's, and
 * a provider that sends one is trying to name a fact. The correct answer to that is a refusal with a
 * code somebody can count, not a silently ignored property. `acceptableEvidence`, `status`,
 * `priority`, `source` and `modelAuthored` arrive from `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` --
 * every one of them decides something, and §170's rule is that HazLenz populates every field of an
 * `OwedFact` that decides anything.
 */
export const BINDING_FORBIDDEN_FIELDS: readonly string[] = [
  'factKey', ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS, ...FORBIDDEN_EXPERT_FIELD_NAMES,
];

/** The one free-text field, scanned for a citation exactly as every other free-text field is. */
export const BINDING_FREE_TEXT_FIELDS = ['bearingStatement'] as const;

// ---------------------------------------------------------------- the input side

export interface GovernedBindingRecord {
  readonly sourceId: string;
  /** The governed record's text as HazLenz holds it. Rendered REDACTED; never re-fetched. */
  readonly text: string;
}

/**
 * The minimum a binding judgement actually needs, and the reasoning behind every inclusion.
 *
 * INCLUDED
 *   factKey            never rendered to the provider. It is the identity the minted reference
 *                      resolves back to, and it stays on this side of the wire.
 *   owedProperty       the unresolved property itself, in the model's own words from
 *                      `declaration.missingFact`. This is the single most load-bearing field for a
 *                      relevance judgement and `OwedFact` HAS NO FIELD FOR IT -- see
 *                      `STAGE_DEPENDENCIES`. Nullable, because a harness may not have kept it.
 *   affectedDecision   which decision is blocked. A record bearing on REQUIRED_CONTROL and one
 *                      bearing on APPLICABILITY are different relevance questions.
 *   evidenceSpan       the verbatim words the projection already validated against the source. It
 *                      anchors the fact in the observation without shipping the observation.
 *   whyUnresolved      why the fact is open, which is often what a governed record speaks to.
 *   branchA / branchB  the two STATES OF THE WORLD that would resolve it. A record bears on a fact
 *                      when it speaks to which state obtains.
 *   inspectionContext  location and task. Applicability is frequently a function of the task alone.
 *
 * DELIBERATELY EXCLUDED
 *   decisionDivergence   what would be DONE under each branch. Excluded because it is action
 *                        content, and action content invites an action-flavoured judgement -- "this
 *                        fact matters enough to escalate". This stage has no escalation authority
 *                        and is not given the material to reason about escalation with.
 *   priority / status    HazLenz task state. Showing them invites echoing them back.
 *   the full observation Excluded by default so the stage cannot re-derive hazards, re-open the
 *                        first pass's analysis, or find a SECOND gap it was not asked about. THE
 *                        COST IS REAL AND IS NOT HIDDEN: a record whose applicability turns on
 *                        context outside the span cannot be judged, and the honest answer to that
 *                        is `CANNOT_DETERMINE`, which is exactly why that outcome exists and is
 *                        counted. See `STAGE_RESIDUAL_LIMITS`.
 */
export interface BindingCandidateFact {
  readonly factKey: string;
  readonly owedProperty: string | null;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly evidenceSpan: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
}

/**
 * Whether the closed set of governed ids is transmitted as an `enum` or as a plain string array.
 *
 * §200's Option B lives here as a one-word switch, because the decision packet recorded that B
 * composes with C: if a small binding schema ever still needed headroom, dropping the enum inside it
 * is the follow-up. THE BOUNDARY IS IDENTICAL IN BOTH MODES -- `GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET`
 * refuses by exact set membership either way, and §198 established that this protection has always
 * actually lived at the boundary rather than in the transport.
 */
export const GOVERNED_ID_TRANSPORT_MODES = ['CLOSED_ENUM', 'PLAIN_STRING'] as const;
export type GovernedIdTransportMode = (typeof GOVERNED_ID_TRANSPORT_MODES)[number];

export interface GovernedBindingStageInput {
  readonly analysisId: string;
  /** Projected, UNRESOLVED facts. Order fixes the minted references and therefore the schema. */
  readonly facts: readonly BindingCandidateFact[];
  /** The closed set of permissible ids, with the text the model is shown. */
  readonly governedRecords: readonly GovernedBindingRecord[];
  readonly inspectionContext: { readonly location: string; readonly task: string };
  readonly governedIdTransport?: GovernedIdTransportMode;
}

// ---------------------------------------------------------------- minted references

/**
 * The wire handle for a fact, and the exact inverse of the first pass's `declarationId`.
 *
 * `declarationId` is chosen by the model and is explicitly not an identity. A `factRef` is MINTED BY
 * HAZLENZ, is enumerated in the schema, is valid only inside this one request, resolves through a
 * table this module owns, and can never collide with or impersonate a real `factKey` because it
 * never leaves the request. That is what lets this stage satisfy "no `factKey` on the wire" without
 * giving up deterministic addressing: the provider selects a token it was handed, and HazLenz --
 * not the provider -- decides which fact that token meant.
 */
export const FACT_REF_SHAPE = /^F[1-9][0-9]{0,2}$/;

export interface MintedFactRefs {
  readonly refs: readonly string[];
  readonly refToFactKey: Readonly<Record<string, string>>;
  readonly factKeyToRef: Readonly<Record<string, string>>;
}

export function mintFactRefs(facts: readonly BindingCandidateFact[]): MintedFactRefs {
  const refToFactKey: Record<string, string> = {};
  const factKeyToRef: Record<string, string> = {};
  const refs: string[] = [];
  facts.forEach((f, i) => {
    if (!FACT_KEY_SHAPE.test(f.factKey)) {
      throw new Error(`GOVERNED_BINDING_ABORT: ${JSON.stringify(f.factKey.slice(0, 64))} is not a `
        + 'legal factKey. A malformed key is refused rather than normalised, because quietly '
        + 'rewriting an identifier is how two different facts end up sharing one.');
    }
    if (factKeyToRef[f.factKey] !== undefined) {
      throw new Error(`GOVERNED_BINDING_ABORT: factKey ${f.factKey} supplied more than once. The `
        + 'projection guarantees uniqueness within an analysis; a duplicate here means the caller '
        + 'merged two analyses, and binding across that boundary is not defined.');
    }
    const ref = `F${i + 1}`;
    refs.push(ref);
    refToFactKey[ref] = f.factKey;
    factKeyToRef[f.factKey] = ref;
  });
  return { refs, refToFactKey, factKeyToRef };
}

/**
 * Whether this stage should be called at all.
 *
 * Both empty cases are answered WITHOUT a provider call, and neither is a failure. No governed
 * record means there is nothing legitimate to bind to; no projected fact means there is nothing to
 * bind. Issuing the call anyway would spend money to be told what the caller already knows, and
 * §199's empty-run safety work exists because a run that calls with nothing to do is a defect.
 */
export function stageInvocation(input: GovernedBindingStageInput): {
  shouldCall: boolean; reason: string;
} {
  if (input.governedRecords.length === 0) {
    return { shouldCall: false, reason: 'NO_GOVERNED_EVIDENCE_SUPPLIED' };
  }
  if (input.facts.length === 0) {
    return { shouldCall: false, reason: 'NO_PROJECTED_FACTS_TO_BIND' };
  }
  return { shouldCall: true, reason: 'GOVERNED_EVIDENCE_AND_AT_LEAST_ONE_FACT' };
}

// ---------------------------------------------------------------- the instruction

/**
 * The stage's system prompt.
 *
 * It is SHORT on purpose, and short for a reason that is not grammar budget: this stage has one
 * question to answer, and every additional paragraph is an additional opportunity for the coverage
 * habit §184 measured -- the failure mode of every added instruction in this programme has been a
 * model that answers more than it was asked. The prompt therefore spends most of its length telling
 * the model what NOT to do, which is the shape that has held up.
 *
 * It is a WHOLLY SEPARATE prompt, not a derivative of v15. It has to be: v15 is a hazard-analysis
 * instruction, and inserting a binding block into it would drag the whole analysis instruction into
 * a request that must not perform an analysis. The one thing it does inherit -- deliberately and
 * verbatim in effect -- is v15's prohibition on writing a regulatory citation.
 */
const BINDING_STAGE_PROMPT_LINES: readonly string[] = [
  'You are performing ONE narrow task. It is not an inspection, not a hazard analysis, and not a',
  'judgement about whether anything is safe. Another stage has already done that work.',
  '',
  'You are given a small number of UNRESOLVED FACTS that a previous stage established, and a small',
  'number of GOVERNED REGULATORY RECORDS. For each fact you say whether any of those records bears',
  'on that fact, and which.',
  '',
  '================ WHAT "BEARS ON" MEANS ================',
  '',
  'A record bears on a fact when the record speaks to the unresolved property itself — what would',
  'have to be true, what would have to be provided, or what would have to be established — so that',
  'somebody settling the fact would need to read that record. A record that merely concerns the',
  'same equipment, the same substance or the same industry does NOT bear on the fact. Neither does',
  'a record that would be relevant to some OTHER gap you can imagine in this workplace. You are not',
  'looking for gaps and you must not raise one.',
  '',
  '================ THE THREE ANSWERS ================',
  '',
  '  BINDS             at least one supplied record bears on this fact. Name every one that does,',
  '                    by its exact sourceId, and no others.',
  '',
  '  NO_BINDING        you read the supplied records and none of them bears on this fact. This is a',
  '                    normal and frequent answer. It is not a failure and it is not a lesser',
  '                    answer than BINDS.',
  '',
  '  CANNOT_DETERMINE  you cannot tell from what you were given — most often because deciding would',
  '                    need more of the original observation than you were shown. Say so. Do NOT',
  '                    guess, and do NOT choose NO_BINDING to look decisive: an honest',
  '                    CANNOT_DETERMINE tells us our own inputs were too thin, and a guess tells us',
  '                    nothing at all.',
  '',
  'ANSWER EVERY FACT EXACTLY ONCE. A fact you leave out is not read as "no binding"; it is recorded',
  'as no answer, which helps nobody.',
  '',
  '================ WHAT YOU ARE NOT DOING ================',
  '',
  'You are not deciding whether a fact is resolved, settled, covered or answered. Naming a record',
  'does not close a fact and does not reduce what is owed. You are not deciding how important a',
  'fact is, how urgent it is, or what should be done about it. You are not writing a question, a',
  'finding, a recommendation or a control. You are not adding a fact, splitting one, merging two or',
  'rewording any of them.',
  '',
  'DO NOT WRITE A REGULATORY CITATION ANYWHERE, in any field, for any reason. Reproducing a number',
  'that appeared in your input is the same violation as inventing one. Naming a record by its',
  'sourceId is the ONLY way to refer to it, and it is sufficient.',
  '',
  'Return only the structured result. Do not narrate your reasoning process.',
];

export const GOVERNED_BINDING_STAGE_SYSTEM_PROMPT: string = BINDING_STAGE_PROMPT_LINES.join('\n');

// ---------------------------------------------------------------- the user prompt

/**
 * Render the facts under their minted references.
 *
 * The `factKey` is NOT rendered. It appears nowhere in the request, in either direction, which is
 * what makes "no factKey on the wire" a property of the transport rather than a property of the
 * boundary's willingness to ignore one.
 */
export function renderBindingFacts(
  facts: readonly BindingCandidateFact[], minted: MintedFactRefs,
): string {
  const lines: string[] = ['UNRESOLVED FACTS — answer each of these exactly once'];
  facts.forEach((f, i) => {
    const ref = minted.refs[i];
    lines.push(`  - factRef: ${ref}`);
    if (f.owedProperty !== null && f.owedProperty.trim().length > 0) {
      lines.push(`      the unresolved property: ${f.owedProperty.trim()}`);
    }
    lines.push(`      decision it blocks: ${f.affectedDecision}`);
    lines.push(`      why it is not established: ${f.whyUnresolved.trim()}`);
    lines.push(`      words from the observation that show it: ${f.evidenceSpan.trim()}`);
    lines.push(`      it would be resolved either by: ${f.branchA.trim()}`);
    lines.push(`                                  or: ${f.branchB.trim()}`);
  });
  return lines.join('\n');
}

/**
 * Render the permissible ids and their text.
 *
 * The text is passed through `redactCitationTokens`, the SAME treatment v15 already applies to a
 * governed record in the first-pass user prompt. That is not belt-and-braces: this stage is
 * instructed that writing a citation is a violation, so showing it one would be setting a trap. The
 * id is what the contract needs and the id is what is exposed exactly.
 *
 * The id shape is CHECKED rather than normalised, and a duplicate is refused, for the same reason
 * the vNext renderer checks them: quietly rewriting an identifier is how two records end up sharing
 * one. `GOVERNED_SOURCE_ID_SHAPE` is imported rather than restated so there is one definition.
 */
export function renderPermissibleGovernedRecords(
  records: readonly GovernedBindingRecord[],
): string {
  const seen = new Set<string>();
  const lines: string[] = ['AVAILABLE GOVERNED EVIDENCE — these sourceIds and no others'];
  for (const r of records) {
    if (!GOVERNED_SOURCE_ID_SHAPE.test(r.sourceId)) {
      throw new Error(`GOVERNED_BINDING_ABORT: governed sourceId ${JSON.stringify(r.sourceId)} is `
        + 'not a legal id.');
    }
    if (seen.has(r.sourceId)) {
      throw new Error(`GOVERNED_BINDING_ABORT: governed sourceId ${r.sourceId} supplied twice`);
    }
    seen.add(r.sourceId);
    lines.push(`  - sourceId: ${r.sourceId}`);
    lines.push(`      text: ${redactCitationTokens(r.text)}`);
  }
  lines.push('  Copy an id character for character. There are no other permissible ids, and an id');
  lines.push('  you invent or respell is discarded along with the entry that carries it.');
  return lines.join('\n');
}

export function buildGovernedBindingUserPrompt(input: GovernedBindingStageInput): string {
  const minted = mintFactRefs(input.facts);
  return [
    `INSPECTION CONTEXT — location: ${input.inspectionContext.location}; `
    + `task: ${input.inspectionContext.task}`,
    '',
    renderBindingFacts(input.facts, minted),
    '',
    renderPermissibleGovernedRecords(input.governedRecords),
  ].join('\n');
}

// ---------------------------------------------------------------- the wire schema

/**
 * The stage's wire schema. Four properties on one item, and nothing else.
 *
 * Compare what is ABSENT against the first-pass schema this replaces a branch of: no hazard
 * candidates, no participants, no evidence quotes, no clarifications, no rationale, no
 * eleven-field declaration item, no `authoritativeSources` enum, no `EXPERT_AFFECTED_DECISIONS`
 * enum. The grammar this stage compiles to is the binding relationship and nothing else, which is
 * the structural claim Option C makes and `measureSchemaComplexity` puts a number on.
 */
export function buildGovernedBindingWireSchema(
  input: GovernedBindingStageInput,
): Record<string, unknown> {
  const minted = mintFactRefs(input.facts);
  const ids = input.governedRecords.map(r => r.sourceId);
  const transport = input.governedIdTransport ?? 'CLOSED_ENUM';
  return {
    type: 'object',
    properties: {
      bindings: {
        type: 'array',
        description: 'EXACTLY ONE entry per factRef listed in your input, in any order. A factRef '
          + 'you omit is recorded as no answer, not as "no binding".',
        items: {
          type: 'object',
          properties: {
            factRef: {
              type: 'string',
              enum: [...minted.refs],
              description: 'Which supplied fact this entry answers. Copied exactly.',
            },
            determination: {
              type: 'string',
              enum: [...BINDING_DETERMINATIONS],
              description: 'BINDS when at least one supplied record bears on this fact. NO_BINDING '
                + 'when you read them and none does — a normal and frequent answer. '
                + 'CANNOT_DETERMINE when you cannot tell from what you were given; prefer it over '
                + 'a guess.',
            },
            governedEvidenceSourceIds: {
              type: 'array',
              items: transport === 'CLOSED_ENUM'
                ? { type: 'string', enum: ids }
                : { type: 'string' },
              description: 'Every supplied sourceId that bears on this fact, and no others. EMPTY '
                + 'unless determination is BINDS. Copied character for character from AVAILABLE '
                + 'GOVERNED EVIDENCE; an invented or respelled id discards this entry.',
            },
            bearingStatement: {
              type: 'string',
              minLength: 1,
              description: 'One sentence. If BINDS, what the named record or records say that '
                + 'someone settling THIS fact would need. If NO_BINDING, what the supplied records '
                + 'are about instead. If CANNOT_DETERMINE, what you would have needed to decide. '
                + 'No regulatory citation, in any form.',
            },
          },
          required: ['factRef', 'determination', 'governedEvidenceSourceIds', 'bearingStatement'],
        },
      },
    },
    required: ['bindings'],
  };
}

// ---------------------------------------------------------------- grammar complexity

/**
 * Complexity proxies for a JSON Schema, and an explicit statement of what they are worth.
 *
 * THE PROVIDER'S METRIC IS NOT ANY OF THESE. The error names compiled grammar size; the compiler is
 * not ours, the threshold is undocumented, and no figure produced here can prove a request will be
 * accepted. What these numbers CAN do is compare two schemas along the axes the provider's own error
 * message points at -- "simplify your tool schemas" -- and support the qualitative claim that one is
 * an order of magnitude smaller than the other. `serialisedBytes` is reported LAST and deliberately
 * so, because §199 already established that a 2% byte difference separated an accepted request from
 * a rejected one and therefore that bytes are not the thing.
 *
 * `enumAlternatives` is the count that matters most: an enum of N strings is an N-way alternation in
 * the compiled grammar, and the vNext capability-PRESENT schema's regression is that it adds one.
 */
export interface SchemaComplexity {
  readonly enumConstructs: number;
  readonly enumAlternatives: number;
  readonly objectNodes: number;
  readonly propertyNodes: number;
  readonly arrayNodes: number;
  readonly requiredEntries: number;
  readonly descriptionChars: number;
  /**
   * `JSON.stringify(...).length` — UTF-16 code units, which is what §199's diagnosis reported.
   * Kept under that definition so this module's figures are directly comparable to the frozen ones
   * rather than 62 apparently-unexplained bytes away from them.
   */
  readonly serialisedChars: number;
  /**
   * The same string measured in UTF-8 bytes, which is what actually travels. It is LARGER than
   * `serialisedChars` because the descriptions contain em dashes, and the gap is the whole reason
   * both are reported: a size figure with an unstated encoding is a figure two people will disagree
   * about while both being right.
   */
  readonly serialisedBytes: number;
}

export function measureSchemaComplexity(schema: unknown): SchemaComplexity {
  let enumConstructs = 0; let enumAlternatives = 0; let objectNodes = 0;
  let propertyNodes = 0; let arrayNodes = 0; let requiredEntries = 0; let descriptionChars = 0;
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (!n || typeof n !== 'object') return;
    const o = n as Record<string, unknown>;
    if (Array.isArray(o.enum)) { enumConstructs += 1; enumAlternatives += o.enum.length; }
    if (o.type === 'object') objectNodes += 1;
    if (o.type === 'array') arrayNodes += 1;
    if (o.properties && typeof o.properties === 'object') {
      propertyNodes += Object.keys(o.properties as Record<string, unknown>).length;
    }
    if (Array.isArray(o.required)) requiredEntries += o.required.length;
    if (typeof o.description === 'string') descriptionChars += o.description.length;
    for (const v of Object.values(o)) walk(v);
  };
  walk(schema);
  const serialised = JSON.stringify(schema);
  return {
    enumConstructs,
    enumAlternatives,
    objectNodes,
    propertyNodes,
    arrayNodes,
    requiredEntries,
    descriptionChars,
    serialisedChars: serialised.length,
    serialisedBytes: Buffer.byteLength(serialised, 'utf8'),
  };
}

/** Stated in code so a later reader cannot mistake a measurement for a transport guarantee. */
export const GRAMMAR_MEASUREMENT_CLAIMS = {
  MEASURES_TWO_SCHEMAS_ON_THE_SAME_AXES: true,
  SUPPORTS_A_QUALITATIVE_ORDER_OF_MAGNITUDE_COMPARISON: true,
  IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC: false,
  PROVES_A_REQUEST_WILL_BE_ACCEPTED: false,
  KNOWS_THE_THRESHOLD: false,
} as const;

// ---------------------------------------------------------------- the boundary

export interface FactBindingRecord {
  readonly factKey: string;
  readonly factRef: string;
  readonly outcome: FactBindingOutcome;
  readonly boundGovernedSourceIds: readonly string[];
  /** Recorded for human review. NEVER an authority for anything. */
  readonly bearingStatement: string | null;
  readonly codes: readonly BindingRefusalCode[];
  readonly detail: readonly string[];
}

export interface GovernedBindingStageResult {
  readonly version: typeof GOVERNED_BINDING_STAGE_VERSION;
  readonly perFact: readonly FactBindingRecord[];
  /** Response-level refusals. When non-empty every fact is NO_DETERMINATION_RETURNED. */
  readonly responseCodes: readonly BindingRefusalCode[];
  readonly responseDetail: readonly string[];
  /** Entries naming a factRef nobody minted. Recorded, never resolved to a nearby fact. */
  readonly orphanEntries: number;
  readonly boundPairs: readonly { readonly factKey: string; readonly sourceId: string }[];
  readonly refusedCount: number;
  readonly undeterminedCount: number;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * Validate a raw stage response against the supplied closed sets.
 *
 * REFUSAL IS PER ENTRY, exactly as the projection's is and for the same reason. Each entry concerns
 * one independent fact; refusing the whole response because one entry was malformed would let a
 * defect in one binding destroy an unrelated one, which is the displacement failure this layer
 * exists to prevent. A response that is not even the right SHAPE is refused whole, because at that
 * point there are no entries to refuse individually.
 *
 * Nothing here is repaired. There is no nearest-match on a `factRef`, no case-folding on a
 * `sourceId`, and no inference of a determination from the ids that came with it. A contradiction
 * between the determination and the id list is a refusal, not a signal to pick the more likely half.
 */
export function checkGovernedBindings(
  raw: unknown, input: GovernedBindingStageInput,
): GovernedBindingStageResult {
  const minted = mintFactRefs(input.facts);
  const supplied = new Set(input.governedRecords.map(r => r.sourceId));

  const byRef = new Map<string, FactBindingRecord>();
  const undetermined = (ref: string): FactBindingRecord => ({
    factKey: minted.refToFactKey[ref],
    factRef: ref,
    outcome: 'NO_DETERMINATION_RETURNED',
    boundGovernedSourceIds: [],
    bearingStatement: null,
    codes: [],
    detail: [],
  });
  for (const ref of minted.refs) byRef.set(ref, undetermined(ref));

  const finish = (
    responseCodes: BindingRefusalCode[], responseDetail: string[], orphanEntries: number,
  ): GovernedBindingStageResult => {
    const perFact = minted.refs.map(r => byRef.get(r)!);
    const boundPairs: { factKey: string; sourceId: string }[] = [];
    for (const f of perFact) {
      for (const sid of f.boundGovernedSourceIds) boundPairs.push({ factKey: f.factKey, sourceId: sid });
    }
    return {
      version: GOVERNED_BINDING_STAGE_VERSION,
      perFact,
      responseCodes,
      responseDetail,
      orphanEntries,
      boundPairs,
      refusedCount: perFact.filter(f => f.outcome === 'REFUSED').length,
      undeterminedCount: perFact.filter(f => f.outcome === 'NO_DETERMINATION_RETURNED').length,
    };
  };

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return finish(['RESPONSE_NOT_AN_OBJECT'],
      [`response is ${Array.isArray(raw) ? 'an array' : typeof raw}`], 0);
  }
  const entries = (raw as Record<string, unknown>).bindings;
  if (!Array.isArray(entries)) {
    return finish(['BINDINGS_NOT_AN_ARRAY'], [`bindings is ${typeof entries}`], 0);
  }

  const seenRefs = new Set<string>();
  let orphanEntries = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const e = entries[i];
    const codes: BindingRefusalCode[] = [];
    const detail: string[] = [];
    const fail = (c: BindingRefusalCode, why: string): void => { codes.push(c); detail.push(why); };

    if (typeof e !== 'object' || e === null || Array.isArray(e)) {
      orphanEntries += 1;
      continue;
    }
    const entry = e as Record<string, any>;
    const ref = typeof entry.factRef === 'string' ? entry.factRef : '';

    // An entry naming nothing we minted is an ORPHAN. It is counted and dropped, never attached to
    // a fact by proximity: attaching a binding to the wrong fact is worse than losing it.
    if (!minted.refs.includes(ref)) {
      orphanEntries += 1;
      continue;
    }
    if (seenRefs.has(ref)) {
      // The first entry for a ref stands and the duplicate refuses THAT FACT. Two answers for one
      // fact is a contradiction, and picking one of them would be adjudicating the model's output.
      const prior = byRef.get(ref)!;
      byRef.set(ref, {
        ...prior,
        outcome: 'REFUSED',
        boundGovernedSourceIds: [],
        codes: [...prior.codes, 'FACT_REF_DUPLICATED'],
        detail: [...prior.detail, `${ref} was answered more than once`],
      });
      continue;
    }
    seenRefs.add(ref);

    for (const forbidden of BINDING_FORBIDDEN_FIELDS) {
      if (forbidden in entry) {
        fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
          `entry carried '${forbidden}', which only HazLenz may set`);
      }
    }

    const determination = entry.determination;
    if (!(BINDING_DETERMINATIONS as readonly string[]).includes(determination)) {
      fail('DETERMINATION_NOT_A_MEMBER', String(determination).slice(0, 48));
    }

    const ids: string[] = [];
    if (entry.governedEvidenceSourceIds === undefined
      || !Array.isArray(entry.governedEvidenceSourceIds)) {
      fail('GOVERNED_SOURCE_IDS_NOT_AN_ARRAY',
        `governedEvidenceSourceIds is ${typeof entry.governedEvidenceSourceIds}`);
    } else {
      const seenIds = new Set<string>();
      for (const gid of entry.governedEvidenceSourceIds) {
        if (typeof gid !== 'string' || !supplied.has(gid)) {
          fail('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
            `${JSON.stringify(String(gid).slice(0, 48))} is not one of the ${supplied.size} `
            + 'supplied governed sourceIds');
          continue;
        }
        if (seenIds.has(gid)) { fail('GOVERNED_SOURCE_ID_DUPLICATED', gid); continue; }
        seenIds.add(gid);
        ids.push(gid);
      }
    }

    // The determination and the id list must agree. Neither half is inferred from the other.
    if (determination === 'BINDS' && ids.length === 0 && codes.length === 0) {
      fail('BINDS_NAMES_NO_SOURCE', 'BINDS with an empty id list says nothing was bound');
    }
    if ((determination === 'NO_BINDING' || determination === 'CANNOT_DETERMINE')
      && Array.isArray(entry.governedEvidenceSourceIds)
      && entry.governedEvidenceSourceIds.length > 0) {
      fail('NON_BINDING_CARRIES_A_SOURCE',
        `${determination} carried ${entry.governedEvidenceSourceIds.length} sourceId(s)`);
    }

    if (blank(entry.bearingStatement)) fail('BEARING_STATEMENT_MISSING', 'bearingStatement is empty');

    for (const f of BINDING_FREE_TEXT_FIELDS) {
      const v = entry[f];
      if (typeof v !== 'string') continue;
      const m = CITATION_SHAPED_PATTERN.exec(v);
      if (m) {
        fail('PROHIBITED_REGULATORY_CITATION', `citation-shaped span ${JSON.stringify(m[0])} in ${f}`);
      }
    }

    const outcome: FactBindingOutcome = codes.length > 0
      ? 'REFUSED'
      : determination === 'BINDS' ? 'BOUND'
        : determination === 'NO_BINDING' ? 'NOT_BOUND' : 'CANNOT_DETERMINE';

    byRef.set(ref, {
      factKey: minted.refToFactKey[ref],
      factRef: ref,
      outcome,
      boundGovernedSourceIds: outcome === 'BOUND' ? ids : [],
      bearingStatement: typeof entry.bearingStatement === 'string' ? entry.bearingStatement : null,
      codes,
      detail,
    });
  }

  return finish([], [], orphanEntries);
}

// ---------------------------------------------------------------- the enrichment

/**
 * Apply an admitted binding to the projected facts.
 *
 * This is the ONLY thing a binding is permitted to do, and the list of what it does not do is longer
 * than the list of what it does. It attaches an `acceptableEvidence` criterion HAZLENZ ALREADY HOLDS
 * for a bound governed id -- the same lookup the projection performs when the binding arrives on the
 * declaration, moved to the stage that now produces the binding. Provenance is unchanged:
 * `HAZLENZ_TASK_STATE`, looked up, never authored here and never accepted from the provider.
 *
 * WHAT IT DOES NOT DO. It does not change `status` -- a bound fact is still `UNRESOLVED`, and
 * `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is untouched. It does not change `priority`, so a bound
 * fact cannot escalate itself past `FIRST_PASS_PROJECTED_PRIORITY`. It does not change `source`,
 * `modelAuthored`, `factKey`, the span or either branch. It does not create coverage. It does not
 * OVERWRITE a criterion the fact already carries -- an existing value came from somewhere with its
 * own authority, and silently replacing it would let a model-selected id displace it.
 *
 * The rebuilt fact is re-checked with `owedFactDefects`, so an enrichment that produced an invalid
 * fact fails loudly here instead of downstream.
 */
export interface EnrichmentOutcome {
  readonly factKey: string;
  readonly applied: boolean;
  readonly reason: 'CRITERION_ATTACHED' | 'NO_BINDING' | 'NO_CRITERION_HELD'
  | 'CRITERION_ALREADY_HELD' | 'ENRICHED_FACT_INVALID';
  readonly sourceId: string | null;
  readonly defects: readonly string[];
}

export function applyGovernedBindings(
  facts: readonly OwedFact[],
  result: GovernedBindingStageResult,
  criteriaBySourceId: Readonly<Record<string, AcceptableEvidence>> = {},
): { facts: readonly OwedFact[]; outcomes: readonly EnrichmentOutcome[] } {
  const boundByFact = new Map<string, readonly string[]>();
  for (const f of result.perFact) {
    if (f.outcome === 'BOUND') boundByFact.set(f.factKey, f.boundGovernedSourceIds);
  }

  const outcomes: EnrichmentOutcome[] = [];
  const out: OwedFact[] = [];

  for (const fact of facts) {
    const bound = boundByFact.get(fact.factKey);
    if (bound === undefined || bound.length === 0) {
      outcomes.push({ factKey: fact.factKey, applied: false, reason: 'NO_BINDING', sourceId: null, defects: [] });
      out.push(fact);
      continue;
    }
    if (fact.acceptableEvidence !== null) {
      outcomes.push({
        factKey: fact.factKey, applied: false, reason: 'CRITERION_ALREADY_HELD',
        sourceId: null, defects: [],
      });
      out.push(fact);
      continue;
    }
    // First bound id HazLenz holds a criterion for, in the order the model named them.
    // Deterministic, and nothing MERGES two criteria, because merging would author a third.
    const sourceId = bound.find(id => criteriaBySourceId[id] !== undefined) ?? null;
    if (sourceId === null) {
      outcomes.push({
        factKey: fact.factKey, applied: false, reason: 'NO_CRITERION_HELD', sourceId: null, defects: [],
      });
      out.push(fact);
      continue;
    }
    const enriched: OwedFact = { ...fact, acceptableEvidence: criteriaBySourceId[sourceId] };
    const defects = owedFactDefects(enriched);
    if (defects.length > 0) {
      outcomes.push({
        factKey: fact.factKey, applied: false, reason: 'ENRICHED_FACT_INVALID', sourceId, defects,
      });
      out.push(fact);
      continue;
    }
    outcomes.push({
      factKey: fact.factKey, applied: true, reason: 'CRITERION_ATTACHED', sourceId, defects: [],
    });
    out.push(enriched);
  }
  return { facts: out, outcomes };
}

/** Asserted by the suite: the stage creates no coverage, no settlement and no authority. */
export function governedBindingStageEffect(): {
  factsMayBeSettled: false; coverageMayChange: false; priorityMayChange: false;
  citationsMayBeCreated: false; regulatoryTruthMayBeCreated: false; factsMayBeAdded: false;
  factsMayBeRemoved: false; questionWordingMayBeInvented: false;
} {
  return {
    factsMayBeSettled: false, coverageMayChange: false, priorityMayChange: false,
    citationsMayBeCreated: false, regulatoryTruthMayBeCreated: false, factsMayBeAdded: false,
    factsMayBeRemoved: false, questionWordingMayBeInvented: false,
  };
}

// ---------------------------------------------------------------- what is owed elsewhere

/**
 * What this stage NEEDS from work that is not this stage's, stated so it is not quietly absorbed.
 *
 * `owedProperty` is the sharp one. `OwedFact` has no field for the unresolved property itself --
 * §196 recorded that as a residual and preserved `declaration.missingFact` on the declaration record
 * rather than folding it into `whyUnresolved`, which would have been composition and therefore
 * invention. THIS STAGE IS THE FIRST CONSUMER THAT GENUINELY NEEDS IT: deciding whether a governed
 * record bears on a fact is exactly a question about the property. The prototype takes it as a
 * nullable input from the caller and degrades to `whyUnresolved` plus the branches when it is
 * absent, but that is a workaround for a representation gap, not a resolution of one, and the gap
 * belongs to whoever owns `OwedFact`'s representation.
 */
export const STAGE_DEPENDENCIES: readonly string[] = [
  'OwedFact has no field for the owed property; this stage needs it and takes it as a nullable '
  + 'caller-supplied string sourced from declaration.missingFact. Resolving that representation gap '
  + 'is not this stage\'s work and must not be done by folding the property into whyUnresolved.',
  'the harness must retain the declaration records alongside the projected facts, so that '
  + 'missingFact survives projection and can be handed to this stage',
  'a per-stage entry in the pre-inference circuit breaker keyed on '
  + 'GOVERNED_BINDING_REQUEST_CONTRACT_ID, so a rejection of THIS schema never joins a first-pass '
  + 'rejection streak and vice versa',
];

/** What this stage does not solve. Reported, not buried. */
export const STAGE_RESIDUAL_LIMITS: readonly string[] = [
  'the analysis is no longer atomic: it is two provider calls, and the second can fail after the '
  + 'first succeeded. A fact whose binding call failed is a fact with no binding, which is the same '
  + 'state as a fact nothing bore on — so the outcome vocabulary keeps them apart '
  + '(NO_DETERMINATION_RETURNED) and any harness must persist that distinction',
  'the stage sees the evidence span and not the whole observation, so a record whose applicability '
  + 'turns on context outside the span cannot be judged. CANNOT_DETERMINE exists for exactly that '
  + 'case and its rate is the measurement that would tell us the packet is too thin',
  'whether a record ACTUALLY bears on a fact is a semantic judgement. Nothing here checks it, the '
  + 'boundary never claims to, and an admitted binding is a well-formed binding and not a correct '
  + 'one',
  'no figure produced by measureSchemaComplexity proves this schema will be accepted by the '
  + 'provider; the threshold is undocumented and only a hosted single-row canary can establish it',
  'a second call costs a second latency and a second failure mode on every governed row; on rows '
  + 'with no governed evidence the stage is not called at all and costs nothing',
];

export { FACT_KEY_SHAPE, GOVERNED_SOURCE_ID_SHAPE };
