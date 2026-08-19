# Test commands and results

Repository baseline: `git rev-parse HEAD` = `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`; initial status entries = 219; final status entries recorded after artifact creation. `git diff --check` PASS.

## Fresh authenticated audit

- Disposable PostgreSQL: `safescope-db-response-audit`, database `phase_hlz_response_audit`, host port `55441`.
- Disposable NestJS backend: port `4236`, explicit test environment, local private storage root `/tmp/safety-insite-response-audit`.
- Account: disposable entitled evaluator; no original database access.
- `node verification/hazlenz-response-intelligence-audit-2026-08-08/run_response_quality_audit.js` at `PACE_MS=2500`: 60/60 HTTP 201, 0 transport failures.
- Initial fast run: 30/60 HTTP 201 and 30 intentional 429 throttle responses; retained as rate-limit evidence, not scored as model failures.
- Post-fix focused run: 12/12 HTTP 201, 0 transport failures.
- Complete post-fix run after restart: 60/60 HTTP 201, 0 transport failures, average utility 0.694, 0 weak responses under the audit heuristic. Raw output: `RESPONSE_QUALITY_POSTFIX_FULL_RAW.json`; summary: `RESPONSE_UTILITY_POSTFIX_FULL.json`.

## Backend

- `npx ts-node src/safescope-v2/tests/narrative-quality-regression.ts`: PASS.
- `npm run test:guided-finding-response`: PASS, 27 assertions.
- `npm run test:hazlenz-evidence-boundary`: PASS, 13 assertions.
- `npx ts-node src/safescope-v2/tests/hazlenz-production-path-regression.ts`: PASS, 15/15.
- `npx ts-node src/safescope-v2/tests/hazlenz-temporal-reconciliation-regression.ts`: PASS, 3/3.
- `npm run build`: PASS.
- `npm run test:hazlenz-core`: existing offline suites passed; two suites requiring the original local port 5432 failed with `EPERM` because no original database was used. This was an environment limitation, not a production regression.

## Frontend

- `npx tsc --noEmit`: PASS.
- `npm run build` in sandbox: blocked by Turbopack worker port permission; rerun with approved local worker execution: PASS (Next.js production build and TypeScript).
- Frontend lint was not run globally; no frontend production file changed in this iteration.

## Closed-gate evidence retained

Prior valid frozen/adjudicated HazLenz, authorization, report-versioning, report-concurrency, persistence, and finding-review artifacts remain applicable because those production components were not modified.
