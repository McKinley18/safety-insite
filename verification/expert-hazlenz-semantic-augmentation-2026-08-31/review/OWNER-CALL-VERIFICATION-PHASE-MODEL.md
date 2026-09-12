# Owner call — the verification-phase model defect, and its repair

## The classification

The product owner classified the stage-7 blocker as:

```
VERIFICATION_PHASE_MODEL_DEFECT     not     CORPUS_SEMANTIC_FAILURE
```

The reviewed corpus was **accepted as semantically applied**. What failed was the validator, which
was built to seal a pre-review candidate corpus and had no representation of any later phase.

## The defect, precisely

`validate-semantic-augmentation.ts` asserted `CANDIDATE_TARGETS` — 26 clarifications, 14
interactions — as if they were the corpus's acceptance criteria. The frozen construction policy says
they are not:

> *"Candidate-authoring targets carry margin ABOVE the frozen minimums so that independent review can
> reject determinations without immediately re-blocking the cohort. THESE ARE NOT THE FROZEN MINIMUMS
> AND DO NOT CHANGE THEM."*

They measure a property of the **authoring** exercise: did the author leave enough margin for review
to reject material. Review then spent exactly that margin — 5 clarifications and 3 interactions
withdrawn, 2 interactions promoted, 2 unrecordable against a frozen vocabulary. Once any material is
withdrawn those assertions are arithmetically unsatisfiable, so a single-phase validator can only
ever report a reviewed corpus as failed.

## What was authorized, and what was not

Authorized: add an explicit verification-phase distinction.

**Not** authorized, and **not** done:

- `CANDIDATE_TARGETS` was not lowered, deleted, renamed or replaced with reviewed counts.
- `POLICY-FREEZE.txt` was not edited. The construction policy file hash is byte-identical to the
  frozen effective hash: `c7dc1c682ccde56e54e4259632154b7ba364012e51d6c646e9173648355ebe4f`.
- No scorer, threshold, disposition, assertion or measurement-contract field was weakened.
- No rejected semantic truth was restored; no row, gap, interaction or control was invented.
- Row truth was not touched. The corpus module hash is unchanged at
  `a6c9a36f1d85db5fd25819f5fd1e764055cc486d85f226aa6c7a26388568a3fa`.

## The architecture

```
PRE_REVIEW_CANDIDATE     F.1  CLARIFICATION_OWED       >= 26   (frozen candidate-authoring target)
                         F.2  CROSS_HAZARD_INTERACTION >= 14   (frozen candidate-authoring target)

POST_HUMAN_REVIEW        F.1R countable clarification  >= 20   (frozen cohort minimum)
                         F.2R countable interaction    >= 10   (frozen cohort minimum)
                         F.6 … F.13  reconciliation of the review record against the fixture

BOTH                     F.3  CLARIFICATION_NOT_OWED controls exist
                         F.4  interaction-negative controls exist
                         F.5  the policy's stated minimums equal REQUIRED_CLASS_MINIMUMS
```

Sections A–E and G–J are phase-independent and run identically in both phases. `POST_HUMAN_REVIEW`
runs **more** composition gates than `PRE_REVIEW_CANDIDATE` (13 against 5), not fewer.

Phase is selected by an explicit `--phase` argument, or — with no argument — by the **declared**
corpus lifecycle state in `lib/expert-semantic-augmentation-review-record.ts`. An unrecognised phase
is a hard error. Phase is never inferred from counts: a validator that guessed "these counts look
post-review" could be defeated by withdrawing material.

## Mechanical counts versus countable cases

These are different quantities and the post-review contract needs both.

| | clarification | interaction |
|---|---|---|
| authored | 27 OWED | 14 PRESENT |
| withdrawn by review | 5 | 3 |
| promoted by review | — | 2 |
| removed for a frozen-vocabulary gap | — | 1 (SEM-35) |
| **mechanically present in the fixture** | **22** | **12** |
| independently authorized elsewhere (§126) | 3 | 5 |
| **countable reviewed cases** | **25** | **17** |
| frozen minimum | 20 | 10 |
| **margin** | **+5** | **+7** |

The independently authorized 3 and 5 are measured in
`../../expert-hazlenz-formal-cohort-final-assembly-2026-08-31/proofs/max-achievable-composition.txt`
and live in other corpora. They are referenced, not duplicated into row truth.

Two interactions the reviewer holds to be genuinely PRESENT — SEM-09 and SEM-35 — are recorded
nowhere and counted nowhere, because no frozen interaction kind names their mechanism. Gate F.10
fails if either is ever counted as a mechanically recorded interaction.

## Why the review metadata can be trusted

It is not trusted. It is reconciled. `postHumanReviewGates` checks the review record's row sets
against the applied fixture row-for-row (F.6, F.7), checks both ledgers close (F.8, F.9), checks
withdrawn material is genuinely absent (F.11), and checks the owner's declared totals equal the
totals derived from the fixture (F.12). The regression proves each of those gates fails when the
record is inflated by a single row.

## Seal status

| | |
|---|---|
| was | `CANDIDATE -- SEALED, AWAITING INDEPENDENT PRODUCT-OWNER SAFETY REVIEW` |
| now | `REVIEWED -- HUMAN ADJUDICATION COMPLETE, SEALED, FORMAL EVALUATION UNSPENT` |

The old string was stale: the independent review is complete, every adjudication is applied, and the
corpus has been re-sealed since. Status is no longer a free string — it is a phase-keyed vocabulary,
so it cannot drift away from the phase actually validated. The seal also carries
`statusDoesNotImply`, stating in the artifact itself that no cohort has been run, no provider has
validated anything, and no customer or production authorization exists.

The sealed **identifier** still ends in `_CANDIDATE`. That string is the frozen name of the corpus
and every prior artifact references it, so it was left alone; lifecycle is carried by
`corpusLifecycleState`, not by the identifier.

A run under the non-governing phase reports its result and **does not** write the seal, so a
diagnostic cannot overwrite the seal with a status that does not describe the corpus.

## SEM-08 life-critical overlay

Accepted as a contract-consequential application effect. `chemical_exposure` moved PRESENT →
DEFENSIBLE under review; `validateCohortRow` raises `LIFE_CRITICAL_NOT_PRESENT` for any life-critical
family that is not PRESENT, so retaining it would have produced an internally invalid row.
`lifeCriticalHazardFamilies` is `['confined_space']`. It is recorded in the review record's
`contractConsequentialEffects`, not as an independent new semantic verdict, and `chemical_exposure`
was not restored.

## Confinement

```
PROVIDER_INVOCATION_COUNT   = 0
RESERVED_MATERIAL_OPENED    = FALSE
FORMAL_COHORT_SPENT         = FALSE
P4_PRESPEND_AUTHORIZATION   = FALSE
PRODUCTION_ACCESS           = FALSE
DATABASE_ACCESS             = FALSE
```

## Terminal

`SEMANTIC_AUGMENTATION_POST_HUMAN_REVIEW_VALIDATED — FORMAL_EVALUATION_COHORT_AUTHORIZATION_DECISION_REQUIRED`
