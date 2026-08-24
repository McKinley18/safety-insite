# L3-2c — Gate-Polarity Correction + Bare-Conjunction Predicate Scope + Clarification Recall

> ## `L3_2C_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged and equal to
`origin/release/insite-rc-2026-08-18`. Nothing committed, pushed, merged, rebased or reset. No
production operation, migration, release mutation or deployment. No dependency changed.

## Why PARTIAL, in one paragraph

**All three authorized repairs work, and two of the three gates they were written to close are now
green.** `H-AM-05` passes through a general gate-polarity rule that consults no condition vocabulary;
`H-FLD-141` passes through the predicate test applied at bare conjunctions; clarification recall went
from 1 of 3 to **3 of 3**. On the fresh sealed holdout there are **zero high-consequence misses at
every tier**, zero negative-control false ACTIVE, zero fabricated quotations and 100%
reproducibility. The phase nonetheless closes PARTIAL on two counts, both traceable to the R3 prompt
change and both measured rather than inferred: the model now asks **4 unnecessary questions** where
L3-2b asked none, and on the retired L3-2b holdout — regression evidence only — it now returns
**no candidate at all** for `H-NG-02`, a high-consequence electrical hazard it previously found.
Recall was bought with precision, and the phase's own gate forbids that trade.

## The fresh sealed holdout

`backend/src/safescope-v2/reasoning-l3/eval/holdout-l32c.json`
sha256 **`33c69b36a7efd9ed4e2e79d2f1b1b29472e7bc6a85dd4feefc5bcef5608f56e2`**, 72 scenarios,
frozen at `2026-08-22T22:20:20Z` — **before the repair code was written**, not merely before it was
run — and byte-identical after execution. Provenance is two-part and the weak part is named:

| part | n | source | independence |
|---|---|---|---|
| A `INDEPENDENT` | 40 | `safescope-field-validation-dataset.v1.json`, stride `i % 5 === 2` | authored by an earlier phase, never run against Level-3. L3-2b used `i % 5 === 0`; the strides **cannot** intersect |
| B `AUTHORED_COMPLEMENT` | 32 | written by this phase | **the weak point.** A contains no negative control, no corrected or controlled state, no subjective wording and no clarification case |

Overlap against `holdout-l32.json`, `holdout-l32b.json` and `development-l32.json`, asserted at build
time and enforced by a throw: **0 id clashes, 0 text clashes.**

## The measurement, at the three tiers Phase 9 requires be kept apart

### Combined (72)

| | RAW PROVIDER | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 51 / 54 | 51 / 54 | **47 / 54** |
| High-consequence misses | **0** | **0** | **0** |
| False ACTIVE (18 non-active) | 0 | 0 | **0** |
| Negative-control false ACTIVE (8) | 0 | 0 | **0** |
| Condition-state accuracy | 95.8% | 95.8% | **90.3%** |
| Family accuracy | 49 / 54 | 49 / 54 | 45 / 54 |
| Multi-hazard within tolerance | 4 / 4 | 4 / 4 | **4 / 4** |
| Clarification recall | 3 / 3 | 3 / 3 | **3 / 3** |
| Clarification precision | 3 / 7 | 3 / 7 | **3 / 7** |
| Unnecessary clarifications | 4 | 4 | **4** |
| Fabricated quotations | — | — | **0 of 69** |
| Reproducibility | — | — | **72 / 72 (100%)** |

### Reported separately, because the authored half is weaker evidence

| | INDEPENDENT (40) SHIPPED | AUTHORED COMPLEMENT (32) SHIPPED |
|---|---|---|
| Hazard detection | 35 / 40 | 12 / 14 |
| High-consequence misses | **0** | **0** |
| False ACTIVE | 0 of 0 (the set contains none) | **0 of 18** |
| Negative-control false ACTIVE | n/a | **0 of 8** |
| Condition-state accuracy | 87.5% | 93.8% |
| Clarification recall | n/a | **3 / 3** |
| Unnecessary clarifications | 1 | 3 |

The independent half carries **no** negative control and **no** clarification case at all. Every
precision number in this phase therefore rests on scenarios the implementer wrote. That is stated
here rather than buried, and it is the same limitation L3-2b carried forward unclosed.

## Every shipped miss, with the stage that caused it

Seven scenarios expected a hazard and shipped none. **None is high-consequence.**

| id | provenance | stage | cause |
|---|---|---|---|
| `C-FLD-018` | INDEPENDENT | **binder** | `L3-2C-DISC-03` — "without **hazard** warning labels" read as negating the hazard |
| `C-FLD-038` | INDEPENDENT | **binder** | same |
| `C-FLD-118` | INDEPENDENT | **binder** | same |
| `C-FLD-128` | INDEPENDENT | **binder** | same |
| `C-FLD-073` | INDEPENDENT | **provider** | returned `REMOVED_FROM_SERVICE` where `ACTIVE` was expected |
| `C-AM-06` | AUTHORED | **provider** | returned `INSUFFICIENT_EVIDENCE` on a stated fact; R3 prompt pressure |
| `C-NG-05` | AUTHORED | **provider** | returned no candidate on a contrastive-after-negation sentence; R3 prompt pressure |

Stage tally: **binder 4, provider 3, validator 0, clarification gate 0, integration 0.** The
validator rejected nothing in 72 scenarios and the provider never failed, timed out or emitted
malformed output.

`L3-2C-DISC-03` is a defect of the same architectural class this phase exists to close — a closed
vocabulary matched without regard to the syntactic role of the match, here `hazard` as a **modifier**
inside "hazard warning labels" rather than as the head noun. It was found **after** the holdout was
opened and is therefore **deliberately not fixed**, exactly as L3-2b refused to fix `H-AM-05` after
opening its own holdout. That refusal is the only reason these numbers mean anything.

## The four unnecessary clarifications — the R3 cost

| id | question asked | why it changes no decision |
|---|---|---|
| `C-FLD-138` | "What type and quantity of solvents are being used?" | the hazard is already established ACTIVE; this refines risk |
| `C-CS-05` | "Is the level probe currently functioning or has it failed closed?" | the observation is explicitly hypothetical; the text answers nothing else |
| `C-AM-04` | "Was the ladder cage properly installed and maintained?" | ACTIVE already established from a hard fact |
| `C-AM-06` | "Was the tongue guard removed by maintenance or did it break off?" | the scenario's own label is *uncertainty that changes no decision* — and it additionally dragged the state to INSUFFICIENT_EVIDENCE |

L3-2b's `NEXT_ACTION.md` warned in writing: *"Re-measure precision alongside recall so this does not
swing into over-questioning."* It swung. The measurement caught it, which is what the warning was
for.

## Regression evidence — the retired L3-2b holdout under L3-2c code

> **`REGRESSION_EVIDENCE` ONLY.** `holdout-l32b.json` (`e3a3c7ee…`) was opened by L3-2b and is
> retired for gate use. Nothing below establishes L3-2c advancement.

| | L3-2b SHIPPED | **L3-2c SHIPPED** |
|---|---|---|
| Hazard detection | 59 / 62 | **60 / 62** |
| High-consequence misses | 1 (`H-AM-05`) | **1 (`H-NG-02`)** |
| False ACTIVE | 0 of 19 | **0 of 19** |
| Condition-state accuracy | 96.3% | **97.5%** |
| Clarification recall | 1 / 3 | **3 / 3** |
| Unnecessary clarifications | 0 | **1 (`H-FLD-196`)** |
| Candidates removed by the binder | 5 | **0** |

**`H-AM-05` and `H-FLD-141` are both repaired**, and the binder now removes nothing on this set — it
costs no findings at all. But `H-NG-02` is a **new high-consequence regression introduced by this
phase**:

> There was **no** standing water anywhere on the shop floor, **and** the flexible cord feeding the
> pedestal fan has its outer jacket worn through to the conductors.

L3-2b's model produced `electrical / ACTIVE` with a correct span. Under L3-2c it returns
`NO_HAZARD_ESTABLISHED` with **zero candidates**, so the miss arrives at the validator and binder
already empty — **provider stage, attributable to the R3 prompt change**, the only L3-2c change that
can alter model behaviour. Confirmed stable and deterministic across **three** repeat runs, and the
same shape appears on the fresh holdout as `C-NG-05`.

## Advancement gate

| Gate | Result |
|---|---|
| High-consequence misses = 0 (fresh sealed holdout) | **PASS** — 0 at RAW, POST-VALIDATOR and SHIPPED |
| Negative-control false ACTIVE = 0 | **PASS** — 0 of 8 |
| Fabricated quotations = 0 | **PASS** — 0 of 69 |
| Clarification recall ≥ 2 / 3 | **PASS** — 3 of 3 |
| No demonstrated unnecessary clarification | **FAIL** — 4 (`C-FLD-138`, `C-CS-05`, `C-AM-04`, `C-AM-06`) |
| Reproducibility = 100% | **PASS** — 72 of 72 |
| Customer-authoritative non-volatile differences = 0 | **PASS** — 0 over 66 |
| B08 regression | **PASS** |
| C11 regression | **PASS** |
| B10 regression | **PASS** |
| RC-08 negated-list behaviour | **PASS** — across commas and across bare `and` |
| `H-AM-05` repaired by general gate-polarity logic | **PASS** — by structure, with no vocabulary consulted |
| `H-FLD-141` repaired by predicate/scope logic | **PASS** |
| No new high-consequence regression introduced | **FAIL** — `H-NG-02`, provider stage, R3 prompt |

**Two gates fail. The thresholds were not lowered after the results were seen, the sealed holdout was
not modified, and no replacement holdout was built.**

## Customer authority

> ### `CUSTOMER_AUTHORITY_UNCHANGED`

Pristine `git archive` of `1feda622` versus the same archive plus every uncommitted L3-1/L3-2/L3-2b/
L3-2c file, through the real customer pipeline on a disposable database. Volatility **derived
empirically** from two same-code runs — the same 7 per-run id/timestamp paths every prior phase
derived. **0 scenarios with a non-volatile difference over 66.**

Structural corroboration: `diff -rq` between the two checkouts' `backend/src` reports exactly one
difference — the **added** `reasoning-l3` directory. No pre-existing source file was modified, no L3
file carries a Nest decorator or repository import, and nothing outside `reasoning-l3/` imports it.

## Verification actually executed

| Check | Result |
|---|---|
| `test:l32c-gate-polarity` (new) | **85 passed, 0 failed** |
| `test:l32b-binder-precision` | **105 passed, 0 failed** |
| `test:l32-semantic-contract` | **179 passed, 0 failed** |
| `test:l31-reasoning-contract` | **48 passed, 0 failed** |
| `npm run build` | exit 0 |
| `test:hazlenz-core` | **28 / 30** — the two documented failures only, no third |
| `test:kg4a-cutover-contract` · `kg4a-default-off` | 146/146 · 51/51 |
| `test:kg4b-shadow-contract` | 123/123 |
| `test:kg3f-56-14132-predicate` · `kg3f-retrieval-determinism` | 16/16 · 170/170 |
| `test:evidence-foundation` | 35 assertions |
| `test:standards-backing-contract` · `test:kg4b-default-off` | prerequisite-dependent; failures **byte-identical to pristine HEAD**, confirmed by executing both checkouts |
| Customer-authority invariance | **0 non-volatile differences over 66** |
| Reproducibility | **72 of 72 (100%)** |

No new failure is attributable to L3-2c in any offline or regression suite. The only regressions are
the two measured above, both in provider behaviour under the changed prompt.

## L3_COMPARE on the fresh holdout

> Comparison evidence only. The Level-1 result was and remains the customer result.

| Classification | n |
|---|---|
| **Level-3 correct, Level-1 incorrect** | **39** |
| Both correct | 26 |
| Both incorrect | 5 |
| Level-1 correct, Level-3 incorrect | 2 |

Level 3 attached a verified evidence span to **56** findings; Level 1 attached one to **0**. Level 1
raised 57 clarifications across 72 scenarios; Level 3 raised 7.
