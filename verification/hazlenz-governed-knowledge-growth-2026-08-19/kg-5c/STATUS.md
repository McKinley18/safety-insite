# KG-5C — Customer-path resolver equivalence and governed content delivery proof

**Date:** 2026-08-21 · **Start HEAD:** `5f050858227ca11cf90d2f6bf64148e70a018b64` · **End HEAD:** unchanged
**Branch:** `release/insite-rc-2026-08-18` · **Nothing committed, pushed, merged, deployed or activated.**
**Verdict:** `KG_5C_COMPLETE — CUSTOMER_PATH_EQUIVALENCE_ESTABLISHED — READY_FOR_CONTROLLED_PRODUCTION_SHADOW`

Production was not touched — not read, not written, not migrated. Every measurement was taken on
disposable `test_kg5c_*` databases created by this task.

---

## 1 — The question, and the answer

> *For a citation actually emitted by HazLenz, does the real customer standards-hydration path
> resolve and deliver regulatory content that is equivalent to the exact governed artifact that was
> reviewed and approved?*

**Yes, measured through the production code path itself.**

| | Result |
|---|---|
| Approved records delivering **byte-for-byte the frozen reviewed artifact** | **27 / 27** |
| Unapproved records whose governed delivery is **identical to LEGACY** | **8 / 8** |
| Emitted gold-set citations **proven end to end** | **23 / 23** |
| Approved badges on content that is not the reviewed artifact | **0** |
| Unapproved records presented as approved | **0** |
| Fallbacks that altered customer output | **0** |

Note the shape of the question. It asks whether the customer receives *the reviewed artifact* — not
whether governed text resembles legacy text. A cutover whose entire purpose is to replace an
unreviewed ingest with a reviewed artifact **should** change the text; measuring that change as a
defect would be measuring the feature. What must never happen is **the badge and the bytes
disagreeing**, and that is what was tested.

---

## 2 — The authoritative customer path (Phase 1)

Traced from executable code, not from function names. **Two paths exist and both were exercised.**

| # | Stage | File / function |
|---|---|---|
| 1 | Citation selection (Path B) | `safescope-v2/evidence/evidence-foundation.ts` → `applyFindingScopedStandards()` — in code, no DB |
| 1′ | Citation suggestion (Path A) | `applicable-standards/applicable-standards.service.ts` → `suggest()` |
| 2 | **Legacy hydration** | `ApplicableStandardsService.hydrateStandardReferences()` |
| 3 | Governed resolution | `GovernedCutoverContext.resolveStandard()` → `resolveGoverned()` → `governed-corpus-lookup.ts` |
| 4 | Delivery decision | `standards/cutover/fallback-contract.ts` → `decideFallback()` |
| 5 | **Governed text substitution** | `safescope-v2.service.ts` `mark()` (Path B) · `applicable-standards.service.ts` (Path A) |
| 6 | Backing status | `standards/display/standards-backing-contract.ts` → `resolveStandardsBacking()` |
| 7 | Display projection | `governed-cutover-context.ts` → `projectGovernedDisplay()` |
| 8 | Frontend | `frontend-next/lib/inspection/standardDisplay.ts` → `getStandardBackingPresentation()` |
| 9 | Reports / PDF | consume the same `standardDecisions` projection (KG-4E invariance, 8/8) |

### Legacy resolution behaviour, exactly

`hydrateStandardReferences()` strips subsections to build an `ILIKE` needle, keys results with
`normalizeCitationForLookup` — which **preserves the agency prefix and the subsection** — and
accepts a base-key match **only when the requested citation carries no subsection**. Consequence,
measured: a subsection-level request such as `29 CFR 1926.451(g)(1)` resolves **no** legacy row at
all, because the corpus holds only the section `1926.451`.

### The two body-text tiers, and why testing one would have been wrong

| Path | Legacy body the customer actually reads | Measured length for `1910.1200` |
|---|---|---|
| **B** — finding-scoped `standardDecisions` | `plain_language_summary` — `mark()` spreads `title`, `plainLanguageSummary` and source metadata from hydration but **deliberately not `standardText`** | **500 B** |
| **A** — `suggest()` | `standard_text`, from `suggest()`'s own corpus SELECT | **56,026 B** |

Both were measured for all 35 records. Testing only Path B would have missed the 56 KB tier
entirely; testing only Path A would have described text the finding-scoped customer never sees.

### The harness executes production code, it does not reimplement it

`hydrateFindingScopedStandards()` touches exactly one instance field — `this.applicableStandards`,
verified by static inspection of its 204-line body — so binding it to a prototype instance with that
one collaborator runs **the shipped method**, including the governed substitution, its spread
ordering, the backing call and the display projection. The suite asserts this identity explicitly.

---

## 3 — `KG5B-DISC-01`: disposition of all 15 (Phase 4)

**KG-5B's pairing was correct. Its classification was too coarse.**

The real path pairs the same legacy row KG-5B's matcher paired, on **both** tiers — so the 15 is not
a comparator artifact, and re-measuring confirms the count exactly. What changes is what the
difference *is*.

| | KG-5B | KG-5C (real path, Path B) | KG-5C (real path, Path A) |
|---|---|---|---|
| classification | `CONTENT_DIFFERENCE` ×15 | `GOVERNED_REVIEWED_RENDERING` ×15 | `GOVERNED_REVIEWED_RENDERING` ×15 |
| severity | `BLOCKING` ×15 | **not blocking** | **not blocking** |
| delivery verdict | not measured | `DELIVERS_REVIEWED_ARTIFACT` ×15 | same |

### Why `GOVERNED_REVIEWED_RENDERING` is a real category and not a relabelling

The two sides are **different kinds of artifact**. Legacy `standard_text` is a verbatim eCFR/MSHA
ingest. The governed `canonicalText` is the reviewed rendering KG-3D/3E/4A adjudicated clause by
clause — it expands defined terms inline, names limiting sibling paragraphs, and states the citation
explicitly. Byte-equality is therefore **not achievable by construction**, and its absence is not
evidence of disagreement. Measured example:

```
30 CFR 62.120
  legacy   "…equals or exceeds the action level the mine operator must enroll the miner in a
            hearing conservation program that complies with § 62.150 of this part."      (200 B)
  governed "…equals or exceeds the action level (an 8-hour time-weighted average sound level of
            85 dBA, or equivalently a dose of 50 percent, per 30 CFR 62.101), the mine operator
            must enroll the miner in a hearing conservation program that complies with
            30 CFR 62.150."                                                              (306 B)
```

**Entry is mechanical, not asserted.** All four must hold, and the class is only reachable after
`EXACT`, `NORMALIZATION_ONLY` and proven containment have each been tried and failed:

1. the record is reviewer-approved in the active release **against its exact checksum**;
2. a clause-by-clause review is **recorded** for it in a named KG phase artifact;
3. the text the customer path **actually delivers** is byte-identical to the release record's frozen
   `payload.canonicalText` — the reviewed bytes, not a re-derivation;
4. the legacy content, where it resolves, carries the **same logical citation identity**.

**What it does not prove, stated plainly.** It does not mechanically prove the rendering is
non-contradictory with the underlying regulation. Nothing can — that is a legal reading, and it is
precisely what the recorded clause-by-clause review *is*. The class reports that the delivered
artifact is the reviewed one and that a review exists; **never that the review was correct.**

Its discipline is visible in the result: the 8 `NEW_REVIEW_REQUIRED` records have **no** recorded
clause review, so 3 of them (the ones whose legacy row resolves) classify `CONTENT_DIFFERENCE` on
Path A and are **refused** the category. The classifier will not bless unreviewed content.

---

## 4 — All 27 approved records (Phase 4)

| Class | Path B | Path A |
|---|---|---|
| `GOVERNED_REVIEWED_RENDERING` | 15 | 15 |
| `LEGACY_UNRESOLVED` | 12 | 12 |
| `CONTENT_DIFFERENCE` | **0** | **0** |

**The 12 `LEGACY_UNRESOLVED` are the finding that the KG-5B comparator could not have produced.**
They are subsection-level citations (`1926.451(g)(1)`, `1910.303(b)(1)`, `56.14132(b)(1)` …) for
which the real customer path resolves **no legacy row at all** — `normalizeCitationForLookup`
refuses a base-key fallback when the request carries a subsection. Today those citations render as
`CITATION_ONLY`: *"Verified standard text is not currently available for this citation."* After
cutover they carry the reviewed artifact. There is no legacy content for them to disagree with.

### Customer-visible transition, per class

| Population | LEGACY today | GOVERNED after cutover |
|---|---|---|
| 15 reviewed renderings | `UNAPPROVED_CONTENT` — a **500-character truncation** under "HazLenz standard summary" | `APPROVED_GOVERNED_CONTENT` — the complete reviewed artifact under "Verified standard text" |
| 12 unresolved | `CITATION_ONLY` — "verified text not available" | `APPROVED_GOVERNED_CONTENT` |
| 8 unapproved | `UNAPPROVED_CONTENT` ×3 · `CITATION_ONLY` ×5 | **unchanged** — `LEGACY_TEXT_UNVERIFIED`, no provenance recorded |

Every transition is toward more complete, reviewed, honestly-labelled content, or is a no-op.

---

## 5 — Gold set: 23 / 23 emitted citations proven (Phase 5)

Gold set read from its tracked location, hash-verified `93184abc…647cd3` **before and after** —
unmodified.

**A recorded count needed correcting, and the correction was to the harness, not to the data.** The
first run measured 22 emitted citations against a documented 23. The single difference is
`30 CFR 56.14132`, which is emitted as an `applicability: 'candidate'` and never as `'direct'` —
KG-3F Phases 5–7 deliberately withhold it from certainty when rear visibility is unstated
(MSHA-TRAFFIC-01, `CAVEAT-2`, decision KEEP). KG-3F's "23 emitted" counts **every** emitted
citation; filtering to `direct` gives 22. Both numbers are true about different things, and the
scope KG-5C must prove is all 23 — so the harness was widened to the full candidate set rather than
the expectation being lowered to 22.

All 23 proven, with zero blockers:

| Required property | Result |
|---|---|
| every emitted citation is covered by the release | 23 / 23 |
| every emitted citation is **approved** | 23 / 23 |
| no silent citation substitution | 23 / 23 delivered citation == requested |
| no wrong-section resolution | 23 / 23 same exact citation identity |
| no prefix ambiguity | 23 distinct citations → 23 distinct records |
| no unapproved content represented as approved | 0 violations |
| **no approved badge on content different from the approved artifact** | 0 violations |
| every emitted citation delivers `GOVERNED_VERIFIED_TEXT` | 23 / 23 |
| no citation-only content leak | 0 |
| no fallback hides a governed-resolution failure | reason `GOVERNED_APPROVED_EXACT` on all 23 |
| governed provenance recorded | 23 / 23 |

---

## 6 — The customer-visible delivery contract (Phase 6)

Established from measurement, and it required **no code change** — the architecture already
implements it. `verifiedText` is non-null only when `decideFallback()` sets `textIsVerified`, which
only `APPROVED_EXACT` sets; `mark()` then applies it **after** the hydration spreads so it wins.

| Situation | Delivered text | Backing | Badge |
|---|---|---|---|
| 1. governed artifact byte-identical to legacy | the governed artifact | `APPROVED_GOVERNED_CONTENT` | "Verified standard text" |
| 2. governed artifact is a citation-level unit inside a larger legacy section | **the governed artifact** — never expanded back into unreviewed legacy content | `APPROVED_GOVERNED_CONTENT` | "Verified standard text" |
| 3. legacy and governed genuinely differ | the governed artifact | `APPROVED_GOVERNED_CONTENT` | "Verified standard text" |
| 4. approved but legacy not equivalent | the governed artifact | `APPROVED_GOVERNED_CONTENT` | "Verified standard text" |
| 5. governed content unapproved | **legacy text, unchanged** | `UNAPPROVED_CONTENT` | none |
| 6. no governed release covers the citation | legacy text, unchanged | `UNAPPROVED_CONTENT` / `CITATION_ONLY` | none |

**The authoritative customer-visible text after cutover is the exact reviewed governed artifact, and
nothing else.** Truthfulness is preserved because the badge is reachable only from `APPROVED_EXACT`,
and `APPROVED_EXACT` is reachable only from a reviewer decision bound to that record's exact
checksum. `corpusBacked` remains true only for `APPROVED_GOVERNED_CONTENT`. Placeholder provenance
is still refused before the approval check. Nothing was relaxed.

---

## 7 — Defects found and fixed (Phase 7)

### `KG5C-FIX-01` — the SHADOW comparator compared a field the Path B customer is never shown

**Real, proven, and the same class of bug KG-4B fixed one tier up.** `safescope-v2.service.ts`
built the shadow comparison's legacy text as `hydratedRow.standardText ?? hydratedRow.plainLanguageSummary`,
under a comment stating *"the legacy text must be the text the CUSTOMER would actually be shown"*.
But `mark()` never spreads `hydrated.standardText` onto a finding-scoped decision, so on Path B the
customer's body is the decision's own text, else the hydrated `plainLanguageSummary`. On the
production-shaped corpus those are wildly different artifacts — 56,026 B vs a 500 B truncation.

Fixed to `decisionText ?? hydratedRow.plainLanguageSummary`, which is `mark()`'s own precedence.

**Measured consequence: the mismatch verdict is unchanged** (the governed rendering differs from
both tiers), so nothing was fixed to move a number. What changes is that the comparison now
describes the customer's actual result — the property the surrounding KG-4B comment already claimed.
Re-verified: `test:kg4b-shadow-contract` 123/123, `test:kg4b-shadow-adversarial` 84/84,
`test:kg4c-production-shadow-contract` 438/438, `test:kg4d-orchestration` 151/151.

### Not a defect — expected architectural difference

The legacy/governed text difference itself. It is the intended substitution of a reviewed artifact
for an unreviewed ingest, delivered under a badge that is reachable only through a checksum-bound
reviewer decision.

### Nothing else was changed

No governed source record was rewritten. No release membership altered. No approval check, checksum
binding or release gate weakened. No bulk approval. No NULL-digest import. No legacy row mutated. No
fuzzy matching or implicit prefix authority added. **No migration.** The manifest is still
`14a34fea…c2ece5b` and all 35 record checksums and approval digests are unmoved.

---

## 8 — New discovery

### `KG5C-DISC-01` — 634 legacy summaries are truncated mid-word

`plain_language_summary` is a hard 500-character cut of `standard_text` on **996 of 2,390**
production rows, and **634 of those cut mid-word** (e.g. `1910.219` ends *"…thirteen thirty-seconds
() inch or less. 1/2 (2"*). That fragment is what a Path B customer reads **today**, under the
"HazLenz standard summary" label.

* **Pre-existing.** Not caused by governance, the release, or KG-5C.
* **Not a SHADOW blocker.** SHADOW is customer-invisible.
* **Not a cutover blocker.** Cutover *repairs* it for the 15 approved reviewed renderings (complete
  text replaces the fragment) and leaves it unchanged for unapproved records, which is the fallback
  contract's promise.
* Classification: `LEGACY_CORPUS_QUALITY — MUST_ADJUDICATE_BEFORE_WIDENING_LEGACY_DELIVERY`.

---

## 9 — Governed delivery rehearsal (Phase 8)

`npm run rehearse:kg5c-governed-delivery` — **28/28 assertions**, **40 reviewed commands, 0 ad-hoc
snippets**, on a clone built to production's pre-KG shape (40 migrations, 2,390 legacy rows).

migrations → `release -- prepare` → 27 approvals one at a time through `review:release-record` →
customer path **before** activation (nothing approved, `NO_ACTIVE_GOVERNED_RELEASE`) → activation
dry run (8 gates) → `release -- activate` → customer path **after** activation in LEGACY, SHADOW and
GOVERNED → equivalence evidence → stale-operator and wrong-manifest refusals → second release
prepared/approved/activated → `release -- rollback` to the exact prior release → customer path
re-checked → legacy corpus verified unchanged.

Measured at the active-release state:

* **LEGACY payloads carry no governed keys** and are unaffected by the active release;
* **SHADOW payloads are byte-identical to LEGACY payloads** and carry no governed keys;
* GOVERNED payloads deliver `APPROVED_GOVERNED_CONTENT` / `GOVERNED_VERIFIED_TEXT`;
* every governed delivery is byte-for-byte the frozen reviewed artifact;
* after rollback the customer path serves the first release again, still delivering the frozen
  artifact, and the release rolled off is retained as `rolled_back`;
* legacy corpus: **2,390 rows, digest unchanged, 0 with `source_key`** throughout.

---

## 10 — Verification (Phase 9)

Backend `npm run build` exit 0 · `frontend-next npx tsc --noEmit` exit 0 — in the working tree
**and** in the isolated packaged tree.

**Packaged tree:** `git archive HEAD | tar -x` (no git metadata mutated) overlaid with the KG
release paths plus KG-5B's 18 and KG-5C's 7. **24 modified tracked files, zero theme files, zero
unrelated files.** The `KG5A-DISC-02` hunk excluded.

| Suite | Working tree | Packaged tree |
|---|---|---|
| `test:approval-contract` | 57/57 | 57/57 |
| `test:kg3e-citation-granularity` | 48/48 | 48/48 |
| `test:kg3f-retrieval-determinism` | 170/170 | 170/170 |
| `test:kg3f-ranking-adversarial` | 54/54 | 54/54 |
| `test:kg3f-56-14132-predicate` | 16/16 | 16/16 |
| `test:kg3f-shadow-invariance` | 7/7 | 7/7 |
| `test:kg4a-cutover-contract` | 146/146 | 146/146 |
| `test:kg4a-governed-resolution` | 99/99 | 99/99 |
| `test:kg4a-default-off` | 51/51 | 51/51 |
| `test:kg4b-shadow-contract` | 123/123 | 123/123 |
| `test:kg4b-shadow-adversarial` | 84/84 | 84/84 |
| `test:kg4b-shadow-determinism` | 18/18 | 18/18 |
| `test:kg4b-privacy-review` | 26/26 | 26/26 |
| `test:kg4c-production-shadow-contract` | 438/438 | 438/438 |
| `test:kg4c-disabled-deployment` | 80/80 | 80/80 |
| `test:kg4c-db-ownership` | 31/31 | 31/31 |
| `test:kg4d-orchestration` | 151/151 | 151/151 |
| `test:kg4d-default-off` | 121/121 | 121/121 |
| `test:kg4d-db-ownership-blackbox` | 19/19 | 19/19 |
| `test:kg4e-report-field-exclusion` | 9/9 | 9/9 |
| `test:kg4e-report-provenance` | 32/32 | 32/32 |
| `test:kg4e-telemetry-privacy-v2` | 0 outside allowlist | 0 outside allowlist |
| `compare:kg4e-report-invariance` | 8/8 invariant | 8/8 invariant |
| `test:regulatory-release-lifecycle` | 42/42 | 42/42 |
| `test:governed-corpus-matrix` | 60/60 | 60/60 |
| `test:release-integrity-and-approval` | 44/44 | 44/44 |
| `test:reviewer-approval` | 62/62 | 62/62 |
| `test:standards-backing-contract` | 35/35 | 35/35 |
| `test:kg5b-release-construction` | 102/102 | 102/102 |
| `test:kg5b-operator-cli` | 65/65 | 65/65 |
| `test:kg5b-approval-continuity` | 29/29 | 29/29 |
| `rehearse:kg5b-operator-sequence` | 58/58 | 58/58 |
| **`test:kg5c-customer-path-equivalence`** | **31/31** | **31/31** |
| **`test:kg5c-goldset-customer-path`** | **17/17** | **17/17** |
| **`rehearse:kg5c-governed-delivery`** | **28/28** | **28/28** |

**Zero failures.** No suite was reported as passing that was not executed.

---

## 11 — Preservation

| | |
|---|---|
| HEAD | `5f050858227ca11cf90d2f6bf64148e70a018b64` — unchanged |
| branch / upstream | `release/insite-rc-2026-08-18`, 0/0 |
| commits / pushes / merges / deploys | **none** |
| production | untouched — not read, not written, not migrated |
| production migrations | **not applied** · KG-5C adds **0** migrations (46 unchanged) |
| production SHADOW / cutover | **OFF** — no `GOVERNED_CUTOVER_*` variable set anywhere |
| production governed release | **not created, not activated, not rolled back** |
| original `safescope` database | untouched (35 migrations, stats timestamp 2026-08-12) |
| stashes / tags | 4 / 23, unchanged targets |
| gold set | `93184abc…647cd3` — verified before and after, unmodified |
| prior KG evidence | unchanged; `test_kg5b_*`, `test_kg4e_*` used only as read-only templates |
| unrelated / theme work | untouched — 0 theme files in the packaged tree |
| mutation targets | disposable `test_kg5c_*` databases only, created and dropped by their suites |

## 12 — Evidence

`contracts/customer-path-equivalence.json` · `contracts/goldset-customer-path.json` ·
`contracts/governed-delivery-rehearsal.json` · `contracts/packaged-tree-manifest.json` ·
`phase0-baseline.txt` · `phase0-documentation-checkpoint.txt` · `phase9-regression.txt` ·
`phase9-packaged-tree.txt`
