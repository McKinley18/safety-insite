# Focused regression results

The browser-level regression is `run_20_browser_audit.cjs`; it exercises persisted inspection creation, selected-inspection context, Step 1 observation entry, Next, Step 2 stability, review activation, real analysis request, and browser rendering. It passed all 20 preserved scenarios. The first controlled scenario is retained in `baseline_trace.cjs`/`BASELINE_TRACE.json`.

The deterministic network-status initial render is covered by production build plus the hydration-error assertion in the same browser audit. Existing finding-review, authorization, report, and finalization safeguards were not modified and remain covered by their prior phase artifacts.
