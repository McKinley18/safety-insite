# What happens next

> ## `L3_ACCEPTANCE_HOLDOUT_FROZEN — PROVIDER_GATE_REQUIRED_BEFORE_ACCEPTANCE_AUTHORIZATION`
> ## The exam exists. **It has not been sat, and this phase did not sit it.**

`PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · **`HOLDOUT_SPENT = FALSE`**

---

## The exact next prerequisite — a provider-readiness gate, and nothing more `USER ACTION`

The only phase now reachable is **execution-time Anthropic credential + exact-model identity
readiness**. It must:

1. establish **credential presence handling** — whether a credential governed by the required
   Anthropic Commercial Terms (`D-79`) is available, without printing or exporting it;
2. establish the **exact authorized model identity** — exactly `claude-sonnet-5`, no substitute,
   no fallback, no "closest available";
3. establish **provider callability** — that the model can be reached at all;

**performed in a way that sends ZERO holdout rows.** Not one row, not a truncated row, not a
paraphrase, not a "representative sample". The readiness probe must use material that is not part
of the frozen holdout and not part of any reserved offset.

> **Passing that readiness gate still does not authorize spending the holdout.**

---

## Then, and only then — a separate explicit authorization

A **final explicit user authorization** is required before the first single-use acceptance call.
That call:

- flips **`HOLDOUT_SPENT` → `true`**;
- **retires gauntlet offset `0` and realism offset `3` permanently, whatever the result** (§29.8);
- is scored against the frozen `G1`–`G10` by `scorer/acceptance-scorer.js` `ea5e50ae…`, whose
  behaviour is already fixed and already synthetically validated **before any model output exists**.

**The gates cannot move afterwards.** `D-72` stands: changing a requirement is the user's call,
never a response to a provider failing it. A failed gate is a failed gate — it is never
reinterpreted as a quality KPI, and a non-scorable run is never a pass.

---

## What remains reserved

**Nothing is retired.** Gauntlet offsets `1`, `2`, `3`; realism offsets `0`, `1`, `2`; the entire
`gauntlet.seed` tranche (100 physical / 99 distinct), unopened. Reservation order is immutable and
may never be reassigned on semantic composition, family balance, difficulty or observed model
performance.

---

## If the readiness gate finds a gap

**STOP, do not choose.** `D-F` and `D-72` both stand: a contradiction is a new amendment, decided by
the user, and no second contradiction is repaired opportunistically.

---

## Explicitly NOT done by this phase

No provider called or probed · no credential accessed · no Claude Code authentication inspected ·
no inference · no holdout row transmitted · no acceptance result · no tuning · no semantic
remediation · no semantic inspection of any selected row · `G1`–`G10` unchanged · both `G3`
denominators unchanged · `G4` frozen membership unchanged · `G7` membership unchanged · Amendment 1
and Amendment 2 not changed substantively · source-selection rules unchanged · authored-control
truth unchanged after authoring · holdout membership unchanged after materialization · freeze
records not rewritten · Attempt 1 not overwritten and not rewritten as a success · prompt, schema,
validator, binder and sanctioned input builder unchanged · no production provider selected · L3-3
not begun · customer authority unchanged · nothing committed, pushed, merged, rebased, reset,
restored, cleaned, deployed or stashed.
