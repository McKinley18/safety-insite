# Authoritative regulatory source acquisition and governed corpus expansion — 2026-08-28

```
TERMINAL = HAZLENZ_AUTHORITATIVE_STANDARDS_CORPUS_STAGED
           — REVIEWER_GOVERNANCE_ACTION_REQUIRED
```

All authoritative source material required for the declared v1.0 bounded scope has been acquired
from official government sources, normalized through the repository's own governed mechanism, and
proved to materialize deterministically. **Zero `SOURCE_AUTHORITY_MISSING` entries remain.** The
one thing this phase may not do for itself is approve the records: reviewer approval is a human
governance act with no HTTP surface, and self-approving to clear a gate is precisely what the
architecture forbids.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / deploy / reset / restore / clean / stash / rebase | **none performed** |
| production mutated | **no** |
| Anthropic / LLM provider calls | **0** |
| stashes / tags | 4 / 24, untouched |

The protected deterministic hazard baseline is intact and was re-measured, not assumed:

| protected metric | required | measured |
|---|---|---|
| Level-1 required hazard recognition | 43/43 | **43/43** |
| actionable required-hazard coverage | 43/43 | **43/43** |
| life-critical recognition | 35/35 | **35/35** |
| life-critical actionable coverage | 35/35 | **35/35** |
| Population A case-level precision | 100 % | **100.0 %** |
| Population A forbidden emissions | 0 | **0** |
| new regressions | none | **none** |

## 2. Phase 1 — the frozen architecture finding, restated not rewritten

* **A. Governed source set** — DB-free, version-controlled, **35 records at phase entry**, feeds
  `standards_master` and releases.
* **B. `standards_master`** — 35 rows when the repository seed is applied locally; production is
  documented at approximately 2,390 legacy eCFR rows; feeds analysis-level `suggestedStandards`.
* **C. `evidence-foundation.ts`** — approximately 30 code-resident citations across about twelve
  hazard families; feeds customer finding citations and the report PDF, and is the reason the
  bounded real-workflow result stayed **16 matched / 1 no-standard-applicable / 26
  expected-but-missing** even after the governed corpus was populated.

The second measured defect is likewise preserved and was re-characterised rather than repaired
(§7).

## 3. Phase 2 — source authority policy

**Used, exclusively:** the eCFR versioner API (`https://www.ecfr.gov/api/versioner/v1/...`), the
official codified source for the Code of Federal Regulations, at these point-in-time editions:

| title | latest amended | up to date as of |
|---|---|---|
| 29 — Labor | 2026-08-04 | 2026-08-26 |
| 30 — Mineral Resources | 2026-08-25 | 2026-08-26 |

**Not used, and not permitted:** blogs, training websites, law-firm summaries, vendor pages,
search-engine snippets, secondary compliance summaries, AI-generated regulatory text.

Every retrieval returned HTTP 200. The verbatim XML for all **37 sections** is preserved in
`source-evidence/` with SHA-256 checksums in `SOURCE_CHECKSUMS.txt`.

### On verbatim text versus authored summary

The repository's corpus contract does **not** store verbatim regulatory text: the projection in
`standards-intelligence-projection.ts` derives `standards_master.standardText` FROM
`plainLanguageSummary`, and the KG-3D/3E adjudications establish the house style — state what the
cited paragraph requires and NAME any sibling paragraph that limits it. These records follow that
style, and each carries `sourceUrl` and `retrievalDate` so a reviewer can compare the summary
against the codified text in one click. Nothing was paraphrased into a field the contract expects
to hold verbatim material, because no such field exists.

## 4. Phases 3-5 — what was acquired

**37 provisions**, chosen to answer the nine families the previous phase reported uncovered, plus
five the coverage matrix named and the source-authority gate caught the governed set not holding.

| family | OSHA general industry | OSHA construction | MSHA |
|---|---|---|---|
| hot work | `1910.252` | `1926.352` | `56.4100`, `56.14213` |
| fire protection | `1910.157` | `1926.150` | `56.4100` |
| compressed gas | `1910.253`, `1910.101` | `1926.350` | `56.16005`, `56.16006` |
| respiratory protection | `1910.134` | `1926.103` | `56.5005` |
| ventilation | `1910.94` | `1926.353` | `56.5005`, `56.14213` |
| PPE eye/face | `1910.133` | `1926.102` | `56.15004` |
| material handling and storage | `1910.176` | `1926.250` | `56.16001` |
| cranes, rigging, suspended loads | `1910.179`, `1910.184` | `1926.251`, `1926.1425` | `56.16007`, `56.16009` |
| confined space | *(already governed: `1910.146`)* | `1926.1204` | *no analogue — see below* |
| silica | `1910.1053` | *(already governed)* | *(via `56.5005`)* |
| environmental release | `1910.120` | `1926.65` | *no analogue* |
| traffic control | *no analogue* | `1926.201` | *(already governed)* |
| hazardous energy (construction) | — | `1926.417` | — |
| fall protection (MSHA) | — | — | `56.15005` |
| ground control (MSHA) | — | — | `56.3200` |
| emergency egress (MSHA) | — | — | `56.4530` |

**OSHA citations were not reused for MSHA.** Where the regimes differ structurally the difference
is recorded in the summary rather than smoothed over — for example MSHA regulates hot work through
an ignition-source prohibition (`56.4100`) and welding shielding (`56.14213`) rather than a fire
watch; `56.16009` states the suspended-load duty absolutely, without the fall-zone exceptions
`1926.1425(b)` allows; and `56.15005` carries both the fall duty and the nearest MSHA analogue to a
confined-space attendant.

**`AUTHORITATIVE_SOURCE_ACQUISITION_BLOCKED`: none.** Every provision the matrix names was
retrieved.

## 5. Phase 6 — governed source set expansion

New version-controlled artifact:
`backend/src/safescope-v2/standards-intelligence/standards-intelligence.v1-expansion.ts`
(SHA-256 `168498edfa9aaca3d432d40d57326a0da8486cd1d6f8d3bdf74dfd875e691667`).

It is **appended**, not merged into `RAW_STANDARDS_INTELLIGENCE_SEED`, so no historical governed
record is edited, moved or re-ordered — the 35 records KG-3D/3E/4A adjudicated keep their exact
positions and content. Both sets pass through the same `withSourceRegistryMetadata` projection, so
a new record is indistinguishable in shape from an original one downstream.

**No database table was populated by hand.** The governed source set remains the source of truth
and materializes the runtime corpus deterministically.

| check | result |
|---|---|
| duplicate citations | **0** (72 records, 72 distinct citations) |
| conflicting mappings | 0 |
| invalid records | 0 (`tsc` clean; every record satisfies `StandardsIntelligenceRecord`) |
| placeholder-provenance records | 0 |
| historical governed records mutated | **0** |
| provenance (`sourceUrl` + `retrievalDate`) on new records | 37 / 37 |
| provenance across the whole corpus | 64 / 72 (the 8 without are original curated records predating the provenance fields) |

## 6. Phase 7 — reproducible materialization

Two clean disposable databases, created for this phase, migrated and seeded independently through
`npm run seed:safescope-standards`:

```
test_v1_corpus_final_run1   72 records   manifest 702339e5f7b486a1fdc270abd0c006f25dc0cac4483bcc31dfbcb32bd14f121b
test_v1_corpus_final_run2   72 records   manifest 702339e5f7b486a1fdc270abd0c006f25dc0cac4483bcc31dfbcb32bd14f121b
```

```
MATERIALIZATION_DETERMINISTIC = TRUE
```

| metric | before | after |
|---|---|---|
| governed records | **35** | **72** |
| unique regulatory sections | 35 | **72** |
| OSHA general industry | 13 | **25** |
| OSHA construction | 11 | **24** |
| MSHA | 11 | **23** |
| duplicates / conflicts / invalid | 0 / 0 / 0 | **0 / 0 / 0** |
| foreign rows seen by the legacy-corpus guard | 0 | **0** |
| manually inserted rows | 0 | **0** |

**Governance observation, recorded not repaired:** the finalizer reuses the release identifier
`federal-core-2026-07-30.1` for the expanded content — only the manifest checksum moved
(`14a34fea…` → `702339e5…`). A release whose content changed but whose version string did not is a
provenance hazard: two artifacts named the same release are not the same release. Versioning the
release identifier belongs to the reviewer-governance action in §8, not to this phase.

## 7. Phase 10 — the unresolved-jurisdiction defect, re-characterised

Measured against the expanded 72-record corpus with six authored probes across four jurisdiction
postures.

**The defect largely dissolves as the corpus grows, and the threshold is not the thing that is
wrong.**

| measurement | result |
|---|---|
| unresolved-jurisdiction recall on obvious cases | **4 / 5** |
| **wrong-jurisdiction candidates across every pinned run** | **0** |
| false positive on the inapplicable administrative control | 1 (`1910.101` for "the SDS binder was current and complete") |

At 35 records the relevance signal was too thin for any candidate to clear the `score >= 10`
admission floor without the `+15` in-scope bonus; at 72 records it clears for most observations,
and candidates from all three regimes are offered — which is what the documented "conditional
candidates until the observation establishes the governing agency" contract describes.

**No repair.** The remaining P-01 miss is a **ranking** defect, not an admission defect: for a
textbook LOTO observation the engine returned `1910.252` (hot work) instead of `1910.147` under an
unresolved regime, and it returns `1910.147` correctly once general industry is pinned. Lowering
the threshold would not fix a mis-ranking and would worsen the P-05 false positive. This is the
evidence for leaving the threshold alone, recorded so the question is not re-opened without it.

## 8. Phase 9 — reviewer governance state

Determined from the governance code, not assumed.

| question | answer |
|---|---|
| Is reviewer approval required before a record can be customer-authoritative? | **Yes.** `resolveStandardsBacking()` returns `APPROVED_GOVERNED_CONTENT` only when `effectiveReviewState === 'reviewer_approved'` and the record carries content. Anything else is `UNAPPROVED_CONTENT` or `CITATION_ONLY`. |
| Is the current release operating in a legacy/fallback mode because approval is absent? | **Yes, in the sense that matters:** the release is `provisional`, `DEFAULT_CUTOVER_MODE` is `LEGACY`, and no record can present as approved regulation. |
| What identity may approve? | A stable reviewer identifier with an optional qualification (`--reviewer`, `--role`, e.g. `CSP`, `regulatory-analyst`), recorded in an append-only decision log. |
| Is approval a human act rather than a harness operation? | **Yes, by deliberate design.** `npm run review:release-record -- approve` is the ONLY way to record a decision; there is no HTTP endpoint, because "approving a regulatory record — deciding what customers will be told is authoritative regulation — is rarer and more consequential than activation". `--expected-checksum` is mandatory: there is no "approve whatever is stored now" mode, precisely to prevent bulk rubber-stamping. |
| May this phase create candidates without approving them? | **Yes**, and it did. |

```
reviewState: { unreviewed: 0, mechanically_validated: 72, reviewer_approved: 0 }
reviewer decisions recorded: 0
release status: provisional
```

**Nothing was self-approved.** The required operation is a human one, per record:

```
npm run review:release-record -- show     --release <id> --citation "29 CFR 1910.252"
npm run review:release-record -- approve  --release <id> --citation "29 CFR 1910.252" \
                                          --expected-checksum <sha256 from show> \
                                          --reviewer <id> --role <qualification>
```

This is the only remaining blocker to an authoritative release, which is why the terminal is
`STAGED` rather than `READY`. Note that the 35 pre-existing records are equally unapproved — this
is a standing governance debt, not something this phase introduced.

## 9. Phase 8 — source-level coverage verification

New gate: `backend/src/safescope-v2/tests/hazlenz-source-authority-gate.ts`
(SHA-256 `abdc29273ac22ab67224450d4ea79db28ccba171294c9a4a332c672b09389ac2`), registered as the
36th suite of `npm run test:hazlenz-core`. It reads the governed source set directly, with no
database, so it cannot be satisfied by a hand-inserted row.

Matrix: `backend/src/safescope-v2/tests/hazlenz-regulatory-coverage-matrix.ts`
(SHA-256 `7e8af4a2d50f21e91c0da3056c28d38baf25c3fb01a646e1aa25c3c2007630a6`) — **24 hazard families
× 3 regimes = 72 cells.**

| verdict | before acquisition | after |
|---|---|---|
| `SOURCE_AUTHORITY_PRESENT` | 31 | **67** |
| `NO_STANDARD_APPLICABLE` | 5 | **5** |
| **`SOURCE_AUTHORITY_MISSING`** | **36** | **0** |
| `OUT_OF_SCOPE` | 0 | 0 |

The five `NO_STANDARD_APPLICABLE` cells are honest structural answers, not gaps: MSHA has no
permit-required confined space programme standard and no emergency-response-to-release standard;
OSHA general industry has no trenching subpart, no pedestrian/vehicle separation standard, and no
ground-control analogue.

**The gate caught this report over-claiming.** Five matrix cells originally named provisions
(`1926.417`, `56.15005`, `56.3200`) that the governed set did not hold. They were acquired rather
than de-scoped — which is the gate working as intended: a cell may not name a provision the
governed source set lacks.

## 10. Phase 12 — regression

| suite | result |
|---|---|
| `npm run test:hazlenz-core` | **36/36 PASS**, unrelaxed |
| `npx tsc --noEmit` | clean |
| `test:hazlenz-precision` | PASS — A precision 100.0 %, 0 forbidden, 0 A omissions, B 43/43, 0 life-critical omissions |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `test:hazlenz-standards-jurisdiction` | PASS (16 checks, 0 wrong-jurisdiction citations) |
| `test:hazlenz-source-authority` (new) | PASS — 0 `SOURCE_AUTHORITY_MISSING` |
| **`golden-standards-tests` against the EXPANDED corpus** | **15 passed, 0 failed** |
| `standard-applicability-regression` | PASS |
| `hazlenz-primary-citation-visible-contract-regression` | PASS |
| `hazlenz-generalization-regression` | PASS |
| `validate-safescope-multi-hazard-decomposition-v1` | PASS |
| `hazlenz-energy-isolation-negation-regression` | PASS |
| `hazlenz-condition-state-invariants-regression` | PASS |

**NEW_REGRESSION: none.** The four known failures — `domain-association-regression`,
`golden-hazard-tests` (1/12), `hazlenz-vague-candidate-promotion-regression` (2),
`hazlenz-standard-return-contract-regression` (9) — are byte-identical to the prior accepted state.

Tripling the general-industry corpus and doubling the MSHA corpus changed no standards-dependent
suite's result, which is itself evidence that the expansion is additive rather than disruptive.

**Still UNVERIFIED:**

| surface | reason |
|---|---|
| production legacy corpus behaviour | documented at approximately 2,390 eCFR rows; not reachable from this authorization |
| `safescope_knowledge_chunks` retrieval path | 0 rows in every available database |
| reviewer-approved governed content | 0 of 72 records approved (§8) |
| governed cutover modes above LEGACY | not enabled; out of scope |

## 11. Phase 11 — architecture proposal for the next phase

**Not implemented here, by instruction.** `evidence-foundation.ts` was not modified and no second
mini-library was created. See `FINDING_LEVEL_ARCHITECTURE_PROPOSAL.md`.

## 12. Expert readiness

Six blockers remain open; Expert HazLenz is not authorised and must never become the regulatory
source of truth.

```
EXPERT_HAZLENZ_IMPLEMENTED = FALSE
PROVIDER_CALL_IMPLEMENTED  = FALSE
PROVIDER_CALLS_MADE        = 0
```
