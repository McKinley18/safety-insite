# HazLenz Knowledge Versioning and Rollback

Design phase only. Defines how knowledge is versioned independently of
application code, how a version is promoted, how production binds to one, and how
a bad version is rolled back without rewriting history.

---

## 1. The core idea

Application code and regulatory knowledge change for different reasons, at
different rates, with different risk. They must version separately:

```
production = application version X  +  knowledge version Y
```

A bad knowledge update must be revertible **without** reverting the application,
and without a deployment. Today that is not possible — see §2.

---

## 2. What exists, and the gap

### Exists

`regulatory_releases` (migration `1800000004000-RegulatoryReleaseGovernance.ts`):

```sql
"releaseId"        varchar(120) NOT NULL UNIQUE
"releaseVersion"   varchar(80)  NOT NULL
"status"           varchar(24)  NOT NULL DEFAULT 'draft'
"manifestChecksum" char(64)     NOT NULL
"parserVersion"    varchar(80)  NOT NULL
"recordCount"      integer      NOT NULL DEFAULT 0
"approvedBy"       varchar      NULL
"approvedAt"       timestamptz  NULL
"createdAt"        timestamptz  NOT NULL DEFAULT now()
```

`standards/seed/finalize-regulatory-release.ts` already does the hard part
correctly: it computes a sha256 per normalized record, folds those into a
`manifestChecksum`, and stamps every `standards_master` row with `release_id`,
`normalized_record_checksum`, `transformation_version`, `reviewer_approved` and
`applicability_schema_version`. Default release id today:
`federal-core-2026-07-30.1`.

### The gap — the loop does not close

Three findings, each verified against the tree at `5f050858`:

- **G3 — no lifecycle.** The finalizer writes `status='provisional'`. Nothing
  transitions it to active. `grep -rn "regulatory_releases" src` outside
  migrations returns exactly one hit: the finalizer's own `INSERT`.
- **G2 — nothing reads it.** `release_id` and `reviewer_approved` appear in
  non-migration, non-entity code only inside the finalizer's `UPDATE`. **No
  retrieval path filters standards by release or by approval.** Production reads
  whatever is in `standards_master`.
- **G1 — no binding on analyses.** `hazlenz_analyses` records `engineVersion`,
  `traceId` and `resultSnapshot`, but no knowledge release. Findings and reports
  carry none either.

Consequence: promoting or rolling back a release today would change **nothing**,
because production does not consume the release concept. The columns are a
faithful record of provenance; they are not yet a control surface.

---

## 3. Target model

### 3.1 Release identity

```
hazlenz-knowledge-2026.08.19.1
                 ^     ^  ^  ^
                 |     |  |  +-- iteration within the day
                 |     |  +----- day
                 |     +-------- month
                 +-------------- year
```

Aligns with the existing `releaseVersion` style (`2026-07-30.1`). The existing
`federal-core-*` naming can be retained as a `releaseFamily` so a knowledge
release can scope a subset of the corpus.

### 3.2 Release lifecycle

```
draft ──▶ candidate ──▶ validated ──▶ approved ──▶ active
                            │                        │
                            ▼                        ▼
                         rejected              superseded / rolled_back
```

| Status | Meaning | Production visibility |
|---|---|---|
| `draft` | assembling | none |
| `candidate` | complete, not yet validated | none |
| `validated` | all gates in architecture §8 passed | none |
| `approved` | human approval recorded (`approvedBy`, `approvedAt`) | none |
| `active` | **the pointer** — what production reads | **yes** |
| `superseded` | a later release became active | historical |
| `rolled_back` | was active, deliberately reverted | historical |

`status` already exists with `draft` and `provisional`. `provisional` maps to
`candidate`; the remaining states are additive.

**Exactly one release is `active` at a time**, enforced by a partial unique index:

```sql
CREATE UNIQUE INDEX uq_regulatory_release_active
  ON regulatory_releases ((status)) WHERE status = 'active';
```

### 3.3 Release record contents

Extending the existing table:

| Field | Status | Purpose |
|---|---|---|
| `releaseId`, `releaseVersion`, `status` | exists | identity, lifecycle |
| `manifestChecksum`, `parserVersion`, `recordCount` | exists | integrity |
| `approvedBy`, `approvedAt` | exists | approval record |
| `parentReleaseId` | **add** | rollback target and lineage |
| `changeSummaryJson` | **add** | candidate changes with change classes |
| `sourceManifestJson` | **add** | sources + checksums + retrieval dates |
| `validationResultsJson` | **add** | gate results as actually executed |
| `promotionReason` | **add** | why this was promoted |
| `autonomyLevel` | **add** | which level produced it (0–3) |
| `activatedAt`, `deactivatedAt` | **add** | when it was live |

`parentReleaseId` is what makes rollback a one-step operation: the rollback
target is recorded at promotion time, not reconstructed afterwards.

### 3.4 Production binding — the change that matters

Two changes turn provenance into control:

1. **Read path filters to the active release.** Standards retrieval resolves the
   active `releaseId` once per request (cached) and scopes queries to
   `release_id = :active AND reviewer_approved = true AND deprecation_status = 'active'`.
   This is the fix for **G2**, and it is the point at which a release actually
   governs behaviour.

2. **Analyses record the release they used.** Add `knowledgeReleaseId` to
   `hazlenz_analyses` alongside the existing `engineVersion`, and carry it into
   the finding and the generated report:

   ```ts
   @Column({ type: 'varchar', length: 120, nullable: true })
   knowledgeReleaseId: string | null;
   ```

   This is the fix for **G1**. It is small, additive, nullable, and it is what
   makes every past inspection explainable.

Once both exist, the audit chain in architecture §3 resolves end to end.

---

## 4. Promotion

```
candidate release
   -> validation gates (architecture §8)
   -> all hard blockers clear
   -> autonomy level decides:
        Level 0-2: human approval required        -> approved
        Level 3:   only checksum-neutral classes  -> approved automatically
   -> activate:
        BEGIN
          UPDATE regulatory_releases SET status='superseded', "deactivatedAt"=now()
            WHERE status='active';
          UPDATE regulatory_releases SET status='active', "activatedAt"=now()
            WHERE "releaseId"=:new;
        COMMIT
```

A single transaction moves the pointer. No standards rows are rewritten, no
application deploy occurs, and the previous release remains intact and
addressable.

---

## 5. Rollback

### Requirements, and how each is met

| Requirement | Mechanism |
|---|---|
| One operation restores the prior approved version | `parentReleaseId` is recorded at promotion; rollback re-activates it in one transaction |
| Historical inspections retain the version they used | `hazlenz_analyses.knowledgeReleaseId` is written once and never updated |
| Rollback does not silently rewrite historical findings | Findings are immutable; `resultSnapshot` is a snapshot. Rollback changes **future** analyses only |
| Reports remain explainable later | The report cites its release; that release row and its standards rows are retained permanently |
| New analyses use the restored version | The read path resolves the active pointer per request |
| Rollback is audited | Rollback writes a `knowledge_release_events` row: actor, timestamp, from/to release, reason |

### Operation

```
rollback(releaseId R):
  assert R.status in ('superseded','rolled_back')     # was previously active
  assert R.manifestChecksum verifies against its records
  BEGIN
    UPDATE ... SET status='rolled_back', "deactivatedAt"=now() WHERE status='active';
    UPDATE ... SET status='active', "activatedAt"=now() WHERE "releaseId"=R;
    INSERT INTO knowledge_release_events (event, fromReleaseId, toReleaseId, actor, reason, at)
      VALUES ('rollback', :previouslyActive, R, :actor, :reason, now());
  COMMIT
```

**Never deleted, only retired.** Superseded and rolled-back releases and their
standards rows are retained indefinitely. A report generated in 2026 must still
be explainable in 2031, which means the exact knowledge that produced it must
still exist. This is also why supersession retires rather than removes a unit.

### What rollback deliberately does *not* do

It does not regenerate past analyses. A finding produced under release Y stays as
it was, labelled with Y. Retroactively rewriting a historical safety finding
would destroy the audit trail — the opposite of the goal. If a rolled-back
release produced materially wrong findings, that is a **notification** problem
(surface the affected inspections and their release) and a human decision, not
an automatic rewrite.

---

## 6. Storage and retention

| Artifact | Retention | Why |
|---|---|---|
| Raw retrieved documents | permanent | verbatim anchor checks; audit |
| Per-release normalized records | permanent | explainability of historical reports |
| Release rows and events | permanent | audit |
| Ingestion run telemetry | bounded (e.g. 24 months) | operational, not evidential |

Growth is dominated by raw regulatory text, which is small and highly
compressible. Retention is not a meaningful cost driver at this corpus size.

---

## 7. Sequencing note

The two additive changes in §3.4 — `knowledgeReleaseId` on analyses, and a read
path scoped to the active release — are the foundation for everything else in
this architecture. Neither requires any autonomy, any model, or any new
acquisition. Both are small, reversible and independently testable. They are
backlog items **KG-1** and **KG-2**, and they are the smallest safe first slice.
