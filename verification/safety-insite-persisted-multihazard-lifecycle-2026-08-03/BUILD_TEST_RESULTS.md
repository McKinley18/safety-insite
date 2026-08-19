# Build and test results

* Backend `npm run build`: PASS.
* `API_BASE_URL=http://127.0.0.1:4231 npm run test:persisted-decomposition-findings`: PASS; stale 409, add/remove reconciliation, duplicate replay.
* `DATABASE_URL=...phase9_persisted_multihazard API_BASE_URL=http://127.0.0.1:4231 npm run test:canonical-workflow`: PASS; 25 scenarios, 2 multi-hazard findings, 4 cross-user denials, mass assignment rejected.
* Frontend `npx tsc --noEmit`: PASS after moving stale generated `.next` output aside.
* Targeted ESLint (`app/inspection-workspace/page.tsx`, `lib/canonicalWorkflowApi.ts`): PASS.
* Frontend `npm run build` with local API env and normal worker environment: PASS.
* Full frontend lint remains known FAIL baseline: 502 errors, 115 warnings.
* Browser guarding/reload, report/download/duplicate/foreign-denial scripts: PASS for exercised assertions.
* `git diff --check`: PASS.
