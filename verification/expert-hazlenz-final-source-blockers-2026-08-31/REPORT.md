# EXPERT HAZLENZ — FINAL FORMAL-COHORT SOURCE BLOCKERS (2026-08-31)

**Terminal: `EXPERT_HAZLENZ_FORMAL_COHORT_ASSEMBLY_BLOCKED — AUGMENTATION_MATERIAL_RETIRED_AND_COVERAGE_STILL_INSUFFICIENT`.**

Predecessor: §123. HEAD `37a5d1b5`, unmoved. **Provider calls 0. `PROVIDER_INVOCATION_COUNT = 0`.
$0.00. No production mutation. No reserved material opened. No source file changed.
`FORMAL_COHORT_SPENT = FALSE`.**

**The mandatory pre-open identity check fired, and it changes the answer.** The augmentation route
§123 proposed does not exist, and the negative-control ceiling is lower than §123 reported.

---

## 1–2. Offset identity reconciliation — **COLLISION CONFIRMED**

The authoritative partition rule is blueprint decision-log **D-86**, not the `i % 5` §123 assumed:

> `gauntlet.source.v1`: sort `scenarioId` by `CMP` (UTF-8 byte-wise ascending, no case folding, no
> collation, no normalization) · 0-based index · **`m = 4`** · `i % 4 === k` ·
> `k = parseInt(sha256.slice(-8),16) % 4` = `parseInt("22f0adb4",16) % 4` = **0** → **38 rows**;
> partitions **38/38/37/37**; reservation `0`→`1`→`2`→`3`, **immutable, never reassignable**.

Reproduced this phase against the live file: sha256 `a95e5480…22f0adb4`, `k = 0`, partition sizes
**38/38/37/37** — an exact match with D-86. The stride implementation is verified, not assumed.

| offset | rows | neg-control capable | status |
|---|---|---|---|
| **`GAUNTLET_OFFSET_0`** | 38 | 12 | **RETIRED** — §61, Run 1 sealed acceptance |
| **`GAUNTLET_OFFSET_1`** | 38 | 13 | **RETIRED** — Run 2 sealed acceptance |
| `GAUNTLET_OFFSET_2` | 37 | 8 | RESERVED |
| `GAUNTLET_OFFSET_3` | 37 | 8 | RESERVED |
| `GAUNTLET_OFFSET_4` | — | — | **DOES NOT EXIST** — the partition is four-way |

**Offset 0 collides with retired material.** Blueprint §61 header:
`HOLDOUT_SPENT = TRUE · GAUNTLET_OFFSET_0 = RETIRED · REALISM_OFFSET_3 = RETIRED`, terminal
`L3_ACCEPTANCE_INVALID — PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND` — the corpus was spent and the
measurement was not obtained. The governing rule is explicit: *"A FAILED ACCEPTANCE RUN SPENDS THE
STRIDE. IT DOES NOT RETURN IT… The opened stride is retired permanently; it never becomes a
development, tuning or regression set."*

**`RETIRED = RETIRED`. Offset 0 was not reopened and not redesignated.** Offset 4 could not be
designated because it does not exist.

### §123's error, corrected plainly

§123 reported offsets as `i % 5` over the file's natural order, giving five offsets, with 0 and 4
"in neither the closed nor the reserved list" and holding 15 capable rows toward a total of 60. That
was wrong four ways: **wrong modulus** (4, not 5), **wrong order** (D-86 requires a scenarioId sort
first), **wrong designation** (offset 0 is retired, not undesignated), and **non-existent material**
(there is no offset 4). The corrected ceiling is **43**, not 45, and the 60-row route does not exist.

### A frozen artifact under-reports retirements

`EVALUATION_CORPUS_POLICY.closed` in `expert-evaluation-plan.ts` lists only `GAUNTLET_OFFSET_1` and
`REALISM_OFFSET_0`. It **omits `GAUNTLET_OFFSET_0` and `REALISM_OFFSET_3`**, both retired by Run 1 in
§61. That incompleteness is what invited §123's error. **The plan file was not modified** — it is a
frozen authority and `test:expert-nocall-harness` asserts `closed.length === 4`; the blueprint's own
§61 record is treated as authoritative over the summary list. Correcting the list needs its own
authorization, and it should be taken.

## 3–5. Augmentation designation, material opened, material preserved

**No `FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1` designation was created**, and therefore it has
no hash. The designation was authorized for "previously undesignated source-pool material"; under the
correct four-way partition **no such material exists** — all four offsets are designated (two retired,
two reserved).

**Offsets actually opened this phase: NONE.** **Material deliberately left unopened:**
`GAUNTLET_OFFSET_2`, `GAUNTLET_OFFSET_3`, realism offsets 1 and 2.

**Why nothing was opened.** Minimum-exposure sequencing exists to expose the least new material
necessary. Metadata already proves the end state with offsets 2 and 3 **fully counted** is **43** —
still below 48. Opening them would spend two single-use reserved offsets, still miss the requirement,
and leave the cohort unfreezable *and* the reserve burned. That is precisely §61's outcome: *"the
corpus is spent, the measurement was not obtained."* The count is identical whether measured from
labels or after opening, so opening buys nothing.

## 6. Open-once compliance

Only `gauntlet.seed` has ever been opened (§122), unchanged at `49aa40fd…`. All three reserved
corpora are byte-identical to their pre-open records: `49aa40fd…`, `a95e5480…`, `6f6897f1…`.

## 7–8. Negative-control count

| step | source | capable | running total |
|---|---|---|---|
| established | `gauntlet.seed` (opened §122) | 14 | 14 |
| established | precision corpus Population A | 13 | **27** |
| step 1 | `GAUNTLET_OFFSET_2` (reserved) | 8 | 35 |
| step 1 | `GAUNTLET_OFFSET_3` (reserved) | 8 | **43** |
| step 2 | *offset 4* | — | **does not exist** |
| step 3 | `GAUNTLET_OFFSET_0` | 12 | **RETIRED — unavailable** |
| | realism offsets 1 and 2 | 0 | 43 |

**`NEGATIVE_CONTROL_OPPORTUNITIES = 43 < 48`. Shortfall 5.**

The only material that would close it — offsets 0 and 1, holding 12 and 13 capable rows — is
**permanently retired** by two spent Level-3 acceptance runs.

Realism contributes **0** structurally: the pack has **no hazard-family field at all** (its columns
are `employeeExposureKnown`, `equipmentInvolved`, `expectedTerms`, `forbiddenTerms`,
`hazardObservation`, `id`, `industryContext`, `photosAvailable`, `shouldHaveMissingEvidence`,
`siteType`, `taskContext`, `title`). Its rows cannot be Expert-taxonomy-eligible without authoring
family truth from observations, which the frozen truth rules forbid. Left unopened, as instructed.

**No forbidden-family truth was fabricated. `toExpertFamily` was not widened. 48 was not
reinterpreted.**

## 9–13. Governed release extraction

**Not executed and not reconciled.** Part B authorizes the *product owner* to run
`governed/READ-ONLY-EXTRACTION-RUNBOOK.md` in their own Terminal; **no sanitized output has been
provided to me**, so there is nothing to reconcile. I therefore report **no** release identity,
status, checksum, record count, snapshot hash or governed-record coverage.
`GOVERNED_RECORD_SUPPLIED = 0`.

The runbook was re-verified and stands as written. Production read-only posture must be established
*by that execution*; the local `SQLSTATE 25006` proof remains useful mechanical evidence only, and
the runbook's Step 1 is what captures the actual production session posture. The production
credential was not requested and was not handled.

**Note for sequencing:** running it now gains nothing, because Part D requires **both** blockers
closed and the negative-control blocker is not closable from any authorized non-retired material.

## 14–25. Reassembly, composition, dry run, freeze, P4

**None executed.** Part D is conditional on both blockers closing. Consequently there is no eligible
pool, no 60-row selection, no M01–M17 composition coverage, no M10 zero-owed count, no truth
provenance summary, no fresh truth-leak or dry-run result beyond §122's (which stands: 45 rows, 135
requests constructed, 0 sent, `TRUTH_LEAK = 0`).

**`FORMAL_EXPERT_COHORT_V1` was NOT frozen. No identifier was claimed. No cohort, truth-key or
provenance hashes exist. No P4 block is returned** — Part H is conditional on the freeze.
§122's measured spend figures stand unchanged: $5.51–$5.72 at 180 calls, conservative maximum
$22.88, $25.00 sufficient.

## 26. Remaining blockers and debt

1. **Negative control 43 < 48, and the shortfall is unclosable from authorized non-retired
   material.** This is now a corpus-augmentation problem requiring genuinely new source material, not
   an offset designation.
2. **Governed records 0 < 40** — awaiting your runbook execution.
3. `EVALUATION_CORPUS_POLICY.closed` under-reports two retired items — needs its own authorization to
   amend, together with the protected `closed.length === 4` assertion.
4. `PLANNED_FUTURE_REPRESENTATION_DEBT = TRUE`.
5. `LOCAL_R2_EVIDENCE_CLIFF_DEBT_OPEN = TRUE` — untouched.
6. Carried: `M02`/`M07`/`M09` denominators model-output-dependent; `P2_DETERMINISTIC_CONTROL = ABSENT`;
   extraction pattern-based; `CONTRADICTS_DETERMINISTIC` not authoritative.

## 27. Readiness bits

```
NEGATIVE_CONTROL_OPPORTUNITIES  = 43  (>= 48 required)   FAIL
GOVERNED_RECORD_SUPPLIED        = 0   (>= 40 required)   FAIL
FORMAL_COHORT_ROW_COUNT         = 45  (target 60)         FAIL
FORMAL_COHORT_COMPOSITION_VALID = FALSE                   FAIL
TRUTH_KEYS_FROZEN               = FALSE
AUGMENTATION_DESIGNATED         = FALSE (no undesignated material exists)
OFFSET_0_RETIREMENT_COLLISION   = TRUE
ADJUDICATION_RUBRIC_FROZEN      = TRUE
CONDITION_MAPPINGS_FROZEN       = TRUE
CONSTRUCTOR_DRIFT               = NONE  (72dab946… unchanged)
TRUTH_LEAK                      = 0
PROVIDER_INVOCATION_COUNT       = 0
FORMAL_COHORT_SPENT             = FALSE
P4_PRESPEND_AUTHORIZATION       = FALSE
PROVIDER_VALIDATED              = FALSE
CUSTOMER_ACTIVE                 = FALSE
```

## 28. Worktree

HEAD `37a5d1b5`, 1 ahead of `origin/main`, 0 staged, 14 tracked modified, 4 stashes, 24 tags — all
preserved. **No source file changed this phase.** All ten frozen artifacts re-verified at their
recorded hashes, including the constructor at `72dab946…`. Regression: **56 / 51 / 131 / 141 / 58 /
88 / 40 / 30**, instrument **155/0**, quarantine **61/0** and **37/0**, precision PASS with 0
dangerous and 0 life-critical omissions, `tsc` exit 0. No commit, push, tag, deploy or production
mutation.

---

## The decision this leaves you

The negative-control requirement cannot be met by designating offsets, because there are none left to
designate. The realistic options are:

1. **Author genuinely new formal negative-control material** under a governed construction phase —
   the corpus policy's own rule for this situation, and the only route that keeps 48 intact.
2. **Amend the frozen requirement** from 48 with a stated rationale — a governance act, and one this
   operation was explicitly forbidden to take on its own.
3. **Accept a smaller cohort** with `M02` measured on a coarser denominator — which changes what the
   evaluation can conclude and is likewise yours to decide.

I have not taken any of them.
