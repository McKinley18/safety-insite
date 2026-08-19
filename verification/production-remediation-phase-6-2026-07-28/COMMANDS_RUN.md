# Commands Run

Commands containing credentials are represented with redacted placeholders.

- `pwd`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git status --short`
- `git diff --stat`
- `shasum -a 256 <five protected files>`
- `npm run legacy:inventory`
- `pg_dump` / `createdb` / `pg_restore` against disposable databases
- `npm run migration:run`
- `npm run legacy:adopt` in dry-run and `--apply` modes
- `npm run legacy:verify-adoption`
- `docker run` official MinIO with temporary TLS material
- `npm run test:storage-provider:s3`
- `npm run test:auth-flow`
- `npm run test:auth-rate-limit`
- `npm run test:storage-provider`
- `npm run test:private-storage-reports`
- `npm run test:canonical-authorization`
- `npm run test:canonical-workflow`
- `npm run test:entitlement-boundary`
- `npm run test:entitlement-operations`
- `npm run test:upload-security`
- `npm run test:password-reset-delivery`
- `npm run billing:regression`
- `npm run smoke:dashboard-scope`
- `npm run build` in backend and frontend
- `npx eslint app/reports/page.tsx lib/canonicalWorkflowApi.ts`
- `npm audit --json`
- `npm audit --omit=dev --json`
- `npm ls` for remediated dependency chains
- Playwright Phase 5 and expanded Phase 6 release scripts
- read-only `psql` conservation and migration-count queries
- `git diff --check`

Initial network/audit and Turbopack attempts were blocked by sandbox DNS/port permissions and rerun with explicit approval. Sequential API tests polluted shared throttler state; isolated reruns passed.

