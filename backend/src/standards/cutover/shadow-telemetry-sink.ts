/**
 * KG-4C -- the shadow telemetry sink, the v2 event schema, and the privacy guardrail.
 *
 * THE SINK DECISION, AND WHY NO DATABASE TABLE.
 *
 * Three options were considered against the requirement (structured, versioned, privacy-safe,
 * queryable, bounded retention, failure cannot break a customer request, sufficient for
 * mismatch/severity/root-cause analysis):
 *
 *   1. STRUCTURED APPLICATION LOGS (stdout JSONL).  CHOSEN.
 *      Already exists and is already the KG-4B mechanism. Every field is categorical or a digest,
 *      so the records are queryable by any log pipeline without a schema migration. Retention and
 *      rotation are the platform's, which is honest: an application cannot enforce a retention
 *      contract on data it has already handed to a log shipper. That dependency is DOCUMENTED
 *      (see `RETENTION_CONTRACT`) rather than pretended away.
 *
 *   2. A DEDICATED shadow_comparison_events TABLE.  REJECTED for now.
 *      It would put a write inside the customer transaction path, adding a failure mode to a
 *      request that is otherwise unaffected by shadow -- precisely the property KG-4B spent six
 *      failure injections proving. It would need its own retention job, its own indexes, and a
 *      migration that must run in production before the code that writes it. KG-4B deliberately
 *      created no production schema for a verification artifact, and nothing measured since has
 *      changed the argument: at 2.18 events per analysis, aggregation over structured logs answers
 *      every question the mismatch taxonomy poses. A table becomes justified only when a query is
 *      needed that logs genuinely cannot serve -- for example joining events to reviewer decisions
 *      transactionally. That is not required to run a shadow.
 *
 *   3. THE EXISTING HazLenz KNOWLEDGE TELEMETRY helper.  REJECTED as the sink of record.
 *      `safescope-v2/telemetry/hazlenz-knowledge-telemetry.ts` logs `Record<string, any>` through
 *      `console.info` with a human-readable label. An untyped metadata bag is exactly the shape
 *      that lets customer content in by accident, and this event's contract is an ALLOWLIST. It
 *      remains fine for what it does; it is not the right vehicle for a privacy-critical record.
 *
 * SO: structured logs for raw events, in-process counters for real-time metrics (see
 * `shadow-circuit-breaker.ts`), and no production database schema.
 *
 * WHY A BUILDER RATHER THAN A VALIDATOR ALONE. `buildShadowEventV2()` constructs the event field by
 * field from a typed input. It never spreads caller-supplied objects, so a field that is not part
 * of the schema cannot reach the event to be caught later -- it has nowhere to enter. The runtime
 * allowlist assertion remains as a second, independent line of defence, because a builder protects
 * against accident and an assertion protects against a future edit to the builder.
 */

import {
  SHADOW_EVENT_ALLOWED_FIELDS, assertShadowEventPrivacySafe,
  type ShadowComparisonRecord,
} from './shadow-comparison';
import type { InvarianceVerdict } from './customer-output-invariance';
import type { ProductionShadowStage } from './production-shadow-authorization';

// ------------------------------------------------------------------ schema version

/**
 * v2 EXTENDS v1; it does not reinterpret any v1 field.
 *
 * The version string is part of every event so an analyser can branch without guessing, and it is
 * checked by the contract suite against the field list -- adding a field without bumping the
 * version fails the suite, which is what keeps the version honest.
 */
export const SHADOW_EVENT_SCHEMA_VERSION_V2 = 'kg4c.shadow-comparison.v2';

/** What v2 adds over v1, and nothing else. */
export const SHADOW_EVENT_V2_ADDITIONAL_FIELDS: readonly string[] = Object.freeze([
  /** Which rollout stage produced this event. Lets a corpus be split by stage after the fact. */
  'stage',
  /** How the principal became eligible: allowlist or deterministic cohort. Categorical. */
  'eligibilitySource',
  /** The customer-output invariance verdict for the analysis this event belongs to. */
  'outputInvarianceVerdict',
  /** Hash of the customer-visible payload. A digest; never the payload. */
  'outputInvarianceHash',
  /** How many non-volatile paths differed. 0 unless the verdict is MUTATED. */
  'outputInvarianceDifferingPaths',
  /** True when the analysis wrote no governed customer provenance. Must be true in SHADOW. */
  'shadowProvenanceNull',
]);

export const SHADOW_EVENT_V2_ALLOWED_FIELDS: readonly string[] = Object.freeze([
  ...SHADOW_EVENT_ALLOWED_FIELDS,
  ...SHADOW_EVENT_V2_ADDITIONAL_FIELDS,
]);

export type EligibilitySource = 'ACCOUNT_ALLOWLIST' | 'ORGANIZATION_ALLOWLIST' | 'DETERMINISTIC_COHORT' | 'NONE';

export interface ShadowComparisonRecordV2 extends Omit<ShadowComparisonRecord, 'schemaVersion'> {
  schemaVersion: typeof SHADOW_EVENT_SCHEMA_VERSION_V2;
  stage: ProductionShadowStage;
  eligibilitySource: EligibilitySource;
  outputInvarianceVerdict: InvarianceVerdict | null;
  outputInvarianceHash: string | null;
  outputInvarianceDifferingPaths: number;
  shadowProvenanceNull: boolean;
}

/**
 * Builds a v2 event from a v1 record plus the KG-4C additions.
 *
 * Field by field, deliberately. The v1 record is a typed object this codebase produced, so its
 * fields are enumerated explicitly rather than spread -- if `ShadowComparisonRecord` ever grows a
 * field, this function fails to compile instead of silently forwarding it.
 */
export function buildShadowEventV2(
  record: ShadowComparisonRecord,
  extras: {
    stage: ProductionShadowStage;
    eligibilitySource: EligibilitySource;
    outputInvarianceVerdict?: InvarianceVerdict | null;
    outputInvarianceHash?: string | null;
    outputInvarianceDifferingPaths?: number;
    shadowProvenanceNull: boolean;
  },
): ShadowComparisonRecordV2 {
  return {
    schemaVersion: SHADOW_EVENT_SCHEMA_VERSION_V2,
    event: record.event,
    observedAt: record.observedAt,
    correlationId: record.correlationId,
    findingKey: record.findingKey,
    eventKey: record.eventKey,
    mode: record.mode,
    releaseId: record.releaseId,
    releaseManifestChecksum: record.releaseManifestChecksum,
    requestedCitation: record.requestedCitation,
    legacyCitation: record.legacyCitation,
    governedResolvedCitation: record.governedResolvedCitation,
    applicability: record.applicability,
    legacyBackingState: record.legacyBackingState,
    governedBackingState: record.governedBackingState,
    approvalContractVersion: record.approvalContractVersion,
    approvalDigest: record.approvalDigest,
    fallbackState: record.fallbackState,
    mismatch: record.mismatch,
    dimensions: record.dimensions,
    severity: record.severity,
    rootCause: record.rootCause,
    resolverHealth: record.resolverHealth,
    legacyTextDigest: record.legacyTextDigest,
    governedTextDigest: record.governedTextDigest,
    hazardFamily: record.hazardFamily,
    jurisdiction: record.jurisdiction,
    latencyMs: record.latencyMs,
    customerOutputUnchanged: record.customerOutputUnchanged,
    stage: extras.stage,
    eligibilitySource: extras.eligibilitySource,
    outputInvarianceVerdict: extras.outputInvarianceVerdict ?? null,
    outputInvarianceHash: extras.outputInvarianceHash ?? null,
    outputInvarianceDifferingPaths: extras.outputInvarianceDifferingPaths ?? 0,
    shadowProvenanceNull: extras.shadowProvenanceNull,
  };
}

// ------------------------------------------------------------------ privacy canaries

/**
 * Patterns that must never appear in a serialized event, checked against the SERIALIZED STRING.
 *
 * Checking the serialized form rather than the field values is the point: it catches content that
 * arrives nested inside an object, inside an array, or inside a field whose type says it is a
 * digest. KG-4B's privacy review searched real markers in real events for exactly this reason.
 *
 * Each entry is a NAME and a detector. The name is what gets reported; the matched text never is.
 */
export const PRIVACY_CANARY_PATTERNS: ReadonlyArray<{ name: string; test: RegExp }> = Object.freeze([
  { name: 'EMAIL_ADDRESS', test: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { name: 'BEARER_TOKEN', test: /\bbearer\s+[A-Za-z0-9._-]{8,}/i },
  { name: 'JWT', test: /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\./ },
  // The `\\?["']?` prefix/suffix allowances matter: when a value is embedded in a string FIELD and
  // the event is then serialized, JSON escapes its inner quotes, so the literal text becomes
  // `\"password\":`. The first version of these patterns required a bare quote and missed exactly
  // that case -- caught by the canary suite, not by inspection.
  { name: 'PASSWORD_FIELD', test: /\\?["']?pass(word|phrase)\\?["']?\s*[:=]/i },
  { name: 'SECRET_FIELD', test: /\\?["']?(secret|api[_-]?key|access[_-]?token|refresh[_-]?token)\\?["']?\s*[:=]/i },
  { name: 'PRIVATE_KEY', test: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'AUTHORIZATION_HEADER', test: /\\?["']?authorization\\?["']?\s*[:=]/i },
  { name: 'US_PHONE', test: /\b\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/ },
  { name: 'SSN', test: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: 'CREDIT_CARD', test: /\b(?:\d[ -]*?){13,16}\b/ },
  { name: 'STREET_ADDRESS', test: /\b\d{1,5}\s+[A-Za-z]+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b/i },
  { name: 'OBSERVATION_PROSE', test: /\b(worker|employee|operator|inspector)\s+(was|is|were|had|has)\b/i },
]);

/**
 * The longest any single string field may be.
 *
 * Regulatory citations, release ids, digests and categorical states are all far below this. A field
 * that exceeds it is carrying prose, whatever its declared type says.
 */
const MAX_FIELD_LENGTH = 200;

export class ShadowPrivacyViolation extends Error {
  constructor(readonly marker: string, readonly field: string) {
    super('Shadow event failed the privacy guard: ' + marker + ' in ' + field);
    this.name = 'ShadowPrivacyViolation';
  }
}

/**
 * The v2 privacy guard: allowlist, per-field length and type checks, then canary detection over the
 * serialized event.
 *
 * Throws rather than returning a boolean, so a caller cannot forget to check the result. Callers
 * run it before every write, and the write path catches the throw and drops the event -- an event
 * that cannot be proven safe is not emitted at all.
 */
export function assertShadowEventV2PrivacySafe(event: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(event)) {
    if (!SHADOW_EVENT_V2_ALLOWED_FIELDS.includes(key)) {
      throw new ShadowPrivacyViolation('FIELD_NOT_ALLOWLISTED', key);
    }
    if (typeof value === 'string' && value.length > MAX_FIELD_LENGTH) {
      throw new ShadowPrivacyViolation('FIELD_TOO_LONG', key);
    }
    if (value !== null && typeof value === 'object' && key !== 'dimensions') {
      throw new ShadowPrivacyViolation('NESTED_OBJECT_NOT_ALLOWED', key);
    }
  }

  // TWO PASSES, because neither alone is sufficient.
  //
  //   RAW VALUES     catch content that JSON escaping would disguise. A field holding the literal
  //                  text `{"password":"hunter2"}` serializes to `{\"password\":\"hunter2\"}`, and a
  //                  pattern written against ordinary JSON misses the escaped form. Testing the raw
  //                  value sidesteps escaping entirely.
  //   SERIALIZED     catches anything that reaches the event through a path the field loop does not
  //                  walk -- a nested value, an array, a non-string type that stringifies to prose.
  //
  // The raw pass runs FIRST so the reported field name is the real one rather than
  // 'serialized-event', which is what an operator needs in order to find the source.
  for (const [key, value] of Object.entries(event)) {
    if (typeof value !== 'string') continue;
    for (const canary of PRIVACY_CANARY_PATTERNS) {
      if (canary.test.test(value)) throw new ShadowPrivacyViolation(canary.name, key);
    }
  }

  const serialized = JSON.stringify(event);
  for (const canary of PRIVACY_CANARY_PATTERNS) {
    if (canary.test.test(serialized)) {
      throw new ShadowPrivacyViolation(canary.name, 'serialized-event');
    }
  }
}

// ------------------------------------------------------------------ the sink

export type SinkDeliveryStatus = 'DELIVERED' | 'SUPPRESSED_DISABLED' | 'DROPPED_PRIVACY' | 'DROPPED_SINK_FAILURE';

export interface SinkDeliveryResult {
  status: SinkDeliveryStatus;
  /** Categorical reason when the event was not delivered. Never the event content. */
  reason: string | null;
}

export interface TelemetrySink {
  write(serialized: string): void;
}

/** The sink of record: one JSON object per line on stdout, collected by the platform log pipeline. */
export class StdoutJsonlSink implements TelemetrySink {
  write(serialized: string): void {
    console.log(serialized);
  }
}

/** Discards everything. The default when observability is not explicitly enabled. */
export class NullSink implements TelemetrySink {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(_serialized: string): void { /* intentionally empty */ }
}

/** Retains events in memory. For verification suites only; never wired into a server. */
export class CapturingSink implements TelemetrySink {
  readonly written: string[] = [];
  write(serialized: string): void { this.written.push(serialized); }
}

/**
 * Emits one event. NEVER THROWS.
 *
 * This is the fail-open boundary for telemetry: a privacy failure, a serialization failure or a
 * sink failure all produce a categorical result and nothing else. The caller is inside a customer
 * request, and no telemetry outcome may turn a successful legacy analysis into a customer error.
 *
 * A dropped event is REPORTED, not swallowed: the returned status feeds the telemetry-failure rate
 * that the circuit breaker watches, so silent loss becomes a measured rate rather than a mystery.
 */
export function emitShadowEvent(input: {
  event: Record<string, unknown>;
  sink: TelemetrySink;
  env?: Record<string, string | undefined>;
}): SinkDeliveryResult {
  const env = input.env ?? process.env;
  if (String(env.GOVERNED_CUTOVER_OBSERVABILITY || '').trim() !== 'enabled') {
    return { status: 'SUPPRESSED_DISABLED', reason: 'OBSERVABILITY_NOT_ENABLED' };
  }

  let serialized: string;
  try {
    assertShadowEventV2PrivacySafe(input.event);
    serialized = JSON.stringify(input.event);
  } catch (error) {
    const marker = error instanceof ShadowPrivacyViolation ? error.marker : 'SERIALIZATION_FAILED';
    return { status: 'DROPPED_PRIVACY', reason: marker };
  }

  try {
    input.sink.write(serialized);
    return { status: 'DELIVERED', reason: null };
  } catch (error) {
    return { status: 'DROPPED_SINK_FAILURE', reason: (error as Error)?.name || 'SINK_ERROR' };
  }
}

// ------------------------------------------------------------------ retention

/**
 * The retention contract.
 *
 * ENFORCEMENT IS AN OPERATIONAL DEPENDENCY, NOT AN APPLICATION GUARANTEE. Once an event is on
 * stdout it belongs to the log pipeline, and no code in this repository can delete it. Stating the
 * durations here without saying that would be a fiction. What the application DOES control is that
 * the events contain nothing whose over-retention would be harmful: no customer prose, no
 * identifiers beyond a server-generated correlation id, no personal data of any kind.
 *
 * That is the real reason the retention numbers below are safe to be approximate: the privacy
 * guarantee does not depend on them.
 */
export const RETENTION_CONTRACT = Object.freeze({
  rawEvents: Object.freeze({
    target: '30 days',
    rationale:
      'Long enough to reproduce and classify a mismatch discovered late in a shadow run, short ' +
      'enough that the corpus does not become a permanent dataset. Raw events carry no customer ' +
      'content, so the duration is an operational convenience rather than a privacy control.',
    enforcedBy: 'PLATFORM_LOG_PIPELINE',
    applicationControls: false,
  }),
  aggregateMetrics: Object.freeze({
    target: '13 months',
    rationale:
      'Counters and rates only -- no event bodies. Kept across a full year plus one month so a ' +
      'later cutover decision can compare against the first shadow run rather than against memory.',
    enforcedBy: 'METRICS_BACKEND',
    applicationControls: false,
  }),
  blockingEvidence: Object.freeze({
    target: 'retained with the KG slice that adjudicates it',
    rationale:
      'A BLOCKING mismatch becomes verification evidence: it is copied into the remediation slice ' +
      'artifact directory, where the ordinary evidence-preservation rules apply and nothing is ' +
      'deleted. This is the one class that deliberately outlives the log window, and it survives as ' +
      'a categorical record in a repository artifact, not as raw telemetry.',
    enforcedBy: 'REPOSITORY_VERIFICATION_ARTIFACTS',
    applicationControls: true,
  }),
});
