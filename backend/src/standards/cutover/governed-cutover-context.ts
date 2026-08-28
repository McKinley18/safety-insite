/**
 * KG-4A -- the ONE integration seam.
 *
 * Phase 1 identified `resolveStandardsBacking()` as the single decision point for content backing
 * on both customer paths, and it already accepts an optional pre-resolved `governed` input that
 * nothing customer-facing ever produced. This module produces it -- once per analysis -- and is the
 * only thing the customer paths import from `standards/cutover/`.
 *
 * WHY A CONTEXT OBJECT AND NOT A SERVICE CALL PER CITATION.
 *
 *  - The release must be pinned once (Phase 9). A per-citation service call would re-read the
 *    active pointer and could straddle an activation.
 *  - Provenance must be decided from what the findings ACTUALLY consumed (Phase 7). Something has
 *    to accumulate that, and it must be the same thing that made the decisions, or the two can
 *    disagree.
 *  - Per-analysis caching removes the N+1 the brief asks about in Phase 19: a multi-finding
 *    analysis cites the same regulation repeatedly, and one pinned release plus a per-citation
 *    memo means each distinct citation is resolved at most once.
 *
 * NO REQUEST-GLOBAL MUTABLE STATE. The context is constructed per analysis and passed by argument.
 * There is no module-level cache, no `AsyncLocalStorage`, no singleton. Two analyses running
 * concurrently share nothing, which is the Phase 17 parallel-analysis property.
 *
 * LEGACY IS STRUCTURALLY INERT. In LEGACY mode `createGovernedCutoverContext()` returns null, the
 * call sites take their original expression unchanged, and no code in this directory executes. That
 * is what makes "LEGACY preserves current behaviour" a structural fact rather than a test result.
 */

import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import {
  resolveCutoverMode, resolveCutoverEnablement,
  type CutoverEnablement, type CutoverPrincipal, type GovernedCutoverMode,
} from './cutover-mode';
import {
  pinGovernedRelease, resolveGoverned, toGovernedBackingInput,
  type GovernedReleasePin, type GovernedResolutionResult,
} from './governed-resolution';
import {
  decideFallback, toApplicabilityState,
  type ApplicabilityState, type FallbackDecision,
} from './fallback-contract';
import type { FindingProvenanceContribution } from './governed-provenance';
import {
  emitCutoverEvent, buildShadowComparisonEvent, type GovernedResolutionEvent,
} from './cutover-observability';
import {
  buildShadowComparisonRecord, assertShadowEventPrivacySafe,
  type ShadowComparisonRecord,
} from './shadow-comparison';
import type { GovernedBackingInput } from '../display/standards-backing-contract';

export interface GovernedStandardDecision {
  resolution: GovernedResolutionResult;
  decision: FallbackDecision;
  /**
   * What to hand `resolveStandardsBacking()`. ALWAYS null in SHADOW, so a shadow run cannot alter
   * customer output even if a future caller forgets which mode it is in.
   */
  governedBackingInput: GovernedBackingInput | null;
  /** Governed text to display, or null. Non-null only when the decision says text is verified. */
  verifiedText: { standardText: string | null; plainLanguageSummary: string | null; title: string | null } | null;
  /**
   * KG-4B. May ANY of this decision reach the customer payload?
   *
   * False in SHADOW. Found by KG-4B's invariance oracle: SHADOW correctly withheld governed BACKING
   * and governed TEXT, but `projectGovernedDisplay()` still stamped `governedDeliveryState`,
   * `governedFallbackReason` and `governedTextUnavailable` onto every standard decision. Those are
   * internal diagnostics, and adding keys to a response IS altering customer output -- a SHADOW
   * customer's payload was distinguishable from a LEGACY customer's by inspection.
   *
   * The oracle caught it because it compares whole payloads rather than the fields the
   * implementation happens to think matter.
   */
  customerVisible: boolean;
}

export class GovernedCutoverContext {
  private readonly cache = new Map<string, GovernedResolutionResult>();
  private readonly consumption: FindingProvenanceContribution[] = [];
  /**
   * KG-4B. The shadow mismatch corpus for THIS analysis. Populated only in SHADOW mode, and only
   * after the customer decision is already fixed -- a comparison is downstream of the result and
   * cannot feed back into it.
   */
  private readonly shadowRecords: ShadowComparisonRecord[] = [];

  /**
   * KG-4B. Correlates every shadow event from ONE analysis, and nothing else.
   *
   * Server-generated per context, so it carries no customer identity and cannot be supplied or
   * influenced by a request. A trace id is used when the caller has one; otherwise a fresh UUID.
   *
   * NOT optional, and NOT a shared constant. The first KG-4B corpus run defaulted to the literal
   * string 'anonymous-analysis' when no trace id was present, which collapsed all 43 analyses into
   * one correlation and made `eventKey` collide across analyses -- 83 events reported as 43 distinct
   * keys with 40 phantom "duplicates". An idempotency key that is not unique per analysis is worse
   * than no idempotency key, because it silently MERGES observations that should be counted apart.
   */
  readonly correlationId: string;

  private constructor(
    readonly mode: GovernedCutoverMode,
    readonly enablement: CutoverEnablement,
    readonly pin: GovernedReleasePin,
    private readonly dataSource: DataSource | null,
    private readonly analysisTraceId: string | null,
    private readonly env: Record<string, string | undefined>,
  ) {
    this.correlationId = analysisTraceId && analysisTraceId.trim() ? analysisTraceId.trim() : randomUUID();
  }

  static async create(input: {
    dataSource: DataSource | null | undefined;
    principal: CutoverPrincipal | null | undefined;
    analysisTraceId?: string | null;
    /**
     * The release this analysis's INSPECTION is bound to, resolved once by
     * `standards/releases/inspection-release-binding.ts` before the pipeline runs.
     *
     * Absent (the default) preserves the KG-4A behaviour exactly: the active pointer is read once.
     * Present means this inspection already has a regulatory basis, and the pin honours it rather
     * than re-reading a pointer that may have moved since the inspection was created.
     */
    boundReleaseId?: string | null;
    env?: Record<string, string | undefined>;
  }): Promise<GovernedCutoverContext | null> {
    const env = input.env ?? process.env;
    const configured = resolveCutoverMode(env);
    const enablement = resolveCutoverEnablement(input.principal, env, configured);

    // The default path, and the only path any customer takes today. Returning null rather than a
    // LEGACY context means the call sites cannot accidentally route through governed code at all.
    if (enablement.effectiveMode === 'LEGACY') return null;

    const pin = await pinGovernedRelease(
      input.dataSource ?? null, enablement.effectiveMode, input.boundReleaseId ?? null,
    );
    return new GovernedCutoverContext(
      enablement.effectiveMode, enablement, pin,
      input.dataSource ?? null, input.analysisTraceId ?? null, env,
    );
  }

  /**
   * Resolves one citation and decides what the customer gets.
   *
   * Total: never throws. Every database and integrity condition is already mapped onto a backing
   * state the fallback table has a row for, so a governance failure degrades to legacy behaviour
   * rather than to a 500 (Phase 10).
   */
  async resolveStandard(input: {
    citation: string;
    applicabilityStatus?: string | null;
    findingKey?: string | null;
    /** The legacy body text, used ONLY for the shadow digest comparison. Never displayed from here. */
    legacyText?: string | null;
    /** KG-4B shadow-corpus context. All categorical/identifier; never customer prose. */
    legacyCitation?: string | null;
    legacyBackingState?: string | null;
    hazardFamily?: string | null;
    jurisdiction?: string | null;
    legacyJurisdiction?: string | null;
  }): Promise<GovernedStandardDecision> {
    const startedAt = Date.now();
    const applicability: ApplicabilityState = toApplicabilityState(input.applicabilityStatus);
    const citation = String(input.citation || '').trim();

    let resolution = this.cache.get(citation);
    if (!resolution) {
      resolution = await resolveGoverned(this.dataSource, this.pin, citation);
      this.cache.set(citation, resolution);
    }

    const decision = decideFallback(this.mode, applicability, resolution.backing);

    // Provenance is recorded from the DECISION, not from the resolution. A successful governed
    // lookup whose content the customer never sees contributes nothing.
    this.consumption.push({
      findingKey: String(input.findingKey || citation),
      citation,
      governedProvenanceEligible: decision.governedProvenanceEligible,
    });

    const durationMs = Date.now() - startedAt;
    const event: GovernedResolutionEvent = {
      event: 'governed_resolution',
      mode: this.mode,
      configuredMode: this.enablement.configuredMode,
      enablementReason: this.enablement.reason,
      releaseId: resolution.releaseId,
      requestedCitation: resolution.requestedCitation,
      resolvedCitation: resolution.resolvedCitation,
      granularity: resolution.granularity,
      applicability,
      backing: resolution.backing,
      deliveryState: decision.deliveryState,
      fallbackReason: decision.reasonCode,
      failureClass: decision.failureClass,
      resolverHealth: resolution.health,
      resolverSucceeded: resolution.health === 'OK',
      governedProvenanceEligible: decision.governedProvenanceEligible,
      analysisTraceId: this.analysisTraceId,
      durationMs,
    };
    emitCutoverEvent(event, this.env);

    if (this.mode === 'SHADOW') {
      emitCutoverEvent(buildShadowComparisonEvent({
        governed: resolution,
        legacyText: input.legacyText,
        applicability,
        // Structurally true: the two returned fields below are hard-coded null for SHADOW, so
        // there is no value a shadow run could put into the customer payload.
        customerOutputUnchanged: true,
        analysisTraceId: this.analysisTraceId,
        durationMs,
      }), this.env);

      // KG-4B: the richer, canonical comparison record. Privacy-checked against its allowlist
      // BEFORE it is retained, so an event that should never exist never enters the corpus.
      const record = buildShadowComparisonRecord({
        governed: resolution,
        legacyCitation: input.legacyCitation ?? citation,
        legacyText: input.legacyText,
        legacyBackingState: input.legacyBackingState ?? 'UNKNOWN',
        applicability,
        legacyJurisdiction: input.legacyJurisdiction ?? input.jurisdiction ?? null,
        governedJurisdiction: resolution.jurisdiction ?? null,
        correlationId: this.correlationId,
        findingKey: input.findingKey ?? null,
        mode: this.mode,
        releaseManifestChecksum: this.pin.manifestChecksum ?? null,
        approvalContractVersion: null,
        approvalDigest: null,
        fallbackState: decision.deliveryState,
        hazardFamily: input.hazardFamily ?? null,
        jurisdiction: input.jurisdiction ?? null,
        latencyMs: durationMs,
        // Structural, not aspirational: SHADOW returns null backing input and null verified text.
        customerOutputUnchanged: true,
      });
      try {
        assertShadowEventPrivacySafe(record as unknown as Record<string, unknown>);
        this.shadowRecords.push(record);
        // KG-4B Phase 9: the narrowest safe storage. Structured single-line JSON on stdout, which an
        // isolated verification run collects into a JSONL corpus. NO production database schema is
        // created for a verification artifact -- if a future production shadow phase needs durable
        // events, that is a decision to make then, with its own retention contract.
        //
        // Silent unless observability is explicitly enabled, so a mechanism that is off stays silent.
        if (String(this.env.GOVERNED_CUTOVER_OBSERVABILITY || '').trim() === 'enabled') {
          console.log(JSON.stringify(record));
        }
      } catch (error) {
        console.error(`[governed-cutover] shadow record suppressed: ${(error as Error).message}`);
      }
    }

    // SHADOW returns nothing consumable AND nothing displayable. This is the single line that makes
    // "SHADOW must not alter customer output" a property of the code rather than of a test.
    if (this.mode === 'SHADOW') {
      return {
        resolution, decision, governedBackingInput: null, verifiedText: null,
        customerVisible: false,
      };
    }

    return {
      resolution,
      decision,
      governedBackingInput: toGovernedBackingInput(resolution),
      verifiedText: decision.textIsVerified
        ? {
            standardText: resolution.standardText,
            plainLanguageSummary: resolution.plainLanguageSummary,
            title: resolution.title,
          }
        : null,
      customerVisible: true,
    };
  }

  /** Everything the findings actually consumed, for `resolveAnalysisProvenance()`. */
  provenanceContributions(): FindingProvenanceContribution[] {
    return [...this.consumption];
  }

  /** Distinct citations resolved. KG-4A Phase 19 uses this to show the N+1 is absent. */
  resolvedCitationCount(): number {
    return this.cache.size;
  }

  /** KG-4B. The shadow comparison records for this analysis. Empty in every non-SHADOW mode. */
  shadowComparisons(): ShadowComparisonRecord[] {
    return [...this.shadowRecords];
  }
}

/**
 * Projects a governed decision onto the display fields both customer paths already carry.
 *
 * WHY THE DELIVERY STATE OVERRIDES THE BACKING STATUS. `resolveStandardsBacking()` answers "what is
 * this record's governance state", which is a fact about the corpus. `decideFallback()` answers
 * "what may this customer be shown", which is a policy about the mode. They agree in every mode but
 * GOVERNED_STRICT, where a record can be genuinely `UNAPPROVED_CONTENT` (the fact) while strict mode
 * refuses to display its text (the policy). Without this projection the customer would see
 * unverified text alongside no notice explaining it, which is the one outcome strict mode exists to
 * prevent.
 *
 * Returns an empty object in LEGACY (no decision), so a legacy payload gains no keys at all.
 */
export function projectGovernedDisplay(
  decision: GovernedStandardDecision | undefined | null,
): Record<string, unknown> {
  if (!decision) return {};
  // KG-4B. SHADOW contributes NOTHING to the payload -- not a value, not a key. A shadow customer's
  // response must be indistinguishable from a legacy customer's, and an extra key is a difference.
  if (!decision.customerVisible) return {};
  const base: Record<string, unknown> = {
    governedDeliveryState: decision.decision.deliveryState,
    governedFallbackReason: decision.decision.reasonCode,
    governedTextUnavailable: decision.decision.discloseTextUnavailable,
  };
  if (decision.decision.showText) return base;
  // Text is withheld. Blank the body fields rather than leaving them for a downstream reader to
  // render, and state the resulting backing plainly: from the customer's side this IS citation-only.
  return {
    ...base,
    standardText: null,
    plainLanguageSummary: null,
    summary: null,
    backingStatus: 'CITATION_ONLY',
    contentDisclosure: 'NONE',
    corpusBacked: false,
    backingNotice: 'Verified standard text is not currently available for this citation.',
  };
}

export type { CutoverPrincipal } from './cutover-mode';
