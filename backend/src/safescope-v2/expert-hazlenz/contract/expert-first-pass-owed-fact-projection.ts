/**
 * §196 EXPERT HAZLENZ -- DETERMINISTIC PROJECTION: STRUCTURED DECLARATION -> OwedFact.
 * DEVELOPMENT PROTOTYPE ONLY. NOT REACHABLE FROM PRODUCTION. ZERO PROVIDER CALLS, ZERO DB ACCESS.
 *
 * ==================== THE ONE RULE ====================
 *
 *      THE MODEL AUTHORS SEMANTIC SAFETY CONTENT. THIS FILE VALIDATES AND PROJECTS IT.
 *
 * Every field of the `OwedFact` this module returns comes from ONE of exactly three places, and the
 * provenance table below names which, for every field, as data a test can read:
 *
 *   EXPLICIT UPSTREAM FIELD   copied from the declaration, at most whitespace-trimmed
 *   MECHANICAL DERIVATION     computed from already-structured fields by a stated rule
 *   HAZLENZ TASK STATE        supplied by HazLenz, never by the provider, never invented here
 *
 * There is no fourth place. This module does not infer an owed fact from prose, invent a branch,
 * invent a divergence, invent a span, repair a missing conjunct, guess a factKey, or read a
 * clarification for meaning. Where required semantic content is absent it REFUSES the declaration.
 *
 * ==================== REFUSAL IS PER DECLARATION, AND THAT IS DELIBERATE ====================
 *
 * The verifier boundary refuses a verdict WHOLE, because a verdict is one object making one
 * decision. A first-pass response is four -- now five -- INDEPENDENT collections, and
 * `normalizeExpertOutput` has always refused a malformed candidate without destroying its siblings.
 * A malformed declaration must not take a well-formed independent gap down with it: that would be
 * the displacement failure the owed-fact layer exists to prevent, arriving through the boundary
 * instead of through the model. So a refusal names its declaration, yields NO fact, and is
 * recorded; the other declarations are unaffected. Nothing is repaired, and nothing is partial --
 * a refused declaration produces no `OwedFact` at all.
 *
 * ==================== IDENTITY IS COMPUTED, NEVER ACCEPTED ====================
 *
 * See `computeFactKey`. The wire has no `factKey` field, so a provider cannot name a fact, cannot
 * collide with a supplied one, and cannot impersonate one later. What this buys and what it does
 * NOT buy is stated in `FACT_IDENTITY_CLAIMS` rather than left to be assumed.
 */

import {
  type AcceptableEvidence, type OwedFact, type OwedFactAffectedDecision, type OwedFactPriority,
  type OwedFactSource,
  OWED_FACT_AFFECTED_DECISIONS, MODEL_AUTHORED_SOURCES, PROVIDER_FORBIDDEN_OWED_FACT_FIELDS,
} from '../owed-facts/owed-fact.types';
import { owedFact } from '../owed-facts/owed-fact-ledger';
import {
  CITATION_SHAPED_PATTERN, FORBIDDEN_EXPERT_FIELD_NAMES,
} from '../expert-contract.types';

export const FIRST_PASS_OWED_FACT_PROJECTION_VERSION =
  'hazlenz.expert.first-pass-owed-fact-projection.v1' as const;

// ---------------------------------------------------------------- the wire declaration

/**
 * The structured unresolved-fact declaration, as it arrives.
 *
 * Nine of these twelve fields are the v3 `nominatedFact` shape, unchanged. `declarationId`,
 * `observationSourceId` and `governedEvidenceSourceIds` are the three the first pass needs and the
 * verifier does not -- a handle, a source selector, and the governed binding.
 */
export interface StructuredUnresolvedFactDeclaration {
  /** A WITHIN-RESPONSE HANDLE. Not the fact's identity; see `computeFactKey`. */
  readonly declarationId: string;
  /** The unresolved property itself. Has no canonical `OwedFact` field -- see the provenance table. */
  readonly missingFact: string;
  readonly observationSourceId: string;
  readonly observationSpan: string;
  readonly notEstablishedBecause: string;
  readonly affectedDecision: OwedFactAffectedDecision;
  readonly branchA: string;
  readonly decisionIfA: string;
  readonly branchB: string;
  readonly decisionIfB: string;
  readonly whyNecessaryNow: string;
  readonly governedEvidenceSourceIds: readonly string[];
}

/** Which stage authored the declaration. Decides the key prefix and the `OwedFact.source`. */
export const DECLARING_STAGES = ['FIRST_PASS_MODEL', 'VERIFIER_NOMINATION'] as const;
export type DeclaringStage = (typeof DECLARING_STAGES)[number];

const STAGE_KEY_PREFIX: Readonly<Record<DeclaringStage, string>> = {
  FIRST_PASS_MODEL: 'FP',
  VERIFIER_NOMINATION: 'VN',
};

// ---------------------------------------------------------------- HazLenz-owned constants

/**
 * The priority a projected model-authored fact enters at, and why it is not model-emitted.
 *
 * `priority` decides things: it gates `COVERAGE_PRIORITY_GATE`, it ranks the question budget, and
 * `LIFE_CRITICAL` is the value that raises `UNRESOLVED_SAFETY_STATE`. §170's rule is that HazLenz
 * populates every `OwedFact` field that decides anything, so the wire has no priority field and a
 * provider cannot escalate itself.
 *
 * `OTHER` is the non-escalating floor. It is a MECHANICAL DERIVATION -- a stated constant, not a
 * judgement about any particular fact -- and it is deliberately the conservative direction: a model
 * cannot manufacture a fail-closed customer-visible state by calling its own gap life-critical.
 *
 * THE COST IS REAL AND IS NOT HIDDEN. A genuinely life-critical first-pass gap also enters at
 * `OTHER` and will not raise the gate. Escalating it is a HazLenz decision that needs its own
 * authority and its own evidence, and §196 does not invent one. Recorded in
 * `PROJECTION_RESIDUAL_LIMITS`.
 */
export const FIRST_PASS_PROJECTED_PRIORITY: OwedFactPriority = 'OTHER';

/** A declared fact is by definition open. `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` is unchanged. */
export const PROJECTED_STATUS = 'UNRESOLVED' as const;

// ---------------------------------------------------------------- refusal vocabulary

export const PROJECTION_REFUSAL_CODES = [
  'DECLARATION_NOT_AN_OBJECT',
  'DECLARATION_ID_MALFORMED',
  'DUPLICATE_DECLARATION_ID',
  'REQUIRED_FIELD_MISSING',
  'AFFECTED_DECISION_NOT_A_MEMBER',
  'OBSERVATION_SOURCE_UNKNOWN',
  'EVIDENCE_SPAN_NOT_VERBATIM',
  'BRANCHES_IDENTICAL',
  'DECISIONS_DO_NOT_DIVERGE',
  'NON_SEMANTIC_PLACEHOLDER_VALUE',
  'GOVERNED_SOURCE_IDS_NOT_AN_ARRAY',
  'GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
  'GOVERNED_SOURCE_ID_DUPLICATED',
  'PROHIBITED_REGULATORY_CITATION',
  'PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
  'COMPUTED_FACT_KEY_MALFORMED',
  'DECLARATION_DUPLICATES_ANOTHER_DECLARATION',
  'ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ',
] as const;
export type ProjectionRefusalCode = (typeof PROJECTION_REFUSAL_CODES)[number];

/** Every field the declaration owes. Exported so the suite counts them rather than trusting a list. */
export const REQUIRED_DECLARATION_STRING_FIELDS = [
  'declarationId', 'missingFact', 'observationSourceId', 'observationSpan',
  'notEstablishedBecause', 'affectedDecision', 'branchA', 'decisionIfA', 'branchB', 'decisionIfB',
  'whyNecessaryNow',
] as const;

/** Free-text fields scanned for a citation-shaped string. Ids and enums are not prose. */
export const DECLARATION_FREE_TEXT_FIELDS = [
  'missingFact', 'observationSpan', 'notEstablishedBecause', 'branchA', 'decisionIfA',
  'branchB', 'decisionIfB', 'whyNecessaryNow',
] as const;

/**
 * Field names a declaration may never carry, over and above the free-text scan.
 *
 * `factKey` is here because identity is computed: a provider that sends one is trying to name a
 * fact, and the correct response to that is a refusal with a code somebody can count, not a
 * silently ignored field.
 */
export const DECLARATION_FORBIDDEN_FIELDS: readonly string[] = [
  'factKey', ...PROVIDER_FORBIDDEN_OWED_FACT_FIELDS, ...FORBIDDEN_EXPERT_FIELD_NAMES,
];

// ---------------------------------------------------------------- identity

/** The same narrow shape v3 requires of a `bindingFactKey`. Keys are ours, not prose. */
export const FACT_KEY_SHAPE = /^[A-Za-z0-9][A-Za-z0-9_:.\-]{0,127}$/;

/**
 * WHAT THE COMPUTED KEY CLAIMS, AND WHAT IT DOES NOT. Recorded in code because the honest answer is
 * narrower than "stable identity" and a later reader must not read more into it.
 */
export const FACT_IDENTITY_CLAIMS = {
  /** The same declaration over the same sources yields the same key, byte for byte. */
  DETERMINISTIC_FROM_THE_DECLARATION: true,
  /** No rationale, question or explanation prose enters the key. */
  INDEPENDENT_OF_GENERATED_RATIONALE_PROSE: true,
  /** Refused otherwise, so `OwedFact`'s "unique within the analysis" holds by construction. */
  UNIQUE_WITHIN_THE_ANALYSIS: true,
  /** There is no wire field for it. A provider cannot choose, collide with, or impersonate a key. */
  NOT_CHOOSABLE_BY_THE_PROVIDER: true,
  /** Exact string equality against a closed set, which is all v3 binding ever needs. */
  COMPATIBLE_WITH_VERIFIER_EXACT_BINDING: true,
  /**
   * NOT CLAIMED. Two draws that phrase the same unresolved property differently, or anchor it to a
   * different span, produce DIFFERENT keys. No deterministic function of model output can decide
   * that two differently-worded facts are the same fact -- that is the semantic matcher this
   * programme retired at §160 -- so cross-analysis identity is a human or measurement question and
   * is not smuggled in here under a hash.
   */
  SEMANTIC_IDENTITY_ACROSS_ANALYSES: false,
} as const;

/**
 * Compose the key from fields that are themselves closed-vocabulary or externally anchored.
 *
 * `affectedDecision` is a closed vocabulary. `observationSourceId` is a supplied id. The offsets are
 * computed by HazLenz with `indexOf` over the supplied source -- the same mechanism `bindWireAnalysis`
 * already uses for candidate quotes -- so they are OUR measurement of the model's span, not a number
 * the model sent. `ordinal` disambiguates two facts that genuinely share one anchor, which multi-gap
 * rows require.
 *
 * The composed key is CHECKED against `FACT_KEY_SHAPE` rather than sanitised into it: an id carrying
 * a character the shape excludes is refused, because quietly rewriting an identifier is how two
 * different facts end up sharing one.
 */
export function computeFactKey(args: {
  stage: DeclaringStage;
  affectedDecision: string;
  observationSourceId: string;
  startOffset: number;
  endOffset: number;
  ordinal: number;
}): string {
  return [
    STAGE_KEY_PREFIX[args.stage],
    args.affectedDecision,
    args.observationSourceId,
    `${args.startOffset}-${args.endOffset}`,
    String(args.ordinal),
  ].join('.');
}

// ---------------------------------------------------------------- provenance, as data

export type ProvenanceKind = 'EXPLICIT_UPSTREAM_FIELD' | 'MECHANICAL_DERIVATION' | 'HAZLENZ_TASK_STATE';

export interface FieldProvenance {
  readonly owedFactField: string;
  readonly kind: ProvenanceKind;
  readonly source: string;
  readonly validation: string;
}

/**
 * THE FIELD PROVENANCE TABLE. Every field of `OwedFact`, with no gaps and no field left over.
 *
 * The §196 suite asserts this covers the keys of a projected `OwedFact` exactly -- a field added to
 * `OwedFact` without a row here fails the suite, which is the only way a table like this stays true.
 */
export const OWED_FACT_FIELD_PROVENANCE: readonly FieldProvenance[] = [
  {
    owedFactField: 'factKey',
    kind: 'MECHANICAL_DERIVATION',
    source: 'stage prefix + affectedDecision + observationSourceId + HazLenz-computed span offsets '
      + '+ collision ordinal',
    validation: 'composed key must match FACT_KEY_SHAPE and be unique within the analysis; there is '
      + 'no wire field to accept one from',
  },
  {
    owedFactField: 'affectedDecision',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.affectedDecision',
    validation: 'exact membership of OWED_FACT_AFFECTED_DECISIONS',
  },
  {
    owedFactField: 'source',
    kind: 'HAZLENZ_TASK_STATE',
    source: 'the declaring stage supplied by the caller',
    validation: 'member of DECLARING_STAGES; there is no wire field for it',
  },
  {
    owedFactField: 'evidenceSpan',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.observationSpan, whitespace-trimmed',
    validation: 'must appear verbatim in the text of the named supplied source, by exact string '
      + 'containment; a span that does not is refused, never repaired',
  },
  {
    owedFactField: 'whyUnresolved',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.notEstablishedBecause',
    validation: 'non-blank, as WHY_UNRESOLVED_STATUS_INVARIANT requires of an UNRESOLVED fact',
  },
  {
    owedFactField: 'branchA',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.branchA',
    validation: 'non-blank and textually different from branchA',
  },
  {
    owedFactField: 'branchB',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.branchB',
    validation: 'non-blank and textually different from branchA',
  },
  {
    owedFactField: 'decisionDivergence',
    kind: 'EXPLICIT_UPSTREAM_FIELD',
    source: 'declaration.decisionIfA and declaration.decisionIfB',
    validation: 'both non-blank and textually different from each other; a declaration whose two '
      + 'decisions agree is refused rather than given a manufactured difference',
  },
  {
    owedFactField: 'priority',
    kind: 'MECHANICAL_DERIVATION',
    source: 'FIRST_PASS_PROJECTED_PRIORITY, a stated constant',
    validation: 'no wire field exists; a provider may not set the value that gates '
      + 'UNRESOLVED_SAFETY_STATE. See PROJECTION_RESIDUAL_LIMITS for what this costs.',
  },
  {
    owedFactField: 'status',
    kind: 'MECHANICAL_DERIVATION',
    source: 'PROJECTED_STATUS, the constant UNRESOLVED',
    validation: 'a declared fact is open by definition; PROVIDER_SETTLEMENT_AUTHORITY = NEVER',
  },
  {
    owedFactField: 'acceptableEvidence',
    kind: 'HAZLENZ_TASK_STATE',
    source: 'a criterion HazLenz already holds for a governed sourceId the declaration bound, or '
      + 'null',
    validation: 'the declaration may only NAME a supplied governed id; it may not carry a criterion '
      + '(acceptableEvidence is in DECLARATION_FORBIDDEN_FIELDS). Null is valid and normal.',
  },
  {
    owedFactField: 'modelAuthored',
    kind: 'MECHANICAL_DERIVATION',
    source: 'derived from `source` by owedFact(), via MODEL_AUTHORED_SOURCES',
    validation: 'no call site can disagree with the provenance; owedFactDefects refuses a mismatch',
  },
] as const;

/**
 * Declaration fields that intentionally do NOT reach an `OwedFact`, and why. Recorded so that
 * "every OwedFact field has provenance" is not mistaken for "every declaration field is used".
 */
export const NON_PROJECTING_DECLARATION_FIELDS = [
  {
    field: 'declarationId',
    role: 'a within-response handle so a clarification can point at this entry; deliberately not an '
      + 'identity, and dropped once the computed factKey exists',
  },
  {
    field: 'missingFact',
    role: 'THE OWED PROPERTY ITSELF, and there is NO canonical OwedFact field for it. OwedFact '
      + 'carries whyUnresolved, two branches and two decisions, and the property survives only '
      + 'implicitly across them. Adding a field would mutate owed-fact.types.ts, whose sha256 is '
      + 'pinned by §187 and asserted by every integrity gate since. So it is preserved on the '
      + 'declaration record and ESCALATED rather than either dropped silently or folded into '
      + 'whyUnresolved, which would be composition and therefore invention.',
  },
  {
    field: 'observationSourceId',
    role: 'selects which supplied source the span is checked against, and enters the computed '
      + 'factKey; OwedFact.evidenceSpan carries the text and not its origin',
  },
  {
    field: 'whyNecessaryNow',
    role: 'part of the canonical v3 nomination vocabulary this shape reuses; retained on the '
      + 'declaration record for review and not projected, because OwedFact has no field for it',
  },
  {
    field: 'governedEvidenceSourceIds',
    role: 'binds the fact to supplied governed evidence, which is what lets HazLenz supply an '
      + 'acceptableEvidence criterion it already holds; the ids themselves are not part of the fact',
  },
] as const;

/** What this projection does not solve. Reported, not buried. */
export const PROJECTION_RESIDUAL_LIMITS: readonly string[] = [
  'a genuinely LIFE_CRITICAL first-pass gap enters at OTHER and does not raise '
    + 'UNRESOLVED_SAFETY_STATE; escalation is a HazLenz decision needing its own authority',
  'OwedFact has no field for the owed property itself (declaration.missingFact); the property '
    + 'survives implicitly through whyUnresolved and the two branches',
  'that the two branches are genuinely possible, that the divergence is real, and that the span '
    + 'actually shows the fact is open are SEMANTIC judgements; nothing here checks them and the '
    + 'boundary never claims to',
  'cross-analysis semantic identity of a fact is not claimed and is not computable here',
];

// ---------------------------------------------------------------- the projection

export interface ProjectionSource {
  readonly sourceId: string;
  readonly text: string;
}

export interface ProjectionInput {
  /** Raw, as the provider returned it. Typed `unknown` because validation is this module's job. */
  readonly declarations: readonly unknown[];
  readonly sources: readonly ProjectionSource[];
  /** The closed set of governed ids actually supplied with this request. */
  readonly suppliedGovernedSourceIds: readonly string[];
  readonly stage: DeclaringStage;
  /**
   * Criteria HazLenz already holds, keyed by governed sourceId. Supplied by the caller from
   * `deriveAcceptableEvidence`; never authored here and never accepted from the provider.
   */
  readonly acceptableEvidenceBySourceId?: Readonly<Record<string, AcceptableEvidence>>;
}

export interface DeclarationProjection {
  readonly declarationId: string;
  readonly admitted: boolean;
  readonly codes: readonly ProjectionRefusalCode[];
  readonly detail: readonly string[];
  readonly factKey: string | null;
  readonly owedFact: OwedFact | null;
}

export interface ProjectionResult {
  readonly version: typeof FIRST_PASS_OWED_FACT_PROJECTION_VERSION;
  readonly perDeclaration: readonly DeclarationProjection[];
  /** Admitted facts, in declaration order. Empty is a legitimate answer. */
  readonly facts: readonly OwedFact[];
  readonly refusedCount: number;
  /** So a clarification's back-reference can be resolved to the fact it names. */
  readonly declarationIdToFactKey: Readonly<Record<string, string>>;
}

const blank = (v: unknown): boolean => typeof v !== 'string' || v.trim().length === 0;

/**
 * §210E R7 -- NON-SEMANTIC FILLER IN A BRANCH OR A DECISION.
 *
 * §210D's D2 emitted `decisionIfA: "unused"`, `branchB: "placeholder"`, `decisionIfB:
 * "placeholder"`. Every existing check passed: the four fields were non-blank, and neither the two
 * branches nor the two decisions were identical TO EACH OTHER. The declaration was therefore
 * admissible while saying nothing a reviewer could act on.
 *
 * This REFUSES such a value. It does not repair one, does not compose a replacement, and does not
 * guess what the model meant -- deterministic code may validate and refuse model-authored safety
 * semantics, never invent them. The refusal is a CONTRACT_INCOMPLETENESS code, so RR-7 preserves
 * the identified property as a STRUCTURALLY_INVALID_DECLARATION that can never be settled and can
 * never close the analysis. The uncertainty survives; only the empty shape is refused.
 *
 * Deliberately conservative. It matches a field whose ENTIRE content is filler, after trimming
 * surrounding punctuation -- never a substring. "The valve is in an unknown position" is a real
 * branch and is not matched; a bare "unknown" is not.
 */
const NON_SEMANTIC_FILLER = new Set([
  'placeholder', 'placeholders', 'unused', 'n/a', 'na', 'tbd', 'tbc', 'todo', 'unknown', 'same',
  'other', 'none', 'null', 'nil', 'empty', 'blank', 'not applicable', 'no change', 'as above',
  'see above', 'ditto', 'x', '-', '--', '...',
]);

/** True when the whole field is filler. Substring matches are deliberately NOT flagged. */
export const isNonSemanticFiller = (v: unknown): boolean => {
  if (typeof v !== 'string') return false;
  const normalised = v.trim().toLowerCase().replace(/^[\s"'`([{]+|[\s"'`)\]}.!,;:]+$/g, '').trim();
  return normalised.length > 0 && NON_SEMANTIC_FILLER.has(normalised);
};

/** The four fields a reviewer has to be able to act on. */
export const SEMANTIC_BRANCH_FIELDS = ['branchA', 'branchB', 'decisionIfA', 'decisionIfB'] as const;

/** Whitespace- and case-insensitive equality. A byte check after a stated normalisation. */
const sameText = (a: string, b: string): boolean =>
  a.trim().replace(/\s+/g, ' ').toLowerCase() === b.trim().replace(/\s+/g, ' ').toLowerCase();

/** The anchor tuple two declarations must share before an ordinal is needed at all. */
function anchorOf(d: Record<string, any>, start: number, end: number): string {
  return `${String(d.affectedDecision)}|${String(d.observationSourceId)}|${start}|${end}`;
}

/** The semantic digest used ONLY to refuse a restatement of the same declaration. */
function contentDigest(d: Record<string, any>): string {
  return ['branchA', 'branchB', 'decisionIfA', 'decisionIfB']
    .map(k => String(d[k] ?? '').trim().replace(/\s+/g, ' ').toLowerCase()).join(' ~~ ');
}

/**
 * Project a set of structured declarations into owed facts.
 *
 * Total and pure: the same input yields the same bytes. Nothing here reads a clarification, a
 * rationale, a candidate, or any prose outside the declaration's own validated fields.
 */
export function projectDeclaredOwedFacts(input: ProjectionInput): ProjectionResult {
  const sourceText = new Map(input.sources.map(s => [s.sourceId, s.text]));
  const suppliedGoverned = new Set(input.suppliedGovernedSourceIds);
  const criteria = input.acceptableEvidenceBySourceId ?? {};

  const perDeclaration: DeclarationProjection[] = [];
  const facts: OwedFact[] = [];
  const declarationIdToFactKey: Record<string, string> = {};

  const seenIds = new Set<string>();
  const anchorCounts = new Map<string, number>();
  const seenContent = new Map<string, string>();
  const seenKeys = new Set<string>();

  for (let i = 0; i < input.declarations.length; i += 1) {
    const rawDecl = input.declarations[i];
    const codes: ProjectionRefusalCode[] = [];
    const detail: string[] = [];
    const fail = (c: ProjectionRefusalCode, why: string): void => { codes.push(c); detail.push(why); };

    if (typeof rawDecl !== 'object' || rawDecl === null || Array.isArray(rawDecl)) {
      perDeclaration.push({
        declarationId: `(declaration ${i})`,
        admitted: false,
        codes: ['DECLARATION_NOT_AN_OBJECT'],
        detail: [`declaration at index ${i} is ${Array.isArray(rawDecl) ? 'an array' : typeof rawDecl}`],
        factKey: null,
        owedFact: null,
      });
      continue;
    }
    const d = rawDecl as Record<string, any>;
    const id = typeof d.declarationId === 'string' ? d.declarationId : `(declaration ${i})`;

    // ---- a provider may not send a field HazLenz owns, and may not name a fact.
    for (const forbidden of DECLARATION_FORBIDDEN_FIELDS) {
      if (forbidden in d) {
        fail('PROVIDER_RETURNED_A_HAZLENZ_OWNED_FIELD',
          `declaration carried '${forbidden}', which only HazLenz may set`);
      }
    }

    // ---- shape.
    if (blank(d.declarationId) || !FACT_KEY_SHAPE.test(String(d.declarationId))) {
      fail('DECLARATION_ID_MALFORMED', `${JSON.stringify(String(d.declarationId).slice(0, 48))}`);
    } else if (seenIds.has(d.declarationId)) {
      fail('DUPLICATE_DECLARATION_ID', `${d.declarationId} appears more than once`);
    }
    if (typeof d.declarationId === 'string') seenIds.add(d.declarationId);

    for (const f of REQUIRED_DECLARATION_STRING_FIELDS) {
      if (blank(d[f])) fail('REQUIRED_FIELD_MISSING', `${f} is empty`);
    }
    if (!(OWED_FACT_AFFECTED_DECISIONS as readonly string[]).includes(d.affectedDecision)) {
      fail('AFFECTED_DECISION_NOT_A_MEMBER', String(d.affectedDecision));
    }

    // ---- the span, checked against the source it names. Offsets are OURS, not the model's.
    let startOffset = -1;
    let endOffset = -1;
    let span = '';
    if (!blank(d.observationSourceId) && !sourceText.has(String(d.observationSourceId))) {
      fail('OBSERVATION_SOURCE_UNKNOWN',
        `${JSON.stringify(String(d.observationSourceId).slice(0, 48))} is not one of the `
        + `${sourceText.size} supplied sources`);
    } else if (!blank(d.observationSpan) && !blank(d.observationSourceId)) {
      span = String(d.observationSpan).trim();
      const text = sourceText.get(String(d.observationSourceId)) ?? '';
      startOffset = text.indexOf(span);
      if (startOffset < 0) {
        fail('EVIDENCE_SPAN_NOT_VERBATIM',
          `${JSON.stringify(span.slice(0, 60))} does not appear in ${d.observationSourceId}`);
      } else {
        endOffset = startOffset + span.length;
      }
    }

    // ---- §210E R7: a branch or a decision that is entirely filler says nothing. Refused, never
    // ---- repaired: the identified property is preserved by RR-7 and can never be settled.
    for (const f of SEMANTIC_BRANCH_FIELDS) {
      if (isNonSemanticFiller(d[f])) {
        fail('NON_SEMANTIC_PLACEHOLDER_VALUE',
          `${f} is ${JSON.stringify(String(d[f]).slice(0, 32))}, which states no branch or action`);
      }
    }

    // ---- the two branches and the two decisions must actually be two.
    if (!blank(d.branchA) && !blank(d.branchB) && sameText(String(d.branchA), String(d.branchB))) {
      fail('BRANCHES_IDENTICAL', 'branchA and branchB state the same thing');
    }
    if (!blank(d.decisionIfA) && !blank(d.decisionIfB)
        && sameText(String(d.decisionIfA), String(d.decisionIfB))) {
      fail('DECISIONS_DO_NOT_DIVERGE', 'the same thing is done under both branches');
    }

    // ---- governed binding: exact membership of the supplied closed set. No fuzzy match.
    //
    // §198 CAPABILITY OMISSION. When no governed source was supplied, the property is not in the
    // schema, the model is not told about it, and the parser must treat it as UNAVAILABLE FOR THIS
    // TREATMENT rather than as a missing required field. An absent field on a capability-absent
    // treatment is the normal, correct shape — refusing it would refuse every well-formed
    // declaration on ten of the twelve §197 rows.
    //
    // What is NOT relaxed: a declaration that carries the field anyway still has every id checked
    // against the supplied set, which is empty, so every id is refused. Fail-closed is unchanged
    // and does not depend on the capability being declared.
    const capabilityPresent = suppliedGoverned.size > 0;
    const governedFieldPresent = d.governedEvidenceSourceIds !== undefined
      && d.governedEvidenceSourceIds !== null;
    if (!capabilityPresent && !governedFieldPresent) {
      // Nothing to check. The treatment offered no binding and the declaration claimed none.
    } else if (!Array.isArray(d.governedEvidenceSourceIds)) {
      fail('GOVERNED_SOURCE_IDS_NOT_AN_ARRAY', `governedEvidenceSourceIds is ${typeof d.governedEvidenceSourceIds}`);
    } else {
      const seenGoverned = new Set<string>();
      for (const gid of d.governedEvidenceSourceIds) {
        if (typeof gid !== 'string' || !suppliedGoverned.has(gid)) {
          fail('GOVERNED_SOURCE_ID_NOT_IN_SUPPLIED_SET',
            `${JSON.stringify(String(gid).slice(0, 48))} is not one of the `
            + `${suppliedGoverned.size} supplied governed sourceIds`);
          continue;
        }
        if (seenGoverned.has(gid)) { fail('GOVERNED_SOURCE_ID_DUPLICATED', gid); continue; }
        seenGoverned.add(gid);
      }
    }

    // ---- the canonical citation prohibition, applied to every free-text field.
    //
    // NO SUPPLIED-SOURCE REUSE ALLOWANCE APPLIES HERE, and that is deliberate. The v15 HARD
    // PROHIBITIONS block tells the first pass that reproducing a number that appeared in its own
    // input is the same violation as inventing one, and vNext does not weaken v15's instruction.
    // The reuse rule §196 adds lives on the VERIFIER path, where §195 found the collision and where
    // the structured `regulatoryBasis` gives it something to be authorised against.
    for (const f of DECLARATION_FREE_TEXT_FIELDS) {
      const v = d[f];
      if (typeof v !== 'string') continue;
      const m = CITATION_SHAPED_PATTERN.exec(v);
      if (m) {
        fail('PROHIBITED_REGULATORY_CITATION',
          `citation-shaped span ${JSON.stringify(m[0])} in ${f}`);
      }
    }

    // ---- identity, computed only once everything it depends on has held.
    let factKey: string | null = null;
    if (codes.length === 0) {
      const anchor = anchorOf(d, startOffset, endOffset);
      const digest = `${anchor} ~~ ${contentDigest(d)}`;
      const priorId = seenContent.get(digest);
      if (priorId !== undefined) {
        fail('DECLARATION_DUPLICATES_ANOTHER_DECLARATION',
          `${id} restates ${priorId}: same decision, same span and the same two branches and `
          + 'decisions');
      } else {
        seenContent.set(digest, id);
        const ordinal = (anchorCounts.get(anchor) ?? 0) + 1;
        anchorCounts.set(anchor, ordinal);
        const key = computeFactKey({
          stage: input.stage,
          affectedDecision: String(d.affectedDecision),
          observationSourceId: String(d.observationSourceId),
          startOffset,
          endOffset,
          ordinal,
        });
        if (!FACT_KEY_SHAPE.test(key)) {
          fail('COMPUTED_FACT_KEY_MALFORMED',
            `${JSON.stringify(key.slice(0, 64))} is not a legal key; a supplied id carrying a `
            + 'character the key shape excludes is refused rather than rewritten');
        } else if (seenKeys.has(key)) {
          fail('COMPUTED_FACT_KEY_MALFORMED', `${key} was already computed in this analysis`);
        } else {
          factKey = key;
        }
      }
    }

    // ---- acceptableEvidence: HazLenz task state, looked up, never authored here.
    let acceptableEvidence: AcceptableEvidence | null = null;
    if (codes.length === 0 && Array.isArray(d.governedEvidenceSourceIds)) {
      for (const gid of d.governedEvidenceSourceIds as string[]) {
        const c = criteria[gid];
        if (c === undefined) continue;
        if (blank(c.requirement)) {
          fail('ACCEPTABLE_EVIDENCE_PROVENANCE_NOT_SUPPLIED_BY_HAZLENZ',
            `the criterion HazLenz holds for ${gid} has no requirement sentence`);
          continue;
        }
        // First bound governed id that HazLenz holds a criterion for. Deterministic in declaration
        // order; nothing merges two criteria, because merging would author a third.
        acceptableEvidence = c;
        break;
      }
    }

    if (codes.length > 0 || factKey === null) {
      perDeclaration.push({
        declarationId: id, admitted: false, codes, detail, factKey: null, owedFact: null,
      });
      continue;
    }

    seenKeys.add(factKey);
    const fact = owedFact({
      factKey,
      affectedDecision: d.affectedDecision as OwedFactAffectedDecision,
      source: input.stage as OwedFactSource,
      evidenceSpan: span,
      whyUnresolved: String(d.notEstablishedBecause),
      branchA: String(d.branchA),
      branchB: String(d.branchB),
      decisionDivergence: { ifA: String(d.decisionIfA), ifB: String(d.decisionIfB) },
      priority: FIRST_PASS_PROJECTED_PRIORITY,
      status: PROJECTED_STATUS,
      acceptableEvidence,
    });
    facts.push(fact);
    declarationIdToFactKey[id] = factKey;
    perDeclaration.push({
      declarationId: id, admitted: true, codes: [], detail: [], factKey, owedFact: fact,
    });
  }

  return {
    version: FIRST_PASS_OWED_FACT_PROJECTION_VERSION,
    perDeclaration,
    facts,
    refusedCount: perDeclaration.filter(p => !p.admitted).length,
    declarationIdToFactKey,
  };
}

// ---------------------------------------------------------------- clarification back-reference

export interface ResolvedClarificationLink {
  readonly clarificationId: string;
  readonly declarationId: string | null;
  readonly factKey: string | null;
  /** True when the model named a declaration that does not exist or was refused. */
  readonly unresolved: boolean;
}

/**
 * Resolve a clarification's declared back-reference to a projected fact.
 *
 * Same discipline as `relatesToCandidateKey`: an id naming nothing is STRIPPED and recorded, the
 * question survives, and nothing abstains into a guess. This function reads no question text.
 */
export function resolveClarificationLinks(
  clarifications: readonly { clarificationId: string; answersUnresolvedFactDeclarationId?: string | null }[],
  projection: ProjectionResult,
): readonly ResolvedClarificationLink[] {
  return clarifications.map(c => {
    const declared = typeof c.answersUnresolvedFactDeclarationId === 'string'
      && c.answersUnresolvedFactDeclarationId.length > 0
      ? c.answersUnresolvedFactDeclarationId : null;
    if (declared === null) {
      return { clarificationId: c.clarificationId, declarationId: null, factKey: null, unresolved: false };
    }
    const key = projection.declarationIdToFactKey[declared];
    return {
      clarificationId: c.clarificationId,
      declarationId: declared,
      factKey: key ?? null,
      unresolved: key === undefined,
    };
  });
}

/** Asserted by the suite: the projection creates no coverage, no settlement and no authority. */
export function firstPassProjectionEffect(): {
  factsMayBeSettled: false; coverageMayChange: false; citationsMayBeCreated: false;
  regulatoryTruthMayBeCreated: false; questionWordingMayBeInvented: false;
} {
  return {
    factsMayBeSettled: false, coverageMayChange: false, citationsMayBeCreated: false,
    regulatoryTruthMayBeCreated: false, questionWordingMayBeInvented: false,
  };
}

export { MODEL_AUTHORED_SOURCES };
