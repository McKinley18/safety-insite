# NEXT ACTION — NOT EXECUTED BY THIS PHASE

The provider-readiness gate now **PASSES on all three axes**. The blocker that stopped `D-90`,
`D-91` and `D-92` is cleared.

**The next step is a decision, not a command.**

## What is required before anything else runs

**EXPLICIT USER AUTHORIZATION TO SPEND THE SINGLE-USE ACCEPTANCE HOLDOUT.**

This phase does not have it, did not act as though it had it, and does not create it.

## What that authorization would set in motion, and what it costs irreversibly

Sealed acceptance sends the **92 frozen holdout rows** through the frozen execution path to
Anthropic `claude-sonnet-5`, then scores the output with `acceptance-scorer.js` `ea5e50ae…`
against `G1`–`G10`.

**The first inference call containing any holdout row:**

* flips `HOLDOUT_SPENT` to **`true`**;
* **permanently retires gauntlet offset `0` and realism offset `3`**, whatever the result (§29.8);
* cannot be undone, re-run, or re-scored on a fresh corpus.

Gauntlet offsets `1`, `2`, `3` and realism offsets `0`, `1`, `2` remain reserved for later runs,
and the `gauntlet.seed` tranche remains unopened — but the acceptance corpus is single-use by
construction and there is no second attempt at *this* exam.

`D-72` stands: a failed gate is a failed gate, never reinterpreted as a quality KPI, and a
non-scorable run is never a pass.

## What is still NOT authorized by a passing readiness gate

* opening or semantically inspecting the frozen holdout;
* transmitting any holdout, reserved or `gauntlet.seed` row;
* running the acceptance scorer on any provider output;
* evaluating `G1`–`G10`;
* `L3-3`;
* production-provider selection;
* any change to customer authority — the current Level-1 engine remains customer-authoritative;
* deployment, commit, push.
