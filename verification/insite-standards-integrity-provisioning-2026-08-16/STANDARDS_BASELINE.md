# Phase 0 Baseline

- **HEAD**: `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a` (unchanged for the entire session — never committed).
- **Branch**: `main`.
- **git status**: substantial pre-existing uncommitted work already in the tree at session start (auth, billing, corrective-actions, safescope-v2, regulatory, standards, migrations, etc.) — preserved throughout; only two additional files were edited by this phase (`backend/src/regulatory/regulatory.service.ts`, `backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts`, both already part of the pre-existing untracked/modified set) plus two new provisioning scripts added under `backend/scripts/`.

## Standards-related schema (original `safescope` dev DB, before this phase)

- `standards_master`: table exists, **0 rows**.
- `regulatory_releases`: table exists.
- `regulatory_section` / `regulatory_paragraph` / `regulatory_part` / `regulatory_subpart` / `regulatory_agency`: **did not exist** — migration `1800000005800-RegulatorySectionCorpus.ts` (which creates them) was present in the working tree but had never been run; `migrations` table topped out at `FindingScopedRiskSnapshot1800000005700` (35 rows) vs. 37 migration files on disk.
- `safescope_knowledge_documents` / `safescope_knowledge_chunks`: tables exist (via earlier migrations), row counts not separately queried at this stage (established empty later by the audit reproducing zero-citation results).

## Ingestion scripts/connectors present (inventory)

- `npm run seed:safescope-standards` → `safescope-standards.seed.ts` + `sync-standards-intelligence-to-master.ts --apply` + `finalize-regulatory-release.ts` — populates `standards_master` from a small in-repo curated seed (14 citations).
- `npm run ingest:safescope:osha-1910` / `ingest:safescope:osha-1926` / `ingest:safescope:msha-30-cfr` — live eCFR/govinfo.gov bulk-XML ingestion into `safescope_knowledge_documents`/`_chunks`.
- `RegulatorySyncService` (`backend/src/regulatory/regulatory-sync.service.ts`) — live eCFR bulk-XML sync into `regulatory_section`, exposed via `POST /regulatory/sync` (SUPER_ADMIN/PLATFORM_ADMIN only); paragraph population was a hardcoded no-op (`paragraphsUpserted: 0`).
- No single script seeded all three surfaces together (see `STANDARDS_PROVISIONING_ARCHITECTURE.md` for the full trace).

## Current standard-resolution code path (pre-fix understanding)

`POST /safescope-v2/classify` merges a DB-backed pipeline (`ApplicableStandardsService.suggest()`, queries `standards_master` + `safescope_knowledge_chunks`) with a DB-independent in-memory rule engine (`EXPERT_APPLICABILITY_RULES` in `standard-applicability.rules.ts`) inside `SafescopeV2Service`. `regulatory_section`/`regulatory_paragraph` were registered as TypeORM entities but never injected into any classify-path service — reachable only via the separate `GET /regulatory/section` lookup endpoint. Full trace in `STANDARDS_PROVISIONING_ARCHITECTURE.md`.

## Build state at baseline

- `npm run build` (backend, `tsc`): clean, no errors.
- `git diff --check`: clean, no whitespace/conflict-marker issues.

These baseline builds passed before any Phase 3+ work began, confirming the starting tree (with its pre-existing uncommitted work) was itself in a buildable state.
