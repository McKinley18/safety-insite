# Test and command log

## Repository

- `pwd`, `git branch --show-current`, `git rev-parse HEAD`, `git status --short`, `git diff --stat`, `git diff --name-only`, `git ls-files --others --exclude-standard`: recorded before edits.
- `sha256sum` protected files: unchanged.
- `git diff --check`: pass.

## Database

- Created disposable `phase4_clean`, `phase4_clean_final`, `phase4_clone_a`, `phase4_clone_b`; live database not altered.
- `DATABASE_URL=...phase4_clean_final npm run migration:run`: pass, 24/24.
- Additive audit alignment applied to both disposable clean databases: pass.
- Development/reference `migration:baseline -- --json`: expected fail-closed, 636 differences, no apply.

## Backend

- `npm run build`: pass after final backend changes.
- `npm run test:canonical-workflow`: pass, 19 scenarios, 8 durable resource counts, 4 foreign denials.
- `npm run test:canonical-authorization`: pass, 11 A1/A2/B1 assertions.
- `npm run test:entitlement-boundary`: pass, 4 assertions.
- production invocation of `entitlement:test:grant`: expected refusal, pass.
- `npm run test:auth-flow`: pass.
- `npm run test:password-reset-delivery`: pass.
- `npm run test:upload-security`: pass.
- `npm run billing:regression`: 24 passed, 0 failed.
- `npm run smoke:dashboard-scope`: pass on disposable database.
- `npm run smoke:corrective-actions-scope`: fail to compile; legacy constructor mismatch.
- health/runtime on port 4104: pass.

## Frontend

- `npx eslint app/inspections/page.tsx lib/canonicalWorkflowApi.ts`: pass.
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:4104 npm run build`: pass.
- first sandboxed build: blocked by Turbopack local port permission; identical escalated build passed.
- `npm run check:canonical-persistence`: pass after CORS fix.
- in-app browser bootstrap: blocked by connector error `Cannot redefine property: process`.

## Dependency audits

- backend full/production: 12 total, 3 high, 9 moderate, 0 critical.
- frontend full: 5 total, 4 high, 1 low.
- frontend production: 4 total, 3 high, 1 low.

## Runtime defects found and fixed

- Test backend silently connected to legacy DB because `DATABASE_URL` overrode component values.
- `DEV_AUTH_BYPASS=true` from local environment replaced authenticated UUID with numeric user ID; verification now explicitly disables it.
- CORS ignored documented singular `CORS_ORIGIN`.
- audit log schema missed `tenantId`.
- corrective-action create was not transactional with audit persistence.
- canonical `individual` role mapped to HazLenz viewer.

