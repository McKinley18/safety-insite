# L3 INDEPENDENT EVIDENCE PLAN — AMENDED, AND EXECUTABLE WITHOUT DISCRETION

> ## `L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED — HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`
> ## `PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED = FALSE` · `HOLDOUT_SPENT = FALSE`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **This is a specification phase.** Zero inference,
zero provider probes, zero credential access, **$0.00**. **No holdout, no `HOLDOUT_FREEZE.txt`, no
builder, no scorer, no authored control.** No sealed row was selected or semantically inspected. The
three protected sources are byte-identical before and after. **`G1`…`G10` are untouched.**

`D-85` recorded four defects that made the approved plan unexecutable. **All four are now closed** in
the plan of record — `INDEPENDENT_EVIDENCE_PLAN.md`, *Amendment 1 — `D-A` … `D-D`* — with every
superseded clause **struck in place rather than deleted**, and its provenance preserved.

---

## 1 — Phase 1 `PASS` — and the two inventory numbers, kept apart

| source | sha256 | physical rows | distinct `NORM` texts |
|---|---|---|---|
| `gauntlet.source.v1` | `a95e5480…` | **150** | **150** |
| `gauntlet.seed` | `49aa40fd…` | **100** | **99** — one internal duplicate pair |
| `field-realism-pack-v2` | `6f6897f1…` | **117** | **117** |
| **total** | | **367** | **366** |

**MATCH 3 of 3**, mutually disjoint at **0** intersections.

> **The `366` of record is a DISTINCT-TEXT count and is never restated as a physical row count.**
> Reservation arithmetic uses **physical** rows (150, 117); budget statements name which number they
> use. The amendment binds this distinction.

---

## 2 — `D-A` `E-1 CLOSED` — the gauntlet reservation rule

| element | value |
|---|---|
| sort field · comparator | **`scenarioId`** · **`CMP`** = UTF-8 byte-wise ascending, no case folding, no locale collation, no normalization |
| index · modulus | 0-based position · **`m = 4`** |
| selection predicate | **`i % 4 === k`** |
| offset derivation | **`k = parseInt(sha256.slice(-8), 16) % 4`** = `parseInt("22f0adb4",16) % 4` = `586198452 % 4` = **`0`** |
| **acceptance offset (run 1)** | **`0` → 38 rows** |
| partition sizes | `0`→**38** · `1`→**38** · `2`→**37** · `3`→**37** · Σ 150 |
| reservation schedule | **`0` → `1` → `2` → `3`**, cyclic, immutable |
| verbatim carrier | **`observation`** |

**The offset is derived, never chosen.** It is a pure function of bytes frozen ten weeks before this
programme began. Inspecting a partition's semantic composition is **prohibited** — and could not
change the offset in any case.

---

## 3 — `D-B` `E-2 CLOSED` — the realism-pack mapping and population

**The plan's original keys do not exist on this source**, which is what `E-2` measured:

| plan key | present on | **canonical mapping** |
|---|---|---|
| `scenarioId` | **0 / 117** | → **`id`** (distinct 117/117) |
| `observation` | **0 / 117** | → **`hazardObservation`** (117/117) |

`hazardObservation` **alone** reaches the model. `title`, `expectedTerms`, `taskContext`,
`equipmentInvolved`, `siteType`, `industryContext`, `photosAvailable`, `employeeExposureKnown` and
`shouldHaveMissingEvidence` are **explicitly withheld**, retained only as truth metadata.

Rule: **`CMP(id)` ascending · `m = 4` · `k = parseInt("5231a9cb",16) % 4 = 1378986443 % 4 =` **`3`** ·
29 rows** · partitions `0`→30, `1`→29, `2`→29, `3`→29 · reservation **`3` → `0` → `1` → `2`**.

> ### `THE STRIDE COVERS ALL 117 ROWS. AMBIGUITY STATUS IS FORBIDDEN AS A SELECTION CRITERION.`
>
> Striding only the flag-true subset would let the builder choose its own **`G3`** denominator —
> exactly the failure `E-3` identified. Ambiguity is read **after** selection, from frozen metadata,
> **solely** to compute the already-registered denominators.

**Accepted in advance:** the number of `CLARIFICATION_REQUIRED` rows in the reserved partition is
whatever the frozen metadata makes it. **It was deliberately not computed at amendment time**, and it
may never be used to revisit the offset, the modulus or the population.

---

## 4 — `D-C` `E-3 CLOSED` — the ambiguity record corrected, its history kept

| `shouldHaveMissingEvidence` | rows |
|---|---|
| `=== true` | **87** |
| `=== false` | **2** |
| **absent** | **28** |
| present | **89 / 117** |

**`92` is withdrawn as a statement about this field — and preserved as what it actually was:**
`source-survey.json`'s `complementSignals.ambiguityish`, a **heuristic text signal** over normalised
prose, promoted into a claim about declared truth metadata. It is now marked in place, struck but not
deleted, and **prohibited as truth metadata** for any builder, scorer or gate.

**This changes documentation only.** The source is byte-identical and was never edited. **`G3` is not
relaxed** — correcting a denominator's candidate pool is not a change to a threshold, and no
threshold was touched.

---

## 5 — Both `G3` denominators, as executable predicates

Derived truth is assigned **once**, at build time, by table — never inferred from text:

| provenanceClass | `clarificationExpected` |
|---|---|
| `INDEPENDENT_GAUNTLET` | **`false`** — the source declares no ambiguity field and none may be inferred |
| `INDEPENDENT_REALISM` | **`row.shouldHaveMissingEvidence === true`** — strict identity; **absent → `false`** |
| `AUTHORED_CONTROL` | the value **frozen for its family** |

```
DEN_A = { r : r.clarificationExpected === true }              scenario-level  (ADVANCEMENT-RELEVANT)
DEN_B = { r ∈ DEN_A : provider emitted ≥ 1 candidate on r }   candidate-conditioned (DIAGNOSTIC)
```

**Zero-candidate:** a **MISS inside `DEN_A`**; **excluded from `DEN_B`** — the defining difference
(`§40.2`, `D-58`). **Malformed record:** stays in `DEN_A` and counts as a miss; never dropped.
**Both gate at 100% and are never merged into one number.** `|DEN_A| = 0` is a construction failure,
not a pass — `D-D` guarantees a floor of **6**.

---

## 6 — `D-D` `E-4 CLOSED` — the authored complement, fully predeclared

**Exactly `25`. Not approximate, not adjustable.** Holdout = **38 + 29 + 25 = 92**, of which
**67 (72.8%) are INDEPENDENT** — inside the plan's `~90–100` band.

| # | family | n | state | clarification | pole | G3 | G7 | G4 |
|---|---|---|---|---|---|---|---|---|
| F1 | explicit safe / negated condition | **4** | `NEGATED` | **prohibited** | `MUST_NOT_ASK` | — | **✓** | ✓ |
| F2 | corrected / remediated condition | **4** | `CORRECTED` | **prohibited** | `MUST_NOT_ASK` | — | **✓** | ✓ |
| F3 | insufficient evidence | **3** | `INSUFFICIENT_EVIDENCE` | **required** | `CLARIFICATION_REQUIRED` | **✓** | — | ✓ |
| F4 | subjective / non-factual | **3** | `UNKNOWN` | neither | `DECIDED_NON_ACTIVE` | — | — | ✓ |
| F5 | conditional / hypothetical | **3** | `HYPOTHETICAL` | neither | `DECIDED_NON_ACTIVE` | — | — | ✓ |
| F6 | absent decision-critical fact | **3** | `INSUFFICIENT_EVIDENCE` | **required** | `CLARIFICATION_REQUIRED` | **✓** | — | ✓ |
| F7 | sufficient evidence — must not ask | **3** | `ACTIVE` | **prohibited** | `MUST_NOT_ASK` | — | **✓** | — |
| F8 | paired positive / negative | **2** | `ACTIVE` / `NEGATED` | prohibited | `REGRESSION_ACTIVE` / `NEGATIVE_CONTROL` | — | — | ✓ (F8b) |
| | **total** | **25** | | | | **6** | **11** | **18** |

`4+4+3+3+3+3+3+2 = 25`. **Per-family counts may not be re-allocated.**

### 6.1 `G7` is a property of the family, never self-authored after inference

`L3-INV-06` permits a question **only at a decision boundary**. A family is intrinsically
`CLARIFICATION_MUST_NOT_ASK` **iff its construction rule guarantees no boundary exists**. F1, F2 and
F7 qualify — and **F2 and F7 match the two locked cohort members** `C-CS-05` (corrected state) and
`F-CL-04` (§49.3).

**F4, F5 and F8 are deliberately excluded from `G7`.** §49.3 is explicit that
`expectClarification: false` is **not** MUST-NOT-ASK: on a non-`MUST_NOT_ASK` pole it means *"does not
require a question"*; on the `MUST_NOT_ASK` pole it means *"a question here is a regression"*.
Conflating them is the `D-58` error that `D-76` found still live in the precision metric. **This
amendment does not repeat it.**

**No independent row may ever carry the `MUST_NOT_ASK` pole** — that would require judging
semantically that a regulator record contains every decision-critical fact. **`G7`'s pole is exactly
the 11 authored rows.**

### 6.2 Independence, provenance, overlap

Controls are authored **from the family specifications alone**. **The selected positive stride must
not be read, previewed or semantically inspected before or during authoring**, and no control may be
added, removed, re-allocated or re-poled in response to any provider output.

Every row carries `provenanceClass` · `source` (+ frozen sha256) · `sourceId` · `selectionRule` ·
`pole` · `family`. The by-provenance table (`§36.5`) is **mandatory**; every gated metric is reported
overall **and** split, so the independent number stays readable alone.

Overlap key is **`NORM(carrier)`**, and the builder **throws** — never skips, never de-duplicates
silently — on collision with either full acceptance source (not merely the selected partitions), the
reserve `gauntlet.seed`, another authored control, all six prior sealed holdouts, the development
sets, the exhausted field corpus, or any previously spent offset.

---

## 7 — Phase 7 — formal executability review `50 checks · 50 YES · 0 NO`

> ### Q: Can two independent implementations derive the same selected source identities and authored-control truth structure **without exercising semantic selection discretion**?
> ### A: **YES**

Proved mechanically in `analysis/EXECUTABILITY_REVIEW.txt`, including **two independent
implementations of the full selection rule** — a `Buffer.compare` sort and a hand-written byte-loop
insertion sort — selecting **identical** row sets on both sources (38 and 29), with the four
reservations proved **disjoint and exhaustive**.

Verified: comparator total and strict on both sources · modulus explicit · offset mechanically
derived · reservations explicit · realism mapping and population explicit · ambiguity truth source
explicit · the 87/2/28 correction recorded · both `G3` denominators executable · authored total exact
· per-family allocation exact · family construction rules predeclared · `G7` membership predeclared ·
provenance predeclared · duplicate/overlap normalization predeclared.

> **The verifier printed no observation text, no source identifiers, and created nothing.** Selected
> sets were compared **internally**; only booleans and counts were emitted.

---

## 8 — What remains false, and what is unchanged

| proposition | value |
|---|---|
| `PLAN_EXECUTABLE` | **TRUE** |
| `HOLDOUT_CONSTRUCTED_AND_FROZEN` | **FALSE** |
| `HOLDOUT_SPENT` | **FALSE** |

**`G1`…`G10` unchanged** — no threshold touched, no escape hatch, no denominator removed, and the
`claude-sonnet-5` 5/6 diagnostic precision result was **not** used to weaken `G2`. Prompt, schema,
validator, binder, sanctioned input builder, shim and harnesses re-derived **OK = 10, MISMATCH = 0**;
`git diff HEAD -- backend/src` and `-- safescope-data` **0 lines each**.

**`D-79`…`D-85` are not rewritten.** `D-83`'s artifact-level precondition remains **UNSATISFIED**:
the holdout still does not exist. **`claude-sonnet-5` was not called; `D-70` and `D-77` are unchanged
and untested here. There is no model performance result in this phase.**

**Remaining unopened independent evidence: all 366 distinct texts / 367 physical rows.** Reserved but
unspent: gauntlet offsets `1`,`2`,`3`; realism offsets `0`,`1`,`2`; the entire `gauntlet.seed` tranche.
