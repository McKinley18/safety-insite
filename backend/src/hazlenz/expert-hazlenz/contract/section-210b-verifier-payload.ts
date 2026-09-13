/**
 * §210B-1 -- SINGLE-FACT VERIFIER PAYLOAD, EXPLICIT OWED PROPERTY, STRUCTURAL PRESERVATION.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. DEVELOPMENT SCOPE ONLY.
 *
 * ==================== WHAT §210A ACTUALLY FOUND, CORRECTED HERE ====================
 *
 * §210A reported that sibling OwedFacts are supplied to the verifier. Reading the assembly module
 * that built the historical requests shows that is NOT so: `assembleVerifierRequests` already
 * passes `owedFacts: [target]`, a single-element array. The correlation §210A measured is real --
 * every axis-L slot on a multi-fact row drifted, 6 of 6 -- but the CHANNEL is different, and the
 * adjudicator's own reasons name it precisely:
 *
 *     "also evaluates the separate liquid-identity CLARIFICATION"       (AC-03)
 *     "also evaluates the tongue-guard CLARIFICATION, the PAT-label..." (AC-02)
 *     "also evaluates the unlocked air valve and incomplete procedure"  (AC-22 -- CANDIDATES)
 *
 * Sibling properties reach the verifier through the CLARIFICATION list, the HAZARD CANDIDATE block
 * and the row-level SUMMARY -- not through the fact list. Multi-fact rows simply have more of all
 * three. This module isolates the channels that actually carry the neighbours.
 *
 * ==================== THE ISOLATION RULE, AND WHY IT IS DELIBERATELY TIMID ====================
 *
 * Clarifications carry `answersUnresolvedFactDeclarationId`; clarifications carry
 * `relatesToCandidateKey`. Those are MODEL-AUTHORED EXPLICIT LINKS. This module uses only those.
 *
 *     EXCLUDE  only when an object is explicitly bound to a DIFFERENT declaration of this row.
 *     RETAIN   whenever the binding is absent, empty, or points at something not on this row.
 *
 * There is no matcher, no similarity, no keyword and no inference of any kind. §210A measured that
 * the binding field is inconsistently populated -- 10 of 24 cases carry at least one clarification
 * with no binding -- so a rule that dropped unbound objects would delete the TARGET's own
 * clarification on those rows. The authorization is explicit: where safe deterministic isolation
 * cannot establish whether a neighbour is needed, RETAIN IT rather than infer semantics.
 *
 * The measured consequence, stated plainly rather than smoothed over:
 *
 *     AC-01 fact 1, AC-01 fact 2, AC-20 fact 1, AC-20 fact 2   FULLY ISOLATED (both channels)
 *     AC-02 fact 1   candidates isolated, clarification retained (its binding is absent)
 *     AC-02 fact 2   clarification isolated, candidates retained
 *     AC-03 fact 1   NOT ISOLATED -- both clarifications are unbound
 *     AC-22 fact 1   NOT ISOLATED -- single clarification, no candidate link
 *
 * Four of the eight G6 slots are fully isolated, two partially, two not at all. The residual is
 * caused by the same emission-contract weakness RC-D identified, and closing it is a §210B-2
 * semantic responsibility (S2), not something deterministic code may paper over here.
 *
 * ==================== THE OWED-PROPERTY SIDECAR (TBR-17) ====================
 *
 * `missingFact` is the model's own statement of the property. It does not exist on `OwedFact` at
 * all -- it is dropped when the declaration becomes an OwedFact, so `projectOwedFact` never had it
 * to lose. AC-10 is the cost: the before/after proving qualifier lived in `missingFact` and the
 * clarification, and the verifier saw neither.
 *
 * `verifier-v3-development-boundary.ts` is sha256-PINNED by §187's preregistration and re-asserted
 * by eleven verify-19x source-integrity scripts. Editing it to add a field would break a frozen
 * verification contract to obtain a better result, which the repository forbids. So this is a
 * SIDECAR, exactly as the authorization permits: the pinned projection is called unchanged and its
 * output is accompanied by, never rewritten with, the explicit property.
 *
 * Representation: O4-EQUIVALENT SIDECAR. Transport is byte-exact -- the string is copied, never
 * parsed, summarised, normalised, re-cased, trimmed or regenerated.
 */

export const SECTION_210B_PAYLOAD_VERSION =
  'hazlenz.expert.210b.single-fact-verifier-payload.v1' as const;

export const OWED_PROPERTY_REPRESENTATION = {
  choice: 'O4_EQUIVALENT_SIDECAR',
  why: 'the canonical OwedFact cannot carry the field: verifier-v3-development-boundary.ts is '
    + 'sha256-pinned by §187 and re-asserted by eleven source-integrity scripts, and owed-fact.types.ts '
    + 'is pinned too. A sidecar is the narrowest explicit verifier-facing representation that adds '
    + 'the property without touching a frozen contract.',
  source: 'unresolvedFactDeclarations[].missingFact, model-authored',
  transform: 'NONE — byte-exact copy',
  deterministicCodeMayNot: [
    'rewrite it', 'summarise it', 'parse it', 'normalise it', 'regenerate it',
    'infer it when absent',
  ],
} as const;

export interface DeclarationLike {
  declarationId: string;
  missingFact?: unknown;
  [k: string]: unknown;
}
export interface ClarificationLike {
  clarificationId?: unknown;
  question?: unknown;
  affectedDecision?: unknown;
  answersUnresolvedFactDeclarationId?: unknown;
  relatesToCandidateKey?: unknown;
  [k: string]: unknown;
}
export interface CandidateLike { candidateKey?: unknown; [k: string]: unknown }

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export type RetentionReason =
  | 'BOUND_TO_TARGET'
  | 'RETAINED_BINDING_ABSENT'
  | 'RETAINED_BINDING_NOT_ON_THIS_ROW'
  | 'EXCLUDED_BOUND_TO_SIBLING';

export interface IsolationDecision<T> {
  item: T;
  id: string;
  retained: boolean;
  reason: RetentionReason;
}

/**
 * Clarification isolation. Excludes ONLY an explicit binding to a different declaration that is
 * itself present on this row. Everything else is retained.
 */
export function isolateClarifications(
  clarifications: readonly ClarificationLike[],
  targetDeclarationId: string,
  rowDeclarationIds: readonly string[],
): IsolationDecision<ClarificationLike>[] {
  return clarifications.map(c => {
    const id = str(c.clarificationId);
    const bound = str(c.answersUnresolvedFactDeclarationId);
    if (bound === '') return { item: c, id, retained: true, reason: 'RETAINED_BINDING_ABSENT' };
    if (bound === targetDeclarationId) return { item: c, id, retained: true, reason: 'BOUND_TO_TARGET' };
    if (!rowDeclarationIds.includes(bound)) {
      return { item: c, id, retained: true, reason: 'RETAINED_BINDING_NOT_ON_THIS_ROW' };
    }
    return { item: c, id, retained: false, reason: 'EXCLUDED_BOUND_TO_SIBLING' };
  });
}

/**
 * Candidate isolation. A candidate is excluded only when the target's OWN retained clarifications
 * name at least one candidate key (so the target's origin is explicitly known) and this candidate
 * is not among them. If no clarification bound to the target names a candidate, the target's origin
 * is unknown and the whole block is retained.
 */
export function isolateCandidates(
  candidates: readonly CandidateLike[],
  clarifications: readonly ClarificationLike[],
  targetDeclarationId: string,
): IsolationDecision<CandidateLike>[] {
  const targetKeys = new Set(
    clarifications
      .filter(c => str(c.answersUnresolvedFactDeclarationId) === targetDeclarationId)
      .map(c => str(c.relatesToCandidateKey))
      .filter(k => k !== ''));

  return candidates.map(c => {
    const id = str(c.candidateKey);
    if (targetKeys.size === 0) {
      return { item: c, id, retained: true, reason: 'RETAINED_BINDING_ABSENT' };
    }
    if (targetKeys.has(id)) return { item: c, id, retained: true, reason: 'BOUND_TO_TARGET' };
    return { item: c, id, retained: false, reason: 'EXCLUDED_BOUND_TO_SIBLING' };
  });
}

/** The explicit owed property. Byte-exact, or null when the model authored none. */
export function explicitOwedProperty(declaration: DeclarationLike): string | null {
  const v = declaration.missingFact;
  return typeof v === 'string' && v.length > 0 ? v : null;
}

// ================================================================ structural preservation

export interface PreservationFinding { check: string; held: boolean; detail: string }

/**
 * Structural, non-semantic preservation checks. Each is byte identity, field presence or explicit
 * link presence. NONE of them decides whether one phrase semantically implies another -- that stays
 * a model responsibility, and "person" vs "person plus materials" is exactly the judgement this
 * layer must never make.
 */
export function structuralPreservationChecks(args: {
  declaration: DeclarationLike;
  projected: Record<string, unknown>;
  sidecarProperty: string | null;
  retainedClarificationIds: readonly string[];
  boundClarificationIds: readonly string[];
}): PreservationFinding[] {
  const f: PreservationFinding[] = [];
  const authored = explicitOwedProperty(args.declaration);

  f.push({
    check: 'OWED_PROPERTY_SURVIVES_BYTE_EXACT',
    held: authored === null ? args.sidecarProperty === null : args.sidecarProperty === authored,
    detail: authored === null
      ? 'the model authored no missingFact; the sidecar is null and nothing was invented'
      : 'the sidecar equals declaration.missingFact byte for byte',
  });

  for (const field of ['branchA', 'branchB', 'evidenceSpan', 'whyUnresolved']) {
    f.push({
      check: `PROJECTION_RETAINS_${field.toUpperCase()}`,
      held: args.projected[field] !== undefined && args.projected[field] !== null,
      detail: `projected.${field} is present`,
    });
  }
  const dd = args.projected.decisionDivergence as { ifA?: unknown; ifB?: unknown } | undefined;
  f.push({
    check: 'PROJECTION_RETAINS_DECISION_DIVERGENCE',
    held: dd !== undefined && typeof dd.ifA === 'string' && typeof dd.ifB === 'string',
    detail: 'projected.decisionDivergence carries both ifA and ifB',
  });

  for (const field of ['branchA', 'branchB'] as const) {
    const declared = str(args.declaration[field]);
    const projected = str(args.projected[field]);
    f.push({
      check: `${field.toUpperCase()}_TRANSPORTED_WITHOUT_TRUNCATION`,
      held: declared === '' || declared === projected,
      detail: declared === projected
        ? 'byte-identical to the declaration'
        : `DIVERGED: declaration ${declared.length} chars, projected ${projected.length} chars`,
    });
  }

  f.push({
    check: 'TARGET_CLARIFICATION_LINK_INTACT',
    held: args.boundClarificationIds.every(id => args.retainedClarificationIds.includes(id)),
    detail: 'every clarification explicitly bound to this target survived isolation',
  });

  return f;
}

// ================================================================ static prefix (TBR-19)

export interface PrefixSegment { name: string; stable: boolean; bytes: number }

/**
 * Reports how many bytes remain constant before the first case-varying byte. Reordering only --
 * this function measures, it never edits instruction content.
 */
export function staticPrefixReport(segments: readonly PrefixSegment[]): {
  orderedForCaching: boolean;
  stablePrefixBytes: number;
  totalBytes: number;
  cacheablePrefixFraction: number;
  firstDynamicSegment: string | null;
  recommendedOrder: string[];
} {
  const total = segments.reduce((n, s) => n + s.bytes, 0);
  let prefix = 0;
  let firstDynamic: string | null = null;
  for (const s of segments) {
    if (s.stable && firstDynamic === null) prefix += s.bytes;
    else if (firstDynamic === null) firstDynamic = s.name;
  }
  const stableTotal = segments.filter(s => s.stable).reduce((n, s) => n + s.bytes, 0);
  return {
    orderedForCaching: prefix === stableTotal,
    stablePrefixBytes: prefix,
    totalBytes: total,
    cacheablePrefixFraction: total === 0 ? 0 : prefix / total,
    firstDynamicSegment: firstDynamic,
    recommendedOrder: [
      ...segments.filter(s => s.stable).map(s => s.name),
      ...segments.filter(s => !s.stable).map(s => s.name),
    ],
  };
}
