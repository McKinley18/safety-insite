# Disaster recovery runbook

**Established at §311 (`BR-5`).** This is what to do when production data is lost, corrupted or
wrongly changed. It assumes nothing about who is reading it beyond access to the Render, Neon and
Cloudflare consoles and a checkout of this repository.

It contains **no credentials**. Every value it needs is named by the environment variable that holds
it.

> **Read [`ROLLBACK-MODEL.md`](ROLLBACK-MODEL.md) first if the problem might be code.** Most incidents
> that look like data loss are a bad deploy, and the answer to a bad deploy is to redeploy the
> previous SHA and touch nothing else. Restoring a database is the most destructive tool in this
> document and it is almost never the first one to reach for.

---

## 0. The one rule that outranks the rest

**Restoring the database must never silently destroy human settlements.** A settlement is a person's
judgement about a hazard. Older code can be redeployed and a migration can be re-run, but a
confirmation that a qualified person made and that is then overwritten by a restore is *gone*, and
nothing in the system can reconstruct it.

So a restore is a decision with a cost, and §5 below requires that cost to be **counted and written
down before** the restore, not discovered afterwards.

---

## 1. Entry criteria — when this document applies

Use this runbook only for one of these. Anything else is a deploy problem, not a recovery problem.

| | condition | first action |
|---|---|---|
| **E1** | Customer data is missing, truncated or wrong, and the cause is not a bad deploy | §2 |
| **E2** | A migration ran against production and produced a schema or data state that cannot be fixed forward | §2 |
| **E3** | The database is unreachable or reports corruption at the storage layer | §2, then Neon support |
| **E4** | Evidence objects (photos, report PDFs) are missing from R2 while their database rows remain | §7 only — **do not restore the database** |
| **E5** | An account deletion or bulk operation removed more than it should have | §2 |

**Not entry criteria.** A slow endpoint, a 5xx burst, an expired credential, a failed Expert
analysis, a single customer's confusion about what they saved. Those are in
[`MONITORING.md`](MONITORING.md).

---

## 2. Who initiates, and the first five minutes

**The product owner initiates recovery.** There is no on-call rotation and no second operator; this
is an individual Beta. Nobody else is authorised to restore production.

Before choosing a path, capture these five facts. They determine every later step and they get
harder to read accurately as the incident progresses.

1. **The time the damage started**, as precisely as it can be bounded. This is the single most
   important number in the document — §3 and §4 both key off it.
2. **How the damage was discovered**, and when. The gap between (1) and this is what decides whether
   the six-hour provider window is even available.
3. `curl https://safescope-backend.onrender.com/health/ready` — record `status`, `schema.appliedCount`,
   `schema.expectedSchemaVersion` and `aheadOfBuild`.
4. `curl https://safescope-backend.onrender.com/health/version` — record `gitCommit`. This is the
   build that was serving when the damage happened.
5. **Whether writes are still arriving.** If the damage is ongoing and its cause is in the running
   build, the fastest containment is to roll the backend to the previous deploy in the Render
   dashboard. Containment first; recovery second.

---

## 3. Choosing the restore point

There are two sources of truth and they cover different windows. Read both rows before choosing.

| source | window | granularity | loses |
|---|---|---|---|
| **Neon Instant Restore** | **the last 6 hours only** (Free plan, re-read §311) | any instant | everything written after the chosen instant |
| **Durable logical backup** | the retention policy — 14 daily, 8 weekly Sundays | one per day | everything written since that backup was taken |

**Decision rule.**

- **Damage started inside the last 6 hours** → use Neon Instant Restore (§4). It is faster, needs no
  artifact, and loses the least.
- **Damage started more than 6 hours ago** → use the durable backup (§5). Instant Restore cannot
  reach back that far, and the console will not offer a time it cannot serve.
- **Unsure** → open the Neon Backup & Restore page and look at what the picker allows. Its earliest
  selectable instant is the honest edge of the window.

> **Do not pick a restore point that is merely "before the damage".** Pick the *latest* instant that
> is still before it. Every minute earlier is a minute of real customer work discarded.

---

## 4. Path A — Neon Instant Restore (damage inside 6 hours)

1. Neon console → project **Sentinel Safety** (`old-moon-90939488`) → branch **production**
   (`br-misty-union-a4uke5p1`) → **Backup & Restore**.
2. Confirm the compute shown is `ep-weathered-moon-a4egk93d`. It must match the host in the
   production `DATABASE_URL`. If it does not, stop — you are looking at the wrong project.
3. Set the point in time to the instant chosen in §3. **Use "Preview data" before "Restore".** The
   preview opens the branch as it was at that instant; query the affected table and confirm the
   damage is absent and the good data is present.
4. Restore.
5. Go to §6 (migration compatibility), then §7 (objects), then §8 (verification).

**What this does not do.** It does not touch R2, so §7 still applies. And Neon's restore replaces the
branch — anything written between the chosen instant and now is discarded, which is the cost you
counted in §0.

---

## 5. Path B — restore from the durable backup

### 5.1 Count the cost first

```
# How much customer work is about to be discarded?
#   <ts> is the takenAt of the artifact you are about to restore.
select count(*) from inspection            where "createdAt" > '<ts>';
select count(*) from inspection_reports    where "createdAt" > '<ts>';
select count(*) from corrective_actions    where "createdAt" > '<ts>';
select count(*) from storage_objects       where "createdAt" > '<ts>';
```

Write the four numbers down. If any of them is non-zero, those records will not exist after the
restore, and §0 applies. If the count is high enough to be unacceptable, a **partial** restore —
restoring into a scratch database and copying only the damaged rows back — is usually the right
answer and is always safer than a wholesale replacement.

### 5.2 Find the artifact

The freshness record names the newest one:

```
# reads postgres/latest.json from insite-backups
cd backend && node scripts/ops/check-backup-freshness.js
```

It reports `lastSuccessAt`, `lastSuccessArtifactKey`, `lastSuccessSha256` and
`lastSuccessSchemaHead`. For an older point, list the bucket: artifacts are named
`neondb-YYYY-MM-DDTHHMMSSZ.dump` and each has a `.metadata.json` beside it recording the schema head,
the production SHA and the `applicationSourceDigest` that were live when it was taken.

### 5.3 Restore into a scratch database FIRST — always

Never restore directly over production. Prove the artifact first.

```
# A throwaway password for a throwaway container, generated rather than chosen, and never reused.
export DR_LOCAL_PW="$(openssl rand -hex 16)"

docker run -d --name dr-restore -e POSTGRES_PASSWORD="$DR_LOCAL_PW" -e POSTGRES_DB=restoretarget \
  -p 15432:5432 postgres:17.11        # the exact production server version

cd backend
node scripts/ops/verify-backup-restore.js \
  --artifact "$BACKUP_S3_PREFIX/neondb-<stamp>.dump" \
  --target   "postgresql://postgres:${DR_LOCAL_PW}@127.0.0.1:15432/restoretarget"
```

> **Why the password is a shell variable and not a literal here.** `scan-candidate-diff-for-secrets.sh`
> matches credential *shapes*, and a connection URL carrying a literal password is that shape even
> when the password is obviously fake. Two things changed rather than one: this document now builds
> the URL from a generated variable, which is better practice anyway, and the scanner's pattern now
> excludes `$ { } < >` inside the password so a variable reference or an angle-bracket placeholder is
> not reported. That second change is a *precision* improvement — every literal password still
> matches — and it was made instead of loosening the length or character rules, which would have
> blinded the scanner to real credentials.

The script refuses any target that is not a local host with a disposable-looking name. That refusal
is a safety control; do not pass `--i-know` to get around it during an incident.

It reports: the restore completed without error, the table set, and the migration head. Adding
`--source <production url>` additionally compares every table by content — useful when verifying a
backup, **not** useful mid-incident, because production is the damaged thing you are comparing to.

### 5.4 Promote

Only after §5.3 passes. Restore the same artifact into the production database using the same
`pg_restore --clean --if-exists` invocation the script runs, with the **direct** Neon endpoint (not
`-pooler`) and a PostgreSQL **17 or newer** client. Both of those have cost a section already.

---

## 6. Migration compatibility — before anything serves traffic

A restored database carries the schema position it had when it was taken, which may be **behind** the
build that is currently deployed.

1. Read the restored head: `select max(timestamp), count(*) from migrations;`
2. Compare it to the artifact's `.metadata.json` → `schemaPosition.head`, and to what the deployed
   build expects (`/health/ready` → `schema.expectedSchemaVersion`).
3. **Restored head equals expected** → nothing to do.
4. **Restored head is behind expected** → run `npm run migrate:prod` against the restored database
   *before* pointing the application at it. Migrations run before deploy; that ordering is the safety
   property, not a preference.
5. **Restored head is ahead of expected** → this is a supported state. `/health/ready` reports
   `aheadOfBuild` and stays ready, which is what makes migrate-before-deploy safe. Either leave it
   or deploy the matching newer build.

---

## 7. Object storage — the half a database restore does not cover

Inspection evidence and report PDFs live in Cloudflare R2, not in PostgreSQL. A database restore
moves the *references* and not the *objects*, so the two can disagree afterwards. This is the check:

```
cd backend && node scripts/ops/verify-object-consistency.js --deep
```

It reads `storage_objects` — the single ledger of every object the product has stored, carrying each
object's key, byte length and sha256 — and reconciles it against the bucket in both directions.

> ### ST-4 / §312 — WHAT EVIDENCE RECOVERY DOES AND DOES NOT COVER
>
> **Cloudflare R2 has no object versioning**, `insite-production` has **no bucket lock**, and R2's
> eleven-nines durability explicitly **"does not prevent intentional or accidental deletion of data."**
> Bucket lock is not a fix here: the product hard-deletes objects during normal operation (upload
> rollback, `retireReportArtifact` on report regeneration, customer `tombstone`), so locking the bucket
> would break report regeneration and customer erasure.
>
> **§312 answers this with an independent recovery copy** in `insite-backups/evidence/`, reconciled
> operator-side. It covers accidental **delete** and accidental **overwrite**, for a bounded window,
> with digest verification — and it refuses to resurrect anything a customer has erased.
>
> **ACTIVATED at §312A.** The read-only source credential `insite-evidence-recovery-reader` exists,
> the daily run reconciles both halves, and the aggregate reports `HEALTHY`.

## 7A. Evidence recovery — the §312 model in six lines

| | |
|---|---|
| Recovery bytes | `evidence/objects/<sha256>` — **content-addressed**, so an overwrite cannot destroy the previous generation and identical bytes dedupe |
| Per-generation manifest | `evidence/generations/<storageObjectId>/<capturedAt>-<sha12>.json` — source key, digests, size, owner scope |
| Erasure tombstone | `evidence/erasure/<storageObjectId>.json` — **authoritative, and deliberately NOT in the database** |
| Generation window | **30 days** for superseded/orphaned generations; the generation matching the current live object is kept while it is live |
| Erasure grace | **24 hours** from the customer's deletion, then the recovery bytes are removed too |
| Command | `node scripts/ops/reconcile-evidence-recovery.js [--apply] [--restore <id>]` |
| Source access | `insite-evidence-recovery-reader` — R2 **Object Read only**, `insite-production` only. It cannot write, overwrite or delete anything, in either bucket. |

**Why the erasure tombstone is not a database row.** A database row cannot answer the question that
matters. Restore the database to a point *before* a customer's deletion and a database-only record of
that deletion vanishes with it — the object becomes restorable again and the erasure is quietly
undone. The tombstone lives in recovery storage, where a database restore cannot reach it, so the
refusal survives the rollback. §312 proves this directly: the database was rolled back to a state in
which it believes the object is live and was never erased, and the restore was **still refused**.

**Erasure is never inferred from absence.** A missing object is a candidate for *recovery*, not for
erasure. A tombstone is written only on a positive signal — `storage_objects.deletedAt` set by the
customer-initiated delete path, corroborated by a `file_deleted` audit row. A
`report_artifact_retired` row is the product superseding its own PDF and carries **no** erasure
intent; treating it as erasure would delete recovery copies during ordinary report regeneration.

### Classification states

| state | meaning | action |
|---|---|---|
| `LIVE_MATCHED` | live object present and captured, digests agree | none |
| `LIVE_UNBACKED` | live object present, not yet captured | run `--apply` |
| `DIGEST_MISMATCH` | live bytes disagree with the database record | investigate before capturing |
| `MISSING_LIVE_RECOVERABLE` | database says live, object gone, recovery copy exists | **§7B** |
| `MISSING_LIVE_UNRECOVERABLE` | object gone, no recovery copy — already lost | do not fabricate a replacement |
| `MISSING_LIVE_ERASURE_AUTHORIZED` | gone because the customer erased it | **never restore** |
| `RECOVERY_ONLY_EXPECTED` | recovery generation whose live object is legitimately gone | none, expires on the window |
| `RECOVERY_ONLY_SUSPECT` | recovery bytes with no database row and no explanation | investigate |
| `UNKNOWN` | the scan could not complete | **never a pass** — exit 2, nothing is changed |

## 7A-bis. Is the backup actually healthy?

```
cd backend && node scripts/ops/check-backup-health.js
```

**`HEALTHY` requires ALL THREE halves.** This composition exists because it has twice been possible
for the nightly job to exit 0 while something real was wrong. Between §311A and §312A it exited 0
every night while customer evidence was entirely unprotected — the database backup had succeeded, so
the job was "green". And until §315 it exited 0 while the *live bytes* of an evidence object could
silently disagree with the digest the database recorded, because nothing in the scheduled path
re-hashed them. A light that means *part* of your recovery posture is fine is worse than no light.

| database | evidence | integrity | aggregate | exit |
|---|---|---|---|---|
| HEALTHY | PROTECTED | INTEGRITY_HOLDS | **HEALTHY** | 0 |
| HEALTHY | PROTECTED | DIGEST_MISMATCH | DEGRADED | 1 |
| HEALTHY | PROTECTED | ACTIVE_OBJECT_MISSING | DEGRADED | 1 |
| HEALTHY | PROTECTED | RESURRECTED | DEGRADED | 1 |
| HEALTHY | PROTECTED | HASH_FAILURE | DEGRADED | 1 |
| HEALTHY | PROTECTED | INCOMPLETE_SCAN | UNKNOWN | 2 |
| HEALTHY | PROTECTED | SOURCE_UNAVAILABLE | UNKNOWN | 2 |
| HEALTHY | PROTECTED | INTEGRITY_UNKNOWN | UNKNOWN | 2 |
| HEALTHY | NOT_ACTIVATED | — | DEGRADED | 1 |
| HEALTHY | ATTENTION_REQUIRED | — | DEGRADED | 1 |
| STALE | PROTECTED | — | DEGRADED | 1 |
| FAILED | anything | anything | FAILED | 1 |

`NOT_ACTIVATED` is **not** a pass. `UNKNOWN` never becomes a pass, and `FAILED` outranks `UNKNOWN`
because a known failure is more actionable than an indeterminate one. **There is no branch in which a
healthy backup or an available recovery generation converts an integrity failure into success** —
recovery being available is why the damage is survivable, not a reason it did not happen.

## 7A-ter. Live-byte evidence integrity (§315 / BR-9)

```
cd backend && node scripts/ops/verify-evidence-digest-integrity.js [--json <path>]
```

This is the authoritative answer to *do the bytes in the bucket still hash to what the database says*.
It reads and SHA-256 hashes **every** live authoritative object, and **there is no shallow mode** —
BR-8's own case is two payloads of equal length and different content, so any check that compares
sizes reports it as healthy. That is precisely why the §312 reconciler, which compares listed sizes
and recovery-generation digests, cannot see it, and why this exists alongside rather than inside it.

| state | meaning | exit |
|---|---|---|
| `INTEGRITY_HOLDS` | every active object hashes to its recorded digest | 0 |
| `DIGEST_MISMATCH` | live bytes disagree with the recorded digest | 1 |
| `ACTIVE_OBJECT_MISSING` | an active object's bytes are absent, with no authorized erasure | 1 |
| `RESURRECTED` | a retired object's bytes are present again | 1 |
| `HASH_FAILURE` | an object could not be read or hashed — never skipped | 1 |
| `INCOMPLETE_SCAN` | enumeration did not account for the whole population | 2 |
| `SOURCE_UNAVAILABLE` | the bucket could not be reached at all | 2 |
| `INTEGRITY_UNKNOWN` | the state could not be established | 2 |

**It never repairs anything.** If it reports `DIGEST_MISMATCH`, do **not** rewrite `sha256` to match
the bytes that are present: that makes the metadata agree with an overwrite rather than repairing one,
and destroys the only record of what the object was supposed to be. Restore the object from recovery
(§7B) or escalate.

**Ordering in the scheduled run is deliberate.** Integrity runs **before** reconciliation, because
reconciliation *captures* live bytes into recovery storage — running it first would faithfully copy
corruption into the recovery store as a new generation. If integrity does not hold, the capture is
skipped, the aggregate still runs so the alert is dispatched, and the run then exits non-zero.

**Cost is not the constraint; runtime is.** Measured against production (5 objects, 166,708 bytes):
~2.0 s per run, ~349 ms per request, 180 Class B operations per month, well under one cent per month
at R2 pricing — and R2 charges no egress. The scan is deliberately **sequential and streaming**, so
memory is bounded by the chunk size rather than the object or population size and exactly one read is
in flight at a time. The consequence is that runtime grows linearly: roughly **6 min at 1,000 objects,
29 min at 5,000, 70 min at 12,000**. That is acceptable for Beta and is *not* a reason to build
concurrency now, but it is the number to watch — past a few thousand objects the daily scan wants
governed concurrency or a rotating partial schedule, and that is a decision, not a refactor.

## 7B. Restoring one evidence object

```
cd backend
node scripts/ops/reconcile-evidence-recovery.js --restore <storageObjectId>
```

It refuses if an erasure tombstone exists, verifies the recovery bytes against the manifest digest
before writing anything, and writes a **local file**. Putting that file back into `insite-production`
is a separate, deliberate act using the application credential — the reconciler holds only read
access to the source, by design, so it *cannot* write to the customer bucket even if told to.

### Ordering for a full disaster recovery

The ordering is the safety property. Do not reorder it.

1. **Restore PostgreSQL** (§4 or §5) and complete §6 migration compatibility.
2. **Reconcile, report-only:** `node scripts/ops/reconcile-evidence-recovery.js --json /tmp/dr.json`.
   This changes nothing and gives you the state of every object.
3. **Read the erasure tombstones before restoring anything.** If the database was rolled back past a
   customer's deletion, the database is now wrong and the tombstones are right. Any object with a
   tombstone is `MISSING_LIVE_ERASURE_AUTHORIZED` and must not be resurrected — the tool enforces
   this, but an operator copying bytes by hand can defeat it, so read the list first.
4. **Restore only `MISSING_LIVE_RECOVERABLE` objects**, one at a time, verifying each digest.
5. **Do not run `--apply` until steps 3 and 4 are settled.** `--apply` is safe — it never deletes a
   recovery copy because a live object is absent — but running it first makes the report noisier.
6. **Re-run** `verify-object-consistency.js --deep` and the reconciler, and confirm `PROTECTED`.
7. **Re-run the §11 deletion reconciliation.** A restore can reinstate a deleted *account*; the
   evidence tombstones cover objects, not accounts.

### Missing object — a live row whose object is not in the bucket

**This is the serious direction.** The product will offer a customer a download it cannot serve.
After a restore to an earlier point it is the *expected* direction: restoring the database does not
un-delete an object removed after that point.

- **Do not fabricate a replacement.** There is no acceptable substitute for a piece of safety
  evidence, and a placeholder that looks like evidence is worse than a visible absence.
- Establish whether the object was deleted by a customer (`storage_objects.deletedAt` in the *current*
  production state, if it is still readable) or lost.
- Record each missing key in the incident note, and tell the affected customer plainly which evidence
  could not be recovered.

### Orphan object — an object with no live row

**This is inert, and that is a measured property rather than an assumption.** The product's only
download route resolves an object through a `storage_objects` row by UUID primary key, and
`objectKey` is `select: false` on the entity — no route anywhere accepts a caller-supplied key. An
unreferenced object is unreachable by every product path. After restoring to an earlier point, every
object uploaded since is an orphan and that is correct, not damage.

They still cost storage and still hold customer personal data, so list them in the incident note and
decide deliberately. **Do not bulk-delete them during the incident** — if the restore is later
reverted or partially re-applied, those objects become reachable again.

---

## 8. Verification — before declaring recovery

Run all of it. In order.

| # | check | pass condition |
|---|---|---|
| 1 | `select max(timestamp), count(*) from migrations` | matches §6's intended head |
| 2 | `DATABASE_URL=<restored> npx ts-node scripts/check-canonical-schema.ts` | 0 material differences |
| 3 | `node scripts/ops/verify-object-consistency.js --deep` | 0 missing, 0 checksum mismatches |
| 4 | `/health/ready` | `status: ready`, `dependencies.schema: current` |
| 5 | `/health/version` | `gitCommit` is the SHA you intended to serve |
| 6 | authenticate, then read `/sites`, `/inspections`, `/inspection-reports`, `/actions`, `/billing/me` | all 200, data present |
| 7 | `npm run ops:events` | no `error`-severity events since the cutover |

Check 6 is the one that actually answers "is the product working". §311 proved this exact sequence
against a restored database: boot to ready in 1.1 s, and every one of those routes returning the
fixture's real restored data.

> **`check:entity-contract` is NOT on this list, deliberately.** It is a *replay* gate: it compares
> entity metadata against a schema built from migration history, and it explicitly refuses to run
> against production. Pointing it at a production restore reports the two legacy `user` columns
> production has carried since §305 (`password`, `legacy_id`) and calls them unaccepted — which is a
> statement about the gate's scope, not about the restore. Use check 2 instead; that one is scoped to
> the enforced canonical schema and passes against a production restore.

---

## 9. Application source and SHA selection

A restored database has to be paired with a build that understands it.

1. The artifact's `.metadata.json` records `application.gitCommit` and
   `application.applicationSourceDigest` — the build that was live when the backup was taken.
2. If the currently deployed SHA is that one, deploy nothing.
3. If the restore went back past a migration, deploy the SHA from the metadata, not `main`. Deploy by
   **pinned commit** in the Render dashboard or API; auto-deploy is off on both halves and must stay
   off.
4. Recompute the digest to confirm what you are about to deploy, using the command recorded beside the
   value in `project-docs/preservation/v1-beta/release-manifest.json`.

**Measured deploy cost:** Render deploys of this service have taken **1.7–2.4 minutes** over the last
eight releases. Render's cutover overlaps the old and new instances, so a readiness read taken
immediately after "live" can still be answered by the old one — that is `OPS-2`, and the answer is to
read `/health/version` repeatedly until it is stable rather than to trust the first read.

---

## 10. Service cutover and DNS

**No DNS change is part of recovery, and that is worth knowing in advance.** The backend is reached at
its Render-assigned hostname and the frontend at its Vercel alias; neither is a custom domain, so
there is no propagation delay and no registrar step on the recovery path.

If the database endpoint itself changes — restoring into a new Neon branch rather than in place —
then the only change is the `DATABASE_URL` environment variable on the Render service, and:

- changing an environment variable on Render **restarts** the service but does **not** rebuild it;
- a restart alone is **not** proof the new value took effect. Read the value's *consequence* back
  from the running application (`/health/ready` reporting a schema position only the new database
  has). This is the §292 rule and it exists because a restart has been mistaken for proof before.

---

## 11. Customer-data deletion reconciliation

**This section is a legal obligation, not housekeeping.** Read it on every restore.

Account deletion in this product is a soft delete with anonymisation: the email is replaced, the
password hash is randomised, grants and refresh tokens are revoked, and `deletedAt` is set.

**A backup taken before a deletion still contains that person's pre-deletion data.** Restoring it
**reinstates** them. Under the retention policy in §12 the maximum exposure is the age of the oldest
retained artifact.

So after any restore:

1. List accounts that were deleted between the artifact's `takenAt` and now. The `security_audit_events`
   table records `action = 'account_deleted'` with the actor and a hash of the original email; that
   table is the authoritative list and it survives the deletion it describes.
2. For every account on that list that is **not** anonymised in the restored database, re-run the
   deletion through the product's own `DELETE /auth/me` path, or apply the same anonymisation
   directly. Do not invent a different anonymisation shape — use the one in `AuthService.deleteAccount`.
3. Record in the incident note which accounts were reinstated and re-deleted, and when. A deletion
   request that was honoured, silently undone by a restore, and never re-honoured is the failure this
   step exists to prevent.

> **A LATENT gap, registered at §311 as `BR-6`. It has not happened yet, and the numbers are the
> point.** Anonymisation writes through the `User` entity, so it can only clear columns the entity
> declares. The legacy `user.password` column — deliberately tolerated at §305 and excluded from
> schema enforcement — is not declared, and holds a bcrypt hash for **8 of 67** production accounts.
> Deleting one of those 8 would **not** clear it.
>
> **Measured at §311: of those 8, exactly 0 are deleted.** All 26 accounts deleted to date had a NULL
> `password`, so no deletion request has actually been left incomplete. The 8 are legacy accounts
> predating migration `1793000000000` — which copied `password` into `passwordHash` and left the
> source populated — across `example.com`, `gmail.com` and three `.local`/internal domains. Nothing
> has written the column since, and the `User` entity does not declare it, so **the population is
> frozen at 8 and cannot grow**; an external Beta customer's row will always have it NULL.
>
> So this is a bounded, pre-emptible gap rather than a live exposure: the values are bcrypt hashes
> and not plaintext, no code path reads the column, and clearing it before any of those 8 is ever
> deleted removes the possibility entirely. Until that one-statement migration is run, step 2 above
> should explicitly `update "user" set password = null` for any re-deleted account.

---

## 12. Retention, and what it means for how far back you can go

| | |
|---|---|
| Daily artifacts | **14 days** |
| Weekly artifacts (Sundays) | **8 weeks**, beyond the daily window |
| Neon Instant Restore | **6 hours** (Free plan) |
| Freshness threshold before an alert | **36 hours** |

Chosen for a Beta, deliberately modest, and balanced against §11: every additional week of retention
is an additional week during which a deleted customer's data still exists somewhere. It is not an
enterprise retention schedule and should not be turned into one without a reason.

---

## 13. Abort criteria — when to stop and not restore

Stop, revert nothing, and reassess if **any** of these becomes true:

- **§5.3 fails.** The artifact does not restore cleanly into a scratch database. Do not promote a
  backup that has not been proven — try the next-oldest artifact instead.
- **§5.1's counts are larger than expected.** If a restore would discard more customer work than the
  damage did, restoring is the worse outcome. Repair forward, or restore selectively.
- **The damage turns out to be a bad deploy.** Go to `ROLLBACK-MODEL.md`; do not touch the database.
- **The correct restore point cannot be established.** Restoring to a guessed instant destroys real
  work to fix a problem you have not located. Keep investigating.
- **The damage is confined to object storage.** A database restore cannot bring back an R2 object and
  will discard database writes for nothing. Handle it under §7 alone.

**If you abort after having already restored into a scratch database:** nothing has happened to
production. That is the whole reason §5.3 is mandatory.

---

## 14. After the incident

1. Write the incident note: what happened, the restore point chosen and why, the §5.1 counts, the §7
   missing and orphan lists, the §11 re-deletion list.
2. Run one full backup immediately (`node scripts/ops/backup-production-database.js`) so the first
   artifact after recovery is known-good and the freshness clock restarts.
3. Re-run §8 in full, once, a few hours later.
4. Register anything the runbook got wrong in
   [`PRE-PRODUCTION-RELEASE-REGISTER.md`](../current/PRE-PRODUCTION-RELEASE-REGISTER.md). A runbook
   that survives an incident unchanged has usually not been read carefully.

---

## The destination, as it actually exists — activated at §311A

| | |
|---|---|
| Bucket | **`insite-backups`** — private, no custom domain, no public development URL, no CORS |
| Location | Eastern North America (ENAM), Cloudflare's default placement |
| Prefix | `postgres/` — `evidence/` is reserved and **not yet authorized** |
| Credential | **`insite-backups-operator`**, R2 *Object Read & Write*, scoped to `insite-backups` **only** |
| Secret location | `~/.safety-insite/backup.env`, mode **600**, outside the repository, never tracked |
| Retention | 14 daily + 8 weekly Sundays, with a floor of the newest **3** artifacts |
| Cost | **$0.00** — inside R2's free allowance |

**The isolation is proven in both directions, not assumed.** The backup credential can write, read,
list and delete in `insite-backups`, and is refused **HTTP 403 AccessDenied** on every attempt to
list, read, write or delete in `insite-production`, to administer either bucket, to delete the backup
bucket, to list the account's buckets, or to create one. Reciprocally, the application credential
retains its `insite-production` object scope and is refused on `insite-backups`. Every refusal was
checked to be a genuine 403 — an ambiguous failure is never counted as a pass.

## Running a backup by hand

```
launchctl kickstart -p gui/$(id -u)/com.safety-insite.backup    # through the scheduler
# or, from a checkout:
cd backend && node scripts/ops/backup-production-database.js
```

## The scheduler, and its honest limit

Installed by `backend/scripts/ops/install-machine-local-scheduler.sh` as a launchd **user agent**,
`com.safety-insite.backup`, daily at **05:00 local**.

**The job payload does not run from the checkout, and that is not a preference.** macOS **TCC**
denies a launchd user agent access to `~/Desktop`, `~/Documents` and `~/Downloads`. §311A discovered
this the hard way — the first scheduled run exited **126, "Operation not permitted"** — and then
measured it with a diagnostic agent: the repository script could be `stat`-ed but **not read**, and
`~/Desktop` could not be listed at all. File permissions are irrelevant to this; `chmod 755` changes
nothing. The alternative, granting Full Disk Access to `/bin/bash`, would hand every script the user
ever runs the keys to the whole filesystem to fix one backup job.

So the installer copies the job into **`~/.safety-insite/runner/`**, which is not TCC-protected,
along with its single dependency and a recorded `applicationSourceDigest` (the runner is not a git
checkout, so the digest is computed at install time and artifacts honestly report
`RECORDED_AT_INSTALL` rather than `COMPUTED`).

| task | command |
|---|---|
| install / re-install | `backend/scripts/ops/install-machine-local-scheduler.sh` |
| **check for drift** | `… --verify` — compares runner hashes against the checkout |
| scheduler health | `launchctl print gui/$(id -u)/com.safety-insite.backup \| grep -E 'state\|runs\|last exit code'` |
| job log | `tail -40 ~/.safety-insite/logs/backup.log` |
| remove | `… --uninstall` |

> **Re-run the installer after changing any ops script.** The runner is a copy, and `--verify` is how
> you find out it has drifted.

### Why not GitHub Actions

§311 prepared a scheduled GitHub Actions workflow as the obvious alternative. **§311A removed it.**
The repository is **public** (`SE-21`), and putting the production database credential into the CI of
a public repository enlarges the production-secret trust boundary for no gain when an equivalent local
mechanism exists. GitHub does not expose secrets to forked pull requests and `schedule` only runs on
the default branch, so it would not have been reckless — it was simply unnecessary, and the smaller
boundary won. If the machine-local scheduler is ever outgrown, this is the decision to revisit, and
the residual risk below is the reason it might be.

### RPO residual risk — do not read this as a 24-hour SLA

launchd runs a missed `StartCalendarInterval` job at the **next wake**, so an overnight sleep does not
skip a day. It cannot run while the machine is **shut down**.

§311A measured this machine across the power log's full 8-day retention: **644 wake events, longest
continuous gap 16.0 hours, no day without a wake**, and 17 days of uninterrupted uptime with reboots
roughly monthly. On that evidence a daily job runs daily, and 05:00 was chosen because the 02:00–07:00
band showed wake activity on 6–7 of 8 days — the most consistent coverage of any hour.

**The residual is real and compounding**: an extended powered-off period violates the 24-hour RPO
**and simultaneously prevents the local freshness monitor from reporting that it has been violated**,
because both run on the same machine. The RPO is measured from **last successful backup**, not from
the scheduled invocation, so the violation is detectable — but only once the machine is awake again.
This is a Beta-appropriate posture, not a service-level guarantee, and it is registered as such.

## Backup health, and what each verdict means

`node scripts/ops/check-backup-freshness.js` — all five verdicts proven against the real destination:

| health | verdict | meaning | exit |
|---|---|---|---|
| **HEALTHY** | `FRESH` | a recent backup exists and the artifact it names is present at the recorded size | 0 |
| **STALE** | `STALE` | last success is older than `BACKUP_MAX_AGE_HOURS` (36h) | 1 |
| **FAILED** | `MISSING` | no freshness record at the prefix | 1 |
| **FAILED** | `ARTIFACT_ABSENT` | the record names an artifact that is not in the bucket | 1 |
| **FAILED** | `ARTIFACT_ALTERED` | the artifact is not the size the record claims | 1 |
| **UNKNOWN** | `UNKNOWN` | the check **could not see** the destination — bad credential, unreachable endpoint, unreadable record | 1 |

**`UNKNOWN` is never `HEALTHY`.** "There is no backup" and "I could not find out" are different facts
and are kept different: a 403 or a DNS failure reported as `MISSING` would send someone hunting for a
backup job that is working fine, and reported as healthy would be worse still.

Every non-healthy verdict pushes to `OPERATIONAL_ALERT_WEBHOOK_URL` — the existing **MO-1** channel,
proven at §311A with two real dispatches returning HTTP 200.
