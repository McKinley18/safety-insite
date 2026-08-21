/**
 * KG-4B -- the canonical shadow comparison contract (Phases 1, 2, 12, 13).
 *
 * WHAT THIS IS FOR. KG-4A proved SHADOW *can* run without touching the customer. KG-4B has to make
 * what SHADOW *observes* useful: a mismatch corpus an operator can act on, rather than a percentage
 * that hides the one case that matters.
 *
 * ONE TAXONOMY. The brief requires a single canonical taxonomy, and this is it. KG-4A's nine-value
 * `ShadowMismatchCategory` in `cutover-observability.ts` is retained ONLY as a backward-compatible
 * projection of this one (`toLegacyMismatchCategory`), so there is exactly one classification engine
 * and the KG-4A suites keep asserting the names they already assert. Adding a second independent
 * classifier is precisely how a taxonomy stops being an analytical contract.
 *
 * PRIMARY + SECONDARY, NOT ONE LOSSY LABEL. A real mismatch often has several dimensions at once --
 * a paragraph that is absent from the release AND whose applicability is uncertain AND whose legacy
 * text differs. Forcing that into one enum value throws away most of what an operator needs. So a
 * comparison carries ONE primary category (for counting) plus structured boolean dimensions (for
 * filtering), and both are derived from the same inputs by the same function.
 *
 * THREE THINGS THIS FILE DELIBERATELY DOES NOT DO.
 *
 *  1. It never decides anything a customer sees. Shadow classification is downstream of the customer
 *     result and cannot feed back into it -- the customer payload is already fixed by the time a
 *     comparison exists.
 *  2. It never stores text. Content is compared by digest; the bodies never enter an event.
 *  3. It never treats "different" as "wrong". `EXPECTED_FALLBACK` is a first-class root cause, and
 *     severity is assigned separately from category, because a governance gap and a wrong
 *     jurisdiction are both "mismatches" and only one of them can block a cutover.
 */

import { createHash } from 'crypto';
import type { GovernedCutoverMode } from './cutover-mode';
import type { ApplicabilityState, GovernedBackingState } from './fallback-contract';
import type { GovernedResolutionResult, ResolverHealth } from './governed-resolution';
import type { ShadowMismatchCategory as LegacyMismatchCategory } from './cutover-observability';

/** Bumped whenever the event shape changes in a way an analyser must notice. */
export const SHADOW_EVENT_SCHEMA_VERSION = 'kg4b.shadow-comparison.v1';

// ------------------------------------------------------------------ Phase 2: the taxonomy

/**
 * The primary mismatch dimension. Exactly one per comparison, chosen by a fixed precedence so the
 * same inputs always produce the same label (Phase 15 requires this to be layout-independent).
 */
export type ShadowMismatchCategory =
  /** Governed and legacy agree on citation, on text availability, and on text content. */
  | 'EXACT_MATCH'
  /** Both supply text and the text is the same after conservative normalisation. */
  | 'CONTENT_EQUIVALENT'
  /** Both supply text and it genuinely differs. The governance backlog's sharpest signal. */
  | 'CONTENT_DIFFERENCE'
  /**
   * The governed layer answered for a DIFFERENT citation than the one requested.
   * MUST NOT HAPPEN -- KG-4A makes `resolvedCitation === requestedCitation` an invariant. Kept as a
   * category so a violation is counted as a defect in this system rather than filed under content.
   */
  | 'CITATION_DIFFERENCE'
  /** The exact paragraph is absent but its parent section is governed. No promotion occurs. */
  | 'GRANULARITY_DIFFERENCE'
  /** Governed supplies reviewer-approved content for the exact citation where legacy had none. */
  | 'GOVERNED_APPROVED_EXACT'
  /** A record exists in the release but nobody has attested to it. */
  | 'GOVERNED_UNAPPROVED'
  /** Approved with registered provenance, but the release carries no usable text. */
  | 'GOVERNED_CITATION_ONLY'
  /** The release holds no record for a citation HazLenz legitimately emitted. */
  | 'GOVERNED_MISSING'
  /**
   * Applicability is unestablished while governed backing is complete. NOT an error -- the two axes
   * are independent by design -- but it is the population an operator should look at first, because
   * it is where a reader is most likely to mistake a verified-text badge for a statement that the
   * rule applies.
   */
  | 'APPLICABILITY_DIFFERENCE'
  /** Legacy and governed disagree about the regulatory regime. Always blocking. */
  | 'JURISDICTION_DIFFERENCE'
  /** The same citations appear on both sides in a different order. */
  | 'ORDERING_DIFFERENCE'
  /** The resolver could not answer: DB error, no data source, pin failure. */
  | 'RESOLVER_FAILURE'
  /** Stale schema, malformed record, or an approval identity that does not match its content. */
  | 'INTEGRITY_FAILURE'
  /** Governed provenance would have been recorded differently than the customer result implies. */
  | 'PROVENANCE_DIFFERENCE';

export const ALL_MISMATCH_CATEGORIES: readonly ShadowMismatchCategory[] = Object.freeze([
  'EXACT_MATCH', 'CONTENT_EQUIVALENT', 'CONTENT_DIFFERENCE', 'CITATION_DIFFERENCE',
  'GRANULARITY_DIFFERENCE', 'GOVERNED_APPROVED_EXACT', 'GOVERNED_UNAPPROVED',
  'GOVERNED_CITATION_ONLY', 'GOVERNED_MISSING', 'APPLICABILITY_DIFFERENCE',
  'JURISDICTION_DIFFERENCE', 'ORDERING_DIFFERENCE', 'RESOLVER_FAILURE', 'INTEGRITY_FAILURE',
  'PROVENANCE_DIFFERENCE',
] as const);

/**
 * Secondary dimensions. Every one that applies is set, independently of the primary category, so a
 * multi-dimensional mismatch loses nothing. These are what an operator filters on.
 */
export interface ShadowMismatchDimensions {
  citationDiffers: boolean;
  granularityDiffers: boolean;
  contentDiffers: boolean;
  backingDiffers: boolean;
  applicabilityUncertain: boolean;
  jurisdictionDiffers: boolean;
  orderingDiffers: boolean;
  resolverFailed: boolean;
  integrityFailed: boolean;
  provenanceDiffers: boolean;
}

// ------------------------------------------------------------------ Phase 12: severity

/**
 * How much a mismatch matters to a CUTOVER decision. Deliberately separate from category:
 * "different" and "wrong" are not the same claim, and conflating them would make every governance
 * gap look like a defect -- which is exactly the pressure that leads someone to weaken a predicate
 * to make a number go up.
 */
export type MismatchSeverity =
  /** No cutover risk. The governed answer agrees, or differs only in presentation/metadata. */
  | 'INFORMATIONAL'
  /** Worth a human look before widening a cutover, but not by itself disqualifying. */
  | 'REVIEW'
  /** Would produce a materially wrong customer claim if governed mode were enabled. */
  | 'BLOCKING';

export const ALL_SEVERITIES: readonly MismatchSeverity[] =
  Object.freeze(['INFORMATIONAL', 'REVIEW', 'BLOCKING'] as const);

// ------------------------------------------------------------------ Phase 13: root cause

/** Who owns the remedy. This is what makes the corpus actionable rather than merely numerical. */
export type RootCauseBucket =
  /** HazLenz picked the citation; the governed layer had nothing to do with the difference. */
  | 'HAZLENZ_SELECTION'
  /** The release's text for this citation differs from the live corpus text. */
  | 'CORPUS_CONTENT'
  /** Section vs paragraph. The remedy is a paragraph-level record, or a coarser citation. */
  | 'CITATION_GRANULARITY'
  /** A record exists and simply has not been reviewed. The remedy is review. */
  | 'GOVERNANCE_APPROVAL'
  /** Placeholder or unregistered provenance. The remedy is sourcing. */
  | 'SOURCE_PROVENANCE'
  /** An applicability trigger is unestablished. NOT a governance problem. */
  | 'APPLICABILITY_EVIDENCE'
  /** The regimes disagree. Always serious. */
  | 'JURISDICTION'
  /** Same legal content, different rendering or metadata. */
  | 'PRESENTATION_ONLY'
  /** The resolver failed. Operational, not editorial. */
  | 'RESOLVER_FAILURE'
  /** The contract behaved exactly as designed and the difference is the designed fallback. */
  | 'EXPECTED_FALLBACK'
  /** No difference at all. */
  | 'NONE';

export const ALL_ROOT_CAUSES: readonly RootCauseBucket[] = Object.freeze([
  'HAZLENZ_SELECTION', 'CORPUS_CONTENT', 'CITATION_GRANULARITY', 'GOVERNANCE_APPROVAL',
  'SOURCE_PROVENANCE', 'APPLICABILITY_EVIDENCE', 'JURISDICTION', 'PRESENTATION_ONLY',
  'RESOLVER_FAILURE', 'EXPECTED_FALLBACK', 'NONE',
] as const);

// ------------------------------------------------------------------ Phase 1: the event

/**
 * One shadow comparison, as it is recorded.
 *
 * Every field is an identifier, a categorical state, a digest, or a number. There is no free text
 * and no customer content -- see `assertShadowEventPrivacySafe()`, which is run over every event
 * before it is written, not merely intended.
 */
export interface ShadowComparisonRecord {
  schemaVersion: typeof SHADOW_EVENT_SCHEMA_VERSION;
  event: 'governed_shadow_comparison';
  observedAt: string;

  /** Server-generated, stable for one analysis. Carries no customer identity. */
  correlationId: string;
  /** Stable within an analysis; identifies which finding this comparison belongs to. */
  findingKey: string | null;
  /**
   * Deterministic idempotency key: same analysis + same finding + same citation + same release
   * produces the same key. Phase 10 uses it to prove retries do not double-count.
   */
  eventKey: string;

  mode: GovernedCutoverMode;
  releaseId: string | null;
  /** The release's manifest identity, so a corpus can be re-derived from the events alone. */
  releaseManifestChecksum: string | null;

  requestedCitation: string;
  legacyCitation: string | null;
  governedResolvedCitation: string | null;

  applicability: ApplicabilityState;
  legacyBackingState: string;
  governedBackingState: GovernedBackingState;
  /** Approval identity of the governed record, when one resolved. */
  approvalContractVersion: number | null;
  approvalDigest: string | null;

  fallbackState: string;
  mismatch: ShadowMismatchCategory;
  dimensions: ShadowMismatchDimensions;
  severity: MismatchSeverity;
  rootCause: RootCauseBucket;

  resolverHealth: ResolverHealth;
  /** sha256 prefixes. The bodies are never recorded. */
  legacyTextDigest: string | null;
  governedTextDigest: string | null;

  hazardFamily: string | null;
  jurisdiction: string | null;

  latencyMs: number | null;
  /**
   * The proof obligation, on every event: the customer payload this analysis produced is identical
   * to the one LEGACY would have produced. False here is a hard failure, not a warning.
   */
  customerOutputUnchanged: boolean;
}

const digest = (value: unknown): string | null => {
  const text = String(value ?? '').trim();
  return text ? createHash('sha256').update(text).digest('hex').slice(0, 32) : null;
};

/**
 * Normalises regulatory prose for CONTENT_EQUIVALENT.
 *
 * Deliberately conservative: case, unicode punctuation variants, whitespace and terminal punctuation
 * only. It does NOT normalise "shall"/"must", numerals, or any word that could carry legal weight --
 * calling two differently-worded requirements equivalent is exactly the error this whole programme
 * exists to prevent.
 */
function normalizeForEquivalence(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[.;,]+$/g, '')
    .trim();
}

/**
 * Canonical regulatory regime, from any of the three vocabularies this system actually uses.
 *
 * The vocabularies really are three, and they really do not match by string comparison:
 *   request scope            'general_industry' | 'construction' | 'msha'
 *   result regulatoryContext 'osha-general-industry' | 'osha-construction' | 'msha'
 *   governed record payload  'OSHA/general_industry' | 'OSHA/construction' | 'MSHA/mining'
 *
 * The first KG-4B corpus run compared the raw strings and reported JURISDICTION_DIFFERENCE on 54 of
 * 83 comparisons -- including `29 CFR 1910.212(a)(1)` evaluated under OSHA General Industry, which
 * is obviously not a jurisdiction disagreement. A blocking-severity category firing on two thirds of
 * a corpus is not a finding, it is a broken instrument, and it would have buried any real
 * jurisdiction problem underneath it.
 *
 * Returns null when the regime is not established, and `jurisdictionsDisagree()` refuses to claim a
 * difference in that case -- the same "we do not know is not the same as there is none" rule the
 * resolver follows.
 */
export type CanonicalRegime = 'osha_general_industry' | 'osha_construction' | 'msha';

export function canonicalizeRegime(value: unknown): CanonicalRegime | null {
  const raw = String(value ?? '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (!raw || raw === 'unknown' || raw === 'null' || raw === 'undefined') return null;
  if (raw.includes('msha') || raw.includes('mining') || raw.includes('coal')) return 'msha';
  if (raw.includes('construction')) return 'osha_construction';
  if (raw.includes('general_industry')) return 'osha_general_industry';
  return null;
}

/**
 * True only when BOTH sides name a known regime and those regimes differ. An unestablished regime on
 * either side is not a disagreement.
 */
export function jurisdictionsDisagree(legacy: unknown, governed: unknown): boolean {
  const a = canonicalizeRegime(legacy);
  const b = canonicalizeRegime(governed);
  return a !== null && b !== null && a !== b;
}

export interface ShadowComparisonInput {
  governed: GovernedResolutionResult;
  /** What the customer actually received for this citation, from the LEGACY path. */
  legacyCitation: string | null;
  legacyText: string | null | undefined;
  legacyBackingState: string;
  applicability: ApplicabilityState;
  /** Regime the legacy path evaluated under, and the one the governed record declares. */
  legacyJurisdiction?: string | null;
  governedJurisdiction?: string | null;
  /** True when the same citation set appeared in a different order on the two sides. */
  orderingDiffers?: boolean;
  /** True when governed provenance would be recorded but the customer result is legacy. */
  provenanceDiffers?: boolean;
}

/**
 * The single classification function. Returns primary category, all secondary dimensions, severity
 * and root cause together, because deriving them in separate places is how they drift apart.
 *
 * PRECEDENCE for the primary category, and why:
 *   1. INTEGRITY_FAILURE       corruption outranks everything; it says the corpus cannot be trusted.
 *   2. RESOLVER_FAILURE        "we do not know" must never be filed as a content finding.
 *   3. CITATION_DIFFERENCE     a violation of this system's own invariant, not a corpus property.
 *   4. JURISDICTION_DIFFERENCE the most dangerous legal disagreement.
 *   5. GRANULARITY_DIFFERENCE  section/paragraph, before the generic "missing".
 *   6. backing-derived states  missing / unapproved / citation-only.
 *   7. content comparison      only reachable once backing is APPROVED_EXACT.
 *   8. ORDERING_DIFFERENCE     last, because it is the weakest signal.
 */
export function classifyShadowComparison(input: ShadowComparisonInput): {
  mismatch: ShadowMismatchCategory;
  dimensions: ShadowMismatchDimensions;
  severity: MismatchSeverity;
  rootCause: RootCauseBucket;
} {
  const g = input.governed;
  const legacyBody = String(input.legacyText ?? '').trim();
  const governedBody = String(g.standardText || g.plainLanguageSummary || '').trim();

  const integrityFailed = g.health === 'STALE_SCHEMA' || g.health === 'MALFORMED_RECORD';
  const resolverFailed = g.backing === 'RESOLVER_UNAVAILABLE' || g.backing === 'NO_ACTIVE_RELEASE';
  const citationDiffers = g.resolvedCitation !== g.requestedCitation;
  const granularityDiffers = g.backing === 'APPROVED_SECTION_ONLY';
  const jurisdictionDiffers = jurisdictionsDisagree(input.legacyJurisdiction, input.governedJurisdiction);
  const bothHaveText = Boolean(legacyBody) && Boolean(governedBody);
  const contentDiffers = bothHaveText &&
    normalizeForEquivalence(legacyBody) !== normalizeForEquivalence(governedBody);
  const backingDiffers = g.backing !== 'APPROVED_EXACT';
  const applicabilityUncertain = input.applicability === 'UNCERTAIN';
  const orderingDiffers = Boolean(input.orderingDiffers);
  const provenanceDiffers = Boolean(input.provenanceDiffers);

  const dimensions: ShadowMismatchDimensions = {
    citationDiffers, granularityDiffers, contentDiffers, backingDiffers,
    applicabilityUncertain, jurisdictionDiffers, orderingDiffers, resolverFailed, integrityFailed,
    provenanceDiffers,
  };

  let mismatch: ShadowMismatchCategory;
  let rootCause: RootCauseBucket;

  if (integrityFailed) {
    mismatch = 'INTEGRITY_FAILURE'; rootCause = 'RESOLVER_FAILURE';
  } else if (resolverFailed) {
    mismatch = 'RESOLVER_FAILURE'; rootCause = 'RESOLVER_FAILURE';
  } else if (citationDiffers) {
    mismatch = 'CITATION_DIFFERENCE'; rootCause = 'HAZLENZ_SELECTION';
  } else if (jurisdictionDiffers) {
    mismatch = 'JURISDICTION_DIFFERENCE'; rootCause = 'JURISDICTION';
  } else if (granularityDiffers) {
    mismatch = 'GRANULARITY_DIFFERENCE'; rootCause = 'CITATION_GRANULARITY';
  } else if (g.backing === 'NOT_IN_RELEASE') {
    mismatch = 'GOVERNED_MISSING'; rootCause = 'EXPECTED_FALLBACK';
  } else if (g.backing === 'UNAPPROVED_RECORD') {
    mismatch = 'GOVERNED_UNAPPROVED';
    rootCause = g.placeholderSource ? 'SOURCE_PROVENANCE' : 'GOVERNANCE_APPROVAL';
  } else if (g.backing === 'APPROVED_NO_TEXT') {
    mismatch = 'GOVERNED_CITATION_ONLY'; rootCause = 'CORPUS_CONTENT';
  } else if (contentDiffers) {
    mismatch = 'CONTENT_DIFFERENCE'; rootCause = 'CORPUS_CONTENT';
  } else if (bothHaveText) {
    // Same content after conservative normalisation.
    mismatch = legacyBody === governedBody ? 'EXACT_MATCH' : 'CONTENT_EQUIVALENT';
    rootCause = legacyBody === governedBody ? 'NONE' : 'PRESENTATION_ONLY';
  } else if (governedBody && !legacyBody) {
    // Governed supplies approved text where legacy had none. A pure gain.
    mismatch = 'GOVERNED_APPROVED_EXACT'; rootCause = 'CORPUS_CONTENT';
  } else if (orderingDiffers) {
    mismatch = 'ORDERING_DIFFERENCE'; rootCause = 'HAZLENZ_SELECTION';
  } else if (provenanceDiffers) {
    mismatch = 'PROVENANCE_DIFFERENCE'; rootCause = 'EXPECTED_FALLBACK';
  } else {
    mismatch = 'EXACT_MATCH'; rootCause = 'NONE';
  }

  // APPLICABILITY_DIFFERENCE is promoted only where it is the MOST INFORMATIVE thing to say: the
  // governed corpus fully backs the exact citation while HazLenz cannot establish that the rule
  // applies. That is the cell KG-3F built the 56.14132 predicate for, and the one where a reader is
  // most likely to mistake a verified-text badge for a statement about applicability.
  if (applicabilityUncertain && g.backing === 'APPROVED_EXACT' &&
      (mismatch === 'EXACT_MATCH' || mismatch === 'CONTENT_EQUIVALENT' ||
       mismatch === 'GOVERNED_APPROVED_EXACT')) {
    mismatch = 'APPLICABILITY_DIFFERENCE';
    rootCause = 'APPLICABILITY_EVIDENCE';
  }

  return { mismatch, dimensions, severity: severityFor(mismatch, dimensions), rootCause };
}

/**
 * Severity, assigned from the primary category plus the dimensions that can escalate it.
 *
 * BLOCKING is reserved for outcomes that would put a materially wrong claim in front of a customer
 * if governed mode were enabled. Everything the fallback contract was designed to absorb -- a
 * missing record, an unreviewed record, a section-only match -- is NOT blocking, because in
 * `GOVERNED_WITH_FALLBACK` the customer receives exactly today's legacy behaviour for those states.
 * Calling those blocking would make the corpus unreadable and would misdirect remediation.
 */
export function severityFor(
  mismatch: ShadowMismatchCategory, dimensions: ShadowMismatchDimensions,
): MismatchSeverity {
  switch (mismatch) {
    // A wrong regime, a substituted citation, or corrupt data would all produce a false claim.
    case 'JURISDICTION_DIFFERENCE':
    case 'CITATION_DIFFERENCE':
    case 'INTEGRITY_FAILURE':
      return 'BLOCKING';

    // Both sides carry text and it genuinely differs: one of them is what the customer would be
    // told is verified regulation. That must be adjudicated before any cutover.
    case 'CONTENT_DIFFERENCE':
      return 'BLOCKING';

    // Designed fallbacks. In GOVERNED_WITH_FALLBACK the customer sees today's behaviour.
    case 'GRANULARITY_DIFFERENCE':
    case 'GOVERNED_UNAPPROVED':
    case 'GOVERNED_CITATION_ONLY':
      return 'REVIEW';

    // Approved text beside an unestablished trigger. Not wrong -- the axes are independent -- but
    // it is the population where presentation must be checked before widening a cutover.
    case 'APPLICABILITY_DIFFERENCE':
      return 'REVIEW';

    // Operational. Does not reach the customer in SHADOW or under fallback, but must be visible.
    case 'RESOLVER_FAILURE':
      return 'REVIEW';

    case 'ORDERING_DIFFERENCE':
      return dimensions.contentDiffers ? 'REVIEW' : 'INFORMATIONAL';

    case 'GOVERNED_MISSING':
    case 'PROVENANCE_DIFFERENCE':
    case 'CONTENT_EQUIVALENT':
    case 'GOVERNED_APPROVED_EXACT':
    case 'EXACT_MATCH':
    default:
      return 'INFORMATIONAL';
  }
}

/** Backward-compatible projection onto KG-4A's nine names. ONE engine, two vocabularies. */
export function toLegacyMismatchCategory(mismatch: ShadowMismatchCategory): LegacyMismatchCategory {
  switch (mismatch) {
    case 'EXACT_MATCH': return 'EXACT_MATCH';
    case 'CONTENT_EQUIVALENT':
    case 'GOVERNED_APPROVED_EXACT': return 'GOVERNED_APPROVED_EQUIVALENT';
    case 'CITATION_DIFFERENCE': return 'CITATION_DIFFERENCE';
    case 'GRANULARITY_DIFFERENCE': return 'GRANULARITY_DIFFERENCE';
    case 'CONTENT_DIFFERENCE': return 'CONTENT_DIFFERENCE';
    case 'GOVERNED_MISSING':
    case 'GOVERNED_CITATION_ONLY': return 'MISSING_GOVERNED_RECORD';
    case 'GOVERNED_UNAPPROVED': return 'UNAPPROVED_GOVERNED_RECORD';
    case 'APPLICABILITY_DIFFERENCE': return 'APPLICABILITY_DISAGREEMENT';
    case 'JURISDICTION_DIFFERENCE':
    case 'ORDERING_DIFFERENCE':
    case 'PROVENANCE_DIFFERENCE': return 'CONTENT_DIFFERENCE';
    case 'RESOLVER_FAILURE':
    case 'INTEGRITY_FAILURE':
    default: return 'RESOLVER_FAILURE';
  }
}

/**
 * Deterministic idempotency key (Phase 10).
 *
 * Same analysis + finding + citation + release produces the same key, so a retried analysis emits
 * the SAME events rather than duplicates, and an analyser can deduplicate without guessing.
 */
export function shadowEventKey(input: {
  correlationId: string; findingKey: string | null; citation: string; releaseId: string | null;
}): string {
  return createHash('sha256')
    .update([input.correlationId, input.findingKey ?? '', input.citation, input.releaseId ?? ''].join(' '))
    .digest('hex').slice(0, 32);
}

export function buildShadowComparisonRecord(input: ShadowComparisonInput & {
  correlationId: string;
  findingKey?: string | null;
  mode: GovernedCutoverMode;
  releaseManifestChecksum?: string | null;
  approvalContractVersion?: number | null;
  approvalDigest?: string | null;
  fallbackState: string;
  hazardFamily?: string | null;
  jurisdiction?: string | null;
  latencyMs?: number | null;
  customerOutputUnchanged: boolean;
  observedAt?: string;
}): ShadowComparisonRecord {
  const classified = classifyShadowComparison(input);
  const g = input.governed;
  return {
    schemaVersion: SHADOW_EVENT_SCHEMA_VERSION,
    event: 'governed_shadow_comparison',
    observedAt: input.observedAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    findingKey: input.findingKey ?? null,
    eventKey: shadowEventKey({
      correlationId: input.correlationId, findingKey: input.findingKey ?? null,
      citation: g.requestedCitation, releaseId: g.releaseId,
    }),
    mode: input.mode,
    releaseId: g.releaseId,
    releaseManifestChecksum: input.releaseManifestChecksum ?? null,
    requestedCitation: g.requestedCitation,
    legacyCitation: input.legacyCitation,
    governedResolvedCitation: g.resolvedCitation,
    applicability: input.applicability,
    legacyBackingState: input.legacyBackingState,
    governedBackingState: g.backing,
    approvalContractVersion: input.approvalContractVersion ?? null,
    approvalDigest: input.approvalDigest ?? null,
    fallbackState: input.fallbackState,
    mismatch: classified.mismatch,
    dimensions: classified.dimensions,
    severity: classified.severity,
    rootCause: classified.rootCause,
    resolverHealth: g.health,
    legacyTextDigest: digest(input.legacyText),
    governedTextDigest: digest(g.standardText || g.plainLanguageSummary),
    hazardFamily: input.hazardFamily ?? null,
    jurisdiction: input.jurisdiction ?? null,
    latencyMs: input.latencyMs ?? null,
    customerOutputUnchanged: input.customerOutputUnchanged,
  };
}

// ------------------------------------------------------------------ Phase 11: privacy

/**
 * Fields a shadow event is ALLOWED to carry. An allowlist, not a denylist, because this event is
 * built by KG-4B code and any key that appears without being added here is a mistake by definition.
 * (`cutover-observability.ts` keeps its denylist for the lighter per-resolution event, which is
 * assembled from a wider variety of call sites.)
 */
export const SHADOW_EVENT_ALLOWED_FIELDS: readonly string[] = Object.freeze([
  'schemaVersion', 'event', 'observedAt', 'correlationId', 'findingKey', 'eventKey', 'mode',
  'releaseId', 'releaseManifestChecksum', 'requestedCitation', 'legacyCitation',
  'governedResolvedCitation', 'applicability', 'legacyBackingState', 'governedBackingState',
  'approvalContractVersion', 'approvalDigest', 'fallbackState', 'mismatch', 'dimensions',
  'severity', 'rootCause', 'resolverHealth', 'legacyTextDigest', 'governedTextDigest',
  'hazardFamily', 'jurisdiction', 'latencyMs', 'customerOutputUnchanged',
]);

/** Longest a categorical/identifier value may be. Citations and release ids are far below this. */
const MAX_FIELD_LENGTH = 200;

/**
 * Proves an event carries no customer content, by inspecting the ACTUAL object rather than trusting
 * the schema. Throws with a specific reason; callers run it before every write.
 */
export function assertShadowEventPrivacySafe(event: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(event)) {
    if (!SHADOW_EVENT_ALLOWED_FIELDS.includes(key)) {
      throw new Error(`Shadow event carries unexpected field '${key}'; the allowlist is the contract.`);
    }
    if (typeof value === 'string') {
      if (value.length > MAX_FIELD_LENGTH) {
        throw new Error(`Shadow event field '${key}' is ${value.length} chars; identifiers only.`);
      }
      if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) {
        throw new Error(`Shadow event field '${key}' looks like an email address.`);
      }
    }
    if (key === 'dimensions') {
      for (const [flag, flagValue] of Object.entries(value as Record<string, unknown>)) {
        if (typeof flagValue !== 'boolean') {
          throw new Error(`Shadow event dimension '${flag}' must be a boolean.`);
        }
      }
    }
  }
}
