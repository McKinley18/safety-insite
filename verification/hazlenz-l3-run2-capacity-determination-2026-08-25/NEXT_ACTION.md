# Next action — `L3_RUN2_CAPACITY_BLOCKED — ADDITIONAL_CREDIT_REQUIRED`

## The exact prerequisite

**Add at least `$1.07` of Anthropic credit** (bringing the balance to **≥ $18.04**), then re-run this
determination with the new attested balance. Nothing else is blocked, and nothing else needs building.

The recommended target is a **round top-up to $25–$30**, not the bare $18.04:

- $18.04 is the max-envelope requirement with the mandated 25% headroom. It leaves **no** room for the
  semantic-retry tail ($28.86 worst case at max envelope) and **no** room for the possibility that
  Run-2's 25 freshly authored controls run longer than Run-1's gauntlet rows — which cannot be checked
  without opening the corpus.
- The marginal dollar is cheap. The corpus is not: **one** call containing **one** Run-2 row retires
  gauntlet offset 1 and realism offset 0 **permanently**, whatever the result. Runs 3 and 4 are the
  only remaining reservations.

## Then, and only then

Re-running this capacity determination and getting `SUFFICIENT` **still does not authorize the run.**
Per the Run-2 freeze §9, spending additionally requires **all** of:

1. demonstrated provider/billing capacity established **without transmitting any Run-2 row** — what
   this phase does;
2. a valid `ANTHROPIC_API_KEY` under the Commercial Terms (`D-79`);
3. the execution-time provider/model identity gate passing for exactly `claude-sonnet-5`;
4. the `D-K` permanent-provider-failure abort wired in **before** execution;
5. **explicit user authorization** for the sealed Run-2 acceptance run.

## Not authorized by this package

Executing Run-2 acceptance · transmitting any Run-2 or reserved row · opening any Run-2 observation ·
any provider call whatsoever · reusing gauntlet offset 0 or realism offset 3 · constructing another
corpus · altering any gate, threshold, denominator, scorer, prompt, schema, validator, binder, input
builder or shim · treating Run-1's 40 answered rows as partial acceptance evidence · selecting a
production provider · changing customer authority · commit, push or deploy.

`RUN2_HOLDOUT_SPENT = FALSE`.
