# KG-3E — Governed Corpus Coverage + Source Integrity · Verification Record

| Item | Value |
|---|---|
| Slice | KG-3E (emitted-citation coverage, source integrity, readiness measurement) |
| Starting HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` |
| Ending HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged, nothing committed** |
| Branch | `release/insite-rc-2026-08-18` |
| Review release | `federal-core-2026-08-20.5`, manifest `bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2` |
| Disposable DBs | `test_kg3e_remediation_20260820`, `test_kg3e_regression_20260820`, `test_kg3e_reports_20260820`, `test_kg3e_ordering_probe_20260820`, `test_kg3e_deltacheck_20260820` |
| `safescope` dev DB | **untouched** — probed read-only at the end: 0 rows, 0 updated today |
| Governed read-path cutover | **still disabled** (§10) |
| **Verdict** | **CORPUS_APPROACHING_CUTOVER_READINESS** (§11) |

**The headline.** KG-3D closed with 7 of 23 emitted citations backed and named the gap as the largest
blocker to cutover. KG-3E closes almost all of it — **22 of 23 emitted citations are now
reviewer-approved**, every placeholder record is gone, and every emitted record has a source a
reviewer can check. The one citation left unbacked was left unbacked **deliberately**, because
backing it would have attached the wrong law to a real finding.

Two findings emerged that neither KG-3D nor this brief anticipated, and both bear on cutover more
than the coverage number does: `suggest()` returns different citations for the same query depending
on **physical row order in Postgres**, and checksum-bound approval **does not cover the reviewer's
source URL**. Both are documented with causal proof and neither was "fixed" inside a corpus slice.

---

## 1. Phase 0 — starting state, and one number corrected

Every prior-slice hash matched byte for byte before any edit: the 14 files in KG-3D's
`unrelated-worktree-changes.sha256`, the 9 files KG-3D recorded as its own, and the 3 KG-3C frontend
files. HEAD, branch, the four pre-existing stashes and all 23 tags — including
`insite-inspection-ui-verified-2026-08-19` → `b25103b0…` — were intact and remain so.

**Four further frontend files** (`app/command-center/page.tsx`,
`components/command-center/WeekAtAGlancePanel.tsx`, `components/layout/AppShell.tsx`,
`components/layout/MobileTabBar.tsx`) were already modified at KG-3E start and are **not** in KG-3D's
list — their mtimes run 22:29–23:12 on 2026-08-19, concurrent with KG-3D but outside it. None
references any KG concept. They were hashed into KG-3E's own `unrelated-worktree-changes.sha256`
(now **18 files**) and left alone.

The retained KG-3D database reproduced its recorded end state exactly — 27 records, 3
placeholder-source, **7 effective checksum-bound approvals**, verified by joining the append-only
decision log to the current record checksum rather than trusting the KG-3D narrative.

**One KG-3D figure is corrected.** KG-3D §13 states "18 of 27 records still carry no recorded source
URL". The measurement is **17 unsourced / 10 sourced**, and the ten are enumerable. KG-3D's own §2
recorded 8 sourced of 26 and then added two, which gives 10 of 27 — so "18" is an arithmetic slip in
its closing prose against its own §2, not a corpus difference.

---

## 2. Phase 1 — the work queue, measured live rather than inherited

`report-cutover-coverage-matrix.ts` reads its emitted-citation list from a **static KG-3C artifact**.
That was safe for KG-3D, which measured the corpus KG-3C had just measured. It is not safe for a
slice whose job is to change the corpus, so KG-3E built `report:kg3e-work-queue`, which measures
emission **live** by running the real selection engine `applyFindingScopedStandards()` over the
tracked, hash-verified 31-case gold set (`93184abc…`).

**It independently reproduced KG-3D's figures — 23 emitted citations, 7 approved, 7 with no record.**
That is a confirmation, not an assumption carried forward.

It also found something the frozen list structurally could not: **30 citations are declared by
`EXPERT_APPLICABILITY_RULES` but selected by no gold-set observation and have no governed record at
all** (`1910.303(g)(2)(i)`, `1910.28(b)(1)`, `1910.1200(f)(6)`, `1926.651`, `56.9100`, …). They are
not blockers today — nothing measured emits them — but each resolves to `CITATION_ONLY` the moment
its rule fires on a real observation. Recorded as `DECLARED_BUT_NOT_EMITTED_NO_RECORD` and carried
into the verdict.

All three KG-3D `CONTENT_DIFF_REQUIRED` verdicts were **re-validated against current checksums**
before being reused, so a stale verdict would have been detected rather than inherited. All three
still applied.

---

## 3. Phase 2 — the three records KG-3D refused

Each was reviewed independently against eCFR (title 29/30, up-to-date-as-of **2026-08-18**).

**`29 CFR 1926.501`** — the most-emitted citation in the product. *"Fall protection… at applicable
elevations or conditions"* names a topic and states no rule. Replaced with the operative
requirement. Two distinctions were checked against source rather than assumed, and both are
preserved in the record: **`(b)(4)(i)` is "MORE THAN 6 feet"**, not the "6 feet or more" of `(b)(1)`,
and **`(b)(4)(ii)–(iii)` carry no height threshold at all** — tripping into or stepping through a
hole must be covered regardless of drop. The `1926.500(a)(2)` carve-outs (scaffolds → subpart L,
cranes → CC, steel erection → R, ladders → X) are **named, not absorbed**.

**`29 CFR 1910.147`** — title restored to the codified *"The control of hazardous energy
(lockout/tagout)"*; summary moved from `(a)(3)` **purpose** language to the `(c)(1)` **energy control
program** duty. All three scope limits that make LOTO over-cited are now stated: normal production
operations `(a)(2)(ii)`, the minor-servicing Note, and the cord-and-plug exception
`(a)(2)(iii)(A)` — plus the outright construction/agriculture exclusion `(a)(1)(ii)(A)`.

**`30 CFR 56.14107(a)`** — a subtler defect than KG-3D's note implies. The citation is paragraph
`(a)`, and `(a)` genuinely does not contain the seven-foot exemption — `(b)` does. So the stored text
was not wrong *about (a)*; it was wrong *about the law*, because a reader shown `(a)` alone concludes
guarding is always required. `(b)` is now named as the limiting sibling. Separately the prior text
was **broader than the regulation**: it used HazLenz taxonomy vocabulary (*"pinch-point"*,
*"caught-in exposure"*) where MSHA enumerates the covered parts and limits the catch-all to *"similar
moving parts that can cause injury"*.

---

## 4. Phase 3 — the seven uncovered citations, and the one that was refused

**Six were sourced and approved.** `1926.451(g)(1)` and `1926.652(a)(1)` at exact paragraph level
because the predicate establishes every element those paragraphs require — `1926.652(a)(1)` is the
cleanest fit in the slice, since the observation negates **both** statutory exceptions explicitly.
`1910.28`, `1910.95`, `1910.1200` and `1926.1153` at **section** level, each for a stated reason:

- `1910.28` — the handrail rule is `(b)(11)(ii)`, but that paragraph is conditioned on *"at least 3
  treads and at least 4 risers"*, which a bare missing-handrail observation does not establish.
  Citing the paragraph would assert a tread/riser count nobody observed. **The 1910.303 error applied
  prospectively.** The record names the condition instead.
- `1910.1200` — the operative paragraph is `(f)(6)` (**workplace** labeling), not `(f)(1)`
  (**shipped** containers, a manufacturer/importer duty). That distinction decides who is cited.
- `1926.1153` — the observation does not say whether the saw is stationary or handheld, and Table 1
  treats them separately, so both entries are named rather than one chosen.
- `1910.95` — the `(b)(1)` control hierarchy is preserved: controls first, PPE only on their failure.

### `30 CFR 56.14132(a)` — refused

**The Phase 4 hazard, occurring a second time on a citation nobody was watching.**

HazLenz emits `56.14132(a)`. Paragraph `(a)` governs **manually-operated horns** being maintained in
functional condition. The predicate that emits it — *"haul truck backing without a functional backup
alarm and no spotter present"* — is governed by `(b)(1)`, and `(b)(1)(iv)` makes **an observer** one
of four permitted alternatives, which is precisely why the absence of *both* an alarm and a spotter
is a `(b)(1)` violation and not an `(a)` one.

Creating governed content for `(a)` would have put reviewer-approved **horn-maintenance** text behind
a **backup-alarm** finding, with "Verified standard text" over it. That is worse than the current
state: an unbacked citation tells the user nothing; an approved-but-wrong one tells them something
false with the product's authority behind it.

The tracked gold set's own `expectedCitations` for this case is **`56.14132`** — the section — so
HazLenz's emission of `(a)` does not match its own fixture.

**Disposition:** no record created for the emitted paragraph; the truthful **section** record
`30 CFR 56.14132` added and approved; the emitted paragraph left resolving to nothing; the selection
defect recorded for KG-3F. It was **not** "fixed" by promoting the citation to `(b)(1)`, because
`(b)(1)` is conditioned on an obstructed view the observation never states — repeating that would be
exactly KG-3D's refused `1910.303(g)(2)(i)` promotion, where voltage was never established.
**No selection logic was changed.**

---

## 5. Phase 4 — the granularity contract, made permanent

`test:kg3e-citation-granularity` — **48/48**, written against the real corpus rather than fixtures,
because what needed proving was not that the lookup functions work but that the *actual* corpus does
not permit substitution. Eight contracts:

1. **Prefix similarity is not identity** — `1910.303` and `1910.303(b)(1)` are distinct records with
   distinct checksums and distinct content.
2. **Section-level content is labelled as such** — `1910.303` attributes each rule to its own
   paragraph and preserves the 600 V / 50 V scopes.
3. **A paragraph never answers for a sibling** — `1910.303(b)(1)` never asserts the live-parts
   guarding rule as its own.
4. **Qualifiers are named, not assumed** — `1910.303(g)(2)(i)` resolves to **nothing** rather than
   falling back to its parent section; `1910.28` names the tread/riser condition; `56.14107(a)` names
   the seven-foot exemption in `(b)`.
5. **No silent fallback in either direction** — `56.14132(a)` resolves to nothing **even though the
   `56.14132` section exists and is approved**; `1926.652` (bare section) resolves to nothing despite
   `1926.652(a)(1)` existing; `1926.451(g)(2)` resolves to nothing despite `(g)(1)` existing.
6. **Selection stays in-family and in-regime** — 15 positive/negative pairs, including KG-3D's
   measured false positive (machine-guarding query must return no `1910.303`).
7. **Remediated records state the operative rule** — including that the hedging phrases
   *"may be relevant"* and *"where applicable"* are gone.
8. **Provenance** — no placeholder records; every emitted record has a source URL.

Contract 5's `56.14132(a)` case is also proved **end-to-end on the customer path** in §9.

---

## 6. Phases 5–6 — source integrity, and two defects that were invisible without a source

**The MSHA provenance repair.** `47.41(a)`, `62.120` and `62.130` recorded
`govinfo.gov/.../CFR-2023-title30-vol1` — the **2023 annual print edition**. Two problems: their
registered source `msha-30-cfr-standards` declares a baseUrl of `ecfr.gov/current/title-30`, so the
URL contradicted its own registration; and **KG-3D actually verified them against eCFR** (its retained
evidence files are eCFR documents), so the URL never named the source the review was performed
against. The eCFR text was confirmed **byte-identical** to KG-3D's retrieval, so this is a provenance
repair, not a content change.

**The OSHA registry mismatch was classified, not churned.** Five records (`1926.300(b)(2)`,
`1926.34(a)`, `1926.416(a)(1)`, `1926.52`, `1926.59`) point at `osha.gov` standardnumber pages while
`osha-ecfr-1926` declares an eCFR baseUrl. Unlike the 2023 print edition, osha.gov is **current,
agency-published primary text**. Repointing would be presentation-only churn, which Phase 5
explicitly warns against. Classified `SOURCE_URL_REGISTRY_MISMATCH` and carried to KG-3F.

**Three placeholders remediated — and none had provenance as its only defect,** exactly as KG-3D
warned from `1910.36`:

| Record | Defect beyond placeholder provenance |
|---|---|
| `1910.22(a)` | dropped `(a)(2)` entirely — the wet-process drainage and dry-standing-place duty — and the *"to the extent feasible"* qualifier limiting it |
| `1910.303(b)(1)` | title claimed parent `(b)`'s scope for a `(b)(1)` citation; omitted the eight `(b)(1)(i)–(viii)` safety considerations |
| `1910.146` | named four program elements but stated **no duty and no trigger** — the same failure mode as `1926.501` |

**Two further records had content defects that only became visible once a source was attached.** Both
were `SOURCE_REFRESH_REQUIRED` under KG-3D, a bucket that turns out to have been masking content
problems, because without a source URL nobody had compared the text to anything:

- **`1910.178(p)(1)`** — *"General industry powered industrial truck safety criteria **may be
  relevant** when defects are observed, requiring qualified review."* States no requirement, and
  *"may be relevant"* is not regulatory language. The title already named the duty; the summary never
  did. Now states `(p)(1)`: a truck found defective or in any way unsafe must be **taken out of
  service** until restored.
- **`30 CFR 56.12016`** — hedged with *"where applicable"* (not in the rule) and omitted **three of
  the section's four duties**: the warning notice posted at the power switch, that it be **signed**
  by the individuals doing the work, and the restriction on who may remove the locks.

**That is the KG-3E lesson about `SOURCE_REFRESH_REQUIRED`: it is not a lesser category than
`CONTENT_DIFF_REQUIRED`. It is an unexamined one.**

**Reporting defect fixed.** `finalize-regulatory-release.ts` counted `placeholderSourceRecords` as
rows whose `source_key` was NULL — rows about to *receive* a placeholder. After the first
finalization those rows carry a persisted `starter-unverified:` key, so the field reported **0
forever**, on a corpus with three unprovenanced records. (This is why KG-3D's reproduction log records
`placeholderSourceRecords 0` while its own §9.1 table correctly says 3.) Now counts the normalized
rows actually persisted. **Proved on a corpus with 3 placeholders and a prior finalization: reports 3
where it previously reported 0.** Manifest, checksums and content are unaffected — reporting only.

---

## 7. Phase 7 — 26 approvals, each an explicit decision

All 34 records were held to the KG-3D criterion: **(i)** every statement accurate against the
authoritative source, **(ii)** title consistent with the codified heading, **(iii)** the summary
states the operative requirement, not merely the topic.

`verify:kg3e-record-source` — **150/150 clause checks over 21 records**, each check naming the exact
source phrase that must support it. The verifier is a **separate script** from KG-3D's rather than an
extension of it: appending KG-3E claims to KG-3D's `CHECKS` array would make its checks fail when
pointed at the KG-3D release, destroying a reproduction the governance record depends on.

**One verifier defect was found and fixed rather than worked around.** KG-3D's extractor reads only
`<P>` elements. `29 CFR 1926.1153` carries its entire operative control specification in **Table 1**
— *"Use saw equipped with integrated water delivery system…"* lives in a `<TD>`. Verifying against
paragraphs alone reported the requirement **absent from its own source**. The KG-3E extractor reads
table cells too.

**26 approvals were recorded, one explicit command each** (`approvals.sh`), every one naming its own
citation, its own expected checksum and its own evidence. There is no loop over a query result. The
7 KG-3D approvals surfaced through `carry-forward-candidates` — which surfaces and never auto-applies
— and were **re-affirmed individually** against this release rather than transferred.

**Deliberately not approved (8 records):** `1910.219`, `1910.132(a)`, `1926.602(a)(9)(ii)`,
`1926.95(a)`, `56.14105`, `56.15006`, `56.9100(a)`, `57.14107(a)` — all `NOT_CURRENTLY_USED`, none
selected by any gold-set observation, none with a recorded source. KG-3D deferred them; KG-3E carries
the deferral forward rather than approving text nobody has compared to a source. **Plus
`56.14132(a)`**, refused on the merits (§4).

---

## 8. Phase 8 — selection safety

`suggest()` matches `s.title` and `s.keywords`, and `keywords` is assembled **only** from tag arrays
— never from `plainLanguageSummary`. So the summary rewrites in this slice could not move selection,
and the empirical check confirmed it: **20 rows before, 20 rows after, zero membership change**, on
the same database and code.

15 positive/negative selection pairs are asserted permanently (§5, contract 6), covering the
boundaries the brief names: electrical vs machine guarding, general-industry vs construction, OSHA vs
MSHA, parent-section vs paragraph. Scope filtering was verified directly:

```
scopes=[]                    -> 30 CFR 56.15005, 29 CFR 1910.28, 29 CFR 1926.501
scopes=["osha_general"]      -> 29 CFR 1910.28
scopes=["osha_construction"] -> 29 CFR 1926.501
```

Regime separation is clean, and the unknown-jurisdiction case correctly offers all three rather than
guessing.

---

## 9. Phase 9 — Standard Detail, four corpus states

Real Chromium 148.0.7778.96, against an **isolated copy** of the frontend in the scratchpad
(ports 4330/3330) so the concurrently-modified `frontend-next` worktree and the unrelated dev servers
on 3001/3010/4000/4001/4010 were never touched.

| Case | Result |
|---|---|
| **Approved** `1910.36` — light, dark, mobile, mobile-dark | **108/108**, 0 failures |
| **Unapproved control** `1910.28` — light, mobile-dark | **8/8** |
| **Citation-only** `56.14132(a)` — light, mobile-dark | **pass** |

The fixture **refuses to manufacture an approval** and used the real KG-3E decision — reviewer
`kg-3e-remediation-reviewer`, checksum `0e13180d…`.

**The two axes are independently demonstrated, in opposite quadrants:**

- Approved `1910.36` renders **"Verified standard text"** alongside **"Candidate standard — more
  evidence required"**. Verified regulatory text, applicability limited for an unrelated and
  legitimate reason. The KG-3C/KG-3D contradiction does not return.
- Unapproved `1910.28` renders **"Primary standard"** — high applicability — with **no** verified
  badge and the content-backing disclosure intact. High confidence, unapproved text.

**The citation-only capture is the KG-3E finding proved on the customer path.** For
`30 CFR 56.14132(a)` the card shows *"Verified standard text is not currently available for this
citation"* — **even though the `56.14132` section record exists and is reviewer-approved**. The
approved section does not stand in for the refused paragraph at the UI layer either, and no content
is fabricated.

---

## 10. Phases 10–11 — coverage remeasured, and the shadow

### Corpus and emitted coverage

| Metric | KG-3D | KG-3E |
|---|---|---|
| Total governed records | 27 | **34** |
| Reviewer-approved | 7 | **26** |
| Unapproved | 20 | **8** |
| Placeholder-source | 3 | **0** |
| Overall corpus coverage | 25.9% | **76.5%** |
| **Emitted citations** | 23 | **23** |
| **Emitted approved-backed** | 7 (30.4%) | **22 (95.7%)** |
| Emitted with **no** governed record | 7 | **1** |
| Emitted awaiting review | 9 | **0** |
| Emitted on placeholder provenance | 0 | **0** |
| Emitted records with no source URL | 3 | **0** |

### Hazard-family coverage — 16 families

Fifteen families are fully approved. **One is emptied under approved-only filtering: `mobile
equipment (mining)`**, whose single citation is the deliberately-refused `56.14132(a)`. KG-3D also
had exactly one emptied family (`guarding (mining)`); that one is now covered.

### Shadow simulation — recomputed from scratch

```
goldSetOutcome  casesEvaluated 31 | correctUnderCurrentEngine 31 | correctUnderGovernedFiltering 31
                wrongRegimeMatches 0
                distinctExpectedCitations 24 | expectedCitationsGoverned 24
                expectedCitationsLosingCorpusBacking 0
corpus          currentlyRetrievable 34 -> governedRetrievable 26 (8 lost = the deferred tail)
```

**All 24 distinct citations the gold set expects are governed, and none loses corpus backing.**
KG-3D's equivalent figure was 12 of 20 suggest results lost and one family emptied to zero.

`suggest()`: **26 results, 19 governed-backed, 7 would be removed** (KG-3D: 20 / 8 / 12). **No query
returns zero** under approved-only filtering — KG-3D had one that did.

⚠️ **These suggest-derived numbers carry the §12 caveat: they are valid for the heap layout they were
measured on.**

---

## 11. Phase 12 — readiness

### **CORPUS_APPROACHING_CUTOVER_READINESS**

**Why not `NOT_READY`.** Every corpus-side blocker KG-3D named is closed or deliberately adjudicated:
emitted coverage 30.4% → 95.7%, placeholders 3 → 0, unsourced emitted records 3 → 0, emitted records
awaiting review 9 → 0, gold-set expected citations fully governed with zero losing backing, no query
emptied, no wrong-regime match, and no materially-used citation left stating the law misleadingly.

**Why not `READY_FOR_CONTROLLED_CUTOVER_DESIGN`.** Three conditions block it, and the first is
decisive:

1. **`suggest()` result membership is non-deterministic** (§12). A cutover that *filters on backing*
   cannot be safe while *what gets filtered* is chosen by physical row order. The same observation
   can surface an approved section record or an unprovenanced paragraph record depending on when
   autovacuum last ran — proven causally, not inferred.
2. **One hazard family empties.** `mobile equipment (mining)` goes to zero, and the fix is a
   **selection** change (predicate refinement to `56.14132(b)(1)` with the obstructed-view element
   established), which is out of scope here by instruction.
3. **30 declared-but-unsourced expert-rule citations.** Not blockers today, but each becomes a
   `CITATION_ONLY` the moment its rule fires on a real observation.

Approval percentage was deliberately not the basis for this verdict.

---

## 12. Two findings that outrank the coverage number

**`FINDING-suggest-ordering-nondeterminism.md`.** Re-running the KG-3D suggest measurement against
the **unmodified KG-3D database with unmodified code** returned `1910.303(b)(1)` (unapproved
placeholder) where KG-3D recorded `29 CFR 1910.303` (approved section) — stable across five runs, so
not flakiness. Root cause: `query.take(50).getMany()` with **no `ORDER BY`**; `grep -c "orderBy"` over
`applicable-standards.service.ts` returns **0**. Proved causally on a throwaway copy by changing
**only** physical row order via `CLUSTER`:

```
BEFORE  (1,2) 1910.303(b)(1)   (1,6) 29 CFR 1910.303   -> suggest returns 1910.303(b)(1), backed=7
AFTER   (3,3) 29 CFR 1910.303  (4,2) 1910.303(b)(1)    -> suggest returns 1910.303,      backed=8
content checksum identical both sides: 22b072e27b6c1a468792073bbd463dc0
```

This also **explains the KG-3D 8→7 discrepancy as layout, not regression**, and means any
suggest-derived coverage figure — KG-3D's and KG-3E's alike — is valid only for the layout it was
taken on. Not fixed here: a deterministic ordering changes which citations customers receive corpus-
wide and needs its own gold-set pass. A naive `ORDER BY citation` would be *stable but wrong* — it
sorts `1910.303(b)(1)` ahead of `29 CFR 1910.303`, systematically preferring paragraphs over parents.

**`FINDING-approval-binding-excludes-source-url.md`.** `RELEASE_MANIFEST_SELECT_COLUMNS` covers
`source_key` but **not `source_url` or `retrieval_date`**, so repointing the three MSHA URLs left
their checksums — and their approvals — untouched. Approval is exact-version with respect to
*content and source identity*, not with respect to *the evidence the reviewer consulted*: a record's
source URL can be changed after approval without the approval being re-examined. Not fixed here:
extending the projection would alter **every checksum in the corpus** and invalidate every approval
including KG-3D's, plus the manifest anchors KG-1…KG-3D all recorded. **Three seed comments that
asserted the opposite were corrected** rather than shipped as misleading documentation.

---

## 13. Phase 13 — regression

| Gate | Result |
|---|---|
| Backend build | **pass**, exit 0 |
| `test:kg3e-citation-granularity` (new) | **48/48** |
| `verify:kg3e-record-source` (new) | **150/150** clause checks |
| `test:kg3d-corpus-remediation` (KG-3D) | **31/31** — incl. checksum-invalidation contract |
| `test:standards-backing-contract` | **35/35** |
| `test:governed-corpus-matrix` | **59/59** |
| `test:reviewer-approval` | **62/62** |
| `test:release-integrity-and-approval` | **pass**, 44 assertions — delta explained below |
| `test:regulatory-release-lifecycle` | **pass**, 42 assertions |
| `test:knowledge-release-provenance` (KG-1) | **pass** |
| `test:safescope-standards` | **pass** |
| `test:standards-corpus-integrity` | **pass** |
| `test:guided-finding-response` | **pass** |
| `test:evidence-foundation` | **pass** |
| `test:hazlenz-evidence-boundary` | **pass** |
| `validate:hazlenz-knowledge-index` | **pass** |
| `test:entitlement-grant-helper` | **pass** |
| `test:persisted-decomposition-findings` | **pass** |
| `test:finding-scoped-reviews` | **pass** |
| `test:canonical-workflow` | **passed, 25 scenarios**, 4 cross-user denials, mass-assignment rejected |
| `test:private-storage-reports` | **passed, 12 scenarios**, `crossUserDownload: 404` |
| `test:hazlenz-core` | **the two documented baseline failures only**, proved byte-identical |
| Frontend `standardDisplayBacking.test.ts` | **pass** |
| Frontend `tsc --noEmit` | **exit 0** |
| Browser: approved / control / citation-only | **108/108 · 8/8 · pass** |
| `git diff --check` | clean, exit 0 |

**Three suites initially failed, and none was a production defect or a weakened contract.** Each
located its placeholder-provenance test subject by **querying the real corpus** for a
`starter-unverified:` row. KG-3E remediated the last three, so the query returned nothing and the
assertions could not run at all — a test that depended on the corpus having a defect, silently
disabled by fixing the defect. Each suite now **installs its own fixture** (`99 CFR 9999.1(a)`, a
citation outside any real CFR numbering, with `source_key` NULL so finalization synthesizes a
placeholder exactly as before). The contract — placeholder provenance never confers backing, even
when the legacy `reviewer_approved` boolean is set — is unchanged and still enforced.

**The 48 → 44 assertion delta is fully accounted for.** Running the *same* test file against both
corpora and diffing the normalized check lists:

```
KG-3D corpus (3 real + 1 fixture = 4 placeholders): 50 assertions
KG-3E corpus (0 real + 1 fixture = 1 placeholder):  44 assertions
```

The only differences are **−3 × "Placeholder source key is recognised as such"** and **−3 × "A
placeholder-source record stays unreviewed even when the legacy approval boolean is true"** — two
assertions per placeholder row, three fewer rows — plus count text (`24`→`34` mechanically validated,
`28`→`35` snapshot records). **No check was removed, weakened or failed**, and every assertion type
still runs at least once. The KG-3D corpus reproducing **50** with the fixture also confirms KG-3C's
originally-recorded 50/50 for four placeholders.

**The two `hazlenz-core` baseline failures are byte-identical** between the KG-3D corpus and the
KG-3E corpus, diffed explicitly: `golden-hardening-tests.ts` *"7. LOTO energized maintenance (Not
Guarding alone)"* (16 passed / 1 failed) and `hazlenz-production-path-regression.ts` *"FAIL tagged but
not locked"*. **No new failures.**

The KG-3E corpus also **reproduces deterministically**: a clean database seeded from the working-tree
sources produces manifest `bee47ebe1e82b74d9507380cff073838093881ea8a990b7d659190174fad6aa2`,
identical to the remediation database's release.

---

## 14. Phase 14 — the customer path is still disconnected

- **No customer path imports the governed resolver.** `grep` across `applicable-standards/`,
  `safescope-v2/`, `reports/`, `inspection/` returns one **comment** in
  `knowledge-release-provenance.ts:42` and KG-1's provenance **writer** at line 74. Nothing else.
- **Real analyses still record `knowledgeReleaseId = NULL`.** 12 null / 4 non-null, and all four
  non-null rows are `kg1-fixture-release.A`, created 2026-08-19 — KG-1's own fixtures.
  **0 analyses were created during KG-3E.**
- **No approved-only filter is active.** The live path reports `UNAPPROVED_CONTENT` for `1910.36`
  even though it is approved — visible in the fixture output and the browser control.
- **No release was activated.** All 9 releases remain `provisional`.
- **No production data or system was touched.** The `safescope` development database was probed
  read-only at the end: 0 rows in `standards_master`, 0 rows updated today. It was never a target;
  every DB-touching command printed and proved its resolved target first.

---

## 15. Phase 15 — preservation

| Check | Result |
|---|---|
| HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — **unchanged** |
| Commits created | **none** (`git log -1` is still the checkpoint commit) |
| Pushed / deployed | **no** |
| Stashes | **4**, unchanged |
| Tags | **23**, unchanged; `insite-inspection-ui-verified-2026-08-19` → `b25103b0…` |
| Unrelated frontend files | **18/18 byte-identical** (`shasum -c` all OK) |
| KG-3C frontend files | **3/3** at their KG-3C hashes |
| Unrelated dev servers | untouched — 3001, 3010, 4000, 4001, 4010 still running |
| `safescope` dev DB | untouched |
| `git diff --check` | clean |

### Files changed by KG-3E

**Production (2):**

| File | sha256 | Change |
|---|---|---|
| `backend/src/safescope-v2/standards-intelligence/standards-intelligence.seed.ts` | `d997d97d064b17d3571d9a0e239daa6585ff5a15d7d3924ee81c2e14d2d83489` | 3 CONTENT_DIFF records remediated; 7 records added; 3 placeholders remediated; 3 records completed; MSHA provenance repaired |
| `backend/src/standards/seed/finalize-regulatory-release.ts` | `ea265337ba847bdf589f32c654587fcafd364225e397468e8143064eca20b6d7` | `placeholderSourceRecords` counter fix (reporting only) |

**Test infrastructure (4 changed, 3 new):**

| File | sha256 |
|---|---|
| `backend/scripts/test-governed-corpus-matrix.ts` | `0776c8efa2cb83eea27c44f7dbeb86adb68d4f8740bf6207937d1aeda3e31977` |
| `backend/scripts/test-reviewer-approval.ts` | `06acf2d9d8ad0405ea4a4d98d07a71625b45ce110c6952ff2e1a4f466be80caa` |
| `backend/scripts/test-release-integrity-and-approval.ts` | `840040cb79111c417c0ea34ee657787042ef03292d8486778b8575beecebbc9b` |
| `backend/package.json` | `111b3ca135efef730f8876e1b2c3e74ea78c00b253f64df0a2fb780a81406ce5` |
| `backend/scripts/report-kg3e-work-queue.ts` (new) | `f655e41259bfde5b9d7cb0925ffbd393e000c71aacf085b1bfcfad3c6cc0ee44` |
| `backend/scripts/verify-kg3e-record-against-source.ts` (new) | `c0bfb897a09636dd5429ec671dfde486208ed78af3e6f42a6cd33df126bf778f` |
| `backend/scripts/test-kg3e-citation-granularity.ts` (new) | `38b4ab674b7146a9fbf4be807c95af4f2a83d7bf6933d9036e2f68b7011e4c21` |

**No change to** billing, auth, pricing, hazard recognition, risk, corrective actions, the action
engine, inspection flow, reports, marketing UI, **or any HazLenz selection logic**. **No KG-3D
artifact was overwritten.**

---

## 16. Recommended KG-3F scope

1. **Deterministic `suggest()` ordering** — the top blocker. Order by exact-citation match, then
   registered over placeholder provenance, then approved over unapproved, then predicate-appropriate
   specificity, with `citation` last purely as a tie-break. Full gold-set regression.
2. **`56.14132` predicate refinement** — emit `(b)(1)` or the section, with the obstructed-view
   element established. Closes the last emitted gap and the last emptied family.
3. **Extend the checksummed projection** to `source_url` and `retrieval_date`, with manifest anchors
   re-recorded and every approval re-affirmed.
4. **Source the 30 declared-but-unemitted expert-rule citations**, or narrow the rules that declare
   them.
5. **Then the controlled cutover design**, gated on the §11 criteria rather than a percentage.
