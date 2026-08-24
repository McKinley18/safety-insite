# Level-3 implementation plan — six slices

`TARGET — NOT YET IMPLEMENTED.` No slice is authorized by this document. Each is its own phase.

Common to every slice: no production change, no migration, no governed-release operation, SHADOW and
CUTOVER remain off, and each ends at a blueprint checkpoint.

---

## L3-1 — Reasoning contract + provider abstraction + validator skeleton

| | |
|---|---|
| **Objective** | Land the types, the provider interface and the validator with **zero customer-path authority change** |
| **Principal files** | new `backend/src/safescope-v2/reasoning-l3/` — `reasoning-contract.ts` (input v1, output v1), `hazlenz-reasoning-provider.ts` (interface only), `deterministic-safety-validator.ts`, `evidence-span.ts` |
| **Authority before** | lexical engine, everything |
| **Authority after** | **unchanged** — nothing calls the new code on the customer path |
| **Tests** | pure contract suite: schema acceptance/rejection, span resolution, negation-scope rule (`L3-INV-11`), taxonomy closure, candidate-set closure (`L3-INV-01`). Fed by **hand-built fixtures**, including deliberate violations |
| **Evaluation cohort** | none — pure |
| **Acceptance gate** | validator rejects every constructed violation; `npm run build` exit 0; a reachability assertion proves no customer path imports the new modules |
| **Stop condition** | if the contract cannot express a matrix scenario's correct answer, stop and revise the contract before writing more code |
| **Rollback** | delete the directory; nothing references it |

## L3-2 — Semantic observation interpretation + evidence binding (dual-run only)

| | |
|---|---|
| **Objective** | First real inference, **off the customer path**. Produce interpretation + evidence spans and compare against the current engine |
| **Principal files** | `reasoning-l3/` provider implementation; a dual-run harness under `backend/scripts/` |
| **Authority before/after** | **unchanged** — customer still receives the current engine's result |
| **Tests** | span-resolution rate, negation-scope violations caught, schema adherence rate, latency/cost |
| **Evaluation cohort** | REGRESSION + DEVELOPMENT |
| **Acceptance gate** | ≥99% schema adherence after ≤1 retry; **zero** unresolvable evidence spans surviving validation; RC-08's W2 case rejected by `L3-INV-11` |
| **Stop condition** | schema adherence <95% after prompt/contract revision → the contract or the provider is wrong; stop and reassess (do not add regexes) |
| **Rollback** | feature flag default-off; no customer surface touched |

## L3-3 — Hazard decomposition + condition-state authority transition

| | |
|---|---|
| **Objective** | **The first authority transition.** Semantic reasoning becomes authoritative for what the hazards are and what state they are in |
| **Principal files** | the seam — `intelligence-orchestrator.service.ts::evaluate()` call site at `safescope-v2.service.ts:1576`; `multiHazardEngine` demoted to regression control; `inferConditionState` demoted |
| **Authority before** | `multiHazardEngine.decompose()` + `inferConditionState()` regex cascade |
| **Authority after** | **SEMANTIC** for decomposition, condition state and hazard identity — after validation |
| **Closes** | **RC-01, RC-04, RC-07** |
| **Tests** | full 66-case matrix + negative controls; condition-state legality; duplicate control |
| **Evaluation cohort** | REGRESSION + DEVELOPMENT, then **one sealed-holdout run** |
| **Acceptance gate** | **zero** default-ACTIVE from uncertainty; negative-control false-positive rate ≤1 of 12; no high-consequence false-negative pattern; historical-vs-novel gap ≤10 points |
| **Stop condition** | if a fix for one cohort regresses another twice, stop — the contract, not the prompt, is wrong |
| **Rollback** | flag flip back to the lexical path; the old modules still exist and still pass their suites |

## L3-4 — Regulatory applicability + RC-02 + RC-03

| | |
|---|---|
| **Objective** | Semantic applicability **over deterministically retrieved candidates only**, and fix the two deterministic defects that would otherwise corrupt the candidate set |
| **Principal files** | Path B `evidence-foundation.ts` integration; `mine-context.service.ts` (**RC-02**); `msha-inspection-intelligence.service.ts:201` (**RC-03**) |
| **Authority before** | in-code predicate citation selection; two unguarded paths |
| **Authority after** | retrieval **deterministic**, applicability **semantic over candidates**, citation identity + governed content **deterministic** |
| **Closes** | **RC-02, RC-03**, and RC-09's cross-regime mixing via the HYBRID rule |
| **Tests** | `test:kg3f-56-14132-predicate` (must stay 16/16), citation-granularity 48/48, retrieval determinism 170/170, the DX1–DX5 mine-routing diagnostics, HYBRID jurisdiction cases |
| **Acceptance gate** | **zero** citations outside the retrieved candidate set; zero wrong-Part routings on DX1–DX5; zero cross-regime citation sets when a regime is established; `56.14132(a)` never emitted on backup-alarm evidence alone |
| **Stop condition** | RC-03 must **not** be closed by editing `evidence-foundation.ts` — that file is correct and its suite passes |
| **Rollback** | applicability reverts to predicates; RC-02/RC-03 fixes are independent and stand on their own |

## L3-5 — Clarification, risk, corrective action

| | |
|---|---|
| **Objective** | Retire template *authority* for the three remaining judgement surfaces |
| **Principal files** | `actionEngine` (rendering only), clarification registry (wording only), `evaluateRisk` (scoring retained, factors semantic) |
| **Authority before** | templates decide which action, which question, which risk |
| **Authority after** | semantic intent/factors/decision-boundary → deterministic grounding + scoring → template rendering |
| **Closes** | **RC-05, RC-06**, and RC-10 |
| **Tests** | corrective-action grounding (no action may name absent equipment/hazard); clarification dependency; risk-direction cases (hypothetical ≠ active; corrected ≠ exposure; serious family ≠ automatic critical) |
| **Acceptance gate** | **zero** actions naming a hazard/equipment absent from the observation; unnecessary forced clarifications ≤5 of 66; zero decision-critical questions missed |
| **Stop condition** | if grounding validation cannot be expressed without re-parsing the observation, the validator is becoming a second semantic engine — stop and move the check into the contract |
| **Rollback** | per-surface flags; each of the three can revert independently |

## L3-6 — Full customer-path integration + sealed acceptance

| | |
|---|---|
| **Objective** | Retire presentation-layer compensation, retire the degraded-template fallback, run sealed acceptance |
| **Principal files** | `ensureVisiblePrimaryCitationContract`, `enforceVerifiedControlDisplay`, `buildDegradedHazLenzIntelligence` — all retired from customer authority; the truthful `ANALYSIS_UNAVAILABLE` surface added |
| **Authority after** | the full Level-3 map in `LEVEL3_ARCHITECTURE.md` §2 |
| **Tests** | full matrix, sealed holdout, six end-to-end workflows through the real API, generated PDFs, `test:hazlenz-core` |
| **Acceptance gate** | all hard safety gates; all quality thresholds; **sealed holdout within 10 points of development**; six workflows complete; reports truthful; no new `test:hazlenz-core` failure beyond the two documented |
| **Stop condition** | any hard safety gate failure stops the slice — no threshold is lowered to pass |
| **Rollback** | master flag returns the whole customer path to the lexical engine, which remains intact and tested throughout |

---

## Dual-run / migration design

Separate from KG SHADOW, and **deliberately not using its vocabulary** — the contracts differ (KG SHADOW
compares governed vs legacy *content resolution*; this compares two *reasoning engines*). Proposed
term: **`L3_COMPARE`**.

* **What is compared:** hazard families, hazard count, condition states, evidence-span resolvability, jurisdiction, selected citations, clarification decisions, risk band, corrective-action grounding.
* **What is logged:** the telemetry record in §Observability. Structured, no chain-of-thought.
* **What cannot reach customers:** everything from the candidate engine, in L3-1 through L3-2. From L3-3 the transition is per-surface and flagged, never a silent swap.
* **Disagreement adjudication:** against the frozen matrix expectations first, then by named human review. A disagreement is *not* evidence the new engine is wrong — §28's own oracle correction is the precedent.
* **When the old engine loses authority:** per surface, at the slice acceptance gate above — never globally in one step.

## Observability (no chain-of-thought)

Record: analysis/request id · provider + model + version · policy/prompt version · input-contract
version · output-schema version · candidate hazards (family + state only) · evidence-span offsets ·
retrieval candidate ids · validation outcome + reason codes · rejected candidates + reason · clarification
reason code · final finding mapping · latency · token usage · cost. **Never** store hidden reasoning
traces or raw prompts containing customer text beyond the retention window.

## Performance and cost budget

| Budget | Target |
|---|---|
| Model calls per ordinary observation | **1** (interpretation + decomposition + condition state + evidence + intent in one structured call); a 2nd only for applicability when a regime is established and candidates exist |
| Median latency | ≤ 6 s added |
| p95 latency | ≤ 12 s added |
| Retry ceiling | 1 per call |
| Cost per analysis | budget set at L3-2 from measured tokens; alert at 2× |
| Max context | the input contract, not the database — bounded by construction |
| Concurrency | production traffic is 1 analysis lifetime; design for tens/day, not thousands |

A long chain of sequential calls is **not** designed for: no evidence yet requires it, and each hop
multiplies latency, cost and failure surface.
