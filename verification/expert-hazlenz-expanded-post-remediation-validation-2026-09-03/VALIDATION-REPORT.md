# Expert HazLenz — Expanded Post-Remediation Hosted Development Validation

**§146. ONE bounded expanded hosted DEVELOPMENT validation against the v9 contract. 24 logical
calls, 24 provider requests, 0 retries, $0.914836 of a $3.328 enforced ceiling.**

**Not a formal evaluation, not a formal cohort, not a rerun of spent material, not an acceptance run,
not an M14 experiment, not customer-activation authorization.** No frozen scorer ran. No formal
measure was computed. No formal gate status is claimed.

Historical results are untouched: **FORMAL_EVALUATION_FAIL — NOT ACCEPTED**,
`FORMAL_COHORT_SPENT = TRUE`, historical `PROVIDER_INVOCATION_COUNT = 195` before and after.

---

## 1. Terminal

```
EXPERT_HAZLENZ_EXPANDED_POST_REMEDIATION_VALIDATION_FAILED —
CLARIFICATION_RECALL_REMEDIATION_REQUIRED
```

**Why this one, and not the others.** Several axes came back clean or strong — candidate recall
0.857, zero unsupported/duplicate/fragmented candidates, zero citations, zero protected-authority
contradictions, no coverage-habit template, no duplicate questions. **The one axis that fails on a
sound instrument is clarification recall**, which is also the axis the authorization named as
primary and the one LP-B2 has been open on since §142. §5 gives the evidence.

`MULTI_AXIS…` was considered and rejected: the other apparent failures are **instrument** defects,
not product defects, and §9 separates them. `…VALIDATION_INVALID — DEVELOPMENT_INSTRUMENT…` was also
considered — two of nine axes genuinely cannot be concluded — but the instrument does **not** prevent
a valid conclusion overall, because the clarification, candidate, citation and coverage axes all rest
on sound denominators. Reporting INVALID would bury a real, repeated product finding behind a
process complaint.

---

## 2. Confinement

```
historical PROVIDER_INVOCATION_COUNT   195 before, 195 after
provider requests                      24 (24 logical calls, 1 arm, 0 retries, 0 suppressed)
spend                                  $0.914836   enforced ceiling $3.3280   authorized $3.328
tokens                                 309,373 in / 29,609 out
latency                                5,334 – 28,421 ms per call
model                                  anthropic / claude-sonnet-5, bound pre-spend, verified per response
prompt / contract                      hazlenz.expert.prompt.v9 / hazlenz.expert.analysis.v2
system-prompt SHA-256                  8f5c7960c559067626f12e239d63b5da2d312c9faf7dd19d329f555cf93b60f9
wire-schema SHA-256                    2a6c01e8c67004a96f890e4fe2e32a016afde5c348498378f194f9a93f2026c1
normalization SHA-256                  a12b478d80111ac570d1f7660f7f119dc86def251045520ee5fa17522dca1d9b
contract-types SHA-256                 fec3fd5fea5514929717258178883b7b63f7a4f73b4bf5a7d7412bee88bbdfdd
stopReason COMPLETED                   identityViolation null
reserved material / spent cohort       NOT opened / NOT read, reused or mimicked
new formal cohort                      NONE
M14_REMEDIATION_STATUS                 NOT_ATTEMPTED
formal scorer / truth / thresholds     UNCHANGED
production / database / customer       NONE
commit / push / tag / deploy           NONE
```

---

## 3. Pre-spend gates

**34 of 34 gate checks PASS at $0.00**, plus H.4 proved on the live artifact after.

```
protected suites before spend          35 / 35 PASS
SOURCE_PROJECT_TSC                     PASS   (src/**/* ONLY — does NOT cover backend/scripts/)
ACTIVE_SCRIPT_EXECUTABLE_PROOF         TRUE   (zero-provider dry run; 0 calls, 0 artifacts created)
```

Composition proved before spend: 9 TRUE-GAP positives spanning **all six** `affectedDecision`
members; 15 NO-GAP negatives covering **all six** tempting shapes; 8 authored additive-candidate
opportunities; 7 plausible-interaction and 17 no-insight rows; 4 disagreement opportunities; governed
2/2/1/1; 2 citation-adversarial; linkage held to **6 of 24 rows** as a regression axis. 24 rows across
**24 distinct safety domains**.

**The Phase-3 truth gate did real work.** Every TRUE-GAP row was refused unless it carried a missing
fact, two named answers, **two different current outcomes**, and a stated reason the current evidence
is insufficient — the §140 DP-B4 lesson enforced mechanically (`C.1`).

**The additive-recall denominator was MEASURED, not authored** (`F.3`): the real deterministic engine
was run at $0.00 pre-spend, giving **15 truth-present families across 12 rows** that the engine misses.

**Identity is write-once**: dry run created nothing; first live write created it once; a second write
was refused with the bytes unchanged (`24aff618…`).

---

## 4. Persistence

```
records on disk 24   parse problems 0   completeness problems 0
sha256          d52d850c1f887af065fad1d5934a97b33d907f3ead9bc5cc3e930f3307f606cd
mid-run proof   EV-A1 read back FROM DISK with 23 calls outstanding — provenBeforeExit = true
disposition     23 PRESENT, 1 OUTPUT_REJECTED, 0 provider failures
```

### 4.1 One call was condemned by the boundary — and one thing about it is unrecoverable

**EV-A3** returned `OUTPUT_REJECTED` on a single issue:
`EVIDENCE_OUT_OF_BOUNDS — expertHazardCandidates[2]: [-1,-1) outside observation (len 377)`. The
model supplied a quote that does not appear verbatim in the observation, and an unbindable quote is
`ANALYSIS_FATAL` by design. **The safety property worked exactly as specified**: nothing ungrounded
reached the customer path.

The cost is a whole row: three candidates plus any clarification, and with them one TRUE-GAP
opportunity, one REQUIRED-linkage opportunity and one coverage row. **1 of 24 calls (4.2%).**

**A persistence gap, recorded rather than worked around:** the run record stores the *validated*
analysis, so for a rejected call we know **why** it was refused but not **what** was quoted. The raw
wire payload is not persisted, so the offending text is unrecoverable for this run. No attempt was
made to reconstruct it.

---

## 5. Clarification — the axis that fails

| readout | value |
|---|---|
| `TRUE_GAP_OPPORTUNITIES` | 8 *(9 authored; EV-A3 was rejected)* |
| `TRUE_GAP_CORRECTLY_ASKED` (loose: a question was emitted) | **6** → **0.75** |
| **`TRUE_GAP` recovered (strict: the authored gap was asked)** | **5** → **0.625** |
| `TRUE_GAP_MISSED` | 2 |
| `NO_GAP_ROWS` / `NO_GAP_ROWS_SILENT` | 15 / 11 → **0.733** |
| `TOTAL_CLARIFICATIONS` / per call | 10 / **0.435** |
| `AFFECTED_DECISION_CORRECT` / `INCORRECT` | **3 / 3** |
| `GENERIC_OR_COVERAGE_HABIT_QUESTIONS` | **0** |
| `DUPLICATE_QUESTIONS` | **0** |

**The loose figure meets the 0.75 target and the strict figure does not.** The distinction is the one
§140 established and it is applied again here: `TRUE_GAP_CORRECTLY_ASKED` counts *a question emitted
on a TRUE-GAP row*, not *the authored gap recovered*. On **EV-A2** the model asked a different
question — whether extraction would be connected — instead of the authored gap, the filed sampling
result. Counting that as recall would overstate the axis. **Strict recall is 5 of 8 = 0.625, below
the 0.75 target, and that is the finding.**

**The two outright misses share one shape with LP-B2: the model RESOLVED the question instead of
asking it.**

- **EV-A4** (`REQUIRED_CONTROL`) — whether the automatic upstream start sequence is inhibited, not
  merely the local isolator switched off. No question emitted.
- **EV-A6** (`REGULATORY_INTERPRETATION`) — and this one is unusually clear, because the model wrote
  the reasoning out and then declined to ask:
  > *"The supplied governed record sets its threshold at above 24 feet, so it does not extend to a
  > ladder measured at twenty-three feet six inches; that is a distinction worth flagging but not a
  > basis to challenge the deterministic hazard finding."*

  It performed the interpretation and settled it unilaterally rather than surfacing it as the
  decision-critical question the fixture authored. **This is now a repeated, evidence-backed pattern
  across LP-B2, EV-A4 and EV-A6** — not a one-row anomaly — which is why the terminal names it.

`affectedDecision` accuracy is **3 of 6**. Two of the three mismatches recovered the right gap under
the wrong label (EV-A1 existence→severity, EV-C6 control→severity); one (EV-A2) mislabelled a
different question. **Six labelled clarifications is a thin denominator and no rate should be read
off it.**

### 5.1 The NO-GAP figure understates precision, and I am not treating it as a clean fail

Mechanically 11 of 15 silent = 0.733, under the 0.80 target. But of the four questions emitted:

| row | authored shape | the question | assessment |
|---|---|---|---|
| **EV-C2** | SEVERITY_REFINEMENT_ONLY | *"Is there any area below or adjacent to the open mezzanine edge where people work, pass, or store material…?"* | **a genuine EXPOSURE question** — whether anyone is below changes what is done today. My fixture label is wrong |
| **EV-D4** | SEVERITY_REFINEMENT_ONLY | *"Does taking the sample require the operator to open the hatch and reach or lean into the silo interior…?"* | **a genuine confined-space exposure question.** My fixture label is wrong |
| EV-B6 | ALREADY_ESTABLISHED_FACT | whether the broken lock has been permanently repaired | borderline — the chain was fitted during the visit, so arguably re-litigating |
| EV-C1 | ROUTINE_DUE_DILIGENCE | solvent flash point | defensible as refinement — bonding is owed regardless |

**Two of four are questions my fixture failed to anticipate, not model overproduction.** Adjusted for
those, silence would be 13 of 15 = 0.867 and would meet the target. **Reported both ways; the
mechanical figure is not presented as a clean model failure.**

---

## 6. Candidate axes — clean

| readout | value |
|---|---|
| `ADDITIVE_CANDIDATE_OPPORTUNITIES` *(measured)* | **14** |
| `ADDITIVE_CANDIDATES_FOUND` | **12** → **0.857** (target 0.80) **MET** |
| `TOTAL_EXPERT_CANDIDATES` | 30 |
| `SUPPORTED_DISTINCT` | **14** |
| `PLAUSIBLE_BUT_UNVERIFIED` | 16 |
| `DUPLICATE_SEMANTIC_CANDIDATE` / `OVER_FRAGMENTED` / `UNSUPPORTED` | **0 / 0 / 0** |

**No unsupported candidate was emitted anywhere in 24 rows**, and no candidate fell in a row's
FORBIDDEN bucket. **`OVER_FRAGMENTED` and `DUPLICATE` are never asserted** — every fixture declares
`DECOMPOSITION_UNRESOLVABLE`, so multi-candidate families are *reported*, never convicted. That is
the §145 rule holding: a fixture may not author candidate-count truth.

Worth noting on the fragmentation probe **EV-C2** — one physical defect (a removed handrail run) with
several consequences — the model emitted **one** candidate, not three. A single observation, but it
does not support a fragmentation concern.

---

## 7. Governed evidence and citation — clean

| readout | value |
|---|---|
| `INPUT_CITATION_SHAPED_COUNT` | **0** |
| `EXPERT_OUTPUT_CITATION_SHAPED_COUNT` | **0** |
| `ACCEPTED_CITATION_COUNT` / `MERGED_CITATION_COUNT` | **0 / 0** |
| supplied record fields carrying a citation pre-render | 7 — redaction exercised |
| governed-authority block (context, never a defect) | 6 |

`UNSUPPORTED_ACCEPTED_CITATIONS = 0`. `UNSUPPORTED_MERGED_CITATIONS = 0`.

- **RELEVANT (EV-D1)** — grounded: *"…creates an active entanglement exposure consistent with the
  supplied governed record's requirement for guarding at ingoing nip points."*
- **UNRELATED (EV-D2)** — no governed obligation asserted; **no `welding_fumes` candidate**, so the
  irrelevant record induced nothing.
- **NONE (EV-D3)** — hazards stated, no governed obligation asserted.
- **NARROWER (EV-D4)** — refused in as many words: *"R1 explicitly states it addresses portable
  ladders only and imposes no requirement on fixed ladders, so it cannot be used to establish or
  negate any obligation for the fixed silo ladder."*

**No forbidden hazard family was emitted on any row in the validation.**

*Measurement note:* my `referencesARecordHandle` signal reported `false` on both RELEVANT rows even
though EV-D1 plainly grounds on the record — the model referred to *"the supplied governed record"*
rather than the `R1` handle. The handle check is a weak proxy; the verbatim text is what settles it.

---

## 8. Additive union quality

| readout | value |
|---|---|
| truth-present families | 24 |
| deterministic coverage | 9 |
| **Expert additive coverage** | **12** |
| **combined coverage** | **21 of 24** |
| combined misses | **3** |

**Expert supplied more truth-present coverage than the deterministic layer did** (12 vs 9) with no
deterministic regression. The three misses:

- **EV-A3** `chemical_inhalation_contact` — caused by the `OUTPUT_REJECTED`, not by recall.
- **EV-A8** `fire_explosion` — genuine miss (the engine emitted `hot_work` only).
- **EV-C3** `emergency_equipment` — genuine miss.

**Two genuine union misses in 24 rows.**

### Collection sparsity (23 PRESENT calls)

| collection | total | rows empty |
|---|---|---|
| `expertCandidates` | 30 | 6 |
| `decisionCriticalClarifications` | 10 | **13** |
| `crossHazardInsights` | 12 | 13 |
| `disagreements` | 8 | **15** |

Outcomes: `ANALYZED` 21, `NOTHING_TO_ADD` 2. Empty-by-default is intact — every collection is empty
on more than half the rows, and nothing looks forced.

---

## 9. Two axes I cannot conclude, and why that is an instrument finding

This is the part that must not be dressed up as a model result.

### 9.1 Disagreements — the denominator was authored blind

Mechanically: 8 emitted, only 1 on a row the fixture marked as an opportunity, so 7 would score
"unnecessary". **On inspection, all 7 are substantively correct challenges:**

| row | the challenge |
|---|---|
| EV-B2, EV-D1 | the engine left *"moving or accessible energy"* UNKNOWN while the observation states continuous running and hand contact |
| EV-B3 | crane asserted active when the observation says *"parked and isolated with its pendant stowed"* |
| EV-B4 | over-inclusive finding on an e-stop tested working three times |
| EV-B5 | over-inclusive finding on a line repaired, pressure-tested and recertified |
| EV-C3 | a bench-grinder tool rest classified as `hot_work` with no hot work described |
| EV-D4 | the portable-ladder record cannot establish *or negate* an obligation for the fixed ladder |

**A disagreement opportunity depends on what the deterministic layer emits, which the fixture cannot
predict.** This is structurally the same construct-validity defect §145 identified for linkage
ambiguity — and it is the **fifth** instrument defect in this programme, the second of the construct
kind. `VALID_DISAGREEMENT_OPPORTUNITIES = 4 / FOUND = 1` is **not a valid measure** and is reported
as void.

What *can* be said: **`PROTECTED_AUTHORITY_CONTRADICTIONS = 0`** — counted from the boundary's own
refusals, not inferred from prose — and every emitted disagreement targets a challengeable surface.

### 9.2 Cross-hazard insights — the no-insight labels were too strict

Mechanically: 12 emitted, 6 of 6 opportunities found, 4 on rows the fixture said warranted none. **All
four name a real mechanism:**

- **EV-A1** — the hazcom failure is *why* respiratory protection cannot be selected for the vapour.
- **EV-B6** — a broken lock plus routine unqualified corridor traffic.
- **EV-D1** — continuous running plus hand jam-clearing at an unguarded nip.
- **EV-D2** — a blocked exit **and** an inward-opening door: *"even a person who reaches the door
  cannot swing it open into the stacked castings to escape."*

**No unsupported-overproduction pattern is established**; my `NO_INSIGHT_WARRANTED` labels were
wrong on those rows. **EV-C3, the deliberate negative control — two real hazards 60 m apart through
two fire doors — correctly emitted ZERO insights**, which is the one insight datum on a sound
denominator.

Also worth recording against §140's concern: **`interactionKind: OTHER` appears on only 2 of 12**
insights, against 5 of 13 in §140.

---

## 10. Linkage — regression axis only

| readout | value |
|---|---|
| `REQUIRED_LINKAGE_OPPORTUNITIES` | **2** |
| `REQUIRED_LINKAGE_VALID` | **1** |
| `INVALID_LINKAGE_ACCEPTED` | **0** |
| `OUTPUT_RELATIVE_FORBIDDEN_DEFECTS` | **0** |
| `SCENARIO_INTENT_NOT_REALIZED` | 3 |

Of four REQUIRED-linkage rows, one was rejected (EV-A3) and one emitted no clarification (EV-A4), so
only two produced an opportunity. **No invalid key was accepted and no output-relative FORBIDDEN
defect occurred.** With a denominator of 2, this neither confirms nor disturbs the §145 closure, and
**linkage is not reopened.**

---

## 11. Advancement decision

| # | criterion | target | observed | met |
|---|---|---|---|---|
| 1 | clarification recall | ≥0.75 | **0.625 strict** / 0.75 loose | **NO (strict)** |
| 2 | NO-GAP silence | ≥0.80 | 0.733 mechanical / 0.867 adjusted (§5.1) | **NO mechanically; fixture-limited** |
| 3 | no systematic generic/coverage-habit questioning | none | **0 template rows, 0 duplicates** | **YES** |
| 4 | candidate recall | ≥0.80 | **0.857** | **YES** |
| 5 | candidate precision | no material pattern | **0 unsupported / 0 duplicate / 0 fragmented** | **YES** |
| 6 | insights no unsupported-overproduction | no material pattern | none established (§9.2) | **YES** |
| 7 | protected authority contradiction | 0 | **0** | **YES** |
| 8 | governed negatives behave correctly | all | **3 of 3 correct** | **YES** |
| 9 | unsupported accepted/merged citations | 0 | **0** | **YES** |
| 10 | combined coverage, no deterministic regression | additive value | **21/24; Expert 12 vs engine 9** | **YES** |
| 11 | linkage no material regression | none | 1/2 valid, 0 invalid, 0 defects | **YES** (thin) |
| 12 | persistence / identity / budget integrity | clean | clean; 1 boundary rejection (§4.1) | **YES** |
| 13 | 35/35 protected suites after | 35/35 | **35/35, identical** | **YES** |

**Eleven of thirteen. Criterion 1 fails on a sound instrument; criterion 2 fails mechanically but is
fixture-limited.**

---

## 12. Post-spend verification

```
protected suites after                 35 / 35 PASS, identical to the pre-spend baseline
SOURCE_PROJECT_TSC                     PASS   (src/**/* ONLY — does NOT cover backend/scripts/)
ACTIVE_SCRIPT_EXECUTABLE_PROOF         TRUE   (measure-only zero-provider path)
```

---

## 13. Remaining unknowns

1. **Clarification recall is the standing product defect.** Three instances now share one shape —
   LP-B2, EV-A4, EV-A6 — the model *resolves* a decision-critical question rather than surfacing it.
   EV-A6 shows the reasoning written out and then settled unilaterally.
2. **Disagreement quality cannot be measured with an authored denominator** (§9.1). A new construct
   is needed: the opportunity must be derived from the deterministic output, not predicted.
3. **Insight precision needs fixture truth that is not over-strict** (§9.2).
4. **`affectedDecision` accuracy rests on six labels.** No rate should be read off it.
5. **One call in 24 was condemned by an unbindable quote**, and the offending text is unrecoverable
   because the raw wire is not persisted.
6. **One arm, one replicate, 24 rows.** No rate, no distribution, no reproducibility claim.
7. **M14 remains causally unresolved.** `NOT_ATTEMPTED`.

---

## 14. Files

`verification/expert-hazlenz-expanded-post-remediation-validation-2026-09-03/`: `VALIDATION-REPORT.md`,
`FIXTURE-MANIFEST.json`, `PRE-SPEND-IDENTITY.json` (write-once, refusal proven live),
`PRE-SPEND-IDENTITY.remeasure.json` (the separate file the zero-provider re-measure writes, so the
spend identity is never touched), `RUN-RECORDS.jsonl` (`d52d850c…`, re-verified unchanged after all
post-processing), `ATTEMPT-LEDGER.json`, `RESULTS-SUMMARY.json`,
`CANDIDATE-ADJUDICATION.csv`, `CLARIFICATION-ADJUDICATION.csv`, `INSIGHT-ADJUDICATION.csv`,
`DISAGREEMENT-ADJUDICATION.csv`. Exact provider outputs are preserved; nothing was reconstructed.

Plus `backend/src/safescope-v2/expert-hazlenz/fixtures/expanded-validation-v4.ts` and
`backend/scripts/validate-expert-expanded-2026-09-03.ts`. **No production source, formal scorer,
formal truth, threshold or frozen artifact was modified, and no historical evidence was altered.**
