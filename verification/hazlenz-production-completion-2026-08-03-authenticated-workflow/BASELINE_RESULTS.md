# Baseline results

- Backend TypeScript build: PASS (`npm run build` in `backend`).
- Frontend typecheck: PASS in the prior clean production verification; this package has no `typecheck` npm script.
- Frontend production build: prior clean build PASS. A subsequent sandboxed Turbopack rerun was environmental (`Operation not permitted` while spawning a CSS worker), not a product assertion.
- HazLenz corpus: 129 authenticated cases, 113 PASS, 16 NEEDS REVIEW, 0 FAIL.
- Life-critical repeatability: 81/81 cases, 243/243 accepted runs, stable.
- Full frontend lint baseline: 500 errors, 115 warnings.
- `git diff --check`: PASS.
