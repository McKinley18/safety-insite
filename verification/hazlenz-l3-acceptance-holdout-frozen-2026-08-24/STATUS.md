# L3 ACCEPTANCE HOLDOUT CONSTRUCTION — BLOCKED BY A CONTRADICTION IN AMENDMENT 1

> ## `L3_ACCEPTANCE_HOLDOUT_CONSTRUCTION_BLOCKED — AMENDMENT_IMPLEMENTATION_CONTRADICTION`
> ## `PLAN_EXECUTABLE = FALSE` (regressed) · `HOLDOUT_CONSTRUCTED_AND_FROZEN = FALSE` · `HOLDOUT_SPENT = FALSE`
> ## `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `a7b21a26`, unchanged, upstream 0/0. **Zero inference, zero provider probes, zero
credential access, $0.00.** The three protected sources are byte-identical before and after, and
**no row was selected from any of them**. Nothing committed, pushed, deployed or stashed.
**`G1`…`G10` untouched.**

Phases 0–4 executed. **Phase 5 was never reached: no holdout exists.**

---

## 1 — Phases 0–3 `PASS`

| gate | result |
|---|---|
| HEAD / branch / upstream / divergence | `a7b21a26` · `release/insite-rc-2026-08-18` · same SHA · **0/0** |
| protected source hashes | **3 of 3 MATCH** — `a95e5480…` 150 · `49aa40fd…` 100 · `6f6897f1…` 117 |
| governing plan digest | **MATCH** — `1f2edfff7a4bc62af445088269be301b4ab2a6856ff28cc5bc6b13b334cf820f` |
| physical rows / distinct texts | **367 / 366** |
| `gauntlet.seed` duplicate pair | **1 duplicate group of size 2 → 1 excess row**, proved structurally, no text printed |
| `HOLDOUT_FREEZE.txt` written **before** any selection code existed | **YES** — `f0e33f14…` |
| 25 controls authored from the frozen family table alone | **YES**, allocation `4+4+3+3+3+3+3+2 = 25` |

---

## 2 — The contradiction `PHASE 4 → 5 GATE`

> ### `AMENDMENT 1 STATES THE G4 DENOMINATOR TWICE, AND THE TWO STATEMENTS ARE INCOMPATIBLE.`

| where | what it says |
|---|---|
| line **494** | *"**`G4` (false `ACTIVE`) denominator: exactly `18`**"* |
| line **495** | *"every authored row whose truth state is non-`ACTIVE`: **F1, F2, F3, F4, F5, F6 and F8b**"* |

```
F1 4 + F2 4 + F3 3 + F4 3 + F5 3 + F6 3 + F8b 1  =  21        ≠  18
                                  ^^^^ the difference is EXACTLY F6 (n = 3)
```

**`18` is reachable only by excluding F6 from the G4 denominator — and two other clauses of the same
amendment forbid that exclusion:**

- **line 480**, the F6 row of the `D-D.3` family table, sets F6's **G4 column to `YES`**;
- **lines 497–499**: *"F3 and F6 must be resolvable **only** by a question, never by asserting an
  unobserved fact: a row that asserts `ACTIVE` on either **is a `G4` false-`ACTIVE`** and a `G3`
  recall miss."*

So the amendment simultaneously **requires F6 to be in the G4 denominator** and **requires that
denominator to have a cardinality attainable only with F6 out of it.**

**Measured from the 25 controls actually authored under the frozen family table:**

| frozen derived membership | frozen value | measured | verdict |
|---|---|---|---|
| authored `G3` (`CLARIFICATION_REQUIRED`) | exactly **6** | **6** | **MATCH** |
| `G7` pole (`CLARIFICATION_MUST_NOT_ASK`) | exactly **11** | **11** | **MATCH** |
| `G4` denominator (authored non-`ACTIVE`) | exactly **18** | **21** | **CONTRADICTION** |

**Only G4 is affected.** G3 and G7 are internally consistent, which is why the defect is narrow and
precisely locatable rather than systemic.

---

## 3 — Why this was not repaired `PROTECTED`

The G4 denominator is **gate-bearing**. Phase 6 of this construction contract requires proving
*"G4 denominator = exactly 18"*, and **G4 itself is a hard zero gate** (`D-84`).

Every available repair is forbidden by the contract this phase runs under:

> *"Do not repair a frozen rule silently."* · *"Do not change Amendment 1."* · *"Do not alter the
> F1–F8 family allocation."* · *"Do not alter a control's truth assignment after authoring."* ·
> *"If Amendment 1 cannot be implemented exactly: **STOP** with
> `AMENDMENT_IMPLEMENTATION_CONTRADICTION`."*

- **Adopting 21** edits the amendment's stated cardinality.
- **Adopting 18** removes F6 from G4 — contradicting two other clauses **and** silently altering an
  authored control's frozen truth assignment.

Both are amendment changes. **Neither is this phase's authority.** `D-72` stands: *changing a
requirement is the user's call, never a response to a provider failing it* — and choosing a
gate-bearing number inside the phase that builds the exam is the same failure in a different order.

**The freeze record was not rewritten.** Phase 2's rule is explicit — a defect requiring a freeze
change **invalidates the attempt**. `HOLDOUT_FREEZE.txt` `f0e33f14…` stands untouched, and
`ATTEMPT_INVALIDATED.txt` records the invalidation alongside it.

---

## 4 — Provenance of the defect, recorded rather than concealed

**The error was introduced by the amendment phase (`D-86`), not by this construction phase.** When
the derived memberships were written, the G4 arithmetic was computed as
`F1 4 + F2 4 + F3 3 + F4 3 + F5 3 + F8b 1 = 18` — **omitting F6's 3** — while the accompanying prose
enumerated F6 explicitly.

**That phase's formal executability review did not catch it.** It verified that the per-family
allocation summed to 25 and that the G4 denominator was *predeclared*; it did **not** cross-check
each derived cardinality against its own enumerated set. **That is a real gap in a review that
answered `YES`, and it is recorded here rather than quietly repaired.** The same class of check
would have held for G3 (6) and G7 (11), both of which are correct.

> **The 50/50 executability verdict was not wrong about determinism** — the selection rules are
> deterministic and were re-proved here. It was **incomplete about internal consistency.**

---

## 5 — What exists, and what does not

| artifact | status |
|---|---|
| `HOLDOUT_FREEZE.txt` `f0e33f14…` | written **before** any selection; valid as a record of attempt 1; **invalidated as a construction identity** |
| `builder/authored-controls.js` `4237fc3b…` | the 25 controls, authored from the frozen family table **alone with the positive stride unopened**; retained as evidence of authoring independence; **admitted to no holdout** |
| `holdout/` | **EMPTY — nothing materialized** |
| `scorer/` | **EMPTY — not written** |

**No row was selected from any protected source. No source identifier was materialized. No
observation text from any protected source was read, printed or inspected.** The selection rules
were re-proved structurally only.

**Remaining reserved independent evidence: ALL OF IT.** Gauntlet offsets `0`,`1`,`2`,`3`; realism
offsets `0`,`1`,`2`,`3`; the entire `gauntlet.seed` reserve. **Nothing is retired, nothing is spent.**

`D-79`…`D-86` are not rewritten. `D-83`'s artifact-level precondition remains **UNSATISFIED**.
**`claude-sonnet-5` was not called; there is no model performance result in this phase.**
