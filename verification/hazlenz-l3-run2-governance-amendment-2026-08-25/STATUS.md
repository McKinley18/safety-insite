# L3 RUN-2 GOVERNANCE AMENDMENT (2026-08-25) — `AMENDED, NOTHING CONSTRUCTED, NO PROVIDER CONTACTED`

> ### `L3_INDEPENDENT_EVIDENCE_PLAN_AMENDED_V3 — RUN2_HOLDOUT_CONSTRUCTION_REAUTHORIZATION_REQUIRED`
> ### `RUN1_HOLDOUT_SPENT = TRUE` · `RUN1_GAUNTLET_OFFSET_0 = RETIRED` · `RUN1_REALISM_OFFSET_3 = RETIRED`
> ### `RUN1_MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED`
> ### `RUN2_HOLDOUT_CONSTRUCTED_AND_FROZEN = FALSE` · `RUN2_HOLDOUT_SPENT = FALSE`

## The root cause, established before any remediation

The frozen scorer reported `scorable: true` on a corpus the provider never evaluated. **The cause is
representational, not arithmetic.** Its whole invalidity vocabulary asks only result-set-shape
questions, and beneath that, **every field of the nine-field result-record contract encodes "not
evaluated" *in band***, using a value a real answer could also produce.

> ### `THE SCORER CANNOT DISTINGUISH "THE MODEL ANSWERED AND ASSERTED NOTHING" FROM "THE MODEL WAS NEVER ASKED."`

**The contamination runs in both directions.** `G1`/`G3`/`G10` count a non-evaluated row as a
substantive **MISS** (fabricated failure — `G3` gave `1/29`). `G4`/`G5`/`G6`/`G7`/`G8` cannot be
tripped by one at all (fabricated pass — `G4` `0 of 21` and `G7` `0 of 11` passed with **zero of
their denominators evaluated**). **`G9` failed both ways at once:** 52 rows unevaluated on both sides
**compared equal and scored REPRODUCIBLE — agreeing about nothing**, while 40 rows evaluated on one
side scored **DIVERGENT — disagreeing about nothing**.

## Amendment 3 (`D-G`…`D-K`), appended — Amendments 1 and 2 preserved byte-for-byte

| | |
|---|---|
| plan before | `8d8f6e8d…` · 754 lines |
| plan after | **`a7da57e4…`** · 1006 lines |
| **append-only proof** | **first 754 lines *after* the append still hash to `8d8f6e8d…`** — 0 deleted, 0 modified |

- **`D-G`** — substantive scoring requires `EXPECTED_ROWS = PROVIDER_EVALUATED_ROWS` **and**
  `PROVIDER_EVALUATED_ROW_IDS = EXPECTED_ROW_IDS`, **set equality**, for every process including
  `G9`'s second. Otherwise `SCORABLE = FALSE` and the terminal is `NOT_SCORABLE` — never a
  substantive `PASS`, never a substantive `FAIL`. `PROVIDER_EVALUATED` is mechanical: HTTP 200 and
  the response reaching the frozen boundary. **A malformed or refusing answer counts as evaluated,
  because the model produced output — otherwise a provider could escape `G10` by emitting garbage.**
  Fail-closed: an undeclared field can never buy a pass.
- **`D-H`** — spend and scorability are **orthogonal**. `INVALID` must never imply `UNSPENT`.
- **`D-I`** — Run-2 authored controls must be **fresh**. The overlap rule is **not** weakened because
  Run-1's controls went unanswered; membership in a spent sealed corpus is itself sufficient.
- **`D-J`** — the Run-2 schedule is **derived, never chosen**: gauntlet `1` → 38, realism `0` → 30,
  authored 25, **total 93**. `RUN2_DEN_A` stays **unknown until after selection** (`D-B.3`).
- **`D-K`** — abort at the first row that ends unevaluated after the frozen retry is exhausted.
  **No threshold or streak constant is needed, because it is derived:** one unevaluated row already
  forces `SCORABLE = FALSE`, so every further request is provably incapable of changing the terminal.

## The frozen scorer was not modified

`acceptance-scorer-v2.js` **requires and calls** the frozen `ea5e50ae…`; a drifted digest **throws**.
So **the Run-1 acceptance-artifact identity `189a3cbf…` is unchanged, 16/16**.

**Monotonicity is by construction and was proved exhaustively:** `pass_v2 = pass_frozen AND complete`
— **`v2 === frozen` on 92 independently perturbed complete runs**, gate for gate, terminal and pass;
and **no single withheld evaluation on either process can yield `pass = true` (184 cases)**. It can
only ever move a run **from a substantive verdict to `NOT_SCORABLE`**.

**70 synthetic assertions, 70 PASS, 0 FAIL** · **executability review 43 checks, 43 OK, 0 defects** ·
**declared-vs-derived 33/33 MATCH**.

## Run 1 is not rewritten — three statements, three questions

| statement | the question it answers |
|---|---|
| `L3_ACCEPTANCE_FAILED — G2,G3,G9,G10` | what did this deterministic function return? — a **program** |
| `L3_ACCEPTANCE_INVALID — PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND` | what was the run's outcome? — a **run** |
| `MODEL_ACCEPTANCE_RESULT = NOT_ESTABLISHED` | what was measured about the model? — a **model** |

**Only the third could ever advance or block `L3-3`, and it is empty.**

**Execution:** 0 credential accesses · 0 provider calls · 0 probes · 0 inference · **$0.00** ·
0 rows selected · 0 observations opened · **0 additional corpus spent**.

## Exact next prerequisite — NOT EXECUTED

**A separately authorized Run-2 holdout-construction phase.** Run-2 construction remains
**unauthorized**.
