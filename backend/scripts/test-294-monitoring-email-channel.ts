/**
 * §294 (MO-2) — THE EMAIL ALERT CHANNEL, EXECUTED FOR THE FIRST TIME.
 *
 * ZERO PROVIDER CALLS. ZERO REAL EMAIL. ZERO NETWORK. ZERO DATABASE. ZERO PRODUCTION CONTACT.
 *
 * §291 and §292 both proved the alerting mechanism against a local HTTP WEBHOOK receiver, and
 * §293 found that the EMAIL branch — the one the product owner then selected — had never been
 * executed by anything. This is that execution, against a controlled in-process fake provider
 * installed over `globalThis.fetch`, which is also what lets the harness inspect the exact request
 * the product would have transmitted rather than inferring it.
 *
 * WHAT THIS IS TRYING TO FALSIFY. MO-2 was not "email is broken"; it was "the product cannot tell
 * whether email is broken". So the cases below are about AGREEMENT and about EVIDENCE:
 *
 *   - configuration introspection and dispatch must require the same things (cases 1-4, P);
 *   - every provider answer must become one bounded, recorded outcome (cases 5-8, M);
 *   - none of it may cost the customer their operation (case 9) or leak a secret (case 10);
 *   - and the §291 noise policy must be exactly as loud as it was before (cases 11-12).
 *
 * ANTI-VACUITY. A test that passes against the defect proves nothing, so case A replicates the
 * pre-§294 logic VERBATIM and requires it to FAIL — to report the channel configured while sending
 * from a sender no provider can verify. If that case ever starts passing, this harness has stopped
 * measuring the thing it was written for.
 */
process.env.NODE_ENV = 'test';

import {
  describeAlertConfiguration,
  dispatchOperationalAlert,
  isStructurallyDeliverableAddress,
  lastAlertDeliveryForVerification,
  noteServerError,
  resetOperationalAlertStateForVerification,
  resolveEmailChannel,
  serverErrorCountInWindow,
  OPERATIONAL_ALERT_POLICY,
} from '../src/observability/operational-alerts';
import {
  buildOperationalEvent,
  emitOperationalEvent,
  OPERATIONAL_EVENT_SCHEMA,
  OperationalEventLine,
} from '../src/observability/operational-events';
import { ArgumentsHost, HttpException } from '@nestjs/common';
import { ServerErrorAlertFilter } from '../src/observability/server-error-alert.filter';

// ============================================================================================
// HARNESS
// ============================================================================================

const FAKE_KEY = 're_SECTION294_FAKE_CREDENTIAL_NEVER_REAL_0123456789';
const RECIPIENT = 'ops-mailbox@example-operator-domain.com';
const SENDER = 'alerts@mail.safety-insite.com';

interface CapturedRequest { url: string; headers: Record<string, string>; body: any }

let requests: CapturedRequest[] = [];
let events: OperationalEventLine[] = [];
let unhandledRejections: unknown[] = [];

type FakeResponder = () => Promise<Response>;
let responder: FakeResponder = async () => json(200, { id: 'fake-message-id' });

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

/** Installed over global fetch for the whole run. Nothing in this file may reach a network. */
(globalThis as any).fetch = async (url: any, init: any): Promise<Response> => {
  requests.push({
    url: String(url),
    headers: (init?.headers ?? {}) as Record<string, string>,
    body: init?.body ? JSON.parse(String(init.body)) : null,
  });
  return responder();
};

process.on('unhandledRejection', reason => unhandledRejections.push(reason));

/**
 * EVENTS ARE READ OFF THE REAL LOG STREAM, NOT OFF A TEST SINK.
 *
 * `captureOperationalEventsForVerification` exists, and using it here would have been a mistake:
 * the sink RETURNS BEFORE `dispatchOperationalAlert`, so a harness built on it exercises emission
 * and never exercises the alert path at all. Two cases in an earlier draft of this file passed
 * that way — the provider was never called and a thrown provider error was never reached.
 *
 * So this intercepts `process.stdout/stderr.write` instead and parses what the product actually
 * wrote. Everything still reaches the terminal, the full production path runs including dispatch,
 * and the redaction case gets to assert against the exact BYTES a log drain would receive rather
 * than against an in-memory object that never went through `JSON.stringify`.
 */
const realStdoutWrite = process.stdout.write.bind(process.stdout);
const realStderrWrite = process.stderr.write.bind(process.stderr);
let rawLogBytes: string[] = [];

function intercept(real: (chunk: any, ...rest: any[]) => boolean) {
  return (chunk: any, ...rest: any[]): boolean => {
    const text = String(chunk);
    if (text.includes(OPERATIONAL_EVENT_SCHEMA)) {
      rawLogBytes.push(text);
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line) as OperationalEventLine;
          if (parsed?.schema === OPERATIONAL_EVENT_SCHEMA) events.push(parsed);
        } catch { /* not an event line */ }
      }
      return true; // swallow: the event lines are reported through `check` instead
    }
    return real(chunk, ...rest);
  };
}
process.stdout.write = intercept(realStdoutWrite) as any;
process.stderr.write = intercept(realStderrWrite) as any;

const ENV_KEYS = [
  'OPERATIONAL_ALERT_WEBHOOK_URL', 'OPERATIONAL_ALERT_EMAIL', 'RESEND_API_KEY',
  'PASSWORD_RESET_FROM_EMAIL', 'OPERATIONAL_ALERT_FROM_EMAIL',
] as const;

function setEnv(vars: Partial<Record<(typeof ENV_KEYS)[number], string>>): void {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(vars)) process.env[key] = value;
}

function reset(vars: Partial<Record<(typeof ENV_KEYS)[number], string>> = {}): void {
  setEnv(vars);
  resetOperationalAlertStateForVerification();
  requests = [];
  events = [];
  unhandledRejections = [];
  responder = async () => json(200, { id: 'fake-message-id' });
  rawLogBytes = [];
}

/** Two macrotask turns: enough for fetch -> then -> await response.json() -> record. */
const settle = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 0));
  await new Promise(resolve => setTimeout(resolve, 0));
};

const errorLine = (event = 'storage.operation_failed'): OperationalEventLine =>
  ({ ...buildOperationalEvent('storage.operation_failed', { bucket: 'reports' }), event } as OperationalEventLine);

// ---- assertions -----------------------------------------------------------------------------

interface CaseResult { id: string; title: string; pass: boolean; detail: string }
const results: CaseResult[] = [];

function check(id: string, title: string, pass: boolean, detail: string): void {
  results.push({ id, title, pass, detail });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${title}\n        ${detail}`);
}

// ============================================================================================
// CASES 1-4 + P — CONFIGURATION TRUTHFULNESS, AND DESCRIBE/DISPATCH PARITY
// ============================================================================================

async function configurationCases(): Promise<void> {
  console.log('\nCONFIGURATION TRUTHFULNESS — what the channel must have before it may claim it\n');

  // 1 — no recipient
  reset({ RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER });
  let config = describeAlertConfiguration();
  check('1', 'no recipient -> NOT_CONFIGURED',
    config.state === 'NOT_CONFIGURED' && config.channel === 'none' && !config.configured,
    `state=${config.state} channel=${config.channel} reason="${config.reason}"`);

  // 2 — no API key
  reset({ OPERATIONAL_ALERT_EMAIL: RECIPIENT, PASSWORD_RESET_FROM_EMAIL: SENDER });
  config = describeAlertConfiguration();
  check('2', 'no API key -> NOT_CONFIGURED',
    config.state === 'NOT_CONFIGURED' && /RESEND_API_KEY/.test(config.reason),
    `state=${config.state} reason="${config.reason}"`);

  // 3a — sender absent
  reset({ OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY });
  config = describeAlertConfiguration();
  const senderAbsent = config.state === 'NOT_CONFIGURED' && /sender/i.test(config.reason);
  check('3a', 'recipient + key but NO SENDER -> NOT_CONFIGURED  <-- the MO-2 case',
    senderAbsent,
    `state=${config.state} reason="${config.reason}"`);

  // 3b — sender structurally undeliverable (the retired fallback, and its whole family)
  const undeliverable = [
    'alerts@safety-insite.invalid', 'ops@example', 'ops@foo.example', 'ops@host.test',
    'ops@localhost', 'not-an-address', '', 'a@b.c d',
  ];
  const rejectedAll = undeliverable.every(address => {
    reset({ OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: address });
    return describeAlertConfiguration().state === 'NOT_CONFIGURED';
  });
  check('3b', 'structurally undeliverable sender -> NOT_CONFIGURED',
    rejectedAll && !isStructurallyDeliverableAddress('alerts@safety-insite.invalid'),
    `${undeliverable.length}/${undeliverable.length} rejected, including the retired fallback alerts@safety-insite.invalid`);

  // 3c — an undeliverable RECIPIENT is refused on the same rule
  reset({ OPERATIONAL_ALERT_EMAIL: 'ops@nowhere.invalid', RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER });
  config = describeAlertConfiguration();
  check('3c', 'structurally undeliverable RECIPIENT -> NOT_CONFIGURED',
    config.state === 'NOT_CONFIGURED',
    `state=${config.state} reason="${config.reason}"`);

  // 4 — everything present
  reset({ OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER });
  config = describeAlertConfiguration();
  check('4', 'recipient + key + deliverable sender -> CONFIGURED',
    config.state === 'CONFIGURED' && config.channel === 'email' && config.configured,
    `state=${config.state} channel=${config.channel}`);

  // 4b — the optional override wins, and adds no requirement
  reset({
    OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY,
    PASSWORD_RESET_FROM_EMAIL: SENDER, OPERATIONAL_ALERT_FROM_EMAIL: 'ops-alerts@mail.safety-insite.com',
  });
  dispatchOperationalAlert(errorLine());
  await settle();
  check('4b', 'OPERATIONAL_ALERT_FROM_EMAIL overrides the shared sender when set',
    requests.length === 1 && requests[0].body.from === 'ops-alerts@mail.safety-insite.com',
    `transmitted from=${requests[0]?.body?.from}`);

  // P — PARITY. Across every combination, "describe says configured" and "dispatch transmits"
  // must be the same predicate. This is the structural claim the repair is built on.
  const values = [undefined, '', 'alerts@safety-insite.invalid', SENDER];
  const combos: Array<Record<string, string | undefined>> = [];
  for (const to of [undefined, 'bad', RECIPIENT]) {
    for (const key of [undefined, FAKE_KEY]) {
      for (const from of values) combos.push({ to, key, from });
    }
  }
  let parityFailures = 0;
  const parityDetail: string[] = [];
  for (const combo of combos) {
    const env: Record<string, string> = {};
    if (combo.to !== undefined) env.OPERATIONAL_ALERT_EMAIL = combo.to;
    if (combo.key !== undefined) env.RESEND_API_KEY = combo.key;
    if (combo.from !== undefined) env.PASSWORD_RESET_FROM_EMAIL = combo.from;
    reset(env as any);
    const claimed = describeAlertConfiguration().state !== 'NOT_CONFIGURED';
    dispatchOperationalAlert(errorLine());
    await settle();
    const transmitted = requests.length > 0;
    if (claimed !== transmitted) {
      parityFailures += 1;
      parityDetail.push(`to=${combo.to} key=${!!combo.key} from=${combo.from} claimed=${claimed} sent=${transmitted}`);
    }
    if (transmitted && !isStructurallyDeliverableAddress(requests[0].body.from)) {
      parityFailures += 1;
      parityDetail.push(`transmitted an undeliverable sender ${requests[0].body.from}`);
    }
  }
  check('P', 'describe/dispatch parity over every configuration combination',
    parityFailures === 0,
    `${combos.length} combinations, ${parityFailures} disagreements${parityDetail.length ? `: ${parityDetail.join('; ')}` : ''}; and no combination transmitted an undeliverable sender`);
}

// ============================================================================================
// CASES 5-8 + M — THE PROVIDER'S ANSWER BECOMES BOUNDED EVIDENCE
// ============================================================================================

async function outcomeCases(): Promise<void> {
  console.log('\nDISPATCH RESULT VISIBILITY — every provider answer resolves to one bounded outcome\n');

  const live = { OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER };

  const run = async (label: string, respond: FakeResponder) => {
    reset(live);
    responder = respond;
    dispatchOperationalAlert(errorLine());
    await settle();
    const observation = lastAlertDeliveryForVerification();
    const emitted = events.filter(e => e.event.startsWith('monitoring.alert_'));
    return { label, observation, emitted };
  };

  // 5 — 2xx with a provider acknowledgement
  let r = await run('2xx', async () => json(200, { id: 'msg_294_fake' }));
  check('5', 'provider 2xx -> DELIVERY_ACCEPTED evidence',
    r.observation?.outcome === 'DELIVERY_ACCEPTED' && r.emitted.length === 1
      && r.emitted[0].event === 'monitoring.alert_delivered' && r.emitted[0].severity === 'info',
    `outcome=${r.observation?.outcome} status=${r.observation?.status} event=${r.emitted[0]?.event} severity=${r.emitted[0]?.severity}`);

  // 6 — 4xx (the shape an unverified sending domain or a revoked key actually takes)
  r = await run('4xx', async () => json(403, { message: 'domain is not verified' }));
  check('6', 'provider 4xx -> PROVIDER_REJECTED evidence',
    r.observation?.outcome === 'PROVIDER_REJECTED' && r.observation?.status === 403
      && r.emitted.length === 1 && r.emitted[0].event === 'monitoring.alert_delivery_failed'
      && r.emitted[0].severity === 'warning',
    `outcome=${r.observation?.outcome} status=${r.observation?.status} severity=${r.emitted[0]?.severity} metadata=${JSON.stringify(r.emitted[0]?.metadata)}`);

  // 7 — 5xx
  r = await run('5xx', async () => json(503, { message: 'upstream unavailable' }));
  check('7', 'provider 5xx -> PROVIDER_REJECTED evidence',
    r.observation?.outcome === 'PROVIDER_REJECTED' && r.observation?.status === 503
      && r.emitted[0]?.event === 'monitoring.alert_delivery_failed',
    `outcome=${r.observation?.outcome} status=${r.observation?.status}`);

  // 8 — transport failure
  r = await run('network', async () => { throw new Error('ECONNRESET'); });
  check('8', 'network failure -> NETWORK_FAILURE evidence',
    r.observation?.outcome === 'NETWORK_FAILURE' && r.observation?.status === undefined
      && r.emitted[0]?.event === 'monitoring.alert_delivery_failed',
    `outcome=${r.observation?.outcome} status=${String(r.observation?.status)} unhandledRejections=${unhandledRejections.length}`);

  // M — a 2xx that is not an acknowledgement is not an acceptance
  r = await run('malformed', async () => new Response('<html>ok</html>', { status: 200 }));
  check('M', '2xx without a provider acknowledgement -> MALFORMED_RESPONSE, not accepted',
    r.observation?.outcome === 'MALFORMED_RESPONSE',
    `outcome=${r.observation?.outcome} status=${r.observation?.status} — treating an unreadable success as success is MO-2 one layer down`);

  // D — a failure degrades readiness without un-readying the service
  reset(live);
  responder = async () => json(403, { message: 'domain is not verified' });
  dispatchOperationalAlert(errorLine());
  await settle();
  const degraded = describeAlertConfiguration();
  reset(live);
  const recovered = describeAlertConfiguration();
  check('D', 'a failed delivery reports DEGRADED; a clean window reports CONFIGURED',
    degraded.state === 'DEGRADED' && degraded.configured === true
      && degraded.lastDelivery?.outcome === 'PROVIDER_REJECTED' && recovered.state === 'CONFIGURED',
    `after rejection state=${degraded.state} configured=${degraded.configured}; after reset state=${recovered.state}`);
}

// ============================================================================================
// CASE 9 — CONTAINMENT, AND CASE 10 — REDACTION
// ============================================================================================

async function containmentAndRedactionCases(): Promise<void> {
  console.log('\nCONTAINMENT AND REDACTION — the alert may not cost the operation or leak the secret\n');

  const live = { OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER };

  // 9 — an auxiliary alert failure leaves the primary operation completed and the process intact.
  reset(live);
  responder = async () => { throw new Error('provider is down'); };
  let primaryResult = 'NOT_RUN';
  let threw: unknown = null;
  try {
    // The shape of every real call site: the product event has already happened, the record is
    // written, and THEN the alert is attempted.
    emitOperationalEvent('storage.operation_failed', { bucket: 'reports', operation: 'put' });
    primaryResult = 'PRIMARY_COMPLETED';
  } catch (error) { threw = error; }
  await settle();
  const alertWasActuallyAttempted = lastAlertDeliveryForVerification()?.outcome === 'NETWORK_FAILURE';
  check('9', 'an alert-provider failure leaves the primary operation successful',
    primaryResult === 'PRIMARY_COMPLETED' && threw === null && unhandledRejections.length === 0
      && alertWasActuallyAttempted,
    `primary=${primaryResult} threw=${threw === null ? 'no' : String(threw)} `
      + `unhandledRejections=${unhandledRejections.length}; and the alert really was attempted and `
      + `really did fail (outcome=${lastAlertDeliveryForVerification()?.outcome}) — without that the `
      + `case would pass on a path where no alert was ever sent`);

  // 10 — the credential is USED and never RECORDED.
  reset(live);
  responder = async () => json(403, { message: 'domain is not verified' });
  dispatchOperationalAlert(errorLine());
  await settle();
  const authHeader = String((requests[0]?.headers as any)?.authorization ?? '');
  const evidence = JSON.stringify({ events, observation: lastAlertDeliveryForVerification(), readiness: describeAlertConfiguration() })
    + rawLogBytes.join('');
  const keyUsed = authHeader.includes(FAKE_KEY);
  const keyLeaked = evidence.includes(FAKE_KEY) || evidence.includes('re_');
  const recipientLeaked = evidence.includes(RECIPIENT);
  check('10', 'the credential is transmitted and never appears in evidence',
    keyUsed && !keyLeaked && !recipientLeaked,
    `authorization header carries the key=${keyUsed}; key in emitted evidence=${keyLeaked}; mailbox address in emitted evidence=${recipientLeaked}`);
}

// ============================================================================================
// CASES 11-12 — THE §291 NOISE POLICY IS EXACTLY AS LOUD AS IT WAS
// ============================================================================================

async function noisePolicyCases(): Promise<void> {
  console.log('\nNOISE POLICY — unchanged by the repair, and re-proven rather than assumed\n');

  const live = { OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY, PASSWORD_RESET_FROM_EMAIL: SENDER };

  // 11a — non-error severities never dispatch. This is the gate that keeps a refusal quiet.
  reset(live);
  for (const event of ['expert.execution.refused', 'expert.control.spend_limit_refused',
    'action.notification_failed', 'monitoring.alert_delivery_failed', 'monitoring.alert_delivered'] as const) {
    dispatchOperationalAlert(buildOperationalEvent(event as any, {}));
  }
  await settle();
  const nonErrorSends = requests.length;

  // 11b — ordinary client failures driven through the REAL exception filter. The predicate is
  // deliberately not restated here: restating it would make this case agree with itself no matter
  // what the filter does, which is the vacuous shape §294 is not allowed to count as coverage.
  reset(live);
  const replies: Array<{ status: number }> = [];
  const applicationRef = {
    isHeadersSent: () => false,
    reply: (_res: unknown, _body: unknown, status: number) => { replies.push({ status }); },
    end: () => undefined,
  };
  const filter = new ServerErrorAlertFilter(applicationRef as any);
  const hostFor = (): ArgumentsHost => ({
    getArgByIndex: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ method: 'POST', route: { path: '/reports' } }) }),
  } as unknown as ArgumentsHost);

  for (const status of [401, 402, 404, 400, 409]) {
    filter.catch(new HttpException('client failure', status), hostFor());
  }
  await settle();
  const clientCount = serverErrorCountInWindow();
  const clientEvents = events.length;
  const clientSends = requests.length;
  const clientRepliesUnchanged = replies.length === 5
    && replies.every((r, i) => r.status === [401, 402, 404, 400, 409][i]);

  check('11', 'ordinary 401/402/404/400/409 and every non-error event remain non-alerting',
    nonErrorSends === 0 && clientCount === 0 && clientEvents === 0 && clientSends === 0
      && clientRepliesUnchanged,
    `non-error severities produced ${nonErrorSends} sends; five client failures through the real `
      + `ServerErrorAlertFilter produced a rate count of ${clientCount}, ${clientEvents} events and `
      + `${clientSends} sends, and the filter returned all five statuses to the client unchanged`);

  // 11d — the SAME filter, fed real 500s, does alert: without this the case above could pass on a
  // filter that had simply stopped working.
  reset(live);
  for (let i = 0; i < 5; i += 1) {
    filter.catch(new HttpException('server failure', 500), hostFor());
  }
  await settle();
  const burstEvents = events.filter(e => e.event === 'service.error_rate_exceeded');
  check('11d', 'the same filter fed five real 500s raises exactly one alert',
    burstEvents.length === 1 && requests.length === 1,
    `5 x HTTP 500 through the real filter -> ${burstEvents.length} service.error_rate_exceeded event(s) and ${requests.length} send(s); metadata=${JSON.stringify(burstEvents[0]?.metadata)}`);

  // 11c — and a genuine 5xx burst still raises exactly one rate condition at the threshold.
  reset(live);
  const crossings = [1, 2, 3, 4, 5, 6, 7].map(() => noteServerError());
  check('11c', 'a 5xx burst still crosses exactly once at the threshold',
    crossings.filter(Boolean).length === 1 && crossings[4] === true,
    `threshold=${OPERATIONAL_ALERT_POLICY.serverErrorThreshold}, crossings at ${crossings.map((c, i) => c ? i + 1 : null).filter(Boolean).join(',')} of 7 failures`);

  // 12a — dedupe: the same kind twice in a window is one send.
  reset(live);
  dispatchOperationalAlert(errorLine('storage.operation_failed'));
  dispatchOperationalAlert(errorLine('storage.operation_failed'));
  dispatchOperationalAlert(errorLine('report.generation_failed'));
  await settle();
  const dedupeSends = requests.length;

  // 12b — ceiling: a dedupe-key mistake cannot become a mail bomb.
  reset(live);
  for (let i = 0; i < 30; i += 1) dispatchOperationalAlert(errorLine(`synthetic.kind_${i}`));
  await settle();
  const ceilingSends = requests.length;
  check('12', 'dedupe and the hard ceiling are intact',
    dedupeSends === 2 && ceilingSends === OPERATIONAL_ALERT_POLICY.maxAlertsPerWindow,
    `two identical kinds + one distinct kind -> ${dedupeSends} sends; 30 distinct kinds -> ${ceilingSends} sends against a ceiling of ${OPERATIONAL_ALERT_POLICY.maxAlertsPerWindow}`);
}

// ============================================================================================
// CASE A — ANTI-VACUITY. THE PRE-§294 LOGIC, REPLICATED VERBATIM, MUST STILL FAIL.
// ============================================================================================

function antiVacuityCase(): void {
  console.log('\nANTI-VACUITY — the retired logic, replicated verbatim, must reproduce the defect\n');

  /** Pre-§294 describeAlertConfiguration, email branch, copied exactly. */
  const legacyConfigured = (): boolean =>
    Boolean(process.env.OPERATIONAL_ALERT_EMAIL && process.env.RESEND_API_KEY);
  /** Pre-§294 dispatch sender, copied exactly. */
  const legacySender = (): string =>
    process.env.PASSWORD_RESET_FROM_EMAIL || 'alerts@safety-insite.invalid';

  // The exact configuration §293 said the owner was about to create: the two variables the
  // register named, and no sender.
  reset({ OPERATIONAL_ALERT_EMAIL: RECIPIENT, RESEND_API_KEY: FAKE_KEY });

  const legacySaysConfigured = legacyConfigured();
  const legacyWouldSendFrom = legacySender();
  const legacySenderIsDeliverable = isStructurallyDeliverableAddress(legacyWouldSendFrom);
  const currentState = describeAlertConfiguration().state;

  const defectReproduced = legacySaysConfigured && !legacySenderIsDeliverable;
  const repairHolds = currentState === 'NOT_CONFIGURED';

  check('A', 'the retired logic reports CONFIGURED over an undeliverable sender; the repair does not',
    defectReproduced && repairHolds,
    `legacy: configured=${legacySaysConfigured} from=${legacyWouldSendFrom} deliverable=${legacySenderIsDeliverable} -> FALSE GREEN reproduced; §294: state=${currentState}`);
}

// ============================================================================================

async function main(): Promise<void> {
  console.log('\n§294 (MO-2) — monitoring email channel, executed against a controlled fake provider');
  console.log('0 provider calls · 0 real email · 0 network · 0 database · 0 production contact');

  await configurationCases();
  await outcomeCases();
  await containmentAndRedactionCases();
  await noisePolicyCases();
  antiVacuityCase();

  const failures = results.filter(r => !r.pass);
  console.log(`\n  cases run           ${results.length}`);
  console.log(`  passed              ${results.length - failures.length}`);
  console.log(`  failed              ${failures.length}`);
  console.log(`  provider calls      0`);
  console.log(`  real email sent     0`);
  console.log(`  unhandled rejects   ${unhandledRejections.length}`);

  console.log(`\n${JSON.stringify({
    artifact: 'SECTION_294_MO2_EMAIL_CHANNEL',
    casesRun: results.length,
    failures: failures.length,
    providerCalls: 0,
    realEmailSends: 0,
    databaseOperations: 0,
    cases: results.map(r => ({ id: r.id, pass: r.pass, title: r.title })),
  })}`);

  if (failures.length > 0) {
    console.log(`\nSECTION 294 EMAIL CHANNEL VERIFICATION FAILED — ${failures.map(f => f.id).join(', ')}`);
    process.exit(1);
  }
  console.log('\nEMAIL CHANNEL VERIFIED — configuration cannot claim what dispatch cannot do, '
    + 'and every provider answer becomes evidence');
}

void main();
