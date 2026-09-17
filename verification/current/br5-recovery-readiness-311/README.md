# §311 — `BR-5` backup, retention and disaster-recovery readiness

Evidence for the §311 determination that `BR-5` is **ENGINEERING COMPLETE** and blocked on a
product-owner credential action rather than on further engineering.

`SECTION-311-BR5-RECOVERY-READINESS.json` is the machine-readable record and answers every question
§311 posed. The numbered files are the raw outputs it summarises.

| file | what it shows |
|---|---|
| `01-FRESH-BACKUP.txt` | A fresh production backup taken through the proposed mechanism: 7 898 796 bytes, sha256 `368fa047…`, schema head `1800000026000`, upload **read back and re-hashed** |
| `02-RESTORE-VERIFICATION.txt` / `.json` | That artifact restored into a **freshly created empty** PostgreSQL 17.11 — 78/78 tables content-identical, aggregate digest `e093a62f81ac4d9e49011c43b5489f07` on both sides |
| `03-OBJECT-CONSISTENCY-PRODUCTION.txt` / `.json` | Production database reconciled against the production R2 bucket, **deep**: 5 live rows, 5 objects, every one verified by full sha256 download. 0 missing, 0 orphans |
| `04-MUTATION-CONTROLS.txt` | **The instruments watched to fail.** One character in one row turns the content comparison red; a fabricated ledger row and a tombstone produce a missing object and an orphan; all five freshness verdicts reached |
| `05-GATE-CANONICAL-SCHEMA-ON-RESTORE.txt` | Canonical-schema gate **PASS** against the restored production database — 68 tables, 0 material differences |
| `06-GATE-CANONICAL-SCHEMA-REPLAY.txt` | The same gate in its own disposable-replay harness — **PASS**, digest `34712ba8…` |
| `07-GATE-ENTITY-CONTRACT-REPLAY.txt` | Entity-contract gate in its own harness — **PASS**, 57 entities, 12 accepted (the SC-4 residuals), **0 unaccepted** |
| `08-GATE-ENTITY-CONTRACT-REFUSES-PRODUCTION.txt` | The entity-contract gate **refusing** to run against production. Recorded because it explains why there is no "entity-contract result on production": the gate is a *replay* gate by design, and §311 did not weaken it to obtain a number |
| `09-RESTORED-APPLICATION-WORKFLOW.txt` | The application booted against the restored database and serving the individual Beta workflow — sites, inspections, reports, revisions, corrective actions, billing state. All 200, **zero 5xx** |

## What these artifacts deliberately do not claim

**The destination is disposable.** The fresh backup was uploaded to a local MinIO container, not to a
durable bucket, because no durable bucket exists yet — that is precisely `BR-5`'s remainder. The
mechanism is proven; the destination is an owner credential action.

**Every duration is local.** Backup 6.0 s, restore 0.5 s, verification 4.8 s, application boot 1.1 s
were all measured against a local PostgreSQL 17.11 container. A restore into Neon over the network
has **not** been timed and no claim is made about it.

**The object half is unassessed.** R2 versioning, lifecycle and object lock could not be read — the
application credential is denied every bucket-administration call and there was no authenticated
Cloudflare session to use. That is `ST-4`, and it is the second reason `BR-5` cannot close.

## Production safety

0 provider calls · 0 Expert executions · $0 · 0 production schema mutations · 0 production customer
rows modified · 0 production configuration changes · 0 objects created, altered or deleted.

Production PostgreSQL and R2 were **read**. The Neon console was **read** from the owner's existing
session; nothing was changed and no snapshot was created. Cloudflare was not logged in to. Every
mutation in this section happened inside a disposable local container.
