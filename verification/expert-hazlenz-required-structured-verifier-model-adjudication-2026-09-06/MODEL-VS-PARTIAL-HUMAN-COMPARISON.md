# §190 — Model judgements versus the partial product-owner answers

**65 slots compared · 46 agree · 19 disagree.**

The product owner answered 65 of the 112 slots, across nine executions in frozen sequence order,
before redirecting to a model review. Those raw selections are preserved unedited in
`verification/expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06/RAW-HUMAN-ANSWERS.json`.

> **They are not the frozen §189 human adjudication.** `HUMAN_ADJUDICATION_COMPLETENESS = 65 / 112`,
> so that gate remains `UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER`. Six executions were never
> reached at all: HR-01 R2, HR-09 R3, HR-08 R3, HR-01 R3, HR-04 R3, HR-06 R3.

Every product-owner answer recorded was `PASS` / `PRESERVED` / `A`.

---

## Where the two agree — 46 slots, six executions completely

| execution | compared | disagreements |
|---|---|---|
| HR-09 R1 | 7 | **0** |
| HR-01 R1 | 7 | **0** |
| HR-06 R1 | 7 | **0** |
| HR-06 R2 | 7 | **0** |
| HR-09 R2 | 7 | **0** |
| HR-08 R1 | 7 | 2 |
| HR-08 R2 | 7 | 3 |
| HR-04 R1 | 8 | **7** |
| HR-04 R2 | 8 | **7** |

Full agreement on every HR-09, HR-01 and HR-06 execution that was reached. The disagreements are not
scattered — **all 19 fall on HR-04 and HR-08**, and they are two arguments, not nineteen.

---

## Disagreement 1 — HR-04, 14 slots across two executions

| axis | product owner | model |
|---|---|---|
| `OWED_FACT_PRESERVED` | PASS | **FAIL** |
| `CLARIFICATION_TARGET_CORRECT` | PASS | **NOT_APPLICABLE** |
| `CLARIFICATION_EVIDENCE_SUFFICIENT` | PASS | **NOT_APPLICABLE** |
| `NO_NEARBY_PROPERTY_SUBSTITUTION` | PASS | **FAIL** |
| `ADJACENT_FACT_CONTAINED` | PASS | **FAIL** |
| `STRICT_SEMANTIC_VERDICT` | PRESERVED | **NOT_PRESERVED** |
| `HR04_CATEGORY` | A | **C** |

*(`FACTKEY_BINDING_CORRECT` agrees: PASS.)*

**I think the `PASS` answers on the two clarification axes are not supportable, and I'll say so
plainly.** On HR-04 the first pass asked nothing and neither replicate proposed anything. A `PASS`
on `CLARIFICATION_TARGET_CORRECT` asserts that a clarification targeting the exact owed fact was
relied on. No clarification existed at all. There is nothing whose aim or power could have been
assessed, which is what `NOT_APPLICABLE` is for.

**On category A I also disagree, and this is the substantive one.** Category A means *"correctly
established that the owed fact was already resolved"* — it requires the observation to establish
current fastener securement. The observation states the guard is in position, that the pre-start
sheet covers **belt tracking and lubrication**, that the fastenings were last torque-checked at the
annual service, and that no tools rest on the guard. None of those is current securement, and the
authorization's own principles say so directly: presence is not securement, an inspection having
occurred is not verification of a specific property, a historical check is not a current state.

Neither replicate actually claims A. R1 claims the record *"actively supports … current adequacy"*;
R2 claims doubt has not been *raised*. Both are arguments that the fact need not be **asked**, not
that it has been **answered** — which is the territory of B or C, and the mechanism in both cases is
adjacent evidence, which makes it C.

**Where the disagreement is narrowest.** R2's explicit *"I am not entitled to mark it answered"* is
real and creditable, and it is the strongest thing that can be said for a preserving reading. My
judgement is that it describes correct **bookkeeping** on a declination whose **grounds** are
substituted, so it does not reach B either. A reviewer could reasonably weigh that sentence more
heavily than I have.

---

## Disagreement 2 — HR-08, 5 slots across two executions

| axis | product owner | model | executions |
|---|---|---|---|
| `CLARIFICATION_EVIDENCE_SUFFICIENT` | PASS | **FAIL** | R1, R2 |
| `STRICT_SEMANTIC_VERDICT` | PRESERVED | **NOT_PRESERVED** | R1, R2 |
| `OWED_FACT_PRESERVED` | PASS | **FAIL** | R2 only |

This turns on one reading, and it is the most contestable finding in the cohort. The owed fact
requires **isolated AND proved dead**; the endorsed question asks whether the isolator has been
*"locked out (or otherwise verified de-energized)"*. The parenthetical is disjunctive, so a truthful
"yes" is available on lockout alone — a different act from proving dead, establishing one conjunct
of two.

Note that when this axis was put to you on HR-08 R1, the question text explicitly flagged the
conjunction (*"The owed fact requires isolated AND proved dead"*) and the answer was `PASS`. So this
is a genuine difference of reading rather than an oversight, and the counter-argument is real:
under OSHA 1910.147(d)(6) a properly performed lockout includes verification. I don't think that
survives the question's own grammar — offering "verified de-energized" as an *alternative* to
"locked out" implies lockout alone suffices for a "yes" — nor the observation's own separation of
the acts (*"locked off … applied a personal lock **and** proved that panel dead"*). But a reviewer
who takes the strict-LOTO reading would answer as you did.

The extra disagreement on R2's `OWED_FACT_PRESERVED` follows from the same finding rather than from
the refusal: R2 declared the fact `BOUND_BY_CLARIFICATION`, i.e. covered by that question, and
declaring a fact covered by a question that cannot answer it is a preservation failure on its own
terms. An admitted output making the same claim would fail identically.

---

## What this comparison is and is not

It is a record of two adjudicators disagreeing on two questions, with the reasoning attached to
each. It is **not** an assessment of the product owner's answers as an instrument, and it does not
convert 65 partial human selections into a semantic result.

Both readings of HR-08 are set out rather than one being suppressed, and the aggregate's sensitivity
to that single row is reported in `MODEL-STRICT-SEMANTIC-GATE.json` — computed after every
judgement was fixed, not before.
