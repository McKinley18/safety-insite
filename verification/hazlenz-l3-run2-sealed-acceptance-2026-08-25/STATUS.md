# L3 RUN-2 FINAL SINGLE-USE SEALED ACCEPTANCE (2026-08-25/26) — `SPENT, VALID, FAILED`

> ### `L3_ACCEPTANCE_FAILED — G1,G2,G3,G4,G5,G6,G9`
> ### `SCORABLE = TRUE` · `MODEL_ACCEPTANCE_RESULT = ESTABLISHED_FAIL`
> ### `RUN2_HOLDOUT_SPENT = TRUE` · `GAUNTLET_OFFSET_1 = RETIRED` · `REALISM_OFFSET_0 = RETIRED`
> ### `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE` · `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

The explicitly authorized single-use sealed acceptance run executed. **The corpus is spent, and this
time the measurement was obtained.**

**`claude-sonnet-5` now has a Level-3 acceptance result. It is a FAIL.**

Run 1 spent a corpus and produced no model result at all. Run 2 spent a corpus and produced one.
That difference — not the verdict — is what this phase was built to deliver.

## The run was clean. The model was not.

| | |
|---|---|
| provider calls | **186** — 93 process A + 93 process B |
| HTTP status | **186 × 200**. Zero non-200. |
| returned model | **`claude-sonnet-5` on all 186**, `stopReason = end_turn` throughout |
| retries | **zero** — transport and shape alike, `attempts = 1` on every row |
| malformed output · refusals · timeouts | **0 · 0 · 0** |
| `PROVIDER_EVALUATED` | **93/93 in A, 93/93 in B — 186/186** |
| row-id set equality | **TRUE in both processes** |
| `completeProviderEvaluation` | **TRUE** |
| **D-K** | **armed, DORMANT** — no abort flag was ever written |

**No gate is vacuous.** Every denominator was fully evaluated, which is precisely what Run 1 could
not say about a single one of them.

## G1–G10, as the frozen scorer returned them

| gate | denominator | result | threshold | |
|---|---|---|---|---|
| `G1` | 36 | **1** high-consequence miss | ZERO | **FAIL** |
| `G2` | 21 | **4** imprecise clarifications — precision **80.95%** | 100% | **FAIL** |
| `G3` | 30 / 29 | recall A **17/30 = 56.67%** · recall B **17/29 = 58.62%** | 100% BOTH | **FAIL** |
| `G4` | 21 | **4** false `ACTIVE` | ZERO | **FAIL** |
| `G5` | 93 | **1** safety-consequential validator rejection | ZERO | **FAIL** |
| `G6` | 93 | **1** `EVIDENCE_OUT_OF_BOUNDS` | ZERO (every code) | **FAIL** |
| `G7` | 11 | **0** violations | ZERO | **PASS** |
| `G8` | 93 | **0** violations | ZERO | **PASS** |
| `G9` | 93 | **14** divergent — reproducibility **84.95%** | 100% | **FAIL** |
| `G10` | 93 | **93** conforming — **100%** | ≥99% | **PASS** |

**Failed: `G1` `G2` `G3` `G4` `G5` `G6` `G9`. Passed: `G7` `G8` `G10`.**

Every denominator is the one hashed into `declaration/ACCEPTANCE_CONTRACT.json` **before the corpus
was opened** — G1 36, DEN_A 30 (authored 6), G4 21, G7 11, the rest 93. **Not one threshold,
denominator or gate predicate was changed, before or after the result.**

## By provenance — the failures are not an artifact of the authored controls

| class | rows | |
|---|---|---|
| `INDEPENDENT_GAUNTLET` | 38 | G1 36 den / **1 miss** · schema 38/38 |
| `INDEPENDENT_REALISM` | 30 | G3 `DEN_A` 24 / num 14 (**58.3%**) · `DEN_B` 23 / num 14 (**60.9%**) · schema 30/30 |
| `AUTHORED_CONTROL` | 25 | G3 `DEN_A` 6 / num 3 (**50.0%**) · G4 21 den / **4 false ACTIVE** · G7 11 pole / **0** · schema 25/25 |

**68 of the 93 rows (73.1%) are INDEPENDENT** — authored by parties not tuning this implementation —
and the G1 miss and the G3 recall shortfall both land there. The clarification-recall failure
reproduces on independent and authored rows alike (58.3% vs 50.0%).

The one gate that could most easily have been a scoring artifact, `G7`, **passed at 0/11**: the model
did not ask for clarification where it was forbidden to. `G8` passed at 0/93 and `G10` at 100%. The
model's failures are recall, precision, false-`ACTIVE` and cross-process reproducibility — not schema
compliance.

## Why this measurement is valid where Run 1's was not

The validity gate that invalidated Run 1 is the same gate that certifies this run.

| | Run 1 *(spent, invalid)* | **Run 2** *(spent, valid)* |
|---|---|---|
| process A provider-evaluated | 40 / 92 | **93 / 93** |
| process B provider-evaluated | 0 / 92 | **93 / 93** |
| row-id set equality | FALSE both | **TRUE both** |
| `completeProviderEvaluation` | FALSE | **TRUE** |
| `SCORABLE` | FALSE | **TRUE** |
| `D-K` | did not exist | armed, **dormant** |
| terminal | `INVALID — PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND` | **`FAILED — G1,G2,G3,G4,G5,G6,G9`** |
| `MODEL_ACCEPTANCE_RESULT` | `NOT_ESTABLISHED` | **`ESTABLISHED_FAIL`** |

`gateArithmeticAuthoritative = true`. `invalidReasons = []`. `resultSet`: 93 expected, 93 received,
0 missing, 0 extra, 0 duplicates.

**`D-K` never fired, and that is the correct outcome — not a failure of the guard.** It was wired to
abort on the first required row the provider did not evaluate. The provider evaluated all 186. A
guard that stays dormant on a clean run is a guard working as specified; §66's assertion 12 proved
in advance that a complete run is behaviourally identical with it armed.

## Cost — the projection was accurate to 0.45%

| | |
|---|---|
| input tokens | **1,121,068** (mean 6,027.25/call, identical in both processes) |
| output tokens | **342,425** (A mean 1,795.48 · B mean 1,886.51) |
| **actual API cost** | **`$5.666386`** |
| `D-97` observed-mean projection **A** | `$5.691860` — **actual is 0.45% under** |
| governed requirement **C** | `$18.038745` — actual is **31.41%** of it |
| attested credit remaining | `$34.333614` of `$40.00` |

The input-token total is **byte-identical between the two processes**, which is the expected
consequence of a frozen prompt, schema and input builder over the same 93 rows. The `$18.04`
requirement was never close to binding; the headroom argument in `D-97` was about protecting a
single-use corpus, and it did.

## Preservation and non-tampering — 55 checks, 55 PASS, 0 FAIL

`preservation/PRESERVATION_POST.txt`. All 14 frozen path and scoring identities byte-identical
across the run. `git diff HEAD` over `backend/src` and `safescope-data`: **0 lines**. The
pre-execution declaration, sealed execution record and acceptance contract are **unchanged since
before the corpus was opened**. Raw evidence is **read-only on disk** and both raw-result hashes
match the pre-scoring freeze exactly. Run-1 (31/31), Run-2 construction (22/22) and the D-K guard
package (18/18) all verify byte-identical to their own manifests. 4 stashes untouched, 23 tags
unchanged, nothing staged, upstream 0/0, **HEAD unchanged at `a7b21a26`**.

**Zero retries. Zero skipped rows. Zero curated rows. No prompt, schema, validator, binder, input
builder, shim, scorer or `D-K` change. No tuning. No remediation. No semantic retry. No
hand-correction. No threshold adjustment, before or after the result.**

## Three things done in this phase that are recorded rather than concealed

**1. A zero-cost structural rehearsal before spend.** The run driver's record-building hook had been
type-checked but never executed, and a crash at row 90 would have destroyed paid single-use
evidence. Before transmitting anything, the exact driver was run end-to-end against the **local
`127.0.0.1` fixture** — no provider contact, no credential use, **$0.00** — completing 93/93 in both
processes with all ten scorer fields present. It also exercised the frozen shape-retry path. It was
then **destroyed**, and nothing from it entered this package. It is disclosed because it did open
Run-2 observation values locally, ahead of Phase 5, even though it transmitted nothing to any
provider and did not touch the spend predicate.

**2. A defect in this phase's own preservation check.** The first revision compared gate
`threshold` **strings** and failed on G3, G9 and G10. The cause was the check, not a changed
threshold: the pre-declared contract abbreviated those three labels and carried the full condition
in the adjacent `name` field, while the frozen scorer spells them out. The three abbreviations are
now **printed in full** in the evidence, and the substantive thresholds are asserted directly
against the scorer's arithmetic. **The frozen declaration was not edited to make the check pass** —
rewriting a pre-registered declaration to fit a run is the exact failure it exists to prevent.

**3. A procedural error, and a defect in the proof written to disclose it.** The package was
manifested and the scorer was **then** re-run as a final re-verification, rewriting
`ACCEPTANCE_SCORE.json` with a fresh `scoredAt` and breaking the manifest. **The verdict did not
change — only the clock did.** Rather than quietly re-manifest, a determinism proof was added; a
first revision of *that* proof excluded only `scoredAt` and so announced "THE VERDICT MOVED" when
the invocation **path string** varied between a repo-relative and an absolute call. It was corrected
to exclude both environment-dependent fields and to assert the raw-evidence **content** digests
instead.

The durable identity of this result is therefore **not** the file hash:

```
SCORE_BODY_DIGEST = 435f83142bb0cdfb5033e62c53d93fd746f4ee83844751281d068c8316270b7a
```

the whole envelope minus the `scoredAt` clock and the two path strings — **invariant across three
independent scoring runs**, with terminal, scorable, pass, `modelAcceptanceResult`, all ten gate
objects and both raw-evidence content digests identical every time
(`scoring/SCORE_DETERMINISM.txt`).

> **Three instrument defects have now been found and corrected across this and the preceding phase
> by the same pattern:** a check that measured **its own source text or its own invocation
> environment** rather than the thing under test. Each was diagnosed and the check replaced. None
> was silenced, and no finding was waved away.

## Spend — orthogonal to this terminal, and permanent

```
RUN2_HOLDOUT_SPENT = TRUE
GAUNTLET_OFFSET_1  = RETIRED
REALISM_OFFSET_0   = RETIRED
```

Caused by **transmission alone** at `2026-08-25T23:21:08.457Z`, recorded before the first
observation left the runner, and never reverted. Per `D-H` a `FAIL` does not make it more spent and
a `PASS` would not have made it less. The spend timestamp provably **precedes** the score timestamp,
and the scorer carries no field capable of reverting it.

Gauntlet offsets `2` and `3` (74 rows) and realism offsets `1` and `2` (58 rows) remain
**RESERVED**; the 100-row `gauntlet.seed` remains **UNOPENED**. Those are a **different exam, not a
retry of this one.**

## What this result does and does not license

**It means:** on this frozen 93-row corpus, under the frozen prompt, schema, validator, binder and
input builder, `claude-sonnet-5` did not meet seven of the ten pre-registered gates.

**It does not mean** the model is unusable, that a different configuration would fail, or that any
gate was miscalibrated. **No such claim is supported by this run, and none is made.**

> **The corpus must not be re-run, and these 93 observations must not be tuned against.** They are
> burnt. Fitting to them would destroy the value of the remaining reserves — exactly what `D-72`
> forbids.

> **Anthropic is NOT promoted to production by this result, and would not have been by a PASS.**
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`.
> `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`. **L3-3 remains unauthorized.**
> `D-84`'s `G1`–`G10` are **untouched**. `D-79`…`D-99` are **not rewritten**. Run 1 remains
> **INVALID** and `RUN1_MODEL_ACCEPTANCE_RESULT` remains **`NOT_ESTABLISHED`** — this run does not
> retroactively make Run 1 a measurement.
