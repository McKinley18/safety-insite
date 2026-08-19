# Commands Run

Sensitive values are redacted or represented by disposable local-test values.

- Repository: `pwd`, branch/HEAD/status/diff/untracked checks, Node/npm/package inspection.
- Runtime discovery: listeners, Docker PostgreSQL, health probes.
- Database: fresh database creation; `npm run migration:run`; deterministic standards seed.
- Builds: backend `npm run build`; frontend `npm run build`; modified-file ESLint.
- HazLenz: generated 165-case corpus; repeated `node run-authentic-corpus.mjs`; evidence-boundary unit tests.
- Auth/security: auth flow, auth rate limit in isolated restarts, password-reset delivery, upload security, production environment validation.
- Persistence: canonical workflow (19 scenarios), private reports (12), storage provider, entitlement boundary/operations, billing regression (24).
- Browser: `npm run check:closure-workflow` against frontend 3100/backend 4200/disposable PostgreSQL.
- Adoption: logical dump/restore into two new legacy clones; 26 migrations on two new targets; dry-run/apply; two-clone fingerprint verifier.
- S3: isolated TLS MinIO; `npm run test:storage-provider:s3`; direct access 403; invalid credentials/missing bucket/delete.
- Dependencies: backend and frontend `npm audit --omit=dev --json`.
- Integrity: `git diff --check`; SHA-256 of five protected HazLenz files.

Expected failures retained as evidence:

- repository-wide frontend lint: 509 legacy errors;
- first browser attempts: isolated frontend not running, then CORS mismatch, then incorrect test query table names;
- reused Phase 6 adoption databases failed deterministic equality because later tests had polluted them; fresh immutable clones passed;
- first post-remediation HazLenz run retained 14 FAIL.
