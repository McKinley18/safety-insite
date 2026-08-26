# Next action — `READY_TO_AUTHORIZE_L3_RUN2_SEALED_ACCEPTANCE — ANTHROPIC — claude-sonnet-5`

## The exact next prerequisite

**EXPLICIT USER AUTHORIZATION to execute the sealed Run-2 acceptance run.** That is the only
outstanding gate. It is a decision, not an engineering step, and it belongs to the user.

Nothing else is blocked and nothing else needs building. All five preconditions from the Run-2 freeze
§9 now stand:

| | precondition | state |
|---|---|---|
| 1 | provider/billing capacity established **without transmitting any Run-2 row** | **PASS** — $40.00 vs $18.038745, 2.217× |
| 2 | valid `ANTHROPIC_API_KEY` under the Commercial Terms (`D-79`) | **PRESENT** — zero-cost presence probe, all three paths |
| 3 | provider/model identity gate for exactly `claude-sonnet-5` | **PASS** — `D-93` §60, corroborated by §61 |
| 4 | `D-K` permanent-provider-failure abort wired in **before** execution | **MUST BE VERIFIED WIRED AT EXECUTION TIME** |
| 5 | explicit user authorization | **OUTSTANDING — this is the gate** |

> **Item 4 is the one piece of engineering that is still owed and was deliberately not done here.**
> The `D-K` abort predicate is specified and frozen, but this phase was authorized only to reclassify
> capacity. Wiring and proving it belongs to the execution phase, **before spend**, and the run must
> not start until it is demonstrably in place. Run 1 issued **144 doomed calls** after the provider
> began rejecting everything precisely because no such abort existed.

## Before authorizing, understand what authorization costs

**The first inference call containing any Run-2 row flips `RUN2_HOLDOUT_SPENT` to `TRUE` and retires
gauntlet offset `1` and realism offset `0` PERMANENTLY — whatever the result** (§29.8). Per `D-H` that
transition follows from **transmission alone** and is independent of scorability. **`INVALID` never
implies `UNSPENT`.** After Run 2, only runs 3 and 4 remain (gauntlet offsets `2`,`3`; realism offsets
`1`,`2`), plus the unopened 100-row `gauntlet.seed` tranche.

Expected spend at the observed mean is **$5.69**; the governed worst case is **$18.04**. Either way the
money is the cheap part — the corpus is not.

## Not authorized by this package

Executing Run-2 acceptance · transmitting any Run-2 or reserved row · opening any Run-2 observation ·
any provider call whatsoever · reusing gauntlet offset `0` or realism offset `3` · altering any gate,
threshold, denominator, scorer, prompt, schema, validator, binder, input builder or shim · treating
Run-1's 40 answered rows as partial acceptance evidence · selecting a production provider · beginning
`L3-3` · changing customer authority · commit, push or deploy.

`RUN2_HOLDOUT_SPENT = FALSE`. `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`.
