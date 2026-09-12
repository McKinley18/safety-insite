# §192 — Model semantic development results, verifier-v3.1

> **MODEL-ADJUDICATED DEVELOPMENT RESULT.** Every semantic axis was classified `MODEL_DIAGNOSTIC`
> in the preregistration **before spend**, and `HUMAN_REQUIRED` was recorded as **empty**. This is
> not a human adjudication and is not called one. **A human acceptance gate is not part of §192 and
> is not discharged by it.**

**Population: verifier-v3.1.** The §187B v3 cohort is never combined with these results.

39 / 39 behavioural executions · 0 provider errors · $0.87129 · thresholds read from the frozen
preregistration at scoring time.

---

## Mechanical hard gates — all PASS

| gate | observed | verdict |
|---|---|---|
| provider errors = 0 | 0 | **PASS** |
| **contract-invalid = 0** | **0** | **PASS** |
| wrong supplied factKey bindings = 0 | 0 | **PASS** |
| unauthorized settlement = 0 | 0 | **PASS** |
| `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` | NEVER | **PASS** |
| adjacent-state ledger mutation = 0 | 0 | **PASS** |

**Question A is answered.** The §187B illegal state — `BOUND_BY_CLARIFICATION` with no
`proposedClarification` under a non-additive verdict — **did not recur once in 39 executions**. It is
not that the token went unused: `BOUND_BY_CLARIFICATION` appears **21 times**, every one of them
paired with `ADD_OR_REPLACE_CLARIFICATION` and a real proposal, which is the legal pairing the
description repair was written to make unambiguous. The in-run admission and the independent
recompute agree on all 39, with zero disagreements.

## Semantic development gates — all PASS

| gate | scope | observed | threshold | verdict |
|---|---|---|---|---|
| G1 owed-fact preserved | 33 open-fact executions | **33/33** | ≥ 31/33 | PASS |
| G2 clarification target correct | 30 with a clarification | **30/30** | ≥ 90% | PASS |
| G3 clarification evidence sufficient | 30 with a clarification | **30/30** | ≥ 90% | PASS |
| G4 nearby-property substitution | all 39 | **0** | = 0 | PASS |
| G5 adjacent-fact contained | all 39 | **39/39** | ≥ 37/39 | PASS |
| G6 unnecessary clarification | 15 where none was owed | **0/15** | ≤ 1/15 | PASS |
| **G7 appropriate proposals on opportunities** | 18 opportunity executions | **15/18** | **≥ 15/18** | **PASS — at exactly the threshold** |
| G8 good-behaviour regression | 9 regression executions | **9/9** | ≥ 8/9 | PASS |
| G9 conjunctive sufficiency | 6 conjunctive executions | **6/6** | ≥ 5/6 | PASS |
| G10 challenge validity / reviewability | 6 challenge-bearing | **6/6 valid, 6/6 reviewable** | reported x/n | ESTIMABLE at n=6 |

**G7 has zero slack and that is the honest headline of this run.** One more missed proposal anywhere
would have failed it. All three misses sit on a single row, FV-11, and that row's authored truth is
questionable — see below.

---

## Question by question

**A — contract state discipline.** Eliminated, 0/39. See above.

**B — conjunctive sufficiency.** **6/6.** On FV-04 (A∧B, existing question reaching only A) all three
replicates identified that the question covers a conjunct the observation *already states was done*
and named the second as a separate stored-energy source: *"A locked-off drive does not de-tension a
gravity take-up."* On FV-05 (A∧B∧C, question reaching A and B) all three isolated the one open
conjunct: *"Isolation and flushing do not guarantee zero residual pressure."* Two replicates recited
the covered conjuncts explicitly in the proposed question. Detail in
`CONJUNCTIVE-SUFFICIENCY-RESULTS.md`.

**C — adjacent-property containment.** **0 substitutions in 39.** The HR-04-analogous trap (FV-07)
was not taken on any replicate: *"the work rest being 'in place' (position) is visible, but its
clearance value is not"*, and R3 asks for the gap *"measured now (not at the last wheel change)"*.
FV-10 refused an in-date examination whose stated scope was fan and ductwork; FV-08 held that a
record's **location** is not its **content**; FV-06 excluded a green status lamp inside the question
itself. Detail in `ADJACENT-PROPERTY-RESULTS.md`.

**D — good-behaviour regression.** **9/9, zero unnecessary proposals.** The over-correction risk
§191 could not measure did not materialise. The strongest single piece of evidence is FV-01, where
the *new* conjunctive rule fired and was used to **confirm** the existing question rather than
replace it: *"requires both the test to have occurred AND to have occurred in the correct window…
No weaker branch is offered — the question does not use 'or'."* Detail in
`GOOD-BEHAVIOR-REGRESSION.md`.

**E — clarification policy.** Now measurable and measured: 18 opportunity executions across **6**
owed-property families, 15 appropriate proposals, 3 missed, 0 unnecessary. `CLARIFICATION_POLICY` is
no longer `INCONCLUSIVE` for this cohort. Detail in `CLARIFICATION-POLICY-ANALYSIS.md`.

---

## The one deviation, and why I think the fixture is the likelier defect

**FV-11 — 3/3 `NO_CLARIFICATION_REQUIRED`, no proposal, on an unconditional opportunity row.**

Every replicate made the same argument: the written scheme examination certificate is in date, the
safety valve was function-tested *as part of that examination*, and whether a shorter re-test
interval applies *"is a matter of applicable regulatory/inspection scheme interpretation rather than
something the observation leaves ambiguous as a plant fact"*, with no governed evidence supplied
establishing one.

**That argument has force, and the row is the likelier problem.** I authored FV-11 with an **in-date
certificate covering the very examination in which the valve was tested**, and never stated the
scheme's interval. Whether the owed fact is genuinely open therefore depends on an interval the
observation withholds. Contrast FV-07 and FV-10, which the verifier handled correctly: there the
cited inspection's **stated scope excluded** the owed property. Here it **includes** it.

Three things follow, and I have kept them apart deliberately:

1. **The fact was preserved.** All three declared `STILL_UNRESOLVED`. The verifier declined to
   propose; it did not settle, cover or remove. G1 is unaffected, and this is not an HR-04-style
   substitution — `NO_NEARBY_PROPERTY_SUBSTITUTION` passes on all three because the evidence relied
   on sits inside its own stated scope.
2. **The frozen figure stands.** G7 is reported as preregistered, 15/18, with FV-11's three counted
   as misses. **The denominator was not moved and the row was not excluded to rescue the gate.** Had
   I excluded it the figure would read 15/15; that is stated as sensitivity only, and the reported
   result is the literal one.
3. **The recommendation is prospective.** Any future cohort should either state the scheme interval
   or drop the row, per the standing treatment for ambiguous authored truth: remove prospectively,
   preserve every historical score unchanged.

---

## Incidental finding — not a preregistered gate, not scored

FV-07 R1 and R3 cite a regulatory figure in the rationale and embed it in the proposed question
(*"OSHA general industry requires the work rest… not exceeding 1/8 inch"*). The v3/v3.1 instruction
says the verifier **may not "cite or quote a regulation"** and states the whole verdict is discarded
if it does — but the admission validator has no check for regulation citation in prose, so these
were admitted.

This is a gap between a stated prohibition and what is enforced. It is **not** one of the ten
preregistered axes, and no gate was invented after spend to capture it. Recorded for a future
authorization to decide: either the prohibition is narrowed to fields, or the validator gains a
check, or the instruction stops claiming a consequence it cannot deliver.

## What this result does not establish

Not acceptance. Not human adjudication. Not end-to-end pipeline behaviour — the first-pass sets were
authored, so nothing here says a real first pass would produce these questions. Not a population
rate: 13 rows × 3 replicates is a development cohort, and every row was 100% stable across
replicates, which is itself a small-sample observation rather than a demonstrated property. Not
customer or production readiness.
