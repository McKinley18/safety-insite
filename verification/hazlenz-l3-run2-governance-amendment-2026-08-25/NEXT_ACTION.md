# NEXT ACTION — NOT EXECUTED

**A separately authorized Run-2 holdout-construction phase**, executing the amended plan
(`a7da57e4…`, Amendments 1 + 2 + 3), in this order:

1. **Freeze record first** — hashes and the concrete selection rules, written before any builder exists.
2. **`D-F` pre-selection gate** — re-derive every gate-bearing quantity from the frozen rules and
   **stop before selection** on any mismatch.
3. **Selection** — gauntlet offset **`1`** (38 rows), realism offset **`0`** (30 rows), by `CMP` over
   the frozen sort keys. Verbatim carriage (`S-4`), drift guard (`S-5`), pairwise-distinct keys
   (`S-2`), all enforced by **THROW**.
4. **25 FRESH authored controls** (`D-I`) from the frozen F1–F8 table alone, with the positive stride
   unopened, and `D-D.6` overlap enforced by a **THROW** against the **spent Run-1 holdout**, all
   prior sealed holdouts, all development sets and every other protected surface.
5. **Structural validation only** — no semantic "looks right" inspection.
6. **Deterministic rebuild** into a second location, byte-for-byte.
7. **`|DEN_A|` discovered from frozen metadata AFTER selection** (`D-B.3`) — never before.
8. **Stop before all provider activity.**

Expected composition, already derived and 33/33 MATCH: **38 + 30 + 25 = 93 rows**, 68/93 = 73.1%
independent.

## Then, separately again

A **new acceptance authorization**. The Run-2 run must additionally carry, per Amendment 3:

- `providerEvaluated` declared per row, from the frozen transport taxonomy;
- the **`D-K` abort** wired in before execution;
- scoring through **`acceptance-scorer-v2.js`**, which calls the unmodified frozen scorer.

## Not authorized by anything in this package

Constructing the Run-2 holdout · opening or selecting any Run-2 source row · spending any further
independent evidence · Anthropic calls · provider probing · inference · reusing the spent Run-1
holdout, gauntlet offset `0` or realism offset `3` · changing any substantive `G1`–`G10` requirement
· weakening any threshold · production-provider selection · `L3-3` · customer-authority changes ·
deployment · commit · push.
