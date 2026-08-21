# KG-3D — Real Corpus Remediation and Review Readiness · Verification Record

| Item | Value |
|---|---|
| Slice | KG-3D (production corpus remediation + review readiness) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` (upstream `origin/release/insite-rc-2026-08-18`) |
| Disposable DBs | `test_kg3d_remediation_20260819`, `test_kg3d_regression_20260819`, `test_kg3d_reports_20260819` |
| `safescope` dev DB | **untouched** — every DB-touching command proved a `test_*` target first |
| Governed read-path cutover | **still disabled** (§10) |
| **Remediation machinery** | **REMEDIATION_MECHANISM_READY** |
| **Corpus** | **CORPUS_CUTOVER_NOT_READY** — 7 of 23 emitted citations backed (§9) |

**The headline.** KG-3A/3B/3C built the governance machinery and proved every part of it on
fixtures. KG-3D is the first slice to run it against real regulatory content, and it produced the
first seven genuinely reviewer-approved records in the product's history — each one compared
clause by clause against the authoritative eCFR text, with the comparison preserved as evidence.
It also found that the record it was sent to fix was not merely missing provenance: **it stated the
law incorrectly**, and had done so since the starter seed.

---

## 1. Phase 0 — starting state

All 25 prior-slice file hashes (KG-1/KG-2/KG-3A/KG-3B from the KG-3B record, KG-3C from its own
§17/§20.12) **matched byte for byte** before any edit. HEAD, branch, upstream, the four pre-existing
stashes and all 23 tags — including `insite-inspection-ui-verified-2026-08-19` — were intact and
remain so.

The disposable database reproduced the recorded baseline exactly: **26 records, manifest
`6043d6392a87beed22ad3386d35848f8172867dbc67d4a203a2d6f316f240e1e`, 4 placeholder-source,
0 reviewer-approved** — the same manifest checksum KG-3A, KG-3B and KG-3C all recorded.

`frontend-next/app/page.tsx` was recorded at
`76b4e50628bafda18da0b487a0c63afb48bc7440a265c3711ed759a98e41e9a0` before any work and **is
byte-identical at the end** (§12).

---

## 2. Phase 1 — the ranked remediation queue

All 26 baseline records are authority-tier 1. The queue that actually drove the work:

| Rank | Class | Records | Basis |
|---|---|---|---|
| 1 | HazLenz-emitted **PLACEHOLDER_SOURCE** | **1** — `1910.36` | emitted *and* unprovenanced |
| 2 | HazLenz-emitted **citation mismatch** | **1** — `1910.303` vs `1910.303(b)(1)` | emitted citation resolves to nothing |
| 3 | HazLenz-emitted **READY_FOR_REVIEW** | **14** | all 14 READY_FOR_REVIEW records are emitted |
| 4 | other READY_FOR_REVIEW | **0** | — |
| 5 | **NOT_CURRENTLY_USED** | **8** | no demonstrated product use |
| — | non-emitted PLACEHOLDER_SOURCE | **3** — `1910.146`, `1910.22(a)`, `1910.303(b)(1)` | deferred |

A distinction that mattered more than the disposition labels: **8 of the 26 records already carry a
recorded `sourceUrl` and `retrievalDate`** (retrieved 2026-08-18), and 18 do not. That, not the
`READY_FOR_REVIEW` label, is what determines whether a record can be *substantively* reviewed
today — a reviewer cannot compare against a source the row never recorded. It became the
Phase 13 classification (§7).

---

## 3. Phases 2–5 — `1910.36`: what was actually wrong

### 3.1 Root cause of the placeholder

`1910.36` exists **only** in the starter seed `safescope-v2/standards/safescope-standards.seed.ts`,
which carries no source fields at all. It is absent from
`safescope-v2/standards-intelligence/standards-intelligence.seed.ts`, the seed that attaches
registered source metadata via `buildSourceRegistryMetadata()`. With `source_key` null,
`finalize-regulatory-release.ts` synthesized `starter-unverified:osha:1910.36`.

So the placeholder was not a data-entry slip. **The record was never routed through the
provenance-bearing seed at all**, and the same is true of the other three placeholder records.

### 3.2 The larger finding — the stored text stated the wrong law

| Field | Corpus (baseline) | Authoritative (eCFR, title 29 up-to-date-as-of 2026-08-18) |
|---|---|---|
| title | `Exit routes` | **`Design and construction requirements for exit routes`** |
| text | `Exit routes must be permanent, unobstructed, and adequate for emergency egress.` | (a)–(h): permanence, number, discharge, unlocked doors, side-hinged doors, capacity, height/width, outdoor routes |

**"Unobstructed" is not in 1910.36.** It is **29 CFR 1910.37(a)(3)** — *"Exit routes must be free and
unobstructed."* The starter record imported a requirement from a neighbouring section and presented
it as this one, while omitting almost everything 1910.36 actually requires — including
**(d)(1)**, the unlocked-exit-door rule, which is the requirement most HazLenz egress findings
actually turn on.

Classification: **CONTENT_UPDATE_REQUIRED** (title + text), not merely a provenance repair.
`1910.37` was retrieved as well and is preserved as evidence so the attribution is checkable.

### 3.3 The remediation

Performed through the architecture's own mechanism, not by editing `source_key`: `29 CFR 1910.36`
was added to `STANDARDS_INTELLIGENCE_SEED`, so `withSourceRegistryMetadata()` attaches the
registered tier-1 `osha-ecfr-1910` provenance the other records carry, plus `sourceUrl` and
`retrievalDate`. The sync's normalized-citation matcher **updated the existing row rather than
inserting a duplicate** (`1910.36` and `29 CFR 1910.36` both normalize to `191036`) — verified by a
dry run reporting **0 inserts / 23 updates**.

Per the P1 label-integrity contract, `standards_master` never stores verbatim CFR text, so the
stored summary is a HazLenz-authored paraphrase — verified clause by clause, and it now **names**
1910.37(a)(3) rather than absorbing it.

```
placeholder                    ->  starter-unverified:osha:1910.36, frozen 'unreviewed'
registered provenance          ->  osha-ecfr-1910, tier 1, primary_regulatory_authority
                                   sourceUrl + retrievalDate 2026-08-19, frozen 'mechanically_validated'
checksum-bound review          ->  reviewer_approved
KG-3C contract                 ->  APPROVED_GOVERNED_CONTENT, corpusBacked = true
```

### 3.4 Phase 4 content verification — 13/13

`1910-36-content-verification.json`. Every requirement the governed summary asserts was matched to
its source paragraph — (a)(1), (b)(1)–(b)(3), (c)(1)–(c)(2), (d)(1), (f)(1), (g)(1)–(g)(2) — and the
two conflated claims were proven **absent** from 1910.36. Verdict: **CONTENT_UPDATE_REQUIRED,
remediated and verified.**

---

## 4. Phase 6 — the first real approval

Recorded through the real KG-3B mechanism (`review:release-record -- approve`), bound to
release + citation + exact checksum, with evidence naming the source, its sha256, the
Federal Register history (`[67 FR 67961, Nov. 7, 2002, as amended at 76 FR 33606, June 8, 2011]`),
what was compared, and what was removed and why.

**`29 CFR 1910.36` is the first record in the product's history to be legitimately reviewer-approved.**

---

## 5. Phases 9–11 — `1910.303`: adjudicated, not forced

### 5.1 Mechanism

HazLenz emits the **section** `29 CFR 1910.303`; the corpus held only the **paragraph**
`1910.303(b)(1)`. `hydrateStandardReferences()` puts a subsectioned row into the exact-key map but
deliberately **not** into the base-key map, so the parent lookup misses and the citation resolves
`CITATION_ONLY`. That guard is correct and was left untouched.

### 5.2 The semantics decide it

- **`1910.303(b)(1)` is *Examination*** — *"Electric equipment shall be free from recognized
  hazards…"*
- **The rule HazLenz's predicate describes** (live parts, reachable/exposed, not guarded or
  deenergized) **is *Guarding of live parts*, `1910.303(g)(2)(i)`.**

They are different requirements. Prefix-matching would have attached an **examination** requirement
to a **guarding** finding — a wrong citation dressed up as improved coverage.

**`HAZLENZ_CITATION_TOO_BROAD` was considered and rejected on evidence.** Promoting the emitted
citation to `(g)(2)(i)` would require establishing voltage — paragraph (g) applies only at 600 V
nominal or less to ground, and (g)(2)(i) only at 50 V or more. **No HazLenz predicate establishes
voltage**, so the finding evidence does not support the paragraph. Citing the section is what the
evidence actually carries.

**Classification: `CORPUS_TOO_NARROW`.** Remedy: source the section-level content the product
already intends to cite. **No citation-selection logic was changed.** Verified 8/8 against source
(`1910-303-content-verification.json`), including that (b)(1) and (g)(2) are distinct rules.

### 5.3 A measured false positive, caught and fixed

After the record landed, the suggest() measurement showed `29 CFR 1910.303` being returned for
*"rotating shaft on the mixer has no guard"* — machine guarding, governed by 1910.212. Cause:
`suggest()` matches with a substring `ILIKE` over the whole concatenated keyword blob, and the
record carried a `guard live parts` control tag. Changed to `enclose live parts`, matching the
regulation's own *"approved cabinets or other forms of approved enclosures"*. The query returns to
**0 results** (its pre-remediation behaviour) while the electrical query still resolves correctly.

This changed the record's checksum, so **its prior approval did not carry forward** — the
governance caught it, and the record was re-verified and re-approved with the change documented in
the reviewer note. That is the change-detection contract working on real content, unprompted.

---

## 6. Phases 14–16 — the reviewed cohort

Prioritised by demonstrated product use, and bounded. **Seven records approved**, each with its own
evidence trail; `review-evidence.json` records **32/32** clause checks.

| Citation | Family | Why in the cohort |
|---|---|---|
| `29 CFR 1910.36` | emergency egress | the Phase 2–7 target |
| `29 CFR 1910.303` | electrical | the Phase 9–11 remediation |
| `29 CFR 1926.34(a)` | emergency egress | emitted; browser fixture; pairs with 1910.36 |
| `29 CFR 1926.416(a)(1)` | electrical | emitted; pairs with 1910.303 |
| `29 CFR 1926.300(b)(2)` | machine guarding | emitted; in the KG-3C live-API proof |
| `30 CFR 47.41(a)` | HazCom (mining) | primary MSHA anchor |
| `30 CFR 62.120` | noise (mining) | primary MSHA anchor |

**No mass approval.** Every approval names its own citation, its own checksum and its own evidence.
No command approved "everything validated" or "everything from source X".

**One review caught an unsourced claim.** `30 CFR 62.120`'s summary glosses *action level* with
*"an 8-hour time-weighted average sound level of 85 dBA, or equivalently a dose of 50 percent"*.
That is an assertion, not a restatement of 62.120, so it was sourced separately to **30 CFR 62.101**
and verified before approval.

### Deliberately NOT approved

| Citation | Verdict | Reason |
|---|---|---|
| `29 CFR 1926.501` | `CONTENT_DIFF_REQUIRED` | *"fall protection… at applicable elevations or conditions"* states no requirement — it omits the 6-foot trigger that is the operative fact. **The single highest-use emitted citation, and it could not be approved.** |
| `30 CFR 56.14107(a)` | `CONTENT_DIFF_REQUIRED` | omits (b), the seven-foot exemption that materially limits the rule |
| `29 CFR 1910.147` | `CONTENT_DIFF_REQUIRED` | states the purpose, not the energy-control-program requirement; title omits "(lockout/tagout)" |
| `1910.212(a)(1)` | `SOURCE_REFRESH_REQUIRED` | accurate, but no recorded source URL to review against |
| 3 placeholder records | `SOURCE_REFRESH_REQUIRED` | still `starter-unverified:` |
| 8 NOT_CURRENTLY_USED | `DEFER` | no demonstrated product use |

Approval criterion applied uniformly: **(i)** every statement accurate against the authoritative
source, **(ii)** title consistent with the codified heading, **(iii)** the summary states the
operative requirement, not merely the topic. Records failing only (iii) are accurate but too thin
to serve as governed standard content, and were deferred rather than approved.

---

## 7. Phase 13 — the 14 READY_FOR_REVIEW records reclassified

| Class | Count | Records |
|---|---|---|
| `REVIEWABLE_NOW` | **8** | the 8 carrying a recorded `sourceUrl` + `retrievalDate` |
| `CONTENT_DIFF_REQUIRED` | **3** | `1926.501`, `56.14107(a)`, `1910.147` |
| `SOURCE_REFRESH_REQUIRED` | **3** | `1910.212(a)(1)`, `56.12016`, `56.14105`-class rows with no source URL |
| `CITATION_ADJUDICATION_REQUIRED` | **0** | resolved for 1910.303 in this slice |

5 of the 8 `REVIEWABLE_NOW` were reviewed and approved; the remaining 3 (`1926.52`, `1926.59`,
`62.130`) are queued for the next slice.

---

## 8. Phase 8 — verified badge vs confidence, resolved

KG-3C §20.13 flagged that an approved standard could show **"Verified standard text"** beside
*"Regulatory source approval or release coverage limits confidence."* — but could not reproduce it,
because nothing was approved. **KG-3D reproduced it in the browser on the first try.**

Two distinct defects, both fixed minimally:

**(a) A category error in the copy.** The line renders directly beneath
`Confidence: <applicability label>`, and asserted that *content backing* limits *applicability
confidence*. Those are independent axes: whether a reviewer has attested to the text of 1926.501
says nothing about how sure HazLenz is that a fall finding falls under it. The old copy sat one line
below `confidenceLabel: 'High'` in the test fixture — asserting high confidence and limited
confidence simultaneously. New copy: *"The regulatory text shown for this standard has not completed
source review. This does not affect how HazLenz assessed applicability."*

**(b) Two independent sources for one fact.** The badge comes from the finding's persisted
candidate; `confidenceLimitReason` is computed by the guided-finding adapter on the live path. When
they disagree, the card contradicts itself. The caveat is now gated on the same presentation the
badge uses, so the card is internally consistent whichever layer resolved backing first.

**Neither fix inflates applicability confidence, and no evidence-gap messaging was removed** —
proven by the control run (§9.2) and visible in the capture: the approved 1910.36 card shows
**"Verified standard text"**, **"Confidence: Low"**, and **"Details that would increase confidence:
occupied workplace"** together. That is exactly the separation Phase 8 asked for — verified
regulatory text, with applicability confidence limited for an unrelated, legitimate reason.

The stale assertion that encoded the old copy (`/approval|coverage/i`) was replaced with two
assertions on the property, not the wording.

---

## 9. Phases 19, 20, 23 — coverage, and why the corpus is not ready

### 9.1 Counts

| Metric | KG-3C baseline | KG-3D |
|---|---|---|
| Total records | 26 | **27** (+1: section-level `1910.303`) |
| Reviewer-approved | **0** | **7** |
| `APPROVED_GOVERNED_CONTENT` | 0 | **7** |
| `UNAPPROVED_CONTENT` | 26 | 20 |
| Placeholder-source | 4 | **3** |
| Records HazLenz emits | 15 | **16** |
| Manifest | `6043d639…f240e1e` | `13e003e73698175ae49d119f2dea2115a930ef68dbc5c754f486d7e3c354d85b` |

A fresh seed of the remediated corpus into a clean database reproduced manifest `13e003e7…`
exactly — the remediation is deterministic, not a one-off hand edit.

### 9.2 The number that governs the cutover

**Overall corpus coverage: 7/27 (25.9%). HazLenz-emitted coverage: 7/23 (30.4%).**

`cutover-coverage-matrix.json` is the authoritative inventory. Of the 23 distinct citations HazLenz
actually emits:

- **7** are `APPROVED_GOVERNED_CONTENT`
- **9** have a governed record awaiting review
- **7 have no governed record at all** — `1910.28`, `1910.95`, `1910.1200`, `1926.451(g)(1)`,
  `1926.652(a)(1)`, `1926.1153`, `56.14132(a)`

**Proposed eligibility criterion — deliberately not a percentage.** The governed read path becomes
eligible when *every* citation HazLenz emits resolves to a governed record with registered
provenance, *every* emitted citation driving Standard Detail is reviewer-approved for the release
being activated, and *no* emitted citation would drop to `CITATION_ONLY` under filtering.

The reasoning is structural: citation selection is in code and has no corpus dependency, so
filtering on backing can only ever **remove** content from a citation that was already correctly
selected. The entire cost of a premature cutover is paid on emitted citations. A flat "80% approved"
rule can be satisfied by approving the 8 records nothing cites while `1926.501` — the most common
citation in the product — stays unbacked. **16 emitted citations still block eligibility.**

### 9.3 suggest() — measurement only, still unfiltered

`suggest-impact.json`, 9 representative queries, 20 results. Membership, ordering and count are
**unchanged**; KG-3D added no filter.

- **live-backed: 0.** Expected and correct — the live path passes no governed resolution, so every
  row is `UNAPPROVED_CONTENT` no matter how many approvals exist. This is itself proof the cutover
  is off.
- **governed-backed: 8 of 20.** 12 results would be removed if filtering were switched on today —
  and the *"conveyor tail pulley guard removed"* query would return **zero** results. A concrete
  cutover blocker, not an abstraction.

---

## 10. Phase 24 — live cutover still disabled

- `grep` across `applicable-standards/`, `safescope-v2/`, `reports/`, `inspection/` returns only
  KG-1's provenance **writer** (`knowledge-release-provenance.ts:74`) and a single **comment**.
  **No customer path imports the governed resolver.**
- Real analyses still record `knowledgeReleaseId = NULL`; the only non-null rows are KG-1's own
  fixtures. Re-proved.
- Corpus shadow: 27 currently retrievable → **7** governed retrievable (was 26 → 0). The movement is
  entirely attributable to the seven real approvals; no filter was switched on.
- Gold set **31/31 correct under both the current engine and governed filtering, 0 wrong-regime**.

---

## 11. Regression

| Gate | Result |
|---|---|
| Backend build (`npm run build`) | **pass**, exit 0 |
| `test:kg3d-corpus-remediation` (new) | **31/31** |
| `verify:governed-record-source` (new) | **32/32** clause checks |
| `test:standards-backing-contract` | **35/35** |
| `test:governed-corpus-matrix` | **59/59** |
| `test:reviewer-approval` (KG-3B) | **62/62** |
| `test:release-integrity-and-approval` (KG-3A) | **48/48** — see note |
| `test:regulatory-release-lifecycle` (KG-2) | **42/42** |
| `test:knowledge-release-provenance` (KG-1) | **27/27** |
| `test:safescope-standards` | **15 passed, 0 failed** |
| `test:standards-corpus-integrity` | all invariants passed |
| `test:guided-finding-response` | **28 assertions** (was 27; +1 for Phase 8) |
| `test:evidence-foundation` | **35 assertions** |
| `test:hazlenz-evidence-boundary` | **13 assertions** |
| `test:entitlement-grant-helper` | **5/5** |
| `test:canonical-workflow` | **passed, 25 scenarios** |
| `test:persisted-decomposition-findings` | passed |
| `test:finding-scoped-reviews` | passed |
| `test:private-storage-reports` | **passed, 12 scenarios** |
| `validate:hazlenz-knowledge-index` | Validation Passed |
| Gold set via shadow | **31/31, 0 wrong-regime** |
| Frontend presentation contract | **19/19** |
| Frontend `tsc --noEmit` | **pass, exit 0** |
| Browser: approved 1910.36 | **108/108** (4 views × 27 checks) |
| Browser: unapproved control | **8/8** (2 views × 4 checks) |
| `test:hazlenz-core` | **the two documented baseline failures only**; 29 of 31 suites pass |
| `git diff --check` | clean, exit 0 |

**`release-integrity-and-approval` reports 48/48 where KG-3C recorded 50/50.** Not a regression:
the suite emits **two assertions per placeholder row**, and placeholders went 4 → 3. Diffing the
check lists against the pre-remediation database confirms the only differences are the two dropped
placeholder assertions plus corpus counts moving 26 → 27 and 4 → 3. **No check was removed,
weakened or failed.**

**The two `hazlenz-core` baseline failures are byte-identical** to the pre-remediation run
(`golden-hardening-tests.ts`: *"7. LOTO energized maintenance (Not Guarding alone)"*, 16 passed /
1 failed; `hazlenz-production-path-regression.ts`: *"FAIL tagged but not locked"*). Diffed
explicitly against `test_kg3c_display_20260819`. **No new reasoning regression.**

---

## 12. Worktree, and unrelated concurrent changes

`frontend-next/app/page.tsx` is **byte-identical** to its KG-3D starting hash
`76b4e50628bafda18da0b487a0c63afb48bc7440a265c3711ed759a98e41e9a0`. It was never read into, edited,
staged or included in any KG-3D change.

**Thirteen further frontend files became modified during this session and were not touched by
KG-3D** (`about/page.tsx`, `globals.css`, `layout.tsx`, `inspections/page.tsx`,
`safety-calendar/page.tsx`, `settings/page.tsx`, `components/calendar/CalendarViewRenderer.tsx`,
`components/calendar/PriorityTodoPanel.tsx`, `components/system/ThemeController.tsx`,
`lib/auth.ts`, `lib/calendar/helpers.ts`, `lib/canonicalWorkflowApi.ts`, `lib/planEntitlements.ts`).
Their mtimes run 22:36–23:19, concurrent with but independent of this work, and **none references
any KG-3D concept**. Treated exactly as `page.tsx` was: recorded, hashed
(`unrelated-worktree-changes.sha256`), and left alone. A `next dev` server on port 3000 belonging to
that concurrent work was likewise left running — the KG-3D browser pass used an isolated copy of the
frontend in the scratchpad rather than disturb it.

This does mean the frontend `tsc --noEmit` and presentation-suite runs covered a worktree containing
those concurrent edits. Both passed.

### Files changed by KG-3D

**Production (3):**

| File | sha256 | Change |
|---|---|---|
| `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` | `004c80780533fbdf006fa64c3340d11d09aa7735d461cdf25885ed165d5d47f5` | `29 CFR 1910.36` remediated (provenance + corrected content); `29 CFR 1910.303` section-level record added |
| `backend/src/safescope-v2/display/guided-finding-response.ts` | `8e02010e0610d91401e016a5f192f33b129cc9912c6f4c6ed5bbe0bd447b9647` | Phase 8 copy fix — content-backing caveat no longer claims to limit applicability confidence |
| `frontend-next/app/inspection-workspace/page.tsx` | `086e0d50c751160da696805923e6ba333edfee53a93efba196f79b6de1ad822f` | Phase 8 — caveat gated on the same backing presentation as the badge |

**Test infrastructure (2 changed, 4 new):**

| File | sha256 |
|---|---|
| `backend/scripts/test-guided-finding-response.ts` | `25f459cd0534a737310ddecfdc96cfc235fcebaea825504b6a0640b1a16c8bb9` |
| `backend/package.json` | `df8696dd1525e8b1f4ef1b7b4af0f9056b1c18f3ce5ab4c182d1db8eb32a14b6` |
| `backend/scripts/test-kg3d-corpus-remediation.ts` | `fde243b2ceb2283b620c03df3ff52cb917b5c8eb7a9b443cf77fa720bac5876a` |
| `backend/scripts/verify-governed-record-against-source.ts` | `4ec34fcacac44f6d7e48bec66807654bb34609176e02fdce931db149f9e9e9cd` |
| `backend/scripts/measure-suggest-backing-impact.ts` | `5411140d4dac6b140aee0edfcd21cee75671527dd363f531e6aa9c06382619fc` |
| `backend/scripts/report-cutover-coverage-matrix.ts` | `d8ead89516d7097fdc63d2953ad90ce891c99f42cf504cc905474eef7e3cc596` |

**No change to** billing, auth, pricing, hazard recognition, risk, corrective actions, the action
engine, inspection flow, reports, or marketing UI. No file under `classifier/`, `risk/`,
`intelligence/` or `action-engine/` was modified. Phase 22 holds: `reports.module.ts` still registers
no `Standard` entity and reports remain built from frozen snapshots — `test:private-storage-reports`
passes 12/12.

---

## 13. Remaining blockers

1. **7 emitted citations have no governed record at all.** The largest single gap to cutover.
2. **`29 CFR 1926.501` is unapprovable as written** — the most-used citation in the product, and its
   summary states no requirement.
3. **3 placeholder records remain** (`1910.146`, `1910.22(a)`, `1910.303(b)(1)`).
4. **18 of 27 records still carry no recorded source URL**, so they cannot be substantively reviewed
   without a source refresh.
5. **Real analyses remain unversioned** (`knowledgeReleaseId = NULL`) — unchanged and correct.
6. **`suggest()` is annotated, not governed.** Filtering today would empty at least one hazard family.

---

## 14. Recommended next slice

**KG-3E — close the emitted-citation gap, in this order:**

1. **Fix the three `CONTENT_DIFF_REQUIRED` records first** — `1926.501`, `1910.147`,
   `56.14107(a)`. These are high-use citations whose stored text is too thin to approve; they are
   cheaper than new ingestion and unblock the most product surface.
2. **Source the 7 emitted citations with no record.** This is genuine ingestion work and should
   reuse the `standards-intelligence.seed` + registered-source path proven here.
3. **Refresh source URLs for the remaining unsourced records**, so review is possible at all.
4. **Remediate the last 3 placeholders.**

Only then **KG-3F — the cutover**, gated on the §9.2 criterion rather than a corpus percentage, with
a `suggest()` filtering policy decided at the same time.

---

## 15. Classification

**REMEDIATION_MECHANISM_READY.** The full path — authoritative retrieval → registered provenance →
immutable release snapshot → clause-level verification → checksum-bound approval → truthful display
→ change-detection invalidation — was exercised end to end on real regulatory content, and every
gate that was supposed to refuse did refuse, including one refusal nobody prompted (§5.3).

**CORPUS_CUTOVER_NOT_READY.** 7 of 23 emitted citations are backed; 7 have no governed record at
all; the single highest-use citation cannot be approved as written. The reviewed cohort passing says
the machinery works, not that the corpus is ready — and those are exactly the two things this slice
was asked to classify separately.
