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
 *
 * ==================== §294 (MO-2) — AND THE SAME RULE APPLIED TO ITSELF ====================
 *
 * §293 found that the guarantee above had a hole in exactly the channel §293's owner then chose.
 * `describeAlertConfiguration()` reported the email channel configured on a recipient and a
 * credential, while the dispatcher supplied the SENDER from a fallback — `alerts@safety-insite.
 * invalid` — that RFC 2606 reserves and no provider can ever verify. So the two functions could
 * disagree, and the disagreement always resolved the same way: `/health/ready` said a human would
 * be told, and no human would be told. A FALSE GREEN about monitoring is worse than the honest red
 * it replaces, because the red is actionable and the green ends the investigation.
 *
 * §294 removes the possibility rather than the symptom, in three structural ways.
 *
 *   ONE SOURCE OF TRUTH   `resolveEmailChannel()` decides what the email channel needs, and BOTH
 *                         `describeAlertConfiguration()` and `dispatchOperationalAlert()` are
 *                         written in terms of it. Neither one restates a requirement, so they
 *                         cannot drift apart — the parity is structural, not a convention that a
 *                         future edit is trusted to keep.
 *
 *   NO FALLBACK IDENTITY  There is no default sender. An absent or structurally undeliverable
 *                         sender leaves the channel NOT_CONFIGURED with the sender named as the
 *                         reason. A production delivery identity is configuration, and inventing
 *                         one was the whole defect.
 *
 *   THE OUTCOME IS        Dispatch is still fire-and-forget with respect to the CUSTOMER REQUEST —
 *   EVIDENCE              it is never awaited and can never turn a succeeded operation into a 500.
 *                         But the provider's answer is no longer discarded: every attempt resolves
 *                         to one bounded outcome and emits it, so a rejecting channel is visible
 *                         in the log store and on `/health/ready` as DEGRADED. Not throwing was
 *                         always correct. Not recording never was.
 */
import { OperationalEventLine, emitOperationalEvent } from './operational-events';

export type AlertChannel = 'webhook' | 'email' | 'none';

/**
 * §294. Three states rather than a boolean, because "configured" and "working" are different
 * questions and collapsing them is what MO-2 was.
 */
export type AlertConfigurationState = 'NOT_CONFIGURED' | 'CONFIGURED' | 'DEGRADED';

/** §294. The bounded vocabulary for what happened to one dispatch attempt. */
export type AlertDispatchOutcome =
  | 'DELIVERY_ACCEPTED'
  | 'PROVIDER_REJECTED'
  | 'NETWORK_FAILURE'
  | 'MALFORMED_RESPONSE';

export interface AlertDeliveryObservation {
  readonly outcome: AlertDispatchOutcome;
  readonly channel: Exclude<AlertChannel, 'none'>;
  readonly at: string;
  /** Present only for a provider response; absent for a transport failure. */
  readonly status?: number;
}

export interface AlertConfiguration {
  /**
   * Retained as a boolean for the existing callers. TRUE for both CONFIGURED and DEGRADED: a
   * degraded channel IS configured, it is failing to deliver, and those are not the same fact.
   */
  readonly configured: boolean;
  readonly state: AlertConfigurationState;
  readonly channel: AlertChannel;
  readonly reason: string;
  /** The most recent dispatch outcome inside the delivery-health window, if there was one. */
  readonly lastDelivery?: AlertDeliveryObservation;
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

/**
 * §294. How long one delivery failure keeps the channel DEGRADED. Deliberately the dedupe window:
 * a channel that is genuinely broken produces another failure inside it, and one that recovered
 * reports CONFIGURED again without anyone clearing a flag.
 */
const DELIVERY_HEALTH_WINDOW_MS = DEDUPE_WINDOW_MS;

/**
 * §294. TLDs that can never receive mail, so an address ending in one is a configuration mistake
 * rather than a delivery risk. `invalid`, `example` and `test` are reserved by RFC 2606;
 * `localhost` and `local` by RFC 6761 and mDNS. `alerts@safety-insite.invalid` — the fallback MO-2
 * was about — is caught by the first of these rather than by being named, because naming one
 * string would leave the next one through.
 */
const UNDELIVERABLE_TLDS: ReadonlySet<string> = new Set([
  'invalid', 'example', 'test', 'localhost', 'local',
]);

/**
 * Conservative and deliberately not RFC 5321-complete. The job is to reject what a provider will
 * certainly reject and what a human certainly mistyped — an empty value, a bare word, a list, a
 * domain with no TLD — not to adjudicate the exotic tail of the address grammar. A provider that
 * disagrees about a structurally plausible address now produces PROVIDER_REJECTED, which is
 * visible, rather than silence, which was the defect.
 */
const ADDRESS_SHAPE = /^[^\s@,<>]+@([^\s@,<>.]+\.)+[A-Za-z]{2,}$/;

/**
 * §294. Structural deliverability, exported because EM-2 will need exactly this test for the
 * password-reset sender and must not grow a second, differently-wrong copy of it.
 */
export function isStructurallyDeliverableAddress(value: string | undefined | null): boolean {
  if (typeof value !== 'string') return false;
  const address = value.trim();
  if (address.length === 0 || address !== value.trim() || /\s/.test(address)) return false;
  if (!ADDRESS_SHAPE.test(address)) return false;
  const tld = address.slice(address.lastIndexOf('.') + 1).toLowerCase();
  return !UNDELIVERABLE_TLDS.has(tld);
}

const serverErrors: number[] = [];
const lastAlertAt = new Map<string, number>();
let alertsInWindow: number[] = [];

/**
 * §294. THE ONE PLACE THAT DECIDES WHAT THE EMAIL CHANNEL NEEDS.
 *
 * `describeAlertConfiguration` and `dispatchOperationalAlert` are both written in terms of this,
 * which is what makes it impossible for readiness to claim a channel the dispatcher cannot use.
 * Adding a requirement here changes both at once; there is nowhere else to add one.
 *
 * SENDER SEMANTICS — the smallest coherent design. Monitoring SHARES the password-reset sender by
 * default, because a v1 product with one verified domain should not ask its owner to verify two,
 * and because the owner's §293 architecture chose one provider precisely so one configuration step
 * serves both. `OPERATIONAL_ALERT_FROM_EMAIL` exists as an OPTIONAL override for the day operations
 * mail should be distinguishable from product mail — it adds no required configuration and no
 * second thing to verify, and it means that decision is later reversible by configuration rather
 * than by another edit to this file.
 */
export type EmailChannelResolution =
  | { readonly ok: true; readonly to: string; readonly from: string; readonly apiKey: string }
  | { readonly ok: false; readonly reason: string };

export function resolveEmailChannel(): EmailChannelResolution {
  const to = process.env.OPERATIONAL_ALERT_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  // NO FALLBACK. The absence of a sender is a configuration state, not a value to invent.
  const from = process.env.OPERATIONAL_ALERT_FROM_EMAIL || process.env.PASSWORD_RESET_FROM_EMAIL;

  if (!to) {
    return { ok: false, reason: 'OPERATIONAL_ALERT_EMAIL is not set, so there is no recipient.' };
  }
  if (!isStructurallyDeliverableAddress(to)) {
    return {
      ok: false,
      reason: 'OPERATIONAL_ALERT_EMAIL is not a structurally deliverable address, so no alert '
        + 'could reach it.',
    };
  }
  if (!apiKey) {
    return {
      ok: false,
      reason: 'OPERATIONAL_ALERT_EMAIL is set but RESEND_API_KEY is not, so no alert can be '
        + 'delivered.',
    };
  }
  if (!from) {
    return {
      ok: false,
      reason: 'OPERATIONAL_ALERT_EMAIL and RESEND_API_KEY are set but no sender is configured. Set '
        + 'PASSWORD_RESET_FROM_EMAIL (shared with password reset) or OPERATIONAL_ALERT_FROM_EMAIL '
        + 'to an address on a domain verified in the provider account. There is deliberately no '
        + 'default sender: an unverifiable one would make this channel report itself configured '
        + 'while every send was rejected.',
    };
  }
  if (!isStructurallyDeliverableAddress(from)) {
    return {
      ok: false,
      reason: 'The configured sender is not a structurally deliverable address — an address on a '
        + 'reserved TLD such as .invalid or .example can never be verified with a mail provider, '
        + 'so the channel would accept configuration and deliver nothing.',
    };
  }
  return { ok: true, to, from, apiKey };
}

export function describeAlertConfiguration(): AlertConfiguration {
  if (process.env.OPERATIONAL_ALERT_WEBHOOK_URL) {
    return withDeliveryHealth({
      configured: true,
      state: 'CONFIGURED',
      channel: 'webhook',
      reason: 'OPERATIONAL_ALERT_WEBHOOK_URL is set.',
    });
  }

  const email = resolveEmailChannel();
  if (email.ok) {
    return withDeliveryHealth({
      configured: true,
      state: 'CONFIGURED',
      channel: 'email',
      reason: 'A recipient, a provider credential and a deliverable sender are all configured.',
    });
  }

  // An email channel that is PARTLY configured is still nothing watching, and says so with the
  // missing piece named — the operator's next action is in the reason rather than in a runbook.
  if (process.env.OPERATIONAL_ALERT_EMAIL) {
    return { configured: false, state: 'NOT_CONFIGURED', channel: 'none', reason: email.reason };
  }

  return {
    configured: false,
    state: 'NOT_CONFIGURED',
    channel: 'none',
    reason: 'No alert destination is configured. Errors are emitted and retrievable from the '
      + 'platform log store, but nothing is pushed to an operator.',
  };
}

/**
 * §294. A configured channel whose last attempt failed inside the health window is DEGRADED, not
 * CONFIGURED. This is the positive half of the MO-2 repair: refusing to claim a channel is the
 * minimum, and saying that a claimed channel has stopped delivering is the part an operator can
 * act on. It deliberately does not affect service readiness — see the health controller.
 */
function withDeliveryHealth(base: AlertConfiguration): AlertConfiguration {
  const observation = currentDeliveryObservation();
  if (!observation) return base;
  if (observation.outcome === 'DELIVERY_ACCEPTED') return { ...base, lastDelivery: observation };
  return {
    ...base,
    state: 'DEGRADED',
    reason: `${base.reason} The most recent delivery attempt did not succeed `
      + `(${observation.outcome}${observation.status ? ` ${observation.status}` : ''}), so alerts `
      + 'are configured but may not be arriving.',
    lastDelivery: observation,
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
 * §294. The most recent dispatch outcome. One slot rather than a history: the question an operator
 * has is "is this channel working right now", and keeping a log here would be building the
 * observability product §291 forbade.
 */
let lastDelivery: AlertDeliveryObservation | null = null;

function currentDeliveryObservation(): AlertDeliveryObservation | null {
  if (!lastDelivery) return null;
  const age = Date.now() - Date.parse(lastDelivery.at);
  return Number.isFinite(age) && age < DELIVERY_HEALTH_WINDOW_MS ? lastDelivery : null;
}

/**
 * §294. Record what the provider actually said.
 *
 * WHAT IS DELIBERATELY NOT IN HERE: the API key, the recipient, the sender, the subject and the
 * alert body. An operator needs to know that the email channel was rejected with 403 while trying
 * to send `storage.operation_failed`; they do not need the mailbox address in the platform log
 * store to act on that, and `emitOperationalEvent` would not be the place to put it if they did.
 * `alertEvent` names WHICH alert failed, which is the one identifier that makes this actionable.
 */
function recordDispatchOutcome(
  channel: Exclude<AlertChannel, 'none'>,
  alertEvent: string,
  outcome: AlertDispatchOutcome,
  status?: number,
): void {
  try {
    lastDelivery = { outcome, channel, at: new Date().toISOString(), status };
    if (outcome === 'DELIVERY_ACCEPTED') {
      emitOperationalEvent('monitoring.alert_delivered', { channel, alertEvent, status });
      return;
    }
    emitOperationalEvent('monitoring.alert_delivery_failed', {
      channel, alertEvent, outcome, status,
    });
  } catch {
    // The outcome recorder is itself observability. It may not throw into an unhandled rejection.
  }
}

/**
 * §294. Resolve one provider response into exactly one bounded outcome.
 *
 * A 2xx whose body is not a provider acknowledgement is MALFORMED_RESPONSE rather than accepted:
 * treating an unreadable success as a success is the same mistake as MO-2 one layer down.
 */
async function classifyProviderResponse(response: Response): Promise<{
  outcome: AlertDispatchOutcome; status: number;
}> {
  if (!response.ok) return { outcome: 'PROVIDER_REJECTED', status: response.status };
  try {
    const body = (await response.json()) as { id?: unknown };
    if (body && typeof body === 'object' && typeof body.id === 'string' && body.id.length > 0) {
      return { outcome: 'DELIVERY_ACCEPTED', status: response.status };
    }
    return { outcome: 'MALFORMED_RESPONSE', status: response.status };
  } catch {
    return { outcome: 'MALFORMED_RESPONSE', status: response.status };
  }
}

/**
 * Deliberately never throws and never awaits the caller. An alerting failure must not turn a
 * request that already succeeded into an error, and must not delay one that is still running --
 * which is the same rule §287 applied to the audit write for the same reason.
 *
 * §294 does not weaken that in either direction. The send is still launched and abandoned, so the
 * customer's request is never waiting on a mail provider and an alert-provider failure can never
 * become a customer-facing 500. What changed is that the PROMISE now resolves into evidence
 * instead of into `undefined`: the outcome is recorded long after the request has returned, on the
 * microtask that would previously have discarded it. Not throwing was always correct; the
 * `.catch(() => undefined)` that also discarded the answer was the part that was not.
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
      })
        .then(response => recordDispatchOutcome(
          'webhook',
          line.event,
          response.ok ? 'DELIVERY_ACCEPTED' : 'PROVIDER_REJECTED',
          response.status,
        ))
        .catch(() => recordDispatchOutcome('webhook', line.event, 'NETWORK_FAILURE'));
      return;
    }

    if (config.channel === 'email') {
      // The resolution is re-taken rather than carried from `describeAlertConfiguration`, and it
      // is the SAME function, so there is no path on which readiness and dispatch disagree about
      // what the channel needs. A non-ok resolution here would mean the environment changed
      // between the two calls; it is treated as "do not send" rather than as "send anyway".
      const email = resolveEmailChannel();
      if (!email.ok) return;

      void fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${email.apiKey}`,
        },
        body: JSON.stringify({
          from: email.from,
          to: [email.to],
          subject: `[Safety InSite] ${line.event}`,
          text: JSON.stringify(payload, null, 2),
        }),
      })
        .then(async response => {
          const { outcome, status } = await classifyProviderResponse(response);
          recordDispatchOutcome('email', line.event, outcome, status);
        })
        .catch(() => recordDispatchOutcome('email', line.event, 'NETWORK_FAILURE'));
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
  lastDelivery = null;
}

/** §294 test seam. The delivery observation a verification has just produced, without waiting. */
export function lastAlertDeliveryForVerification(): AlertDeliveryObservation | null {
  return lastDelivery;
}

export const OPERATIONAL_ALERT_POLICY = {
  alertsOn: 'every error-severity operational event, plus a burst of 5xx responses',
  serverErrorThreshold: SERVER_ERROR_THRESHOLD,
  serverErrorWindowMinutes: SERVER_ERROR_WINDOW_MS / 60000,
  dedupeWindowMinutes: DEDUPE_WINDOW_MS / 60000,
  maxAlertsPerWindow: MAX_ALERTS_PER_WINDOW,
  neverAlertsOn: ['401', '402', '404', 'ordinary 400 validation', 'expected 409 conflict'],
  // §294 (MO-2). Stated in the policy the product serves, so the requirement is discoverable from
  // /health/ready rather than only from this file.
  emailChannelRequires: [
    'OPERATIONAL_ALERT_EMAIL',
    'RESEND_API_KEY',
    'PASSWORD_RESET_FROM_EMAIL (shared) or OPERATIONAL_ALERT_FROM_EMAIL (override)',
  ],
  senderFallback: 'NONE — a channel with no configured sender reports NOT_CONFIGURED',
  dispatchOutcomes: [
    'DELIVERY_ACCEPTED', 'PROVIDER_REJECTED', 'NETWORK_FAILURE', 'MALFORMED_RESPONSE',
  ],
} as const;
