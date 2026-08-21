# KG-3E Phase 1 — authoritative work queue

Generated live, not from a snapshot. Emission measured by running the real in-code selection
engine `applyFindingScopedStandards()` over the tracked, hash-verified gold set
(sha256 `93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3`, 31 cases), then joined to current corpus state.

**Usage counts mean**: number of gold-set observations whose selection returns this citation; a measured usage signal for PRIORITISATION ONLY. High usage is never evidence of correctness.

## Independent confirmation of the KG-3D figures

| Measure | KG-3D reported | KG-3E measured live | Match |
|---|---|---|---|
| Distinct emitted citations | 23 | 23 | yes |
| Emitted + approved | 7 | 7 | yes |
| Emitted with no governed record | 7 | 7 | yes |

KG-3D read its emitted set from a static KG-3C artifact. Re-deriving it from the selection
engine reproduces the same 23 citations, so the KG-3D coverage numbers were measuring the
right set. That is a confirmation, not an assumption carried forward.

## New finding — a second emission surface the snapshot could not see

**32 citations are declared by `EXPERT_APPLICABILITY_RULES` but selected by no gold-set
observation, and have no governed record at all.** A frozen list of emitted citations cannot
show these. They are not cutover blockers today — nothing measured emits them — but each is a
latent gap: if such a rule fires on a real observation, the citation resolves to `CITATION_ONLY`.
Recorded as `DECLARED_BUT_NOT_EMITTED_NO_RECORD` and carried into the readiness verdict.

## Classification totals

| Classification | Count |
|---|---|
| `DECLARED_BUT_NOT_EMITTED_NO_RECORD` | 30 |
| `MISSING_GOVERNED_RECORD` | 7 |
| `APPROVED_GOVERNED_CONTENT` | 7 |
| `CONTENT_DIFF_REQUIRED` | 3 |
| `SOURCE_METADATA_REQUIRED` | 3 |
| `READY_FOR_EXACT_REVIEW` | 2 |
| `NOT_CURRENTLY_USED` | 2 |
| `SOURCE_URL_REFRESH_REQUIRED` | 1 |

## The queue — emitted citations, in review order

| # | Citation | Use | Jurisdiction | Family | Review state | Classification |
|---|---|---|---|---|---|---|
| 1 | `29 CFR 1926.501` | 2 | OSHA/construction | not-declared-by-expert-rule | mechanically_validated | `CONTENT_DIFF_REQUIRED` |
| 2 | `30 CFR 56.14107(a)` | 2 | MSHA/mining | machine_guarding | mechanically_validated | `CONTENT_DIFF_REQUIRED` |
| 3 | `29 CFR 1926.451(g)(1)` | 2 | OSHA/construction | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 4 | `29 CFR 1910.36` | 2 | OSHA/general industry | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 5 | `30 CFR 62.120` | 2 | MSHA/mining | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 6 | `29 CFR 1910.147` | 1 | OSHA/general industry | machine_guarding_loto | mechanically_validated | `CONTENT_DIFF_REQUIRED` |
| 7 | `29 CFR 1910.1200` | 1 | OSHA/general industry | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 8 | `29 CFR 1910.28` | 1 | OSHA/general industry | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 9 | `29 CFR 1910.95` | 1 | OSHA/general industry | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 10 | `29 CFR 1926.1153` | 1 | OSHA/construction | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 11 | `29 CFR 1926.652(a)(1)` | 1 | OSHA/construction | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 12 | `30 CFR 56.14132(a)` | 1 | MSHA/mining | not-declared-by-expert-rule | — | `MISSING_GOVERNED_RECORD` |
| 13 | `29 CFR 1910.178(p)(1)` | 1 | OSHA/general industry | mobile_equipment | mechanically_validated | `SOURCE_METADATA_REQUIRED` |
| 14 | `29 CFR 1910.212(a)(1)` | 1 | OSHA/general industry | machine_guarding | mechanically_validated | `SOURCE_METADATA_REQUIRED` |
| 15 | `30 CFR 56.12016` | 1 | MSHA/mining | machine_guarding_loto | mechanically_validated | `SOURCE_METADATA_REQUIRED` |
| 16 | `30 CFR 62.130` | 1 | MSHA/mining | not-declared-by-expert-rule | mechanically_validated | `SOURCE_URL_REFRESH_REQUIRED` |
| 17 | `29 CFR 1926.52` | 1 | OSHA/construction | not-declared-by-expert-rule | mechanically_validated | `READY_FOR_EXACT_REVIEW` |
| 18 | `29 CFR 1926.59` | 1 | OSHA/construction | not-declared-by-expert-rule | mechanically_validated | `READY_FOR_EXACT_REVIEW` |
| 19 | `29 CFR 1910.303` | 1 | OSHA/general industry | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 20 | `29 CFR 1926.300(b)(2)` | 1 | OSHA/construction | machine_guarding | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 21 | `29 CFR 1926.34(a)` | 1 | OSHA/construction | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 22 | `29 CFR 1926.416(a)(1)` | 1 | OSHA/construction | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |
| 23 | `30 CFR 47.41(a)` | 1 | MSHA/mining | not-declared-by-expert-rule | mechanically_validated | `APPROVED_GOVERNED_CONTENT` |

### Why each blocked emitted record is blocked

- **`29 CFR 1926.501`** — `CONTENT_DIFF_REQUIRED`. KG-3D: "fall protection… at applicable elevations or conditions" states no requirement — it omits the 6-foot trigger that is the operative fact. Additionally blocked: no recorded source_url to review against.
- **`30 CFR 56.14107(a)`** — `CONTENT_DIFF_REQUIRED`. KG-3D: omits (b), the seven-foot exemption that materially limits the rule. Additionally blocked: no recorded source_url to review against.
- **`29 CFR 1926.451(g)(1)`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1910.147`** — `CONTENT_DIFF_REQUIRED`. KG-3D: states the purpose, not the energy-control-program requirement; title omits "(lockout/tagout)". Additionally blocked: no recorded source_url to review against.
- **`29 CFR 1910.1200`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1910.28`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1910.95`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1926.1153`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1926.652(a)(1)`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`30 CFR 56.14132(a)`** — `MISSING_GOVERNED_RECORD`. HazLenz emits this citation and the release holds no governed record for it. Direct cutover blocker.
- **`29 CFR 1910.178(p)(1)`** — `SOURCE_METADATA_REQUIRED`. Registered source key but no recorded source_url/retrieval_date, so no reviewer can compare the stored text against anything. Blocks substantive review.
- **`29 CFR 1910.212(a)(1)`** — `SOURCE_METADATA_REQUIRED`. Registered source key but no recorded source_url/retrieval_date, so no reviewer can compare the stored text against anything. Blocks substantive review.
- **`30 CFR 56.12016`** — `SOURCE_METADATA_REQUIRED`. Registered source key but no recorded source_url/retrieval_date, so no reviewer can compare the stored text against anything. Blocks substantive review.
- **`30 CFR 62.130`** — `SOURCE_URL_REFRESH_REQUIRED`. source_url points at a dated annual CFR edition (2023), not a current-as-of authority. Content may still be correct; classified separately from content correctness.
- **`29 CFR 1926.52`** — `READY_FOR_EXACT_REVIEW`. Registered provenance and a recorded source URL; awaiting substantive clause-level review.
- **`29 CFR 1926.59`** — `READY_FOR_EXACT_REVIEW`. Registered provenance and a recorded source URL; awaiting substantive clause-level review.

## Carried-forward content verdicts, re-validated

Each KG-3D `CONTENT_DIFF_REQUIRED` verdict is pinned to the checksum it was made against and
re-checked at runtime. A verdict whose checksum no longer matched would be treated as stale
and the record would re-enter normal review.

| Citation | Adjudicated against | Still applies |
|---|---|---|
| `29 CFR 1926.501` | `0a2b948e7b0a…` | **yes** — content unchanged |
| `30 CFR 56.14107(a)` | `8d4f5413952e…` | **yes** — content unchanged |
| `29 CFR 1910.147` | `e9a59a7eb938…` | **yes** — content unchanged |

All three still apply: no record has changed since KG-3D adjudicated it.
