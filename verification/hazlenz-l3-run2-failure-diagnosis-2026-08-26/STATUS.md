# L3 RUN-2 ACCEPTANCE FAILURE — ROOT-CAUSE DIAGNOSIS (2026-08-26) `ZERO PROVIDER CALLS`

> ### `L3_RUN2_FAILURE_DIAGNOSIS_COMPLETE — REMEDIATION_DECISION_REQUIRED`
> ### provider calls `0` · API cost `$0.00` · frozen acceptance result **UNCHANGED**
> ### `L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9` · `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`
> ### `RUN2_HOLDOUT_SPENT = TRUE` · `GAUNTLET_OFFSET_1 = RETIRED` · `REALISM_OFFSET_0 = RETIRED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Root cause was established for **every** failed gate from evidence Run 2 already produced.
**No provider was contacted and no gate, threshold, denominator or result was altered.**

## The headline

**All 30 failing rows originate in the provider. None originates in the pipeline.**

| layer | rows |
|---|---|
| `C. PROVIDER_CLARIFICATION_DECISION` | **14** |
| `A. PROVIDER_REASONING` (non-determinism) | **11** |
| `B. PROVIDER_STATE_RESOLUTION` | **4** |
| `D. PROVIDER_EVIDENCE_SELECTION` | **1** |
| `E` binder · `F` validator · `G` mapping · `H` scorer · `I` contract | **0** |
| `J. INDETERMINATE` | **0** |

Two facts make that attribution structural rather than judgemental, and both are **measured**:
the scored tier equals the **validated** tier on **93/93** rows but the **bound** tier on only
**86/93**, so the binder **cannot reach the scorer**; and the validator is byte-frozen and
deterministic, so any A/B disagreement **proves the proposal differed**.

## The seven questions, answered from evidence

**1. What caused the G1 miss?**
One row, `H2B-004`. In process A the model emitted an evidence span whose offsets fall **outside the
observation**; the frozen validator rejected it with `EVIDENCE_OUT_OF_BOUNDS`, leaving **zero
validated candidates** on a `highConsequence` row. **That single rejection also produced G5 and G6** —
three of the seven failed gates collapse to one row. **Process B validated the same row `VALID` with
a candidate**, so A and B did **not** fail for the same reason: only A failed at all. The defect is
non-deterministic and is a sub-family of the G9 instability.

**2. Why is G3 only 56.67% / 58.62%?**
The model raised **21** clarifications where truth owes **30**; **17** landed correctly and **4**
landed on rows owing none. On all **13** misses it expressed **no clarification in either carrier** —
candidate-borne `false`, proposal-level `0`. **Nothing was dropped downstream, because nothing was
ever expressed.** The `D-56` carrier-coupling mechanism does **not** explain it: only 1 of 13 had zero
candidates. **All 13 misses reproduce identically in process B** — deterministic, not noise. Misses
concentrate in `INDEPENDENT_REALISM` (10) and `F6` (3). The `D-57` proposal-level carrier was
available on every row and **used zero times out of 21**, matching `D-62`'s zero usage on two other
providers.

**3. What caused the four G4 false-ACTIVEs?**
On all four, frozen truth is `INSUFFICIENT_EVIDENCE` with `activeProhibited = true` and the model
asserted **`ACTIVE`**. **`F6` dominates — 3 of 4** (`H2B-086/087/088`); the fourth is `F3`.
The validator returned `VALID` and **the binder bound the `ACTIVE` on all four** — neither stage
suppressed it, so neither is the origin. **Identical in process B**: deterministic. The same
behaviour trips **G3 as well** on the three `F6` rows, which asserted `ACTIVE` *and* asked nothing.

**4. What caused G9 = 84.95%?**
**14 divergent rows, all provider-origin.** On **9** both processes validated `VALID` and the scored
fields still differ — identical input through a deterministic validator means **the proposal
differed**. On the other **5** the validator rejected on one side only, which a deterministic
validator cannot do for identical input. Differing fields: `assertedState` **12**, hazard recognition
**10**, clarification **4**. **The structural reason is recorded in the frozen shim itself**:
`temperature` is **not forwardable** to this provider and `seed` has **no equivalent** (`D4`/`D5`,
measured from 400 responses). **No determinism control exists on this path**, yet G9 demands 100%.

**5. How many failed rows originate in provider reasoning versus downstream pipeline processing?**
**Provider 30 / 30. Pipeline 0 / 30. Indeterminate 0 / 30.**

**6. One underlying defect or several?**
**Several — at least two independent families, largely disjoint.** Family 1 (`RC-1`, `RC-2`:
clarification calibration and ACTIVE over-assertion) is **deterministic** — it reproduces identically
in both processes. Family 2 (`RC-3`, `RC-4`: sampling non-determinism) **exists only because outputs
do not reproduce**. They cannot be the same defect. Of the 14 G9 rows, **11 fail G9 only**. Fixing
family 2 entirely would leave G3, G4 and most of G2 untouched; fixing family 1 entirely would leave
G9 roughly where it is.

**7. Is another provider call necessary to answer any of those questions?**
**No — and this is derived, not assumed: all six were answered above with `0` provider calls and
`$0.00`.** The recorded evidence was sufficient because the runner persisted per-row validator state,
issue codes, candidate states, both clarification carriers, the binder tier and full transport
metadata for **all 186 calls in both processes**.

> **A real evidence limit, stated rather than glossed:** the **raw model prose was not persisted** —
> no rationale text, no evidence spans, no proposal bodies, only structured post-validator views and
> `contentChars`. That is sufficient to establish **which layer** each failure originates in, which
> is what this phase was asked for. It is **not** sufficient to establish **why** the model declines
> to ask a question, or whether a different prompt would change it. Those are different questions,
> and answering them needs new inference — but they are not questions 1–6.

## Is another paid run justified now? — **NO, on the current evidence**

**No root cause is classified `LOCAL_REMEDIATION_CANDIDATE`.** Nothing in the evidence identifies a
defect in code this programme controls whose repair would move a failed gate. Three of the four root
causes classify as **`PROVIDER_CAPABILITY_LIMIT`** and the fourth as **`INSUFFICIENT_EVIDENCE`**.

**The decisive constraint is G9.** It is a **hard gate at 100%** cross-process reproducibility, and
the frozen shim **measured** that neither `temperature` nor `seed` can be sent to this provider. A
Run 3 would therefore **fail G9 regardless of how well every other gate were repaired**, unless
either the provider gains a determinism control it does not currently expose, or the G9 contract is
revisited — **and revisiting a pre-registered gate after seeing a failure is a governance act this
phase may not perform and does not propose.**

Spending a reserved tranche now would **burn a single-use corpus to re-measure a gate that is
currently unreachable.** Gauntlet offsets `2`/`3`, realism offsets `1`/`2` and the unopened 100-row
`gauntlet.seed` remain reserved; each is a **different exam, not a retry**.

> **Engineering work is not blocked by lack of diagnosis.** Root cause is established. What is
> missing is a *demonstrated fix*, and any fix must be validated on **non-holdout development
> cohorts** — never against these 93 burnt observations.

## What this diagnosis does not do

It **does not** reinterpret the acceptance result, reclassify any gate, mark any defect repaired, or
propose a fix because one seems obvious. Two observations that bear on remediation are recorded
**explicitly as observations, not reclassifications**: on **8 of 14** G9 divergences neither process
asserted `ACTIVE` (the difference is a candidate at `NEGATED`/`CORRECTED` versus none at all); and
`UNGROUNDED_CORRECTIVE_ACTION` — which fatally rejected 4 rows — sits in none of the three frozen
reason sets, so it is **fatal to a proposal but invisible to G6**. **Both gates counted correctly
under definitions frozen and hashed before the corpus was opened.**

`D-100` and §67 stand verbatim. `RUN1_MODEL_ACCEPTANCE_RESULT` remains `NOT_ESTABLISHED`.
**Nothing in this diagnosis contradicts the frozen acceptance result.**
