# Integration results

Against the clean phase database:

- 30 migrations applied.
- `npm run test:canonical-workflow`: PASS; 25 scenarios, 3 analyses, exactly 1 current analysis, 2 findings, 1 task, 1 action, 4 cross-user denials, mass-assignment rejection.
- Prior phase authorization regression remains valid; this phase's two-context analysis test returned 409/replay behavior.
- Backend build: PASS.
- Frontend typecheck/build after stale-state UI fix: PASS.
