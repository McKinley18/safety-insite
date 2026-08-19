# Environment & Configuration Matrix

Repo: `Safety_InSite` @ `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (branch `main`)
Audit date: 2026-08-15

Values are never reproduced here — only variable names and PRESENT/MISSING status, per the secret-handling instruction for this audit.

## Backend runtime requirements

| Requirement | Source | Notes |
|---|---|---|
| Node.js + npm | `backend/package.json` | `build: tsc`, `start: node dist/main.js` |
| PostgreSQL | `src/database/data-source.ts` | Connection resolved via `DATABASE_URL` (takes precedence) or discrete `DB_*` vars |
| TypeORM migrations | `src/database/migrations/*.ts` | 34 migrations present; confirmed all applied cleanly on a fresh disposable DB this audit |

## Frontend runtime requirements

| Requirement | Source | Notes |
|---|---|---|
| Next.js 16 (Turbopack) | `frontend-next/package.json` | `build: next build`, `start: next start` |
| `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_URL` | `frontend-next/.env.local` | **PRESENT** in the repo's local dev env, currently pointed at a real remote backend host (not reproduced here — it is a URL, not a secret, but is out of scope to restate); this audit overrode both to `http://localhost:4040` via shell env for disposable testing, without modifying `.env.local` |
| `NEXT_PUBLIC_DISABLE_AUTH` | `frontend-next/.env.local` | **PRESENT**, value confirmed `false` (auth not bypassed) |

## Database / migrations

| Item | Status |
|---|---|
| Migration count | 34, all applied cleanly on disposable DB `phase128_prodaudit_20260815` this audit (`migration:show` → all `[X]`) |
| Destructive/seed commands against original `safescope` DB | None run — all commands this audit targeted the disposable DB with explicit `DATABASE_URL` override, positively verified via `select current_database()` before any mutating command |
| `TYPEORM_SYNCHRONIZE` | **PRESENT** in `backend/.env`, value `false` (correct — schema changes must go through migrations) |

## Environment variables — backend (`backend/.env.example` groups vs. actual `backend/.env`)

| Variable | In `.env.example` | PRESENT in `backend/.env` |
|---|---|---|
| `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | Yes | PRESENT (as `DB_HOST`/`DB_PORT`/`DB_USER`/`DB_USERNAME`/`DB_PASS`/`DB_PASSWORD`/`DB_NAME`/`DB_DATABASE` — some naming variants coexist) |
| `DATABASE_URL` | Not in `.env.example` | PRESENT — takes precedence over discrete `DB_*` vars per `data-source.ts` |
| `JWT_SECRET` / `JWT_EXPIRATION` | Yes | PRESENT (as `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`) |
| `PORT` / `FRONTEND_URL` / `NODE_ENV` | Yes | `PORT` PRESENT, `NODE_ENV` PRESENT (value `development`); `FRONTEND_URL` **not found** in local `.env` — required in production by `validate-production-environment.ts` |
| `DEV_AUTH_BYPASS` / `DEV_FORCE_PRO` / `DEV_FORCE_EXPERT` | Yes | `DEV_AUTH_BYPASS` PRESENT, value `true` in local dev `.env` (expected/appropriate for local dev; `validate-production-environment.ts` fails startup if any such flag is set in `NODE_ENV=production`) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_PRO_PRICE_ID` / `STRIPE_EXPERT_PRICE_ID` / `STRIPE_PLUS_PRICE_ID` / `STRIPE_COMPANY_PRICE_ID` / `BILLING_SUCCESS_URL` / `BILLING_CANCEL_URL` | Yes | **MISSING** from local `backend/.env` — billing/checkout endpoints (`/billing/checkout`, `/billing/webhook/stripe`) would not be functional against this local config. Not independently verified against the actual production deployment's environment (out of scope/inaccessible to this audit) — this is a local-dev-config observation, not a confirmed production gap. |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Not in `.env.example` | PRESENT |
| `BCRYPT_ROUNDS` | Not in `.env.example` | PRESENT |

## Production-config fail-fast gate (`validate-production-environment.ts`)

Verified via `scripts/test-production-environment.ts` (8/8 assertions PASS) that when `NODE_ENV=production`, the app refuses to boot unless ALL of the following hold:

- No `DEV_AUTH_BYPASS` / `DEV_FORCE_PRO` / `DEV_FORCE_EXPERT` / `DEV_EXPOSE_RESET_TOKEN` flags set
- `TYPEORM_SYNCHRONIZE` is `false`
- `DATABASE_URL` present
- `JWT_SECRET` ≥32 chars and not in a hardcoded insecure-value blocklist
- `FRONTEND_URL` and `PASSWORD_RESET_FRONTEND_URL` are valid HTTPS URLs
- `PASSWORD_RESET_PROVIDER` present
- `STORAGE_PROVIDER` is exactly `s3`, `STORAGE_S3_BUCKET` present
- `CORS_ORIGINS` contains ≥1 valid exact HTTPS origin (no wildcards)
- `TRUST_PROXY_HOPS` is an integer 0–2

This is a strong, independently-verified positive control: a misconfigured production deploy fails at boot rather than silently running insecurely.

## Storage / report-PDF dependencies

| Item | Status |
|---|---|
| Storage provider selection | `STORAGE_PROVIDER` env-driven; `local_test` (dev/test default) requires `STORAGE_LOCAL_ROOT`; production requires `s3` + `STORAGE_S3_BUCKET` (enforced by the fail-fast gate above) |
| PDF generation | Puppeteer (`backend/src/pdf/pdf.service.ts`, headless Chrome) — confirmed working end-to-end this audit (real PDF bytes, `%PDF-` magic header, checksum verification) |
| Report immutability/versioning | Confirmed via `test-private-storage-reports.ts`: new source changes create new immutable versions; unchanged source is idempotent (no duplicate version) |

## Authentication / entitlement / subscription configuration

| Item | Status |
|---|---|
| JWT-based auth | Confirmed working (register/login/guard) |
| Entitlement model | `BillingTier`: `free` / `pro` / `expert`, ~25 `BillingFeatureKey` flags, verified boundary behavior (402 clean denial, grant-based unblock, expiry enforcement, cross-user isolation) — all via `test-entitlement-boundary.ts` and manual live testing |
| Stripe billing wiring | Present in code (`billing.controller.ts`/`billing.service.ts`, webhook routes mapped) but **local dev env has no Stripe keys configured** (see above) — checkout/webhook functionality was not exercised live in this audit since it requires real Stripe credentials, which this audit does not have and should not fabricate |

## External service dependencies

| Dependency | Notes |
|---|---|
| PostgreSQL | Required, confirmed working |
| S3-compatible storage | Required in production (enforced by config gate); not exercised live in this audit (would require real S3 credentials) — `test-s3-production-provider.ts` exists in the repo's script suite for this purpose but was not run here (out of scope without real credentials) |
| Stripe | Required for billing; not exercised live (see above) |
| Password-reset delivery provider | `PASSWORD_RESET_PROVIDER` env-driven; `test-password-reset-delivery.ts` exists in repo but was not run in this pass |
| Puppeteer / headless Chrome | Required for PDF generation; confirmed present and working |

## Deployment assumptions (inferred from code, not independently verified against the real deployment)

- `frontend-next/.env.local` currently points at a live remote backend host, suggesting the real deployment target is a separate hosted backend (not verified further — out of scope for this local/disposable audit)
- `start:render` script in `backend/package.json` suggests Render.com as the intended/actual hosting platform
- `TRUST_PROXY_HOPS` config implies the production deployment sits behind at least one reverse proxy/load balancer
