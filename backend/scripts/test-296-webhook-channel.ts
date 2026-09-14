/**
 * §296 (MO-1) — THE WEBHOOK BRANCH, EXECUTED FOR THE FIRST TIME SINCE §294 CHANGED IT.
 *
 * ZERO NETWORK. ZERO PROVIDER CALLS. ZERO PRODUCTION CONTACT.
 *
 * WHY THIS EXISTS. §291 and §292 proved the webhook branch against a local receiver — but that was
 * BEFORE §294 rewrote the dispatcher. §294's gate then proved the outcome machinery thoroughly and
 * proved ALL OF IT ON THE EMAIL BRANCH: the string "webhook" does not appear anywhere in
 * test-294-monitoring-email-channel.ts. So at the moment the product owner selected the webhook
 * architecture at §296, the webhook branch's `.then()` / `.catch()` outcome recording had never
 * been executed by anything. Closing MO-1 on an unexercised code path would have been closing it on
 * the same kind of assumption MO-2 was.
 *
 * This is deliberately a SEPARATE file rather than four more cases in the §294 gate. §294's record
 * says 21/21 and is cited in the register; editing it to say something else would rewrite a
 * finished result to describe work it did not do.
 *
 * ONE ASYMMETRY IS ASSERTED ON PURPOSE. The email branch treats a 2xx without a provider
 * acknowledgement as MALFORMED_RESPONSE. The webhook branch does not, and must not: an arbitrary
 * receiver has no acknowledgement schema, so 2xx IS the acknowledgement. W-ASYM records that as a
 * decision rather than leaving it to read as an oversight.
 */
process.env.NODE_ENV = 'test';

import {
  describeAlertConfiguration,
  dispatchOperationalAlert,
  lastAlertDeliveryForVerification,
  resetOperationalAlertStateForVerification,
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

const HOOK = 'https://hooks.example-receiver.test/services/SECTION296/FAKE/NEVER-REAL';
const EMAIL_LIVE = {
  OPERATIONAL_ALERT_EMAIL: 'ops@example-operator-domain.com',
  RESEND_API_KEY: 're_SECTION296_FAKE_NEVER_REAL',
  PASSWORD_RESET_FROM_EMAIL: 'alerts@mail.example-sender.com',
};

interface CapturedRequest { url: string; headers: Record<string, string>; body: any }
let requests: CapturedRequest[] = [];
let events: OperationalEventLine[] = [];
let unhandledRejections: unknown[] = [];
let rawLogBytes: string[] = [];

type FakeResponder = () => Promise<Response>;
let responder: FakeResponder = async () => new Response(null, { status: 204 });

(globalThis as any).fetch = async (url: any, init: any): Promise<Response> => {
  requests.push({
    url: String(url),
    headers: (init?.headers ?? {}) as Record<string, string>,
    body: init?.body ? JSON.parse(String(init.body)) : null,
  });
  return responder();
};
process.on('unhandledRejection', reason => unhandledRejections.push(reason));

// Read the real log stream rather than the test sink: the sink returns BEFORE dispatch, so a
// harness built on it never exercises the thing this file exists to exercise. (§294's note.)
const realStdout = process.stdout.write.bind(process.stdout);
const realStderr = process.stderr.write.bind(process.stderr);
function intercept(real: (chunk: any, ...rest: any[]) => boolean) {
  return (chunk: any, ...rest: any[]): boolean => {
    const text = String(chunk);
    if (!text.includes(OPERATIONAL_EVENT_SCHEMA)) return real(chunk, ...rest);
    rawLogBytes.push(text);
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as OperationalEventLine;
        if (parsed?.schema === OPERATIONAL_EVENT_SCHEMA) events.push(parsed);
      } catch { /* not an event line */ }
    }
    return true;
  };
}
process.stdout.write = intercept(realStdout) as any;
process.stderr.write = intercept(realStderr) as any;

const ENV_KEYS = ['OPERATIONAL_ALERT_WEBHOOK_URL', 'OPERATIONAL_ALERT_EMAIL', 'RESEND_API_KEY',
  'PASSWORD_RESET_FROM_EMAIL', 'OPERATIONAL_ALERT_FROM_EMAIL'] as const;

function reset(vars: Record<string, string> = {}): void {
  for (const key of ENV_KEYS) delete process.env[key];
  for (const [k, v] of Object.entries(vars)) process.env[k] = v;
  resetOperationalAlertStateForVerification();
  requests = []; events = []; unhandledRejections = []; rawLogBytes = [];
  responder = async () => new Response(null, { status: 204 });
}

const settle = async (): Promise<void> => {
  await new Promise(r => setTimeout(r, 0));
  await new Promise(r => setTimeout(r, 0));
};

const errorLine = (event = 'storage.operation_failed'): OperationalEventLine =>
  ({ ...buildOperationalEvent('storage.operation_failed', { bucket: 'reports', operation: 'put' }), event } as OperationalEventLine);

const results: { id: string; title: string; pass: boolean }[] = [];
function check(id: string, title: string, pass: boolean, detail: string): void {
  results.push({ id, title, pass });
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${id.padEnd(7)} ${title}\n           ${detail}`);
}

// ============================================================================================

async function main(): Promise<void> {
  console.log('\n§296 (MO-1) — webhook alert channel, executed against a controlled fake receiver');
  console.log('0 network · 0 provider calls · 0 production contact\n');
  console.log('CONFIGURATION\n');

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  let config = describeAlertConfiguration();
  check('W1', 'a webhook URL alone -> CONFIGURED, channel webhook',
    config.state === 'CONFIGURED' && config.channel === 'webhook' && config.configured,
    `state=${config.state} channel=${config.channel} — no sender, no credential, no domain required`);

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK, ...EMAIL_LIVE });
  dispatchOperationalAlert(errorLine());
  await settle();
  check('W2', 'webhook takes precedence when both channels are configured',
    describeAlertConfiguration().channel === 'webhook' && requests.length === 1
      && requests[0].url === HOOK,
    `one request, to the webhook — the email channel was fully configured and was not used`);

  console.log('\nDISPATCH RESULT VISIBILITY — the branch §294 rewrote and never ran\n');

  const run = async (respond: FakeResponder) => {
    reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
    responder = respond;
    dispatchOperationalAlert(errorLine());
    await settle();
    return {
      observation: lastAlertDeliveryForVerification(),
      emitted: events.filter(e => e.event.startsWith('monitoring.alert_')),
    };
  };

  // 204 specifically, and not 200: it is what a real Discord webhook returns, and a dispatcher
  // that only recognised 200 would report every successful delivery as a failure.
  let r = await run(async () => new Response(null, { status: 204 }));
  check('W3', 'receiver 204 No Content -> DELIVERY_ACCEPTED evidence',
    r.observation?.outcome === 'DELIVERY_ACCEPTED' && r.observation?.channel === 'webhook'
      && r.emitted.length === 1 && r.emitted[0].event === 'monitoring.alert_delivered'
      && r.emitted[0].severity === 'info',
    `outcome=${r.observation?.outcome} status=${r.observation?.status} event=${r.emitted[0]?.event}`);

  r = await run(async () => new Response('gone', { status: 404 }));
  check('W4', 'receiver 4xx -> PROVIDER_REJECTED evidence  (a revoked or deleted webhook)',
    r.observation?.outcome === 'PROVIDER_REJECTED' && r.observation?.status === 404
      && r.emitted[0]?.event === 'monitoring.alert_delivery_failed'
      && r.emitted[0]?.severity === 'warning',
    `outcome=${r.observation?.outcome} status=${r.observation?.status} metadata=${JSON.stringify(r.emitted[0]?.metadata)}`);

  r = await run(async () => new Response(null, { status: 500 }));
  check('W5', 'receiver 5xx -> PROVIDER_REJECTED evidence',
    r.observation?.outcome === 'PROVIDER_REJECTED' && r.observation?.status === 500,
    `outcome=${r.observation?.outcome} status=${r.observation?.status}`);

  r = await run(async () => { throw new Error('ENOTFOUND'); });
  check('W6', 'transport failure -> NETWORK_FAILURE evidence, no unhandled rejection',
    r.observation?.outcome === 'NETWORK_FAILURE' && r.observation?.status === undefined
      && unhandledRejections.length === 0,
    `outcome=${r.observation?.outcome} unhandledRejections=${unhandledRejections.length}`);

  r = await run(async () => new Response('<html>not json</html>', { status: 200 }));
  check('W-ASYM', '2xx with a non-JSON body is ACCEPTED on the webhook branch, unlike email',
    r.observation?.outcome === 'DELIVERY_ACCEPTED',
    `outcome=${r.observation?.outcome} — deliberate: an arbitrary receiver has no acknowledgement `
      + `schema, so 2xx IS the acknowledgement. The email branch requires a provider id and returns `
      + `MALFORMED_RESPONSE without one.`);

  r = await run(async () => new Response('ok', { status: 200 }));
  check('W3b', 'receiver 200 with a plain-text body -> DELIVERY_ACCEPTED  (the Slack shape)',
    r.observation?.outcome === 'DELIVERY_ACCEPTED' && r.observation?.status === 200,
    `outcome=${r.observation?.outcome} status=${r.observation?.status}`);

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  responder = async () => new Response('not_found', { status: 404 });
  dispatchOperationalAlert(errorLine());
  await settle();
  const degraded = describeAlertConfiguration();
  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  const recovered = describeAlertConfiguration();
  check('W7', 'a failed delivery reports DEGRADED; a clean window reports CONFIGURED',
    degraded.state === 'DEGRADED' && degraded.configured === true
      && degraded.lastDelivery?.outcome === 'PROVIDER_REJECTED' && recovered.state === 'CONFIGURED',
    `after rejection state=${degraded.state}; after window state=${recovered.state}`);

  console.log('\nWHAT IS ON THE WIRE, AND WHAT IS NOT\n');

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  dispatchOperationalAlert({
    ...buildOperationalEvent('report.generation_failed', {
      // Everything a real call site would pass, including things that must never leave the process.
      reportId: 'rep_123', organizationId: 'org_456', statusCode: 500,
      observationText: 'WORKER STANDING IN UNGUARDED MACHINE AREA',
      authorization: 'Bearer super-secret-token', apiKey: 'sk-ant-should-never-appear',
    }),
  } as OperationalEventLine);
  await settle();
  const wire = JSON.stringify(requests[0]?.body ?? {});
  const leaked = ['WORKER STANDING', 'super-secret-token', 'sk-ant-should-never-appear']
    .filter(s => wire.includes(s));
  check('W8', 'the transmitted payload carries identifiers and no content or secret',
    requests.length === 1 && requests[0].url === HOOK
      && requests[0].headers['content-type'] === 'application/json'
      && leaked.length === 0 && wire.includes('rep_123') && wire.includes('[redacted]'),
    `leaked=${leaked.length ? leaked.join(', ') : 'nothing'}; body=${wire.slice(0, 220)}`);

  console.log('\nCONTAINMENT AND NOISE\n');

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  responder = async () => { throw new Error('receiver is down'); };
  let primary = 'NOT_RUN'; let threw: unknown = null;
  try {
    emitOperationalEvent('storage.operation_failed', { bucket: 'reports' });
    primary = 'PRIMARY_COMPLETED';
  } catch (e) { threw = e; }
  await settle();
  check('W9', 'a receiver failure leaves the primary operation successful',
    primary === 'PRIMARY_COMPLETED' && threw === null && unhandledRejections.length === 0
      && lastAlertDeliveryForVerification()?.outcome === 'NETWORK_FAILURE',
    `primary=${primary} threw=${threw === null ? 'no' : String(threw)} unhandled=${unhandledRejections.length}; `
      + `and the alert really was attempted and really did fail`);

  // The real filter, not a restatement of its predicate.
  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  const replies: number[] = [];
  const applicationRef = {
    isHeadersSent: () => false,
    reply: (_r: unknown, _b: unknown, status: number) => { replies.push(status); },
    end: () => undefined,
  };
  const filter = new ServerErrorAlertFilter(applicationRef as any);
  const host = (): ArgumentsHost => ({
    getArgByIndex: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ method: 'POST', route: { path: '/reports' } }) }),
  } as unknown as ArgumentsHost);

  for (const status of [400, 401, 402, 404, 409]) filter.catch(new HttpException('x', status), host());
  await settle();
  check('W10', 'ordinary 400/401/402/404/409 generate no webhook traffic',
    requests.length === 0 && events.length === 0
      && replies.join(',') === '400,401,402,404,409',
    `${replies.length} client failures through the real ServerErrorAlertFilter -> ${requests.length} sends, `
      + `${events.length} events, and all five statuses returned to the client unchanged`);

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  for (let i = 0; i < 5; i += 1) filter.catch(new HttpException('boom', 500), host());
  await settle();
  const burst = events.filter(e => e.event === 'service.error_rate_exceeded');
  check('W11', 'five real 500s raise exactly one alert and send it exactly once',
    burst.length === 1 && requests.length === 1,
    `-> ${burst.length} service.error_rate_exceeded, ${requests.length} webhook send; metadata=${JSON.stringify(burst[0]?.metadata)}`);

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  dispatchOperationalAlert(errorLine('storage.operation_failed'));
  dispatchOperationalAlert(errorLine('storage.operation_failed'));
  dispatchOperationalAlert(errorLine('report.generation_failed'));
  await settle();
  const dedupe = requests.length;
  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  for (let i = 0; i < 30; i += 1) dispatchOperationalAlert(errorLine(`synthetic.kind_${i}`));
  await settle();
  check('W12', 'dedupe and the hard ceiling hold on the webhook channel',
    dedupe === 2 && requests.length === OPERATIONAL_ALERT_POLICY.maxAlertsPerWindow,
    `two identical kinds + one distinct -> ${dedupe} sends; 30 distinct kinds -> ${requests.length} against a ceiling of ${OPERATIONAL_ALERT_POLICY.maxAlertsPerWindow}`);

  console.log('\nANTI-VACUITY\n');

  reset({ OPERATIONAL_ALERT_WEBHOOK_URL: HOOK });
  responder = async () => new Response('not_found', { status: 404 });
  dispatchOperationalAlert(errorLine());
  await settle();
  const recorded = lastAlertDeliveryForVerification();
  const emittedFailure = events.some(e => e.event === 'monitoring.alert_delivery_failed');
  check('W-AV', 'the retired .catch(() => undefined) would have recorded NOTHING here',
    recorded?.outcome === 'PROVIDER_REJECTED' && emittedFailure,
    `a 404 from the receiver now yields outcome=${recorded?.outcome} status=${recorded?.status} and a `
      + `warning-severity line. Before §294 this exact case produced no observation, no event and no `
      + `readiness change — the webhook simply stopped working silently.`);

  const failures = results.filter(r => !r.pass);
  console.log(`\n  cases run      ${results.length}`);
  console.log(`  passed         ${results.length - failures.length}`);
  console.log(`  failed         ${failures.length}`);
  console.log(`\n${JSON.stringify({
    artifact: 'SECTION_296_WEBHOOK_CHANNEL',
    casesRun: results.length, failures: failures.length,
    network: 0, providerCalls: 0, productionContact: 'NONE',
    cases: results.map(r => ({ id: r.id, pass: r.pass, title: r.title })),
  })}`);

  if (failures.length) {
    console.log(`\nSECTION 296 WEBHOOK VERIFICATION FAILED — ${failures.map(f => f.id).join(', ')}`);
    process.exit(1);
  }
  console.log('\nWEBHOOK CHANNEL VERIFIED — the branch MO-1 will close on is exercised, '
    + 'its failures are visible, and it carries no content');
}

void main();
