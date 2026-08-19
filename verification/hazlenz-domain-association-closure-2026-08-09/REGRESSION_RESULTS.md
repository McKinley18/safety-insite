# Regression results

- Mechanism adjudication: PASS (0 true cross-family mechanism defects)
- Prior 40-case corpus: 40/40 valid; corrective-action leakage 0; preserved corpus SHA-256 `7c3de54ed71ba56bc104cc30580638c8405ff898d8263948c64c9bf9f69f79c2`.
- Opaque holdout: prior 12/12 HTTP 201; input SHA-256 `4cbacb0f1bb43e455f4dc3d026063266beeb0729fa9301743575a76a92df2208`; no production change occurred after its execution.
- Backend build: PASS.
- Frontend TypeScript: PASS.
- Domain-association regression: PASS.
- Narrative regression: PASS.
- `git diff --check`: PASS.
- Frozen corpus: NOT RERUN in this closure turn.
- Precision holdout: NOT RERUN in this closure turn.
- Safe-state suite: NOT RERUN in this closure turn.
- Clarification suite: NOT RERUN in this closure turn.
- Life-critical suite: NOT RERUN in this closure turn.
- Metamorphic suite: NOT RERUN in this closure turn.
- Chromium multi-hazard spot checks: NOT RUN.
