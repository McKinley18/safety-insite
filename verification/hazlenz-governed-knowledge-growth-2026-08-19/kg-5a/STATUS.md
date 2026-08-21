# KG-5A — Release packaging and production governed-release readiness

**Date:** 2026-08-21 · **Start HEAD:** `5f050858227ca11cf90d2f6bf64148e70a018b64` · **End HEAD:** unchanged
**Branch:** `release/insite-rc-2026-08-18` · **Nothing committed, pushed, merged, deployed or activated.**
**Verdict:** `KG_5A_COMPLETE — PRODUCTION_RELEASE_PACKAGE_NOT_READY`

Production was read **read-only** only (Render CLI/API; a Postgres session opened with
`SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY`). No production configuration, schema, corpus
or release was changed.

---

## 1 — Worktree classification (Phase 0)

582 paths, expanded from the 114 `git status` entries. **Zero left `UNKNOWN_REQUIRES_INSPECTION`.**
Machine-readable: `contracts/worktree-classification.json`.

| Class | Count |
|---|---|
| `KG_VERIFICATION_ONLY` | 495 |
| `KG_RELEASE_REQUIRED` | 54 |
| `UNRELATED_FRONTEND_THEME_WORK` | 18 |
| `UNRELATED_OTHER` | 13 |
| `BLUEPRINT_DOCUMENTATION` | 2 |

Classification was by content, not filename. The 18 theme files were confirmed unrelated by showing
that every apparent KG token in their diffs is a Tailwind `shadow-*` utility class. Two modified
suites (`test-canonical-workflow.ts`, `test-private-storage-reports.ts`) carry only retired-Expert-tier
repairs with no KG dependency and are excluded; `grant-test-entitlement.ts` carries the same repair but
**is** a dependency of `test:knowledge-release-provenance`, so it ships as verification infrastructure.

### One mixed-purpose file `KG5A-DISC-02`

`frontend-next/app/inspection-workspace/page.tsx` is otherwise wholly KG-3C/3D, but one hunk adds an
unrelated `<option value="unknown" disabled>Select regulatory context</option>` placeholder. The
packaged tree **excludes that single line**, so the KG commit needs a hunk-level exclusion on this one
file rather than whole-file staging.

## 2 — The KG release boundary (Phase 1)

54 files. 33 untracked (14 `standards/cutover/`, 11 `standards/releases/`, 5 KG migrations,
`standards/display/standards-backing-contract.ts`, `citation-structure.ts`,
`knowledge-release-provenance.ts`), 19 modified backend, 3 modified KG frontend (see §7),
2 operational CLIs (`review-regulatory-release-record.ts`, `report-corpus-migration-inventory.ts`).

**No dependency change of any kind.** `backend/package.json`'s diff is 58 lines of KG script entries
and nothing else; `ts-node` remains a devDependency, so the 56 verification scripts are inert in a
production image.

## 3 — Commit plan (Phase 3)

Derived from the real import graph (`contracts/kg-import-graph.json`), not from a template.

| Commit | Content | Depends on |
|---|---|---|
| **A** | 5 KG migrations · `standards/releases/*` · provenance persistence (`knowledge-release-provenance.ts`, both inspection entities, `inspection.service.ts` gate) · `data-source.ts` entity registration · `finalize-regulatory-release.ts` | — |
| **B** | `citation-structure.ts` · `standards/display/standards-backing-contract.ts` · corpus/evidence work (`standards-intelligence.seed.ts`, `evidence-foundation.ts`, `shared-evidence-facts.ts`, `guided-finding-response.ts`, `hazlenz-evidence-boundary.ts`) | A |
| **C** | `standards/cutover/` core — `cutover-mode` (imports nothing), `fallback-contract`, `governed-resolution`, `governed-cutover-context`, `governed-provenance`, `cutover-observability`, `shadow-comparison` | A, B |
| **D** | KG-4C/4D operational safety + the one integration boundary — `production-shadow-authorization`, `shadow-circuit-breaker`, `shadow-operational-metrics`, `shadow-provenance-invariant`, `customer-output-invariance`, `shadow-telemetry-sink`, `shadow-request-orchestration`, plus the customer-path edits that import them (`safescope-v2.controller.ts`, `safescope-v2.service.ts`, `applicable-standards.service.ts`, `validate-production-environment.ts`, `canonical-reports.service.ts`) | C |
| **E** | KG frontend display contract — 3 files, with the KG5A-DISC-02 hunk excluded | B (payload shape only) |
| **F** | `package.json` scripts · 56 verification scripts · `scripts/lib/test-database-ownership.ts` · frontend unit test · `docs/` · `verification/` evidence | A–E |

**A+B were proven to build with the entire cutover subsystem absent** (`tsc` exit 0 against a tree with
`standards/cutover/` deleted and the five integration files reverted to HEAD). The customer-path files
in D cannot move earlier: five of them import `standards/cutover/` directly.

## 4 — Clean-tree reproduction (Phase 4)

An isolated tree was built with `git archive HEAD | tar -x` — **no git metadata was mutated** — and the
54 KG files plus verification scripts and evidence were overlaid. Diffing that tree against HEAD shows
exactly **22 modified tracked files and zero theme files**.

| Gate | Packaged tree |
|---|---|
| backend `npm run build` | exit 0 |
| `frontend-next npx tsc --noEmit` | exit 0 |
| `test:kg3f-retrieval-determinism` (9 layouts) | 170/170 |
| `test:kg3f-ranking-adversarial` | 54/54 |
| `test:kg3e-citation-granularity` | 48/48 |
| `test:kg3f-56-14132-predicate` | 16/16 |
| `test:kg3f-shadow-invariance` | 7/7 |
| `test:approval-contract` | 57/57 |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4a-governed-resolution` | 99/99 |
| `test:kg4a-provenance-pinning` | 53/53 |
| `test:kg4a-default-off` | 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg4b-shadow-adversarial` | 84/84 |
| `test:kg4b-shadow-determinism` (7 layouts) | 18/18 |
| `test:kg4b-privacy-review` | 26/26 |
| `test:kg4c-production-shadow-contract` | 438/438 |
| `test:kg4c-disabled-deployment` | 80/80 |
| `test:kg4c-db-ownership` | 31/31 |
| `test:kg4d-orchestration` | 151/151 |
| `test:kg4d-default-off` | 119/119 |
| `test:kg4d-db-ownership-blackbox` | 19/19 |
| `test:kg4e-report-field-exclusion` | 9/9 · 41/41 byte-identical |
| `test:kg4e-report-provenance` | 32/32 |
| `test:kg4e-telemetry-privacy-v2` | 24/24 safe, 0 outside the v2 allowlist |
| `compare:kg4e-report-invariance` | 8/8 invariant, 0 forbidden terms |

**No unexplained regression.** Every mutating suite created and dropped its own `test_*` database.
`test:kg3f-customer-path-disconnection` needs a database and was not re-run; it is KG-3F evidence and
D-38 already supersedes it with the mode-aware default-off suites, both of which reproduce here.

## 5 — The six migrations (Phases 5–6)

Read from source, not inferred. **Every `up()` is additive DDL with no data backfill of any kind**:
`ADD COLUMN IF NOT EXISTS` (all nullable, no defaults, so no table rewrite), `CREATE TABLE IF NOT
EXISTS`, `CREATE INDEX IF NOT EXISTS`, one `CHECK` constraint. The only `UPDATE` in the set lives in
`1800000011000`'s **`down()`**, not its `up()`.

| Migration | Effect | Reversible |
|---|---|---|
| `1800000009000` InspectionRegulatoryContext | `inspection.regulatoryContext varchar(32) NULL` | yes |
| `1800000010000` KnowledgeReleaseProvenance | `knowledgeReleaseId varchar(120) NULL` on `hazlenz_analyses` and `inspection_findings` | yes |
| `1800000011000` RegulatoryReleaseLifecycle | 3 nullable columns on `regulatory_releases`; status `CHECK`; partial unique index `uq_regulatory_release_active`; new table `knowledge_release_events` + index | yes |
| `1800000012000` RegulatoryReleaseRecords | new table `regulatory_release_records` + 3 indexes | yes |
| `1800000013000` RegulatoryReleaseRecordReviews | new table `regulatory_release_record_reviews` + 2 indexes | yes |
| `1800000014000` ApprovalProvenanceContract | 5 nullable columns on records, 5 on reviews, 2 indexes | yes |

### Rehearsal

`test_kg5a_prodshape_20260821` was built to production's exact pre-KG shape — the first **40**
migrations, latest `RefreshTokens1800000008000`, `regulatory_releases` present with no records/reviews
tables, no `knowledgeReleaseId`, no `inspection.regulatoryContext` — then populated with synthetic
production-shaped rows (no customer PII; `.invalid` addresses) including a deliberately `active`
release row to exercise the lifecycle constraint.

* all six applied cleanly, in order;
* **data fingerprint byte-identical before and after** (`bd7a75cb38cca6b04f271fb854806646`);
* 46 migrations recorded; 0 invalid indexes; 0 unvalidated constraints;
* re-run reports `No migrations are pending` — idempotent;
* revert of `1800000014000` then `1800000013000`, then forward again, restores the same fingerprint.

Locks are brief `ACCESS EXCLUSIVE` on `ALTER TABLE`; with production at 1 analysis, 1 finding, 0
releases and 2,390 corpus rows (none of which these migrations touch), duration is sub-second.
No application code requires any of them at startup — `test:kg4c-disabled-deployment` (80/80) proves
LEGACY never reads the active-release pointer.

**Exact command:** `DATABASE_URL=<production> npm run migration:run` from `backend/`. There is no
`migration:revert` script; reverting uses
`npx typeorm-ts-node-commonjs -d src/database/data-source.ts migration:revert`.

## 6 — The initial governed corpus, and why it cannot be built in production today (Phases 7–8, 11–12)

**The candidate release is `federal-core-2026-07-30.1`: 35 records, manifest
`14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`.** Re-finalizing it on a clean
production-schema database reproduces that checksum byte-identically, with `recordCount 35`,
`placeholderSourceRecords 0` and `reviewer_approved 0`. It covers **23 of 23** emitted gold-set
citations, all `CORPUS_BACKED` and `SOURCED`, with 12 records of headroom.

### `KG5A-DISC-01` — the release cannot be derived from production `standards_master`

`finalize-regulatory-release.ts` selects `FROM standards_master` with **no `WHERE` clause**: release
membership is the whole table. Production's table is 2,390 rows of full-text eCFR dumps with
**`source_key` NULL on all 2,390**, so Axis B of the approval contract is unsatisfiable from them.
Reconciling the 35 governed citations against it (`contracts/production-standards-reconciliation.json`):

| Classification | Count |
|---|---|
| `PRODUCTION_ROW_IDENTICAL` | **0** |
| `PRODUCTION_ROW_CONTENT_DIFFERS` | 18 |
| `PRODUCTION_ROW_MISSING` | 17 |
| `AMBIGUOUS_MULTIPLE_ROWS` | 0 |

The differences are structural, not drift: production carries the full section text (56,026 bytes for
`1910.1200`) where the governed record carries the reviewed, clause-accurate 1,141-byte artifact.
An independent dry run of the sync against a pristine copy of the production corpus predicts
**17 inserts and 18 updates** — the same 17/18 split, by a second method.

Two consequences, both measured on disposable copies of the real production corpus:

1. **Running `seed:safescope-standards` in production would mutate the live customer corpus.** It
   rewrote `standard_text` and `title` on five pre-existing rows (`1910.146`, `1910.219`, `1910.36`,
   `30 CFR 56.12016`, `30 CFR 56.14105`) before failing. Those rows are read by the LEGACY retrieval
   path, so this is a customer-visible change made *before* any cutover — it breaks the
   deploy-with-SHADOW-off no-op property outright.
2. **It also crashes.** Stage 1 inserts `29 CFR 1910.147`; stage 2's normalized matcher then tries to
   rename production's pre-existing bare `1910.147` to the same string and collides with the unique
   index `(agency_code, citation)`. It fails at the same point on every re-run — **not idempotent, no
   transaction, left the corpus half-seeded at 2,396 rows with a duplicate citation pair.** On a clean
   corpus the same seed is idempotent (`Inserted 0, Updated 35`) and correctly refuses to re-finalize
   an active release, so the defect is specific to a non-empty, differently-formatted corpus — which
   is exactly production.

**There is therefore no safe path today from production's corpus to a governed release.** Closing it
needs a KG-5B slice: release membership scoped to sourced/governed rows rather than the whole table,
plus a citation-format reconciliation that cannot create duplicates or rewrite live rows.

### Blocker B4, measured both ways

Same 35 citations, same legacy inputs taken from the same database's live `standards_master`; the only
variable is the active pointer.

| | No active release | Release active |
|---|---|---|
| comparisons | 35 | 35 |
| `resolverHealth` | `NO_ACTIVE_RELEASE` ×35 | `OK` ×35 |
| `governedBackingState` | `NO_ACTIVE_RELEASE` ×35 | `APPROVED_EXACT` ×35 |
| mismatch | `RESOLVER_FAILURE` ×35 | `EXACT_MATCH` ×35 |
| severity | `REVIEW` ×35 | `INFORMATIONAL` ×35 |
| BLOCKING | 0 | 0 |
| `customerOutputUnchanged` | true | true |

The left column reproduces the production preflight finding exactly — a 100 % resolver-failure rate
against a 2 % stop threshold. The right column shows the release solves it. **The right column is only
reachable on a corpus that has been replaced by the governed rows**, which is the very step §6 shows is
unsafe in production.

## 7 — Approval semantics (Phase 9)

Every existing reviewer decision — all 35 in the KG-4B corpus, all 41 in the remediation corpus — has
`approvalDigest` **NULL**. They are pre-contract (v1) decisions bound only by `recordChecksum`. §7's
NULL semantics are `STABLE_INVARIANT` and D-17 forbids backfilling them, so **no existing decision can
be imported into production as a v2 approval.** The KG-4B corpus's decisions additionally carry the
synthetic reviewer id `kg4b-shadow-reviewer`, which is a verification artifact and not a person.

The records, by contrast, carry full v2 identity, and the rehearsed production release reproduces
**`approvalDigest` identically on 35 of 35 records** against the KG-4B corpus. So:

> **Production approvals are newly appended, one record at a time, by a named human, using the recorded
> KG-3D/3E/4A clause-by-clause comparison as the evidence they are confirming — never imported,
> never backfilled, never bulk.**

Rehearsed end to end: 35 approvals appended through `npm run review:release-record -- approve` with
`--expected-checksum`; 35/35 carry `approvalContractVersion 2` and an `approvalDigest` that matches the
record's; a deliberately wrong checksum is refused with `checksumMatches`. Activation then passed all
**8** gates, including `manifestChecksumVerifies` and `governedRecordsPresent`. The gate needs
`governedRecords > 0`, not 100 %, so the eight `NEW_REVIEW_REQUIRED` records may remain unapproved.

`PRODUCTION_RELEASE_REVIEW_PACKET.md` carries the per-record recommendation: **27 REATTEST, 8
NEW_REVIEW_REQUIRED, 0 EXCLUDE**. The eight are exactly the records KG-3D deferred and KG-3E carried
forward as unsourced, and none of the eight is in the 23-citation emitted set.

## 8 — Deployment no-op proof for the exact packaged tree (Phase 16)

The packaged backend was started on port 4350 against `test_kg5a_clean_20260821` — which holds an
**active** governed release with 35 approved records — with **zero** `GOVERNED_CUTOVER_*` variables set.

* startup clean; `/health` → `{"status":"ok","database":"up"}`;
* register, login, entitlement grant and an authenticated call all succeed;
* a representative scaffold/fall observation returned a real **84,442-byte** analysis carrying
  `29 CFR 1926.451(g)(1)`, `29 CFR 1926.501`, `29 CFR 1910.28(b)(1)` and others;
* **0 governed keys** in the payload (`governedDeliveryState`, `governedFallbackReason`,
  `governedTextUnavailable`, `knowledgeReleaseId` all absent);
* **0** `kg4c.shadow-comparison.v2` events, **0** v1 events, **0** cutover observability lines;
* `backingStatus` is emitted and takes only `CITATION_ONLY` and `UNAPPROVED_CONTENT` —
  **`APPROVED_GOVERNED_CONTENT` never appears**, so an active release with 35 approved records
  changed nothing a customer can see;
* no governed provenance written: `knowledgeReleaseId` non-NULL count is 0 on both tables.

> **An active governed release does not alter customer output.** That is the property Phase 11 asks for
> and it is now measured against the tree that would actually ship.

## 9 — Rollback (Phase 17)

| Layer | Mechanism | Needs |
|---|---|---|
| Code | redeploy the prior commit (`97941ca2`) from `main` | code redeploy |
| Schema | **nothing.** All six migrations are additive and nullable, so `97941ca2` runs unchanged against the migrated schema — it simply never reads the new tables or columns. Forward-compatible by construction; a downgrade is available (`migration:revert`) but is not required and should not be the plan | no DB action |
| Governed release | `RegulatoryReleaseLifecycleService.rollbackTo(<exact releaseId>)`, or simply never activate. Nothing is deleted; historical provenance stays resolvable | release pointer operation |
| SHADOW | remains OFF throughout this deployment; if ever enabled, `GOVERNED_CUTOVER_KILL_SWITCH=<any non-empty>` or `GOVERNED_CUTOVER_MODE=LEGACY` | environment change + platform restart |

`KG5A-DISC-03`: **there is no operator CLI for release activation or rollback.** `activate()` and
`rollbackTo()` exist only as service methods; KG-5A drove them from an ad-hoc rehearsal script. A
production activation therefore has no reviewed command today. This is a packaging gap, not a design
gap, and it belongs to the slice that performs Operation 8.

## 10 — Branch and frontend scope (Phases 14–15)

**Recommendation: Option A — merge to `main`.** Render's `safety-insite-backend` auto-deploys `main` on
commit, `main` is exactly the live commit `97941ca2`, and the release branch is already pushed and in
sync with its upstream. Merging keeps the normal workflow, keeps rollback as an ordinary redeploy of a
`main` ancestor, and reconciles the four unshipped release-branch commits in the same reviewed step.
Option B (repointing Render at the release branch) would leave `main` permanently behind production and
make every future rollback a branch decision. Nothing in the evidence favours B. **No Render
configuration was changed.**

**Frontend:** 3 KG files (`lib/inspection/standardDisplay.ts`,
`components/inspection/SafeScopeStandardsSection.tsx`, `app/inspection-workspace/page.tsx`) versus 18
theme files, which do **not** ship. Stage-1 SHADOW needs no frontend deployment — SHADOW is
customer-invisible and `APPROVED_GOVERNED_CONTENT` is unreachable outside a governed delivery mode.
But the backend deployment itself starts emitting `backingStatus: CITATION_ONLY`, and the KG-3C frontend
is what turns that state into an honest notice instead of rendering a match rationale under a
"HazLenz standard summary" label. **Ship the 3 KG frontend files with the backend; leave the 18 theme
files for a separate decision.**

## 11 — Exact future operation sequence (Phase 18)

None of these was executed. Each needs its own explicit authorization.

| # | Operation | Gate |
|---|---|---|
| 1 | Commit the KG release package (A–F), excluding theme work and the KG5A-DISC-02 hunk | authorization |
| 2 | Push `release/insite-rc-2026-08-18` | authorization |
| 3 | Merge to `main` | authorization |
| 4 | `DATABASE_URL=<production> npm run migration:run` — the six migrations | authorization |
| 5 | Deploy with every `GOVERNED_CUTOVER_*` absent (automatic from `main`) | authorization for the merge that causes it |
| 6 | Verify production LEGACY/no-op — §8's checklist against production | — |
| 7 | Create and finalize the reviewed production governed release | authorization **and KG-5B**, see below |
| 8 | Activate it while SHADOW stays OFF | authorization; no CLI exists yet (KG5A-DISC-03) |
| 9 | Re-verify LEGACY/no-op | — |

**Operations 1–6 and 9 are ready now.** Operations 7 and 8 are **not**: KG5A-DISC-01 shows the seed
pipeline cannot build a production release without mutating the live corpus and crashing, and
KG5A-DISC-03 shows activation has no reviewed command. Both belong to KG-5B.

## 12 — KG4E-DISC-03 (Phase 19)

Untouched. Classification `MUST_FIX_BEFORE_CUSTOMER_GOVERNED_DELIVERY` preserved. Not a Stage-1 SHADOW
blocker and it did not block packaging.

## 13 — Preservation

HEAD `5f050858…` unchanged · branch unchanged · upstream in sync (0/0) · 4 stashes · 23 tags with
unchanged targets · 114 worktree entries · gold set `93184abc…` · **0 files under `verification/`
modified** — all rehearsal output was written inside the disposable packaged tree. Six disposable
databases were created, all named `test_kg5a_*`; no protected or evidence database was written to.
