# Phase 0 — Baseline

Date: 2026-08-16

## Repository state

- Branch: `main`
- HEAD: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (matches expected HEAD)
- Working tree: ~295 modified/added/deleted files present at session start — substantial legitimate uncommitted work (schema/entity refactor, auth/entitlement rework, in-progress migration renumbering). Preserved as-is; not committed, reset, or stashed during this session.
- `git diff --check`: **PASS** (no whitespace/conflict-marker errors)

## Build status

- `backend`: `npm run build` (tsc) → **PASS**, no errors.
- `frontend-next`: `npm run build` → **PASS**, all routes compiled/prerendered successfully (`/`, `/about`, `/hazlenz`, `/inspection*`, `/pricing`, `/reports`, `/settings`, etc.)

## Disposable verification infrastructure

The original `safescope` development database (`postgresql://mckinley@127.0.0.1:5432/safescope`) was **never migrated, seeded, or written to** during this session — it was only read once via `pg_dump` (read-only).

Important discovery made while provisioning verification infra: the original `safescope` dev DB's live schema is **stale relative to the current working tree**. It has `user` (singular), `standards_master`, no `regulatory_section`/`regulatory_part`/`regulatory_agency` tables, no `hazard_taxonomy` table, etc. The working tree's migrations (several of which are currently uncommitted/renumbered — see `git status`) add a `RegulatorySectionCorpus1800000005800` migration whose own comment states the eCFR/MSHA regulatory-text entities "had no migration despite being registered TypeORM entities... confirmed absent from all prior migrations." This means, as of this session, **live official regulatory full-text (`regulatory_section`) has never been populated in any environment** — the feature is wired end-to-end in code but the backing table is new and empty. This is treated as a live finding, not fixed by widening scope; see `STANDARDS_INTELLIGENCE_VERIFICATION.md`.

Disposable databases created for this verification phase only (both local Postgres databases on the same instance the dev DB uses, never touching `safescope` itself):

1. `safescope_verify_20260816` — created via `createdb`, schema created via `npm run migration:run` against the **current working-tree migrations** (matches current entity code exactly). Seeded with the static `seed:safescope-standards` pipeline (19 real OSHA/MSHA standard records — see below). No live network ingestion was performed (see network note).
2. `test_hazlenz_verify_20260816` — a straight local copy of (1), created only so its name matches the existing `grant-test-entitlement.ts` script's hard-coded disposable-database allowlist regex (`^(phase[0-9]+|test)...`). This is the database the backend and all live verification in this phase actually ran against.

Network note: outbound HTTPS to `www.ecfr.gov` stalls after TLS handshake in this sandbox (general internet, e.g. `google.com`, works). Live eCFR/MSHA full-text ingestion (`npm run ingest:*`) could not be executed this session as a result. Standards intelligence verification therefore covers HazLenz's own citation/summary layer (`standard`/`standards_master`, real static text) fully, and the `regulatory_section` official-text layer only at the code/UX-honesty level, not with populated live text. This is reported as a real product gap, not glossed over.

Test users (disposable DB only):
- `verify-free-20260816@example.com` — registered via `/auth/register`, default `planCode: "free"`.
- `verify-pro-20260816@example.com` — registered the same way, then granted an 8-hour Pro entitlement via `scripts/grant-test-entitlement.ts` (itself guarded to only run against `NODE_ENV=test` + an allowlisted local disposable DB name).

Running services (local only, never production):
- Backend: `node dist/main.js`, `PORT=4001`, `DATABASE_URL` pinned to `test_hazlenz_verify_20260816`.
- Frontend: `next dev -p 3001`, `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_API_BASE_URL` explicitly overridden to `http://127.0.0.1:4001`. (The checked-out, gitignored `frontend-next/.env.local` points `NEXT_PUBLIC_API_URL` at the live Render production backend — that file was left untouched; the override was passed as process environment only, so no risk of this session's traffic reaching production.)

All of the above is disposable and will be torn down (processes killed, both `*_verify_20260816` databases dropped) at the end of this phase.
