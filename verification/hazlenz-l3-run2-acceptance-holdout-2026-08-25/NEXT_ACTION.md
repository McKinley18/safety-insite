# NEXT ACTION — NOT EXECUTED

**A provider/billing capacity and execution-readiness gate that transmits ZERO Run-2 holdout rows.**

## Why callability alone is no longer sufficient

`D-93` established callability, exact model identity and execution-path compatibility on **one**
request — and Run 1 still failed, because **capacity ran out mid-run at row 41**. A single successful
call proves the account can answer once; it does not prove it can answer **186 times**.

The next gate must therefore establish, **without sending a single Run-2 row**:

1. **Callability, exact model identity, execution-path compatibility** — the three `D-93` axes, using
   a **non-holdout** probe, as `D-93` did.
2. **Sufficient capacity for at least 186 requests** — 93 rows × 2 isolated processes (§38.3), plus
   the frozen ceiling-of-one retry headroom. Establish this from account/billing state rather than by
   burning holdout rows.
3. **The `D-K` abort wired in before execution** — on the first row that ends
   `PROVIDER_EVALUATED = false` after the frozen retry is exhausted, stop. Run 1 issued **143 further
   doomed calls** for want of it.
4. **`providerEvaluated` declared per row** by the runner, from the frozen transport taxonomy, so the
   v2 validity gate can decide `D-G`.

## Then, separately again

An **explicit authorization** for the Run-2 sealed acceptance run.

> **Passing the capacity gate does NOT authorize spending.** The first inference call containing any
> Run-2 row flips `RUN2_HOLDOUT_SPENT` to `true` and retires **gauntlet offset `1`** and **realism
> offset `0`** permanently, **whatever the result** (§29.8). Per `D-H` that transition follows from
> **transmission alone** and is independent of scorability — **`INVALID` never implies `UNSPENT`**.

After Run 2, the reserve remaining would be gauntlet offsets `2`, `3` and realism `1`, `2` — roughly
two further acceptance runs — plus the unopened 100-row `gauntlet.seed`.

## Not authorized by anything in this package

Anthropic credential access · provider probing · provider calls · inference · spending Run-2 ·
reusing the spent Run-1 holdout, gauntlet offset `0` or realism offset `3` · opening `gauntlet.seed` ·
selecting gauntlet offsets `2`/`3` or realism `1`/`2` · changing `G1`–`G10` or any threshold ·
changing the prompt, schema, validator, binder, input builder, shim or the original scorer ·
weakening `D-D.6` · tuning · remediation · production-provider selection · `L3-3` ·
customer-authority changes · deployment · commit · push.
