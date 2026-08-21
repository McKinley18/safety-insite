# KG-4C sections 7 and 8 — added workload, rate-limit safety, and the telemetry sink decision

## 1. Does SHADOW add any externally rate-limited call?

**No. Measured by source trace, not assumed.**

A scan of `src/standards/cutover/` and `src/standards/releases/governed-corpus-lookup.ts` for
`fetch(`, `axios`, `http.`, `https.`, `node-fetch`, `got(`, `request(`, `openai`, `anthropic`, and
for any auth/login/register path returned **zero** call sites. (The only textual matches are the word
"registered" in comments about source provenance.)

The complete set of operations SHADOW adds:

| Operation | Where | Kind | Count per analysis |
|---|---|---|---|
| pin the active release | `governed-resolution.ts:150` | internal DB query | 1 |
| resolve one citation | `governed-resolution.ts:283` | internal DB query | 1 per **distinct** citation |
| classify + build event | `shadow-comparison.ts` | pure CPU | 1 per comparison |
| serialize + write event | `shadow-telemetry-sink.ts` | stdout write | 1 per comparison |

There are exactly **two** `dataSource.query` call sites in the whole cutover subsystem. Both are
internal Postgres queries against the release tables. Nothing else.

### Against the requirement

| Requirement | Result |
|---|---|
| no duplicate login/register/auth traffic | **met** — SHADOW makes no auth call of any kind |
| no duplicate customer-visible request | **met** — SHADOW runs inside the existing analysis; it does not re-issue anything |
| no avoidable duplicate AI/provider request | **met** — no provider client is reachable from the cutover subsystem |
| existing authentication throttles unchanged | **met** — no throttle configuration was touched |

Current throttle configuration, unchanged by KG-4C: global `100 / 60s`;
`POST /safescope-v2/classify` `30 / 60s`; auth register/login `5 / 60s`.

**The throttles were not weakened.** KG-4B's first corpus run was invalidated by exactly this
temptation — 32 of 42 comparisons were two identical HTTP 429s satisfying an equality oracle — and
the fix there was to pace inside the limit and refuse a 429 outright, not to raise it. The same
rule holds here.

### Measured internal cost (KG-4B baselines, unchanged by KG-4C)

| Shape | Mean |
|---|---|
| LEGACY, 10 findings (context never created) | 0.0003 ms |
| SHADOW, 10 findings / 6 distinct citations | **1.187 ms** |
| telemetry build + guard + serialize | **0.0193 ms/event** |

Query counts track **distinct citations**, not findings: 1→2, 5→6, 10 findings over 6 distinct
citations→7 (one pin plus six resolutions). **No N+1.** The circuit breaker's latency ceiling is
12 ms — roughly ten times the measured mean — so ordinary variance cannot trip it while a regression
that reintroduces per-finding queries will.

---

## 2. The telemetry sink decision

**Chosen: structured application logs (single-line JSON on stdout), with in-process counters for
real-time metrics. No production database schema.**

Existing infrastructure was evaluated first, as required.

| Option | Verdict |
|---|---|
| **Structured application logs** — already the KG-4B mechanism; `emitCutoverEvent()` and the shadow record writer both use it | **CHOSEN.** Structured, versioned by `schemaVersion`, privacy-guarded by an allowlist, queryable by any log pipeline without a migration, and a write failure cannot reach the customer because the emit path never throws. |
| **A dedicated `shadow_comparison_events` table** | **REJECTED for now.** It puts a write inside the customer transaction path, adding a failure mode to a request that is otherwise unaffected by shadow — the exact property KG-4B spent six failure injections establishing. It needs its own retention job, its own indexes, and a migration that must run in production before the code that writes it. KG-4B deliberately created no production schema for a verification artifact, and nothing measured since changes the argument: at 2.18 events per analysis, aggregation over structured logs answers every question the mismatch taxonomy poses. |
| **The existing HazLenz knowledge telemetry helper** (`safescope-v2/telemetry/hazlenz-knowledge-telemetry.ts`) | **REJECTED as the sink of record.** It logs `Record<string, any>` through `console.info` with a human-readable label. An untyped metadata bag is precisely the shape that admits customer content by accident, and this event's contract is an allowlist. It remains appropriate for what it already does. |

### When a table *would* become justified

Not "when it would be convenient". A schema becomes justified when a required query cannot be served
by aggregation over the event stream — for example joining shadow events to reviewer decisions
**transactionally**, so a corpus remediation could be tied to the exact comparison that motivated it.
That is not needed to run a shadow, and it is not needed to decide whether to widen one.

### Retention

| Class | Target | Enforced by | Application controls? |
|---|---|---|---|
| raw events | 30 days | platform log pipeline | **no** |
| aggregate metrics | 13 months | metrics backend | **no** |
| blocking-mismatch evidence | retained with the KG slice that adjudicates it | repository verification artifacts | **yes** |

**Enforcement is an operational dependency, stated rather than pretended away.** Once an event is on
stdout it belongs to the log pipeline and no code in this repository can delete it. What the
application *does* control is that the events contain nothing whose over-retention would be harmful:
no customer prose, no personal data, no identifier beyond a server-generated per-analysis correlation
id. That is why the durations above can be approximate — the privacy guarantee does not depend on
them.

Blocking evidence is the one class that deliberately outlives the log window, and it survives as a
categorical record copied into a slice artifact directory, never as raw telemetry.
