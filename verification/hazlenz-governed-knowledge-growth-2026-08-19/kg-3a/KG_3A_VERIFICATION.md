# KG-3A — Governed Release Integrity + Approval Semantics Pre-Gate · Verification Record

| Item | Value |
|---|---|
| Slice | KG-3A (pre-gate closure for defects A, B, C from KG-2) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Disposable DBs | `test_kg3a_integrity_20260819`, `test_kg3a_regression_20260819` |
| `safescope` dev DB | **untouched** — still 35 migrations, neither KG-2 nor KG-3A table present |
| **Live KG-3 readiness** | **KG_3_READ_PATH_NOT_READY** (§14) |

Phase 0: all 19 KG-1/KG-2 file hashes matched their verification artifacts before any edit. No
unrelated production changes. Protected tags intact — the inspection/UI tag is
`insite-inspection-ui-verified-2026-08-19` and was neither renamed nor recreated. Four stashes
untouched.

---

## 1. Root cause of defect C — record re-stamping

`standards_master.release_id` is **a single mutable scalar column on the live, mutable corpus
table**. A scalar can name exactly one release, so it never expressed *membership* ("which
releases contain this row") — only "the most recent release that captured this row".

`finalize-regulatory-release.ts` then ran:

```sql
SELECT … FROM standards_master ORDER BY agency_code, citation   -- no WHERE clause: every row
…
UPDATE standards_master SET … release_id = $3 … WHERE id = $1    -- for every row
```

So finalizing release B re-pointed every row from A to B, and A resolved to zero records.
Measured in KG-2: release A left with 0 records **while still the active pointer**.

Membership alone would not have fixed it. `standards_master` rows are mutable, so a junction
table would pin *which* rows a release contains while their *content* changed underneath. A
release must answer "what did citation X say under release A" after B revised it — that requires
storing the content.

---

## 2. Release-retention design (Phases 2, 3)

New table **`regulatory_release_records`** — written once at finalization, never updated:

| Column | Purpose |
|---|---|
| `releaseId` | which release this record belongs to |
| `standardId` | provenance link to the captured `standards_master` row (nullable) |
| `citation` | logical regulatory identity as published |
| `citationKey` | normalized logical identity; **unique per `(releaseId, citationKey)`** |
| `recordChecksum` | sha256 of `payload` — the release-version identity |
| `reviewState` | review state frozen alongside the content it describes |
| `payload` | the exact normalized record the checksum covers |

**Identity model (Phase 3), stated explicitly:**

- **Logical identity** — `citationKey`. `1910.212(a)(1)` and `29 CFR 1910.212(a)(1)` normalize to
  the same key; stable across releases; this is what a finding cites.
- **Version identity** — `recordChecksum`. Two releases may hold the same `citationKey` with
  different checksums; that is a regulation whose text changed.

A finding recorded under release A resolves its citation through A's snapshot, so it keeps
showing A's text after B revises it. Looking a citation up *without* a release is exactly what
would silently show newer text on an old finding.

`standards_master.release_id` is deliberately left in place and no longer load-bearing. Nothing
was migrated into it and no legacy row was assigned membership it did not have.

Identity normalization is implemented separately from
`ApplicableStandardsService.normalizeCitationForLookup` on purpose: that helper is private to the
live retrieval path (which must stay untouched) and discards subsections for fuzzy matching,
whereas identity must preserve them — `1910.212(a)(1)` and `1910.212(b)` are different records.

---

## 3. Does A survive B? (defect C closed)

From `test:release-integrity-and-approval` (50/50):

```
ok  Release A STILL verifies after release B was finalized (defect C closed).
ok  Release A still holds exactly 26 records after B (was 0 pre-KG-3A).
ok  Every release-A record checksum is unchanged after B finalization.
```

---

## 4. Root cause and fix for defect A — self-inconsistent manifest

Checksums were computed from rows **as read**, and the `UPDATE` loop then mutated `source_key`,
synthesizing `starter-unverified:<agency>:<citation>` for rows that had none. `sourceKey` is part
of the normalized projection the checksum covers, so the stored manifest described a state that
ceased to exist the moment finalization committed. Only a *second* finalization — reading
already-synthesized rows — produced a manifest that verified.

**Fix:** every intended normalization is applied **in memory first**, so the checksum is taken
over exactly what will be persisted. The finalizer then recomputes the manifest from the snapshot
it just wrote and **refuses to commit** if they disagree.

Measured on a fresh seed:

```
{"outcome":"finalized","recordCount":26,
 "manifestChecksum":"6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e",
 "verifiedInOnePass":true,
 "reviewState":{"unreviewed":4,"mechanically_validated":22,"reviewer_approved":0}}
```

`6043d639…` is the value that previously required **two** finalizations. One pass now produces it,
and `verifyIntegrity()` matches immediately.

**Immutability / idempotency (Phase 5):** re-finalizing an unchanged release returns
`outcome: "idempotent_no_op"`; re-finalizing after the corpus changed is **explicitly refused**
(`already holds an immutable snapshot`). Verified both, plus that the release is byte-identical
after a refused attempt.

---

## 5. Approval semantics before/after (defects B, Phases 6–8)

**Before.** One boolean carried three different claims. `finalize-regulatory-release.ts` — the
**only writer of `reviewer_approved` anywhere in the codebase** (`grep` confirmed) — derived it as:

```
approved = source_key AND approved_for_auto_ingestion AND NOT requires_approval
```

That states "this source may be fetched automatically", not "a reviewer approved this record".
Because the same script synthesized placeholder source keys, a second run promoted exactly the
weakest-provenance rows to "approved": `approvedRecords` went **0 → 4**.

**After.** Three states, never silently upgraded into one another
(`standards/releases/review-state.ts`):

| State | Meaning |
|---|---|
| `unreviewed` | no trustworthy basis — includes every placeholder-source record |
| `mechanically_validated` | registered source + normalized + active. A real, weaker claim. **Not review.** |
| `reviewer_approved` | a reviewer explicitly approved this record for governed use |

The finalizer **no longer writes `reviewer_approved` at all**. Substantive review is not something
finalization can confer on itself, and there is currently no other writer — so no record is
approved anywhere, which is the truthful state.

Measured after the change: `reviewer_approved = 0 / 26`, identical to the pre-KG-3A
*single*-finalization baseline. `guided-finding-response.ts` (the one consumer, used for
`sourceStatus` / `confidenceLimitReason`) therefore produces byte-identical customer output.

Verified:

```
ok  Finalization approves NOTHING: reviewer approval is not something finalization can confer.
ok  No standards_master row was marked reviewer_approved by finalization.
ok  A second finalization does NOT promote any record to approved (defect B closed).
```

---

## 6. Treatment of `starter-unverified` (Phase 7)

The placeholder is still written — it is informative, marking a record that arrived with no
source metadata — but it can no longer confer authority. `assessReviewState` checks for the
placeholder **before** the approval check, so a fabricated key cannot be laundered into
`reviewer_approved` even if the legacy boolean on the row is stale/true:

```
ok  A placeholder-source record stays unreviewed even when the legacy approval boolean is true.
ok  Every placeholder-source record is snapshotted as unreviewed.
```

The 4 affected records are **preserved, not deleted** — they remain in the corpus and in release
snapshots, labelled `unreviewed`. Weak provenance is recorded, not discarded.

---

## 7. Release activation eligibility (Phase 9)

| Case | Result |
|---|---|
| Non-existent / unfinalized release | rejected (`releaseExists`) |
| Empty release | rejected (`recordCountPositive`, `releaseRecordsPresent`) |
| Tampered snapshot | rejected (`manifestChecksumVerifies`) |
| Finalized, no reviewer-approved records | **rejected** (`governedRecordsPresent`) |
| Fully eligible fixture release | activates |

The gate was made **stricter**, not weaker: `mechanically_validated` records no longer count
toward `governedRecordsPresent`. The real seeded release is therefore correctly **not
activatable** — 0 of 26 records are reviewer-approved. Its integrity verifies; only approval is
missing. No row was approved to make anything pass.

Also newly verified: editing the live corpus after finalization **no longer invalidates** a
finalized release (that coupling was the non-immutability), while tampering with the snapshot
itself is still caught.

---

## 8. True rollback (Phase 10) — content, not just a pointer

Two genuinely distinct snapshots, same citation, different text:

```
ok  Release A contains 1910.212(a)(1).
ok  Release-version identity differs: the citation text changed between A and B.
ok  Release A still shows A's text, not B's newer text.
ok  Release B shows B's revised text.
ok  While B is active, the citation resolves to B's version.
ok  Explicit rollback to A reports B as the release it replaced.
ok  Pointer is back on A.
ok  Release A checksum still verifies after rollback.
ok  Release A membership is intact after rollback.
ok  1910.212(a)(1) resolves to release A's ORIGINAL version through the governed interface
    (rollback restored content, not just a pointer).
ok  Release B is preserved historically and still verifies; nothing was destroyed.
```

This is the test KG-2 could not pass. Governed rollback is now real.

---

## 9. KG-1 historical compatibility (Phase 11)

KG-1 is unchanged and still records `NULL` for real analyses (27/27 suite passes). What KG-3A
adds is the mechanical proof that a provenance value would remain *resolvable*:

```
ok  A KG-1 provenance value of release A still resolves A's full immutable record set after B exists.
ok  The exact record version an analysis would have used is still recoverable by checksum.
```

`resolveCitationInRelease(releaseId, citation)` is the interface a future KG-3 would use to render
a historical finding against the knowledge that actually produced it.

---

## 10. Legacy data (Phase 12)

No legacy row was assigned membership it did not have. Rows belonging to no snapshot remain
**unscoped legacy**, and `describeReleaseScope()` reports them explicitly as
`legacyUnscopedRecords`. `standards_master.release_id` is retained as a historical hint only.
Reverting the KG-3A migration drops snapshots and returns the system to the KG-2 model; releases
would need re-finalization (recorded in §15).

---

## 11. Tracked gold-set harness (Phase 14)

`scripts/shadow-governed-standards.ts` reads the **tracked** file

```
verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts
sha256 93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3  (recomputed, verified)
```

and refuses to score if the hash does not match. Only the `GOLD_SET` array literal (pure data) is
extracted; the evaluation is driven by the harness, so the tracked file needs no edit, no
relocation, and **no fourth copy exists**. The untracked `backend/tmp/gold-set-v3.ts` is never
read.

The harness reproduces the tracked script's own comparison semantics
(`canonicalizeCitation` + substring match) and reproduces its published baseline: **31/31 cases
correct, 0 wrong-regime** — consistent with precision 1.00 / recall 1.00 over 24 applicable cases.

---

## 12. Shadow read path (Phase 15) and the finding that reframes KG-3

**The citation SELECTION engine never touches the database.**

`applyFindingScopedStandards()` in `safescope-v2/evidence/evidence-foundation.ts` — the function
the gold set exercises and the function that produces per-finding `standardCandidates` — has
**zero database access**: its only imports are `crypto`, the DTO and in-code modules. `grep` for
`Repository|DataSource|getRepository|query(|standards_master` returns nothing.

`standards_master` is consumed by two *different* things:

1. `hydrateStandardReferences()` — enriches already-selected citations with title/summary/
   `sourceKey`, and sets `corpusBacked`. Filtering here does not remove a citation; it strips its
   backing.
2. `ApplicableStandardsService.suggest()` — a separate DB-backed suggestion path.

**Consequence:** scoping `standards_master` by `release_id`/`reviewer_approved` **cannot change
which citations the gold-set engine asserts**. The KG-3 plan in the backlog — "execute the gold
set with and without the filter and diff the selected standards per case" — is therefore **not a
valid gate as written**: the gold set is structurally incapable of detecting the recall impact of
release scoping. That is the single most important result of this slice.

---

## 13. Record-level recall analysis (Phase 16)

Measured against the real seeded release `federal-core-2026-07-30.1` (26 records, integrity
verified, correctly not activatable).

| Metric | Current | Governed |
|---|---|---|
| Live corpus rows | 26 | 26 |
| Retrievable rows | **26** | **0** |
| Gold-set cases correct | 31/31 | 31/31 *(unchanged — engine never reads the corpus)* |
| Wrong-regime matches | 0 | 0 |
| Distinct gold-set expected citations | 24 | 24 |
| …of those, governed | — | **0** |
| …losing corpus backing | — | **24** |

**All 26 records lost, with the reason for each:**

| Citation | Source key | Review state |
|---|---|---|
| 30 CFR 47.41(a) | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 56.12016 | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 56.14105 | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 56.14107(a) | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 56.15006 | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 56.9100(a) | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 57.14107(a) | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 62.120 | `msha-30-cfr-standards` | mechanically_validated |
| 30 CFR 62.130 | `msha-30-cfr-standards` | mechanically_validated |
| 1910.212(a)(1) | `osha-ecfr-1910` | mechanically_validated |
| 1910.219 | `osha-ecfr-1910` | mechanically_validated |
| 29 CFR 1910.132(a) | `osha-ecfr-1910` | mechanically_validated |
| 29 CFR 1910.147 | `osha-ecfr-1910` | mechanically_validated |
| 29 CFR 1910.178(p)(1) | `osha-ecfr-1910` | mechanically_validated |
| 29 CFR 1926.300(b)(2) | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.34(a) | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.416(a)(1) | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.501 | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.52 | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.59 | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.602(a)(9)(ii) | `osha-ecfr-1926` | mechanically_validated |
| 29 CFR 1926.95(a) | `osha-ecfr-1926` | mechanically_validated |
| 1910.146 | `starter-unverified:osha:1910.146` | unreviewed |
| 1910.22(a) | `starter-unverified:osha:1910.22(a)` | unreviewed |
| 1910.303(b)(1) | `starter-unverified:osha:1910.303(b)(1)` | unreviewed |
| 1910.36 | `starter-unverified:osha:1910.36` | unreviewed |

**22 lost to "never reviewed" (registered sources, correctly normalized) and 4 to placeholder
provenance.** Not one is lost to a technical defect — every exclusion is a legitimate governance
statement about work that has not been done.

**Phase 17 compliance:** parity was not obtained by any prohibited means. No record was
auto-approved, approval was not relaxed to auto-ingestion, no legacy row was assigned to a
release, membership was not bypassed, no gold-set citation was special-cased, and neither ranking
nor recognition was touched.

---

## 14. Live KG-3 readiness decision (Phase 18)

### KG_3_READ_PATH_NOT_READY

| Criterion | Status |
|---|---|
| Operates against immutable release contents | **met** |
| Supports actual historical rollback | **met** |
| Uses truthful approval semantics | **met** |
| Preserves required gold-set recall | **cannot be demonstrated** — the gold set does not exercise the filtered path (§12) |
| No material new false positives | not demonstrable by the same argument |
| No unexplained zero-citation regressions | **would be catastrophic**: 26 → 0 retrievable records |

Exactly what remains:

1. **No record has ever been reviewed.** 0 of 26 are `reviewer_approved`; there is no reviewer
   path in the codebase at all. 22 records need substantive review; 4 need real source provenance
   before review is even meaningful.
2. **The gold set cannot gate this change.** A DB-backed harness that exercises
   `hydrateStandardReferences()` and `ApplicableStandardsService.suggest()` must exist before any
   filter is enabled, otherwise the gate is measuring a path the change does not affect.
3. **The intended effect of the filter must be decided.** Because selection is in-code, scoping
   `standards_master` degrades enrichment (`corpusBacked: false`) rather than removing citations.
   Whether that is the intended governance semantic is a design decision, not an implementation
   detail.

---

## 15. Regressions (Phase 20)

| Gate | Result |
|---|---|
| Backend build (`tsc`) | **pass**, clean |
| `test:release-integrity-and-approval` (new) | **50/50** (run twice — reproducible) |
| `test:regulatory-release-lifecycle` (KG-2) | **42/42** under the corrected model |
| `test:knowledge-release-provenance` (KG-1) | **27/27** |
| `test:entitlement-grant-helper` | **5/5** — guards re-verified, not broadened (Phase 19) |
| `test:canonical-workflow` | passed, 25 scenarios |
| `test:persisted-decomposition-findings` | `{"passed":true,…}` |
| `test:finding-scoped-reviews` | `{"passed":true,…}` |
| `test:safescope-standards` | 15 passed, 0 failed |
| `test:standards-corpus-integrity` | all invariants passed |
| `validate:hazlenz-knowledge-index` | Validation Passed |
| `test:hazlenz-core` | **the two documented baseline failures only** — Golden Hardening Scenarios, HazLenz Production Path. No new failures. |
| Frontend `tsc --noEmit` | pass; **no frontend file changed** |
| `git diff --check` | clean |

**Migration (Phase 13):** forward → 44 migrations; snapshot table, unique index and review-state
CHECK present; revert drops the snapshot table with release rows and all 26 standards still
readable; re-forward succeeds; full A→B→rollback cycle re-run afterwards.

---

## 16. Proof the live read path is unchanged (Phase 22)

- `git status` for `backend/src/applicable-standards/`, `backend/src/safescope-v2/`,
  `backend/src/intelligence/`, `backend/src/standards/entities/` and `frontend-next/` is
  **empty**. The only file touched under `backend/src/reports/` is KG-1's
  `canonical-reports.service.ts`.
- `grep` for `release_id =`, `reviewer_approved =` or `releaseId =` across the live retrieval
  directories returns **nothing**.
- No runtime path imports the control plane: `grep` for the lifecycle service, snapshot entity,
  review-state or citation-identity modules outside `standards/releases/` and the finalizer
  returns only a pre-existing unrelated comment in an unmodified file.
- Customer-visible `sourceStatus` is unchanged: `reviewer_approved` is 0/26 both before and after,
  exactly as it was after a single finalization pre-KG-3A.

---

## 17. Changed files

**KG-3A — new:**

| File | sha256 |
|---|---|
| `backend/src/standards/releases/review-state.ts` | `7ae9b1e48bc687eac78df0028f12b58948415755e68c2791639463ce42314a03` |
| `backend/src/standards/releases/citation-identity.ts` | `cde5e15f92e4761debb0977ef639cab1d2fe3f729641d4b8da4e38b38f50101c` |
| `backend/src/standards/releases/regulatory-release-record.entity.ts` | `c2800c867b2a4f0b4c3108d6e4538c4bf0a15c48425472feee694e9cba53de06` |
| `backend/src/database/migrations/1800000012000-RegulatoryReleaseRecords.ts` | `c83fc6f802f9701ab7231708338b1770010977533a5c619d841440dcbfad8a0b` |
| `backend/scripts/test-release-integrity-and-approval.ts` | `dee3214803278f1e03f9262117c1f66362cccb29a2863d81f05947100cada3d3` |
| `backend/scripts/shadow-governed-standards.ts` | `27e176eecb135ffb13e68a1ae1afd57a15918956ecb499e4f0a10ad7616ef785` |

**KG-3A — modified:**

| File | sha256 | Change |
|---|---|---|
| `backend/src/standards/seed/finalize-regulatory-release.ts` | `6feec4348f0a4550fbfc0f7a81cf0bae7781a9e5eca0828755f4479fd3f051f8` | ordering fix, snapshot write, one-pass verification, immutability/idempotency, stops writing `reviewer_approved` |
| `backend/src/standards/releases/release-manifest.ts` | `f234198ae261c50fd9da704fa5e0fd2861e38810281b39b455ea564af9aeed18` | added `computeSnapshotManifest` |
| `backend/src/standards/releases/regulatory-release-lifecycle.service.ts` | `dbc119d20c5eab9c4aabab41d1642117b6b90f4070a4eb37478e48fba35a6a80` | verify/scope/gates read the snapshot; added `resolveReleaseRecords`, `resolveCitationInRelease` |
| `backend/src/database/data-source.ts` | `6672cc3c21219af9e5265e6f93b05b34fe295998dbcb53cd0bda132838cea880` | one entity registration |
| `backend/scripts/test-regulatory-release-lifecycle.ts` | `683e822ae182ed61068c1c77571d857e13faeff725d470f3884edea378179663` | fixtures build snapshots; tamper test retargeted; self-resetting |
| `backend/package.json` | `411bc4d4f9e576702109f1b5b2591934fe28a12bfd5ed6ab947c79792a528f6a` | two new scripts |

**Unchanged since KG-2** (hashes re-verified): `regulatory-release.entity.ts`,
`knowledge-release-event.entity.ts`, migration `1800000011000`, and KG-1's
`knowledge-release-provenance.ts`.

Diff separation: KG-1 = 4 files + 2 new; KG-2 control plane = 4 files + 3 new; KG-3A = as above;
test-infrastructure repair = `grant-test-entitlement.ts` (one word) +
`test-canonical-workflow.ts` (grant step) + `test-entitlement-grant-helper.ts`; verification
artifacts under `verification/hazlenz-governed-knowledge-growth-2026-08-19/`.

---

## 18. Remaining limitations

1. **No reviewer path exists.** Nothing in the codebase can set `reviewer_approved`. Until a
   review mechanism exists, no release can legitimately be activated. This is now visible rather
   than hidden behind a derived boolean.
2. **Reverting the KG-3A migration drops snapshot content.** It is a schema rollback, not a
   data-preserving one; releases would need re-finalization afterwards.
3. **Snapshots duplicate the normalized record.** At 26 records this is trivial; at full-corpus
   scale, retention policy deserves review (architecture §6 already requires permanent retention).
4. **The immutability guard is application-level.** A direct `UPDATE` on `regulatory_releases`
   could still rewrite a stored manifest; snapshot tampering is caught, a same-statement rewrite
   of both would not be.
5. **Stale `reviewer_approved = true` rows are not cleared.** No such rows exist in any verified
   database, and every historical `true` was necessarily produced by the old derivation — but the
   column is left alone rather than mutated. `assessReviewState` refuses to honour it for
   placeholder-source records regardless.
6. **`ApplicableStandardsService.suggest()` was not shadow-measured** — the harness measures the
   gold-set engine and corpus-level governed availability. Measuring the suggestion path is part
   of the DB-backed harness KG-3 needs (§14, item 2).

---

## 19. Recommended next slice

Not the read-path cutover. In order:

1. **KG-3B — reviewer approval path.** A minimal backend mechanism to record substantive review
   with reviewer identity and date, so `reviewer_approved` has a legitimate producer. Without it
   the governed filter can only ever select zero records.
2. **KG-3C — DB-backed shadow harness.** Exercise `hydrateStandardReferences()` and
   `ApplicableStandardsService.suggest()`, since the tracked gold set structurally cannot detect
   release-scoping impact.
3. **Decide the governance semantic** for in-code-selected citations that lose corpus backing:
   suppress the citation, or surface it as unbacked. That decision determines what the KG-3 filter
   should even do.
