# The authoritative 17-measure Expert HazLenz evaluation definition — recovered, not reconstructed

**Source of truth:** `backend/src/safescope-v2/expert-hazlenz/expert-evaluation-plan.ts`
**SHA-256:** `0b9b273a0c7bc24b226374fe544d5d32c5dba2dd03259b1bf7a3872a4d5b2bd8`
**Blueprint narrative:** §99.7 ("The first provider evaluation — pre-registered and NOT run")
**Recovered at HEAD:** `37a5d1b5`

Everything below is read out of the repository. Nothing here is supplied from the operation
authorization, from memory, or from inference. The file's own header states the reason it exists:
"the metrics, the gates and the corpus policy written down BEFORE any result exists, so a later
phase cannot choose a threshold after seeing a number."

---

## The four gate families, never one score

`EXPERT_EVALUATION_FAMILIES = ['SAFETY', 'REGULATORY_INTEGRITY', 'REASONING_QUALITY', 'RELIABILITY']`

`evaluateGateFamilies(observed)` returns four independent `FamilyVerdict`s. There is deliberately
**no `overall` field and no numeric summary**. The stated reason: "A weighted composite is exactly
how a life-critical omission gets averaged away by good explanation prose."

**A measure with no observed value is a FAILED gate, not a skipped one** — the function pushes the
id into `failedGateIds` when `observed[m.id]` is not a number.

---

## The seventeen measures, verbatim in substance

| id | family | disposition | dir | threshold | unit |
|---|---|---|---|---|---|
| `M01_ADDITIVE_HAZARD_RECALL` | SAFETY | MEASURED_AND_REPORTED | MIN | *(none)* | ratio |
| `M02_EXPERT_CANDIDATE_FALSE_POSITIVES` | SAFETY | **HARD_GATE** | MAX | `0.20` | ratio |
| `M03_CONTRADICTION_WITH_PROTECTED_AUTHORITY` | SAFETY | **HARD_GATE** | MAX | `0` | count |
| `M04_LIFE_CRITICAL_RETENTION` | SAFETY | **HARD_GATE** | MIN | `1.0` | ratio |
| `M05_FABRICATED_CITATIONS` | REGULATORY_INTEGRITY | **HARD_GATE** | MAX | `0` | count |
| `M06_UNSUPPORTED_REGULATORY_ASSERTIONS` | REGULATORY_INTEGRITY | **HARD_GATE** | MAX | `0.05` | ratio |
| `M07_GOVERNED_RECORD_GROUNDING` | REGULATORY_INTEGRITY | **HARD_GATE** | MIN | `0.95` | ratio |
| `M08_GOVERNED_PROVENANCE_INTEGRITY` | REGULATORY_INTEGRITY | **HARD_GATE** | MAX | `0` | count |
| `M09_CLARIFICATION_QUALITY` | REASONING_QUALITY | **HARD_GATE** | MIN | `0.70` | ratio |
| `M10_UNNECESSARY_QUESTION_RATE` | REASONING_QUALITY | **HARD_GATE** | MAX | `0.15` | ratio |
| `M11_CROSS_HAZARD_REASONING` | REASONING_QUALITY | MEASURED_AND_REPORTED | MIN | *(none)* | ratio |
| `M12_INTERNAL_INCOHERENCE` | REASONING_QUALITY | **HARD_GATE** | MAX | `0.10` | ratio |
| `M13_PROVIDER_CALLABILITY` | RELIABILITY | **HARD_GATE** | MIN | `0.98` | ratio |
| `M14_ORDER_SENSITIVITY` | RELIABILITY | **HARD_GATE** | MAX | `0.05` | ratio |
| `M15_LATENCY_P95` | RELIABILITY | MEASURED_AND_REPORTED | MAX | *(none)* | ms |
| `M16_COST_PER_ROW` | RELIABILITY | MEASURED_AND_REPORTED | MAX | *(none)* | usd |
| `M17_CROSS_PROCESS_REPRODUCIBILITY` | RELIABILITY | MEASURED_AND_REPORTED | MIN | *(none)* | ratio |

**Twelve HARD_GATEs, five MEASURED_AND_REPORTED.** Four zero-tolerance gates: `M03`, `M05`, `M08`
at `0`, and `M04` at `100 %`.

---

## Whether each measure's `method` is executable as written

This is the classification that decides whether a harness can measure the criteria **literally**,
which is what Phase 2 of the authorization requires. It is derived only from the frozen `method`
strings and from what exists in the repository — no criterion is proposed here.

### Executable from the frozen method, given any cohort (9)

| id | what makes it executable |
|---|---|
| `M03` | merge-invariant violations are emitted by `expert-authority-merge.ts` |
| `M05` | `CITATION_SHAPED_TEXT_NOT_PERMITTED` is emitted by `expert-normalization.ts:260` |
| `M08` | `EXPERT_CANNOT_REBIND_KNOWLEDGE_RELEASE_ID` is emitted by `expert-authority-merge.ts:284` |
| `M12` | "a candidate asserts ACTIVE while a clarification asks whether the hazard exists" is a structural test over the normalized output |
| `M13` | successful calls / attempted calls, by failure kind |
| `M14` | rows whose scored fields differ under a permuted input — mechanical, reuses the same rows |
| `M15` | p95 over successful calls, measured at the runner |
| `M16` | total spend / rows, with the token counts that produced it |
| `M17` | identical rows across two processes, same input, same prompt |

`M04` sits just outside this list: its authority source is named
(`src/safescope-v2/tests/hazlenz-actionable-coverage-scorer.ts`, the scored floor), so it is
executable **once a cohort's rows carry deterministic findings** — which is itself GAP 1 and GAP 5.

### NOT executable without a criterion that does not exist (7)

| id | the missing piece |
|---|---|
| `M01` | denominator "adjudicated missed hazards in the cohort" — a per-row ground-truth hazard set |
| `M02` | the rule deciding an Expert candidate "is not a hazard", plus the separate rule for negated/safe-state rows |
| `M06` | the rule deciding Expert prose "asserts a regulatory requirement not present in a supplied record" |
| `M07` | the definition of "all regulatory statements" — the denominator of a `0.95` floor |
| `M09` | the rule deciding a clarification is "genuinely decision-critical" |
| `M10` | denominator "rows owing no clarification" — a per-row clarification-obligation key |
| `M11` | denominator "rows with a recorded interaction" — a per-row interaction truth key |

**Five of these seven are HARD_GATEs** (`M02`, `M06`, `M07`, `M09`, `M10`).

The plan is candid that these are judged quantities. `M06`'s own rationale: "adjudicating paraphrase
is judgement, and a zero gate on a judged quantity invites the judgement to soften." `M09`'s
rationale cites the L3 Run-2 adjudication rather than defining a rule. Nothing in the repository
supplies the rubric, the adjudicator, or a precedence order.

---

## Preconditions, and their state at this HEAD

| id | requirement | state |
|---|---|---|
| `P1_TRANSPORT_PROBE` | provider callable, returns schema-valid structured output | **ESTABLISHED** — §118 completed hosted calls cleanly |
| `P2_DETERMINISM_CONTROL` | whether temperature/seed or equivalent is forwardable | **ABSENT** — unchanged; decides `M17`'s disposition, blocks nothing |
| `P3_MODEL_IDENTITY` | responding model matches the qualified one | **ENFORCEABLE** — `expert-runner.ts:115` refuses rather than scores |
| `P4_PRESPEND_AUTHORIZATION` | "an explicit owner authorization naming **the cohort, the call count and the ceiling**" | **UNMET** |

`P4.blocksIfUnmet` is all four families.

---

## Corpus policy

**CLOSED (burnt; re-scoring would measure memorization):** the Run-1 and Run-2 sealed L3 acceptance
holdouts, `GAUNTLET_OFFSET_1` (retired), `REALISM_OFFSET_0` (retired).

**RESERVED (each a different exam, opened once, never a retry of a failed run):** gauntlet offsets
2 and 3, realism offsets 1 and 2, the unopened 100-row `gauntlet.seed`.

**DEVELOPMENT (unlimited re-use, and never a source of a gate result):**
`src/safescope-v2/expert-hazlenz/fixtures/no-call-scenarios.ts`, and the `development-l32*.json`
cohorts in the Level-3 reasoning tier `eval/` directory.

> **Rule, verbatim:** "A fix is demonstrated on development cohorts. A reserved offset is opened
> once, for one pre-registered exam, and is spent whether the result is good or bad."

---

## The G9 lesson, which this operation must not repeat

L3 Run-2 pre-registered a hard 100 % cross-process reproducibility gate, then measured from 400
responses that `temperature` was not forwardable and `seed` had no equivalent. The gate was
unreachable by construction, and learning that **burned a single-use holdout to learn a fact about
the transport**. `M17` is therefore pre-registered as `MEASURED_AND_REPORTED`, and promoting it to a
hard gate is "a governance act with its own authorization."

§100.4 records the same lesson in its other direction: running the seventeen-measure evaluation
while a known prompt defect was live "would score `M09` and `M11` near zero and attribute our prompt
defect to the provider, **burning a reserved single-use cohort to measure our own bug**."

Both lessons point the same way here. A cohort spent against criteria authored after the model's
behaviour has already been observed across §104–§118 does not produce an unbiased measurement, which
is the stated purpose of this phase.
