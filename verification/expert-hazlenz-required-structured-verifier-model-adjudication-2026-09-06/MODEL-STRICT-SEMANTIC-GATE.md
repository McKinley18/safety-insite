# §190 — MODEL-ADJUDICATED STRICT SEMANTIC RESULT

> **This is a MODEL-ADJUDICATED result. It is NOT a human strict semantic result.**
> The frozen §189 human semantic gate remains `UNMEASURED / NOT_COMPLETED_BY_A_HUMAN_REVIEWER`
> (`HUMAN_ADJUDICATION_COMPLETENESS = 65 / 112`). The figures below are diagnostic.

Every threshold, floor and denominator below is **read from the frozen §187A preregistration at
scoring time**, never restated, so none can be altered by editing the scorer. The frozen §188 scorer
is byte-unchanged; its hash is recorded in `SOURCE-INTEGRITY.txt`.

---

## Aggregate

```
MODEL STRICT SEMANTIC        9 / 15
threshold                    >= 12 / 15
MODEL-ADJUDICATED VERDICT    FAIL
```

## Per-row floors — gate `>= 2/3`

| row | model | verdict |
|---|---|---|
| HR-01 | 3/3 | **PASS** |
| HR-06 | 3/3 | **PASS** |
| HR-09 | 3/3 | **PASS** |
| HR-04 | 0/3 | **FAIL** |
| HR-08 | 0/3 | **FAIL** |

`per-row floors: FAIL`

## Adjacent-fact substitution — gate `= 0`

```
observed   3   (HR-04 R1, HR-04 R2, HR-04 R3)
verdict    FAIL
```

Confined entirely to HR-04. Zero on HR-01, HR-06, HR-08 and HR-09 — on those rows the responses
actively refuse the adjacent property by name.

## HR-04 sub-gates

```
invalid false-settlement challenge <= 1/3        1 / 3   PASS   (at the ceiling; n = 1)
current-securement target preserved >= 2/3       0 / 3   FAIL
provider output alone leaves fact unresolved     3 / 3   PASS   (mechanical, no adjudication)
categories                                       C, C, C
```

## Challenge reviewability

```
CHALLENGE_REVIEWABILITY_OBSERVED     1 / 1
PREREGISTERED_THRESHOLD_EVALUATION   NOT_MEANINGFULLY_ESTIMABLE
NOT_EXERCISED                        false
gate modified                        no
```

The one challenge is judged **invalid on all three validity axes and REVIEWABLE**. On `n = 1` the
literal gate can only return 0% or 100%; neither is a population proportion. Reported as `x / 1`.

## Treatment of the two contract-refused executions

They remain in the denominator, under the literal preregistered reading: `REJECTED_IS_NOT_SILENCE`
governs the **numerator** and nowhere excludes an observation from the denominator, which the gate
writes literally as `/15`.

Their semantics were judged independently of their refusal:

| execution | contract | model semantics |
|---|---|---|
| `188-HR-01-R3` | **INVALID** | **PRESERVED** — reasoning materially identical to its admitted siblings; the coverage claim it made is correct because the question it bound to is sufficient |
| `188-HR-08-R2` | **INVALID** | **NOT_PRESERVED** — on sufficiency and coverage grounds that an admitted output making the same claim would fail identically |

That HR-01 R3 is *contract-invalid and semantically sound* is the clearest demonstration in the
cohort that the two dimensions are independent, and it is why they are never collapsed.

---

## Every semantic miss

| execution | failing axes | in one line |
|---|---|---|
| HR-04 R1 | preserved, substitution, containment | claims the record *"actively supports current adequacy"* on presence plus a daily guard check the observation does not describe |
| HR-08 R1 | sufficiency | certifies a question whose disjunction admits lockout without proving dead |
| HR-08 R2 | preserved, sufficiency | declares the fact **covered** by that same insufficient question |
| HR-04 R2 | preserved, substitution, containment | states the sheet's scope correctly, then argues from a wider one; inverts the burden to "doubt not raised" |
| HR-08 R3 | sufficiency | same certification as R1 |
| HR-04 R3 | preserved, substitution, containment, challenge correctness / evidence relevance / target relevance | names guard-in-position as *"the operative fact"* for function; challenges the owed fact on that basis |

---

## Sensitivity — disclosed after scoring, never before

Every judgement was fixed before any total was computed. This section exists so the reader can see
how much of the aggregate rests on one contested reading.

**HR-08 is the single most contestable row.** All three of its executions turn on one question:
whether *"locked out (or otherwise verified de-energized)"* is sufficient for an owed fact requiring
**isolated AND proved dead**.

```
as judged (question insufficient)          9 / 15    FAIL
under the permissive reading              12 / 15    PASS on the aggregate threshold
```

**But the permissive reading does not rescue the cohort.** Even at 12/15, HR-04 still stands at 0/3
against a `>= 2/3` per-row floor, and adjacent-fact substitution still stands at 3 against a gate of
0. **The cohort fails at least one frozen semantic gate under either reading of HR-08.** The
contested row moves the aggregate; it does not move the conclusion.

---

## What this result does not license

It is not a semantic pass or fail of record — that requires the human instrument, which is
incomplete. It does not validate verifier-v3, which independently failed the mechanical contract
gate at §187B. It does not establish rates: three replicates on five rows is a small cohort, and
`n = 1` on challenge behaviour is a single observation. It is diagnostic evidence sized for scoping
a bounded remediation, and nothing more.
