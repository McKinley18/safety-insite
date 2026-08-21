# KG-3C — Governed Standards Display Contract · Verification Record

| Item | Value |
|---|---|
| Slice | KG-3C (truthful standards backing / display contract) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` |
| Disposable DBs | `test_kg3c_display_20260819`, `test_kg3c_inventory_20260819`, `test_kg3c_browser_20260819`, `test_kg3c_reports_20260819` |
| `safescope` dev DB | **untouched** — never a target; every suite refuses any database not named `test_*` |
| Governed read-path cutover | **still disabled** (§11, re-proved §20.9) |
| **Final status** | **KG_3C_COMPLETE — VERIFICATION CLOSED** (browser + private-storage-reports closed in §20) |

> **§20 supersedes the two open items recorded below.** Sections 1–19 are the original
> implementation record and are left as written. When first published it carried two outstanding
> verification gaps — real-browser display verification (§8, §18.1) and an unresolved
> `test:private-storage-reports` run (§16, §18.2). Both were closed on 2026-08-19 in the session
> recorded in **§20**, which also documents two presentation defects the browser pass found and
> repaired, and a typecheck claim in §16 that did not hold.

**Phase 0.** All 30 KG-1 / KG-2 / KG-3A / KG-3B file hashes matched the KG-3B verification record
before any edit. HEAD, branch, the four pre-existing stashes and all 23 tags (including
`insite-inspection-ui-verified-2026-08-19`) were intact and remain so.

---

## 1. Existing display-contract map (Phase 1)

Traced from the code. There are **three** distinct regulatory-content surfaces, and only one of
them was lying.

### 1.1 `standards_master` enrichment — the surface KG-3C fixes

```
HazLenz selects citation (in code, no DB — KG-3A §12)
  -> hydrateFindingScopedStandards()  [safescope-v2.service.ts]
     -> hydrateStandardReferences()   WHERE is_active = true AND citation ILIKE '%needle%'
                                      no release scope · no review condition
     -> mark(): corpusBacked = Boolean(hydrated?.sourceKey)      <-- THE DEFECT
  -> hazard.standardCandidates  -> persisted on the finding -> Standard Detail / PDF
  -> standardDecisions          -> report-facing list
  -> guidedFinding.primaryStandard -> sourceStatus / confidenceLimitReason
```

### 1.2 `regulatory_sections` verbatim text — a separate, already-honest surface

`GET /regulatory/section`, called on demand by the "Standard detail" expander
(`SafeScopeStandardsSection.StandardCitationHeading`). It renders verbatim agency text with an
explicit "Verify against the agency's own published text" disclaimer, and an honest
not-available message otherwise. **KG-3C does not govern or change this surface**, and the KG-1/2/3A/3B
governance work never covered it. Recorded so the two are not confused.

### 1.3 What the P1 contract already guarantees

`verification/insite-p1-remediation-2026-08-16/P1_STANDARDS_INTEGRITY_CONTRACT.md` established
that every `standards_master` text field is HazLenz-authored paraphrase, never verbatim CFR/MSHA
language, and renamed the top display tier from "Official standard text" to **"HazLenz standard
summary"**. So the *text* was already honestly labelled before KG-3C. This materially narrowed the
slice: the false-authority risk was the **backing claim**, not the text label.

### Fields that imply authority

| Field | Before KG-3C | Rendered? |
|---|---|---|
| `corpusBacked` | `Boolean(sourceKey)` — **false claim** | **No** — typed in the frontend, never read |
| `sourceStatus` | `record?.reviewerApproved === true` — **dead branch** | No — typed only |
| `confidenceLimitReason` | non-null whenever not approved, i.e. always | **Yes** (`page.tsx:1447`) |
| `standardText` / `plainLanguageSummary` | shown under "HazLenz standard summary" / "Summary" | Yes — already honest |
| `sourceKey`/`sourceName` | attached when present | Indirectly, via `source` |

**Two findings worth stating plainly.** First, `corpusBacked` was never actually reaching any
client: `standardCandidates()` in `hazlenz-evidence-boundary.ts` projects candidates to a fixed
5-field allowlist, and the controller applies that boundary **twice**, so the field was stripped on
the second pass. Second, `sourceStatus`'s approved branch reads `reviewerApproved`, which
`hydrateStandardReferences` does not select — so every customer received a non-approved value
regardless of any real approval. Both were latent rather than customer-visible, which is why the
defect survived: the claim was wrong but nothing displayed it yet.

---

## 2. Canonical backing status (Phase 2)

`backend/src/standards/display/standards-backing-contract.ts` — pure, DB-free, three states.

| State | Meaning |
|---|---|
| `APPROVED_GOVERNED_CONTENT` | exact citation, in the governed release, registered (non-placeholder) provenance, reviewer-approved exact version, **and** usable regulatory text |
| `UNAPPROVED_CONTENT` | a corpus record exists but does not meet the approval contract. Its text may be correct; nothing attests to it |
| `CITATION_ONLY` | HazLenz legitimately selected the citation; no usable governed content backs it |

**No fourth state.** `LEGACY_CORPUS_CONTENT` was considered and rejected: "no active release
resolves this" and "this record is not approved" are the same customer-visible fact, and the
difference is a migration detail already carried by the migration inventory. An approved record
carrying no text collapses to `CITATION_ONLY` for the same reason — the customer consequence is
identical to having no content.

`contentDisclosure` (`GOVERNED_APPROVED` / `HAZLENZ_AUTHORED` / `NONE`) is separate on purpose: the
status says whether the record is approved, the disclosure says **whose words** the reader is
looking at.

**Why the resolver is DB-free.** It accepts an already-resolved `governed` input rather than
querying. The live customer path passes nothing (so it can never be approved — the truthful answer
today), the governed/shadow path passes a real resolution, and both go through one rule set that
cannot drift. This is what let KG-3C fix the claim without enabling the cutover.

---

## 3. `corpusBacked` after the fix (Phase 3)

```
corpusBacked === (backingStatus === 'APPROVED_GOVERNED_CONTENT')
```

Derived, never independent. The placeholder check runs **before** the approval check — same
ordering as `assessReviewState` — so a synthesized key cannot be laundered into backing by any
caller, including one that hands in a governed resolution claiming approval.

`hasCorpusRecord` is evidenced by a source key or by corpus content, **not by a title**: titles
legitimately come from the in-code rule family when hydration found nothing, and treating one as
proof of a corpus record would be the same loose inference the slice removes.

Verified:

```
ok  HARD GATE: a starter-unverified source key does NOT yield corpusBacked = true.
ok  A placeholder cannot be laundered into approved backing even by a governed caller claiming approval.
ok  The placeholder is caught from the source key itself, not only from a caller-supplied flag.
ok  Approved + registered provenance + content is the ONLY route to corpusBacked = true.
ok  Backing is NEVER inferred from the presence of a source key or of text — only from backingStatus.
```

---

## 4. `sourceStatus` disposition (Phase 4)

**Mapped, not revived.** Reviving the dead `record.reviewerApproved` read would have created a
second, independent notion of approval competing with `backingStatus`. Instead
`mapBackingToSourceStatus()` derives it from the canonical status. The three wire values are
unchanged, so no client contract breaks:

| backingStatus | sourceStatus |
|---|---|
| `APPROVED_GOVERNED_CONTENT` | `approved-versioned-regulation` (**now reachable**) |
| `UNAPPROVED_CONTENT` + regulation authority | `provisional-versioned-regulation` |
| everything else | `source-review-required` |

`sourceStatus` is retained for wire compatibility only; `backingStatus` is the field to read.

---

## 5–7. Rendering contract (Phases 5, 6, 7)

**Positive-only marking.** Approved content earns a **"Verified standard text"** badge; everything
else simply does not carry one.

The alternative — a caution badge on unapproved content — was rejected on evidence, not taste:
0 of 26 real records are approved, so it would attach a warning to **every standard in the
product**. That reads as a broken product rather than as precision, and would train users to ignore
the badge by the time it means something. Unapproved text is already labelled "HazLenz standard
summary" by the P1 contract, so it is never presented as official regulation either way. The result
satisfies "not indistinguishable from approved content" without degrading anything.

| State | Rendering |
|---|---|
| `APPROVED_GOVERNED_CONTENT` | citation, title, text, jurisdiction, source + "Verified standard text" badge. No approval IDs, checksums, reviewer IDs or release internals |
| `UNAPPROVED_CONTENT` | citation, title, text under "HazLenz standard summary". **No** verified badge |
| `CITATION_ONLY` | citation and title; **no fabricated body text**; notice: *"Verified standard text is not currently available for this citation."* |

Measured contrast for the badge (computed from the actual hex values, not estimated):
emerald-800 on emerald-100 = **6.78:1**; emerald-300 on emerald-950 = **9.94:1**; against the
card's `dark:bg-slate-950` = **13.23:1**. All clear WCAG AA.

The `"Unavailable"` copy was changed from *"No standard text or approved summary is available for
this matched standard"* — which described an internal matching step — to the customer-facing
sentence above.

---

## 8. Standard Detail (Phase 8)

Rendering verified per state by `frontend-next/lib/inspection/__tests__/standardDisplayBacking.test.ts`
(**16/16**, run with `npx tsx`; no test runner is configured in that workspace):

```
ok  Approved governed content earns the positive verification marker.
ok  Unapproved content does NOT earn the verification marker -- it is distinguishable from approved.
ok  Unapproved text is still shown, under an honest non-authoritative label.
ok  No display tier claims official/authoritative regulatory language (P1 label-integrity contract).
ok  Citation-only states unavailability in product voice.
ok  With no text at all, the display states unavailability rather than fabricating standard text.
ok  HARD GATE: a placeholder-source record is never presented as verified.
```

Backing is carried from the finding's **own** persisted candidate (`best.backingStatus`), so the
panel describes the record it is actually rendering rather than the observation primary's — the
same finding-scoping rule the panel already followed for citation and title. No finding state is
touched by the change: the additions are one derived value and two conditional render blocks.

**Browser verification was NOT performed** *(at the time this section was written — since closed,
see §20)*. The Claude-in-Chrome extension is not connected in this environment
(`Browser extension is not connected`), so the light/dark, mobile and hierarchy pass
requested by Phase 14 could not be run. What was verified instead: the three states' copy and
marker logic deterministically (above), the contrast ratios computed from the actual color values,
and `tsc --noEmit` clean. **A visual pass remains outstanding** and is recorded as a blocker in §13.

> **Closed in §20.** The pass was subsequently run in real Chromium 148 driven by Playwright (the
> repo already carries it in `frontend-next`), which does not depend on the browser extension. It
> confirmed the marker logic in the rendered DOM — and found two presentation defects these
> isolated unit tests could not see, both repaired in §20.4/§20.5.

---

## 9. Citation selection unchanged (Phase 9)

| Gate | Result |
|---|---|
| Tracked 31-case gold set (via shadow harness) | **31/31 correct, 0 wrong-regime** |
| `evidence-foundation.ts` diff | **14 insertions, 0 deletions — comments and optional type fields only, zero logic** |
| Live API citations | `29 CFR 1926.501`, `29 CFR 1926.300(b)(2)` — unchanged, matching gold-set expectations |
| Display matrix | annotates all 23 emitted citations, **removes none** |

Hazard recognition, ranking, wrong-regime guards, jurisdiction inference and multi-hazard
decomposition are untouched: no file under `classifier/`, `risk/`, `intelligence/` or
`action-engine/` was modified.

---

## 10. `suggest()` contract (Phase 10)

`suggest()` returns corpus rows **directly**, so it is the path where filtering would change *which*
standards a customer sees, not merely how they are decorated. Every result is now annotated with
the same canonical status.

It deliberately **does not filter**. Removing unapproved rows today would delete real results for
every customer (0 of 26 approved). Ordering, membership and count are untouched — the change is a
`.map()` that adds three fields after ranking and limiting. Contract readiness, not cutover.

---

## 11. API / DTO and the report boundary (Phases 11, 13)

`FindingStandardCandidate` gains `backingStatus` and `contentDisclosure`; `corpusBacked` is
documented as derived. The frontend types mirror this. Clients must not infer authority from
`sourceKey`, from the presence of text, or from a generic truthy field.

**One narrow production fix was required to make the contract reach clients.**
`standardCandidates()` in `hazlenz-evidence-boundary.ts` projects to a fixed allowlist and runs
twice, so it was silently dropping the annotation — the same reason `corpusBacked` never appeared
in any API response before KG-3C. The four backing fields are now carried through. No citation,
status, ordering or membership is affected; `test:hazlenz-evidence-boundary` still passes 13/13.

Verified end-to-end against the live API:

```
29 CFR 1926.501(b)(1) | backingStatus=UNAPPROVED_CONTENT | corpusBacked=false | disclosure=NONE
29 CFR 1926.501       | backingStatus=UNAPPROVED_CONTENT | corpusBacked=false | disclosure=HAZLENZ_AUTHORED
guided primaryStandard: citation=29 CFR 1926.501, backingStatus=UNAPPROVED_CONTENT,
                        sourceStatus=provisional-versioned-regulation
```

**Reports (Phase 13): no change, and none needed.** `reports.module.ts` registers no `Standard`
entity, `CanonicalReportsService` injects no standards repository, and the PDF renderer is a pure
function over persisted snapshots. Reports still never query the corpus. They also never read
`corpusBacked`, so no report representation was repaired — the false boolean never reached them.
The local PDF export drops the `"Unavailable"` tier entirely, so the reworded copy does not change
PDF output.

---

## 12. Persistence semantics (Phase 12)

`backingStatus` is **derived at analysis time and persisted with the finding's own candidate**,
alongside the `title`/`plainLanguageSummary` already frozen there. It is not recomputed against
the current active release when Standard Detail loads.

This is deliberate and matches KG-1: an old finding must not silently flip approved ↔ unapproved
because the active pointer moved. Historical resolution is available (`resolveGovernedCitation`
against an explicit release, verified in §Phase 17 below) but is **not wired into the live path**.

**Transitional behaviour, stated exactly.** Real analyses still record `knowledgeReleaseId = NULL`
(KG-1, unchanged — verified: the only 4 non-null rows are KG-1's own fixtures). With no release
recorded and no active release, the live path resolves `UNAPPROVED_CONTENT` for every corpus-backed
citation and `CITATION_ONLY` for the rest. That is truthful today. Once analyses are release-versioned,
the persisted status will describe the release the finding was produced under.

---

## 13. Live cutover remains disabled (Phase 22)

- `grep` for `release_id =`, `releaseId =`, `reviewer_approved =`, `effectiveState` across
  `applicable-standards/`, `safescope-v2/`, `intelligence/`, `reports/`, `inspection/` returns only
  the pre-existing `reviewStateLabel` (an observed-condition display label) and KG-1's provenance
  **writer** — no retrieval filter.
- **No customer path imports** `governed-corpus-lookup`, `release-record-review.service` or
  `regulatory-release-lifecycle.service`. The live `mark()` passes no `governed` input at all.
- The display contract **annotates, never filters**: all 23 emitted citations survive
  (`The display contract annotates all 23 emitted citations and removes none`), `suggest()` returns
  the same rows in the same order, and the gold set is 31/31 with 0 wrong-regime.
- Corpus shadow measurement is unchanged from KG-3B: 26 currently retrievable → 0 governed
  retrievable, confirming no filter was switched on.

Nothing was removed from any customer result because the corpus has not been remediated.

---

## 14. Real-corpus transition (Phase 19)

Measured on `federal-core-2026-07-30.1` (`corpus-transition-report.json`):

| Metric | Value |
|---|---|
| Records | 26 |
| `APPROVED_GOVERNED_CONTENT` | **0** |
| `UNAPPROVED_CONTENT` | **26** |
| `CITATION_ONLY` | 0 |
| …restricted to citations HazLenz emits | 15, all `UNAPPROVED_CONTENT` |
| **Falsely claimed backed under the old rule** | **26 of 26** |
| …of which placeholder-provenance | **4** |

That is the headline: the old rule claimed corpus backing for **every** record; the truthful
contract backs **none**. No citation and no text is lost — only the false claim.

Over the 23 citations HazLenz actually emits, against the reviewed fixture release
(`display-contract-matrix.json`): 6 `APPROVED_GOVERNED_CONTENT`, 9 `UNAPPROVED_CONTENT`,
8 `CITATION_ONLY` — all three states exercised by real emissions.

---

## 15. First KG-3D remediation target (Phase 20)

**`1910.36` is confirmed as the first target.** It is the **only** placeholder-provenance record
HazLenz actually emits:

| Citation | Emitted | Text | Summary | Source key |
|---|---|---|---|---|
| **`1910.36`** | **yes** | yes | yes | `starter-unverified:osha:1910.36` |
| `1910.146` | no | yes | yes | `starter-unverified:osha:1910.146` |
| `1910.22(a)` | no | yes | yes | `starter-unverified:osha:1910.22(a)` |
| `1910.303(b)(1)` | no | yes | yes | `starter-unverified:osha:1910.303(b)(1)` |

- **Why HazLenz emits it** — exit-route/egress observations resolve to it through the in-code
  selection engine, independent of the corpus.
- **Current state** — the finalizer synthesized its source key because the row arrived with no
  source metadata. Frozen `unreviewed`; not approvable (KG-3B `frozenStateEligible` gate).
- **Evidence required** — register eCFR 1910 as the authoritative source, re-attach provenance to
  the row, finalize a new release, then perform a checksum-bound review.
- **Expected impact** — moves from `UNAPPROVED_CONTENT` to eligible-for-review, then to
  `APPROVED_GOVERNED_CONTENT`, becoming the first citation to earn the verified marker.

**Not remediated in KG-3C.** No record was approved, and no content was fetched or ingested.

**A second finding for KG-3D:** HazLenz emits `29 CFR 1910.303` (no subsection) while the corpus
holds `1910.303(b)(1)`. Release identity preserves subsections by design, so the emitted citation
resolves to `CITATION_ONLY` rather than to the corpus record. That mismatch is a remediation item,
not a contract defect.

---

## 16. Regressions (Phase 21)

| Gate | Result |
|---|---|
| Backend build (`npm run build`) | **pass**, clean |
| `test:standards-backing-contract` (new) | **35/35** |
| Frontend presentation contract (new) | **16/16** |
| `test:governed-corpus-matrix` (extended) | **59/59** (was 49/49; +10 display-contract checks) |
| `test:reviewer-approval` (KG-3B) | **62/62** |
| `test:release-integrity-and-approval` (KG-3A) | **50/50** |
| `test:regulatory-release-lifecycle` (KG-2) | **42/42** |
| `test:knowledge-release-provenance` (KG-1) | **27/27** |
| `test:guided-finding-response` | **27 assertions**, passed |
| `test:evidence-foundation` | **35 assertions**, passed |
| `test:hazlenz-evidence-boundary` | **13 assertions**, passed |
| `test:entitlement-grant-helper` | **5/5** |
| `test:canonical-workflow` | passed, 25 scenarios (re-run after the boundary fix) |
| `test:persisted-decomposition-findings` | passed |
| `test:finding-scoped-reviews` | passed |
| `test:safescope-standards` | 15 passed, 0 failed |
| `test:standards-corpus-integrity` | all invariants passed |
| `validate:hazlenz-knowledge-index` | Validation Passed |
| Tracked gold set (via shadow) | **31/31**, 0 wrong-regime |
| `test:hazlenz-core` | **the two documented baseline failures only** — Golden Hardening Scenarios, HazLenz Production Path. No new failures (re-run after the boundary fix) |
| Frontend `tsc --noEmit` | pass |
| `git diff --check` | clean |

**`test:private-storage-reports` did not complete.** Its first run failed with
`429 ThrottlerException` on `POST /auth/register` — the auth rate limiter, tripped by running many
registration-creating suites back to back against one server. Retries exceeded the harness command
timeout. This is a **test-infrastructure/environment condition, not a KG-3C result**, and it is
recorded as outstanding in §17 rather than reported as a pass.

---

## 17. Changed files

**New:**

| File | sha256 |
|---|---|
| `backend/src/standards/display/standards-backing-contract.ts` | `d6e282fb7a112c04ae2e7297089209f16275c1c6b7746834e8610caeeb073688` |
| `backend/scripts/test-standards-backing-contract.ts` | `d25d7790818cd4605ac41bdf7408ea020ade26859aebc73323952a2bc1e70648` |
| `frontend-next/lib/inspection/__tests__/standardDisplayBacking.test.ts` | `dd1619d28fe2af8d40cf69db9fd72eb0c80d7d75d7460d1e7d0cb0a5fee543c8` |

**Modified (KG-3C):**

| File | sha256 | Change |
|---|---|---|
| `backend/src/safescope-v2/safescope-v2.service.ts` | `03c4aa1007679a978fa6d4bebef4e9cd7dc4190aba535001436323f73c58e6a4` | `mark()` derives backing instead of `Boolean(sourceKey)` |
| `backend/src/safescope-v2/display/guided-finding-response.ts` | `21f95ec390f6032758f79285ac07995f199604517c18d17e4679cb7df920687c` | `sourceStatus` mapped from status; adds `backingStatus`/`backingNotice` |
| `backend/src/safescope-v2/display/hazlenz-evidence-boundary.ts` | `f3ec4564fdc1b9b781000acf6efb96dc50d978a71969586387912cf958458ca0` | projection carries the backing fields |
| `backend/src/safescope-v2/evidence/evidence-foundation.ts` | `cb5f31625a48d56a64264804ddda92bc5c8d5a7a5f8046ddfd9e0dd83ed4e4ef` | **types/comments only** |
| `backend/src/applicable-standards/applicable-standards.service.ts` | `176ee0328a0923573f840d95dc4a48fb2310d23154672dd16ecc74b2d4ea0146` | `suggest()` annotates results (no filtering) |
| `frontend-next/lib/inspection/standardDisplay.ts` | `4fae83c6c0f19d126aa970df1086ae76f102067c21f293565220bdeb1e38bf69` | `getStandardBackingPresentation`; unavailable copy |
| `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` | `29cb8970cccce2c69e6a00b5755f9835b0d5738d4c47252b39ae54575f915d9b` | verified badge |
| `frontend-next/app/inspection-workspace/page.tsx` | `3f6de50f382a947f9f95eab03cf6f24d0ef9aa2e6c129c3b280fad057f99332a` | badge + notice in Standard Detail; types |
| `backend/scripts/test-governed-corpus-matrix.ts` | `0f500e5e7b6ca264e26b7abab658a83c0621ef89aff2e748caba39229d9f3d1e` | +10 display-contract checks |
| `backend/scripts/report-corpus-migration-inventory.ts` | `1055cfcf8fb3dd0f2a9ea474c7ad353fbac35d6ee2b004895ca2e3aa9066281d` | + transition counts |
| `backend/package.json` | `049b4af3b6da7207f8bc5f785060ef9f919e7a4044d07370d8fa3eed1f2df7f2` | one new script |

**Unchanged since KG-3B** (re-verified): all KG-1 files, all `standards/releases/` modules, all four
migrations, `data-source.ts`, `finalize-regulatory-release.ts`, and the KG-1/2/3A/3B suites.

**Diff separation (Phase 24).** KG-1 = 4 modified + 2 new · KG-2 = 4 + 3 · KG-3A = 6 + 6 ·
KG-3B = 5 + 8 · KG-3C = 8 + 3 · test infrastructure = `grant-test-entitlement.ts`,
`test-canonical-workflow.ts`, `test-entitlement-grant-helper.ts` · verification artifacts under
`verification/hazlenz-governed-knowledge-growth-2026-08-19/`. **No change to billing, auth,
pricing, hazard recognition, risk, corrective actions, the action engine, or inspection workflow**
— `git status` for those directories is empty.

---

## 18. Remaining blockers

1. ~~**Visual/browser verification outstanding** (Phase 14).~~ **CLOSED — §20.3–20.8.** Run in real
   Chromium 148 via Playwright across light, dark and 390px mobile for all three states. Two
   presentation defects found and repaired.
2. ~~**`test:private-storage-reports` unresolved**~~ **CLOSED — §20.2.** It passes
   (`passed: true, scenarios: 12`) on a clean server. The 429 was real but was masking a second,
   deterministic failure: the suite was stale against the schema. Both are diagnosed in §20.2.
3. **`corpusBacked` still exists** as a compatibility boolean. It is now derived and truthful, but
   two fields expressing one fact invites future drift; retire it once clients read `backingStatus`.
4. **`suggest()` is annotated, not governed.** It still returns unapproved rows — correct for now,
   but it is the path where the cutover will actually change results.
5. **Real analyses remain unversioned** (`knowledgeReleaseId = NULL`), so persisted backing status
   describes "no governed release", not a specific historical one (§12).
6. **0 of 26 records approved.** The contract is ready; the corpus is not.

---

## 19. Recommended next slice

**KG-3D — corpus remediation**, in this order:

1. Remediate `1910.36`'s provenance (register eCFR 1910, re-attach source metadata, finalize a new
   release), then review it under KG-3B's checksum-bound mechanism. It becomes the first citation
   to earn the verified marker, and the first end-to-end proof of the contract on real content.
2. Resolve the `1910.303` / `1910.303(b)(1)` subsection mismatch.
3. Review the 14 `READY_FOR_REVIEW` records, prioritising the 15 in demonstrated use.
4. Remediate the remaining 3 placeholder records.

**Then KG-3E — the cutover**, once approved coverage of emitted citations is high enough that
`CITATION_ONLY` is a rare state rather than the normal one. Give `suggest()` a filtering policy at
the same time, since it is the path that will actually lose results.

---

# 20. Verification closure — browser pass and `private-storage-reports` (2026-08-19)

| Item | Value |
|---|---|
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` |
| Prior-slice hashes | **30/30 matched** before any edit (KG-1/KG-2/KG-3A/KG-3B); the 3 files KG-3C had superseded matched KG-3C's own table |
| Protected tags | all 23 intact, incl. `insite-inspection-ui-verified-2026-08-19` → `4c7a501d` |
| Stashes | the four pre-existing stashes untouched |
| `Safety InSite Logos/` | untouched (still untracked; every file predates this work) |
| Disposable DBs added | `test_kg3c_browser_20260819`, `test_kg3c_reports_20260819` |
| `safescope` dev DB | **untouched** — every DB-touching command proved a `test_*` target first and refused otherwise |

## 20.1 Environment

| Component | Value |
|---|---|
| Browser | **Chromium 148.0.7778.96**, real headless Chromium driven by Playwright from `frontend-next/node_modules` |
| Backend (display fixtures) | `http://127.0.0.1:4310`, `NODE_ENV=test`, `STORAGE_PROVIDER=local_test`, `CORS_ORIGINS=http://127.0.0.1:3310,http://localhost:3310` |
| Backend (reports suite) | `http://127.0.0.1:4311`, dedicated process so no other suite could spend its throttle budget |
| Frontend | `http://127.0.0.1:3310`, Next.js 16.2.12 dev (Turbopack), `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4310` |
| Display DB | `test_kg3c_browser_20260819` — 45 migrations, seed manifest `6043d639…f240e1e` (reproduces KG-3A/3B/3C exactly) |
| Reports DB | `test_kg3c_reports_20260819` — same 45 migrations and same manifest checksum |

The Claude-in-Chrome extension is still unavailable here. Playwright's bundled Chromium is a real
browser and additionally gives deterministic control of viewport, `prefers-color-scheme` and
device scale, which is what makes the light/dark/mobile evidence reproducible rather than
dependent on an attached desktop browser.

## 20.2 `test:private-storage-reports` — **PASSES**, and the prior 429 was masking a real defect

```
{"passed":true,"scenarios":12,"reportId":"…","version1Checksum":"595c28c5…","version2Checksum":"f68f3f2a…",
 "persistence":{"reports":1,"versions":2,"objects":4,"audits":4},"crossUserDownload":404}
```

**Three distinct things were tangled together, and §16 named only the first.**

1. **The 429 was real, and is fully explained.** `POST /auth/register` is throttled at
   **5 requests / 60 s**, keyed by IP; every suite calls it from `127.0.0.1`. The suite itself needs
   only **2** registrations, so it can never exhaust the budget alone — but running it after several
   other registration-creating suites against one server does. Confirmed by construction: on a fresh
   server its 2 registrations both returned `201`.

2. **Underneath it sat a deterministic failure the 429 hid.** Once registration succeeded, the suite
   failed on `entitlement_grants_tier_check`. Migration `1800000005900-RetireExpertTier` retired the
   Expert tier (Pro now includes everything Expert granted) and tightened the constraint to
   `tier IN ('pro')`; the suite still inserted `tier='expert'`. It had been stale against the schema
   since that migration — nothing to do with KG-3C.

3. **The failure presented as a hang, not an error**, which is why the previous session read it as
   "retries exceeded the harness timeout". `main().catch()` logged and set `process.exitCode`, but
   the `pg` client opened earlier was never closed on the error path, so its live connection kept the
   event loop alive forever. Four such processes were found still running from the previous session
   (up to 1h07m old) and were terminated. A suite that hangs instead of failing is a
   verification-integrity problem in its own right: it converts a red result into an ambiguous one.

**Fixes — both in test infrastructure; production throttling untouched.**

- `tier: 'expert'` → `'pro'`, matching the migration's own remap and the convention already
  corrected in `grant-test-entitlement.ts`.
- the failure path now closes the `pg` client, so a failure reports as a failure.

No throttle limit was raised, disabled or bypassed, no sleep was added, and no production security
behaviour was altered.

**Still stale elsewhere (pre-existing, NOT fixed here — outside this task's scope):**
`test-entitlement-boundary.ts`, `test-entitlement-operations.ts` and
`test-authenticated-entitlement-path.ts` still insert `tier='expert'` and will fail the same
constraint. Recommended as a small separate cleanup.

## 20.3 Fixtures — real product pathway

Three findings were produced by driving the real API end to end
(`register → site → inspection → observation → POST /safescope-v2/classify → persisted analysis →
decomposed findings`), so each carries its own genuinely persisted `standardCandidates`:

| Finding | Citation | Backing on the live path |
|---|---|---|
| Fall protection | `29 CFR 1926.501` | `UNAPPROVED_CONTENT` → `APPROVED_GOVERNED_CONTENT` after a real review |
| Egress | `29 CFR 1926.34(a)` | `UNAPPROVED_CONTENT` |
| Excavation | `29 CFR 1926.652(a)(1)` | `CITATION_ONLY` (candidate summary is genuinely `null`) |

States B and C arose **naturally from the live path** — no construction was needed, which is itself
a confirmation of §12's "truthful today" claim. State A required an approval, performed for real
through the KG-3B checksum-bound mechanism (`ReleaseRecordReviewService.approveRecord`,
`expectedChecksum=0a2b948e…`, outcome `approved`); the resulting status was then computed by the
**real** contract (`resolveGovernedCitation` + `resolveStandardsBacking`) and written to the
persisted candidate. Only the wiring from governed resolution into the live `mark()` is stood in
for — and that wiring *is* the deliberately disabled cutover, so it cannot be exercised without
enabling it.

## 20.4 Defect 1 — CITATION_ONLY rendered a match rationale as a standard summary · **REPAIRED**

The browser pass showed the Standard Detail panel for `29 CFR 1926.652(a)(1)` rendering:

```
HAZLENZ STANDARD SUMMARY
Supported by submitted evidence for OSHA Construction excavation protective systems;
qualified review remains required.
Verified standard text is not currently available for this citation.
```

The candidate's `plainLanguageSummary` is `null`, so `resolveSelectedFindingStandard` fell back to
`primaryRaw.simplifiedRequirement` — which for an unbacked citation is the **match rationale**, the
same sentence shown under "Why HazLenz selected this". So a selection rationale was presented as a
description of the regulation, directly above the notice saying no verified text was available.
This contradicted the contract §5–7 states for `CITATION_ONLY` ("citation and title; **no fabricated
body text**").

**Why the 16 unit tests missed it:** they exercise the presentation helpers in isolation, where the
text and the backing status come from the same object. The defect only exists in the page-level
composition, where the fallback text arrives from a *different source* than the status — exactly the
class of bug a rendered-DOM pass exists to catch.

**Repair (smallest, and in the layer that already owns the rule):** `StandardBackingPresentation`
gained `allowsContentText`, false only for `CITATION_ONLY`, and the Standard Detail summary tier is
gated on it. Callers must consult the flag rather than infer from their own text — the same
discipline as never inferring backing from a source key. Three assertions were added to the
presentation suite (now **19/19**).

## 20.5 Defect 2 — verified badge fragmented on mobile · **REPAIRED**

At 390 px the badge wrapped mid-phrase and the pill rendered as **two** separate rounded fragments
("VERIFIED" / "STANDARD TEXT"). Repaired with `whitespace-nowrap` on the badge span in both render
sites (Standard Detail and `SafeScopeStandardsSection`). Re-verified: one intact pill, no clipping,
no horizontal overflow.

## 20.6 Correction to §16 — frontend typecheck did **not** pass as recorded

§16 records "Frontend `tsc --noEmit` | pass". It did not: `standardDisplayBacking.test.ts:65` raised
`TS2367`, because TypeScript can prove the label union excludes `"Official standard text"` and so
flags that comparison as impossible. The assertion is still the runtime guard that would catch
someone re-adding the tier, so it was kept and the comparison widened to `string` rather than
deleted. `tsc --noEmit` now genuinely exits 0.

## 20.7 Rendered-DOM results — all three states × light / dark / mobile / mobile-dark

Every combination asserted against the live DOM (**12/12 pass**, `browser-verification-results.json`):

| State | Citation visible | Verified badge | Unavailable notice | Body text |
|---|---|---|---|---|
| `APPROVED_GOVERNED_CONTENT` | yes | **yes** | no | approved text shown |
| `UNAPPROVED_CONTENT` | yes | **no** | no | shown under "HazLenz standard summary" |
| `CITATION_ONLY` | yes | **no** | **yes** | **none** (after §20.4) |

Also asserted in every view: no horizontal page overflow (`scrollWidth == innerWidth == 390` on
mobile), non-zero card geometry, and **no internal vocabulary anywhere in the page text** —
`starter-unverified`, `reviewer_approved`, `recordChecksum`, `corpusBacked`, `backingStatus`,
`effectiveReviewState`, `releaseId`, `mechanically_validated` and the three status literals.

**Contrast, measured from the live computed styles** (not from source constants):

| Pair | Ratio |
|---|---|
| badge emerald-800 on emerald-100 (light) | **6.78:1** |
| badge emerald-300 on the blended emerald-950/28 % card (dark) | **9.98:1** |
| unavailable notice slate-600 on card (light) | **7.24:1** |
| unavailable notice slate-300 on card (dark) | **11.64:1** |
| card body text on card (light / dark) | **17.06:1** / **16.52:1** |

The light badge value reproduces §5–7's 6.78:1 exactly. The dark badge measures 9.98:1 rather than
the recorded 9.94:1 because the browser composites the 28 %-alpha emerald-950 over the card surface;
the recorded figure assumed the opaque colour. Both clear WCAG AA.

**Visual inspection (§Phase 4/7, done by eye on the captures, not inferred from the ratios):**
hierarchy reads citation → title → summary → rationale → confidence in every view; the badge sits
inline with the summary label and is legible in both themes; no clipping, no text collision, no
broken card, no desktop-only assumption. Light and dark carry identical semantics — the approved
state stays distinguishable, the citation-only notice stays readable, and no hard-coded light-only
or dark-only styling was found.

## 20.8 Standard Detail E2E, placeholder gate, mobile workflow — **34/34 pass**

`e2e-verification-results.json`.

- **Standard Detail (Phase 5).** For all three states: the expander opens the "Official regulation
  text" panel (the separate `regulatory_sections` surface of §1.2, which KG-3C does not govern);
  after the round-trip the citation and the backing state are unchanged; switching to another
  finding and back restores that finding's own citation and state, with **no stale content** from
  the other standard.
- **Placeholder `1910.36` (Phase 6).** Reproduced through a general-industry inspection (the
  construction context resolves egress to `1926.34(a)` instead). Corpus row confirmed as
  `starter-unverified:osha:1910.36`, frozen `unreviewed`. Rendered in light, dark and mobile: the
  live path yields `UNAPPROVED_CONTENT` with `corpusBacked=false`, it is **not** marked "Verified
  standard text", it is not described as corpus-backed, and **no `starter-unverified` string reaches
  the UI**. Its source was not remediated.
- **Mobile workflow (Phase 8).** finding → standard card → open detail → return at 390×844: finding
  and backing state preserved, review control 40 px tall, detail control 68 px, and no horizontal
  page scroll with the panel open or closed.

## 20.9 Live cutover remains disabled — re-proved

- Gold set **31/31 correct under both the current engine and governed filtering, 0 wrong-regime**.
- Corpus shadow: **26 currently retrievable → 0 governed retrievable**, identical to KG-3B — no
  filter was switched on.
- `grep` across `applicable-standards/`, `safescope-v2/`, `reports/`, `inspection/` returns only
  KG-1's provenance **writer** (`knowledge-release-provenance.ts:74`) and a single **comment**
  reference to the lifecycle service. **No customer path imports the governed resolver.**
- Citation identity, counts, ranking, hazard recognition, risk and corrective actions are unchanged:
  no file under `classifier/`, `risk/`, `intelligence/` or `action-engine/` was touched, and
  `git status` for `billing/`, `auth/`, `action-engine/`, `risk/`, `classifier/` is empty.

## 20.10 Final regression

| Gate | Result |
|---|---|
| Backend build (`npm run build`) | **pass**, exit 0 |
| `test:standards-backing-contract` | **35/35** |
| Frontend presentation contract | **19/19** (was 16/16; +3 for `allowsContentText`) |
| `test:governed-corpus-matrix` | **59/59** |
| `test:reviewer-approval` (KG-3B) | **62/62** |
| `test:release-integrity-and-approval` (KG-3A) | **50/50** |
| `test:regulatory-release-lifecycle` (KG-2) | **42/42** |
| `test:safescope-standards` | **15 passed, 0 failed** |
| Gold set via shadow | **31/31, 0 wrong-regime** |
| `test:canonical-workflow` | **passed, 25 scenarios** |
| `test:private-storage-reports` | **passed, 12 scenarios** |
| Browser display contract | **12/12** |
| Standard Detail / placeholder / mobile | **34/34** |
| Frontend `tsc --noEmit` | **pass, exit 0** (see §20.6) |
| `git diff --check` | clean, exit 0 |
| `test:hazlenz-core` | **the two documented baseline failures only** — Golden Hardening Scenarios, HazLenz Production Path. 29 of 31 suites pass; no new failures |

## 20.11 Report regression boundary (Phase 11)

`test:private-storage-reports` proves KG-3C changed no report behaviour: generation succeeds, two
immutable versions with **distinct checksums**, 4 storage objects and 4 audit events, regeneration
without a source change is idempotent, a foreign user's report POST is denied and a cross-user
download returns **404**. Reports remain built from the frozen analysis/finding snapshots — no
standards-backing work introduced any live-corpus read into report content.

## 20.12 Files changed in this closure

| File | sha256 | Change |
|---|---|---|
| `frontend-next/lib/inspection/standardDisplay.ts` | `e17787e270f57793c79dfb6e266ddfe74507c39f0d4f36d853c0c403622e9e1a` | `allowsContentText` on the presentation state (§20.4) |
| `frontend-next/app/inspection-workspace/page.tsx` | `27584e5b474aeefa468ef4bc2f66fdbc7e3e66716e9dc9ae10ec20991ec345f9` | summary tier gated on `allowsContentText`; badge `whitespace-nowrap` |
| `frontend-next/components/inspection/SafeScopeStandardsSection.tsx` | `5da7d89ed31800542b6ce6a04bb9825ad43106bcd1a0fdc7f91501a410c909c8` | badge `whitespace-nowrap` |
| `frontend-next/lib/inspection/__tests__/standardDisplayBacking.test.ts` | `df90cc60589c3fe677ab20d49cb6b37c701eee91bec9ba8a25e0eda17555911e` | +3 assertions; TS2367 widened (§20.6) |
| `backend/scripts/test-private-storage-reports.ts` | `d18037fbeffd3d2cad40710b50f9c83595e067156c653e2aadab1037d77759cd` | tier `expert`→`pro`; failure path closes the pg client (§20.2) |

**No backend production file changed in this closure** — all five KG-3C backend hashes still match
§17 byte for byte (`standards-backing-contract.ts` `d6e282fb…`, `safescope-v2.service.ts`
`03c4aa10…`, `guided-finding-response.ts` `21f95ec3…`, `hazlenz-evidence-boundary.ts` `f3ec4564…`,
`applicable-standards.service.ts` `176ee032…`).

## 20.13 Observation for KG-3E, not a defect today

On the approved fixture the panel shows the "Verified standard text" badge while
`confidenceLimitReason` still reads *"Regulatory source approval or release coverage limits
confidence."* That line comes from the guided response, which is computed on the live (ungoverned)
path, whereas the badge came from the patched candidate. **It cannot occur in the product today** —
0 of 26 records are approved, so nothing reaches `APPROVED_GOVERNED_CONTENT` on the live path. It is
an artifact of the fixture's split. When the cutover lands, `mark()` will pass the governed
resolution and both values must be derived from it consistently; otherwise this pairing becomes a
real customer-visible contradiction. **Flagged as a KG-3E acceptance criterion.**

## 20.14 Worktree state at closure

HEAD `5f050858…` unchanged, branch `release/insite-rc-2026-08-18`, all 23 tags intact
(`insite-inspection-ui-verified-2026-08-19` → `4c7a501d`), the four pre-existing stashes untouched,
nothing committed, pushed or deployed. All disposable servers were stopped; the four disposable
databases were retained for re-inspection. `git diff --check` clean.

**One unrelated modification appeared during this session and was deliberately left alone:**
`frontend-next/app/page.tsx` (the marketing home page) became modified at 21:57 with a layout and
copy restructure. It was not in the starting `git status`, was not produced by any command in this
closure, and contains **zero** references to `backingStatus`, `verifiedBadge`, `allowsContentText`
or `standardDisplay` — it does not intersect KG-3C. It is recorded here rather than reverted, per
the worktree-protection rule. `tsc --noEmit` and the presentation suite were re-run **after** it
landed and both still pass.
