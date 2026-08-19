# HazLenz Performance Baseline

## Method
Direct, authenticated HTTP calls to `POST /safescope-v2/classify` against the real running local backend (disposable DB), using the required 12-item performance corpus (see `HAZLENZ_PIPELINE_TIMINGS.md` for the corpus text and per-item results), 3 repetitions per item, measured with `curl -w "%{time_total}"` (wall-clock, includes network round trip on localhost — effectively pure server processing time).

## Headline numbers (measured, not estimated)
- 10 of 12 corpus items completed cleanly (30 data points). The remaining 2 items were blocked by the application's own rate limiter (`429 ThrottlerException`, 100 requests / 60s window) partway through corpus execution — this is reported as a genuine finding about production-relevant behavior, not papered over (see `PERFORMANCE_BUDGET_PROPOSAL.md`).
- **"Cold-ish" (first request per corpus item)**: p50 = 55.5 ms, p95 = 161.5 ms, max = 161.5 ms.
- **Warm (2nd–3rd repetition per item)**: p50 = 51.9 ms, p95 = 147.5 ms, max = 203.9 ms, n = 24.
- No LLM/external AI API calls exist anywhere in this pipeline (confirmed by source trace — see `SERVICE_EXECUTION_AUDIT.md`); all "intelligence" is deterministic regex/rule-based logic running in-process. This is consistent with the measured sub-200ms latencies.
- Per-item timing did not scale dramatically with hazard count: `three_plus_hazards` (~76ms) was cheaper than `long_single_hazard` (~150-200ms) — text **length** correlated with latency more visibly than hazard **count** in this small sample.
- Backend process memory was flat across the whole session (~850MB RSS / ~643MB heap after the full audit session vs. ~868-877MB RSS / ~684-691MB heap at cold startup) — no evidence of a memory leak from repeated classify calls in this sample size.

## Statistical honesty note
n=30 clean requests across 10 distinct scenario types is enough to report a defensible warm p50/p95, but is **not** enough to make strong claims about tail behavior (p99), true cold-start behavior (the very first request after backend boot was not isolated from JIT/connection-pool warmup in this measurement), or behavior under concurrent load (all requests in this corpus were sequential, not concurrent).

## What this rules in / out
- **Ruled out as a concern at current scale**: the deterministic classify pipeline itself is fast (sub-200ms) and is very unlikely to be the dominant source of any end-to-end slowness a user would notice.
- **Not measured / candidate concern**: response **payload size** (up to 86KB for a single short-text classify call — see `API_PAYLOAD_AUDIT.md`) adds real serialization + network-transfer + client-side-parse cost that is not captured by server-side wall-clock timing alone, and would matter more on a real network than on localhost.
