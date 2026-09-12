/**
 * §202 EXPERT HAZLENZ -- THE GOVERNED-BINDING STAGE CONTRACT.
 *
 * BOUNDED DEVELOPMENT INTEGRATION. NOT REACHABLE FROM PRODUCTION. NOT ENABLED.
 * ZERO PROVIDER CALLS, ZERO DATABASE ACCESS. NOTHING HERE IS WIRED INTO ANY ACTIVE PATH:
 * nothing under `backend/src/` imports this module, and the only caller is
 * `expert-202-governed-stage-pipeline.ts`, whose provider call is a CALLER-SUPPLIED FUNCTION that
 * the §202 suite never populates.
 *
 * ==================== WHAT §202 IS, RELATIVE TO §201 ====================
 *
 * §201 built the stage as a PROTOTYPE and proved 59 boundary properties. §202 turns it into a
 * bounded development integration and does four things the prototype did not:
 *
 *   1. IT SEALS FACT IDENTITY BEFORE THE REQUEST IS BUILT, and the boundary REFUSES a response
 *      validated against a fact set that is not the sealed one. §201 argued that identity precedes
 *      nomination; §202 makes it a checked property with a stated limit (see `IDENTITY_SEAL_CLAIMS`).
 *
 *   2. IT CLOSES A REAL GAP IN §201's FORBIDDEN-FIELD LIST. §201 refuses `factKey` and the 30 names
 *      in `PROVIDER_FORBIDDEN_OWED_FACT_FIELDS` + `FORBIDDEN_EXPERT_FIELD_NAMES`. Those lists do NOT
 *      contain `affectedDecision`, `branchA`, `branchB`, `decisionIfA`, `decisionIfB`,
 *      `evidenceSpan` or `whyUnresolved` -- the fields that carry the fact's SEMANTICS. §201 relies
 *      on `additionalProperties: false` for those, and §198's own finding is that a guarantee which
 *      lives only in the transport is not a guarantee on the hosted path. §202 names them.
 *
 *   3. IT DEFINES A STAGE-SPECIFIC GOVERNED-TEXT / CITATION AUTHORITY CONTRACT, because the product
 *      owner asked whether a SEPARATE stage inherits the first pass's citation-production
 *      prohibition. See `GOVERNED_TEXT_EXPOSURE` below. The conclusion is that it does not inherit
 *      it automatically -- but the default is unchanged and the alternative is gated.
 *
 *   4. IT REFUSES ANY RETURNED GOVERNED TEXT. The wire has no field for a record's text in either
 *      direction, so a `sourceId`/`text` pair cannot be misstated by the provider: HazLenz holds the
 *      pairing and the provider only ever names an id.
 *
 * §202 does NOT import §201. It is a standalone boundary, and the §202 suite asserts DIFFERENTIAL
 * AGREEMENT with §201's boundary in the default exposure mode over a fixture battery, so "§202 is
 * §201 plus the four additions" is a checked claim rather than a comment. It does not import
 * Agent B2's grammar-identity module either, by the §202 file-ownership map.
 *
 * ==================== WHAT §202 DELIBERATELY DOES NOT DECIDE ====================
 *
 * The final `OwedFact` representation decision (whether the owed property gets a field of its own)
 * and the final escalation-policy decision are BOTH withheld from §202 by the authorization.
 * `STAGE_202_WITHHELD_DECISIONS` records them so they are not quietly absorbed. This module takes
 * the owed property as a nullable caller-supplied string exactly as §201 did, which is a workaround
 * for a representation gap and not a resolution of one.
 */

import { createHash } from 'crypto';

import {
  type AcceptableEvidence, type OwedFact, type OwedFactAffectedDecision,
  PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact.types';
import { owedFactDefects } from '../../src/safescope-v2/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  CITATION_SHAPED_PATTERN, FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { redactCitationTokens } from '../../src/safescope-v2/expert-hazlenz/expert-prompt';
import { decideCitationReuse, type CitationReuseVerdict } from './expert-governed-citation-reuse';
import { GOVERNED_SOURCE_ID_SHAPE } from './expert-first-pass-instruction-vnext';
import { FACT_KEY_SHAPE } from './expert-first-pass-owed-fact-projection';

export const GOVERNED_BINDING_CONTRACT_202_VERSION =
  'hazlenz.expert.governed-binding-contract.202.development.v1' as const;

/**
 * The request-contract identity a pre-inference circuit breaker keys on.
 *
 * Deliberately DIFFERENT from the first pass's and from §201's, because a rejection of THIS
 * schema and a rejection of either of those are different problems and must never share a streak.
 */
export const GOVERNED_BINDING_202_REQUEST_CONTRACT_ID =
  'hazlenz.expert.governed-binding-stage.202.v1.request' as const;

/** Stated in code so no reader has to infer it from the directory this file lives in. */
export const STAGE_202_ACTIVATION = {
  REACHABLE_FROM_THE_CUSTOMER_PATH: false,
  REACHABLE_FROM_THE_ACTIVE_EXPERT_PATH: false,
  IMPORTED_BY_ANYTHING_UNDER_SRC: false,
  ISSUES_A_PROVIDER_CALL_OF_ITS_OWN: false,
  MODIFIES_ANY_EXISTING_FILE: false,
} as const;

/** Explicitly withheld from §202 by the authorization. Recorded, not absorbed. */
export const STAGE_202_WITHHELD_DECISIONS: readonly string[] = [
  'the final OwedFact representation decision — whether the owed property gains a field of its own. '
  + '§202 takes it as a nullable caller-supplied string sourced from declaration.missingFact and '
  + 'degrades without it, exactly as §201 did. That is a workaround, not a resolution.',
  'the final escalation policy — whether a first-pass projected fact may ever leave '
  + 'FIRST_PASS_PROJECTED_PRIORITY. §202 never changes priority and never escalates to '
  + 'UNRESOLVED_SAFETY_STATE, which preserves the question rather than answering it.',
  'any §199 semantic verdict. No fixture in the §202 suite asserts that any binding is CORRECT, '
  + 'PARTIALLY_CORRECT, INCORRECT, AMBIGUOUS or a TRUTH_SPECIFICATION_DEFECT.',
];

// ================================================================ THE AUTHORITY CONTRACT

/**
 * What the model may do at this stage, exhaustively, and what it may not. As DATA, so the suite and
 * the memo read one table rather than two hand-kept copies of it.
 *
 * The permitted list is four entries long and every one of them is a SELECTION FROM A CLOSED SET
 * HAZLENZ SUPPLIED, except the last, which is one sentence recorded for human review that is never
 * an authority for anything.
 */
export const GOVERNED_STAGE_202_PERMITTED_AUTHORITY: readonly string[] = [
  'SELECT one HazLenz-minted fact reference from the closed set enumerated in this request',
  'DECLARE one of three determinations from a closed vocabulary',
  'SELECT zero or more sourceIds from the closed set of governed records HazLenz supplied',
  'WRITE one bearing sentence, recorded for human review, which is NEVER an authority',
];

/**
 * The exhaustive prohibition list from the §202 authorization, each paired with the mechanism that
 * makes it deterministic rather than instructed. "PROMPT" alone never appears: every row names a
 * structural mechanism, because §197 established that an instruction the transport does not enforce
 * is not enforcement.
 */
export const GOVERNED_STAGE_202_FORBIDDEN_AUTHORITY = [
  {
    forbidden: 'author factKey',
    mechanism: 'no factKey property exists on the wire in either direction; the model addresses a '
      + 'fact by a HazLenz-minted request-scoped reference; `factKey` heads the forbidden-field list '
      + 'and refuses the entry with a countable code',
  },
  {
    forbidden: 'change fact identity',
    mechanism: 'identity is computed by the projection and SEALED before the request is built; the '
      + 'boundary refuses a response validated against any other fact set (IDENTITY_SEAL_MISMATCH)',
  },
  {
    forbidden: 'invent evidence sources',
    mechanism: 'exact string membership in the supplied set, checked at the boundary and not only '
      + 'in the transport enum; a respelled id is refused rather than normalised',
  },
  {
    forbidden: 'settle a fact',
    mechanism: 'no status/settled/resolved/covered field on the wire, all four in the forbidden '
      + 'list, and the enrichment never writes status — a bound fact stays UNRESOLVED',
  },
  {
    forbidden: 'change priority',
    mechanism: '`priority` is on the wire nowhere and in the forbidden list; the enrichment copies '
      + 'priority unchanged from the projected fact',
  },
  {
    forbidden: 'escalate UNRESOLVED_SAFETY_STATE',
    mechanism: 'the stage has no field, no vocabulary member and no enrichment path that writes a '
      + 'priority or a gate state; escalation policy is withheld from §202 entirely',
  },
  {
    forbidden: 'change affectedDecision',
    mechanism: '`affectedDecision` is in GOVERNED_STAGE_202_FORBIDDEN_FIELDS — a §202 addition, '
      + 'because §201 left it to additionalProperties alone',
  },
  {
    forbidden: 'rewrite branch semantics',
    mechanism: 'branchA/branchB/decisionIfA/decisionIfB/decisionDivergence are all in the §202 '
      + 'forbidden-field list, and the enrichment copies every one of them unchanged',
  },
  {
    forbidden: 'alter the owed property',
    mechanism: '`missingFact` and `owedProperty` are in the §202 forbidden-field list; the owed '
      + 'property travels INTO the request as context and has no return field',
  },
  {
    forbidden: 'fabricate governed text',
    mechanism: 'there is no text-bearing return field at all; text/sourceText/governedText/quote/'
      + 'regulatoryText/approvedText are refused by name, so a sourceId/text pair cannot be '
      + 'misstated — HazLenz holds the pairing and the provider only ever names an id',
  },
  {
    forbidden: 'introduce citation authority that was not supplied',
    mechanism: 'in the default REDACTED exposure every citation-shaped span refuses the entry; in '
      + 'the gated SUPPLIED_VERBATIM exposure a token is admitted only on exact equality with a '
      + 'token present in a SUPPLIED record, and any other token raises '
      + 'UNAUTHORISED_REGULATORY_CITATION',
  },
] as const;

// ================================================================ GOVERNED TEXT AND CITATIONS

/**
 * ============ THE OPEN QUESTION THE PRODUCT OWNER ASKED §202 TO RE-EVALUATE ============
 *
 * "Because this is a SEPARATE stage, determine whether it can receive the actual authorized
 * governed evidence TEXT without inheriting the first-pass v15 citation-production prohibition."
 *
 * THE ENGINEERING FINDING, from repository evidence rather than from precedent.
 *
 * The first-pass restriction is not a property of governed evidence. It is a property of TWO
 * ARTIFACTS THAT ARE NOT IN THIS STAGE'S PATH:
 *
 *   (a) v15's HARD PROHIBITIONS block, which lives in `EXPERT_SYSTEM_PROMPT` and tells the FIRST
 *       PASS that reproducing a number from its own input is the same violation as inventing one.
 *       This stage does not use `EXPERT_SYSTEM_PROMPT`. Its prompt is authored here, from nothing.
 *
 *   (b) §196's projection boundary, which refuses a citation-shaped string in a DECLARATION field.
 *       This stage emits no declaration and the projection never sees its output.
 *
 * §198's own comment records WHY the first pass is shown redacted text, and the reason is
 * conditional, not categorical: "a first pass shown a citation could only be punished for repeating
 * it." That argument is downstream of the OUTPUT prohibition. Remove the output prohibition and the
 * input argument does not survive on its own.
 *
 * The repository also already contains the counter-example: the VERIFIER path receives governed
 * evidence text WITH ITS CITATIONS INTACT (`V3_3SuppliedGovernedEvidence.text`) and admits faithful
 * reuse under `decideCitationReuse`. So "a stage may see governed text unredacted" is not novel here
 * and needs no new principle. It needs an admission rule, and one already exists and is frozen.
 *
 * CONCLUSION: the first-pass prohibition does NOT automatically apply to a separate stage. That is
 * an engineering finding and it is checkable.
 *
 * WHAT §202 THEREFORE BUILDS, AND WHAT IT REFUSES TO DECIDE.
 *
 * §202 implements BOTH exposures and defaults to REDACTED, which is byte-for-byte the §198/§201
 * posture and changes nothing. `SUPPLIED_VERBATIM` exists, is fully enforced, and CANNOT BE
 * ACTIVATED SILENTLY: building a request in that mode without an explicit ruling reference throws.
 * The reason is not engineering caution. Changing what regulatory content is transmitted to a
 * provider is a containment-posture change, and §198's authorization treated citation containment
 * outside the authorized supplied evidence as a product-owner-governed surface. An engineer may
 * establish that a rule does not apply; only the product owner may decide to stop applying it.
 * See AUTHORIZATION REQUIRED in `…/GOVERNED-STAGE-INTEGRATION.md`.
 *
 * WHAT IS NOT WEAKENED. Verifier v3.3 is untouched: it is a different admission function on a
 * different stage, §202 imports only the pure `decideCitationReuse` helper it already used, and
 * `checkVerifierV3_3Output`'s exact supplied-source containment is not called, wrapped or relaxed
 * anywhere in this module.
 */
export const GOVERNED_TEXT_EXPOSURE_MODES = ['REDACTED', 'SUPPLIED_VERBATIM'] as const;
export type GovernedTextExposureMode = (typeof GOVERNED_TEXT_EXPOSURE_MODES)[number];

/** Unchanged from §198 and §201. A caller that says nothing gets the posture that already exists. */
export const DEFAULT_GOVERNED_TEXT_EXPOSURE: GovernedTextExposureMode = 'REDACTED';

export const GOVERNED_TEXT_EXPOSURE_CONCLUSIONS = {
  /** Established from repository evidence: the restriction lives in v15's prompt and §196's
   *  projection, neither of which is in this stage's path. */
  FIRST_PASS_PROHIBITION_AUTOMATICALLY_APPLIES_TO_A_SEPARATE_STAGE: false,
  /** The stage-specific contract below is what replaces it, not nothing. */
  A_STAGE_SPECIFIC_CITATION_AUTHORITY_CONTRACT_IS_REQUIRED: true,
  /** Both modes are implemented and enforced. */
  SUPPLIED_VERBATIM_IS_IMPLEMENTED: true,
  /** But the default does not move, and the alternative is gated. */
  SUPPLIED_VERBATIM_IS_THE_DEFAULT: false,
  ACTIVATING_SUPPLIED_VERBATIM_NEEDS_A_PRODUCT_OWNER_RULING: true,
  /** Nothing here calls, wraps, relaxes or re-implements the verifier's admission. */
  VERIFIER_V3_3_EXACT_SUPPLIED_SOURCE_CONTAINMENT_IS_WEAKENED: false,
} as const;

/** The stage-specific citation/output authority contract, as data. */
export const STAGE_202_CITATION_AUTHORITY = {
  ADMITTED_UNIT: 'a citation identifier matched by CITATION_TOKEN_PATTERN, and nothing else',
  AUTHORISED_SET: 'the citation tokens present verbatim in the governed records SUPPLIED WITH THIS '
    + 'REQUEST. Not a declared reliance, not a retrieved record, not a remembered one — the closed '
    + 'supplied set itself, which is a STRICTLY NARROWER authorisation than verifier v3.3 grants.',
  IN_REDACTED_MODE: 'every citation-shaped span in the bearing statement refuses the entry, '
    + 'unchanged from §201',
  IN_SUPPLIED_VERBATIM_MODE: 'a token present verbatim in a supplied record is admitted as '
    + 'reproduction of supplied text; ANY other token raises UNAUTHORISED_REGULATORY_CITATION and '
    + 'refuses the entry',
  SYNTHESISING_EXTERNAL_AUTHORITY_IS_PERMITTED: false,
  CREATES_A_QUOTATION_LENGTH_LICENCE: false,
  MAKES_A_BINDING_CORRECT: false,
} as const;

// ================================================================ CLOSED VOCABULARIES

/**
 * Three answers rather than a boolean, for the reason §201 gave and §202 keeps: "none of these
 * records bears on this fact" is a substantive negative result, and "I cannot tell from what you
 * gave me" is evidence that our own evidence packet is wrong. Merging them hides the only signal
 * that would ever tell us the packet was too thin.
 */
export const BINDING_DETERMINATIONS_202 = ['BINDS', 'NO_BINDING', 'CANNOT_DETERMINE'] as const;
export type BindingDetermination202 = (typeof BINDING_DETERMINATIONS_202)[number];

/** Per-fact outcomes. Two of these five never come from the model. */
export const FACT_BINDING_OUTCOMES_202 = [
  'BOUND',
  'NOT_BOUND',
  'CANNOT_DETERMINE',
  /** The entry for this fact was refused by the boundary. No binding, and NOT a negative result. */
  'REFUSED',
  /** No entry named this fact at all. Distinct from NOT_BOUND, on purpose. */
  'NO_DETERMINATION_RETURNED',
] as const;
export type FactBindingOutcome202 = (typeof FACT_BINDING_OUTCOMES_202)[number];

export const BINDING_REFUSAL_CODES_202 = [
  'RESPONSE_NOT_AN_OBJECT',
  'BINDINGS_NOT_AN_ARRAY',
  /** §202. The fact set validated is not the fact set that was sealed before the request. */
  'IDENTITY_SEAL_MISMATCH',
  'FACT_REF_DUPLICATED',
  'DETERMINATION_NOT_A_MEMBER',
  'GOVERNED_SOURCE_IDS_NOT_AN_ARRAY',
  'GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
  'GOVERNED_SOURCE_ID_DUPLICATED',
  'BINDS_NAMES_NO_SOURCE',
  'NON_BINDING_CARRIES_A_SOURCE',
  'BEARING_STATEMENT_MISSING',
  'PROHIBITED_REGULATORY_CITATION',
  /** §202. Raised in SUPPLIED_VERBATIM mode for a token no supplied record contains. */
  'UNAUTHORISED_REGULATORY_CITATION',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
] as const;
export type BindingRefusalCode202 = (typeof BINDING_REFUSAL_CODES_202)[number];

/**
 * §202's addition to §201's list: the fields that carry the FACT'S OWN SEMANTICS.
 *
 * §201's `BINDING_FORBIDDEN_FIELDS` is `['factKey', ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
 * ...FORBIDDEN_EXPERT_FIELD_NAMES]`. Neither of those two lists contains `affectedDecision`,
 * `branchA`, `branchB`, `decisionIfA`, `decisionIfB`, `decisionDivergence`, `evidenceSpan` or
 * `whyUnresolved` — so a response carrying one was refused only by `additionalProperties: false`.
 * §197 is the reason that is not enough: a schema keyword the provider does not honour leaves the
 * boundary as the only real protection, and the boundary was not looking.
 *
 * The text-return names are here for a different reason. There is no field for a governed record's
 * TEXT on the wire, in either direction, which is what makes an incorrect sourceId/text pairing
 * structurally impossible: HazLenz holds the pairing in a map it built and the provider only ever
 * names an id. Refusing the names as well means a provider that invents one is COUNTED rather than
 * silently ignored, which is the difference between a measurement and a shrug.
 */
export const GOVERNED_STAGE_202_SEMANTIC_FIELDS: readonly string[] = [
  'factKey', 'affectedDecision', 'evidenceSpan', 'whyUnresolved',
  'branchA', 'branchB', 'decisionIfA', 'decisionIfB', 'decisionDivergence',
  'missingFact', 'owedProperty', 'declarationId', 'notEstablishedBecause', 'whyNecessaryNow',
  'observationSpan', 'observationSourceId',
];

export const GOVERNED_STAGE_202_TEXT_RETURN_FIELDS: readonly string[] = [
  'text', 'sourceText', 'governedText', 'quote', 'quotation', 'regulatoryText', 'approvedText',
  'recordText', 'evidenceText',
];

export const GOVERNED_STAGE_202_FORBIDDEN_FIELDS: readonly string[] = [
  ...new Set<string>([
    ...GOVERNED_STAGE_202_SEMANTIC_FIELDS,
    ...GOVERNED_STAGE_202_TEXT_RETURN_FIELDS,
    ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
    ...FORBIDDEN_EXPERT_FIELD_NAMES,
  ]),
];

/** The one free-text field, scanned exactly as every other free-text field in the programme is. */
export const BINDING_FREE_TEXT_FIELDS_202 = ['bearingStatement'] as const;

/**
 * Duplicate handling, stated as an explicit deterministic rule rather than left to be inferred.
 *
 * The §202 authorization asks that duplicates be "rejected or normalized only per an explicit
 * deterministic rule". Every case below REJECTS. Nothing is normalised anywhere, because quietly
 * rewriting an identifier is how two different things end up sharing one.
 */
export const DUPLICATE_HANDLING_RULES = [
  {
    where: 'the SUPPLIED governed record set',
    rule: 'ABORT the whole stage. A caller that supplied one id twice has an inconsistent input and '
      + 'the request is never built.',
    code: 'GOVERNED_BINDING_202_ABORT (thrown)',
  },
  {
    where: 'the SUPPLIED fact set (duplicate factKey)',
    rule: 'ABORT minting. The projection guarantees uniqueness within an analysis, so a duplicate '
      + 'means two analyses were merged, and binding across that boundary is not defined.',
    code: 'GOVERNED_BINDING_202_ABORT (thrown)',
  },
  {
    where: 'sourceIds WITHIN one returned entry',
    rule: 'REFUSE that entry. The duplicate is not de-duplicated into a single binding.',
    code: 'GOVERNED_SOURCE_ID_DUPLICATED',
  },
  {
    where: 'two returned entries naming the SAME factRef',
    rule: 'REFUSE THAT FACT. Two answers for one fact is a contradiction, and picking one of them '
      + 'would be adjudicating the model output rather than validating it. The first entry does not '
      + '"win".',
    code: 'FACT_REF_DUPLICATED',
  },
  {
    where: 'a returned entry naming a factRef nobody minted',
    rule: 'COUNT IT AS AN ORPHAN and drop it. Never reattached to a nearby fact by proximity: '
      + 'attaching a binding to the wrong fact is worse than losing it.',
    code: '(counted in orphanEntries, no per-fact code)',
  },
] as const;

/**
 * Isolation is PART OF THE CONTRACT, stated explicitly because the §202 authorization asked for an
 * explicit answer.
 *
 * Refusal is PER ENTRY. Each entry concerns one independent fact; refusing the whole response
 * because one entry was malformed would let a defect in one binding destroy an unrelated one, which
 * is the displacement failure the owed-fact layer exists to prevent. A response that is not even the
 * right SHAPE is refused whole, because at that point there are no entries to refuse individually —
 * and every fact then becomes NO_DETERMINATION_RETURNED rather than NOT_BOUND.
 */
export const ENTRY_ISOLATION_IS_PART_OF_THE_CONTRACT = true as const;

// ================================================================ INPUT SIDE

export interface Governed202Record {
  readonly sourceId: string;
  /** The governed record's text as HazLenz holds it. Never re-fetched, never returned. */
  readonly text: string;
}

/**
 * The minimum a binding judgement needs. Identical to §201's, deliberately: §201 reasoned the
 * inclusions and the exclusions out at length and §202 found no evidence to revisit any of them.
 *
 * DELIBERATELY EXCLUDED and worth restating, because both exclusions bear on authority:
 *   decisionDivergence   action content invites an action-flavoured judgement — "this fact matters
 *                        enough to escalate". This stage has no escalation authority and is not
 *                        given the material to reason about escalation with.
 *   priority / status    HazLenz task state; showing them invites echoing them back.
 *   the full observation so the stage cannot re-open the first pass's analysis or find a SECOND gap
 *                        it was not asked about. The cost is real and CANNOT_DETERMINE measures it.
 */
export interface BindingCandidateFact202 {
  readonly factKey: string;
  /** From `declaration.missingFact`, where the harness kept it. Nullable — see WITHHELD DECISIONS. */
  readonly owedProperty: string | null;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly evidenceSpan: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
}

export const GOVERNED_ID_TRANSPORT_MODES_202 = ['CLOSED_ENUM', 'PLAIN_STRING'] as const;
export type GovernedIdTransportMode202 = (typeof GOVERNED_ID_TRANSPORT_MODES_202)[number];

// ================================================================ IDENTITY SEAL

/**
 * The seal, and an exact statement of what it proves.
 *
 * The §202 authorization requires deterministic code to verify that "fact identity was computed
 * before or independently of provider nomination". A comment cannot verify that. The seal can
 * verify most of it:
 *
 *   `sealFactIdentities` is called by the pipeline BEFORE the request is built, over the projected
 *   facts, and produces a digest of the analysis id and the ordered computed keys. The boundary
 *   requires the seal and refuses the whole response if the fact set it is validating does not
 *   reproduce that digest.
 *
 * WHAT THAT PROVES: the facts the response is scored against are byte-identical to the facts that
 * existed when the request was built, in the same order; and no factKey in any result was
 * introduced after the request. Combined with the pipeline's own call structure — where the
 * nomination function is handed a REQUEST and never the facts — it also proves ordering for
 * anything that goes through the pipeline.
 *
 * WHAT IT DOES NOT PROVE, stated rather than implied: a caller who bypasses the pipeline could seal
 * a fact set it assembled after seeing a response. The seal is not a clock. It closes the accidental
 * failure — a harness that rebuilt or re-ordered its fact list between the two calls — and it makes
 * the deliberate one require an obvious, deliberate act.
 */
export const IDENTITY_SEAL_CLAIMS = {
  THE_SCORED_FACT_SET_IS_THE_REQUESTED_FACT_SET: true,
  NO_FACT_KEY_WAS_INTRODUCED_AFTER_THE_REQUEST_WAS_BUILT: true,
  ORDERING_IS_PROVEN_FOR_ANYTHING_ROUTED_THROUGH_THE_PIPELINE: true,
  THE_SEAL_IS_A_CLOCK: false,
  A_CALLER_BYPASSING_THE_PIPELINE_CANNOT_RESEAL: false,
} as const;

export interface FactIdentitySeal {
  readonly sealedBefore: 'ANY_PROVIDER_NOMINATION';
  readonly analysisId: string;
  readonly factKeys: readonly string[];
  readonly digest: string;
}

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

function identityDigest(analysisId: string, factKeys: readonly string[]): string {
  return sha256([
    GOVERNED_BINDING_CONTRACT_202_VERSION,
    analysisId,
    ...factKeys,
  ].join('\u0000'));
}

export function sealFactIdentities(
  analysisId: string, facts: readonly BindingCandidateFact202[],
): FactIdentitySeal {
  const factKeys = facts.map(f => f.factKey);
  return {
    sealedBefore: 'ANY_PROVIDER_NOMINATION',
    analysisId,
    factKeys,
    digest: identityDigest(analysisId, factKeys),
  };
}

export interface Governed202StageInput {
  readonly analysisId: string;
  /** Projected, UNRESOLVED facts. Order fixes the minted references and therefore the schema. */
  readonly facts: readonly BindingCandidateFact202[];
  /** The closed set of permissible ids, with the text HazLenz holds for each. */
  readonly governedRecords: readonly Governed202Record[];
  readonly inspectionContext: { readonly location: string; readonly task: string };
  readonly governedIdTransport?: GovernedIdTransportMode202;
  /** Defaults to REDACTED. SUPPLIED_VERBATIM additionally requires `verbatimExposureRuling`. */
  readonly governedTextExposure?: GovernedTextExposureMode;
  /**
   * The product-owner ruling that authorises SUPPLIED_VERBATIM, as a free-form reference somebody
   * can look up. There is no default and there is no boolean: an authorization that can be satisfied
   * by `true` is an authorization nobody had to obtain.
   */
  readonly verbatimExposureRuling?: string | null;
  /** Produced by `sealFactIdentities` BEFORE the request was built. */
  readonly identitySeal: FactIdentitySeal;
}

export function exposureOf(input: Governed202StageInput): GovernedTextExposureMode {
  return input.governedTextExposure ?? DEFAULT_GOVERNED_TEXT_EXPOSURE;
}

/**
 * The gate on the non-default exposure. Throws rather than falling back, because a silent fallback
 * to the safer mode would let a caller believe it had the other one.
 */
export function assertExposureAuthorised(input: Governed202StageInput): void {
  if (exposureOf(input) !== 'SUPPLIED_VERBATIM') return;
  const ruling = input.verbatimExposureRuling;
  if (typeof ruling !== 'string' || ruling.trim().length === 0) {
    throw new Error('GOVERNED_BINDING_202_ABORT: governedTextExposure=SUPPLIED_VERBATIM changes '
      + 'what regulatory content is transmitted to a provider. That is a containment-posture '
      + 'decision the product owner owns, not an engineering default. Supply '
      + '`verbatimExposureRuling` naming the ruling, or use the REDACTED default.');
  }
}

// ================================================================ MINTED REFERENCES

/**
 * The wire handle for a fact, and the exact inverse of the first pass's `declarationId`.
 *
 * `declarationId` is chosen by the model and is explicitly not an identity. A `factRef` is MINTED BY
 * HAZLENZ, is enumerated in the schema, is valid only inside this one request, resolves through a
 * table this module owns, and can never collide with or impersonate a real `factKey` because the
 * computed key never leaves this process. That is what lets the stage satisfy "no factKey on the
 * wire" without giving up deterministic addressing.
 */
export const FACT_REF_SHAPE_202 = /^F[1-9][0-9]{0,2}$/;

export interface MintedFactRefs202 {
  readonly refs: readonly string[];
  readonly refToFactKey: Readonly<Record<string, string>>;
  readonly factKeyToRef: Readonly<Record<string, string>>;
}

export function mintFactRefs202(
  facts: readonly BindingCandidateFact202[],
): MintedFactRefs202 {
  const refToFactKey: Record<string, string> = {};
  const factKeyToRef: Record<string, string> = {};
  const refs: string[] = [];
  facts.forEach((f, i) => {
    if (typeof f.factKey !== 'string' || !FACT_KEY_SHAPE.test(f.factKey)) {
      throw new Error(`GOVERNED_BINDING_202_ABORT: ${JSON.stringify(String(f.factKey).slice(0, 64))}`
        + ' is not a legal factKey. A malformed key is refused rather than normalised, because '
        + 'quietly rewriting an identifier is how two different facts end up sharing one.');
    }
    if (factKeyToRef[f.factKey] !== undefined) {
      throw new Error(`GOVERNED_BINDING_202_ABORT: factKey ${f.factKey} supplied more than once. `
        + 'The projection guarantees uniqueness within an analysis; a duplicate here means the '
        + 'caller merged two analyses, and binding across that boundary is not defined.');
    }
    const ref = `F${i + 1}`;
    refs.push(ref);
    refToFactKey[ref] = f.factKey;
    factKeyToRef[f.factKey] = ref;
  });
  return { refs, refToFactKey, factKeyToRef };
}

/**
 * The supplied governed set, checked and indexed. This is the ONLY place a sourceId is paired with
 * a text, and the pairing is HazLenz's: nothing on the wire can restate it.
 */
export function indexSuppliedRecords(
  records: readonly Governed202Record[],
): Readonly<Record<string, string>> {
  const byId: Record<string, string> = {};
  for (const r of records) {
    if (typeof r.sourceId !== 'string' || !GOVERNED_SOURCE_ID_SHAPE.test(r.sourceId)) {
      throw new Error('GOVERNED_BINDING_202_ABORT: governed sourceId '
        + `${JSON.stringify(String(r.sourceId).slice(0, 64))} is not a legal id. It is refused `
        + 'rather than normalised.');
    }
    if (byId[r.sourceId] !== undefined) {
      throw new Error(`GOVERNED_BINDING_202_ABORT: governed sourceId ${r.sourceId} supplied twice`);
    }
    if (typeof r.text !== 'string' || r.text.trim().length === 0) {
      throw new Error(`GOVERNED_BINDING_202_ABORT: governed record ${r.sourceId} has no text. A `
        + 'record the stage cannot show is a record it cannot judge.');
    }
    byId[r.sourceId] = r.text;
  }
  return byId;
}

/**
 * Whether the stage should be called at all.
 *
 * Both empty cases are answered WITHOUT a provider call and neither is a failure. No governed record
 * means there is nothing legitimate to bind to; no projected fact means there is nothing to bind.
 */
export function stageInvocation202(input: {
  readonly facts: readonly unknown[];
  readonly governedRecords: readonly unknown[];
}): { shouldCall: boolean; reason: string } {
  if (input.governedRecords.length === 0) {
    return { shouldCall: false, reason: 'NO_GOVERNED_EVIDENCE_SUPPLIED' };
  }
  if (input.facts.length === 0) {
    return { shouldCall: false, reason: 'NO_PROJECTED_FACTS_TO_BIND' };
  }
  return { shouldCall: true, reason: 'GOVERNED_EVIDENCE_AND_AT_LEAST_ONE_FACT' };
}

// ================================================================ THE INSTRUCTION

/**
 * The stage's system prompt: wholly separate from v15, not a derivative of it.
 *
 * It has to be. v15 is a hazard-analysis instruction, and inserting a binding block into it would
 * drag the whole analysis instruction into a request that must not perform an analysis. It is SHORT
 * for a reason that is not grammar budget: this stage has one question, and every added paragraph is
 * an added opportunity for the coverage habit §184 measured.
 *
 * The citation paragraph is the ONE line that differs between the two exposures, and it is built
 * from one head and two tails so the variants cannot drift into disagreeing about anything else.
 */
const STAGE_202_PROMPT_HEAD: readonly string[] = [
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
  'rewording any of them. You do not restate a fact\'s decision, its branches or its wording back to',
  'us: we already hold them, and an entry that carries one is discarded whole.',
  '',
];

const STAGE_202_PROMPT_TAIL_REDACTED: readonly string[] = [
  'DO NOT WRITE A REGULATORY CITATION ANYWHERE, in any field, for any reason. Reproducing a number',
  'that appeared in your input is the same violation as inventing one. Naming a record by its',
  'sourceId is the ONLY way to refer to it, and it is sufficient.',
  '',
  'Return only the structured result. Do not narrate your reasoning process.',
];

const STAGE_202_PROMPT_TAIL_VERBATIM: readonly string[] = [
  'DO NOT INVENT A REGULATORY CITATION. You may reproduce a citation identifier only when it appears',
  'word for word in one of the GOVERNED RECORDS printed above, and only that identifier — an altered',
  'section number or an added paragraph reference is a different citation and is treated as invented.',
  'A citation you remember, infer, or complete from your own knowledge is refused and discards the',
  'entry carrying it. Naming a record by its sourceId remains sufficient and remains preferred.',
  '',
  'Return only the structured result. Do not narrate your reasoning process.',
];

export function buildStage202SystemPrompt(exposure: GovernedTextExposureMode): string {
  return [
    ...STAGE_202_PROMPT_HEAD,
    ...(exposure === 'SUPPLIED_VERBATIM'
      ? STAGE_202_PROMPT_TAIL_VERBATIM : STAGE_202_PROMPT_TAIL_REDACTED),
  ].join('\n');
}

/** The default-mode prompt, named so the suite and the memo can hash one value. */
export const GOVERNED_BINDING_202_SYSTEM_PROMPT: string = buildStage202SystemPrompt('REDACTED');

// ================================================================ THE USER PROMPT

/**
 * Render the facts under their minted references. The `factKey` is NOT rendered: it appears nowhere
 * in the request, in either direction, which makes "no factKey on the wire" a property of the
 * transport rather than a property of the boundary's willingness to ignore one.
 */
export function renderBindingFacts202(
  facts: readonly BindingCandidateFact202[], minted: MintedFactRefs202,
): string {
  const lines: string[] = ['UNRESOLVED FACTS — answer each of these exactly once'];
  facts.forEach((f, i) => {
    lines.push(`  - factRef: ${minted.refs[i]}`);
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
 * Render the permissible ids and their text, under the request's exposure mode.
 *
 * The id is always rendered exactly — it is what the contract needs. The TEXT is the only thing the
 * exposure mode changes, and in the default mode it is passed through `redactCitationTokens`, the
 * same treatment v15 already applies to a governed record in the first-pass user prompt.
 */
export function renderSuppliedGovernedRecords202(
  records: readonly Governed202Record[], exposure: GovernedTextExposureMode,
): string {
  indexSuppliedRecords(records);
  const lines: string[] = ['AVAILABLE GOVERNED EVIDENCE — these sourceIds and no others'];
  for (const r of records) {
    lines.push(`  - sourceId: ${r.sourceId}`);
    lines.push(`      text: ${exposure === 'SUPPLIED_VERBATIM' ? r.text : redactCitationTokens(r.text)}`);
  }
  lines.push('  Copy an id character for character. There are no other permissible ids, and an id');
  lines.push('  you invent or respell is discarded along with the entry that carries it.');
  return lines.join('\n');
}

export function buildGoverned202UserPrompt(input: Governed202StageInput): string {
  assertExposureAuthorised(input);
  const minted = mintFactRefs202(input.facts);
  return [
    `INSPECTION CONTEXT — location: ${input.inspectionContext.location}; `
    + `task: ${input.inspectionContext.task}`,
    '',
    renderBindingFacts202(input.facts, minted),
    '',
    renderSuppliedGovernedRecords202(input.governedRecords, exposureOf(input)),
  ].join('\n');
}

// ================================================================ THE WIRE SCHEMA

/**
 * Four properties on one item, and nothing else.
 *
 * Compare what is ABSENT against the first-pass schema whose capability-PRESENT variant §199 had
 * refused before inference: no hazard candidates, no participants, no evidence quotes, no
 * clarifications, no rationale, no eleven-field declaration item, no `authoritativeSources` enum, no
 * `EXPERT_AFFECTED_DECISIONS` enum. THE EXPOSURE MODE DOES NOT CHANGE THIS SCHEMA AT ALL — it
 * changes only what text is printed in the user prompt — so the grammar comparison is the same in
 * both modes, and the §202 suite asserts that rather than assuming it.
 */
export function buildGoverned202WireSchema(
  input: Governed202StageInput,
): Record<string, unknown> {
  const minted = mintFactRefs202(input.facts);
  indexSuppliedRecords(input.governedRecords);
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
              enum: [...BINDING_DETERMINATIONS_202],
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
                + 'Do not restate the fact\'s decision, branches or wording back to us.',
            },
          },
          required: ['factRef', 'determination', 'governedEvidenceSourceIds', 'bearingStatement'],
        },
      },
    },
    required: ['bindings'],
  };
}

// ================================================================ OFFLINE GRAMMAR MEASUREMENT

/**
 * Complexity proxies for a JSON Schema, and an explicit statement of what they are worth.
 *
 * THE PROVIDER'S METRIC IS NOT ANY OF THESE. §199's refusal names compiled grammar size; the
 * compiler is not ours, the threshold is undocumented, and no figure produced here can prove a
 * request will be accepted. What these numbers CAN do is compare two requests along the axes the
 * provider's own error message points at — "simplify your tool schemas" — and support a qualitative
 * order-of-magnitude claim.
 *
 * `enumAlternatives` is the count that matters most: an enum of N strings is an N-way alternation in
 * the compiled grammar, and an enum expands into far more grammar than its serialised length
 * suggests. `serialisedBytes` is reported LAST and deliberately so, because §199 already established
 * that a 2.3% byte difference separated an accepted request from a rejected one.
 */
export interface SchemaComplexity202 {
  readonly enumConstructs: number;
  readonly enumAlternatives: number;
  readonly objectNodes: number;
  readonly propertyNodes: number;
  readonly arrayNodes: number;
  readonly maxNestingDepth: number;
  readonly requiredEntries: number;
  readonly descriptionChars: number;
  /** `JSON.stringify(...).length` — UTF-16 code units, the definition §199's diagnosis used. */
  readonly serialisedChars: number;
  /** The same string in UTF-8 bytes, which is what actually travels. Larger, because of em dashes. */
  readonly serialisedBytes: number;
}

export function measureSchemaComplexity202(schema: unknown): SchemaComplexity202 {
  let enumConstructs = 0; let enumAlternatives = 0; let objectNodes = 0;
  let propertyNodes = 0; let arrayNodes = 0; let requiredEntries = 0; let descriptionChars = 0;
  let maxNestingDepth = 0;
  const walk = (n: unknown, depth: number): void => {
    if (depth > maxNestingDepth) maxNestingDepth = depth;
    if (Array.isArray(n)) { n.forEach(v => walk(v, depth)); return; }
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
    for (const v of Object.values(o)) walk(v, depth + 1);
  };
  walk(schema, 0);
  const serialised = JSON.stringify(schema);
  return {
    enumConstructs,
    enumAlternatives,
    objectNodes,
    propertyNodes,
    arrayNodes,
    maxNestingDepth,
    requiredEntries,
    descriptionChars,
    serialisedChars: serialised.length,
    serialisedBytes: Buffer.byteLength(serialised, 'utf8'),
  };
}

/** A whole request measured together: the schema AS SENT plus both prompts. */
export interface RequestMeasurement202 {
  readonly label: string;
  readonly schema: SchemaComplexity202;
  readonly systemPromptBytes: number;
  readonly userPromptBytes: number;
  readonly totalRequestBytes: number;
}

export function measureRequest202(args: {
  readonly label: string;
  /** The schema AFTER the strict-tool-schema wrapper and the §108 keyword strip. */
  readonly schemaAsSent: unknown;
  readonly systemPrompt: string;
  readonly userPrompt: string;
}): RequestMeasurement202 {
  const schema = measureSchemaComplexity202(args.schemaAsSent);
  const systemPromptBytes = Buffer.byteLength(args.systemPrompt, 'utf8');
  const userPromptBytes = Buffer.byteLength(args.userPrompt, 'utf8');
  return {
    label: args.label,
    schema,
    systemPromptBytes,
    userPromptBytes,
    totalRequestBytes: schema.serialisedBytes + systemPromptBytes + userPromptBytes,
  };
}

/**
 * Stated in code so a later reader cannot mistake a measurement for a transport guarantee, and so
 * the suite asserts the disclaimer rather than trusting a memo to carry it.
 */
export const GRAMMAR_MEASUREMENT_CLAIMS_202 = {
  MEASURES_TWO_REQUESTS_ON_THE_SAME_AXES: true,
  MEASURED_ON_THE_REQUEST_AS_SENT_WITH_THE_REAL_SOURCE_ID_SHAPE: true,
  SUPPORTS_A_QUALITATIVE_ORDER_OF_MAGNITUDE_COMPARISON: true,
  IS_THE_PROVIDERS_COMPILED_GRAMMAR_METRIC: false,
  EQUALS_PROVIDER_COMPILED_GRAMMAR_COMPLEXITY: false,
  PROVES_A_REQUEST_WILL_BE_ACCEPTED: false,
  IS_EVIDENCE_OF_PROVIDER_ACCEPTANCE: false,
  KNOWS_THE_THRESHOLD: false,
} as const;

// ================================================================ THE BOUNDARY

export interface FactBindingRecord202 {
  readonly factKey: string;
  readonly factRef: string;
  readonly outcome: FactBindingOutcome202;
  readonly boundGovernedSourceIds: readonly string[];
  /** Recorded for human review. NEVER an authority for anything. */
  readonly bearingStatement: string | null;
  readonly codes: readonly BindingRefusalCode202[];
  readonly detail: readonly string[];
  /** Set when a citation token was admitted as reproduction of SUPPLIED text. Null otherwise. */
  readonly citationReuse: CitationReuseVerdict | null;
}

export interface Governed202StageResult {
  readonly version: typeof GOVERNED_BINDING_CONTRACT_202_VERSION;
  readonly exposure: GovernedTextExposureMode;
  readonly perFact: readonly FactBindingRecord202[];
  /** Response-level refusals. When non-empty every fact is NO_DETERMINATION_RETURNED. */
  readonly responseCodes: readonly BindingRefusalCode202[];
  readonly responseDetail: readonly string[];
  /** Entries naming a factRef nobody minted. Recorded, never resolved to a nearby fact. */
  readonly orphanEntries: number;
  readonly boundPairs: readonly { readonly factKey: string; readonly sourceId: string }[];
  readonly refusedCount: number;
  readonly undeterminedCount: number;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * Validate a raw stage response against the supplied closed sets and the sealed fact identities.
 *
 * REFUSAL IS PER ENTRY — see `ENTRY_ISOLATION_IS_PART_OF_THE_CONTRACT`. A response that is not even
 * the right SHAPE is refused whole, and so is one whose fact set does not reproduce the seal.
 *
 * NOTHING IS REPAIRED. No nearest-match on a `factRef`, no case-folding on a `sourceId`, no
 * inference of a determination from the ids that came with it. A contradiction between the
 * determination and the id list is a refusal, not a signal to pick the more likely half.
 */
export function checkGoverned202Bindings(
  raw: unknown, input: Governed202StageInput,
): Governed202StageResult {
  const exposure = exposureOf(input);
  const minted = mintFactRefs202(input.facts);
  const suppliedById = indexSuppliedRecords(input.governedRecords);
  const supplied = new Set(Object.keys(suppliedById));
  const suppliedTexts = Object.values(suppliedById);

  const byRef = new Map<string, FactBindingRecord202>();
  const undetermined = (ref: string): FactBindingRecord202 => ({
    factKey: minted.refToFactKey[ref],
    factRef: ref,
    outcome: 'NO_DETERMINATION_RETURNED',
    boundGovernedSourceIds: [],
    bearingStatement: null,
    codes: [],
    detail: [],
    citationReuse: null,
  });
  for (const ref of minted.refs) byRef.set(ref, undetermined(ref));

  const finish = (
    responseCodes: BindingRefusalCode202[], responseDetail: string[], orphanEntries: number,
  ): Governed202StageResult => {
    const perFact = minted.refs.map(r => byRef.get(r)!);
    const boundPairs: { factKey: string; sourceId: string }[] = [];
    for (const f of perFact) {
      for (const sid of f.boundGovernedSourceIds) {
        boundPairs.push({ factKey: f.factKey, sourceId: sid });
      }
    }
    return {
      version: GOVERNED_BINDING_CONTRACT_202_VERSION,
      exposure,
      perFact,
      responseCodes,
      responseDetail,
      orphanEntries,
      boundPairs,
      refusedCount: perFact.filter(f => f.outcome === 'REFUSED').length,
      undeterminedCount: perFact.filter(f => f.outcome === 'NO_DETERMINATION_RETURNED').length,
    };
  };

  // §202. Identity first: a response scored against a fact set that is not the sealed one is
  // refused whole, before a single entry is read.
  const seal = input.identitySeal;
  const expected = identityDigest(input.analysisId, minted.refs.map(r => minted.refToFactKey[r]));
  if (seal === undefined || seal === null || seal.digest !== expected
    || seal.analysisId !== input.analysisId) {
    return finish(['IDENTITY_SEAL_MISMATCH'],
      ['the fact identities being scored are not the identities sealed before the request was '
        + 'built; the response is refused rather than scored against a set the provider may have '
        + 'influenced'], 0);
  }

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

  for (const e of entries) {
    const codes: BindingRefusalCode202[] = [];
    const detail: string[] = [];
    const fail = (c: BindingRefusalCode202, why: string): void => {
      codes.push(c); detail.push(why);
    };

    if (typeof e !== 'object' || e === null || Array.isArray(e)) {
      orphanEntries += 1;
      continue;
    }
    const entry = e as Record<string, unknown>;
    const ref = typeof entry.factRef === 'string' ? entry.factRef : '';

    // An entry naming nothing we minted is an ORPHAN. Counted and dropped, never attached to a fact
    // by proximity: attaching a binding to the wrong fact is worse than losing it.
    if (!minted.refs.includes(ref)) {
      orphanEntries += 1;
      continue;
    }
    if (seenRefs.has(ref)) {
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

    for (const forbidden of GOVERNED_STAGE_202_FORBIDDEN_FIELDS) {
      if (forbidden in entry) {
        fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
          `entry carried '${forbidden}', which only HazLenz may set`);
      }
    }

    const determination = entry.determination;
    if (!(BINDING_DETERMINATIONS_202 as readonly unknown[]).includes(determination)) {
      fail('DETERMINATION_NOT_A_MEMBER', String(determination).slice(0, 48));
    }

    const ids: string[] = [];
    const rawIds = entry.governedEvidenceSourceIds;
    if (rawIds === undefined || !Array.isArray(rawIds)) {
      fail('GOVERNED_SOURCE_IDS_NOT_AN_ARRAY', `governedEvidenceSourceIds is ${typeof rawIds}`);
    } else {
      const seenIds = new Set<string>();
      for (const gid of rawIds) {
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
      && Array.isArray(rawIds) && rawIds.length > 0) {
      fail('NON_BINDING_CARRIES_A_SOURCE',
        `${String(determination)} carried ${rawIds.length} sourceId(s)`);
    }

    if (blank(entry.bearingStatement)) {
      fail('BEARING_STATEMENT_MISSING', 'bearingStatement is empty');
    }

    // ---- the stage-specific citation authority, per exposure mode.
    let citationReuse: CitationReuseVerdict | null = null;
    for (const f of BINDING_FREE_TEXT_FIELDS_202) {
      const v = entry[f];
      if (typeof v !== 'string') continue;
      const m = CITATION_SHAPED_PATTERN.exec(v);
      if (m === null) continue;
      if (exposure !== 'SUPPLIED_VERBATIM') {
        fail('PROHIBITED_REGULATORY_CITATION',
          `citation-shaped span ${JSON.stringify(m[0])} in ${f}`);
        continue;
      }
      // SUPPLIED_VERBATIM. A token is admitted ONLY on exact equality with a token present in a
      // record HazLenz actually supplied with THIS request. The authorised set is the supplied set
      // itself — narrower than verifier v3.3, which authorises a model-declared reliance subset.
      const reuse = decideCitationReuse([v], suppliedTexts);
      citationReuse = reuse;
      if (!reuse.allReuse) {
        fail('UNAUTHORISED_REGULATORY_CITATION',
          `${[...new Set(reuse.refused)].join(', ')} appear(s) in no supplied governed record`);
      }
    }

    const outcome: FactBindingOutcome202 = codes.length > 0
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
      citationReuse,
    });
  }

  return finish([], [], orphanEntries);
}

// ================================================================ THE ENRICHMENT

/**
 * Apply an admitted binding to the projected facts.
 *
 * This is the ONLY thing a binding is permitted to do, and the list of what it does not do is longer
 * than the list of what it does. It attaches an `acceptableEvidence` criterion HAZLENZ ALREADY HOLDS
 * for a bound governed id — the same lookup the projection performs when the binding arrives on the
 * declaration, moved to the stage that now produces the binding. Provenance is unchanged: looked up,
 * never authored here, never accepted from the provider.
 *
 * WHAT IT DOES NOT DO. It does not change `status` — a bound fact is still `UNRESOLVED`. It does not
 * change `priority`, so a bound fact cannot escalate itself. It does not change `source`,
 * `modelAuthored`, `factKey`, the span, either branch, the divergence or the affected decision. It
 * does not create coverage. It does not OVERWRITE a criterion the fact already carries — an existing
 * value came from somewhere with its own authority, and silently replacing it would let a
 * model-selected id displace it.
 *
 * The rebuilt fact is re-checked with `owedFactDefects`, so an enrichment that produced an invalid
 * fact fails loudly here instead of downstream.
 */
export interface EnrichmentOutcome202 {
  readonly factKey: string;
  readonly applied: boolean;
  readonly reason: 'CRITERION_ATTACHED' | 'NO_BINDING' | 'NO_CRITERION_HELD'
  | 'CRITERION_ALREADY_HELD' | 'ENRICHED_FACT_INVALID';
  readonly sourceId: string | null;
  readonly defects: readonly string[];
}

export function applyGoverned202Bindings(
  facts: readonly OwedFact[],
  result: Governed202StageResult,
  criteriaBySourceId: Readonly<Record<string, AcceptableEvidence>> = {},
): { facts: readonly OwedFact[]; outcomes: readonly EnrichmentOutcome202[] } {
  const boundByFact = new Map<string, readonly string[]>();
  for (const f of result.perFact) {
    if (f.outcome === 'BOUND') boundByFact.set(f.factKey, f.boundGovernedSourceIds);
  }

  const outcomes: EnrichmentOutcome202[] = [];
  const out: OwedFact[] = [];

  for (const fact of facts) {
    const bound = boundByFact.get(fact.factKey);
    if (bound === undefined || bound.length === 0) {
      outcomes.push({
        factKey: fact.factKey, applied: false, reason: 'NO_BINDING', sourceId: null, defects: [],
      });
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
        factKey: fact.factKey, applied: false, reason: 'NO_CRITERION_HELD',
        sourceId: null, defects: [],
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
export function governed202StageEffect(): {
  factsMayBeSettled: false; coverageMayChange: false; priorityMayChange: false;
  citationsMayBeCreated: false; regulatoryTruthMayBeCreated: false; factsMayBeAdded: false;
  factsMayBeRemoved: false; questionWordingMayBeInvented: false; factIdentityMayChange: false;
  affectedDecisionMayChange: false; branchSemanticsMayChange: false;
  unresolvedSafetyStateMayBeEscalated: false;
} {
  return {
    factsMayBeSettled: false, coverageMayChange: false, priorityMayChange: false,
    citationsMayBeCreated: false, regulatoryTruthMayBeCreated: false, factsMayBeAdded: false,
    factsMayBeRemoved: false, questionWordingMayBeInvented: false, factIdentityMayChange: false,
    affectedDecisionMayChange: false, branchSemanticsMayChange: false,
    unresolvedSafetyStateMayBeEscalated: false,
  };
}

// ================================================================ OWED ELSEWHERE

/** What this stage NEEDS from work that is not this stage's, stated so it is not quietly absorbed. */
export const STAGE_202_DEPENDENCIES: readonly string[] = [
  'OwedFact has no field for the owed property; this stage needs it and takes it as a nullable '
  + 'caller-supplied string sourced from declaration.missingFact. Resolving that representation gap '
  + 'is NOT §202\'s work and must not be done by folding the property into whyUnresolved.',
  'the harness must retain the declaration records alongside the projected facts, so that '
  + 'missingFact survives projection and can be handed to this stage as owedProperty',
  'a per-stage entry in the pre-inference circuit breaker keyed on '
  + 'GOVERNED_BINDING_202_REQUEST_CONTRACT_ID, so a rejection of THIS schema never joins a '
  + 'first-pass rejection streak and vice versa',
  'a product-owner ruling before governedTextExposure=SUPPLIED_VERBATIM is used anywhere; the mode '
  + 'is implemented and enforced but cannot be activated without an explicit ruling reference',
  'a hosted single-row transport canary. No offline figure in this module establishes that this '
  + 'request will be accepted, and only a hosted call can',
];

/** What this stage does not solve. Reported, not buried. */
export const STAGE_202_RESIDUAL_LIMITS: readonly string[] = [
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
  'no figure produced by measureSchemaComplexity202 or measureRequest202 proves this request will '
  + 'be accepted by the provider; the threshold is undocumented and only a hosted single-row canary '
  + 'can establish it',
  'the identity seal is not a clock: it proves the scored fact set is the requested fact set, and a '
  + 'caller bypassing the pipeline could still reseal. See IDENTITY_SEAL_CLAIMS',
  'a second call costs a second latency and a second failure mode on every governed row; on rows '
  + 'with no governed evidence the stage is not called at all and costs nothing',
];

export { FACT_KEY_SHAPE, GOVERNED_SOURCE_ID_SHAPE };
