# Guarded read-only extraction of governed release `federal-core-2026-08-28.1`

**You run this. I do not.** The production `DATABASE_URL` is not present in this environment, and
your standing instruction is that I never ask for or handle it. Everything below is designed so you
can execute it in your own Terminal, paste the output back, and I reconcile it — without the
credential ever passing through me.

---

## Why this runbook exists

Phase 1 authorized a read-only extraction. It could not be executed here, for a measured reason:

| check | result |
|---|---|
| `DATABASE_URL` in this environment | **localhost**, 48 chars, and **malformed** — `new URL()` rejects it, and `pg` resolves its host to the literal string `base` |
| discrete `DB_*` | `DB_HOST=localhost`, `DB_NAME=safescope`, `DB_PORT=5432` — the **local development** database |
| any Render/production host in config | **none** |
| `regulatory_releases` rows in the local DB | **0** |
| `regulatory_release_records` table | **ABSENT** |
| `knowledge_release_events` table | **ABSENT** |

So the accepted production governed release is **not reachable from this machine's configuration**,
and the local development database does not contain it.

**Read-only enforcement was proven achievable**, which is the one thing worth carrying forward: on a
`BEGIN TRANSACTION READ ONLY` session, a write probe was refused by the server with
`SQLSTATE 25006 — cannot execute UPDATE in a read-only transaction`. That is server-side
enforcement, not discipline. Note also that the local role is a **superuser**, so the *role* is not
constrained — only the *transaction* is. The runbook below therefore constrains at both levels where
your production role permits it.

---

## Before you run anything

1. Run this against the **production** database that serves `safety-insite-backend`. Do not run it
   against the local `safescope` development database.
2. Nothing below writes. Every statement is a `SELECT` inside a read-only transaction. There is no
   `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `GRANT`, or `SET` that changes stored
   state.
3. **Do not paste the connection string back to me.** Paste only the query output.

---

## Step 1 — connect read-only and confirm the target

```bash
# Substitute your own production connection string. Do not echo it.
export PGOPTIONS='-c default_transaction_read_only=on'
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT current_database() AS db,
       current_user       AS usr,
       inet_server_addr()::text AS host,
       current_setting('transaction_read_only') AS txn_read_only;
-- Objective proof the session refuses writes. WHERE false means zero rows would change even
-- if read-only were somehow not in force, so this probe is safe either way.
-- EXPECTED: ERROR 25006 cannot execute UPDATE in a read-only transaction
UPDATE regulatory_releases SET id = id WHERE false;
SQL
```

**Expected:** the `SELECT` returns your production database name with `txn_read_only = on`, then the
`UPDATE` **fails with `25006`**. If the `UPDATE` succeeds, stop — the session is not read-only and
this runbook must not continue.

## Step 2 — release identity and provenance

```bash
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT id, "releaseId", "releaseVersion", status,
       "manifestChecksum", "parserVersion", "recordCount",
       "approvedBy", "approvedAt", "createdAt"
FROM regulatory_releases
ORDER BY "createdAt";
ROLLBACK;
SQL
```

This is what proves release identity. I will reconcile `releaseId`/`releaseVersion` against
`federal-core-2026-08-28.1`, and `manifestChecksum` and `recordCount` against the governance evidence
already in the repository.

## Step 3 — the governed records, minimal projection

Only the four fields `GovernedStandardView` needs, plus the identity needed to prove provenance.
Nothing else leaves the database.

```bash
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 --csv <<'SQL' > governed-snapshot.csv
BEGIN TRANSACTION READ ONLY;
SELECT r.citation,
       r.title,
       r."approvedText",
       r."backingState",
       r."releaseId",
       r."recordChecksum"
FROM regulatory_release_records r
JOIN regulatory_releases rel ON rel."releaseId" = r."releaseId"
WHERE rel."releaseId" = 'federal-core-2026-08-28.1'
ORDER BY r.citation;
ROLLBACK;
SQL

shasum -a 256 governed-snapshot.csv
wc -l governed-snapshot.csv
```

> **Column names are a best guess from `regulatory-release-record.entity.ts`.** If `psql` reports an
> unknown column, run
> `\d regulatory_release_records`
> and paste the column list instead — I will correct the projection rather than have you improvise.

## Step 4 — what to send back

- Step 1's output (database name, `txn_read_only`, and the `25006` error line).
- Step 2's full result rows.
- Step 3's `shasum` line and `wc -l` line.
- **Not** the connection string, and not the CSV contents unless you want me to build the snapshot
  from it — the hash and row count alone let me verify identity.

---

## What this does *not* authorize

No `INSERT`, `UPDATE`, `DELETE` or DDL; no activation-pointer change, release creation, review
mutation, binding or rebinding, backfill, kill-switch change or configuration change; no
customer-path execution; and no provider call. The snapshot is for constructing
`GovernedStandardView` context on formal cohort rows and nothing else.

## One thing worth knowing before you spend the effort

Even with this snapshot in hand, **the cohort still cannot be frozen**, because the second blocker is
independent: the negative-control requirement is 48 and the maximum truth-supported count reachable
from all authorized material is **45**. That is measured, not estimated — see the operation report.
If you would rather settle the corpus-augmentation question first, this extraction can wait without
losing anything.
