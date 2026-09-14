/**
 * §291 (MO-1) — MAKING A PRODUCTION FAILURE ARRIVE SOMEWHERE, RATHER THAN WAITING TO BE FOUND.
 *
 * ==================== WHAT THIS IS AND IS NOT ====================
 *
 * §290 established what production actually had: structured events on stdout/stderr, captured by
 * the platform log store, queryable by `statusCode`, `path` and `level`. That makes failures
 * RETRIEVABLE. It does not make them VISIBLE — somebody has to go and look, and nobody is going to
 * at 02:00. §291 is explicit that this must not be called monitoring.
 *
 * This is the smallest thing that changes pull into push. It is NOT an observability product: it
 * has no storage, no query language, no dashboard and no history. It takes the consequential
 * events the application already emits, applies a noise policy, and delivers them to whatever
 * channel the operator has configured.
 *
 * ==================== THE NOISE POLICY, AND WHY IT IS THE HARD PART ====================
 *
 * An alerting channel that cries wolf is worse than none, because it trains the operator to ignore
 * it. §291 names the conditions that must page and the ones that must not, and this encodes both:
 *
 *   ALERTS        every `error`-severity operational event. Today that is
 *                 storage.operation_failed, report.generation_failed, schema.readiness_failed,
 *                 migration.failed, action.audit_write_failed, expert.execution.failed and
 *                 expert.provider.transport_failure — each one a consequence a customer or an
 *                 auditor would notice, not a log line.
 *
 *   NEVER ALERTS  401, 402, 404, ordinary 400 validation and expected 409 conflict. These are the
 *                 product WORKING: a refused login, an entitlement boundary, a missing record, a
 *                 rejected payload, a version conflict. §290 counted 15 x 401 and 1 x 402 during a
 *                 completely successful release. Alerting on them would bury the real signal.
 *
 *   ALERTS ON A   repeated 5xx. A single 500 is a bug report; a burst is an outage. That is a RATE
 *   PATTERN       question, not an event question, so `noteServerError` counts them in a rolling
 *                 window and raises ONE `service.error_rate_exceeded` event when the threshold is
 *                 crossed, rather than one alert per failed request.
 *
 * ==================== IT IS INERT UNTIL CONFIGURED, AND SAYS SO ====================
 *
 * No destination is configured in production today, and this does not invent one: §291 forbids
 * adding mutable production configuration casually, and choosing an alerting channel is a
 * product-owner decision with a cost and an account attached.
 *
 * So the dispatcher is fail-safe inert without a destination — and `describeConfiguration()` is
 * surfaced on `/health/ready`, so "nothing is watching" is a VISIBLE FACT rather than a silent
 * assumption. That is the difference between an unconfigured alerting capability and a product
 * that merely believes it is monitored.
 */
import { OperationalEventLine } from './operational-events';

export type AlertChannel = 'webhook' | 'email' | 'none';

export interface AlertConfiguration {
  readonly configured: boolean;
  readonly channel: AlertChannel;
  readonly reason: string;
}

/** A single 500 is a bug report. A burst is an outage. */
const SERVER_ERROR_THRESHOLD = 5;
const SERVER_ERROR_WINDOW_MS = 5 * 60 * 1000;

/**
 * One alert per distinct event kind per window. A storage outage produces one failure per request;
 * the operator needs to know storage is down once, not four hundred times.
 */
const DEDUPE_WINDOW_MS = 15 * 60 * 1000;
/** A hard ceiling that survives any dedupe-key mistake. An alerting bug must not become a mail bomb. */
const MAX_ALERTS_PER_WINDOW = 12;

const serverErrors: number[] = [];
const lastAlertAt = new Map<string, number>();
let alertsInWindow: number[] = [];

export function describeAlertConfiguration(): AlertConfiguration {
  if (process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {
    return { configured: true, channel: 'webhook', reason: 'OPERATIONAL_ALERT_WEBHOOK_URL is set.' };
  }
  if (process.env.OPERATIONAL_ALERT_EMAIL && process.env.RESEND_API_KEY) {
    return { configured: true, channel: 'email', reason: 'OPERATIONAL_ALERT_EMAIL and RESEND_API_KEY are set.' };
  }
  if (process.env.OPERATIONAL_ALERT_EMAIL) {
    return {
      configured: false,
      channel: 'none',
      reason: 'OPERATIONAL_ALERT_EMAIL is set but RESEND_API_KEY is not, so no alert can be delivered.',
    };
  }
  return {
    configured: false,
    channel: 'none',
    reason: 'No alert destination is configured. Errors are emitted and retrievable from the '
      + 'platform log store, but nothing is pushed to an operator.',
  };
}

function withinRateLimit(key: string): boolean {
  const now = Date.now();
  alertsInWindow = alertsInWindow.filter(t => now - t < DEDUPE_WINDOW_MS);
  if (alertsInWindow.length >= MAX_ALERTS_PER_WINDOW) return false;
  const last = lastAlertAt.get(key);
  if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return false;
  lastAlertAt.set(key, now);
  alertsInWindow.push(now);
  return true;
}

/**
 * Deliberately never throws and never awaits the caller. An alerting failure must not turn a
 * request that already succeeded into an error, and must not delay one that is still running --
 * which is the same rule §287 applied to the audit write for the same reason.
 */
export function dispatchOperationalAlert(line: OperationalEventLine): void {
  try {
    if (line.severity !== 'error') return;
    const config = describeAlertConfiguration();
    if (!config.configured) return;
    if (!withinRateLimit(line.event)) return;

    const payload = {
      source: 'safety-insite',
      event: line.event,
      severity: line.severity,
      at: line.at,
      environment: process.env.NODE_ENV || 'unknown',
      release: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'unknown',
      // The metadata is already redacted by `buildOperationalEvent`; nothing is added here, so an
      // alert can never carry content the log line would not have carried.
      metadata: line.metadata,
    };

    if (config.channel === 'webhook') {
      void fetch(String(process.env.OPERATIONAL_ALERT_WEBHOOK_URL), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
      return;
    }

    if (config.channel === 'email') {
      void fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.PASSWORD_RESET_FROM_EMAIL || 'alerts@safety-insite.invalid',
          to: [String(process.env.OPERATIONAL_ALERT_EMAIL)],
          subject: `[Safety InSite] ${line.event}`,
          text: JSON.stringify(payload, null, 2),
        }),
      }).catch(() => undefined);
    }
  } catch {
    // See the note above: the alerting path is the one place where swallowing is correct.
  }
}

/**
 * Called for every 5xx response. Returns true when this call crossed the threshold, so the caller
 * raises exactly ONE event for the burst rather than one per failed request.
 */
export function noteServerError(): boolean {
  const now = Date.now();
  while (serverErrors.length && now - serverErrors[0] > SERVER_ERROR_WINDOW_MS) serverErrors.shift();
  serverErrors.push(now);
  return serverErrors.length === SERVER_ERROR_THRESHOLD;
}

export function serverErrorCountInWindow(): number {
  const now = Date.now();
  while (serverErrors.length && now - serverErrors[0] > SERVER_ERROR_WINDOW_MS) serverErrors.shift();
  return serverErrors.length;
}

/** Test seam. Verification must start from a known position rather than whatever ran before it. */
export function resetOperationalAlertStateForVerification(): void {
  serverErrors.length = 0;
  lastAlertAt.clear();
  alertsInWindow = [];
}

export const OPERATIONAL_ALERT_POLICY = {
  alertsOn: 'every error-severity operational event, plus a burst of 5xx responses',
  serverErrorThreshold: SERVER_ERROR_THRESHOLD,
  serverErrorWindowMinutes: SERVER_ERROR_WINDOW_MS / 60000,
  dedupeWindowMinutes: DEDUPE_WINDOW_MS / 60000,
  maxAlertsPerWindow: MAX_ALERTS_PER_WINDOW,
  neverAlertsOn: ['401', '402', '404', 'ordinary 400 validation', 'expected 409 conflict'],
} as const;
