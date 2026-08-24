# L3-2b — Semantic Binder Precision + Clarification Recovery + Fresh Sealed Holdout

> ## `L3_2B_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged. Nothing committed, pushed,
merged, rebased or reset. No production operation, migration, release mutation or deployment.

## Why PARTIAL, in one paragraph

Every defect L3-2 identified was root-caused and repaired, and the repairs hold on a **fresh sealed
holdout** the implementation had never seen: **0 false ACTIVE on 19 non-active scenarios** (the
binder caught the one the model got wrong), **0 fabricated quotations in 75**, **condition-state
accuracy 96.3%**, and **reproducibility 100%** — up from L3-2's 98.5%. But the shipped pipeline
still records **one high-consequence miss**, `H-AM-05`, and that is a hard gate at zero. The cause is
the same *shape* of defect as L3-2, in a new place: a closed vocabulary list. `FACTUAL_CONDITION_TOKENS`
does not contain "sheared", so "the lower hinge pin is sheared off" was not recognised as a fact, the
new subjective-impression gate treated the sentence as pure impression, and a correct ACTIVE finding
was deleted. **It was not fixed after the holdout was opened**, which is the only reason the number
means anything.

## The measurement, at the three tiers Phase 9 requires be kept apart

| | RAW PROVIDER | POST-VALIDATOR | **SHIPPED PIPELINE** |
|---|---|---|---|
| Hazard detection | 60 / 62 | 60 / 62 | **59 / 62** |
| High-consequence misses (33 HC scenarios) | 0 | 0 | **1 — `H-AM-05`** |
| False ACTIVE on 19 non-active | 1 — `H-AM-02` | 1 | **0** |
| Condition-state accuracy | 96.3% | 96.3% | **96.3%** |
| Family accuracy | 61 / 62 | 61 / 62 | 59 / 62 |
| Multi-hazard within tolerance | 2 / 2 | 2 / 2 | 2 / 2 |
| Clarification recall | 1 / 3 | 1 / 3 | **1 / 3 (33%)** |
| Clarification precision | 1 / 1 | 1 / 1 | **1 / 1 (100%)** |
| Unnecessary clarifications | 0 | 0 | **0** |

**The binder now earns its place.** In L3-2 it only ever subtracted: it caused both hazard misses and
prevented nothing measurable. Here it removed the model's single false ACTIVE (`H-AM-02`,
"one of the sling legs … **may be** cut" proposed as ACTIVE) and took the negative-control count to
zero. It also still costs one correct finding, which is why the phase does not close COMPLETE.

## Every shipped-vs-raw difference, all five

| id | what happened | verdict |
|---|---|---|
| `H-AM-02` | ACTIVE on a hedged fact removed by `SEMANTIC_SUBJECTIVE_IMPRESSION_NOT_ACTIVE` | **correct** — this is the B10 class, caught |
| `H-AM-05` | ACTIVE on impression + hard fact removed by the same gate | **wrong** — `sheared` absent from the factual vocabulary; the gate failure |
| `H-FLD-141` | machine-guarding candidate removed by `SEMANTIC_NEGATION_UNADDRESSED` | **wrong** — bare `and` does not end negation scope (see below) |
| `H-CS-02` | `CORRECTED` refused — "cut it out of service and issued a factory assembled lead" | **wrong but benign** — no ACTIVE asserted either way |
| `H-CS-04` | `CORRECTED` refused — "cracked and **was rebuilt**" | **wrong but benign** — `rebuilt` absent from the correction vocabulary |

## The three shipped misses

* **`H-AM-05`** — the gate failure, above. High-consequence.
* **`H-FLD-141`** — "…; no LOTO is applied **and** the guard is missing." The negation-scope engine
  ends scope at a comma whose following segment has its own predicate, but **the same test is not
  applied to a bare conjunction**, so `no` reached across `and` into "the guard is missing". The LOTO
  candidate survived, so the observation still produced an ACTIVE finding; the guarding candidate did
  not. Not high-consequence, and a strictly smaller version of the L3-2 defect.
* **`H-NG-03`** — provider defect, not binder: the model returned an outcome/candidate combination
  the deterministic validator refused (`OUTCOME_CANDIDATE_MISMATCH`). The only validator rejection in
  81 scenarios.

## Hard gates

| Gate | Result |
|---|---|
| 0 high-consequence misses | **FAIL** — 1 (`H-AM-05`) |
| 0 fabricated evidence accepted | **PASS** — 75 quotations, 0 non-verbatim |
| 0 explicit negative controls validated as ACTIVE | **PASS** — 0 of 19 |
| 0 unsafe outputs bypassing validation | **PASS** — 105 + 177 + 48 offline assertions |
| Whole-sentence supporting evidence not rejected for non-minimality | **PASS** — selectivity is advisory since L3-2b |
| Unrelated/contradictory text cannot improperly ground a candidate | **PASS** — contradiction, action-only and hazard-negation checks all fatal |
| Clause-level negation behaves correctly | **PARTIAL** — commas, semicolons, subordinators and contrastives correct; bare `and` not |
| Action language alone cannot establish a condition | **PASS** |
| Missing condition state never defaults to ACTIVE | **PASS** — structural, no schema default |
| UNKNOWN remains UNKNOWN | **PASS** |
| Corrected/controlled/removed remain non-ACTIVE | **PASS** |
| Decision-critical ambiguity produces clarification | **FAIL** — recall 1 of 3 |
| Clear scenarios not burdened by clarification | **PASS** — 0 unnecessary, precision 1/1 |
| Customer-authoritative behaviour unchanged | **PASS** — 0 non-volatile differences over 66 |

## What was repaired, and what the repair cost

| # | Repair | Evidence it worked |
|---|---|---|
| R1 | Negation **scope** replaces negation **proximity** (`negation-scope.ts`) | `SEMANTIC_NEGATION_UNADDRESSED` fired once in 81 scenarios, down from a rule that deleted three correct hazards in L3-2 |
| R2 | Issues are FATAL or ADVISORY; selectivity and family-relevance are advisory | whole-sentence evidence is no longer rejected; B08's class passes |
| R3 | Control-in-place vocabulary now includes isolation and verification language | `H-CS-01`, `H-EV-*` LOTO scenarios survive |
| R4 | Clarification policy in the prompt, plus a carrier-candidate rule | precision 1/1, 0 unnecessary — but recall only 1/3 |
| R5 | The volatile analysis id removed from the prompt | **reproducibility 100% (81/81)**, up from 98.5% |

Two defects were found *by* this work rather than inherited:

* **a regex alternation-order bug** in the first draft of `negation-scope.ts` — `no` matched the
  first two characters of `not`, `none`, `nor` and `neither`, the whole-word guard rejected it, and
  those negations were then never seen. That is negation blindness reintroduced by a regex detail,
  caught by a paired fixture before it reached any corpus run;
* **an over-aggressive family-relevance rule**, initially FATAL, which deleted 8 candidates in 30
  development scenarios including a high-consequence one. Demoted to advisory with the reasoning
  recorded: the taxonomy's term lists are a classifier vocabulary, not a relevance oracle, and a
  wrong family *label* on a real hazard is a quality defect while deleting the hazard is a safety one.

## Customer authority

> ### `CUSTOMER_AUTHORITY_UNCHANGED`

Pristine `git archive` of HEAD versus the same archive plus every uncommitted L3-1/L3-2/L3-2b file,
through the real customer pipeline. Volatility **derived empirically** from two same-code runs — the
same 7 per-run id/timestamp paths L3-1 and L3-2 derived. **0 scenarios with a non-volatile difference
over 66.** The seam is byte-unchanged, no L3 file carries a Nest decorator or repository import, and
the dual run boots no Nest module and touches no database.

## Verification

| Check | Result |
|---|---|
| `test:l32b-binder-precision` (new) | **105 passed, 0 failed** |
| `test:l32-semantic-contract` | 177 passed, 0 failed |
| `test:l31-reasoning-contract` | 48 passed, 0 failed |
| `npm run build` / strict typecheck | exit 0 / clean |
| `test:kg4a-cutover-contract` · `kg4a-default-off` | 146/146 · 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg3f-56-14132-predicate` · `kg3f-retrieval-determinism` | 16/16 · 170/170 |
| `test:evidence-foundation` | 35 assertions |
| `test:hazlenz-core` | **28/30 — the two documented failures only, no third** |
| `test:standards-backing-contract` · `test:kg4b-default-off` | prerequisite-dependent; **byte-identical failures from pristine HEAD** |
| Customer-authority invariance | **0 non-volatile differences over 66** |
| Reproducibility | **81 of 81 (100%)** |

No new failure is attributable to L3-2b.

## L3_COMPARE on the fresh holdout

| Classification | n |
|---|---|
| Both correct | 42 |
| **Level-3 correct, Level-1 incorrect** | **36** |
| Level-1 correct, Level-3 incorrect | 1 (`H-AM-05`) |
| Both incorrect | 2 |

Level 1 asked questions on 68 of 81 and attached an evidence span to **none** of its hazards; Level 3
asked on 1 and attached a verified span to **64**. Level 1's top-level `conditionState` read `UNKNOWN`
on 38 scenarios where it simultaneously asserted an ACTIVE hazard.

## Operational

81 analyses per run: median **4.0 s**, p90 4.5 s, p95 6.0 s, max 8.8 s; 1 380 input / 246 output
tokens mean; 0 retries, 0 malformed, 0 timeouts; marginal cost $0 (local inference).
Provider, model and pinned digest unchanged from L3-2. **Production provider selection remains OPEN.**

## Files

**Added:** `reasoning-l3/negation-scope.ts`, `reasoning-l3/eval/holdout-l32b.json`;
`scripts/test-l32b-binder-precision.ts`, `scripts/build-l32b-holdout.ts`,
`scripts/score-l32b-reasoning.ts`, `scripts/compare-l32b-reproducibility.ts`,
`scripts/trace-l32b-rootcause.ts`.

**Modified:** `reasoning-l3/semantic-evidence-binding.ts` (severity model, scope, vocabularies),
`reasoning-l3/reasoning-prompt.ts` (clarification policy, impression rule, analysis id removed),
`scripts/run-l32-reasoning.ts` (tier capture), `scripts/test-l32-semantic-contract.ts` (two fixtures
corrected, with the reason recorded), `eval/development-l32.json` (15 new scenarios),
`backend/package.json` (one script line).

**Unmodified:** every L3-1 file, all seven hashes preserved. Dependencies and `package-lock.json`
byte-identical to HEAD.
