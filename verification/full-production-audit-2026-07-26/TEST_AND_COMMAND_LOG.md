# Test and Command Log

Audit date: 2026-07-26  
Repository: `/Users/mckinley/Desktop/Safety_InSite`

Secrets and private environment values are intentionally omitted or redacted.

## Repository provenance

### Initial inspection

```sh
pwd
rg --files -g 'AGENTS.md' -g '!node_modules' -g '!dist' -g '!.next'
git branch --show-current
git rev-parse HEAD
git status --short --branch
git remote -v
git status --ignored --short
git ls-files --others --exclude-standard
```

Result:

- Repository path: `/Users/mckinley/Desktop/Safety_InSite`
- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`
- Upstream: `origin/main`
- Remote: `https://github.com/McKinley18/safety-insite.git`
- Working tree was dirty before this audit began.
- Pre-existing modified source files:
  - `backend/src/safescope-v2/inspection-intelligence/inspection-citation-ranking.service.ts`
  - `backend/src/safescope-v2/inspection-intelligence/inspection-citation-recovery.service.ts`
  - `backend/src/safescope-v2/inspection-intelligence/inspection-condition-assessment.service.ts`
  - `backend/src/safescope-v2/inspection-intelligence/standard-applicability.rules.ts`
  - `backend/src/safescope-v2/safescope-v2.service.ts`
- Pre-existing untracked directory: `verification/hazlenz-authentic-validation-2026-07-22/`
- The pre-existing source diff totals 938 insertions and 27 deletions. It materially changes HazLenz behavior, so runtime findings describe the working-tree application, not pristine HEAD.
- Ignored local state includes root/backend/frontend environment files, installed dependencies, backend build output, frontend `.next`, research material, database backups, and Vercel metadata.
- `frontend-next/AGENTS.md` instructs agents to consult the installed Next.js documentation before writing frontend code. No production code is being written in this audit.

### Safety constraints observed

- No production code modified.
- No commit, push, reset, checkout, deletion, broad reformat, or destructive database operation.
- Audit-created files are isolated in this directory.

## Environment and startup

- Sandbox runtime: Node `v20.20.2`, npm `10.8.2`.
- Escalated host commands resolved Node `v26.3.1`, demonstrating an environment-path mismatch.
- Docker CLI/Compose exist; sandbox access to Docker socket was denied.
- Existing Docker PostgreSQL listened on 5432; existing backend on 4000 and frontend on 3000.
- Direct escalated HTTP: backend health 200/database up; frontend 200; unauthenticated auth 401.
- Isolated audit backend started on 4010 using the actual `npm run dev` command and an expert-only development bypass. No billing/user data changed.
- Audit backend startup: approximately 866 MB RSS / 623 MB heap used.
- Audit backend stopped after tests.
- Browser plugin initialization failed with `Cannot redefine property: process`. Repository Playwright checks were used after installing their pinned Chromium test browser.

## Build, lint, and tests

| Command | Result |
|---|---|
| `backend: npm run build` | PASS |
| `frontend-next: npm run build` | PASS outside sandbox; initial sandbox failure was internal port permission |
| `frontend-next: npm run lint` | FAIL: 648 findings (528 errors, 120 warnings) |
| Frontend company/action workflow checks | FAIL: both time out navigating to nonexistent `/actions` |
| Backend HazLenz core runner | Initial overall FAIL because two DB suites were sandbox-blocked; 19/21 suites passed |
| Two DB suites rerun outside sandbox | PASS: golden hardening 17/17 and vague output 25/25 |

Important test caveat: golden hardening logged `SafeScope persistence configured for database but repository is unavailable` and then passed under **degraded fallback mode**. A green suite therefore does not prove database-backed production behavior.

## Dependency audits (registry data on 2026-07-26)

- Backend `npm audit --omit=dev`: 14 vulnerabilities — 4 high, 10 moderate.
- Frontend `npm audit --omit=dev`: 4 vulnerabilities — 3 high, 1 low.
- Frontend install has six extraneous WASM/native helper packages.

## Database read-only inspection

- PostgreSQL 16.14.
- 10 public tables, zero applied migration rows.
- Row counts: standards 19; knowledge documents 8; chunks 8; users 5; organizations 7; subscriptions 0.
- Schema/entity drift documented in `DATABASE_AUDIT.md`.

## Independent HazLenz evaluation

```sh
node run-novel-hazlenz-evaluation.mjs
node run-novel-stability-evaluation.mjs
```

- 102/102 requests completed.
- 67/102 automated acceptable.
- 16 prohibited citation-family promotions.
- 8 safe-state suppression failures.
- 56 clarification expectation failures.
- Latency: 52 ms min, 86 ms mean, 468 ms max.
- Selected stability sample: 0/10 nondeterministic; 0/10 paraphrase unstable.
- Process memory climbed to approximately 845 MB RSS.

## Production-code modification statement

No production source file was modified by this audit. The frontend production build updated ignored build/cache outputs; Playwright installed browser binaries in the user cache. All tracked audit changes are confined to `verification/full-production-audit-2026-07-26/`.
