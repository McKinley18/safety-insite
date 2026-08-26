# L3 RUN-2 ACCEPTANCE HOLDOUT — CONSTRUCTED AND FROZEN (2026-08-25)

> ### `L3_RUN2_ACCEPTANCE_HOLDOUT_FROZEN — PROVIDER_CAPACITY_GATE_REQUIRED`
> ### `RUN1_HOLDOUT_SPENT = TRUE` · `RUN1_MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED`
> ### `RUN2_HOLDOUT_CONSTRUCTED_AND_FROZEN = TRUE` · `RUN2_HOLDOUT_SPENT = FALSE`

**A second exam now exists. It has not been sat, and the first one is still spent.**

## The order things happened in, because that is the property that matters

1. **The freeze was written first** — `67e6b47c…`, before the builder existed, before any control was
   authored, before any row was selected. Never rewritten; the builder asserts it and **throws**.
2. **The pre-selection gate ran while selection code still did not exist** — **51 quantities,
   51 MATCH, 0 MISMATCH**.
3. **The 25 controls were authored with the positive stride unopened** — selection code did not exist.
4. **Only then** was any Run-2 source row selected.

## The holdout

| | |
|---|---|
| **sha256** | **`f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f`** |
| bytes · rows | **107018** · **93** (`H2B-001`…`H2B-093`) |
| `INDEPENDENT_GAUNTLET` | **38** — offset `1`, `CMP(scenarioId)` asc, `i % 4 === 1` |
| `INDEPENDENT_REALISM` | **30** — offset `0`, `CMP(id)` asc, `i % 4 === 0` |
| `AUTHORED_CONTROL` | **25** — fresh |
| independent | **68 / 93 = 73.1%** |

**Both offsets were derived, never chosen:** `(k0 + n − 1) mod 4` from each source's own byte-derived
`S-3` offset. The builder **throws** if a run-2 offset equals the retired run-1 offset.

## Two quantities discovered after selection — and one is a trap this phase walked into

**`DEN_A` = 30** — 6 authored (F3, F6) + 24 realism rows carrying `shouldHaveMissingEvidence === true`,
read from frozen metadata **after** selection, exactly as `D-B.3` requires.

> **The `G1` denominator is `36`, not `38`.** `highConsequence` is pure table lookup on the frozen
> `severityExpectation`, and the offset-1 partition holds **25 `critical` + 11 `high` + 2 `medium`**.
> Run-1's offset-0 partition happened to be 38/38 — **an accident of that partition, not a rule**, and
> no freeze has ever declared a `G1` cardinality.
>
> **The synthetic suite failed here, because the *test* had carried 38 forward as a declared
> constant. The test was corrected to derive the value. The holdout was NOT adjusted to restore 38** —
> changing the builder to fit a number is exactly what `D-72` forbids.

## The 25 controls are entirely fresh, and `D-D.6` was strengthened

Authored from the frozen F1–F8 table alone. **Not one is a Run-1 control, a paraphrase, a clone, or a
minimal edit made to evade detection** — Run-1's F1 set was a chain drive, a floor opening, welding
cylinders and a haul-road berm; this one is a distribution panel, a benched excavation, a conveyor
tail pulley and a ladderway, and the separation holds family by family.

Allocation `4+4+3+3+3+3+3+2 = 25` **derived, MATCH** · `G3` **6** · `G7` **11** · `G4` **21** ·
closure `21 + 4 = 25`.

> **84 surfaces evaluated, 0 collisions. Surface 8 is the SPENT RUN-1 HOLDOUT — all 92 rows,
> asserted present by a builder throw.** It is **not** relaxed because Run-1's controls went
> unanswered: membership in a spent sealed corpus prohibits reuse on its own. `gauntlet.seed` was
> checked and **not drawn from**.

## Validation

**61 structural checks, 61 PASS, 0 FAIL** — id sets equal the reserved partitions exactly, 0 rows
outside them, **38/38 and 30/30 carriers byte-identical** to source with a matching aggregate digest,
truth by table lookup only, `G4`/`G7` with 0 independent rows.

**Deterministic rebuild: `f887cfd1…` == `f887cfd1…`, `cmp` 0 differing bytes.**

**Scoring: original `ea5e50ae…` byte-unchanged and not modified**; v2 `b9a0a6bc…` verifies its digest
and throws on drift. **71 synthetic assertions, 71 PASS, 0 FAIL** — including that **one** withheld
evaluation on **either** process forces `NOT_SCORABLE` (186 exhaustive cases), and that a
**malformed-but-evaluated** answer keeps a run scorable **and still fails `G10`**.

**Run-2 denominators:** `G1` **36** · `G3` `DEN_A` **30** · `G4` **21** · `G7` **11** · all-row **93**.
**No gate, threshold or denominator changed.**

## A defect in this phase's own code, recorded rather than concealed

`rowsOf` initially accepted a **scalar** `scenarios` count as a corpus and crashed on two score files.
Fixed by **adopting the Run-1 implementation verbatim** and **restarting the frozen process**.
Nothing had been materialized, so no artifact was patched.

## Run 2 is unspent

0 credential accesses · 0 provider calls · 0 probes · 0 inference · **$0.00** · 0 rows transmitted ·
network-primitive audit of all 6 scripts **ZERO**. Gauntlet offsets **2**, **3** and realism **1**,
**2** plus the unopened 100-row `gauntlet.seed` remain reserved. **Nothing new is retired.**

**Run-2 acceptance-artifact identity `9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc`**
over 15 artifacts. **`189a3cbf…` was not reused — it belongs to the spent Run-1 artifact**, re-verified
unchanged at 16/16.

## Exact next prerequisite — NOT EXECUTED

**A provider/billing capacity and execution-readiness gate that transmits ZERO Run-2 rows**, then a
separate explicit acceptance authorization. See `NEXT_ACTION.md`.
