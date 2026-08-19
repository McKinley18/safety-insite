# Defect report

## Canonical split-hazard persistence gap

- Symptom: real Chromium renders two or more decomposition cards, but the canonical persisted workspace creates a single `inspection_findings` row (or none for browser-created split observations), so later risk/actions/tasks/reports cannot be proven per hazard.
- Severity: High.
- Root cause: decomposition output is available to the review UI, but the canonical finding/finalization path is still single-finding oriented and does not materialize each decomposition hazard as a durable finding relationship.
- Fix in this phase: none; this requires a bounded schema/application design change and must not be papered over by database insertion.
- Evidence: `CRITICAL_LIFECYCLE_RESULTS.md`, `DATABASE_FINAL_INVARIANTS.md`; counts show 3 browser-created observations but only 2 canonical findings and zero canonical inspection reports.
- Required regression: real Chromium three-scenario persisted lifecycle, database relationship assertions, multi-hazard PDF snapshot test, and tenant authorization matrix.

## Stale-analysis UI recovery

- Symptom: canonical workspace had no visible recovery for stale analysis response.
- Severity: High.
- Fix: `frontend-next/app/inspection-workspace/page.tsx` catches stale/conflict messages, preserves entered clarification, renders an accessible alert, and offers refresh.
- Verification: targeted ESLint PASS; browser-context stale request returned HTTP 409 and no overwrite. Full visual stale replay remains dependent on the canonical history UI.
