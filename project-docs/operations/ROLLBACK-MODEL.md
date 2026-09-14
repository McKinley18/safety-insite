# ROLLBACK MODEL — Safety InSite v1.0

Established at **§268**. Companion to `BETA_DEPLOYMENT_RUNBOOK.md`.

---

## The rule that outranks every other consideration here

> **A database rollback must never destroy human settlements or Expert analyses in order to restore
> older application code.**

A `human_reviews` settlement row is a record of a named person's decision about a workplace hazard.
An Expert analysis is the evidence that decision was made against. Neither is recoverable by
re-running anything, and neither exists to serve the application version that happens to be
deployed. Restoring last week's code is never a good enough reason to delete either.

Everything below follows from that.

---

## The four rollback surfaces, and how each actually works

| surface | mechanism | destructive? | notes |
|---|---|---|---|
| **Frontend** | redeploy the previous Vercel deployment | no | independent of the backend; the Expert panel degrades honestly if the backend is older |
| **Backend code** | redeploy the previous image / commit | no | **the primary lever** |
| **Expert feature** | `EXPERT_EXECUTION_ENABLED=false` | no | seconds, no redeploy, no data change |
| **Database schema** | migration `DOWN` | **YES — see below** | **not the rollback path** |

**Reach for them in that order of narrowness.** Most incidents involving Expert are fixed by the
third row, which costs nothing and touches no data.

---

## Application rollback is safe because the schema is forward-compatible

The migrations in the current backlog are **additive**. §289 added a fourth,
`1800000022000 CorrectiveActionLifecycle` (three nullable columns on `corrective_actions` plus two
indexes), which is additive on the same terms and whose `down()` drops columns that carry no data
before the migration:

| migration | what it does | is the previous app version broken by it? |
|---|---|---|
| `1800000019000` ExpertAnalysisAuthorityFoundation | adds four nullable columns to `hazlenz_analyses`, creates `expert_analysis_executions`, adds a CHECK | **No.** Older code does not select the new columns; they are nullable and defaulted. |
| `1800000020000` ExpertHumanConfirmation | widens `human_reviews.decision` to `varchar(32)`, replaces its CHECK, adds `settlementReviewId`, adds a partial unique index | **No.** Widening a column and adding permitted enum values are both backward-compatible. |
| `1800000021000` ProducerScopedAnalysisCurrentness | replaces `uq_hazlenz_analysis_current` with `uq_hazlenz_analysis_current_by_producer` | **No — but read the caveat.** |

So: **roll the application backward and leave the schema forward.** That is the supported path, and
it is why `/health/ready` treats a database that is AHEAD of the running build as READY rather than
as a fault — a code rollback onto a forward-migrated database is a normal, expected state, not an
error condition.

### The one caveat, stated plainly

`1800000021000` **relaxes** a constraint: it permits one current analysis *per producer* where the
old index permitted one *per observation*. Rolling application code back to a version that predates
§267 while the relaxed index remains means:

- the old code's "newest non-superseded analysis" query can now legitimately find **two** rows
  (one deterministic, one Expert) where it previously could only find one;
- it will pick whichever sorts newest, which after an Expert run is the Expert row —
  **reintroducing the §266 P0-2 defect for as long as the rollback lasts.**

This does not corrupt data and nothing is lost. But a rollback past §267 is **not** a clean
restoration of prior behaviour, and if it is ever done, `EXPERT_EXECUTION_ENABLED=false` should be
set at the same time so no new Expert analysis is created to be mis-selected.

---

## Migration `DOWN` in production: policy

> **Production rollback is NOT defined as "run every DOWN."**

`DOWN` paths exist for local development and for reverting a migration that has not yet met real
data. Once beta data exists they are, in practice, **forward-only**:

| migration | `DOWN` behaviour with real beta data | classification |
|---|---|---|
| `1800000019000` | drops `expert_analysis_executions` and four columns — **destroys every Expert analysis's provenance and every execution record, including cost accounting** | **FORWARD-ONLY** |
| `1800000020000` | already refuses when settlements exist (§264 built this in) — and where it does not refuse it would narrow `decision` back to `varchar(24)`, which cannot hold `classification_confirmed` | **FORWARD-ONLY**, self-enforcing |
| `1800000021000` | recreates the stricter single-current index; **fails** on any observation carrying both a current deterministic and a current Expert analysis — which is the normal state after any Expert run | **FORWARD-ONLY in practice**, self-enforcing |

**Two of the three refuse on their own**, which is the design §264 established and §267 continued:
a `DOWN` that would destroy a human decision fails rather than succeeding quietly. `1800000019000`
does not self-enforce, and its `DOWN` must simply never be run against a database that has served
beta traffic.

### If the schema genuinely must go backward

Restore the pre-deployment backup taken at runbook step 3. That is the only path that is both
complete and honest about what it costs: **every write since the backup is lost**, which is a
decision for the product owner, not an operational convenience.

---

## Rollback decision table

| symptom | first action | why |
|---|---|---|
| Expert analyses failing or costing too much | `EXPERT_EXECUTION_ENABLED=false` | narrowest lever; deterministic workflow keeps working |
| A workspace is consuming too much | lower `EXPERT_DAILY_*` limits | takes effect on the next request, no restart |
| New backend version is broken, schema is fine | redeploy the previous backend commit | schema is forward-compatible |
| `/health/ready` reports `schema: behind` | run `npm run migrate:prod`, then re-check | the deploy raced ahead of migrations |
| Migration failed mid-release | **do not deploy**; each migration is its own transaction, so none is half-applied | diagnose, then fix forward or restore the backup |
| Data corruption | restore the step-3 backup | accept the documented write loss deliberately |

---

## What is NOT established here

**Corrected at §289.** The production database is **Neon**, not Render. The Render account
contains no Postgres instance.

`BACKUPS_AND_RETENTION` is now split in two, because the original entry ran two different questions
together:

* **Does a restorable backup exist?** — **YES, and it is proven.** §269 and §289 both took a full
  logical backup of live production and rehearsed a restore. §289 verified the restore by per-table
  content checksum against a PostgreSQL 17.11 target: all 76 tables identical. The restore path
  above is no longer written against a backup this repository cannot confirm exists.
* **What does the platform retain?** — **UNREAD.** Neon's control plane was unreachable from both
  sections; there is no `NEON_*` credential. The history-retention window and the PITR setting are
  unknown. Register entry `BR-2`.

The §289 rehearsal also exercised this document's central claim directly: all four `down()` paths
executed cleanly and restored the pre-migration content **exactly** — on a database with zero Expert
analyses and zero settlements. That is production today. It is not production after use, and it is
why the forward-only policy below stands unchanged.

**Before the first beta user enters data, the following must be confirmed once against the live
platform** and recorded:

1. database backups are enabled, and their frequency and retention are known;
2. a restore has been performed at least once, into a scratch database, so the path is known to work
   rather than assumed to;
3. object-storage retention and deletion behaviour are known;
4. account deletion's documented behaviour — inspection content is **retained** by design
   (`auth.service.ts`), which is correct for a compliance record and **must be disclosed** in the
   privacy notice.
