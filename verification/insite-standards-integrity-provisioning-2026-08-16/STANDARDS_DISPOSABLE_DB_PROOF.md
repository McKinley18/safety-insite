# Disposable Standards DB Proof

## Target

- Host: `127.0.0.1`
- Port: `5432`
- User: `mckinley`
- Database: `hazlenz_standards_verify_20260816`
- Full URL used for every command: `postgresql://mckinley@127.0.0.1:5432/hazlenz_standards_verify_20260816`
- Created via: `createdb -h 127.0.0.1 -p 5432 -U mckinley hazlenz_standards_verify_20260816` (16:xx UTC 2026-08-16)

## Precedence handling

`backend/.env` sets `DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/safescope`, which — per `backend/src/database/data-source.ts` — takes precedence over discrete `DB_*` vars whenever set. Every DB-changing command in this phase explicitly exported
`DATABASE_URL=postgresql://mckinley@127.0.0.1:5432/hazlenz_standards_verify_20260816` in the same shell invocation immediately before running the command, overriding the `.env` value (shell-exported env vars are not overwritten by `dotenv.config()`, which defaults to non-destructive merge). Resolved target (host+path) was printed and verified before the migration run.

## Migrations

Ran `npm run migration:run` (`typeorm-ts-node-commonjs -d src/database/data-source.ts migration:run`) against the disposable DB.

Result: all 37 migrations present in `backend/src/database/migrations/` applied successfully, including the two that had never been run against the original `safescope` dev DB:

- `RegulatorySectionCorpus1800000005800` — creates `regulatory_agency`, `regulatory_part`, `regulatory_subpart`, `regulatory_section`, `regulatory_paragraph`
- `RetireExpertTier1800000005900` — unrelated entitlement-tier migration, applied incidentally as part of the full chain

`standards_master` table verified/created via `npx ts-node src/standards/maintenance/ensure-standards-master-table.ts` (idempotent `CREATE TABLE IF NOT EXISTS` + column-add-if-missing script).

## Verification queries (measured)

| Check | Disposable DB (`hazlenz_standards_verify_20260816`) | Original dev DB (`safescope`) |
|---|---|---|
| `migrations` row count | 37 | 35 (unchanged) |
| `regulatory_section` table exists | yes | no (`relation does not exist`) |
| `standards_master` row count | 0 (pre-provisioning) | 0 (unchanged) |

This confirms: (a) the disposable DB is a fully independent, correctly migrated target, distinct from `safescope`; (b) the original `safescope` DB was not written to, altered, or migrated during this phase; (c) the zero-citation finding from the prior audit run is consistent with `standards_master` being empty and the regulatory hierarchy tables not existing at all in the dev DB prior to this phase — i.e. a data-provisioning gap, not yet proof of a resolver defect.
