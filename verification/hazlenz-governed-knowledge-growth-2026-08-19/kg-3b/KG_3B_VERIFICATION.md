# KG-3B — Reviewer Approval + Governed Corpus Readiness · Verification Record

| Item | Value |
|---|---|
| Slice | KG-3B (reviewer approval path + corpus-backed validation harness) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` |
| Disposable DBs | `test_kg3b_review_20260819`, `test_kg3b_inventory_20260819` |
| `safescope` dev DB | **untouched** — still 35 migrations; `regulatory_release_records`, `regulatory_release_record_reviews` and `knowledge_release_events` all absent |
| Live governed read filter | **NOT enabled** (§13) |
| **Final status** | **ARCHITECTURE_READY / CURRENT_CORPUS_NOT_READY** (§12) |

**Phase 0.** All 22 KG-1 / KG-2 / KG-3A file hashes matched their verification artifacts before any
edit. No unrelated production changes had appeared. Protected tags intact — the inspection/UI tag
is `insite-inspection-ui-verified-2026-08-19`, neither renamed nor recreated. The four pre-existing
stashes are untouched.

---

## 1. Regulatory content consumer map (Phase 1)

Traced from the code, not assumed. Two consumers of `standards_master` exist, and they behave
differently.

### 1.1 Citation selection — no corpus dependency at all

`applyFindingScopedStandards()` (`safescope-v2/evidence/evidence-foundation.ts`) selects citations
entirely in code. KG-3A established this; it is re-confirmed here and is the reason the corpus
matrix exists.

### 1.2 Enrichment path (the customer-visible one)

```
HazLenz selects citation (in code, no DB)
  -> safescope-v2.service.ts hydrateFindingScopedStandards()
     -> ApplicableStandardsService.hydrateStandardReferences()
        SELECT ... FROM standards_master WHERE is_active = true AND citation ILIKE '%needle%'
        no release scope · no review-state condition · take(100)
     -> match by normalizeCitationForLookup(); exact key, else base key (subsection dropped)
     -> if NO row: the item is returned unchanged (no title, no text, no sourceKey)
     -> if row: title / standardText / plainLanguageSummary / sourceKey / sourceName / sourceType
  -> mark(): corpusBacked = Boolean(hydrated?.sourceKey)
  -> persisted on the finding (finding.sourceCandidate.standardCandidates)
  -> reload / Standard Detail / PDF read the PERSISTED snapshot
```

| Property | Measured value |
|---|---|
| Table queried | `standards_master` |
| Matching key | fuzzy `citation ILIKE '%needle%'`, then normalized exact/base key |
| Fallback when no row | citation retained; family + decision explanation shown, disclosed as HazLenz text |
| Can unapproved content appear? | **Yes — all of it.** There is no review condition anywhere in this query |
| Customer-visible consequence | corpus title and plain-language summary render as the standard's own text |

**Defect found and measured during Phase 1.** `corpusBacked = Boolean(sourceKey)` is satisfied by a
placeholder. The finalizer synthesizes `starter-unverified:<agency>:<citation>` for rows that
arrive with no source metadata, so after finalization **every** corpus row has a `source_key` and
all 4 placeholder-provenance records are currently marked corpus-backed. Verified directly:

```
ok  CRITICAL: the CURRENT live rule (corpusBacked = Boolean(sourceKey)) marks this
    placeholder-provenance record as corpus-backed, because finalization synthesized a source key
    literally named "starter-unverified". The governed contract corrects that.
```

This is reported, not fixed: fixing it is a live-path change, which KG-3B does not make.

### 1.3 `sourceStatus` — a dead branch

`guided-finding-response.ts:218` derives `sourceStatus: 'approved-versioned-regulation'` from
`record?.reviewerApproved === true`. `hydrateStandardReferences` does **not** select
`reviewerApproved`, so that field is never populated on the hydrated record. Every customer today
receives `provisional-versioned-regulation` or `source-review-required`. This is consistent with
KG-3A's finding that `reviewer_approved` is 0/26, and it means the KG-3B approval mechanism
changes nothing for customers until a future slice wires it in.

### 1.4 `ApplicableStandardsService.suggest()` — separate, genuinely DB-backed

Two independent `standardRepo` query builders (lines 1221, 1280) plus an optional
`safescope_knowledge_chunks` join. Jurisdiction-gated by `agency_code`/`scope_code`, keyword-matched
on `title`/`keywords`. **No release scope, no review condition.** Measured in §8.

### 1.5 Report content resolution (Phase 15)

**Reports never query the regulatory corpus.** `reports.module.ts` registers no `Standard` entity
in `TypeOrmModule.forFeature`, `CanonicalReportsService` injects no standards repository, and
`canonical-report-pdf-renderer.ts` is a pure function over persisted snapshots.

The exact boundary, stated rather than invented:

- Report standards content comes from `finding.sourceCandidate.standardCandidates`, hydrated at
  **analysis time** and frozen on the finding.
- The persisted fields are `title`, `plainLanguageSummary`, `sourceKey`, `sourceName`,
  `sourceType`, `corpusBacked` — set by `mark()` in `hydrateFindingScopedStandards`.
- **`standardText` is never persisted onto a finding and never rendered in a report.** Reports show
  `plainLanguageSummary` plus the HazLenz decision explanation.

Consequence: a report generated under release A already carries A's title and summary; a later
release B cannot retroactively change an existing report, because nothing re-reads the corpus.
Regenerating a report re-renders the same persisted snapshot. KG-1 provenance remains compatible —
`knowledgeReleaseId` on the finding names the release, and the frozen text is the text that release
supplied.

---

## 2. Review state machine (Phase 2)

The three KG-3A states are preserved and none is silently upgraded into another.

| From | To | Who/what may do it |
|---|---|---|
| — | `unreviewed` | `assessReviewState()` at finalization, for an enumerated defect: absent or placeholder source, deprecated, inactive, or never normalized |
| — | `mechanically_validated` | `assessReviewState()` at finalization: registered source + normalized + active |
| `mechanically_validated` | `reviewer_approved` | **only** `ReleaseRecordReviewService.approveRecord()`, with an explicit reviewer identity and an exact content checksum |
| `reviewer_approved` | back to frozen state | `revokeApproval()`, note mandatory |

**`unreviewed` → `reviewer_approved` is refused** (gate `frozenStateEligible`). The task allowed
skipping mechanical validation "if the existing governance architecture provides a valid reason
otherwise" — the architecture provides the opposite reason. `unreviewed` in this system is not
"not yet looked at"; it is assigned for a specific defect. Approving such a record would attest to a
regulatory record with no identified issuing authority, or to one the corpus already marks
withdrawn. The remedy is to fix provenance and re-finalize, not to approve past it.

**Approval attaches to the exact release-specific version, not to the logical citation.** A
decision names `(releaseId, citationKey, recordChecksum)`. `recordChecksum` is the sha256 of the
frozen normalized payload, so B's revision of the same citation is simply not named by A's
decision.

---

## 3. Approval provenance (Phase 3)

New table `regulatory_release_record_reviews`, **append-only**:

| Column | Purpose |
|---|---|
| `releaseId`, `citationKey`, `citation` | which record, readable without a join |
| `recordChecksum` | **the version binding** — the exact content the decision covers |
| `decision` | `approved` \| `revoked` (CHECK-constrained) |
| `reviewerId`, `reviewerRole` | stable actor identity, varchar for the same reason `knowledge_release_events.actor` is |
| `note` | grounds; **mandatory for revocation** |
| `frozenReviewStateAtDecision` | what the reviewer was acting on |
| `decidedAt`, `createdAt` | timestamps |

**Why a separate table rather than updating the snapshot.** KG-3A's immutability — a snapshot row
written once and never updated — is what makes historical resolution work. `UPDATE`-ing
`regulatory_release_records.reviewState` would break it, and "was this approved when that report was
generated" would become unanswerable. Approval is therefore a decision *about* a frozen record, not
a mutation *of* it. Verified: `The FROZEN snapshot state is unchanged -- the immutable row was not
mutated.`

**Deliberately no unique constraint** on `(releaseId, citationKey, recordChecksum)`: a record may be
approved, revoked and re-approved, and every decision must survive. Uniqueness would force
revocation to be a DELETE or UPDATE, destroying the audit trail.

**Audit reuse.** Each decision also writes `knowledge_release_events` with event
`record_approval` / `record_revocation`, so a release's timeline shows activations, rollbacks and
the reviews that made activation eligible in one ordered history. That column carries no CHECK
constraint, so no schema change was needed. Refused decisions are audited too (6 recorded in the
suite run).

**Customer exposure.** None — KG-3B changes no customer path. The recommended contract for the
eventual cutover exposes review *state*, `decidedAt` and release identity; **never `reviewerId` or
`reviewerRole`**, which are internal governance provenance.

---

## 4. The review mechanism (Phase 4)

`backend/src/standards/releases/release-record-review.service.ts` plus the admin CLI
`backend/scripts/review-regulatory-release-record.ts` (`npm run review:release-record`).

**No HTTP endpoint, deliberately.** KG-2 already treats activation as an operator action with no
route; approving a regulatory record — deciding what customers are told is authoritative regulation
— is rarer and more consequential. A route would create an authorization surface the architecture
does not otherwise need. Verified: `grep` for controllers referencing `standards/releases` returns
nothing.

The operation requires an exact target: `releaseId` + citation + `--expected-checksum`. There is no
"approve whatever is stored now" mode.

Nothing in this service reads `approved_for_auto_ingestion`, `requires_approval` or
`authority_tier` as evidence of review. Those describe how content may be *acquired*; review is a
decision about content already acquired.

---

## 5. Checksum binding and stale-review protection (Phase 5)

The exact scenario in the task specification, verified:

```
ok  Approving a checksum the release does not hold is REFUSED (stale review protection).
ok  A malformed expected checksum is refused rather than coerced.
ok  Approving release B using release A's checksum is refused -- no cross-version approval.
ok  Approval without a reviewer identity is refused -- provenance is mandatory.
ok  Approving a citation the release does not contain is refused.
ok  Approving against a non-existent release is refused.
```

Six gates (`releaseExists`, `recordExists`, `checksumMatches`, `frozenStateEligible`,
`reviewerIdentified`, `currentlyApproved`); every refusal names the gate that failed. Decisions are
serialized by a per-release advisory lock so concurrent decisions cannot race duplicate rows in.

---

## 6. Change semantics and revocation (Phase 6)

### New version — no inheritance

```
ok  Release B holds a DIFFERENT version of the same citation (content changed).
ok  Release B's revised record is NOT approved -- approval did not follow the citation.
ok  Release B reports 0 governed records despite release A having an approved copy of the citation.
ok  Release A's approval survives release B's finalization.
```

This is structural, not a policy rule: A's decision names A's checksum, which B does not have.

### Identical content — explicitly NOT carried forward

`CARRY_FORWARD_ON_IDENTICAL_CONTENT = false`, in code so the choice cannot be assumed either way.

Carry-forward *would* be technically defensible — equal checksums mean the reviewer approved
exactly those bytes. It is off because the checksum covers normalized regulatory **content**, not
the circumstances that make an approval meaningful: whether the citation was withdrawn or
superseded upstream between releases, or whether the reviewer's basis still holds. Identical text in
a new release can be a regulation that has since been rescinded. Defaulting to "requires review"
makes an unreviewed record visible as unreviewed; defaulting the other way makes a stale approval
invisible.

```
ok  Byte-identical content in release B is still NOT approved: identity of text is not identity of
    regulatory standing.
ok  The identical-content record is SURFACED as a carry-forward candidate so re-review is targeted.
ok  The genuinely revised citation is NOT offered as a carry-forward candidate.
```

`describeCarryForwardCandidates()` (`npm run review:release-record -- carry-forward-candidates`)
bounds the cost: re-review is a short evidenced list, not a full corpus re-review.

### Revocation — corrects without erasing

```
ok  An approval can be revoked.
ok  Revocation returns the record to its FROZEN state, which remains a true statement about it.
ok  Both decisions are retained -- nothing was deleted.
ok  The record that it WAS approved, and by whom, survives the revocation.
ok  Revocation without stated grounds is refused.
ok  A record can be re-approved after revocation, and all three decisions are retained.
```

Revocation returns the record to its **frozen** state rather than to `unreviewed`: a mechanically
validated record whose approval was withdrawn is still mechanically validated, and downgrading
further would assert something false.

---

## 7. Placeholder-source policy (Phase 7)

All four reviewed. **None approved.** Every one is refused by the `frozenStateEligible` gate:

```
ok  A placeholder-provenance record CANNOT be approved to improve coverage; provenance must be
    remediated and the release re-finalized first.
```

| Citation | source_key | Why placeholder | HazLenz emits it | Evidence required |
|---|---|---|---|---|
| `1910.146` | `starter-unverified:osha:1910.146` | row arrived with no source metadata; key synthesized by the finalizer | no | register eCFR 1910 as the authoritative source, re-attach provenance to the row, finalize a new release |
| `1910.22(a)` | `starter-unverified:osha:1910.22(a)` | same | no | same |
| `1910.303(b)(1)` | `starter-unverified:osha:1910.303(b)(1)` | same | no | same |
| `1910.36` | `starter-unverified:osha:1910.36` | same | **yes** | same — this is the highest-priority provenance remediation |

**Finding worth stating plainly:** these four rows carry `requires_approval = false` and
`approved_for_auto_ingestion = true` — the **most permissive acquisition flags in the entire
corpus sit on its weakest provenance**, while all 22 registered-source rows carry
`requires_approval = true`. Under the pre-KG-3A derivation
(`approved = source_key AND approved_for_auto_ingestion AND NOT requires_approval`) that is exactly
why a second finalization promoted precisely these four to "approved". The flags are left alone;
they are reported in the inventory and are not read as review evidence anywhere.

No public content was fetched or ingested. No unrelated source acquisition was remediated.

---

## 8. Corpus-backing contract (Phases 11, 12)

`backend/src/standards/releases/governed-corpus-lookup.ts` — a **shadow evaluator**, imported only
by KG-3B scripts.

| State | Meaning |
|---|---|
| `CORPUS_BACKED` | reviewer-approved record for this exact citation in the release, **with** regulatory text or summary, **and** a registered (non-placeholder) source. Only this state may present text as authoritative regulation |
| `APPROVED_NO_TEXT` | approved with registered provenance, but no usable text |
| `UNAPPROVED_RECORD` | a record exists but is not reviewer-approved |
| `NOT_IN_RELEASE` | the governed release holds no record for this citation |
| `CITATION_ONLY` | no citation identity could be resolved |

It never claims backing on the strength of a source key alone, and it reads the release **snapshot
payload**, never `standards_master` — which is what makes historical resolution stable.

### Missing-backing behavior (Phase 12) — recommendation only, NOT implemented

**Recommended: (B) show the citation, mark the regulatory text unavailable/unverified.**

- **(A) suppress the citation** — wrong, because selection is in code with no corpus dependency.
  Suppressing would delete a correct, evidence-derived citation because of a governance gap in a
  different subsystem. Measured scale: it would remove all 24 distinct gold-set citations.
- **(C) fall back to unapproved corpus** — the exact failure KG-3A closed. Presents text nobody
  attested to as authoritative regulation. The most serious of the four risks.
- **(D) fail the standards result** — destroys useful hazard reasoning for a reason the user cannot
  act on.
- **(B)** keeps every evidence-supported citation and the hazard reasoning, and refuses to render
  unattested text as regulation.

**(B) cannot be implemented today**: `corpusBacked` is a boolean and the UI has no "regulatory text
unavailable" state, so citation text and HazLenz-generated text occupy the same visual slot. Adding
that distinction is KG-3C work. Recorded as `MISSING_BACKING_RECOMMENDED_BEHAVIOR`.

---

## 9. Corpus-backed validation matrix (Phases 13, 14, 16, 17, 18)

`npm run test:governed-corpus-matrix` — **49/49**. The existing 31-case gold set is untouched and
still passes 31/31.

Cases are **not invented**: observations come from the tracked, hash-verified gold set
(`93184abc…`), and the citations are whatever `applyFindingScopedStandards()` actually emits —
**23 distinct citations across 31 observations**, spanning OSHA General Industry, OSHA Construction
and MSHA.

**Phase 18 reviewed disposable release.** 8 of 26 records approved through the real review
mechanism, deliberately **partial** — approving everything would hide the case a cutover must
handle. Every approval has explicit evidence in the test setup (checksum, reviewer, note).

### Backing distribution over the 23 emitted citations

| State | Count |
|---|---|
| `CORPUS_BACKED` | 6 |
| `UNAPPROVED_RECORD` | 9 |
| `NOT_IN_RELEASE` | 8 |

### Difference vs the current live rule

| Classification | Count | Meaning |
|---|---|---|
| `IDENTICAL` | 6 | backed both ways, same text |
| `LEGACY_ONLY_LOSES_BACKING` | 8 | backed today, not governed — a genuine governance gap |
| `LEGACY_PLACEHOLDER_BACKING_REMOVED` | 2 | backed today **only** because of a synthesized placeholder key — a correction, not a regression |
| `BOTH_MISSING` | 7 | no corpus row either way |

Required cases, all verified:

```
ok  A reviewer-approved emitted citation resolves as CORPUS_BACKED: 29 CFR 1910.212(a)(1).
ok  The approved record supplies actual regulatory content, not just an identifier.
ok  Provenance is a registered source (osha-ecfr-1910), not a placeholder.
ok  A mechanically-validated-but-unapproved emitted citation is NOT corpus-backed: 29 CFR 1910.147.
ok  It IS backed under the current live rule and is NOT under the governed contract -- this is
    precisely the gap the gold set could not see.
ok  An unreviewed record is never corpus-backed: 1910.146.
ok  A citation absent from the release resolves as NOT_IN_RELEASE, not as a silent empty success.
ok  Jurisdiction is resolved from the release payload (MSHA vs OSHA), so a wrong-regime backing is
    detectable at the contract boundary.
```

### Standard Detail (Phase 14)

```
ok  Standard Detail can obtain real text for the citation from release A.
ok  The citation number Standard Detail would display is correct: 1910.212(a)(1).
ok  Release B resolves the REVISED text.
ok  NO NEWER RELEASE TEXT LEAKS INTO THE OLDER RELEASE: A still resolves A's text after B exists.
ok  Reload does not change historical release content.
ok  Release B's revised version is NOT approved -- and is therefore NOT corpus-backed, even though
    its text exists and looks complete.
```

Backend/service level. No browser test was run: the live UI is unchanged by KG-3B, so a browser
test would exercise the legacy path and prove nothing about the governed contract.

### Superseded / rolled-back release

```
ok  Release B becomes active after its own record is reviewed.
ok  While B is active, the citation resolves to B's approved revised content.
ok  Explicit rollback to A reports B as the release it replaced.
ok  After rollback the governed lookup resolves A's ORIGINAL content -- rollback restored content,
    not merely a pointer.
ok  A's approval survived the round trip through B and back.
ok  Release B is preserved historically and still resolves its own approved content.
```

### `suggest()` (Phase 16) — measured independently

Tested separately because KG-3A showed nothing about `applyFindingScopedStandards` transfers here.

- It **does** consume `standards_master`, through two independent query builders.
- It is **customer-facing** (`ApplicableStandardsController`).
- Measured: **2 of 3** results would be corpus-backed under the reviewed fixture release.

```
ok  suggest() WOULD be materially affected by governed filtering: it returns results that the
    governed contract does not back. Its outputs are customer-facing, so it needs the same contract
    before any cutover.
```

Unlike the enrichment path, governed filtering here would change **which standards are returned**,
not merely how they are decorated — `suggest()` returns rows *from* the corpus. This is a distinct
cutover risk and is recorded as a blocker in §12.

### Shadow lookup on the real release (Phase 17)

`shadow-governed-standards.ts` now resolves **effective** approval (the frozen column alone could
never show one). Re-run against the real seeded release:

| Metric | Value |
|---|---|
| Live corpus rows | 26 |
| Currently retrievable | 26 |
| Governed retrievable | **0** |
| Gold-set cases correct | 31/31 under both paths |
| Wrong-regime matches | 0 |
| Distinct expected citations | 24, of which 0 governed, 24 losing corpus backing |

Identical to the KG-3A measurement — correct, because no real record has been approved.

---

## 10. Manifest vs approval-state relationship (Phase 9)

**Model B: approval is a separately governed post-finalization control state.** Not ambiguous, and
not a new invention — `normalizeStandardRecord()` already excludes governance fields
(`reviewer_approved`, `release_id`, `deprecation_status`) from the checksum by design. KG-3B makes
that separation load-bearing.

| Requirement | How it is met |
|---|---|
| Immutable regulatory content | snapshot rows never updated; content manifest never rewritten |
| Truthful approval history | append-only decision log |
| Deterministic activation eligibility | gate reads effective state through one shared SQL definition |
| Revocation | append a `revoked` decision |
| Reproducible historical explanation | every decision retained with reviewer, time, grounds and the checksum it named |

Both integrity surfaces are **separately auditable**:

```
ok  The immutable CONTENT manifest still verifies after approval.
ok  The finalized content manifest was not rewritten because approval changed.
ok  Approval state has its own separately auditable integrity digest.
ok  The approval-state digest changed when approval state changed...
ok  ...while the CONTENT manifest stayed identical throughout every approval and revocation.
```

`computeApprovalStateChecksum()` is computed on demand, not stored — approval state is
intentionally mutable over time, and storing it would recreate the "frozen thing that must be
rewritten" problem.

---

## 11. Activation gate integration (Phase 10)

One change: `describeReleaseScope()` counts **effective** rather than frozen review state, and
`manager` is threaded so the gate evaluates approval inside the activation transaction.

| Case | Result |
|---|---|
| Release with zero approved records | **rejected** (`governedRecordsPresent`) |
| Release B (revised, unapproved) while A is active | **rejected** |
| Fully eligible reviewed fixture release | **activates** |
| Non-existent / unfinalized / empty / tampered | rejected, unchanged from KG-2 |

```
ok  The activation gate now sees exactly 1 governed record -- the one actually reviewed.
ok  Release A is now activation-eligible; before any review it failed governedRecordsPresent.
ok  Release B is correctly NOT activatable: it has no reviewer-approved record.
```

The threshold stays "at least one approved record", **not** "every record must be reviewed". The
source registry already distinguishes acquisition policy from review state, and requiring universal
review would make the pointer-move gate a proxy for corpus completeness. What counts as sufficient
approved coverage for a customer-facing cutover is a corpus-readiness question, measured separately
in §12. The distinction **source acquisition policy ≠ record review state** is preserved
throughout: nothing in the approval path reads `approved_for_auto_ingestion`, `requires_approval`
or `authority_tier`.

---

## 12. Readiness (Phase 21)

### ARCHITECTURE_READY

| Criterion | Status |
|---|---|
| Reviewer approval has truthful provenance | **met** — reviewer identity, role, timestamp, grounds, frozen state at decision |
| Approval is version/checksum-bound | **met** — §5 |
| Changed versions cannot inherit approval | **met** — §6, structurally |
| Governed corpus lookup works | **met** — §8, §9 |
| Active release lookup resolves approved exact content | **met** |
| Historical rollback restores exact prior content | **met** |
| Standard Detail works against governed content | **met** at service level |
| `suggest()` implications understood | **met** — measured, and it is a distinct risk |
| Missing corpus backing has a defined safe contract | **met** — recommended, documented, not implemented |
| Corpus-backed validation matrix passes | **met** — 49/49 |
| Migration requirements enumerated | **met** — §13 |

### CURRENT_CORPUS_NOT_READY

Measured on the real release `federal-core-2026-07-30.1` (`corpus-migration-inventory.json`):

| Disposition | Count |
|---|---|
| `READY_FOR_REVIEW` | 14 |
| `NOT_CURRENTLY_USED` | 8 |
| `PLACEHOLDER_SOURCE` | 4 |
| **`reviewer_approved`** | **0 of 26** |

15 of 26 records correspond to citations HazLenz actually emits. Approval-state checksum:
`ba7950d9cabfe717bebc37b6e241783389a987bbae7899cdc09c54eb1965a183`.

Enabling the governed filter today would take retrievable records from **26 to 0**.

**Phase 20, stated explicitly.** Every approval in every suite is a **test fixture** created through
the real review mechanism. It proves the workflow. It does **not** establish that any of the 26 real
regulatory records has been substantively reviewed. The suites print this themselves.

Also blocking, independent of record count:

1. **`suggest()` has no governed contract.** It is customer-facing and returns rows *from* the
   corpus, so filtering changes which standards appear, not merely their decoration.
2. **The missing-backing display contract does not exist.** `corpusBacked` is a boolean; the UI
   cannot say "citation valid, regulatory text unverified".
3. **`corpusBacked` is currently satisfied by a placeholder key** (§1.2) — a live-path defect that
   should be corrected before or with the cutover.
4. **`sourceStatus` reads a field hydration never populates** (§1.3) — the customer-facing approval
   signal is currently a dead branch.

---

## 13. Proof the live read path is unchanged (Phase 23)

- `git status` for `backend/src/applicable-standards/`, `backend/src/safescope-v2/`,
  `backend/src/intelligence/`, `backend/src/standards/entities/` and `frontend-next/` is **empty**.
- `grep` for `release_id =`, `releaseId =`, `reviewer_approved =`, `reviewState`, `effectiveState`
  across `applicable-standards/`, `safescope-v2/`, `intelligence/`, `reports/` and `inspection/`
  returns **only** pre-existing `reviewStateLabel` hits — a HazLenz display label about the
  *observed condition*, unrelated to regulatory record review.
- The only `src/` file importing any KG-3B module is `data-source.ts` (one entity registration,
  required for migrations). Every other importer is a KG-3B verification script.
- No controller references `standards/releases`. No HTTP surface was added.
- Directly measured inside the matrix suite, while a reviewed release was active and held an
  approved *older* version:

```
ok  PROOF THE LIVE PATH IS UNCHANGED: hydrateStandardReferences still returns the LATEST live
    corpus text with no release scope and no approval condition, even while release A is active and
    holds an approved older version. KG-3B did not enable governed read filtering.
```

Unchanged and re-verified: citation selection (31/31, 0 wrong-regime), ranking and recognition
(HazLenz core — only the two documented baseline failures), risk and corrective actions
(finding-scoped reviews pass), customer report behavior (canonical workflow 25 scenarios,
persistence pass), billing/auth (entitlement grant helper 5/5, cross-user denials 4,
mass-assignment rejected).

KG-1 provenance is unaffected: after the full regression, 14 analyses exist and the only 4 carrying
a `knowledgeReleaseId` are KG-1's own fixtures (`kg1-fixture-release.A`). Real analyses still
record `NULL`.

---

## 14. Regressions (Phase 22)

| Gate | Result |
|---|---|
| Backend build (`npm run build`) | **pass**, clean |
| `test:reviewer-approval` (new) | **62/62** |
| `test:governed-corpus-matrix` (new) | **49/49** |
| `test:release-integrity-and-approval` (KG-3A) | **50/50** |
| `test:regulatory-release-lifecycle` (KG-2) | **42/42** |
| `test:knowledge-release-provenance` (KG-1) | **27/27** |
| `test:entitlement-grant-helper` | **5/5** |
| `test:canonical-workflow` | `{"passed":true,"scenarios":25,...}` |
| `test:persisted-decomposition-findings` | `{"passed":true,...}` |
| `test:finding-scoped-reviews` | `{"passed":true,...}` |
| `test:safescope-standards` | 15 passed, 0 failed |
| `test:standards-corpus-integrity` | all invariants passed |
| `validate:hazlenz-knowledge-index` | Validation Passed |
| Tracked gold set (via shadow) | **31/31**, 0 wrong-regime |
| `test:hazlenz-core` | **the two documented baseline failures only** — Golden Hardening Scenarios, HazLenz Production Path. No new failures |
| Frontend `tsc --noEmit` | pass; **no frontend file changed** |
| `git diff --check` | clean |

**Migration.** Forward → 45 migrations. Revert drops `regulatory_release_record_reviews`; all 26
snapshot records and all 26 corpus rows remain readable. Re-forward succeeds.

---

## 15. Changed files

**New:**

| File | sha256 |
|---|---|
| `backend/src/standards/releases/regulatory-release-record-review.entity.ts` | `79a75478d4199c249fc493a36703330851013809af334fa6f72fb0e72a48f1b0` |
| `backend/src/standards/releases/release-record-review.service.ts` | `4306f8543314cb5654283089a6f90ceee6670ce0ab3f4695a9f06b390761657b` |
| `backend/src/standards/releases/governed-corpus-lookup.ts` | `38850779246bb14f70731d1fd08e179124f04d42dcbcc1abcd49594aab90b98a` |
| `backend/src/database/migrations/1800000013000-RegulatoryReleaseRecordReviews.ts` | `70b9dc9ac198237de021c962646264bc792702bcd8798a0478245ed5219db506` |
| `backend/scripts/review-regulatory-release-record.ts` | `37f85859a37a19adb6115ef080ab3e75412a8ab61660eddfc756b1b214d88095` |
| `backend/scripts/test-reviewer-approval.ts` | `cb7224c42cddb0857566443a5ca22d11c132d5f9357a38d5faa07a120b6b176f` |
| `backend/scripts/test-governed-corpus-matrix.ts` | `06775e5ddbac4e7dfb554a52a661458dfae40d4bb98d8527c17b6e6be1e5cb25` |
| `backend/scripts/report-corpus-migration-inventory.ts` | `ae7e781924260f0df345d7a93d23c2d32a7e63aec108d9b44f0609b9df195959` |

**Modified:**

| File | sha256 | Change |
|---|---|---|
| `backend/src/standards/releases/regulatory-release-lifecycle.service.ts` | `8ec5f34889e0a01b5b25f38d958407c11d089bf0b32e93e27864116c399689df` | `describeReleaseScope` counts effective state; `manager` threaded; gate comment |
| `backend/src/standards/releases/knowledge-release-event.entity.ts` | `aa647dbc1222669dd211742b0f7c3f54f12ea87d91281b47563d804daf1403fb` | event-type union extended (no schema change) |
| `backend/src/database/data-source.ts` | `afa0e0fc84d780b8289a29c532b73257daa0a878353b3b7ca66c55b2b09dbca9` | one entity registration |
| `backend/scripts/shadow-governed-standards.ts` | `2abf44c0d2ca30149167e82bb3d15b2058a390d9ef2f5d7a42fe556ed0ac771f` | reads effective approval instead of the frozen column |
| `backend/package.json` | `ae53a791c88c5fa93987e3a366aa8a512b191417a4dffd1b6dd974078d43b1ec` | four new scripts |

**Unchanged since KG-3A** (hashes re-verified before and after): `review-state.ts`,
`citation-identity.ts`, `regulatory-release-record.entity.ts`, `release-manifest.ts`,
`regulatory-release.entity.ts`, `finalize-regulatory-release.ts`, migrations `1800000010000`–
`1800000012000`, and all four KG-1 production files.

**No production runtime file outside `standards/releases/` and `data-source.ts` was modified by
KG-3B.**

---

## 16. Remaining limitations

1. **The four placeholder records still need real source provenance.** Not fixable by review; they
   need registered sources and a new release.
2. **Reverting the KG-3B migration destroys approval history.** Content survives; decisions do not.
   Releases would return to 0 governed records and become non-activatable.
3. **Approval is not exposed anywhere a customer can see.** Intentional for KG-3B, but it means the
   mechanism is unexercised outside verification until KG-3C.
4. **The immutability guard remains application-level** (inherited from KG-3A). A direct `DELETE`
   on `regulatory_release_record_reviews` would erase decisions; nothing detects that.
5. **`suggest()` has no governed contract yet** — measured, not addressed.
6. **`APPROVED_NO_TEXT` was not observed** in the fixture corpus; the state is implemented and
   type-checked but exercised only by construction, not by a real record.

---

## 17. Recommended next slice

**KG-3C — the display contract**, before any read-path cutover:

1. Replace the boolean `corpusBacked` with the graded backing state, and fix
   `corpusBacked = Boolean(sourceKey)` so a `starter-unverified:` key cannot confer backing.
2. Implement recommended behavior (B): a UI/PDF state for "citation valid, regulatory text
   unverified", so a citation can be shown without its text reading as authoritative regulation.
3. Give `suggest()` the same governed contract, since it returns corpus rows directly.
4. Repair or remove the dead `sourceStatus` branch in `guided-finding-response.ts`.

**Then KG-3D — corpus remediation**, in this order: remediate the 4 placeholder sources (starting
with `1910.36`, the one HazLenz emits); review the 14 `READY_FOR_REVIEW` records, prioritising the
15 in demonstrated use; then decide whether the 8 `NOT_CURRENTLY_USED` records are worth reviewing
or should be retired.

**The cutover itself is last**, and only once approved coverage of emitted citations is high enough
that (B) is a rare state rather than the normal one.
