# KG-4C — final status

**KG-4C is COMPLETE.**

> ## `KG_4C_COMPLETE — READY_FOR_EXPLICIT_PRODUCTION_SHADOW_AUTHORIZATION`

This means only that the mechanism, the guard rails and the operator procedure exist and are
verified. It does **not** enable production SHADOW, authorize a deployment, or approve a cohort.
Nothing was committed, pushed or deployed; production was not touched; no production configuration
or database was modified; `GOVERNED_CUTOVER_MODE` remains unset in every production environment, and
`GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` has never been set anywhere.

| Section | State |
|---|---|
| 0 — preservation + reverification of the blueprint's MUST_REVERIFY items | **done** |
| 1 — production shadow enablement model (4 locks) | **done** — 71 checks |
| 2 — first-cohort staging model | **done** — 25 checks, 5 stages |
| 3 — kill switch | **done** — 36 checks; operational limitation documented honestly |
| 4 — request-level fail-open | **done** — 6 failure modes, in-process |
| 5 — global circuit breaker | **done** — 7 hard invariants, 4 evidence-derived rate thresholds |
| 6 — sampling / eligibility | **done** — deterministic, no PII, stage-capped |
| 7 — rate-limit / workload safety | **done** — measured: zero added externally-throttled calls |
| 8 — telemetry sink decision | **done** — structured logs; **no production DB schema** |
| 9 — event schema versioning | **done** — `kg4c.shadow-comparison.v2`, 35 fields |
| 10 — privacy enforcement | **done** — 16 canary injections, 12 patterns, builder + guard |
| 11 — customer-output invariance hash | **done** — empirical volatility preserved |
| 12 — SHADOW provenance invariant | **done** — structural, coerces and reports |
| 13 — tenancy / principal isolation | **done** |
| 14 — retention contract | **done** — operational dependency stated, not pretended away |
| 15 — real-time metrics | **done** — 17 metrics, forbidden dimensions asserted |
| 16 — alert / stop thresholds | **done** — 16 rules, every one justified |
| 17 — blocking-mismatch response | **done** — runbook |
| 18 — unobserved taxonomy categories | **done** — **eleven**, not seven; see below |
| 19 — mutating-suite DB ownership guard | **done** — and it caused a real incident first |
| 20 — deployment-disabled no-op | **done** — 9 disabled configurations |
| 21 — production shadow runbook | **done** |
| 22 — first production cohort | **done** — one internal account |
| 23 — sample sufficiency | **done** — coverage criteria, no fabricated confidence |
| 24 — full regression | **done** — no new unexplained regression |
| 25 — blueprint maintenance | **done** |
| 26 — preservation | **done** |

## Registered commands

```
npm run test:kg4c-production-shadow-contract   # 438/438  pure
npm run test:kg4c-disabled-deployment          #  80/80   pure
npm run test:kg4c-db-ownership                 #  31/31   OWNS 3 disposable databases
```

`backend/package.json`: **+3 entries**, all prior entries preserved.

## The incident

**The ownership guard caused the exact damage it was built to prevent**, and its own suite passed
26/26 while the mechanism was backwards. It claimed `test_kg4b_shadow_20260820` — KG-4B's evidence
corpus — and `test:regulatory-release-lifecycle` then deleted every release row.

Root cause: an absent ownership marker was treated as permission to claim, and *every* pre-existing
evidence database is unmarked. The test asserted that behaviour was correct, which is the same
failure class KG-3F found in `test-evidence-foundation.ts`.

Fully restored and proven: manifest `14a34fea…` reproduced byte-identically, 35/35 surviving approval
decisions re-bound by checksum with **no new decision appended**, `test:kg4b-shadow-adversarial`
84/84, `test:kg4b-shadow-determinism` 18/18 with digest `0bce5a71…`.

Full record: `INCIDENT-ownership-guard-caused-the-damage-it-prevents.md`.

## Seven vs eleven

KG-4B's `STATUS.md` prose names **seven** never-observed mismatch categories. Its
`CORPUS_AND_ANALYTICS.md`, its `analytics/shadow-analytics.json`, and the 83-event corpus itself all
give **eleven** — the corpus exercised exactly four of fifteen categories.

`KG4C-DISC-01`: eleven is the measured figure; seven is a prose subset that omits
`GOVERNED_APPROVED_EXACT`, `GOVERNED_UNAPPROVED`, `GOVERNED_CITATION_ONLY` and `RESOLVER_FAILURE`.
KG-4C maps all **eleven**. Covering the measured superset costs nothing and avoids inheriting a
narrative number over a measured one. The KG-4B artifacts are left exactly as written.

## Regression — measured, not assumed

| Gate | Result |
|---|---|
| `test:kg3f-retrieval-determinism` | **170/170** |
| `test:kg3f-ranking-adversarial` | **54/54** |
| `test:kg3f-56-14132-predicate` | **16/16** |
| `test:kg3e-citation-granularity` | **48/48** |
| `test:approval-contract` | **57/57** |
| `test:kg3f-shadow-invariance` | **7/7**, digest `29469550cea4d2fd…` |
| `test:kg4a-cutover-contract` | **146/146** |
| `test:kg4a-governed-resolution` | **99/99** |
| `test:kg4a-provenance-pinning` | **53/53** |
| `test:kg4a-default-off` | **51/51** |
| `test:kg4b-shadow-contract` | **123/123** |
| `test:kg4b-shadow-adversarial` | **84/84** |
| `test:kg4b-shadow-determinism` | **18/18** |
| `test:kg4b-privacy-review` | **26/26** |
| `test:governed-corpus-matrix` | **60/60** |
| `test:release-integrity-and-approval` | **44/44** |
| `test:regulatory-release-lifecycle` | **42/42** on its owned database |
| `test:hazlenz-core` | **28 of 30 suites** — only the two documented baseline failures |
| backend `npm run build` | exit 0 |
| `frontend-next` `npx tsc --noEmit` | exit 0 |
| clean seed | 35 records, manifest `14a34fea…` |

### Not run, and why

* **Browser suites (KG-4A 240, KG-4B 576).** Not re-run. They require a live backend, an isolated
  frontend and real Chromium with two authenticated accounts. KG-4C added **no code to the customer
  request path**: the six new modules have no production importer outside the cutover subsystem, and
  the one existing file changed (`governed-provenance.ts`) has no production consumer — it is called
  only by verification suites. No display, payload, persistence or report code was touched. This is
  a reasoned assessment of unchanged risk, **not** a claim of coverage.
* **`test:kg4b-default-off` (48/48).** Requires a live server running SHADOW. `test:kg4a-default-off`
  (51/51, static) was run and passed; the disabled-deployment suite adds 80 in-process checks over
  nine disabled configurations.
* **`test:entitlement-boundary`.** The documented pre-existing 429/hang. Not run; the auth throttle
  was **not** weakened.

## Production files changed

| File | Change |
|---|---|
| `standards/cutover/production-shadow-authorization.ts` *(new)* | 4-lock gate, 5-stage model, kill switch, deterministic cohort |
| `standards/cutover/shadow-circuit-breaker.ts` *(new)* | 7 hard invariants, 4 evidence-derived rate thresholds, bounded window |
| `standards/cutover/customer-output-invariance.ts` *(new)* | canonical privacy-safe payload hash, empirical volatility derivation |
| `standards/cutover/shadow-telemetry-sink.ts` *(new)* | v2 schema, field-by-field builder, canary guard, fail-open sink, retention contract |
| `standards/cutover/shadow-provenance-invariant.ts` *(new)* | SHADOW provenance coercion + compliance predicate |
| `standards/cutover/shadow-operational-metrics.ts` *(new)* | 17 metrics, allowed/forbidden dimensions, 16 alert rules |
| `standards/cutover/governed-provenance.ts` | last-gate enforcement + `shadowProvenanceViolation` |
| `scripts/lib/test-database-ownership.ts` *(new)* | reusable ownership guard |
| `scripts/test-regulatory-release-lifecycle.ts` | claims its database before its first mutation |

**None of the new modules is reachable from a customer request.** Verified by import scan.

## Three defects this slice found in its own work

1. **The ownership guard was inverted** and its suite ratified it. Caused real damage; restored and
   proven. See the incident record.
2. **Three privacy canary patterns missed escaped JSON.** A value embedded in a string field
   serializes with escaped quotes (`\"password\":`), which the first patterns did not match. Fixed
   with a two-pass guard: raw field values first (escaping-immune, and it reports the real field
   name), then the serialized form (catches nested and non-string leakage).
3. **A test asserted a wrong length constant** for a rejected acknowledgement. Trivial, but it was
   an assertion written from a guess rather than from the input.

## Recommended KG-4D scope

1. **An operator-triggered instant kill switch**, if one is wanted. The current fastest operator path
   is a configuration change with its platform's restart characteristics; only the circuit breaker's
   in-process latch is genuinely immediate. Closing that gap is a control-plane feature.
2. **Wire the KG-4C modules into the request path.** They are currently designed and verified but
   deliberately unreferenced by production code. Integration is its own slice with its own
   invariance verification.
3. **Re-run the browser contract** once integration lands.
4. **Give the remaining mutating suites owned databases.** The guard is reusable; only
   `test:regulatory-release-lifecycle` is wired so far.
5. **Close `GOVERNED_MISSING`** — the 137 declared-but-unemitted citations remain the population
   behind 18% of the KG-4B corpus.
