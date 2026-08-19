# V5-C03 Database Safety Proof

Date: 2026-08-16 · Written BEFORE any migration/schema/database-backed command was run this session.

## Root cause of the C02 incident (for reference)

`backend/src/database/data-source.ts` begins with `import 'dotenv/config'`. `dotenv`'s default `config()` call does **not** override a `DATABASE_URL` already present in `process.env` when the Node process starts, but it **does** set `DATABASE_URL` from `backend/.env` if that variable is *absent* from `process.env` at that point. `backend/.env` contains `DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/safescope"` — the real development database. Running `unset DATABASE_URL` in the parent shell only clears the *inherited* value; it does not prevent dotenv from re-populating it from `.env` once the Node process starts, because "unset" and "absent" are the same state dotenv treats as fill-in-eligible. The safe pattern is to **explicitly export** `DATABASE_URL` pointed at the disposable target for every command — an explicitly-set value (even a different one) is never overridden by dotenv.

## Positive proof (run before creating the disposable database or touching anything)

```
$ DATABASE_URL="postgresql://mckinley@127.0.0.1:5432/phase133_c03_20260816_084114" node -e "
require('dotenv').config();
const u = new URL(process.env.DATABASE_URL);
console.log('RESOLVED_HOST:', u.hostname);
console.log('RESOLVED_PORT:', u.port);
console.log('RESOLVED_DBNAME:', u.pathname.replace('/',''));
"
RESOLVED_HOST: 127.0.0.1
RESOLVED_PORT: 5432
RESOLVED_DBNAME: phase133_c03_20260816_084114
```

## Negative proof (demonstrates the exact failure mode, for contrast — no DB command was run in this state)

```
$ node -e "
delete process.env.DATABASE_URL;
require('dotenv').config();
console.log('RESOLVED_DATABASE_URL_IF_UNSET:', process.env.DATABASE_URL);
"
RESOLVED_DATABASE_URL_IF_UNSET: postgresql://mckinley@127.0.0.1:5432/safescope
```

This confirms: an *unset* (as opposed to explicitly-overridden) `DATABASE_URL` resolves to the real `safescope` database via dotenv, exactly reproducing the C02 incident's mechanism. Every database-targeting command in this C03 session therefore **explicitly exports** `DATABASE_URL` to the disposable connection string — never relies on `unset`.

## Disposable database created for C03

- Name: `phase133_c03_20260816_084114`
- Host/port: `127.0.0.1:5432` (same local Postgres instance as dev, different database name)
- Created via `CREATE DATABASE phase133_c03_20260816_084114;` against `postgres` system database, confirmed present via `\l`.
- `safescope`'s `migrations` table row count recorded immediately before creation: **35** (matches V5-C02's closing state exactly — confirms `safescope` was not touched between sessions and establishes the pre-C03 baseline to re-check at teardown).

## Migration executed against the disposable database (positive confirmation)

Before running `npm run migration:run`, `DATABASE_URL` was explicitly exported to the disposable URL and the resolved value was printed and visually confirmed as `postgresql://mckinley@127.0.0.1:5432/phase133_c03_20260816_084114` immediately before the migration executed. A same-line automated string-equality check in that same command produced a spurious "NO" because `dotenvx`'s banner text ("◇ injected env...") leaked into the `$(...)` command-substitution output feeding the comparison, not because the resolved database differed — the printed `RESOLVED_DATABASE_URL`/`CONFIRMED RESOLVED TARGET` lines both show the correct disposable name. This was verified conclusively and immediately after the migration by comparing `migrations` table row counts on both databases directly (not via a re-derived shell comparison):

```
phase133_c03_20260816_084114 migrations count: 35   (all 35 migrations applied fresh, as expected)
safescope migrations count:                     35   (unchanged from the count recorded before this migration ran)
```

Both counts prove the migration applied only to the disposable database and `safescope` was not touched. All later automated target-verification snippets in this session redirect stderr/banner output away from the compared value to avoid this false-negative pattern.

## Standing rule for this session

Before every migration/schema/destructive/database-backed test/disposable-backend command below, the command's actual `DATABASE_URL` (or `DB_*` vars, if used instead) is printed/logged immediately before execution and cross-checked against `phase133_c03_20260816_084114` before proceeding. Any command whose resolved target does not match that name is refused. See `V5_C03_VERIFICATION.md` for the log of each such check as commands were run.
