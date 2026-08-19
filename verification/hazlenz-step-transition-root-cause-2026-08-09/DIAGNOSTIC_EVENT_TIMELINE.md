# Diagnostic evidence

The instrumented same-origin run recorded initial effects and render at Step 1, selected inspection context loading, `header.handleNext` with guard `true` and target `2`, `goToInspectionStep.request(2)`, `goToInspectionStep.commit(targetStep=2)`, and the subsequent Step 2 render. The cross-origin baseline recorded only a native click and no React events. The raw events are retained in `BASELINE_TRACE.json`; the post-fix 20-run evidence is in `CHROMIUM_20_RESULTS.json`.
