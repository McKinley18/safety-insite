# L3-2d — Clarification Precision + ACTIVE-Rung Recovery + Fresh Sealed Revalidation

> ## `L3_2D_PARTIAL — SEMANTIC_REASONING_QUALITY_GATE_NOT_YET_PASSED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Baseline HEAD `1feda622dbb93d7e05d156838ab37db3e21db507`, unchanged and equal to
`origin/release/insite-rc-2026-08-18`. Nothing committed, pushed, merged, rebased or reset. No
production operation, migration, release mutation, deployment, SHADOW or CUTOVER. No dependency and
no `package-lock.json` change.

## Why PARTIAL, in one paragraph

**Both authorized repairs work, and on every previously-opened set they work completely.** On the
L3-2b holdout the pipeline now scores **62/62 hazards, zero high-consequence misses, zero false
ACTIVE, 100% condition-state accuracy and clarification precision AND recall both 100%** — `H-NG-02`
recovered through the general ladder with a bound evidence span and no loss at any stage. On the
L3-2c holdout the four unnecessary clarifications fell to one and detection rose 47→49. But the
**fresh sealed holdout, which the implementation had never seen, refuses the gate on four counts**:
two high-consequence misses, two unnecessary clarifications, one missed required clarification, and
one false ACTIVE. Separately and more consequentially, this phase **proved** that `DISC-03`/`DISC-04`
— carried forward as ordinary-quality debt since L3-2c — are **capable of high-consequence loss**,
and one of the two high-consequence misses is exactly that defect. L3-3 would not be eligible even if
D1 and D2 had passed.

## The fresh sealed holdout

`backend/src/safescope-v2/reasoning-l3/eval/holdout-l32d.json`
sha256 **`bd5f0c2d514784af0662e01f546aa9d7cd4986cd5c8dcea59980724181935af7`**, 77 scenarios, frozen
at `2026-08-22T23:22:07Z` — **before the repair code was written** — and byte-identical after
execution.

| part | n | source | independence |
|---|---|---|---|
| A `INDEPENDENT` | 40 | field dataset, stride `i % 5 === 4` | authored by an earlier phase, never run against Level-3. L3-2b used `i%5===0`, L3-2c `i%5===2`; the three strides are pairwise disjoint by construction |
| B `AUTHORED_COMPLEMENT` | 37 | written by this phase | **the weak point, and the third phase running to carry it** |

Overlap against `holdout-l32`, `holdout-l32b`, `holdout-l32c` and `development-l32`, enforced by a
throw at build time: **0 id clashes, 0 text clashes, 0 internal duplicates.**

> **Coverage limitation, recorded rather than discovered later.** The field dataset is periodic with
> period 5, so **every** stride-of-5 selection yields exactly two hazard families. `i % 5 === 4`
> yields electrical (20) and slip_trip_fall (20). No single-stride rule over this source can do
> better. Strides 1 and 3 — fall_protection and mobile_equipment — remain entirely unused.

Clarification labels were declared in the builder before execution and were **not** redefined
afterwards: 6 scenarios where a question is required, 71 where it must be withheld.

## The measurement, at three tiers

### Combined (77)

| | RAW | POST-VALIDATOR | **SHIPPED** |
|---|---|---|---|
| Hazard detection | 55/56 | 55/56 | **54/56** |
| High-consequence misses (51 HC) | 1 | 1 | **2** |
| False ACTIVE (21 non-active) | 1 | 1 | **1** |
| **Negative-control false ACTIVE (8)** | **0** | **0** | **0** |
| Condition-state accuracy | 97.4% | 97.4% | **96.1%** |
| Corrected/controlled-state accuracy | 4/4 | 4/4 | **4/4** |
| Family accuracy | 55/56 | 55/56 | 54/56 |
| Multi-hazard within tolerance | 4/4 | 4/4 | **4/4** |
| Fabricated quotations | — | — | **0 of 75** |
| Evidence-binding rejections | — | 0 | **0** |
| Reproducibility | — | — | **77/77 (100%)** |

### Reported separately, because the authored half is weaker evidence

| | INDEPENDENT (40) SHIPPED | AUTHORED COMPLEMENT (37) SHIPPED |
|---|---|---|
| Hazard detection | 39/40 | 15/16 |
| High-consequence misses | **1 — `D-FLD-175`** | **1 — `D-NG-04`** |
| False ACTIVE | 0 of 0 (the set contains none) | 1 of 21 |
| Negative-control false ACTIVE | n/a | **0 of 8** |
| Condition-state accuracy | 97.5% | 94.6% |
| Clarification | not testable — the set contains no case | TP 5 · FP 2 · FN 1 |

The independent half again carries **no** negative control and **no** clarification case. Every
precision number in L3-2b, L3-2c and L3-2d rests on scenarios the implementer wrote.

## Clarification confusion matrix — identical at all three tiers

| | TP | FP | FN | TN | precision | recall |
|---|---|---|---|---|---|---|
| RAW / POST-VALIDATOR / **SHIPPED** | 5 | **2** | **1** | 69 | **71.4%** | **83.3%** |

| scenario | expected | actual | verdict | state | evidence sufficient | trigger class |
|---|---|---|---|---|---|---|
| `D-CR-01` | yes | yes | **TP** | INSUFFICIENT_EVIDENCE | no | pure impression |
| `D-CR-02` | yes | yes | **TP** | INSUFFICIENT_EVIDENCE | no | hedge governs the only predication |
| `D-CR-03` | yes | yes | **TP** | INSUFFICIENT_EVIDENCE | no | unidentified substance |
| `D-CR-05` | yes | yes | **TP** | INSUFFICIENT_EVIDENCE | no | second-hand, unverified |
| `D-CR-06` | yes | yes | **TP** | INSUFFICIENT_EVIDENCE | no | state undecidable between two branches |
| `D-CR-04` | yes | **no** | **FN** | ACTIVE | no | *"Two men were on the roof near the edge; I was too far away to see whether they were tied off"* — asserted a fall hazard instead of asking |
| `D-NG-04` | no | **yes** | **FP** | INSUFFICIENT_EVIDENCE | yes | *"No flammable atmosphere was detected … and the fitter went inside the vessel with the agitator still on line and nobody at the opening"* — retreated and asked about LOTO |
| `D-NC-06` | no | **yes** | **FP** | INSUFFICIENT_EVIDENCE | yes | *"We are going to fit a second isolator … during the Christmas shutdown"* — a planned action, asked whether current isolation is sufficient |

`D-CR-04` and `D-NG-04` are the **two halves of the same swing**: the repair moved the ladder toward
ACTIVE, and one genuinely ambiguous case followed it while one plainly-stated case did not. That
oscillation is precisely what L3-2c's `NEXT_ACTION.md` warned would happen if recall and precision
were not measured together — and they were measured together, which is how it is visible.

The deterministic clarification-scope gate **dropped nothing** on this holdout: the provider never
attached a question to a decided state. It stands as the structural guarantee that D1a cannot recur,
and its unit proof is in `test:l32d-clarification-scope`.

## High-consequence analysis — 51 scenarios, 2 lost

| id | provenance | provider | post-validator | shipped | stage of loss | cause |
|---|---|---|---|---|---|---|
| `D-FLD-175` | INDEPENDENT | 1, ACTIVE | 1, ACTIVE | **0** | **binder** | `SEMANTIC_EVIDENCE_CONTRADICTS_STATE` — `DISC-04` |
| `D-NG-04` | AUTHORED | 1, INSUFFICIENT_EVIDENCE | 1 | 1, INSUFFICIENT_EVIDENCE | **provider** | the D2 class, not fully repaired on unseen text |

The other 49 high-consequence scenarios carried an ACTIVE candidate with bound evidence through
every stage. Stage tally across all shipped losses: **binder 1, provider 1, validator 0,
clarification gate 0, integration 0.** The validator rejected nothing in 77 scenarios; the provider
never failed, timed out, retried or emitted malformed output.

### `D-FLD-175` is the finding that outranks the rest of this phase

> Main plant electrical panel is blocked by a pile of **discarded** conveyor rollers and debris.

`CORRECTION_TOKENS` contains `discarded`. Here it is an **adjective on the debris**, not a report
that anything was corrected — but `checkContradiction` matches the word without regard to its
syntactic role and deletes a correct, evidence-bound, **high-consequence electrical** finding. That
is `DISC-04` exactly, and it is no longer a hypothetical severity.

## `H-NG-02` recovery — general, not lexical

Nothing in the repair names `H-NG-02`, any of its words, or any scenario id. The recovery is
measured three independent ways:

| evidence | result |
|---|---|
| Ablation, prompt varied alone | v3: **0 candidates** → v4: `electrical/ACTIVE` |
| L3-2d development set | `electrical/ACTIVE`, no question |
| L3-2b holdout, regression evidence | `VALIDATED`, `electrical/ACTIVE`, evidence bound, **no loss at any stage** |

`H-NG-03` and `C-NG-05` — the same class on different text — also recovered, and `C-NG-05` had
failed under **both** prior prompts, so its recovery is a gain L3-2b never had. On the fresh holdout
the class is measured on six new `negation_then_fact` scenarios: **five recovered, `D-NG-04` did
not.** The class is substantially but **not completely** repaired, and the sealed set is what shows
the difference.

## Regression evidence on the retired holdouts

> `REGRESSION_EVIDENCE` only. These sets were opened by earlier phases and cannot establish L3-2d
> advancement.

| | L3-2b set: L3-2b → **L3-2d** | L3-2c set: L3-2c → **L3-2d** |
|---|---|---|
| Hazard detection (SHIPPED) | 59/62 → **62/62** | 47/54 → **49/54** |
| High-consequence misses | 1 → **0** | 0 → **0** |
| False ACTIVE | 0 → **0** | 0 → **0** |
| Condition-state accuracy | 96.3% → **100%** | 90.3% → **93.1%** |
| Clarification recall | 1/3 → **3/3** | 3/3 → **3/3** |
| Unnecessary clarifications | 0 → **0** | 4 → **1** (`C-FLD-048`) |
| Clarification precision | 100% → **100%** | 42.9% → **75%** |

Both blockers are closed on the sets where they were recorded. Neither set is fresh evidence.

## Advancement gate

| Gate | Result |
|---|---|
| High-consequence misses = 0 | **FAIL** — 2 (`D-FLD-175` binder, `D-NG-04` provider) |
| Negative-control false ACTIVE = 0 | **PASS** — 0 of 8 |
| Fabricated quotations = 0 | **PASS** — 0 of 75 |
| Clarification recall 100% on the sealed required set | **FAIL** — 5 of 6 (`D-CR-04`) |
| Unnecessary clarifications = 0 | **FAIL** — 2 (`D-NG-04`, `D-NC-06`) |
| Clarification precision 100% | **FAIL** — 71.4% |
| Reproducibility = 100% | **PASS** — 77 of 77 |
| Customer-authoritative non-volatile differences = 0 | **PASS** — 0 over 66 |
| `H-NG-02` failure class repaired by general prompt/ladder logic | **PASS** — no lexical or id special-casing; 5 of 6 on new text |
| All L3-2c regression fixtures PASS | **PASS** — 22 of 22 on the development set |
| B08 · C11 · B10 · RC-08 · H-AM-05 · H-FLD-141 | **PASS** — all six |
| No new high-consequence regression | **PASS** — `D-FLD-175` is a pre-existing `DISC-04` defect newly exposed; `D-NG-04` is an incompletely repaired pre-existing class, not a new one |

**Four gates fail. Thresholds were not lowered after execution, clarification labels were not
redefined after seeing output, the sealed holdout was not modified, and no replacement holdout was
built.**

## `DISC-02` / `DISC-03` / `DISC-04` — the classification this phase was asked to make

Measured by `scripts/classify-l32d-disc-severity.ts` on minimal fixtures **and** corroborated by a
real loss on the sealed set.

| id | classification | evidence |
|---|---|---|
| `DISC-02` | **OPEN — precision risk only, unproven as a measured loss.** No deterministic check owns "ACTIVE contradicted by control-in-place evidence". It can only let a provider error stand; it can never delete a hazard. Across four sealed holdouts the provider has not made that error. | fixture reproduces; 0 measured losses |
| `DISC-03` | **CAPABLE OF HIGH-CONSEQUENCE LOSS** | `hazard` matched as a modifier inside "without hazard warning labels"; and "no damage … although the earth conductor has been cut back" deletes an **electrical** finding |
| `DISC-04` | **CAPABLE OF HIGH-CONSEQUENCE LOSS** | `discarded` as an adjective on debris deleted `D-FLD-175`, a high-consequence **electrical** hazard, **on the sealed holdout** — not a fixture, a measured loss |

### Do they violate a mandatory Level-3 invariant?

**No mandatory invariant is demonstrated violated.** `L3-INV-02` is not engaged — the deleted
findings were evidence-bound, deleted rather than fabricated. `L3-INV-04` is not engaged — these
defects **delete** ACTIVE, they never create it. `L3-INV-05` and `L3-INV-10` hold; the pipeline fails
closed. `L3-INV-11` is **arguably engaged** by `DISC-04`, which mis-reads a correction token *inside*
a negation, but the deletion is made by `checkContradiction` rather than by the negation-scope engine
that invariant governs; recorded as engaged-but-not-proven-violated.

They are a hazard-**recall** failure, and recall is governed by the advancement gate rather than by
an invariant. **That is sufficient on its own to make an additional precision slice mandatory before
L3-3**, because the gate requires zero high-consequence misses and `DISC-04` has now produced one.

## Customer authority

> ### `CUSTOMER_AUTHORITY_UNCHANGED`

Pristine `git archive` of `1feda622` versus the same archive plus every uncommitted L3-1/L3-2/L3-2b/
L3-2c/L3-2d file, through the real customer pipeline on a disposable database. Volatility **derived
empirically** from two same-code runs — the same 7 per-run id/timestamp paths every prior phase
derived. **0 scenarios with a non-volatile difference over 66.**

Structural corroboration: `diff -rq` over the two checkouts' `backend/src` reports exactly one
difference — the **added** `reasoning-l3` directory. Zero Nest or repository decorators inside it,
zero importers outside it, and the seam plus `backend/src/standards/` byte-unchanged. Level 3 holds
no persistence authority, no reporting authority and no governed-content authority.

## Verification actually executed

| Check | Result |
|---|---|
| `test:l32d-clarification-scope` (new) | **70 passed, 0 failed** |
| `test:l32c-gate-polarity` | **86 passed, 0 failed** |
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
| Reproducibility | **77 of 77 (100%)** |

### Four prior-phase prompt assertions were rebound, and one was deliberately reversed

Recorded rather than quietly edited:

* three assertions checked **literal prompt sentences** L3-2d rewrote. Their guarantees survive and
  are now asserted more strongly (both the permission and the new prohibition);
* **one L3-2c assertion is inverted.** L3-2c asserted the required output shape sat **inside** the
  ordered ladder — that placement was its repair. The ablation measured what it cost, so the
  assertion now requires the shape to sit **outside** the ladder. L3-2c's verdict is not rewritten;
  the reversal is recorded in the suite, in `ROOT_CAUSE.md`, and in blueprint §34.

No new failure in any offline or regression suite is attributable to L3-2d.

## `L3_COMPARE` on the fresh holdout

> Comparison evidence only. The Level-1 result was and remains the customer result.

| Classification | n |
|---|---|
| **Level-3 correct, Level-1 incorrect** | **45** |
| Both correct | 29 |
| Level-1 correct, Level-3 incorrect | 3 |
| Both incorrect | 0 |

Level 3 attached a verified evidence span to **64** findings; Level 1 to **0**. Level 1 raised 47
clarifications across 77 scenarios; Level 3 raised 7.
