/**
 * §268 — THE MINIMUM BETA OPERATIONAL SIGNAL SET.
 *
 * ===============================================================================================
 * WHAT THIS IS, STATED HONESTLY.
 *
 * This is the EMISSION layer: one structured line per operationally meaningful event, on a stable
 * schema, with bounded metadata. It is not a monitoring system and §268 forbids calling it one.
 * Collection, retention, alerting and on-call routing are a platform concern that no code in this
 * repository can satisfy, and the beta blocker for those remains open until a log drain or error
 * reporter is actually provisioned and an induced failure is observed arriving in it.
 *
 * What it does buy, today: the product currently writes rich `security_audit_events` and
 * `expert_analysis_executions` rows and surfaces none of it, and nothing at all is emitted in a
 * shape a drain could parse. §266's finding was that a beta whose stated purpose is learning from
 * real use would run blind. After this, every event below is one `grep` away on any platform that
 * captures stdout, and one drain configuration away from being queryable.
 *
 * ===============================================================================================
 * WHY STDOUT JSON AND NOT A VENDOR SDK.
 *
 * §268 says not to build a new observability platform, and adding a vendor dependency now would
 * commit the beta to a vendor before anyone has chosen one. Every candidate — Sentry, Datadog,
 * Better Stack, Render's own log stream — ingests structured stdout. Emitting the canonical shape
 * first and choosing the destination second is the order that does not have to be undone.
 *
 * ===============================================================================================
 * REDACTION IS BY CONSTRUCTION, NOT BY REVIEW.
 *
 * §268 forbids raw provider output, observation text, tokens, keys and attachments in logs. A rule
 * that says "do not log observation text" is a rule someone breaks in six months while adding a
 * helpful debug line. So `emit` does not accept arbitrary objects: metadata values are coerced to
 * bounded scalars, any key whose NAME looks credential- or content-bearing is dropped, and any
 * string longer than `MAX_VALUE_LENGTH` is truncated. Passing an observation to this function does
 * not log the observation — it logs a truncated, key-filtered scalar or nothing at all.
 *
 * Identifiers are the intended payload: an observation ID, an execution ID, an organization ID, a
 * state name, a count, a duration. Everything an operator needs to find the row, nothing that
 * discloses what the row says.
 */

export const OPERATIONAL_EVENT_SCHEMA = 'safety-insite.operational-event.v1' as const;

/**
 * THE CLOSED EVENT VOCABULARY. Closed because an open one becomes a second, undocumented log
 * format within a release, and because a dashboard can only be built against names that are fixed.
 */
export const OPERATIONAL_EVENTS = [
  // ---- Expert execution lifecycle
  'expert.execution.started',
  'expert.execution.admitted',
  'expert.execution.refused',
  'expert.execution.unresolved',
  'expert.execution.failed',
  // ---- provider / transport
  'expert.provider.transport_failure',
  'expert.provider.verifier_failure',
  'expert.provider.usage_recorded',
  // ---- operational controls
  'expert.control.execution_disabled',
  'expert.control.spend_limit_refused',
  'expert.control.request_version_conflict',
  // ---- the human authority boundary
  'expert.confirmation.required',
  'expert.confirmation.settled',
  // ---- platform
  'storage.operation_failed',
  /**
   * §314 / BR-8. AN UPLOAD IDENTIFIER WAS REPLAYED and resolved to the object it already named,
   * either by returning the committed result or by resuming an attempt whose bytes never landed.
   * The `outcome` distinguishes the two, because a rising RESUMED rate means uploads are failing
   * part-way and a rising RETURNED_COMMITTED rate means responses are being lost — different
   * problems that were previously indistinguishable and, before §314, entirely invisible.
   */
  'storage.idempotent_replay',
  /**
   * §314 / BR-8. AN UPLOAD IDENTIFIER WAS REPLAYED WITH SOMETHING THAT DID NOT MATCH THE OBJECT IT
   * ALREADY NAMES, and the request was refused rather than allowed to overwrite evidence.
   *
   * WARNING rather than info: every reason is a client contract violation worth an operator's eye.
   * PAYLOAD_MISMATCH in particular is the exact shape of both a client defect and an attempt to
   * substitute one piece of safety evidence for another, and the refusal is what keeps the stored
   * digest true. It carries the reason and the object id, never the digests — a digest identifies
   * specific customer evidence, and this line is not the place for it.
   */
  'storage.idempotency_conflict',
  'report.generation_failed',
  'schema.readiness_failed',
  'migration.failed',
  /**
   * §305 / OB-1. ACCOUNT DELETION FAILED AND THE TRANSACTION ROLLED BACK WHOLE.
   *
   * The customer is told only that the deletion did not succeed, which is correct — the cause can
   * name a relation or a constraint. This event is the OPERATOR's copy, and it carries the failure
   * KIND alone: no message, no identifier, no SQL. Before §305 this path had a bare `catch {}` that
   * discarded the cause entirely, so a customer who could not delete their account produced no
   * signal anywhere. §305 hit that exact wall diagnosing SE-12 and had to instrument the service by
   * hand to recover `relation "notifications" does not exist`.
   */
  'auth.account_deletion_failed',
  /**
   * §306 / EM-2. A PASSWORD-RESET MESSAGE WAS NOT DELIVERED, and the account has been left with NO
   * reset credential so nothing is stranded.
   *
   * The `outcome` distinguishes NOT_CONFIGURED (no provider credential — the expected state until a
   * sending domain exists), PROVIDER_REJECTED (the provider answered and said no) and
   * NETWORK_FAILURE (it never answered). Those need different fixes and used to be
   * indistinguishable, because the delivery error was discarded by a bare catch.
   *
   * It carries NO reset token, NO reset URL and NO message body. The §306 suite captures stdout and
   * stderr during a real reset request and searches for the exact token to prove it.
   */
  'auth.password_reset_delivery_failed',
  // §286 / D-054. The outcome-intelligence loop failed to record a corrective-action closure.
  // The closure itself is unaffected — see CorrectiveActionsService.recordClosureIntelligence.
  'action.closure_intelligence_failed',
  /**
   * §287 / D-054. A REQUIRED AUDIT ROW WAS NOT PERSISTED, and the state change it describes HAS
   * committed. This is the fallback record of an audit row that is missing from the audit trail:
   * it carries the actor, the resource and the transition precisely so the gap is reconstructable.
   * It is deliberately not silent and deliberately not fatal — see the call site.
   */
  'action.audit_write_failed',
  /** §287 / D-054. An assignee notification failed after a committed transition. */
  'action.notification_failed',
  // §291 (MO-1). A RATE condition, not a single failure: raised once when 5xx responses cross
  // the threshold in the rolling window, so a burst produces one alert rather than one per request.
  'service.error_rate_exceeded',
  /**
   * §294 (MO-2). THE OUTCOME OF AN ALERT DISPATCH, so that a channel which is configured but not
   * delivering stops being indistinguishable from one that is.
   *
   * Both are deliberately BELOW `error` severity, and that is load-bearing rather than cosmetic:
   * `dispatchOperationalAlert` acts only on `error`, so neither of these can trigger a dispatch of
   * its own. An alert about a failure to alert, sent through the channel that just failed, is a
   * loop — the log line is the right place for it, and `ops:events` already reads that.
   */
  'monitoring.alert_delivered',
  'monitoring.alert_delivery_failed',
] as const;
export type OperationalEvent = (typeof OPERATIONAL_EVENTS)[number];

export type OperationalSeverity = 'info' | 'warning' | 'error';

/** Severity per event, fixed here so two call sites cannot disagree about how loud one thing is. */
const SEVERITY: Record<OperationalEvent, OperationalSeverity> = {
  'expert.execution.started': 'info',
  'expert.execution.admitted': 'info',
  // A refusal is the fail-closed path working correctly, not an error. It is a WARNING because a
  // rising refusal rate is the single most informative Expert signal in a beta.
  'expert.execution.refused': 'warning',
  'expert.execution.unresolved': 'warning',
  'expert.execution.failed': 'error',
  'expert.provider.transport_failure': 'error',
  'expert.provider.verifier_failure': 'warning',
  'expert.provider.usage_recorded': 'info',
  'expert.control.execution_disabled': 'warning',
  'expert.control.spend_limit_refused': 'warning',
  'expert.control.request_version_conflict': 'warning',
  'expert.confirmation.required': 'info',
  'expert.confirmation.settled': 'info',
  'storage.operation_failed': 'error',
  'storage.idempotent_replay': 'info',
  'storage.idempotency_conflict': 'warning',
  'auth.account_deletion_failed': 'error',
  'auth.password_reset_delivery_failed': 'error',
  'report.generation_failed': 'error',
  'schema.readiness_failed': 'error',
  'migration.failed': 'error',
  // WARNING, not error: the customer's closure completed and was audited. What did not happen is
  // the learning record, which is a degradation of an internal capability rather than a failure of
  // the operation the customer asked for. A rising rate of these still needs an operator's eye.
  'action.closure_intelligence_failed': 'warning',
  // ERROR, not warning: an audit row that should exist does not, on a compliance product. The
  // customer's operation succeeded, so it is not a failure of the request — it is a failure of
  // the record, which is the more serious of the two here.
  'action.audit_write_failed': 'error',
  'action.notification_failed': 'warning',
  'service.error_rate_exceeded': 'error',
  // §294 (MO-2). INFO: the alert channel did what it was configured to do. Bounded by the alert
  // rate limit itself — at most one of these per alert, so at most MAX_ALERTS_PER_WINDOW.
  'monitoring.alert_delivered': 'info',
  // §294 (MO-2). WARNING and never ERROR: an operator needs to see that the channel is rejecting,
  // and raising it to `error` would make the dispatcher try to alert about its own failure.
  'monitoring.alert_delivery_failed': 'warning',
};

const MAX_VALUE_LENGTH = 200;

/**
 * Key names that must never carry a value into a log line, matched on the NAME rather than on the
 * content. Content-based redaction requires recognising a secret, and the ones that matter are the
 * ones nobody recognised.
 */
const FORBIDDEN_KEY = new RegExp([
  'token', 'secret', 'password', 'passwd', 'credential', 'apikey', 'api_key', 'authorization',
  'cookie', 'session', 'privatekey', 'private_key',
  // Content-bearing, not credential-bearing, and equally forbidden by §268.
  'rawtext', 'observationtext', 'narrative', 'prompt', 'snapshot', 'resultsnapshot',
  'toolinput', 'rawfirstpass', 'rawverifier', 'completion', 'attachment', 'filecontent',
  'posture', 'reasoning', 'rationale', 'conclusion', 'explanation',
].join('|'), 'i');

export type OperationalMetadata = Record<string, unknown>;

/**
 * Coerce one metadata value to something safe to print.
 *
 * Objects and arrays are reduced to a shape description rather than serialised. An operator
 * learning that a field held 3 items is useful; a log line containing those 3 items is the leak.
 */
function safeValue(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.length > MAX_VALUE_LENGTH ? `${value.slice(0, MAX_VALUE_LENGTH)}…[truncated]` : value;
  }
  if (Array.isArray(value)) return `[array:${value.length}]`;
  if (value instanceof Date) return value.toISOString();
  return `[object:${Object.keys(value as object).length}]`;
}

export function redactMetadata(metadata: OperationalMetadata): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (FORBIDDEN_KEY.test(key)) { out[key] = '[redacted]'; continue; }
    out[key] = safeValue(value);
  }
  return out;
}

export interface OperationalEventLine {
  readonly schema: typeof OPERATIONAL_EVENT_SCHEMA;
  readonly event: OperationalEvent;
  readonly severity: OperationalSeverity;
  readonly at: string;
  readonly metadata: Record<string, unknown>;
}

export function buildOperationalEvent(
  event: OperationalEvent,
  metadata: OperationalMetadata = {},
  now: Date = new Date(),
): OperationalEventLine {
  return {
    schema: OPERATIONAL_EVENT_SCHEMA,
    event,
    severity: SEVERITY[event],
    at: now.toISOString(),
    metadata: redactMetadata(metadata),
  };
}

/** Test hook: capture emissions in-process instead of writing them. Never used in production. */
let sink: ((line: OperationalEventLine) => void) | null = null;
export function captureOperationalEventsForVerification(
  capture: ((line: OperationalEventLine) => void) | null,
): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('OPERATIONAL_EVENTS_268_ABORT: emissions may only be captured under '
      + 'NODE_ENV=test');
  }
  sink = capture;
}

/**
 * EMIT. Errors and warnings go to stderr, information to stdout, because most log drains and
 * platform dashboards separate the two streams by default and an operator scanning for trouble
 * should not have to filter out the happy path first.
 *
 * It never throws. An observability layer that can break a safety analysis is worse than no
 * observability layer, so a failure to log is swallowed deliberately — this is the one place in
 * the product where swallowing is the correct behaviour.
 */
import { dispatchOperationalAlert } from './operational-alerts';

export function emitOperationalEvent(
  event: OperationalEvent,
  metadata: OperationalMetadata = {},
): void {
  try {
    const line = buildOperationalEvent(event, metadata);
    if (sink) { sink(line); return; }
    const serialized = JSON.stringify(line);
    if (line.severity === 'info') process.stdout.write(`${serialized}\n`);
    else process.stderr.write(`${serialized}\n`);
    /**
     * §291 (MO-1). The log line is written FIRST and unconditionally; the alert is strictly
     * additive. If the dispatcher is unconfigured, misconfigured or broken, the record on stdout
     * is unaffected — alerting can fail without taking the evidence with it.
     */
    dispatchOperationalAlert(line);
  } catch {
    // Deliberately silent. See above.
  }
}
