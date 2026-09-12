# R6 PRODUCT-SEMANTICS ADJUDICATION — 2026-08-31

**Terminal: `EXPERT_HAZLENZ_R6_ORACLE_CONFIRMED — PRODUCT_ENFORCEMENT_STRATEGY_DECISION_REQUIRED`**

Zero hosted provider calls. Zero local provider calls. **$0.00 spent.** No production, prompt,
schema, normalization, fixture, scorer or boundary code changed. Nothing committed, pushed,
tagged or deployed.

```
HEAD        37a5d1b50abe836eb19dd24ee18ad10557bda131   (local only, unchanged)
origin/main de655d2f6e4c0ff7b0de17f9ccfbd3668138a936   (unmoved)
ahead 1 / behind 0

EXPERT_PROMPT_VERSION                  = hazlenz.expert.prompt.v6   (UNCHANGED, byte-identical)
EXPERT_ANALYSIS_CONTRACT_VERSION       = hazlenz.expert.analysis.v2 (UNCHANGED)
EXPERT_HAZLENZ_PROVIDER_VALIDATED      = FALSE
EXPERT_HAZLENZ_CUSTOMER_ACTIVE         = FALSE
17_MEASURE_EVALUATION_COHORT_AUTHORIZED= FALSE
LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN      = TRUE   (preserved, untouched, uninvestigated)
```

---

## Decision

**POSITION A — CURRENT ORACLE CONFIRMED.** R6 should remain clean. On the core question, the
removed guard is answer **B**: a *true physical condition that is not a current actionable
machine-guarding hazard while the verified controlled state persists*, with the restoration
obligation correctly classified as a **future prerequisite** attaching to a re-energization the
observation never states is occurring.

- `machine_guarding` candidate: **NOT VALID** — and emphatically not at `ACTIVE`.
- Reinstatement clarification: **NOT VALID** as a current decision-critical clarification.

The oracle was **not** invented for this test sequence. It is determined by existing product
semantics on four independent surfaces, three of which predate the Expert fixtures by eleven
days (`PHASE2`).

---

## The two findings that were not in the prior record

### 1. Prompt v5/v6 made R6 semantically **worse** on an axis the scorer cannot see

Extracting `assertedConditionState` from all nine frozen hosted R6 candidates:

| prompt | reps | asserted state |
|---|---|---|
| **v4** (§110) | 1,2,3 | **`UNKNOWN`** ×3 |
| **v5** (§112) | 1,2,3 | **`ACTIVE`** ×3 |
| **v6** (§114) | 1,2,3 | **`ACTIVE`** ×3 |

`expert-routing-metrics.ts` `verdictFor()` receives only `(expectation, count)`. A candidate at
`UNKNOWN`/LOW and one at `ACTIVE`/MODERATE score identically as `INCORRECT_POPULATED`. §114.2's
"no movement" table is therefore true at the cardinality level **and concealed an adverse
semantic regression**: under v4 the model raised a hedged, `UNKNOWN`-state advisory (rep 3:
*"a decision-relevant gap rather than a settled hazard"*); under v5/v6 it asserts a **present
exposure** on a machine at independently verified zero energy.

### 2. Expert is asked to adjudicate a question the deterministic layer already answered — while being denied the answer

Measured this phase against the exact R6 sentence: the production engine extracts
`energyIsolationState = isolated_and_verified` and `guardState = absent_or_ineffective`, which
drives `evidence-foundation.ts:220–231` to resolve **`29 CFR 1910.212(a)(1)` → `NOT_APPLICABLE`
at 0.96 confidence.**

R6's Expert input carries **only** `lockout_tagout`/`CONTROLLED`, and `governedStandards: []`.
Prompt instruction 1 says: *"Any hazard you think may be present that is **NOT already in the
deterministic findings above**. Include it even if you are unsure."* `machine_guarding` genuinely
is not there. All nine reps set `requiresUserConfirmation: true` and
`ADDITIONAL_TO_DETERMINISTIC`. **The model is substantially complying with instruction 1 on an
incomplete input.** Three prompt generations have tried to instruct around a missing input rather
than supply it.

`grep -rn "DeterministicFindingView" src/` returns only the type declaration and its use in
`ExpertAnalysisInput` — no production projection exists yet. This is an open design decision, not
a regression.

---

## Why Positions B and C were rejected

**B (oracle revised):** Sonnet asserts `ACTIVE` — a present-exposure claim — on a verified
zero-energy machine, with every named consequence hedged on a self-supplied condition
(*"once re-energized"*, *"if a worker were to approach"*, *"to anyone who could contact"*), and
one (v6 rep 3's *"gravity-fed components"*) contradicting a stated fact. Prompt v6's own hard
prohibition offers `UNKNOWN`/`INSUFFICIENT_EVIDENCE` for exactly this case. Adopting B would
require overturning a production predicate, a protected golden expectation named *"Not Guarding
alone"*, and the deliberate `R6`/`V7` contrast pair — none of which the hosted evidence touches.

**C (third classification required):** ruled out **on its premise**. The category is not missing.
`EXPERT_CONDITION_STATES` already carries `CONTROLLED`, `HYPOTHETICAL`, `INSUFFICIENT_EVIDENCE`,
`UNKNOWN`; the candidate type already carries `confidence` and `requiresUserConfirmation`. **The
Expert contract can already represent a controlled, non-current condition.** What cannot
represent it is the *scorer*.

The strongest form of the Sonnet case is built and taken seriously in `PHASE6-ADVERSARIAL-REVIEW.md`
— including the observation that a real safety professional walking past an open de-guarded press
would say *something*, and that the deterministic finding leaves **no** action item at all. That
case identifies a genuine defect. The defect is in the input projection and in the oracle's
*encoding*, not in the oracle's *semantics*.

---

## Counterfactual matrix (full detail in `PHASE5`)

| id | variant | existing fixture | classification |
|---|---|---|---|
| R6-A | exact frozen R6 | `R6` | contextual fact + future prerequisite; **no finding** |
| R6-B | merely stopped, not isolated | `V5` | current candidate (`lockout_tagout`) |
| R6-C | isolation incomplete | `V4`, `U-C` | current candidate |
| R6-D | stored energy remains | `V2` | current candidate |
| R6-E | zero-energy verification absent | `V1` | current candidate |
| R6-F | auto/unexpected restart capable | `V6` | current candidate (`machine_guarding`) |
| R6-G | servicing creates separate exposure | `V7`, `V8` | current candidate |
| **R6-H** | **re-energization stated as imminent** | **none** | **`BLOCKING` clarification; prerequisite now due** |
| **R6-I** | **returned to operation, guard absent** | **none** | **current candidate (`machine_guarding`/`ACTIVE`)** |

Six of nine already exist. **`R6-H` and `R6-I` are the only two without fixtures — and they are
exactly the two that separate a future prerequisite from a current hazard.** Every existing
counterfactual flips a fact about *energy control*; none flips a fact about the *restoration
transition*. The corpus can prove the model does not under-call an uncontrolled machine; it
cannot yet prove the model locates the restoration obligation correctly in time.

---

## Recommended next operation (not authorized here)

**Complete the deterministic→Expert input projection, then re-measure.** Not another prompt
iteration (three generations, two repair phases, nine local iterations, ~$0.72 hosted, and the
state claim got worse). Not boundary suppression yet — §114.8 is right to be wary, and it should
not be reached for while a lower-risk additive mechanism addressing a *demonstrated* root cause
is untried. Not acceptance yet, while the false `ACTIVE` claim stands.

Sequenced, all zero-cost until step 4:

1. Design + local diagnostic: should the Expert input carry negated / `NOT_APPLICABLE` /
   `CONTROLLED` determinations? Needs a contract decision —
   `DeterministicFindingView.conditionState` has no member meaning "evaluated and excluded".
2. Scorer **instrumentation** (do regardless): record `assertedConditionState`, `confidence`,
   `requiresUserConfirmation` beside the cardinality verdict. **Recording only** — changing what
   `verdictFor()` scores would alter a frozen protected metric and needs its own authorization.
3. Corpus extension: add `R6-H` and `R6-I`.
4. Only then a bounded hosted re-measurement (`R6`×3 + `R6-H` + `R6-I` + `V7`/`U-B` recall gates).

Falsifiable by construction: if the model still raises `machine_guarding`/`ACTIVE` after being
shown a `NOT_APPLICABLE` machine-guarding decision, the input hypothesis is wrong and boundary
enforcement or acceptance becomes next, on much better evidence.

---

## Protected state — re-verified this phase, all executed

All 14 suites re-run fresh; results identical to the §108–§114 baseline, zero deltas
(`protected-state/`, `EXIT_CODES.txt` all `0`):

| suite | result |
|---|---|
| `expert-contract-foundation` | 56 passed, 0 failed |
| `expert-routing-contract` | 58 passed, 0 failed |
| `expert-grounding-contract` | 40 passed, 0 failed |
| `expert-anthropic-adapter-repair` | 30 passed, 0 failed |
| `expert-authority-merge` | 51 passed, 0 failed |
| `expert-provider-failure` | 131 passed, 0 failed |
| `expert-nocall-harness` | 141 passed, 0 failed |
| `l32i-clarification-carrier` (quarantine) | 61 assertions passed, 0 failed |
| `l32j-carrier-activation` (quarantine) | 37 assertions passed, 0 failed |
| `hazlenz-core` / `precision` / `level1-recall` / `actionable-coverage` | exit 0; **0 dangerous, 0 life-critical omissions** |
| `tsc --noEmit` | exit 0 |

Matches §108–§114's `56/58/40/30/51/131/141`, `61/0`, `37/0` exactly.

**Confinement** (`CONFINEMENT.txt`): Expert-core diff is the identical pre-existing 4-file
§105–§113 diff, unchanged by this phase. Prompt v6, normalization, contract types, routing
metrics, all three fixture files and `evidence-foundation.ts` are byte-unchanged (SHA-256
recorded). Zero controller/service/module references, zero frontend references. This phase added
no importer and no script. Every file it created is under `verification/`.

---

## Evidence index

| file | contents |
|---|---|
| `evidence/R6-EXACT-OBSERVATION.md` | the verbatim observation, the full frozen input, and the stated / controlled / unresolved / inferred / hypothetical fact classification; independent verification that all nine hosted quotes bind exactly |
| `evidence/HOSTED-R6-V4-V5-V6-VERBATIM.md` | all nine hosted R6 responses in full, extracted programmatically from the frozen JSONL, plus the nine-rep candidate-field comparison table |
| `analysis/PHASE2-EXISTING-PRODUCT-SEMANTICS.md` | the four surfaces that already determine the answer; provenance proving the doctrine predates the fixture; the input-projection gap |
| `analysis/PHASE3-GOVERNED-STANDARD-ANALYSIS.md` | the repository's own 1910.147 / 1910.212 records, their quarantined status, the five required distinctions, and the one concept the corpus does **not** carry |
| `analysis/PHASE4-EXPOSURE-ANALYSIS.md` | energy / motion / guarding / servicing exposure, restoration classification, and the unresolved-fact decision table |
| `analysis/PHASE5-COUNTERFACTUAL-MATRIX.md` | R6-A…R6-I, mapped to existing fixtures, with the two-gap finding |
| `analysis/PHASE6-ADVERSARIAL-REVIEW.md` | strongest case for each side, neither straw-manned, and the adjudication between them |
| `analysis/PHASE7-8-DECISION-AND-CONSEQUENCES.md` | Position A selection, adopted semantics, the §110–§114 qualification, and the four options weighed |
| `protected-state/`, `CONFINEMENT.txt` | executed suite output and confinement proof |

## Remaining uncertainty, stated plainly

- The `UNKNOWN`→`ACTIVE` **mechanism** is a hypothesis, not a measurement. Confirming it needs
  hosted calls and is not authorized here. The *regression itself* is measured, from the frozen
  transcripts.
- Whether supplying the `NOT_APPLICABLE` machine-guarding determination actually changes hosted
  behaviour is **unproven**. It is the best-evidenced hypothesis available and it is falsifiable;
  it is not a prediction of success.
- The R6 fixture's *"everything is stated"* claim is very slightly overstated: *"locked out with
  **the supervisor tag** applied"* leaves personal-device ownership genuinely undetermined. This
  is a `lockout_tagout` question, raised by one of nine reps, and does nothing for a
  `machine_guarding` candidate. Recorded for a future phase; explicitly not grounds to revise the
  oracle.
- `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN` remains `TRUE`, untouched and uninvestigated.
