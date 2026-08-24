# L3-2i — CANDIDATE-INDEPENDENT CLARIFICATION CONTRACT + SCORER CORRECTION + REVALIDATION

`EXECUTED` · `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` ·
`SEALED_ACCEPTANCE_CORPUS_UNTOUCHED`

> ### `L3_2I_COMPLETE — CANDIDATE_INDEPENDENT_CLARIFICATION_ESTABLISHED — SCENARIO_LEVEL_CLARIFICATION_SCORER_CORRECTED — SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622`, unchanged. Not committed, not pushed. No stash operation. Blueprint §40.
§37–§39 are not rewritten. `D-55` and `D-56` are preserved.

---

## 1 — What was closed

Two defects, both established by §39 and both closed here in the order the entry contract fixed.

| | defect | closed by |
|---|---|---|
| **measurement** | `rederive-l32g-resolution.ts:94` dropped zero-candidate rows *before* clarification scoring, so a provider was never charged for a question it failed to raise by emitting nothing (`D-56`) | a **second, separately-named** scenario-level metric over the unfiltered rows. The candidate-conditioned metric is **kept**, unchanged, because §37/§38 recorded their numbers under it |
| **representation** | a clarification could only ride on a `HazardCandidate`, so a correct `INSUFFICIENT_EVIDENCE` with zero candidates had nowhere to carry the question it owed (§39.5.1) | `ReasoningProposal.unresolvedDecisions` — a typed, deterministically validated, candidate-independent carrier |

**Scorer first, contract second, and the order is the point.** The corrected baseline was established
from frozen artifacts with **zero new inference** before the contract changed, so the contract change
is attributable.

---

## 2 — Scorer correction, and it moved nothing it should not have

`D-56`'s expectation reproduced **exactly**:

| qwen, `R1_MISSING_FIRST`, `V_S_STRUCT` | value |
|---|---|
| candidate-conditioned recall (the §37/§38 figure) | **3/4 = 75%** |
| scenario-level recall (corrected truth) | **3/5 = 60%** |
| zero-candidate clarification miss | `B10` |

**Every previously recorded metric is byte-identical after the correction** — 0 changed keys in
`orderings` for either provider. High-consequence and false-ACTIVE scoring were not touched and remain
candidate-conditioned exactly as recorded. Terminal A's two pre-registered axes are computed by
`score-l32g-fact-coherence.ts` and `score-l32g-order-sensitivity.ts`, **neither of which this phase
modified**, so the correction cannot and does not touch it.

Full-cohort scenario-level recall on the frozen artifacts, shipped `R0` resolver:

| | qwen | gemini |
|---|---|---|
| candidate-conditioned | 0/4, 0/4, 0/4 | 3/3, 5/5, 4/4 |
| **scenario-level** | **0/5, 0/5, 0/5** | **3/5, 5/5, 4/5** |

which reproduces §39.5.2's independent recount exactly.

---

## 3 — The contract change

`ReasoningProposal.unresolvedDecisions?: ClarificationDecision[]` — **additive, optional, and the
proposal contract version is deliberately NOT bumped**, so every frozen L3-2…L3-2h artifact stays
readable and every pre-L3-2i proposal validates unchanged.

It reuses the existing `ClarificationDecision` type. No new ontology, no workflow system, no
free-form field. Four fields: the missing fact, the decision it changes, ≥2 branches, the question.

### The validator boundary

| rule | behaviour |
|---|---|
| **shape** | the L3-INV-06 four-field requirement → `UNRESOLVED_DECISION_MALFORMED` |
| **decision-criticality** | legitimate only where a decision was actually left open → `UNRESOLVED_DECISION_NOT_DECISION_CRITICAL` |
| **governance sweep** | the structural forbidden-field sweep reaches **inside** the carrier |
| **refusal is a DROP, never fatal** | §34.2's rule: *it never touches the hazard* |

**Decision-criticality is §34.2's rule, lifted rather than re-invented:** `INSUFFICIENT_EVIDENCE` and
`UNKNOWN` say the decision was not made; the other six **are** the decision. `L3_UNDECIDED_STATES` now
has **one** definition, consumed by both the validator (proposal level) and the semantic binder
(candidate level), so the two cannot drift — §32.5's closed-list lesson applied.

### A gap the proof found, and it was in this phase's own gate

The first version gated on `proposal.outcome` alone. `C-CS-05` returns outcome
`INSUFFICIENT_EVIDENCE` with one candidate at **`HYPOTHETICAL`** — the outcome says undecided, every
candidate says decided — and an outcome-only gate let an unnecessary question through on a scenario
whose entire purpose is MUST-NOT-ASK. The gate now also requires that no candidate stands decided
alone. Six fixtures pin it, one per decided state.

### A second correction, to this phase's own first answer

Making the refusal **fatal** was wrong and was measured wrong: `C-CS-05`'s correct `HYPOTHETICAL`
candidate was being discarded along with its superfluous question. §34.2 is explicit that a
superfluous question is *dropped* while the hazard is returned untouched. Both L3-2i reason codes are
therefore **non-blocking**: recorded in `issues`, excluded from the verdict, dropped from the result.
**No pre-existing reason had its fatality changed**, and the suite asserts exactly that.

### One thing deliberately NOT unified

The **candidate**-level clarification predicate is left at its historical form. Failing it sets
`ok = false`, which drops the whole **candidate** — a REJECT path that deletes a hazard, where
§35.1's asymmetry says the test must stay unambiguous. The proposal-level carrier can afford a
stricter test because refusing it costs only a question. The asymmetry is asserted, not assumed.

---

## 4 — Targeted proof (qwen3-coder:30b)

Cohort: the entry contract's mandatory pair plus three controls, **all** from the already-opened
locked diagnostic set, each asserted byte-identical to the locked harness's text at run start.
Four variants, **four separate processes** (§38.3), distinct pids recorded in every artifact.

| scenario | owed? | BASELINE (no carrier) | CARRIER | MOVE1 | REPEAT |
|---|---|---|---|---|---|
| `F-CL-01` | yes | carried on a candidate | **carried** | **carried, 0 candidates** | **carried** |
| `B10` | yes | carried on a candidate | **carried, 0 candidates** | **carried, 0 candidates** | **carried, 0 candidates** |
| `C-CS-05` | no | none | emitted → **refused** | emitted → **refused** | emitted → **refused** |
| `F-PS-04` | no | none | none | none | none |
| `H-FLD-141` | no | `ANALYZED`, 2 × ACTIVE | identical | identical | identical |

**Four zero-candidate `INSUFFICIENT_EVIDENCE` rows carried the owed clarification and the validator
accepted every one without a hazard candidate.** Every row validates `VALID`.

### The scenario-level scorer, on rows the old filter would have deleted

Every proof row carries no `stateFacts`, so `derived` is `null` — **exactly the shape the pre-`D-56`
filter removed outright**:

| variant | candidate-conditioned | **scenario-level** | carried by the new carrier |
|---|---|---|---|
| BASELINE | **undefined — 0 of 5 rows survive the filter** | **0/2 = 0%** | — |
| CARRIER | undefined | **2/2 = 100%** | `F-CL-01`, `B10` |
| MOVE1 | undefined | **2/2 = 100%** | `F-CL-01`, `B10` |
| REPEAT | undefined | **2/2 = 100%** | `F-CL-01`, `B10` |

The old metric cannot see the difference at all. The corrected one measures it: **0% → 100%**.

---

## 5 — Acceptance gates

| # | gate | result |
|---|---|---|
| 1 | zero-candidate `INSUFFICIENT_EVIDENCE` carries the owed clarification | **PASS** — 4/4 such rows |
| 2 | valid proposal-level clarification survives normalization | **PASS** — 9 emitted, all reached the validator unrepaired |
| 3 | validator accepts it without a candidate | **PASS** — 6 accepted, 3 correctly refused (`C-CS-05`) |
| 4 | scenario-level scorer sees it | **PASS** — 0% → 100%, credited to the new carrier |
| 5 | absence is scored as a miss | **PASS** — BASELINE scores 0/2 |
| 6 | no false ACTIVE introduced | **PASS** — none in any variant, baseline or carrier |
| 7 | no high-consequence regression | **PASS** — `H-FLD-141` identical across all four variants |
| 8 | no candidate invented to carry a clarification | **PASS** — `B10` went 1 → 0 candidates |
| 9 | customer authority unchanged | **PASS** — see `PRESERVATION_AND_EGRESS.txt` |

---

## 6 — What was NOT done, and why

**The shipped `L3_SYSTEM_PROMPT` was not touched.** It is sha256 `b8cc50fc…` before and after, and
`L3_PROMPT_VERSION` stays `v6` because the prompt did not change. This is not an oversight:
`ablate-l32g-state-separation.ts` reads that exact string as its `V_B_LADDER` variant and derives
variant A from it, so editing it would silently change the **inputs** of the locked L3-2h instrument
while its own bytes stayed identical. The carrier declaration the model needs in order to emit the
field therefore lives in the L3-2i proof harness, and declaring it in the shipped prompt is the first
item of the next phase — **with the re-measurement that change requires**, which is precisely
Phase 9's condition for a broader run.

**Consequence, stated plainly:** the contract can carry the clarification and the validator accepts
it, but the *shipped* pipeline will not produce one until the shipped prompt declares the field.

**No Gemini half.** `GEMINI_API_KEY` is not present in this session — the L3-2h credential was
supplied for that run only and correctly never persisted. The qwen half establishes that a real
provider emits the field, that it survives the real transport and normalization boundary, and that the
validator and scorer handle it. What is missing is provider-independence of that behaviour, at n = 1.

**No full diagnostic re-run.** Justified in §7 below.

Also not done: no prompt tuning · no architecture redesign · no scenario or label edits · no sealed
corpus opened · no production provider selected · `R1_MISSING_FIRST` not promoted · no L3-3 · no
commit, no push, no deploy.

---

## 7 — Full diagnostic re-run: NOT TRIGGERED, with the reason

Phase 9 authorizes a broader run only if the targeted proof changes behaviour outside the cohort, or
modifies a shared contract path **whose safety cannot be established by deterministic tests**. Four
shared paths changed, and each one's safety *is* deterministically established:

| shared path | change | established by |
|---|---|---|
| `validationStateForIssues` | a non-blocking category, containing **only** the two new codes | assertion C6 |
| `bindProposal` | additive spread; absent stays absent | assertion E7 |
| `UNDECIDED_STATES` | now the single shared constant, **identical values** | assertions B7/B8 + 8 unchanged suites |
| candidate clarification predicate | **restored** to its historical form after review | assertion E1b |

Every pre-existing Level-3 suite reports the **same assertion count as §38.6's record** — L3-2 189,
L3-2b 105, L3-2c 86, L3-2d 71, L3-2e 82, L3-2f 77, L3-2g 57 — and the frozen artifacts re-score
identically. The shipped prompt is byte-unchanged, so the locked instrument's behaviour cannot have
moved. At the hazard level nothing outside `F-CL-01`/`B10` changed.

---

## 8 — Regression

| suite | result |
|---|---|
| L3 offline, 9 suites | **777 assertions, 0 failed** (was 715 over 8 suites at §38.6; +61 new, +1 rebound) |
| `test:hazlenz-core` | **28 pass / 2 fail** — the two documented §13.1 failures only, **not** reclassified |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg3f-56-14132-predicate` | 16/16 |
| `test:evidence-foundation` | 35 assertions |
| backend `tsc --noEmit` | exit 0 |
| frontend `tsc --noEmit` | exit 0 |
| `test:standards-backing-contract` | **NOT RUN** — a **MUT** suite; it correctly refused to claim the protected `safescope` database (`D-47`). It exercises no Level-3 code |

### One prior-phase assertion rebound, and recorded

`test-l31-reasoning-contract.ts` assertion **1.3** pinned the literal `'hazlenz.l3.validator.v1'`. Its
guarantee is that a validated result is **stamped with the identity of the validator that produced
it**, and L3-2i legitimately advanced that identity to `v2` when it added the carrier to the
validation surface. The assertion is now bound to the module's own exported constant plus a shape
check, so it fails if the stamp goes missing or disagrees and no longer fails merely because the
validator was permitted to change. This is §35.7 and §36.9's rebinding, third instance.
