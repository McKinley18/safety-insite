# Performance Budget Proposal

Based on measured local behavior only (`HAZLENZ_PERFORMANCE_BASELINE.md`, `HAZLENZ_PIPELINE_TIMINGS.md`, `API_PAYLOAD_AUDIT.md`). These are proposed **warning/failure thresholds for future regression testing**, not aggressive targets invented independently of the measured baseline.

| Metric | Measured (local, warm) | Proposed WARNING threshold | Proposed FAILURE threshold | Basis |
|---|---|---|---|---|
| HazLenz classify warm p50 | 51.9 ms | 150 ms | 400 ms | ~3x and ~8x measured warm p50, generous headroom for production network/DB overhead not present on localhost |
| HazLenz classify warm p95 | 147.5 ms | 350 ms | 800 ms | ~2.4x and ~5.4x measured warm p95 |
| Single-hazard response | 38-69 ms (short text) | 200 ms | 500 ms | — |
| Multi-hazard (3+) response | 75-78 ms | 200 ms | 500 ms | Measured multi-hazard cost was *not* dramatically higher than single-hazard in this sample; budget kept aligned rather than inflated |
| Longest single request observed | 203.9 ms (`long_single_hazard`, rep 2) | 400 ms | 1000 ms | ~2x and ~5x the single worst observed sample |
| API payload size (classify response) | 55-86 KB, avg ~59 KB | 40 KB | 100 KB | The measured baseline itself already exceeds a sane target; WARNING is set *below* current baseline deliberately, to force attention on the confirmed dead-work payload bloat (`API_PAYLOAD_AUDIT.md`) rather than normalize it |
| Single-finding "save" payload | Exceeded 100 KB (exact size not captured — failed before completing) | 80 KB | 100 KB (Express's current hard default) | Current behavior already fails this budget — this is presented as a target to fix toward, not a passing baseline |
| Report generation time | Not measured — export path blocked | 3 s | 8 s | No measured baseline exists; proposed as a reasonable placeholder pending a working export path, explicitly flagged as unsupported by data |
| Frontend navigation (perceived) | Subjectively immediate, not numerically measured | 1 s (perceived) | 3 s | Placeholder pending a real Lighthouse/perf-trace pass |

## Rate limiting (not a latency budget, but directly relevant to production regression testing)
The application enforces `100 requests / 60s` per client (confirmed live — this audit's own burst performance testing tripped it). Any future automated performance-regression suite should pace its own requests below this threshold (or use a distinct test account/allowlist) to avoid conflating "the app got slow" with "the app started rate-limiting the test harness," which is exactly what happened partway through this audit's own corpus run.

## What this proposal deliberately does NOT do
It does not propose new numbers for dimensions with no measured baseline at all (DB query counts, CPU%, concurrent-load behavior) — those are marked "no measured baseline" above rather than invented, per the instruction not to make statistically unsupported claims.
