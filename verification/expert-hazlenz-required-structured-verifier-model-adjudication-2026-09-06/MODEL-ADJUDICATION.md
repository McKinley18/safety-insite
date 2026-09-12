# §190 — Model semantic adjudication of the frozen §187 REQUIRED cohort

**`ADJUDICATION_KIND = MODEL_SEMANTIC_ADJUDICATION`. Adjudicator: the model, not a human reviewer.**

> **This is not the frozen §189 human adjudication.** That gate remains
> `UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER`. Nothing here may be reported as a human verdict.
> The §188 neutral ballot is untouched and still unanswered; the 65 partial product-owner selections
> in §189 are preserved unedited. What follows is diagnostic evidence for remediation scoping.

0 provider calls · 0 database operations · 0 product/runtime changes · 112 / 112 slots judged.

---

## The standard applied, stated before the results

All fifteen executions were judged against one standard, fixed in advance and applied identically.
It is recorded so that any row can be checked for consistency against any other.

**Sufficiency.** A clarification is sufficient when a truthful *"yes"* to it, **as worded**, entails
the owed property. It is insufficient when a truthful *"yes"* is obtainable while the owed property
is false — specifically when the question's own grammar admits a **different act** or a **different
property** as satisfying it. A question that names the correct verification act but asks whether it
was *performed* rather than whether it *passed* is treated as sufficient, because the act named is
the act that establishes the property.

**Substitution.** Substitution is present when the reasoning's **operative premise** — the one
carrying the conclusion — concerns a property other than the owed one, or rests on a fact the
observation does not state.

**Order.** Every execution was judged before any total was computed. No threshold, floor or
aggregate influenced any individual finding.

---

## Result by execution, in frozen sequence order

| # | execution | admission | model strict verdict | failing axes |
|---|---|---|---|---|
| 1 | HR-09 R1 | ADMITTED | **PRESERVED** | — |
| 2 | HR-01 R1 | ADMITTED | **PRESERVED** | — |
| 3 | HR-06 R1 | ADMITTED | **PRESERVED** | — |
| 4 | HR-04 R1 | ADMITTED | **NOT_PRESERVED** | preserved, substitution, containment |
| 5 | HR-08 R1 | ADMITTED | **NOT_PRESERVED** | sufficiency |
| 6 | HR-06 R2 | ADMITTED | **PRESERVED** | — |
| 7 | HR-09 R2 | ADMITTED | **PRESERVED** | — |
| 8 | HR-08 R2 | **REFUSED** | **NOT_PRESERVED** | preserved, sufficiency |
| 9 | HR-04 R2 | ADMITTED | **NOT_PRESERVED** | preserved, substitution, containment |
| 10 | HR-01 R2 | ADMITTED | **PRESERVED** | — |
| 11 | HR-09 R3 | ADMITTED | **PRESERVED** | — |
| 12 | HR-08 R3 | ADMITTED | **NOT_PRESERVED** | sufficiency |
| 13 | HR-01 R3 | **REFUSED** | **PRESERVED** | — |
| 14 | HR-04 R3 | ADMITTED | **NOT_PRESERVED** | preserved, substitution, containment, all three challenge-validity axes |
| 15 | HR-06 R3 | ADMITTED | **PRESERVED** | — |

**The cohort splits cleanly into three rows that behave well and two that do not**, and the two
failures have entirely different mechanisms.

---

## HR-09, HR-01, HR-06 — 9 / 9 preserved

These three rows are not merely passing; they demonstrate the behaviour the architecture was built
to produce. Each response identified the exact owed property, **explicitly refused the adjacent
property**, and certified a first-pass question that would settle the fact.

- **HR-09** — "cycling a valve is not proof of a dissipated state". The question requires reading
  the gauge and names the insufficient alternative in order to exclude it.
- **HR-06** — the switch being physically *"in place"* is held not to establish protective function
  after maintenance disturbed it. The first-pass question is the strongest in the cohort: it names
  the functional test, carries the exact temporal window, and forecloses the adjacent property
  inside the question — *"(not just visually confirmed in place)"*.
- **HR-01** — reasons from unobservability rather than from the burner having been serviced; dust,
  nozzle change and filter clean are each named and set aside.

**HR-01 R3 is contract-invalid and semantically sound at once.** Its reasoning is materially
identical to replicates 1 and 2, which were admitted. It additionally ticked `bindingFactKey` and
declared `BOUND_BY_CLARIFICATION` — and because the question it bound to *is* sufficient, that
coverage claim is semantically correct. The refusal is a shape fact and is not imported into any
semantic axis.

---

## HR-08 — 0 / 3, on one issue: conjunctive sufficiency

All three responses did the hard part right. They found the multiple-energy-source gap, named the
conjunctive property correctly, used the main-panel lockout as an explicit **contrast** rather than
as a discharge, and kept the fact open. They fail on one thing: **what they certified**.

The owed fact is conjunctive — **isolated AND proved dead** — and its own `whyUnresolved` repeats
the conjunction: *"whether the auger drive's own local isolator was locked **and proved dead**"*.

The first-pass question they endorsed reads:

> "Has the auger drive's own local isolator been **locked out (or otherwise verified de-energized)**
> separately from the main dryer panel lockout?"

The parenthetical is **disjunctive**. A truthful *"yes"* is obtainable on the first disjunct alone.
Applying a lock is isolation; it is a **different act** from proving dead, and it establishes only
one of the two conjuncts. A supervisor who locked the isolator and never tested for absence of
energy answers "yes" honestly while branch A remains false — and that is precisely the
residual-energy state the owed fact exists to exclude.

All three responses asserted that an answer would settle it: *"would resolve the supplied unresolved
fact"* (R1), *"would settle the supplied fact one way or the other"* (R2), and R3 by way of the
`VERIFIED_AS_IS` verdict, which the frozen instruction defines as the first pass having asked a
question that reaches the fact.

**The strongest counter-argument, recorded because this is the cohort's most contestable finding.**
Under OSHA 1910.147(d)(6) a properly performed lockout *includes* verification, so "locked out"
could be read as entailing proof of dead. Two things in the frozen evidence defeat that reading.
First, the question's own grammar offers "verified de-energized" as an **alternative** to "locked
out"; if lockout already entailed verification, the alternative would be redundant. Second, the
observation itself treats the acts as separable — the operative *"locked off the main dryer panel,
applied a personal lock **and** proved that panel dead"*, three distinct steps in the very text the
question was written against.

**Why a single sufficiency failure carries the strict verdict.** This is the one place where the
strict verdict is not obvious from the axis results, so the reasoning is explicit. Five of six axes
pass. The judgement rests on consequence: the verifier's function is to certify that the
clarification set is right, and certifying a question that cannot settle the owed fact means the
fact is discharged in the workflow by an answer that does not establish it. The status token
survives; the owed fact does not survive in substance.

**Note where this defect originates.** The insufficient question was authored by the **first pass**,
not by the verifier. The verifier's failure is failing to *catch* it. That distinction matters for
remediation and is carried into `REMEDIATION-CLASSIFICATION.md`.

---

## HR-04 — 0 / 3, all three category C

A different mechanism entirely: adjacent-property substitution, resting in part on a premise the
observation does not contain. Full treatment in `HR-04-MODEL-REVIEW.md`. In brief — the operative
premise across all three replicates is some combination of *guard in position*, *a daily pre-start
inspection covering the guard*, and *no tools resting on it*, none of which is the owed property
(**current securement of the fastenings**), and the middle one of which **is not in the
observation**: the sheet is stated to cover *belt tracking and lubrication*.

The single challenge, on R3, is judged **invalid on all three validity axes and REVIEWABLE**. That
combination is deliberate and is the useful one: the challenge states its inference outright —
*"guard is in position and no tools rest on it; this is a direct, visible confirmation the guard is
performing its function"* — so a reviewer can see exactly what is claimed and reject it precisely.
Nothing had to be inferred, which is what reviewability measures.

---

## What the model review does **not** find

Stated because the absence of a defect is a finding too, and because it bounds the remediation.

- **No factKey targeting defect.** All fifteen engaged the correct supplied key; zero wrong-key
  declarations, mechanically and semantically.
- **No settlement-authority defect.** No execution moved a fact's status. The architecture held on
  every row, including all three HR-04 replicates where the reasoning was wrong. HR-04 R2 states the
  boundary in its own words — *"I am not entitled to mark it answered"*.
- **No clarification-volume defect as such.** `proposedClarification = 0/15` is not itself a defect;
  on twelve executions a targeted first-pass question already existed. The defect on HR-04 is not
  that no question was proposed, it is *why* none was proposed.
- **No adjacent-fact containment defect outside HR-04.** On HR-08 and HR-09 the containment is
  exemplary.
