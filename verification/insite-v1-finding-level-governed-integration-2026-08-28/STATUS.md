# Finding-level governed standards integration — 2026-08-28

```
TERMINAL = HAZLENZ_FINDING_LEVEL_GOVERNED_STANDARDS_INTEGRATED
           — CANDIDATE_RELEASE_ACTIVATION_ACCEPTANCE_REQUIRED

CANDIDATE_RELEASE_ACTIVATED = FALSE
PRODUCTION_MUTATED          = FALSE
PROVIDER_CALLS              = 0
```

Every customer finding now carries an explicit, release-scoped statement of the regulatory
authority behind each of its citations. The contract's first assertion — *no silent fallback may
present an unapproved code-resident citation as approved governed content* — was written as a
failing test before any integration code and now passes with its positive control intact.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / deploy / production mutation / provider call | **none** |
| candidate release activated | **no** |
| stashes / tags | 4 / 24, untouched |

### Changed-file inventory (this phase)

| file | change |
|---|---|
| `backend/src/standards/releases/finding-standards-authority.ts` | **new** — the single place that grants or refuses governed authority (`b19f7d95…`) |
| `backend/src/inspection/finding-standards-authority-annotation.ts` | **new** — attaches the authority state to persisted findings (`dc5515c3…`) |
| `backend/src/inspection/inspection.service.ts` | one call inside `reconcileDecompositionFindings()`, plus its import |
| `backend/src/standards/tests/finding-governed-authority.ts` | **new** — the contract's first assertion (`77ef217a…`) |
| `backend/src/standards/tests/finding-governed-integration.ts` | **new** — Phases 5, 6 and 8 (`d9f9a0e7…`) |
| `backend/package.json` | two scripts appended |
| `docs/INSITE_ENGINEERING_BLUEPRINT.md`, `docs/INSITE_CURRENT_STATE.json` | additive |

`evidence-foundation.ts` is **unmodified**. No unrelated architecture was changed.

## 2. Phase 1 — the authority model, as measured before any change

Traced end to end: hazard candidate → standard selection → citation → finding → persistence →
API → UI → report.

| layer | where regulatory content came from, before this phase |
|---|---|
| hazard recognition | deterministic decomposition — **no standards involvement** |
| finding citations | `evidence-foundation.ts` — **code-resident rules, no database, no release, no review state** |
| finding text hydration | `standards_master` via `hydrateFindingScopedStandards()` — **legacy corpus, no release scope, no review condition** |
| `finding.knowledgeReleaseId` | KG-1 — **NULL whenever retrieval is unscoped, which is always on the live path** |
| governed resolution | `governed-corpus-lookup.ts` — **a shadow evaluator wired into no customer path** |
| API / UI / report | read `sourceCandidate.standardCandidates` — carried `backingStatus` but **no release, no membership, no reviewer, no checksum** |

**Where the distinction could be lost.** A code-resident rule emits a citation STRING. Several of
those strings are ones the governed release also holds. Nothing in the pre-change path recorded
*which* release governed a finding or *whether* the record was a member of it, so any future code
that resolved authority by matching the citation text would have handed a reviewer's approval to a
rule that fired on evidence the reviewer never saw. That is the laundering route this phase closes.

### The authority-state model

| state | meaning |
|---|---|
| `APPROVED_GOVERNED_CONTENT` | a governed record with this citation **identity** is a **member** of the release governing this finding, its **effective review state is `reviewer_approved` in that release**, and it carries usable content. The only state presentable as reviewed regulation. |
| `UNAPPROVED_GOVERNED_CONTENT` | a release member exists but is not reviewer-approved, or is approved with no usable content |
| `REJECTED_GOVERNED_CONTENT` | a governed record exists in the source corpus but is **excluded from the governing release** — for the reviewed release, exactly what a `REJECT_CORRECTION_REQUIRED` disposition produces |
| `LEGACY_CODE_RESIDENT_CONTENT` | governed resolution was not consulted (no release governs the finding). The honest label for the code-resident rule set |
| `NO_GOVERNED_MATCH` | governed resolution ran and found no record at all |

Existing repository vocabulary is preserved alongside it: `backingStatus`, `contentDisclosure` and
`corpusBacked` keep their KG-3C meanings and are derived, never recomputed from a source key.

## 3. Phase 2 — the first failing assertion, before any integration code

`backend/src/standards/tests/finding-governed-authority.ts` (`77ef217a…`),
`npm run test:finding-governed-authority`.

**Result before implementation:**

```
Cannot find module '../releases/finding-standards-authority'
TSError: ⨯ Unable to compile TypeScript   (diagnosticCodes: [ 2307 ])
```

The module it asserts against did not exist. That is the recorded pre-fix failure.

**Result after implementation: 17/17 PASS**, with no assertion weakened.

| control | records | result |
|---|---|---|
| **positive** (so the suite cannot pass by governed resolution being globally off) | `1910.252`, `1910.147`, `56.16009`, `1926.1425` | `APPROVED_GOVERNED_CONTENT`, member, `reviewer_approved`, checksum present |
| **negative 1** — code-resident citation with no approved member | `1910.99999`, `56.99999` | `NO_GOVERNED_MATCH` |
| **negative 2** — all 8 rejected historical records | see §5 | `REJECTED_GOVERNED_CONTENT`, never approved |
| **negative 3** — a governed record that exists but is not reviewer-approved | `1910.219` under `federal-core-2026-07-30.1` | `UNAPPROVED_GOVERNED_CONTENT` |
| **negative 4** — approval scoped to its own release | no cross-release approval exists to leak | held |
| **laundering** — identical citation string, resolution bypassed | `1910.252` | `LEGACY_CODE_RESIDENT_CONTENT`, no reviewer, no checksum |

## 4. Phase 3 — the finding-level provenance contract

Each persisted standard candidate now answers the contract's six questions deterministically:

| question | field |
|---|---|
| which governed record supplied this citation? | `citation` + `governedRecordChecksum` |
| was it reviewer-approved? | `effectiveReviewState`, and `reviewerId`/`reviewerRole`/`reviewedAt` **only when approved** |
| was it actually a member of the governing release? | `governedReleaseMember` |
| which release governed the result? | `governedReleaseId` |
| was the displayed text governed or legacy? | `contentDisclosure` (`GOVERNED_APPROVED` vs `HAZLENZ_AUTHORED`) |
| can the authority state be reconstructed later? | `governedReleaseId` + `governedRecordChecksum` |

Plus `authorityState` and a human-readable `authorityReason`. **No regulatory record is duplicated
into the finding** — stable identity plus immutable release provenance, as the contract prefers.

## 5. Phases 4-5 — integration without destroying Level-1, and the adversarial gate

`npm run test:finding-governed-integration` — **19/19 PASS**.

**All 8 rejected records, as adversarial fixtures**, each proven under
`federal-core-2026-08-28.1`:

| record | state | member | reviewer | checksum |
|---|---|---|---|---|
| `30 CFR 57.14107(a)` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `30 CFR 56.14105` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `1910.219` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `29 CFR 1910.132(a)` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `29 CFR 1926.95(a)` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `30 CFR 56.15006` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `29 CFR 1926.602(a)(9)(ii)` | `REJECTED_GOVERNED_CONTENT` | false | none | none |
| `30 CFR 56.9100(a)` | `REJECTED_GOVERNED_CONTENT` | false | none | none |

None can inherit reviewer provenance, release membership or a record checksum, and none was
modified to satisfy the test. The **positive control runs in the same suite**, so the result cannot
come from governed resolution being disabled.

**Laundering closed:** the same citation strings with no governing release stay
`LEGACY_CODE_RESIDENT_CONTENT`. Identity comes from release membership, never from citation text.

**Level-1 is untouched.** The annotation never removes, suppresses or downgrades a hazard, and a
failure inside it leaves the candidate unannotated — which reads as un-governed, the safe
direction. `NO_APPROVED_GOVERNED_MATCH` never becomes `NO_HAZARD`: the protected floor is unchanged
(§8) and the accepted inspection workflow still passes 66/66.

## 6. Phase 6 — inspection release binding

Both releases coexist in one disposable database, neither activated.

| assertion | result |
|---|---|
| a finding created under R1 records R1 as its governing release | PASS |
| under R1, `1910.219` is an **UNAPPROVED member** — not approved, not rejected | PASS |
| under R2 the **same citation** is **REJECTED** — authority is release-scoped, not citation-scoped | PASS |
| under R2 an approved member resolves approved | PASS |
| **the R1 finding was NOT rewritten when the same hazard was resolved under R2** | PASS |

A persisted finding carries its own `governedReleaseId`, and re-resolution uses that stored value
rather than any active pointer — so a later release becoming available cannot silently rewrite the
regulatory authority of an already-persisted finding.

## 7. Phase 7 — API, UI and report honesty

Measured through the accepted inspection lifecycle against the integrated build
(`verify:hazlenz-actionable-workflow`, **66 checks, 0 failures**) and by reading what was persisted.

```
persisted standard candidates : 9
authority states              : LEGACY_CODE_RESIDENT_CONTENT × 9
corpusBacked = true           : 0
reviewerId present            : 0
contentDisclosure GOVERNED_APPROVED : 0
governedRecordChecksum present: 0
```

That is the correct outcome, not a shortfall: `knowledgeReleaseId` is NULL because retrieval is
unscoped (KG-1's honest answer) and the candidate release is not activated, so **nothing may claim
governed authority** — and now every candidate says so explicitly instead of leaving a reader to
infer it. A serialized candidate is captured verbatim in `PERSISTED_FINDING_AUTHORITY.json`.

**Report surface:** the generated PDF makes no claim of approval, review or governed authority. The
only occurrences of the word "approved" are inside the quoted regulatory text of `1910.303(g)(2)`
("approved cabinets or other approved enclosures") — the regulation's own wording. The report
retains its advisory statement and "HazLenz evaluated standards as conditional candidates unless
the observation itself established the governing agency."

No customer-facing wording was changed; the distinction lives in the data, where the contract puts
it.

## 8. Phases 8-9 — determinism and the protected floor

| property | result |
|---|---|
| identical input, jurisdiction, release and ledger resolve identically across three runs | PASS |
| the resolver itself is deterministic | PASS |
| authority reconstructable from `releaseId` + `recordChecksum` | PASS |
| `SAME_RELEASE_ID_SAME_MANIFEST` | **TRUE** (both releases: `idempotent_no_op`) |
| `DIFFERENT_MANIFEST_SAME_RELEASE_ID` | **REJECTED** |
| historical release reproducible | **TRUE** — `14a34fea…`, `reproducedPinnedManifest: true` |
| candidate release reproducible | **TRUE** — `680540d9…`, `reproducedPinnedManifest: true` |
| rejected content excluded | **TRUE** |

| protected metric | required | measured |
|---|---|---|
| required recognition | 43/43 | **43/43** |
| actionable coverage | 43/43 | **43/43** |
| life-critical recognition | 35/35 | **35/35** |
| life-critical actionable | 35/35 | **35/35** |
| Population A precision | 100.0 % | **100.0 %** |
| forbidden emissions | 0 | **0** |
| `test:hazlenz-core` | 37/37 | **37/37** |
| KG-5B | 102/102 | **102/102** |
| golden standards | 15/15 | **15/15** |
| release identity gate | PASS | **PASS, 8 checks** |
| TypeScript | clean | **clean** |

Also passing: `test:persisted-decomposition-findings` (the HTTP suite that exercises finding
materialisation, i.e. the exact path this phase changed), `standard-applicability-regression`,
`hazlenz-generalization-regression`, `verify:hazlenz-actionable-workflow` (66 checks).

New gates: `test:finding-governed-authority` (17) and `test:finding-governed-integration` (19).

**NEW_REGRESSION: none.** The four known failures are byte-identical to the prior accepted state.

**Still UNVERIFIED:** production legacy corpus behaviour; the `safescope_knowledge_chunks`
retrieval path (0 rows in every available database); governed cutover modes above `LEGACY`.

## 9. Unresolved-jurisdiction ranking defect

**Carried forward unrepaired and unchanged**, as instructed: 4/5 obvious unresolved cases
recovered, pinned-jurisdiction behaviour sound, 0 wrong-jurisdiction candidates in pinned runs, the
remaining LOTO miss caused by ranking, one administrative false positive. This integration does not
touch ranking and does not make it worse.

## 10. What activation would change, and why it is the next decision

Today every finding is `LEGACY_CODE_RESIDENT_CONTENT` because no release governs any analysis. The
machinery to say more is in place and proven, but two things must happen first, and both are
product-owner decisions rather than engineering ones:

1. **Activate `federal-core-2026-08-28.1`** — deliberately not done here.
2. **Scope retrieval to that release** so KG-1 can truthfully record a `knowledgeReleaseId` instead
   of NULL. Until retrieval is release-scoped, NULL remains the honest answer and no finding may
   claim governed authority — which is exactly the behaviour this phase delivers.

## 11. Expert readiness

Six blockers remain open. Expert HazLenz is not authorised and must never become the regulatory
source of truth. Any Expert-proposed citation would have to pass the same resolver as everything
else, and would resolve `NO_GOVERNED_MATCH` unless a governed, approved release member backs it.
