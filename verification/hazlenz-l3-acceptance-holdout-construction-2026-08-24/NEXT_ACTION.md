# What must be pre-authorized before the acceptance holdout can be constructed

> ## `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — PLAN_NOT_EXECUTABLE_AS_PREAUTHORIZED`
> ## Four decisions are required. **Every one belongs to the user**, because each fixes a number a frozen gate will be measured against.

These are stated as decisions, **not recommendations to be adopted by default**. Options are given
with their consequences so the choice is informed; the phase did not pick one, and a future
construction phase must not pick one either. Once decided, they belong in an **amendment to
`INDEPENDENT_EVIDENCE_PLAN.md`** — the plan of record — before any construction phase runs, so the
rule is predeclared rather than chosen by the phase it governs.

---

## D-A — The concrete stride rule for `gauntlet.source.v1` `E-1`

Required: a **modulus**, an **offset**, and a **reservation schedule** naming which offsets are held
for later runs. The form the programme uses is `i % N === k` over the `scenarioId`-sorted file.

| option | rows selected | runs available | fit to the plan's clauses |
|---|---|---|---|
| `i % 3 === k`, k ∈ {0,1,2} | **50** | 3 | closest to *"roughly 45"*; **contradicts** *"roughly four future runs"* |
| `i % 4 === k`, k ∈ {0,1,2,3} | **37 or 38** | 4 | satisfies *"roughly four runs"*; **misses** *"roughly 45"* by ~7 rows |

Also required: **the collation rule for the sort** — `scenarioId` values must be ordered by a stated
comparator (byte-wise, or numeric-suffix-aware), since the two orderings select different rows.

> **Consequence:** the offset determines which regulator records are graded against **G1
> (high-consequence misses = ZERO)**. Offsets differ in severity and family composition.

---

## D-B — The field mapping and stride rule for `field-realism-pack-v2` `E-2` `E-3`

**Measured: `scenarioId` is present on 0 of 117 rows and `observation` on 0 of 117 rows.** The file
carries `id` and `hazardObservation`. The plan's rule cannot address this source at all until three
things are declared:

1. **Sort key** — `id`, with a stated comparator.
2. **Observation carrier** — confirm `hazardObservation` is the **sole** sanctioned text reaching the
   model, and state explicitly that `title`, `expectedTerms`, `taskContext`, `equipmentInvolved`,
   `siteType` and `industryContext` are **withheld** (or, if any is to be included, exactly how the
   `ReasoningInput` is assembled from it).
3. **Stride population** — and this sets a **gated denominator**:

| option | population strided | yields | effect on **G3** |
|---|---|---|---|
| stride over **all 117 rows** | mixed | ~20 rows, of which ~15 carry the ambiguity flag | ambiguity denominator is whatever the offset happens to hit |
| stride over the **flag-true subset** | 87 rows | 20 ambiguity rows by construction | denominator fixed by construction |

> **Consequence:** **G3 requires clarification recall of 100% on *both registered denominators*.**
> Which population is strided **is** the denominator.

---

## D-C — Correct the `shouldHaveMissingEvidence` figure in the protected record `E-3`

§37.10 (`PROTECTED_DECISION`) and `INDEPENDENT_EVIDENCE_PLAN.md` both state the flag is *"declared on
**92** rows"*. **Measured from the unmodified source at `6f6897f1…`: `true` on 87, `false` on 2,
field absent on 28 — present on 89, true on 87.**

The 92 came from `source-survey.json`'s `"ambiguityish": 92`, a **heuristic text signal** that the
plan promoted into a claim about the declared field. **The data is correct and untouched; the record
is wrong.** Amending a `PROTECTED_DECISION` is a user action, and it must happen **before** the
denominator is frozen — a gate cannot be registered against a figure known to be wrong.

---

## D-D — The negative-control authoring specification `E-4` `PHASE 3`

The plan fixes only a count (~25), a class (AUTHORED) and a reporting rule (separately). Phase 3
requires a predeclared basis for **all seven** of the following, written **before** any positive row
is opened, so the controls cannot be tailored to what the stride turns out to contain:

1. **Control families** — which of the 21 `primaryHazardFamily` values are negated, and how many rows each.
2. **Transformation rules or authoring requirements** — whether a control is a *transformation* of an
   independent row (and if so, the exact transformation) or *authored de novo* (and if so, against
   what template). **Note:** transforming a selected positive row makes the control derivative of
   material the phase has then seen — the ordering must be stated explicitly.
3. **Expected state** for each control row.
4. **Expected clarification behaviour** — must-ask, may-ask, or must-not-ask.
5. **Expected MUST-NOT-ASK behaviour** — **this is the direct input to G7**, and it must be declared
   externally, not chosen by the phase that G7 then grades.
6. **Provenance marking** — the field and vocabulary that keep the AUTHORED stratum separable in the
   by-provenance table (§36.5), so the independent number stays readable on its own.
7. **Duplicate and overlap rejection** — how authored rows are checked against each other, against
   every prior sealed and development set, and against both acceptance sources.

Measured scarcity, confirming these cannot be sourced instead of authored: `negativeControlish`
**0 across all twelve candidates**; `correctedStateish` **3** in the realism pack, **0** in the gauntlet.

> **The reason this cannot be delegated to the construction phase:** a phase that authors its own
> MUST-NOT-ASK rows and is then graded on **G7** is grading itself — the §36.10 weakness
> (*"every precision, clarification and family-coverage number rests on scenarios the implementer
> wrote"*) reproduced inside the very holdout built to end it.

---

## Then, and only then

1. Amend `INDEPENDENT_EVIDENCE_PLAN.md` with **D-A … D-D** decided.
2. Re-authorize the construction phase. It writes `HOLDOUT_FREEZE.txt` **first**, then the builder
   with **overlap enforced by a throw**, materialises the holdout, hashes it, and writes the
   acceptance scorer against **`D-84`'s frozen G1–G10**.
3. Only after that: provide `ANTHROPIC_API_KEY` under the Commercial Terms (`D-79`), pass the
   execution-time identity gate for exactly `claude-sonnet-5`, and **explicitly authorize spending
   the single-use holdout**.

> **The gates are frozen and the builder is not.** `D-84`'s G1–G10 were fixed while zero sealed rows
> had been seen by anyone. A construction phase that finds a gate inconvenient changes the
> **builder**, never the gate.

---

## Explicitly NOT done by this phase

No stride selected · no row opened, previewed or inspected · no `HOLDOUT_FREEZE.txt` written · no
builder written · no negative control authored · no holdout materialised · no scorer written · no
gate changed · no prompt, schema, validator, binder or input-builder byte changed · no provider
called · no credential accessed · no production provider selected · L3-3 not begun · nothing
committed, pushed, merged, rebased, reset, deployed or stashed.
