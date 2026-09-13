# Safety InSite — Monitoring and Alerting (Controlled Beta)

Established §269. Scope: the minimum practical operational awareness for a 3–5 user controlled beta.
This is deliberately not an SRE practice, and §269 explicitly forbids building one.

---

## What exists, stated precisely

§268 built the **emission** layer and was explicit that emission is not monitoring. §269 found that
the **collector** already existed and had simply never been verified: Render ingests this service's
stdout and stderr, retains it, and indexes it by level, type, HTTP path and status code.

That was verified live, not assumed. §269 induced a request against production at a unique path and
retrieved that exact record from the Render log store seconds later, with structured labels
attached:

```
induced:   GET https://safescope-backend.onrender.com/section269-ingestion-probe-1789311424  -> 404
retrieved: render logs -r srv-d7kl74jeo5us73deaor0 --path /section269-ingestion-probe-1789311424
           -> 1 match, labels {method: GET, statusCode: 404, level: warning, type: request,
                               host: safescope-backend.onrender.com}
```

So the pipeline is real: **production event → collected → retained → queryable by an operator.**

## The one honest gap

The §268 structured event vocabulary (`safety-insite.operational-event.v1`, 17 events) has **never
appeared in production**, because the code that emits it is not deployed. The running production
build predates §268.

Absence of these events before the release is therefore **expected and meaningless**, not a healthy
signal. The `ops:events` command says so explicitly rather than printing a reassuring zero. First
observation of a real operational event in production is a **release-sequence verification step**,
not an architecture gap.

What §269 *did* verify is that the emitter's real output is exactly what the reviewer parses:
8 of 8 representative events — covering Expert execution failure, provider transport failure,
spend-limit refusal, storage failure, report-generation failure, schema-readiness failure and
migration failure — were emitted by the compiled §268 emitter and parsed back by the §269 reviewer.
Redaction held: a planted provider key, a planted observation text and a planted `Authorization`
header were all reduced to `[redacted]` in the emitted line.

Events are severity-routed: `info` to stdout, `warning` and `error` to stderr. That is what lets
Render label them, and what makes `--level error` a usable filter.

---

## Signal → where observed → who responds

| signal | where it is observed | who responds | how |
|---|---|---|---|
| Backend crash, failed deploy, service unhealthy | Render service notification (`notifyOnFail` is enabled on the service record) — email to the account owner | product owner | check the Render dashboard; `render logs` for cause; redeploy the last-good SHA per `ROLLBACK_MODEL.md` |
| HTTP 5xx returned to a user | `npm run ops:events` — flagged in the response mix | product owner | reproduce, read the app error lines in the same output |
| Expert analysis failing repeatedly | `npm run ops:events` — `expert.execution.failed`, `expert.provider.transport_failure` | product owner | if sustained, set `EXPERT_EXECUTION_ENABLED=false` on the Render service. Deterministic HazLenz is unaffected |
| Spend ceiling reached | `npm run ops:events` — `expert.control.spend_limit_refused` | product owner | decide whether to raise `EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE`; this is a refusal working correctly, not a fault |
| Storage failure | `npm run ops:events` — `storage.operation_failed`, `report.generation_failed` | product owner | check the R2 bucket and credentials |
| Schema or migration failure during release | the release command's own non-zero exit, plus `schema.readiness_failed` / `migration.failed` | whoever is running the release | **stop the release.** Do not activate the new version. See `BETA_DEPLOYMENT_RUNBOOK.md` |
| A participant reports something wrong | direct contact | product owner | `npm run ops:events --since=24h`, then the audit trail |

## The review command

```bash
cd backend
npm run ops:events                        # last 24h
npm run ops:events -- --since=3h          # narrower window
npm run ops:events -- --since=7d --limit=2000
```

Read-only. It issues log queries and cannot deploy, restart, migrate or change configuration. It
shells out to the authenticated Render CLI so that **no Render credential is ever stored in or read
by this repository**. If the CLI session has expired it says so and exits 2.

It reports: §268 structured events grouped by severity and event name; the most recent error-severity
events; the HTTP response mix with 5xx flagged; and application error lines.

## Cadence for the beta

* **Daily**, while the beta is running: `npm run ops:events`.
* **After any participant reports a problem**: same, narrowed to the window.
* **Immediately after the release**, and again an hour later: this is the window in which a
  configuration surprise shows up.

Pull review is proportionate for five named users who can and will contact the product owner
directly. It stops being proportionate the moment the cohort grows or the users are not personally
known — at that point a push-based error reporter becomes necessary.

## Known limits of this arrangement

Recorded so they are not mistaken for coverage:

* **It is pull, not push.** Nothing pages anyone. The only push signal is Render's service-failure
  notification. A high error rate at 02:00 is discovered at the next review.
* **Log retention is Render's, not ours**, and is not configured or controlled by us. Anything older
  than Render's window is gone.
* **There is no health check configured on the service.** `healthCheckPath` is empty on the Render
  service record, so Render does not probe `/health/ready` and will not restart or refuse a deploy on
  an unready instance. §269 did not change this because altering it risks triggering a deploy, which
  §269 forbids. **Setting `healthCheckPath` to `/health/ready` is a step in the release sequence**,
  where a deploy is authorised anyway.
* **The service sleeps.** On the free plan the instance spins down when idle; §269 measured a
  39.8-second cold start that returned 503 before the service woke. Expect 5xx and slow first
  requests that are not defects.
* **No alert on error *rate*.** Only on the service being down.
