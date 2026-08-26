# What happens next

> ## `L3_PROVIDER_READINESS_BLOCKED — CREDENTIAL_OR_CALLABILITY_FAILURE`
> ## The exam exists. **It has not been sat, and this phase did not come closer to sitting it.**

`PLAN_EXECUTABLE = TRUE` · `HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · **`HOLDOUT_SPENT = FALSE`**

---

## The exact next prerequisite — a credential, and nothing else `USER ACTION`

Everything else this gate requires is already in place and was **re-verified from the files this
session**, not assumed:

- the acceptance artifact is intact at `189a3cbf…`, 16/16 components matching;
- all ten frozen execution-path files match their frozen digests;
- the prompt `b8cc50fc…` (`v6`) and the run schema `a522cf5a…` were **re-derived from the shipped
  source**, not copied from a prior record;
- the Anthropic shim `76d3e039…` already reads `ANTHROPIC_API_KEY`, already defaults the model to
  `claude-sonnet-5`, and already logs the provider-returned `model` — **no code change is needed
  to run the probe.**

**One thing is missing.** Provide `ANTHROPIC_API_KEY` for an organization under the Anthropic
Commercial Terms (`D-79`), then re-run this readiness gate. It resumes at Phase 3 and proceeds:

1. **Phase 5** — one synthetic disposable non-holdout observation through the `76d3e039` shim to
   `POST https://api.anthropic.com/v1/messages`, requesting `claude-sonnet-5`;
2. **Phase 6** — bind `REQUESTED_MODEL` to the provider-returned `model` field, exactly, with no
   silent acceptance of a different family or version;
3. **Phase 7** — pass the real response through the frozen parser → binder → validator with no
   governed code changed.

**Zero holdout rows are sent at any point.**

---

## Then, and only then — a separate explicit authorization

> **Passing the readiness gate does not authorize spending the holdout.**

A **final explicit user authorization** is required before the first single-use acceptance call.
That call:

- flips **`HOLDOUT_SPENT` → `true`**;
- **retires gauntlet offset `0` and realism offset `3` permanently, whatever the result** (§29.8);
- is scored against the frozen `G1`–`G10` by `scorer/acceptance-scorer.js` `ea5e50ae…`, whose
  behaviour is already fixed and already synthetically validated **before any model output exists**.

**The gates cannot move afterwards.** `D-72` stands: changing a requirement is the user's call,
never a response to a provider failing it.

---

## What remains reserved

**Nothing is retired.** Gauntlet offsets `0`, `1`, `2`, `3`; realism offsets `0`, `1`, `2`, `3`;
the entire `gauntlet.seed` tranche (100 physical / 99 distinct), unopened. Reservation order is
immutable and may never be reassigned on semantic composition, family balance, difficulty or
observed model performance.

---

## Explicitly NOT done by this phase

No provider called or probed · no credential obtained, printed, logged, hashed, persisted or
counted · no Claude Code authentication inspected or used · no inference · no holdout row opened
or transmitted · no reserved source row opened or transmitted · no acceptance result · no scorer
run · no `G1`–`G10` evaluation · no tuning · no semantic remediation · no substitute model,
family or provider · no mocked provider response · `G1`–`G10` unchanged · prompt, schema,
validator, binder, input builder, harnesses and shim unchanged · governing plan read-only and
byte-identical · Attempt 1 not rewritten · frozen acceptance artifacts read-only · no production
code modified (`git diff HEAD -- backend/src` = 0 lines) · no production provider selected ·
L3-3 not begun · customer authority unchanged · nothing committed, pushed, merged, rebased,
reset, restored, cleaned, deployed or stashed.
