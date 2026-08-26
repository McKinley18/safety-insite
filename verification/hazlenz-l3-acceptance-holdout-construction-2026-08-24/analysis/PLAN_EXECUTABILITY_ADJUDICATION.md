# Can `INDEPENDENT_EVIDENCE_PLAN.md` be executed into a concrete holdout without discretion?

`L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — PLAN_NOT_EXECUTABLE_AS_PREAUTHORIZED`

The construction phase was authorized to **execute** the approved plan, and explicitly forbidden to
**invent** a selection rule: *"Do NOT invent a new stride-selection rule. Do NOT choose rows
manually."* Phase 2 requires the freeze record to carry *"the **exact** deterministic
stride-selection rule from the existing independent evidence plan"* and *"the **expected selected-row
count derived from that rule**"*, and requires that

> the freeze must make it possible for an independent reviewer to determine the selected source IDs
> from the protected source identities and the predeclared rule **without exercising semantic
> judgment**.

Four defects were measured. **Each independently defeats that test**, and none can be repaired by a
construction phase without making exactly the discretionary choice the phase is forbidden to make.

---

## E-1 — The stride is a shape, not a rule. No modulus, no offset, no reservation schedule.

The plan's entire selection clause:

> *"Sort by `scenarioId`; take a fixed stride over the gauntlet source and a fixed stride over the
> realism pack. Record the rule in the freeze record."*

Compare the standard the programme actually set. Every prior freeze recorded a **concrete**,
reviewer-reproducible rule — L3-2f's, the most recent:

> `selection rule   i % 5 === 3 over the id-sorted field dataset — THE LAST UNTOUCHED STRIDE`

That is executable by a stranger. *"A fixed stride"* is not: it names neither the modulus, nor the
offset, nor which offsets are reserved for the runs after this one. The field dataset had a 5-way
partition established at L3-2b that each later phase stepped through by offset. **No partition of
either acceptance source has ever been declared.**

**The plan's two sizing constraints do not close the gap — they conflict.**

| constraint, from the plan | implied stride over `gauntlet.source.v1` (150 rows) | rows selected |
|---|---|---|
| *"roughly 45 independent gauntlet rows"* | `i % 3` ≈ 3.33 — not an integer stride | 45 unreachable |
| *"roughly four future acceptance runs"* from 366 rows | `i % 4` | 37 or 38 |
| nearest integer stride below the row target | `i % 3` | 50 |

`i % 3` yields 50 and exhausts the source in three runs, not four. `i % 4` yields 37–38 and misses
"roughly 45" by more than the gauntlet's entire `medium` stratum. **Neither satisfies both clauses**,
so the phase would have to decide which clause governs — a discretionary act with a measurable
consequence, because the offset determines *which* regulator records are graded against **G1
(high-consequence misses = ZERO)** and the offsets differ in severity and family composition.

**§51.2 already recorded this defect** and reached the same conclusion this phase reaches
independently:

> *"**NOT RECORDED** — the rule exists as prose; no concrete stride is declared, and declaring one
> now would be inventing the selection the command forbids inventing."*

---

## E-2 — The selection rule is *literally inapplicable* to the realism pack. `MEASURED`

The rule sorts by `scenarioId` and carries `observation` verbatim. Measured against the actual file:

| source | `scenarioId` present | `observation` present |
|---|---|---|
| `gauntlet.source.v1` | **150 / 150** | **150 / 150** |
| `gauntlet.seed` | **100 / 100** | **100 / 100** |
| `field-realism-pack-v2` | **0 / 117** | **0 / 117** |

`field-realism-pack-v2` carries **`id`** and **`hazardObservation`** instead. **Neither field the
plan names exists on a single one of its 117 rows.** The plan's rule cannot be run against it at all
without an undeclared field mapping (`id` → sort key, `hazardObservation` → observation carrier).

That mapping is not a formality. Phase 4 requires the builder to *"preserve selected observation text
verbatim"* and Phase 7 requires proving *"every observation is copied verbatim from **its authorized
source**"* — a proof that is only meaningful against a **declared** source field. The realism pack
also carries a `title` and an `expectedTerms` field; nothing in the plan states that
`hazardObservation` alone is the sanctioned carrier, that `title` must be withheld, or how the
`ReasoningInput` is to be assembled from a row whose schema the plan never inspected.

**The plan characterised this source but never checked that its own rule could address it.**

---

## E-3 — The ambiguity denominator is undetermined, and the figure of record is wrong. `MEASURED`

Two distinct problems on the axis that **G3** gates.

**(a) The stride target is unresolved.** The rule strides *"over the realism pack"* — all 117 rows.
The composition clause asks for *"~20 independent realism-pack **ambiguity** rows"*. Those are
different sets: a stride over all 117 draws ambiguity and non-ambiguity rows in whatever proportion
the offset happens to hit, while a stride over the flagged subset draws 20 ambiguity rows by
construction. **G3 requires clarification recall of 100% on *both registered denominators*.** Which
set is selected *is* the denominator. The plan does not say, and choosing sets a frozen gate's
denominator by implementer preference.

**(b) The stated size of that denominator does not match the source.** The plan, and §37.10 quoting
it, both record:

> *"**`shouldHaveMissingEvidence`, declared on 92 rows**"* — *"92 rows carry a pre-existing
> `shouldHaveMissingEvidence` flag"*

Measured directly from the file at `6f6897f1…`:

| `shouldHaveMissingEvidence` | rows |
|---|---|
| `=== true` | **87** |
| `=== false` | **2** |
| **field absent entirely** | **28** |
| total | 117 |

**87, not 92. The field is present on 89 rows, not 92.** The 92 traces to `source-survey.json`, which
reports `"ambiguityish": 92` — a **heuristic text signal** computed over normalised prose, not a
count of the declared field. The plan promoted the heuristic into a claim about the field, and
§37.10 inherited it as a `PROTECTED_DECISION`.

The source file is **unmodified and hash-identical**; the discrepancy is in the record, not the data.
But a gate denominator cannot be frozen from a record that misstates it by six percent, and
**correcting a protected section's figure is not this phase's authority.**

---

## E-4 — The negative-control procedure is not predeclared. `PHASE 3 GATE — INDEPENDENTLY BLOCKING`

Phase 3 requires that the plan already specify the ~25 authored rows *"with enough precision to
prevent post-observation tailoring"*, with a predeclared basis for **control families ·
transformation rules or authoring requirements · expected state · expected clarification behaviour ·
expected MUST-NOT-ASK behaviour · provenance marking · duplicate/overlap rejection**.

Everything the plan says about that stratum, in full:

> | negative controls, corrected states | authored by the phase | **AUTHORED** | yes, reported **separately** |
>
> *"~25 authored negative/corrected complement"* · *"Negative controls remain unavailable from any
> independent source"* · *"Authored rows may supplement but must never constitute the independent
> source"*

That fixes a **count**, a **provenance class** and a **reporting rule**. It fixes **none of the seven
required bases**. A construction phase would have to invent, unconstrained: which of the 21 hazard
families to negate, what a corrected state reads like, what state each row must resolve to, whether
each row may ask for clarification, and which must **not** — the last of these being the direct
input to **G7 (`CLARIFICATION_MUST_NOT_ASK` violations = ZERO)**.

**A phase that authors its own MUST-NOT-ASK rows and is then graded on G7 is grading itself.** That
is precisely the weakness §36.10 exists to close — *"every precision, clarification and
family-coverage number rests on scenarios the implementer wrote"* — and the plan was written to end
it, not to reproduce it inside the acceptance holdout.

The scarcity is structural and already measured: `negativeControlish` **0 across all twelve
candidate sources**; `correctedStateish` **3** in the realism pack, **0** in the gauntlet. So these
~25 rows cannot be sourced independently and must be authored **from a specification that does not
exist**.

**No control was authored. The positive stride was not opened to discover what controls would be
useful** — the ordering Phase 3 mandates precisely to prevent that contamination.

---

## Adjudication

| defect | gate | independently blocking |
|---|---|---|
| E-1 stride has no modulus, offset or reservation schedule; sizing clauses conflict | Phase 0 / Phase 2 | **YES** |
| E-2 rule's key and carrier fields absent on 117/117 realism-pack rows | Phase 0 / Phase 4 | **YES** |
| E-3 ambiguity denominator unresolved; figure of record measured wrong (87 ≠ 92) | Phase 0 / G3 | **YES** |
| E-4 negative-control procedure unspecified on all seven required bases | **Phase 3** | **YES** |

**Terminal state: `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — PLAN_NOT_EXECUTABLE_AS_PREAUTHORIZED`**,
the Phase 0 terminal, reached first in execution order.

`NEGATIVE_CONTROL_PROCEDURE_NOT_PREDECLARED` is **independently satisfied** at Phase 3 and is
recorded alongside it: resolving E-1 through E-3 would still leave E-4 blocking, so a future
authorization must close **both**.

> **None of these was silently repaired.** Each is a decision that belongs to the user, because each
> one fixes a number that a frozen gate will later be measured against — and `D-72` stands:
> *changing a requirement is the user's call, never a response to a provider failing it.* Choosing
> them inside the phase that builds the exam is the same failure in a different order.
