# L3-2 — Semantic Observation Interpretation + Evidence Binding + Provider Selection + Dual Run

> ## `L3_2_PARTIAL — SEMANTIC_REASONING_NOT_VALIDATED_FOR_ADVANCEMENT`
>
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged. Nothing committed, pushed,
merged, rebased or reset. No production operation. No migration. No governed release touched.

## Why PARTIAL, in one paragraph

Real semantic inference now runs through the L3-1 contract and it works: **162 live analyses, 100%
schema adherence, 0 malformed outputs, 0 retries, 153 quotations of which 0 were non-verbatim, and 0
fabricated ACTIVE states on 31 negative rows.** On the frozen holdout the *model* met every quality
threshold — 32 of 32 hazards found, zero high-consequence misses. But the shipped pipeline scored
**30 of 32 with one high-consequence miss**, and the difference is not the model. It is the semantic
evidence binder this phase built: on `B08` and `C11` it rejected candidates that were correct.
`EVALUATION_AND_GATES.md` puts high-consequence misses at zero as a **hard gate**, so the honest
close is PARTIAL. Tuning the binder after seeing the holdout would have converted this into a pass
and destroyed the only thing that made the number meaningful.

## The measurement that matters

| | Hazard detection | High-consequence misses | False ACTIVE (31 negative rows) |
|---|---|---|---|
| Model + deterministic validator | **32 / 32** | **0** | 1 (`B10`) |
| **Shipped pipeline** (+ semantic binder) | **30 / 32** | **1** (`B08`) | 1 (`B10`) |
| Level-1 baseline (2026-08-22) | 25 / 32 | — | 6 of 12 negative controls |

The semantic binder is doing real work — it stopped four unsupported condition-state claims and
three unaddressed negations from becoming conclusions. It is also **over-rejecting**, and both of
its false negatives came from one cause: its clause scope is too wide for comma-delimited field
notes, so a negation belonging to a neighbouring clause is treated as governing.

* **`B08`** — scaffold + PPE + refuelling forklift. The model found all three hazards correctly.
  All three cited the whole 28-word sentence, so `SEMANTIC_EVIDENCE_NOT_SELECTIVE` rejected all
  three and the finding collapsed to `INSUFFICIENT_EVIDENCE`. The check is defensible; making it
  candidate-fatal on a genuine multi-hazard observation is not.
* **`C11`** — `"welding on the mezz rail, no fire watch, cardboard and pallets stacked under where
  the sparks were landing…"`. `SEMANTIC_NEGATION_UNADDRESSED` fired because "no" appears in the same
  comma-delimited run as the cited span, though it governs only "fire watch".

**Deliberately not fixed in this phase.** Both fixes are specified in `NEXT_ACTION.md` and require a
**new holdout**, because this one has now been seen.

## The one genuine reasoning error

**`B10`** — `"The rail on the platform did not look right to me."` The model returned
`walking_working_surfaces / ACTIVE`. The frozen matrix calls this "genuinely ambiguous wording", and
the correct behaviour is a clarification. This is the RC-01 class in miniature: an impression became
an assertion. It is also the phase's clearest clarification finding — **0 clarifications were raised
across all 66 scenarios**, so while the "≤5 unnecessary clarifications" threshold passes trivially,
"0 decision-critical missed" **does not**: `B10` needed one.

## Hard gates

| Gate | Result |
|---|---|
| Zero fabricated citations | **PASS** — structural; no citation vocabulary exists in the schema |
| Zero fabricated evidence | **PASS** — 153 quotations, 0 non-verbatim |
| Zero default-ACTIVE from uncertainty | **PASS** — 0 fabricated ACTIVE; no schema default exists |
| No finding unsupported by observation evidence | **PASS** — every validated hazard carries a verified span |
| No unreviewed content represented as governed | **PASS** — structural |
| No materially unsafe corrective action | **N/A** — no corrective action emitted at L3-2 |
| No silent Level-1 fallback | **PASS** — no fallback member exists in the outcome union |
| **No high-consequence false negative** | **FAIL** — `B08` |

## Quality thresholds

| Dimension | Threshold | Measured | |
|---|---|---|---|
| Hazard detection | ≥ 30/32, zero high-consequence misses | 30/32, **1 miss** | **FAIL** |
| Negative-control false positives | ≤ 1 of 12 ACTIVE | **0 of 12** | PASS |
| Condition state | 0 fabricated ACTIVE, ≥ 90% accuracy | 0, **95.2%** | PASS |
| Decomposition | 0 phantom findings | 0 | PASS |
| Regulatory | 0 citations outside the candidate set | 0 — none emitted | PASS |
| Unnecessary clarification | ≤ 5 of 66, 0 decision-critical missed | 0 of 66, **1 missed (`B10`)** | **PARTIAL** |
| Corrective-action grounding | 0 naming an absent hazard | 0 — none emitted | PASS |

## Customer authority

> ### `CUSTOMER_AUTHORITY_UNCHANGED`

Proven three ways, the third empirically:

1. **Reachability** — no pre-existing file imports `reasoning-l3`; it is in no Nest module; the suite
   asserts no L3 file carries `@Injectable`/`@Module`/`@Controller` or any repository import.
2. **Zero modification** — `git diff` over `intelligence-orchestrator.service.ts` and
   `safescope-v2.service.ts` is empty. The seam and its single call site were not touched.
3. **Measured invariance** — the 66-scenario matrix run through the real customer pipeline from a
   pristine `git archive` of HEAD versus the same archive plus every uncommitted L3-1 and L3-2 file.
   Volatility was **derived empirically** from two same-code runs (7 paths, all per-run ids and
   timestamps — identical to the set L3-1 derived). Result: **0 scenarios with a non-volatile
   difference.**

The dual run is off the request path entirely: the harness boots no Nest module and touches no
database. Provider failure, timeout, refusal, malformed output, validator rejection and Level-3
disagreement are each covered by the failure-injection suite, and none can reach the customer path
because there is no edge from L3 to it.

## Verification

| Check | Result |
|---|---|
| `test:l32-semantic-contract` (new) | **175 passed, 0 failed** |
| `test:l31-reasoning-contract` | 48 passed, 0 failed |
| `npm run build` (tsc) | exit 0 |
| Strict typecheck of every new module | clean |
| `test:kg4a-cutover-contract` | 146/146 |
| `test:kg4a-default-off` | 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg3f-56-14132-predicate` | 16/16 |
| `test:kg3f-retrieval-determinism` | 170/170 |
| `test:evidence-foundation` | 35 assertions |
| `test:hazlenz-core` | **28/30 — the two documented failures only, no third** |
| `test:standards-backing-contract` | fails on a seed prerequisite — **byte-identical failure from the pristine HEAD checkout** |
| `test:kg4b-default-off` | needs a server on :4340 — **identical `ECONNREFUSED` from pristine HEAD** |
| Customer-authority invariance | **0 non-volatile differences over 66 scenarios** |

No new failure is attributable to L3-2.

## Level-1 vs Level-3 (`L3_COMPARE`)

Adjudicated against the frozen expectations, not against Level 1.

| Classification | n |
|---|---|
| Both correct | 36 |
| **Level-3 correct, Level-1 incorrect** | **25** |
| Level-1 correct, Level-3 incorrect | 2 (`B08`, `B10`) |
| Both incorrect | 0 |
| Genuinely ambiguous | 3 |

Level 1 emits questions on 50 of 66 and attaches an evidence span to **none** of its hazards; Level 3
emits questions on 0 and attaches a verified span to **every** one. Level 1's top-level
`conditionState` reads `UNKNOWN` on 29 scenarios where it simultaneously asserts an ACTIVE hazard —
the near-constant-field defect `ORACLE_CORRECTION.md` already recorded, re-observed here.

## Operational, measured over 162 analyses

median **4.3 s** · p90 5.7 s · p95 9.0 s · max 13.6 s · input 936 tokens mean · output 257 tokens
mean · retry rate 0% · malformed 0% · timeout 0% · marginal cost **$0** (local inference).

Proposed as *future* budgets, not made authoritative here: p95 ≤ 12 s, ≤ 1 200 input and ≤ 900 output
tokens per analysis.

**Reproducibility is good but not perfect.** Two seeded runs at temperature 0 agreed on **65 of 66**
scenarios; `C11` differed. An acceptance run on this stack is therefore reproducible to ~98.5%, not
100% — recorded because a future gate must not assume exactness.

## Files added (all uncommitted)

`backend/src/safescope-v2/reasoning-l3/` — `reasoning-prompt.ts`, `ollama-reasoning-provider.ts`,
`semantic-evidence-binding.ts`, `reasoning-input-builder.ts`, `reasoning-runner.ts`,
`eval/holdout-l32.json`, `eval/development-l32.json`

`backend/scripts/` — `test-l32-semantic-contract.ts`, `run-l32-reasoning.ts`,
`score-l32-reasoning.ts`, `build-l32-holdout.ts`, `compare-l32-customer-invariance.ts`,
`compare-l32-level1-level3.ts`

`backend/package.json` — **one added line** registering the suite; dependencies byte-identical to HEAD.

No L3-1 file was modified. All seven L3-1 module hashes and all nine architecture-artifact hashes are
unchanged from the L3-1 baseline.
