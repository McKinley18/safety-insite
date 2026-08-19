# Local Browser Environment

## URLs
- Frontend: `http://localhost:3000` (Next.js 16.2.12, Turbopack, `npm run dev`)
- Backend: `http://localhost:4000` (NestJS, `npm run dev` via nodemon)

## Database
- Disposable database `test_audit_20260816` (Postgres, local, role `mckinley`), created fresh for this audit and never touching the original `safescope` development database. See `POLISH_EFFICIENCY_BASELINE.md` for full provenance (creation, migration, rename history — originally created as `safescope_audit_20260816`, renamed to satisfy the repo's own `grant-test-entitlement.ts` disposable-database naming guard).
- 35 migrations applied cleanly to a fresh schema.
- Seeded: `seed:safescope-standards` (19 standards: 13 OSHA, 6 MSHA) and `seed:safescope-knowledge` (8 starter reference documents).
- `DATABASE_URL` was exported as a process env var on every backend launch to override the `.env` default (which points at the original `safescope` DB) — verified empirically that this override wins over `dotenv/config`.

## Auth / dev configuration
- `backend/.env` ships with `DEV_AUTH_BYPASS=true`. This was found to be load-bearing for a real bug (see `ERROR_EMPTY_LOADING_AUDIT.md` — root cause of the 500 on HazLenz review) and was overridden to `DEV_AUTH_BYPASS=false` for all real-auth testing so that genuine JWT-based register/login could be exercised end to end.
- Real account created via the UI: `audit.tester.20260816@example.com`, "Pro" plan selected at registration (billing/Stripe is not configured in this environment, so plan selection alone did not grant paid entitlements — see `OFFLINE_FREE_PRO_AUDIT.md`).
- A 4-hour "expert" tier test entitlement was granted to this account via the repository's own `backend/scripts/grant-test-entitlement.ts` (a script gated to disposable, `test*`/`phase*`-named local databases only) so the full Pro/Expert HazLenz + report + corrective-action path could be exercised, not just the free/degraded path.

## Feature flags / environment notes
- `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE_URL` in `frontend-next/.env.local` point at a production Render backend (`https://safescope-backend.onrender.com`) by default. Both were overridden to `http://localhost:4000` when starting the frontend dev server; confirmed via network inspection that all traffic went to localhost, never production.
- `TYPEORM_SYNCHRONIZE=false` — schema is migration-driven only, consistent with what was exercised.
- Regulatory release seeded as `federal-core-2026-07-30.1`, status `provisional`, `approvedRecords: 0` — relevant to the standards-experience audit (nothing is in an "approved" governance state in this environment).

## Browser tooling
- Real Chromium via the `claude-in-chrome` MCP integration (navigate, click, type, screenshot, network-request inspection, viewport resize) — not a static code read. All findings in the visual/UX audit documents were observed in the actual rendered application.

## Teardown
- Backend/frontend dev servers and the disposable database are torn down at the end of this audit; see the final executive report for confirmation status.
