# V5-C02 Baseline

Date: 2026-08-16 · Repo HEAD (unchanged throughout implementation, no commits made): `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`

## Repository state at start

Branch `main`. Substantial pre-existing uncommitted work already present in the working tree (auth, billing, corrective-actions, inspection, reports, safescope-v2, safescope-knowledge, frontend-next, and others — dozens of files). This state was preserved throughout; no unrelated file was reset, stashed permanently, or discarded. (One 2-second diagnostic `git stash push`/`git stash pop` was used mid-session solely to isolate whether a clarification-gauntlet failure was caused by this session's edits — see `V5_C02_VERIFICATION.md` — and was immediately popped back, restoring the exact prior state.)

## Protected V4 hashes (recorded before any edit, reconfirmed after)

| File | SHA-256 |
|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `f076a568396a76e810191fd3b82b40acb342bd6781ee072ef4254e33ad5c986a` |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `6e48b3c0fb0f38d651cbc747eb056b78a4aa413b44b2769ed16075febe1828a8` |
| `safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json` | `1d75b2a517d359d59860f00a17868ac2116821a1540df4dea43bbd9da3359470` |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_CONTRACT_ADJUDICATION_V4_FULL_FROZEN.json` | `8c38d05198fc3bacc88eda436dddea6608680034b972587a11c217744bc12d97` |
| `verification/hazlenz-temporal-foundation-2026-08-09/FAMILY_MATRIX_EXECUTION_MANIFEST_V3.json` | `2a47473a3c3ef82e7ff95be22850b6c1a96e1f3ae3e15346997654370b978604` |
| `verification/hazlenz-temporal-foundation-2026-08-09/score_family_matrix_v4_authoritative.mjs` | `60eb6adc54f43b022b3fdd7f91f63053ff3931ab6b5107b54cc823e641a446b3` |

Identical to the values recorded in the V5-C04 implementation report — confirms no drift between C04's close and this phase's start. Reconfirmed byte-identical after all C02 edits (see `V5_C02_VERIFICATION.md`).

## V5-C01 files (must remain unreopened absent a proven regression)

| File | SHA-256 |
|---|---|
| `backend/src/inspection/entities/inspection-finding.entity.ts` | `6852fb0e353765ef3202424793671cb0f361bbe21413368eef6c3806ad3df34b` |
| `backend/src/inspection/inspection.service.ts` | `1f080b2da6e1430f63b51dcbf84345cd00951056e8f028a891a43139a272f287` |
| `backend/src/inspection/finding-risk.mapping.ts` | `da5821afa8d99932a12354c38e6d1e20e12fe5e85e6afbf2b913c36bfdbc28c9` |

All three confirmed byte-identical after C02 (no file in this list was edited).

## V5-C04 deletions confirmed still absent

`backend/src/safescope-v2/corrective-action-control-map/`, `backend/src/safescope-v2/governance-report-adapter/` — both directories absent, as C04 left them.

## Disposable verification infrastructure

- Database `phase132_c02_20260816` (Postgres, local), created via `CREATE DATABASE`, migrated with all 35 migrations (including `FindingScopedRiskSnapshot1800000005700` from C01).
- Disposable backend on port 4310, `NODE_ENV=test`, `DEV_AUTH_BYPASS=false`, `STORAGE_LOCAL_ROOT=/tmp/c02-storage-root`.
- **Incident, disclosed and resolved (see the user-facing turn where this was reported live):** an early `npm run migration:run` invocation was intended to target the disposable database, but `dotenv/config` reloaded `DATABASE_URL` from `backend/.env` (which points at the real `safescope` dev database) because the shell's `unset DATABASE_URL` only cleared the *inherited* value, not what dotenv injects on process start. That one migration run executed `ALTER TABLE inspection_findings ADD COLUMN IF NOT EXISTS "riskSnapshot" jsonb NULL` against `safescope` — purely additive (nullable column, `IF NOT EXISTS` guard, zero rows touched), and it matches a migration file already committed to the repo from V5-C01 whose entity column already expected this column to exist, so it brought `safescope`'s schema into sync with already-shipped code rather than corrupting it. Disclosed to the user immediately; the user chose "leave it, proceed." All subsequent database-targeting commands in this session explicitly set `DATABASE_URL` to the disposable connection string (not merely `unset`), which is immune to dotenv's inject-if-absent behavior. The original `safescope` database was not targeted by any other command in this session.

## Baseline verification (run against the disposable database/backend before any C02 code edit)

| Check | Result |
|---|---|
| `test:canonical-workflow` | PASS |
| `test:finding-scoped-reviews` | PASS |
| `test:persisted-decomposition-findings` | PASS |
| `test:risk-policy` | PASS |
| `test:evidence-foundation` | PASS |
| `test:guided-finding-response` | PASS |
| `test:hazlenz-evidence-boundary` | PASS |
| `test:private-storage-reports` | PASS (after discovering and setting the required `STORAGE_LOCAL_ROOT` env var for `NODE_ENV=test`) |
| `test:canonical-organization-authorization` | PASS (requires `NODE_ENV=test`) |
| Backend build (`tsc --noEmit`) | PASS |

This baseline (canonical workflow, finding-scoped risk, evidence sufficiency's live wiring, clarification-relevant evidence-boundary/foundation behavior, PRA-002-adjacent finding-scoped reviews, reports, authorization) was re-run in full after implementation with identical results (see `V5_C02_VERIFICATION.md`).
