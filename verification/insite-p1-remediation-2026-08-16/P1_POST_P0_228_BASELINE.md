# P1 Phase 0 — Required Post-P0 Full 228-Case V4 Matrix

Purpose: the task brief requires reproducing 228/228 on the current post-P0 candidate before any P1 production code is touched, because P0-03 modified `backend/src/safescope-v2/safescope-v2.service.ts` (part of the protected V4 recognition-core file set) and the P0 phase's own report honestly disclosed it had only done structural-isolation argument + 5 live smoke scenarios, not a full 228-case re-run.

## Method

Live backend (`node dist/main.js`, port 4000) against disposable database `test_p1_20260816`, migrated + seeded (19 standards, 8 knowledge docs), with a registered test user granted a 6-hour `expert`-tier entitlement via the repo's disposable-DB-gated `grant-test-entitlement.ts` script. `DEV_AUTH_BYPASS=false` for this run (real login) — see `P1_AUTH_ROOT_CAUSE.md` for why bypass mode cannot be used for any authenticated live verification in this repo's current state.

All 228 rows come from the frozen `FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json`, scored by the unmodified, frozen `score_family_matrix_v4_authoritative.mjs`.

## Attempt 1 — 4-concurrent-worker runner (`run_milestone_v4_20260815.mjs`, as used by the P0 phase)

Result: **208/228** (positive 68/76, negative 67/76, ambiguity 37/38, safe 36/38). 20 failing rows, **all** `FAIL_TRANSPORT` (0 semantic mismatches — `transportFails: 20` exactly matches the fail count).

Per the operating rules ("do not change production because a test fails until determining whether the failure represents a genuine production defect, a taxonomy/adjudication issue, a verification-infrastructure problem, or an invalid/stale expectation"), this was investigated before treating it as a regression:

1. All 20 failing case IDs (FM-031/032/033/034, FM-061/062/063/064, FM-069, FM-072/073/074, FM-105/106, FM-131/132, FM-163/164, FM-195/196), retried individually via a single sequential client immediately afterward, **all returned HTTP 201 in 43–70ms** — the endpoint itself is healthy and fast for every one of these fixtures.
2. A second sequential retry of the same 20 cases (run shortly after the first, cumulative request volume higher) reproduced `FAIL_TRANSPORT` on 10 of them — confirming the failures track **cumulative recent request volume from one client IP**, not the fixture content.
3. Root cause: `backend/src/safescope-v2/safescope-v2.controller.ts:239` applies `@Throttle({ default: { limit: 30, ttl: 60000 } })` to the classify route — a real, intentional production rate limit protecting the LLM-backed endpoint. `run_milestone_v4_20260815.mjs` fans out **4 concurrent workers** from a single test box (one IP), which sustains a request rate far above 30/60s; its retry/backoff (up to 18 attempts, ≤10s backoff) is not guaranteed to outlast sustained self-inflicted throttling from the other 3 workers still hammering the same bucket.

Classification: **verification-infrastructure problem** (the 4-worker matrix-runner's concurrency exceeds the route's own legitimate rate limit), not a P0-03 semantic regression and not a production defect — the throttle is working as designed.

## Attempt 2 — single-worker paced runner, 228/228

To get an authoritative result without touching the frozen runner or any route/throttle code, a new paced runner was written for this phase only: `verification/insite-p1-remediation-2026-08-16/run_228_paced.mjs` — single sequential worker, ~2.2s between requests (≈27/min, under the 30/60s route limit), 15s backoff-and-retry once on a 429. It reuses the unmodified frozen manifest and scorer without modification.

```
=== RESULTS ===
{
  "positive": { "total": 76, "pass": 76, "fail": 0 },
  "negative": { "total": 76, "pass": 76, "fail": 0 },
  "ambiguity": { "total": 38, "pass": 38, "fail": 0 },
  "safe":      { "total": 38, "pass": 38, "fail": 0 }
}
Failing rows: []
```

**Overall: 228/228 (Positive 76/76, Negative 76/76, Ambiguity 38/38, Safe/control 38/38). NEW_FAIL: 0.**

Full per-case output archived at `verification/insite-p1-remediation-2026-08-16/P1_228_PACED_RESULT.json`.

## Conclusion

The post-P0 candidate reproduces the required 228/228 result. P0-03's change to `safescope-v2.service.ts` (the corrective-action generator, `buildEnhancedGeneratedActions`) does not regress V4 recognition semantics. The 20-row shortfall on the first attempt was conclusively verification-infrastructure (test-harness concurrency vs. the route's own production throttle), not a defect — documented here rather than silently retried away. P1 implementation may proceed.
