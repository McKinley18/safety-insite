# KG-2 — Regulatory Release Lifecycle + Active Pointer · Verification Record

| Item | Value |
|---|---|
| Slice | KG-2 (closes architecture gap **G3**) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` (upstream `origin/release/insite-rc-2026-08-18`) |
| Disposable DBs | `test_kg2_release_lifecycle_20260819`, `test_kg2_regression_20260819` |
| Production / `safescope` dev DB | **not touched** — still 35 migrations, no KG-2 columns, no events table |

---

## 1. Starting state (Phase 0)

KG-1 was present and intact. All eight KG-1 artefact hashes matched
`kg-1/KG_1_VERIFICATION.md` exactly before any KG-2 edit, and no unexpected production
changes were present. Four pre-existing stashes untouched.

### Protected tag discrepancy (reported, not changed)

The task brief lists the second protected tag as
`insite-inspection-ui-verified-baseline-2026-08-19`. **No such tag exists in this
repository.** The actual tag is:

```
insite-inspection-ui-verified-2026-08-19 -> 4c7a501d361f4e5f340ae58af6976303452fc2a5
```

The commit it points at is exactly the documented protected commit, so this is a naming
discrepancy in the brief, not a missing or moved tag. Per instruction the repository tag was
**preserved unchanged**; no tag was created, renamed, moved or deleted. All three protected
tags still resolve to their original commits.

---

## 2. Lifecycle map before KG-2 (Phase 1)

Traced from source. Ten questions, ten measured answers:

| # | Question | Finding |
|---|---|---|
| 1 | Release identifier | `regulatory_releases."releaseId"` varchar(120) UNIQUE, e.g. `federal-core-2026-07-30.1` |
| 2 | Status/state fields | `status` varchar(24) DEFAULT `'draft'`; the only value ever written by code is `'provisional'` |
| 3 | Creation/finalization flow | `standards/seed/finalize-regulatory-release.ts` — a standalone `ts-node` script using a raw `pg` client, not a Nest service |
| 4 | Manifest/checksum | sha256 per normalized record, folded into a manifest sha256 over `{agency, citation, checksum}` ordered by `agency_code, citation` |
| 5 | Approval metadata | release `approvedBy`/`approvedAt` **never written**; row-level `reviewer_approved` computed as `source_key AND approved_for_auto_ingestion AND NOT requires_approval` |
| 6 | Immutable after finalization? | **No.** `INSERT ... ON CONFLICT ("releaseId") DO UPDATE` freely rewrote `releaseVersion`, `manifestChecksum`, `parserVersion`, `recordCount` |
| 7 | Supersession relationships | none on releases (`superseded_by_citation` exists only on standards rows) |
| 8 | Partial activation concept | none |
| 9 | Runtime code reading the table | **none** — `grep` outside migrations returned only the finalizer's own `INSERT` |
| 10 | Finalization repeatable/mutable | yes, unconditionally |

Existing governance services were inspected and deliberately **not** reused as the lifecycle:
`ApprovedKnowledgePromotionWorkflowGovernanceService` is an explicit placeholder
("Preliminary implementation") that always returns `promotionDecision: 'blocked'`, and both it
and `approved-knowledge-promotion-v1` operate on **individual source-knowledge candidates**
(agency/citation/authorityTier), not on releases. Treating them as the release lifecycle would
have conflated two different concepts.

---

## 3. Lifecycle and pointer design (Phases 2, 3)

```
draft ──▶ provisional ──▶ active ──▶ superseded      (replaced by a later release)
        (= "finalized")      │
                             └────▶ rolled_back      (deliberately reverted)
```

**States are additive to the existing vocabulary.** `provisional` is reused as the finalized
state rather than introducing a synonym `finalized`, because the finalizer already writes it —
adding a second word for one concept is exactly the parallel-lifecycle trap the brief warns
about. `candidate` / `validated` / `approved` from `KNOWLEDGE_VERSIONING_AND_ROLLBACK.md` §3.2
are **not** added: nothing can produce or consume them until the validation battery (KG-12)
exists, and unreachable states are worse than absent ones. No `rejected` state was added for
the same reason — KG-2 refuses activations, it does not mark releases rejected.

**Pointer model: lifecycle status on `regulatory_releases`.** No separate control-state table,
no configuration framework. The active release is `WHERE status = 'active'`.

**Scope: a single global active release.** This follows the actual data model rather than an
assumption — `finalize-regulatory-release.ts` stamps *every* `standards_master` row with one
release id, and neither the release table nor the standards table carries a jurisdiction or
source-domain scope column. Per-jurisdiction activation would be inventing a scope the schema
does not have.

**Uniqueness is database-enforced:**

```sql
CREATE UNIQUE INDEX uq_regulatory_release_active
  ON regulatory_releases (status) WHERE status = 'active';
```

plus an explicit lifecycle constraint:

```sql
CHECK (status IN ('draft','provisional','active','superseded','rolled_back'))
```

**Audit: `knowledge_release_events`.** The existing `security_audit_events` table was evaluated
and rejected: its `resourceId` and `actorUserId` are `uuid` columns, while a release is
identified by a varchar releaseId and acted on by a system/operator identity that is not a
platform user. `knowledge_release_events` is also the structure named by
`KNOWLEDGE_VERSIONING_AND_ROLLBACK.md` §5 and the KG-2 backlog entry, so this follows the
authoritative design rather than inventing a parallel one.

**Deliberately not built:** no HTTP route, no Nest module wiring, no
`changeSummaryJson` / `sourceManifestJson` / `validationResultsJson` / `autonomyLevel` columns.
Nothing in KG-2 can populate those, and an admin activation endpoint would add an authorization
surface this slice does not need. Activation is an operator action against the service.

---

## 4. Activation gates (Phase 4)

Eight gates, each evaluated and reported individually so a refusal names the failure:

| Gate | Meaning |
|---|---|
| `releaseExists` | the named release row exists |
| `statusEligible` | `provisional` for promotion; `superseded`/`rolled_back` for rollback |
| `manifestChecksumWellFormed` | stored checksum is 64 hex chars |
| `recordCountPositive` | declared `recordCount > 0` |
| `releaseRecordsPresent` | `standards_master` rows actually carry this `release_id` |
| `recordCountMatches` | declared count equals actual row count |
| `manifestChecksumVerifies` | manifest **recomputed from the live rows** equals the stored checksum |
| `governedRecordsPresent` | at least one record survives `reviewer_approved = true AND deprecation_status = 'active'` |

`governedRecordsPresent` is the gate that answers the hazard KG-1 identified. A release in
which nothing is reviewer-approved would, once KG-3 scopes the read path, reduce regulatory
recall to zero. The gate **refuses the activation** rather than approving records to make it
pass — no row's approval state was changed to satisfy it, and the real seeded release is
correctly refused (§7).

---

## 5. Atomicity, idempotency, concurrency, rollback (Phases 5–7)

`RegulatoryReleaseLifecycleService.activate()` / `.rollbackTo()` run one
`dataSource.transaction`: retire the current active release, activate the target, write the
audit event. There is no committed intermediate state with two active releases, and none with
zero (given a prior active release existed) because both updates share the transaction.
Failure leaves the previous active release untouched — verified by the refusal cases.

Serialization uses `pg_advisory_xact_lock('regulatory-release-pointer')`, matching the existing
repository pattern in `inspection.service.ts`. The advisory lock makes contention orderly; the
partial unique index is the hard guarantee, and is proven independently (§6).

**Idempotency:** re-activating the already-active release returns `already_active` and changes
nothing.

**Rollback is explicit and exact.** `rollbackTo(releaseId)` names its target; there is no
"newest minus one" anywhere. The release being rolled off becomes `rolled_back` and is retained
in full — nothing is deleted. `parentReleaseId` is recorded **at activation time**, so the
rollback target is stored rather than reconstructed from timestamps.

---

## 6. Verification results

### `npm run test:regulatory-release-lifecycle` — **41/41 checks passed**

Reproduced from a clean fixture state, and again after a migration revert + re-forward.

| Group | Evidence |
|---|---|
| Starting state | no active release exists after the KG-2 migration; `getActiveRelease()` → null |
| Gates | release A passes all 8; release C fails **exactly** `governedRecordsPresent`; a non-existent release fails `releaseExists` |
| First activation | succeeds with no prior active release; exactly one active |
| Supersession | activating B reports A as previous; A → `superseded` (retained); B records `parentReleaseId = A`; `activatedAt` stamped |
| Idempotency | re-activating B → `already_active`, nothing else changes |
| Refusal | activating C throws; B remains active; C remains `provisional`; exactly one active |
| Concurrency | two concurrent activations leave **exactly one** active (both settled — the advisory lock serialized them) |
| **DB-level uniqueness** | a raw `UPDATE ... SET status='active'` that bypasses the service **is rejected by the database**; still exactly one active |
| Rollback | `rollbackTo(A)` → A active, B `rolled_back` and retained in full, exactly one active, previous release reported as B |
| Tamper | fixture eligible before mutation; after altering `standard_text` post-finalization, `manifestChecksumVerifies` fails and activation throws; the previously active release is unaffected |
| Audit | 8 events; successful promotion records from- and to-release; rollback records its exact target; **2 refusals recorded with actor** |
| Shadow interface | release A reports 3/3 governed; unapproved release C reports 0 governed |

### Immutability guard (Phase 12) — verified end to end

| Attempt | Result |
|---|---|
| Re-finalize an **active** release | `Refusing to re-finalize release kg2-fixture-release.A: status is 'active'` |
| Re-finalize a **rolled_back** release | refused with the same guard |
| Finalize a **new** release id | succeeds normally |
| Release statuses after the refused attempts | unchanged |

### Checksum algorithm extraction — behaviour-preserving

The manifest algorithm was extracted from `finalize-regulatory-release.ts` into
`standards/releases/release-manifest.ts` so finalization (which writes the manifest) and
activation (which re-verifies it) cannot drift. Proof it is byte-identical: seeding a fresh
disposable database produced

```
manifestChecksum = 111f9949040cac1b61f76e3ca63dbeb9ed8fa5838da0a6a59599d1f781dfba5b
```

— exactly the value KG-1 recorded before the refactor existed.

---

## 7. Current release activation eligibility, and two defects it exposed (Phases 13, 14)

The real seeded release was evaluated. **After one finalization it is NOT activatable**, failing
two gates:

```
manifestChecksumVerifies : stored 111f9949…, recomputed 6043d639… — content changed after finalization
governedRecordsPresent   : 0 of 26 records reviewer_approved (26 unapproved, 0 deprecated)
```

### Defect A — the finalizer's manifest never attests to the release it writes

Root cause, confirmed by measurement: `finalize-regulatory-release.ts` computes record
checksums from rows read at the **start** of its transaction, then the same transaction
`UPDATE`s `source_key` — synthesizing `starter-unverified:<agency>:<citation>` for rows that had
none. `source_key` is part of the normalized projection the checksum covers, so the stored
manifest describes the *pre-update* state and can never match a recomputation. Exactly **4** of
26 rows had a synthesized `source_key`, and a second finalization (now reading already-stamped
rows) produced `6043d639…` — **precisely the value the verifier recomputed**, confirming the
mechanism.

Consequence: a release becomes self-consistent only if finalized **twice**. That is not a
detection gap in the checksum model — the model works — it is a write-ordering defect in the
finalizer.

### Defect B — a placeholder source key is being treated as reviewer approval

The same second finalization moved `approvedRecords` from **0 → 4**. `reviewer_approved` is
derived as `source_key AND approved_for_auto_ingestion AND NOT requires_approval`, so once the
finalizer fabricated a `starter-unverified:` key for those 4 rows, the next run counted them as
reviewer-approved. A placeholder literally named *unverified* is being converted into evidence
of review. This is the precise conflation Phase 14 warns against: **"the source may be
automatically ingested" is being treated as "this record has been substantively reviewed."**

After two finalizations the release *does* pass every gate — but its 4 "governed" records are
exactly the rows with the least trustworthy source metadata. **Under KG-3 this release would
reduce retrieval from 26 standards to 4 — an 85% recall loss — while appearing correctly
governed.**

Neither defect was repaired here: both live in the finalization/ingestion model, which KG-2 is
instructed not to redesign, and repairing Defect A would itself change approval outcomes. No
row's approval state was bulk-changed. Both are recorded as **KG-3 pre-work blockers**.

### Defect C (new gap, not in G1–G9) — releases do not retain their own records

Finalizing a new release re-stamps **every** `standards_master` row with the new release id.
Measured directly: after finalizing `kg2-fixture-release.NEW` while
`kg2-fixture-release.A` was active, release A was left with **0 records** and failing integrity,
despite still being the active pointer.

There is exactly one corpus with a moving label, not independent per-release snapshots. The
consequence is material and qualifies KG-2's own rollback claim:

> **Rollback restores the pointer, not the content.** Rolling back to a prior release re-activates
> a release whose records may no longer exist. `KNOWLEDGE_VERSIONING_AND_ROLLBACK.md` §6 requires
> per-release normalized records to be retained permanently; that storage model does not exist.

This is a genuine architecture gap beyond G1–G9 and is the single most important input to KG-3.

---

## 8. KG-1 integration boundary (Phase 9)

`describeLiveKnowledgeRetrievalScoping()` still returns `{ mode: 'unscoped_corpus' }` and still
resolves every real analysis to `knowledgeReleaseId = NULL`. Only its stated reason was updated,
to remain truthful now that a control plane exists:

> *"A KG-2 active-release pointer may exist, but the retrieval path does not consume it, so no
> single release governed this analysis."*

The resolver deliberately does **not** consult the pointer. "A governed release is active" and
"this analysis used only that release" are different claims; collapsing them would stamp a
release id on an analysis that in fact selected from the whole unscoped corpus.

**Proven, not asserted.** The KG-1 provenance suite was re-run against a database where
`kg2-phase10-active-pointer` was genuinely `active`:

```
active release during the run : kg2-phase10-active-pointer
knowledge-release-provenance : 27/27 checks passed
  ok  Live production analysis records knowledgeReleaseId = NULL.
  ok  Live-path findings inherit NULL provenance.
```

---

## 9. Proof the live standards read path is unchanged (Phase 10) — hard gate

**Structural.** `git status` for `backend/src/applicable-standards/`, `backend/src/safescope-v2/`,
`backend/src/intelligence/` and `backend/src/standards/entities/` is empty — not one retrieval
file changed. `grep` for `RegulatoryReleaseLifecycleService`, `regulatory-release-lifecycle` and
`getActiveRelease` across `backend/src/` returns **nothing** outside `standards/releases/` itself:
the control plane is imported by no runtime path.

**Behavioural.** A release was actually activated and 3 rows flipped to `reviewer_approved`, then
the standards suites were re-run and diffed against the pre-activation output:

| Condition | `test:safescope-standards` | `test:standards-corpus-integrity` |
|---|---|---|
| No active release, 0 approved rows | 15 passed, 0 failed | all invariants passed |
| **Active release + 3 approved rows** | 15 passed, 0 failed | all invariants passed |
| `diff` of full outputs | **IDENTICAL** | **IDENTICAL** |

If retrieval consumed `release_id` or `reviewer_approved`, these outputs would have diverged.
They did not. No `WHERE release_id = …` and no `reviewer_approved = true` was added to any
retrieval query; ranking, applicability, jurisdiction logic and report content are untouched.

---

## 10. Regression results (Phase 19)

| Gate | Result |
|---|---|
| Backend build (`tsc`) | **pass**, clean |
| `test:regulatory-release-lifecycle` (new) | **41/41 passed** |
| `test:knowledge-release-provenance` (KG-1) | **27/27 passed** — including with an active release present |
| `test:entitlement-grant-helper` (new) | **5/5 passed** |
| `test:canonical-workflow` | **passed — 25 scenarios** (previously unrunnable) |
| `test:persisted-decomposition-findings` | `{"passed":true,…}` |
| `test:finding-scoped-reviews` | `{"passed":true,…,"finalStatus":"completed"}` |
| `test:safescope-standards` | 15 passed, 0 failed |
| `test:standards-corpus-integrity` | all invariants passed |
| `validate:hazlenz-knowledge-index` | Validation Passed (8 entries, 4 jurisdictions) |
| `test:hazlenz-core` | **the two documented baseline failures only** — Golden Hardening Scenarios, HazLenz Production Path. No new failures. |
| Frontend `tsc --noEmit` | pass; **no frontend file changed** (no shared API type changed) |
| `git diff --check` | clean |

Pre-existing baseline failures are unchanged in identity, not merely in count.

---

## 11. Migration verification (Phase 18)

`1800000011000-RegulatoryReleaseLifecycle`, run only against disposable databases.

| Step | Result |
|---|---|
| Forward | applied; 43 migrations total |
| Columns | `parentReleaseId`, `activatedAt`, `deactivatedAt` present and nullable |
| Partial unique index | `CREATE UNIQUE INDEX … ON regulatory_releases (status) WHERE status = 'active'` |
| Status constraint | `CHECK (status IN ('draft','provisional','active','superseded','rolled_back'))` |
| Events table | created with the expected columns |
| Existing release rows | readable throughout; no row lost |
| Valid / invalid activation, rollback | covered by the 41-check suite |
| **Revert** | reverted successfully with `active`(1) + `superseded`(1) + `rolled_back`(1) rows present; columns, index and events table dropped; all **6** releases still readable, KG-2-only statuses folded back to `provisional` so pre-KG-2 code can still interpret them |
| **Re-forward** | applied; lifecycle suite re-run → **41/41** |

The `down()` migration deliberately rewrites KG-2-only statuses rather than leaving values the
old `CHECK`-free schema and older code would not understand.

---

## 12. Entitlement-helper disposition (Phase 16) — repaired, isolated

The defect was verified before repair: `scripts/grant-test-entitlement.ts` inserted
`tier = 'expert'`, rejected by `CHECK ((tier)::text = 'pro')` from migration
`1800000005900-RetireExpertTier`.

The correct replacement is unambiguous from current schema and code: the entity declares
`tier: 'pro'`, the column default is `'pro'`, the check constraint permits only `'pro'`, and
`normalizeBillingTier('expert') === 'pro'` — so the repaired grant confers exactly what the
original intended. The change is one word.

Two consequences required a second, related change: the helper alone did not unblock
`test:canonical-workflow`, because that suite registers its own users and never granted them
anything — it had relied on `DEV_FORCE_EXPERT`, which no longer exists (its successor
`DEV_FORCE_PRO` only tiers up the **dev-bypass** identity, not an authenticated user). A grant
step was added to that suite using the shared helper.

Guards verified intact by `test:entitlement-grant-helper` (5/5): the helper still refuses to run
without `NODE_ENV=test`, and still refuses a database outside its disposable allowlist. No
billing guard was weakened, no client-side bypass introduced, and production entitlement
behaviour is unchanged — `backend/src/billing/` and `backend/src/auth/` have no diff.

Also corrected: the KG-1 provenance suite previously carried its own inline grant plus a comment
describing the helper as broken. It now calls the repaired helper, so the comment is no longer
false and the duplicated logic is gone.

---

## 13. Gold-set disposition (Phase 17) — recorded only

Re-verified: `backend/tmp/gold-set-v3.ts` and the tracked
`verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts`
are still byte-identical (`93184abc677cf7a5…`), and the latter is confirmed tracked by
`git ls-files`. Nothing was moved, committed or integrated; KG-5 not implemented.

**Answer for KG-3: yes, with one caveat.** The tracked copy is a safe source of truth for gold-set
*content* — it is version-controlled and byte-identical. It is **not runnable from its tracked
location**: its only import is

```ts
import { applyFindingScopedStandards } from '../src/safescope-v2/evidence/evidence-foundation';
```

which resolves relative to `backend/tmp/`, not to the verification directory. KG-3's shadow diff
should therefore copy the tracked file into `backend/` (or run it from `backend/tmp/` after
verifying its sha256 against the tracked copy) rather than executing it in place. KG-2 changed
nothing it depends on — `evidence-foundation.ts` is unmodified.

---

## 14. Files changed

**KG-2 — new:**

| File | sha256 |
|---|---|
| `backend/src/standards/releases/release-manifest.ts` | `ed53b0599b9a32d9a5554c3183970d590c6142c0744de0d2645e3f209b4fe95d` |
| `backend/src/standards/releases/regulatory-release.entity.ts` | `e1eca9ff2df7ad202134f6a9e2a3913ba6ad907b0eb1e4e896bad166a58cd2f4` |
| `backend/src/standards/releases/knowledge-release-event.entity.ts` | `940a46714a384773f0bbf5d7453155a824415f890a30a5cc1b66e573a84a7064` |
| `backend/src/standards/releases/regulatory-release-lifecycle.service.ts` | `e058a996350dc25d209c172240693c711ca70835dd6655e20997552ab2762fb7` |
| `backend/src/database/migrations/1800000011000-RegulatoryReleaseLifecycle.ts` | `2ba2a0a121a89d5cffa9f995cfd1a8d652fab9043155c8e3f9f735f6d329726c` |
| `backend/scripts/test-regulatory-release-lifecycle.ts` | `bf310424013dd701c083509422ab34ae17cb86dbdab5b5bf9c5fe45c508ce5fb` |

**KG-2 — modified:**

| File | sha256 | Change |
|---|---|---|
| `backend/src/standards/seed/finalize-regulatory-release.ts` | `e278d4b045eba545889dfd6dbce5780c5f7bec395091f2a73bf73ae9974087d7` | manifest algorithm extracted (behaviour-identical); immutability guard added |
| `backend/src/database/data-source.ts` | `ac28672f0b3b88270641fdb72b5f95177c74d5e3e5e2a02e3041e7f4b1914cc7` | two entity registrations |

**KG-1 files touched by KG-2 (boundary maintenance):**

| File | sha256 | Change |
|---|---|---|
| `backend/src/inspection/knowledge-release-provenance.ts` | `107e0d1c5e62000a5c48673657320cbda6f7022b8a5e926cd66d93fd7a63097c` | reason text only; return value unchanged |
| `backend/scripts/test-knowledge-release-provenance.ts` | `06a89a423fd8b83503698673180d7c74564fb21a83e38586777554e9a1184081` | uses the repaired grant helper |
| `backend/package.json` | `c1a229a8b16be9b6504ae546441768b2ebb6772c04598ce64e9e60c35f2e0241` | two new test scripts |

**Entitlement test-infrastructure repair (isolated):**

| File | sha256 | Change |
|---|---|---|
| `backend/scripts/grant-test-entitlement.ts` | `e9923491bace5f2d1fced06f732ec6d1bcdc67ef69696373e4c98f5b220f1100` | `'expert'` → `'pro'` (one word) |
| `backend/scripts/test-canonical-workflow.ts` | `6907ea8cc6bf8fbf9b699239ad2ad04286388c9a38c8b2c42cdb025acc6ffc7c` | grant step for its registered users |
| `backend/scripts/test-entitlement-grant-helper.ts` | `bf719162b6b4a6c999bd4d3884eec4bbf211a43353d4833eeecbcee59416eec2` | new focused verification |

Combined tracked diffstat (KG-1 + KG-2 + entitlement repair): **9 files, 131 insertions, 36
deletions** — the deletions are entirely the manifest code moved out of the finalizer.

Confirmed unchanged: standards retrieval filters, ranking, HazLenz classification, multi-hazard
decomposition, jurisdiction logic, risk, corrective actions, report content, auth, billing,
frontend.

---

## 15. Remaining risks

1. **Rollback restores the pointer, not the content** (Defect C). The highest-priority finding.
   Until per-release record retention exists, rolling back can re-activate a release whose rows
   have been re-stamped away.
2. **The real release requires two finalizations to be self-consistent** (Defect A), and the
   second silently promotes 4 records to reviewer-approved (Defect B).
3. **Activation is operator-invoked with no UI or route.** Intentional for KG-2; a future slice
   must decide who may move the pointer and add authorization when it does.
4. **`approvedBy` / `approvedAt` on the release remain unwritten.** KG-2 gates on release
   integrity and record approval, not on a recorded human release approval; that belongs with
   KG-12's validation battery.
5. **Single global scope.** If jurisdiction-scoped releases are ever required, both the schema
   and the partial unique index will need revisiting.
6. **The immutability guard is application-level**, enforced in the finalizer. A direct `UPDATE`
   against `regulatory_releases` can still rewrite a finalized release; the manifest gate would
   detect resulting content drift at activation, but not a checksum rewritten in the same
   statement.

---

## 16. Recommended KG-3 scope

KG-3 must **not** begin with the read-path filter. On the measured evidence, three blockers come
first:

1. **Fix per-release record retention (Defect C).** Without it, a release-scoped read path binds
   to a release whose contents can be silently re-stamped by the next finalization, and rollback
   cannot restore prior regulatory content. This is a storage-model change and is the real work.
2. **Fix the finalizer's write ordering (Defect A)** so a release's manifest attests to what it
   actually contains on the first finalization.
3. **Resolve the approval semantics (Defect B)** before any filter consumes `reviewer_approved`.
   A `starter-unverified:` placeholder must not count as review. This is the "resolve the
   release/approval metadata first — do not relax the filter to compensate" instruction from the
   backlog, now with a concrete cause.

Only then run the mandatory shadow diff. The interface for it already exists and is read-only:
`describeReleaseScope()` returns `totalRecords`, `governedRecords`, `unapprovedRecords`,
`deprecatedRecords` and `legacyUnscopedRecords`; `verifyIntegrity()` and `getActiveRelease()` are
available alongside it.

The concrete number to beat: on the current corpus the governed filter selects **4 of 26**
standards. Enabling it today would be an **85% recall loss**, and the surviving 4 are the rows
with the weakest source metadata. Zero recall loss must be demonstrated by shadow diff, per case,
before the filter is enabled.
