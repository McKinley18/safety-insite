/**
 * KG-4A Phases 11 and 12 -- privacy-safe observability, and the server-side shadow comparison
 * contract.
 *
 * WHAT MAY BE OBSERVED. Identifiers and categorical diagnostics: the mode, the release id, the
 * citation, the states, the reason codes, timings, and a hash when identity matters. A regulatory
 * citation is a public identifier, not customer data, so it is safe to record; everything derived
 * from what the customer actually WROTE or PHOTOGRAPHED is not.
 *
 * WHAT MAY NEVER BE OBSERVED, enforced by `assertNoSensitiveFields()` rather than by discipline:
 * observation text, report content, evidence facts, secrets, tokens, emails, names, and the
 * regulatory TEXT itself (large, and it makes log volume track corpus size rather than traffic).
 * Governed vs legacy text is compared by DIGEST, never by logging both bodies.
 *
 * WHY SHADOW MISMATCHES ARE NOT CUSTOMER-VISIBLE. A mismatch is a statement about the governance
 * backlog, not about the finding. Surfacing "governed and legacy disagree" to an inspector would
 * present an internal migration state as a property of their hazard, which it is not.
 */

import { createHash } from 'crypto';
import type { GovernedCutoverMode, CutoverEnablementReason } from './cutover-mode';
import type {
  ApplicabilityState, GovernedBackingState, DeliveryState, FallbackReasonCode, BackingFailureClass,
} from './fallback-contract';
import type { GovernedResolutionResult, ResolutionGranularity, ResolverHealth } from './governed-resolution';

/** One governed-resolution decision, as it is recorded. Every field is categorical or an identifier. */
export interface GovernedResolutionEvent {
  event: 'governed_resolution';
  /** The mode this REQUEST ran in (post-enablement), never the server-configured mode alone. */
  mode: GovernedCutoverMode;
  configuredMode: GovernedCutoverMode;
  enablementReason: CutoverEnablementReason;
  /** The PINNED release, so an event can always be tied back to one snapshot. */
  releaseId: string | null;
  /** Public regulatory identifier. Safe. */
  requestedCitation: string;
  resolvedCitation: string;
  granularity: ResolutionGranularity;
  applicability: ApplicabilityState;
  backing: GovernedBackingState;
  deliveryState: DeliveryState;
  fallbackReason: FallbackReasonCode;
  failureClass: BackingFailureClass;
  resolverHealth: ResolverHealth;
  resolverSucceeded: boolean;
  governedProvenanceEligible: boolean;
  /** Correlates every event in one analysis. Server-generated; carries no customer identity. */
  analysisTraceId: string | null;
  durationMs: number | null;
}

/** How a shadow-mode governed result differs from what the customer actually received. */
export type ShadowMismatchCategory =
  /** Governed and legacy agree on citation, availability of text, and text content. */
  | 'EXACT_MATCH'
  /** Governed supplies approved text whose content is byte-identical to the legacy text. */
  | 'GOVERNED_APPROVED_EQUIVALENT'
  /** The governed layer answered for a different citation. MUST NOT HAPPEN -- see the invariant. */
  | 'CITATION_DIFFERENCE'
  /** Only the parent section is governed; the paragraph is not. */
  | 'GRANULARITY_DIFFERENCE'
  /** Both have text and the text differs. The governance backlog's most actionable signal. */
  | 'CONTENT_DIFFERENCE'
  /** The release holds no record for a citation HazLenz legitimately emitted. */
  | 'MISSING_GOVERNED_RECORD'
  /** A record exists but nobody has attested to it. */
  | 'UNAPPROVED_GOVERNED_RECORD'
  /**
   * Applicability and backing disagree in a way worth watching: HazLenz is uncertain the rule
   * applies, yet the governed corpus fully backs its text (or the reverse). NOT an error -- the two
   * axes are independent by design -- but it is the population where an operator would look first
   * before widening a cutover.
   */
  | 'APPLICABILITY_DISAGREEMENT'
  /** The resolver could not answer. */
  | 'RESOLVER_FAILURE';

export interface ShadowComparisonEvent {
  event: 'governed_shadow_comparison';
  mode: 'SHADOW';
  releaseId: string | null;
  citation: string;
  applicability: ApplicabilityState;
  backing: GovernedBackingState;
  mismatch: ShadowMismatchCategory;
  /** sha256 of the legacy body text, or null. The text itself is never recorded. */
  legacyTextDigest: string | null;
  governedTextDigest: string | null;
  /**
   * PROOF OBLIGATION, recorded on every shadow event: the customer payload the shadow run produced
   * is identical to the one LEGACY would have produced. False here is a hard failure, not a warning.
   */
  customerOutputUnchanged: boolean;
  analysisTraceId: string | null;
  durationMs: number | null;
}

const digest = (value: unknown): string | null => {
  const text = String(value ?? '').trim();
  return text ? createHash('sha256').update(text).digest('hex').slice(0, 32) : null;
};

/**
 * Classifies one shadow observation.
 *
 * Order is load-bearing. Resolver failure is checked first because a failed resolution says nothing
 * about content; the citation invariant is checked next because a violation of it is a defect in
 * this system rather than a property of the corpus, and it must never be filed under a content
 * category where it would be read as backlog.
 */
export function classifyShadowMismatch(
  governed: GovernedResolutionResult,
  legacyText: string | null | undefined,
  applicability: ApplicabilityState,
): ShadowMismatchCategory {
  if (governed.backing === 'RESOLVER_UNAVAILABLE' || governed.backing === 'NO_ACTIVE_RELEASE') {
    return 'RESOLVER_FAILURE';
  }
  if (governed.resolvedCitation !== governed.requestedCitation) return 'CITATION_DIFFERENCE';
  if (governed.backing === 'APPROVED_SECTION_ONLY') return 'GRANULARITY_DIFFERENCE';
  if (governed.backing === 'NOT_IN_RELEASE') return 'MISSING_GOVERNED_RECORD';
  if (governed.backing === 'UNAPPROVED_RECORD') return 'UNAPPROVED_GOVERNED_RECORD';
  if (governed.backing === 'APPROVED_NO_TEXT') return 'MISSING_GOVERNED_RECORD';

  // APPROVED_EXACT from here on.
  const legacy = String(legacyText || '').trim();
  const governedBody = String(governed.standardText || governed.plainLanguageSummary || '').trim();
  if (applicability === 'UNCERTAIN') return 'APPLICABILITY_DISAGREEMENT';
  if (!legacy && governedBody) return 'GOVERNED_APPROVED_EQUIVALENT';
  if (legacy === governedBody) return 'EXACT_MATCH';
  return 'CONTENT_DIFFERENCE';
}

export function buildShadowComparisonEvent(input: {
  governed: GovernedResolutionResult;
  legacyText: string | null | undefined;
  applicability: ApplicabilityState;
  customerOutputUnchanged: boolean;
  analysisTraceId?: string | null;
  durationMs?: number | null;
}): ShadowComparisonEvent {
  return {
    event: 'governed_shadow_comparison',
    mode: 'SHADOW',
    releaseId: input.governed.releaseId,
    citation: input.governed.requestedCitation,
    applicability: input.applicability,
    backing: input.governed.backing,
    mismatch: classifyShadowMismatch(input.governed, input.legacyText, input.applicability),
    legacyTextDigest: digest(input.legacyText),
    governedTextDigest: digest(input.governed.standardText || input.governed.plainLanguageSummary),
    customerOutputUnchanged: input.customerOutputUnchanged,
    analysisTraceId: input.analysisTraceId ?? null,
    durationMs: input.durationMs ?? null,
  };
}

/**
 * The forbidden-field guard, run over every event before it is emitted.
 *
 * A denylist of key names plus a value-shape check for the two things that leak by accident: an
 * email address, and a body of prose long enough to be observation or report text. Citations,
 * release ids, state names and digests are all far below the length ceiling, so the check costs
 * nothing in the normal case and catches the mistake that matters.
 */
const FORBIDDEN_KEYS = [
  'observation', 'observationText', 'text', 'body', 'standardText', 'plainLanguageSummary',
  'summary', 'email', 'password', 'token', 'secret', 'jwt', 'authorization', 'reportContent',
  'evidenceFacts', 'photo', 'imageUrl', 'userName', 'notes',
];

export function assertNoSensitiveFields(event: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(event)) {
    if (FORBIDDEN_KEYS.includes(key)) {
      throw new Error(`Governed cutover observability may not record field '${key}'.`);
    }
    if (typeof value === 'string') {
      if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) {
        throw new Error(`Governed cutover observability may not record an email address (field '${key}').`);
      }
      if (value.length > 200) {
        throw new Error(
          `Governed cutover observability field '${key}' is ${value.length} chars; ` +
          'identifiers and categorical diagnostics only.',
        );
      }
    }
  }
}

/**
 * Emits one event.
 *
 * Structured, single-line JSON on stdout, matching how the rest of the backend reports diagnostics.
 * Silent unless observability is explicitly enabled -- a cutover mechanism that is off must be
 * silent, otherwise "default off" is not observable as off.
 *
 * NEVER THROWS to the caller. The guard runs first and is allowed to throw INSIDE the try, so a
 * developer adding a sensitive field sees it fail in tests, while a production customer request can
 * never fail because of a logging bug.
 */
export function emitCutoverEvent(
  event: GovernedResolutionEvent | ShadowComparisonEvent,
  env: Record<string, string | undefined> = process.env,
): void {
  if (String(env.GOVERNED_CUTOVER_OBSERVABILITY || '').trim() !== 'enabled') return;
  try {
    assertNoSensitiveFields(event as unknown as Record<string, unknown>);
    console.log(JSON.stringify(event));
  } catch (error) {
    console.error(`[governed-cutover] observability suppressed: ${(error as Error).message}`);
  }
}
