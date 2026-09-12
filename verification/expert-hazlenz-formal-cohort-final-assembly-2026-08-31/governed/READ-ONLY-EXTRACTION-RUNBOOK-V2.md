# Guarded read-only extraction of governed release `federal-core-2026-08-28.1` — **v2**

**You run this. I do not.** The production `DATABASE_URL` is not present in this environment and I
never ask for or handle it. Execute this in your own Terminal, paste back the outputs named in
Step 5, and I reconcile — without the credential passing through me.

Supersedes `verification/expert-hazlenz-cohort-source-blockers-2026-08-31/governed/READ-ONLY-EXTRACTION-RUNBOOK.md`,
which is **left unmodified as evidence of the operation that produced it**. Do not run v1: its
Step 3 selects three columns that do not exist, and it would fail at the server.

---

## What changed from v1, and why

| # | v1 | v2 | why |
|---|---|---|---|
| 1 | `SELECT r.title, r."approvedText", r."backingState"` | reads them out of `r.payload` | **v1 was wrong.** `regulatory_release_records` has no such columns — verified against `regulatory-release-record.entity.ts`. Its columns are `citation`, `citationKey`, `recordChecksum`, `reviewState`, `reviewStateReason`, `payload`, `agencyCode`, `standardId`, plus the KG-3F approval digests. `title` and the canonical text live inside the frozen `payload` jsonb, whose shape is fixed by `normalizeStandardRecord()` in `release-manifest.ts`. |
| 2 | v1 called the projection "a best guess" and asked you to improvise with `\d` on failure | projection is now derived from the entity and the normalizer | You should not have to debug SQL against production. |
| 3 | no review-state query | **new Step 4** | `backingState` is not stored anywhere — it is derived at request time. `reviewState` is the only persisted input to that derivation, so its distribution decides what backing state every cohort row can honestly carry. One cheap count settles it. |
| 4 | closed by warning the cohort still could not be frozen because negative-control capability was 45 against a requirement of 48 | **that blocker is closed** | Capability is now 57 against 48. The extraction is no longer effort that might be wasted on that account. |

---

## Before you run anything

1. Run this against the **production** database serving `safety-insite-backend`. Not the local
   `safescope` development database.
2. Nothing below writes. Every statement is a `SELECT` inside a read-only transaction. There is no
   `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `ALTER`, `DROP`, `GRANT`, or state-changing `SET`.
3. **Do not paste the connection string back to me**, and do not echo it. Paste only query output.

---

## Step 0 — confirm the tables exist before anything else

```bash
export PGOPTIONS='-c default_transaction_read_only=on'
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT to_regclass('public.regulatory_releases')        AS releases_table,
       to_regclass('public.regulatory_release_records') AS records_table;
SELECT name FROM migrations
WHERE name IN ('RegulatoryReleaseRecords1800000012000',
               'ApprovalProvenanceContract1800000014000')
ORDER BY name;
ROLLBACK;
SQL
```

**Why this step is first.** The migrations that create these tables are applied out of band — the
Render start command is `npm run start:render` with `synchronize: false`, so a deploy does not run
them. If `regulatory_release_records` has not been migrated in production, it does not exist there,
and everything below fails.

**The trap this avoids:** if the table is missing, Step 1's write probe fails with
`42P01 undefined_table` instead of `25006 read_only_sql_transaction`. Both are errors, and it would
be easy to read the failure as "the session refused the write" when in fact **read-only was never
demonstrated at all**. Step 0 removes that ambiguity.

If either `to_regclass` returns NULL, **stop and tell me**. The extraction is blocked on a
migration, which is a separate authorization, not something to work around here. Judge migration
state by the names above, not by how many rows `migrations` holds — the production ledger is
baselined, so its ids and count do not line up with the repository.

## Step 1 — connect read-only and prove the session refuses writes

```bash
# Substitute your own production connection string. Do not echo it.
export PGOPTIONS='-c default_transaction_read_only=on'
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT current_database() AS db,
       current_user       AS usr,
       inet_server_addr()::text AS host,
       current_setting('transaction_read_only') AS txn_read_only;
-- Objective proof the session refuses writes. WHERE false means zero rows would change even if
-- read-only were somehow not in force, so the probe is safe either way.
-- EXPECTED: ERROR 25006 cannot execute UPDATE in a read-only transaction
UPDATE regulatory_releases SET id = id WHERE false;
SQL
```

**Expected:** the `SELECT` returns your production database name with `txn_read_only = on`, then the
`UPDATE` **fails with `25006`**.

**If the `UPDATE` succeeds, stop.** The session is not read-only and this runbook must not continue.
Server-side refusal is the requirement; intending only to read is not.

## Step 2 — release identity and provenance

```bash
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT id, "releaseId", "releaseVersion", status,
       "manifestChecksum", "parserVersion", "recordCount",
       "approvedBy", "approvedAt", "activatedAt", "parentReleaseId", "createdAt"
FROM regulatory_releases
ORDER BY "createdAt";
ROLLBACK;
SQL
```

This proves release identity. I reconcile `releaseId` / `releaseVersion` against
`federal-core-2026-08-28.1`, and `manifestChecksum` / `recordCount` against the governance evidence
already in the repository.

Note on `status`: `provisional` **is** this system's finalized state — it is deliberately reused
rather than renamed (see `regulatory-release.entity.ts`). `provisional` is not a defect. Only one
release may be `active` at a time, enforced by a partial unique index.

## Step 3 — the governed records, minimal projection

Only what `GovernedStandardView` needs, plus the identity that proves provenance. Nothing else
leaves the database.

```bash
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 --csv <<'SQL' > governed-snapshot.csv
BEGIN TRANSACTION READ ONLY;
SELECT r.citation,
       r."citationKey",
       r.payload ->> 'title'         AS title,
       r.payload ->> 'canonicalText' AS approved_text,
       r.payload ->> 'scope'         AS scope,
       r.payload ->> 'authorityTier' AS authority_tier,
       r."reviewState",
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

`payload ->> 'canonicalText'` is the approved regulatory text: `normalizeStandardRecord()` maps
`standards_master.standard_text` to `canonicalText`, and the record checksum is taken over exactly
that projection — so this is re-verifiable content, not a re-read of the mutable live corpus.

## Step 4 — review-state distribution (**new, and decisive**)

```bash
psql "$PROD_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN TRANSACTION READ ONLY;
SELECT r."reviewState", count(*) AS records
FROM regulatory_release_records r
WHERE r."releaseId" = 'federal-core-2026-08-28.1'
GROUP BY r."reviewState"
ORDER BY records DESC;
ROLLBACK;
SQL
```

**Why this matters.** `GovernedStandardView.backingState` is derived, never stored. `reviewState` is
its only persisted input, and it has exactly three values — `unreviewed`,
`mechanically_validated`, `reviewer_approved`. Only `reviewer_approved` can support an
`APPROVED_*` backing state.

I expect **zero** `reviewer_approved` rows, because KG-3A defect B removed the only writer of that
state at finalization — the old derivation collapsed "this source may be fetched automatically"
into "a reviewer approved this record", and was correctly deleted rather than re-pointed. If that
expectation holds, every governed record the cohort supplies is honestly `UNAPPROVED_RECORD`.

That is **not** a failure, and I want to be exact about why before you spend the effort:

- `M06` and `M07` key off `governedStandards.length > 0`, not off approval. Unaffected.
- `M08` tests `EXPERT_CANNOT_APPROVE_AN_UNAPPROVED_RECORD`. Unapproved records are what *create*
  that opportunity.
- No frozen composition minimum requires an approved record.

What it does mean is that the cohort cannot contain a row supplying a cleanly approved governed
record, so one axis of `M07` grounding will go unexercised. I will report that as a stated
limitation of the evaluation rather than let a green result imply it was covered. If Step 4 instead
returns a non-zero `reviewer_approved` count, tell me — it changes the mapping and I will not
assume either way.

## Step 5 — what to send back

- Step 1: database name, `txn_read_only`, and the `25006` error line.
- Step 2: the full result rows.
- Step 3: the `shasum` line and the `wc -l` line.
- Step 4: the full distribution.
- **Not** the connection string. The CSV contents only if you want me to build the snapshot from
  it — identity is established by the hash and row count alone.

---

## What this does *not* authorize

No `INSERT`, `UPDATE`, `DELETE` or DDL; no activation-pointer change, release creation, review
mutation, binding or rebinding, backfill, kill-switch change or configuration change; no
customer-path execution; and no provider call. The snapshot constructs `GovernedStandardView`
context on formal cohort rows and nothing else.
