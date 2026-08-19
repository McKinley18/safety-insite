# HazLenz Pipeline Timings — Performance Corpus Results

## Corpus (12 required categories) and measured warm latency (ms, 3 reps each)

| Category | Rep 1 | Rep 2 | Rep 3 | Response size (bytes) |
|---|---|---|---|---|
| short_single_hazard | 69.3 | 38.6 | 37.8 | 76,588 |
| long_single_hazard | 161.5 | 203.9 | 147.5 | 68,762 |
| two_hazards | 55.5 | 52.8 | 54.0 | 86,246 |
| three_plus_hazards | 77.7 | 76.0 | 75.0 | 85,285 |
| vague_observation | 31.7 | 30.8 | 30.7 | 55,316 |
| safe_control_observation | 45.6 | 45.3 | 47.3 | 64,992 |
| failed_control_observation | 52.2 | 51.9 | 52.0 | 66,816 |
| negated_observation | 87.4 | 86.1 | 85.4 | 64,389 |
| historical_observation | 57.9 | 56.7 | 55.8 | 76,808 |
| planned_future_observation | 50.6 | 50.7 | 50.0 | 64,714 |
| clarification_heavy_observation | *rate-limited (429)* | — | — | — |
| standards_heavy_observation | *rate-limited (429)* | — | — | — |

10/12 categories completed cleanly (30 data points); 2 categories were hit by the application's own 100-req/60s rate limiter partway through the run and were not re-measured within the audit's time budget — reported as a real constraint encountered, not silently dropped.

## Stage-level breakdown — not independently instrumented
Per Phase 27/the "no production code modification" constraint, this audit did not add stage-level timing instrumentation to the protected or unprotected pipeline code (that would require editing `safescope-v2.service.ts`, `intelligence-orchestrator.service.ts`, etc.). The only stage-level signal available came from existing, already-present log lines the application already emits (`[HazLenz classify] intelligence orchestrator start/complete`), which bracket the ~50-engine `SafeScopeIntelligenceOrchestrator.evaluate()` call but do not break down time *within* it. Observed orchestrator-bracket timestamps were consistent with the end-to-end curl timings above (no large discrepancy suggesting significant time spent outside the orchestrator, e.g. in controller-level normalization or serialization) — but this is a qualitative read of log timestamps, not a precise sub-stage profile.

**Recommendation for a future pass**: add temporary, additive-only timing wraps (not touching protected V4 logic) around the ~10 named service calls identified in `SERVICE_EXECUTION_AUDIT.md` to get a real per-stage breakdown; this audit could not do so without violating the explicit "do not modify production code" constraint for this pass.

## Dominant-stage hypothesis (from code trace, not measured)
The `SafeScopeIntelligenceOrchestrator.evaluate()` call chains through roughly 50 sequential "brain"/engine services (decomposition, evidence sufficiency, evidence-question generation, risk reasoning ×2 implementations, corrective-action generation ×3 implementations, narrative generation, knowledge retrieval, absorption/composer/learning-queue services). Given all of it is regex/rule-based with no I/O beyond in-memory calls, and total request time is well under 200ms even for the longest corpus item, no single stage is likely to dominate dramatically — the cost is spread thin across many small, cheap calls rather than concentrated in one expensive stage. This matches the "duplicated work" findings in `RAW_TEXT_REGEX_WORK_AUDIT.md` and `SERVICE_EXECUTION_AUDIT.md` better than it matches a "one slow stage" story.
