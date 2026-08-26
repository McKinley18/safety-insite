# NEXT ACTION — one gate remains, and it is a user decision

## The gate

**Explicit user authorization to execute the sealed Run-2 acceptance run.**

Nothing engineering can determine remains. All five Run-2 freeze §9 preconditions now stand:

| # | precondition | state |
|---|---|---|
| 1 | provider/billing capacity established without transmitting a Run-2 row | **PASS** — `$40.00` against `$18.038745`, `2.217×` (§65, `D-98`) |
| 2 | valid `ANTHROPIC_API_KEY` under the Commercial Terms (`D-79`) | **PRESENT** — zero-cost non-transmitting probe, positive control detected (§65.5) |
| 3 | execution-time identity gate passing for exactly `claude-sonnet-5` | **PASS** — `D-93`, corroborated across 40 HTTP-200 calls (§60, §61) |
| 4 | the `D-K` abort wired in **before** execution | **WIRED AND VERIFIED** — this phase |
| 5 | **explicit user authorization** | **OWED** |

## What authorization buys, and what it costs

Expected spend at the observed mean **$5.69**; governed worst case **$18.04**. Available **$40.00**.

**The money is the cheap part. The corpus is not.** The first inference call containing any Run-2 row
flips `RUN2_HOLDOUT_SPENT` to `true` and retires gauntlet offset `1` and realism offset `0`
**permanently, whatever the result** (§29.8). Per `D-H` that follows from **transmission alone** and
is independent of scorability: **`INVALID` never implies `UNSPENT`.**

**`D-K` does not change that.** It stops the run at the first required row the provider does not
evaluate, which saves calls and money. **It does not give the corpus back, does not preserve a
reservation, does not make a run scorable and does not authorize a rerun.**

Gauntlet offsets `2`, `3` and realism offsets `1`, `2` remain reserved for runs 3 and 4, and the
100-row `gauntlet.seed` remains unopened — so a Run 3 would be possible, but it would be a **third**
spent tranche, not a retry of this one.

## The command shape — NOT EXECUTED, and not to be run without authorization

Both identities must be named in the authorization:

```
RUN2_ACCEPTANCE_ARTIFACT_IDENTITY = 9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc
RUN2_EXECUTION_GUARD_IDENTITY     = eee8e587cd19183024d9a00b0ace5efbdcc73d587dddf801c51aaa0beab303c1
```

```
export RUN2_RUN_DIR=verification/hazlenz-l3-run2-sealed-acceptance-<date>
verification/hazlenz-l3-run2-prespend-execution-guard-2026-08-25/runner/run-run2-sealed.sh
```

The driver refuses to start without `DK_ABORT_FLAG`; the shell refuses to start without an explicit
run directory, and refuses to start at all if a `D-K` abort flag already exists.

## What is still NOT established, and will not be until the run is sat

`claude-sonnet-5` has **no Level-3 acceptance result**. `RUN1_MODEL_ACCEPTANCE_RESULT` is
`NOT_ESTABLISHED` and Run 1 is not rewritten. `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
`PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`. **L3-3 remains unauthorized.**

## Recorded uncertainty, carried forward unchanged

The 40 answered Run-1 rows were that holdout's gauntlet-heavy prefix — 38 `highConsequence` gauntlet
+ 2 realism + **zero authored controls**. There is still **no token evidence for authored-control
rows**, and Run-2's 25 authored controls remain unopened. The cost projection **assumes** Run-2 rows
are token-comparable to Run-1's gauntlet rows. At `2.217×` coverage that assumption would have to be
wrong by a large factor to matter, but it is **unproven**, and `D-K` does not test it either — it
only bounds what a permanent provider failure can cost.
