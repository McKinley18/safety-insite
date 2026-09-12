# §188 — §187A cost-accounting correction

**Zero provider calls. Zero database operations. No historical evidence deleted or edited.**

---

## The numbers

| | value |
|---|---|
| §187A figure reported as `TOTAL_ACTUAL_COST_USD` | **$1.22255** |
| §187A money actually spent | **$0.26255** |
| difference — synthetic reservations reported as money | **$0.96000** |
| §187B actual provider spend | $0.27927 |
| **cumulative actual §187A + §187B** | **$0.54182** |

`$0.96000 = 15 × $0.064`, the frozen worst case for one verifier call at the preregistered rates
(`4000 output tokens × $10/MTok + 12000 input tokens × $2/MTok`). All fifteen §187A verifier calls
were rejected with HTTP 400 — *"Your credit balance is too low to access the Anthropic API"* —
**before any inference, consuming zero tokens**. They cost nothing.

The five first-pass calls all returned HTTP 200 with usage, and their provider-returned costs sum to
exactly $0.26255:

```
HR-01  20159 in / 1547 out   $0.055788
HR-04  20168 in /  734 out   $0.047676
HR-06  20159 in / 1053 out   $0.050848
HR-08  20151 in / 1517 out   $0.055472
HR-09  20184 in / 1240 out   $0.052768
                             ---------
                             $0.262552  →  $0.26255
```

## The cause

`backend/scripts/probe-required-structured-verifier-2026-09-05.ts` kept **one counter and used it
for two incompatible purposes**:

```ts
spent += call.ok ? cost : WORST_VERIFIER_USD;          // line 448 (pre-repair)
…
TOTAL_ACTUAL_COST_USD: Number(spent.toFixed(5)),       // line 520 (pre-repair)
```

The conditional is a **correct budget guard**. A call whose real cost is unknown must be assumed to
have cost the frozen worst case, or a failing run could overrun its ceiling unnoticed — which is
exactly the protection a preregistered spend cap exists to provide. The defect is not the
reservation. **The defect is printing the reservation under the name `TOTAL_ACTUAL_COST_USD`.**

The first-pass loop carried the same class of defect at line 363,
`spent += t?.computedCostUsd ?? WORST_FIRSTPASS_USD`, which did not fire because all five calls
succeeded.

**Classification:** `HARNESS_FAILURE_CHARGE_ACCUMULATION` — a local verification-harness accounting
defect. Not a provider defect, not a model result, not a product runtime defect, and not a budget
breach: the run stayed inside both its 24-call and $2.00 caps on either accounting.

## What was preserved

Nothing historical was rewritten, and the §187A run is **not** presented as though the defect never
occurred.

| artifact | state |
|---|---|
| `RUN-SUMMARY.json` — still reports `TOTAL_ACTUAL_COST_USD: 1.22255` | **unedited**, kept as run evidence |
| `COST-CORRECTION.json` — §187A's own additive correction record | unedited |
| `SECTION-187A-INTEGRITY.json` — records the correct $0.26255 and points at the correction | unedited |
| `SECTION-187B-INTEGRITY.json` — `RUN_SUMMARY_COST_FIELD_ACCURATE: false` | unedited |

Byte hashes of all four are recorded in `SOURCE-INTEGRITY.txt`, so a later change is detectable.

## What was repaired

**`backend/scripts/lib/expert-provider-spend-accounting.ts`** *(new)* — `ProviderSpendLedger`, two
counters that cannot be printed under each other's names:

- `actualProviderSpendUsd` — provider-returned usage only. A call reporting no usage adds **zero**,
  whatever its HTTP status. This is the only figure that may be reported as money.
- `budgetReservedUsd` — actual spend, plus the frozen worst case for every call that reported no
  usage. Governs the ceiling via `wouldExceedCeiling()`. **Never** a spend figure.
- `syntheticReservationUsd` — the difference, named for what it is. On §187A it is $0.96.

A failure that *did* consume tokens is charged its real usage, not zero and not the worst case.

**`backend/scripts/probe-required-structured-verifier-2026-09-05.ts`** *(repaired, prospective)* —
both loops now use the ledger; the guard is unchanged in strength; the summary emits
`TOTAL_ACTUAL_COST_USD` meaning what its name says, plus `BUDGET_RESERVED_USD` and the full
`spendAccounting` block alongside it.

**`backend/scripts/resume-required-structured-verifier-2026-09-05.ts`** — **not changed**. §187B
already charged provider-returned usage only and did not reproduce the defect; its own comment says
so. `test-expert-provider-spend-accounting.ts` section E proves it rather than taking its word.

## Deterministic regression coverage

`backend/scripts/test-expert-provider-spend-accounting.ts` — **26 assertions, 26 passed**, zero
provider requests, zero database operations. No product runtime behaviour is touched.

The test does not assert against restated constants. It reads the frozen preregistration for the
rates and worst cases, and reconstructs both figures from the persisted §187 evidence on disk, so it
fails if either the ledger or the evidence moves:

```
C.2  the corrected ledger reproduces the actual §187A spend exactly      $0.26255
C.4  the guard position is the conservative $1.22255                     $1.22255
C.5  the synthetic reservation is exactly the $0.96 §187A misreported    $0.96
C.7  the legacy single counter reproduces the erroneous historical figure $1.22255
C.8  which is what RUN-SUMMARY.json still reports, unedited              $1.22255
C.9  the corrected and legacy figures differ — this is the defect, in one line
E.2  the corrected ledger reproduces the §187B reported spend            $0.27927
E.4  cumulative actual §187A + §187B is $0.54182                         $0.54182
```

`legacySingleCounterTotalUsd()` preserves the defective formula deliberately, so the regression can
*prove* what the defect produced rather than describing it. Sections A and B fix the rule directly:
a zero-usage rejection costs exactly 0 and fifteen of them still cost exactly 0. Section D proves the
guard still guards — reservations continue to count toward the ceiling, so the repair does not
weaken the protection that motivated the original conditional.

## Standing rule

**Actual spend is provider-returned usage and nothing else. A synthetic worst-case charge is a
reservation; it lives in the guard, and it is never reported as money.**
