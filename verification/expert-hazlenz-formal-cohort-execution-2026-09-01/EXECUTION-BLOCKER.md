# Formal cohort execution — BLOCKED before spend

**Terminal.** `FORMAL_COHORT_NOT_FROZEN — EXECUTION_PRECONDITIONS_UNMET_AT_PRE_SPEND_GATE`

Nothing was spent. `PROVIDER_INVOCATION_COUNT = 0`, `FORMAL_COHORT_SPENT = FALSE`. No hosted call of
any kind was made, including a callability probe.

## Classification

**INFRASTRUCTURE / PREREGISTRATION BLOCK.**

Not `MODEL FAILURE` — no model was asked anything.
Not `EVALUATION INVALIDITY` — no evaluation began, so none can be invalid.

## The finding, in one sentence

The authorization instructs execution of *"the exact already-frozen formal Expert HazLenz evaluation
cohort and its preregistered execution/scoring plan."* **The scoring plan exists and is frozen. The
cohort does not exist.** It has never been assembled or frozen, and the authoritative repository
record has said so continuously since §122.

## What actually exists, and what does not

| required by the authorization | state | evidence |
|---|---|---|
| exact scorer version | **EXISTS** | `hazlenz.expert.scorers.v1` |
| exact scoring gates | **EXISTS** | 12 HARD_GATEs + 5 REPORTED; `assertContractMatchesPlan()` → 0 problems |
| exact prompt version | **EXISTS** | `hazlenz.expert.prompt.v6` |
| exact analysis/output contract | **EXISTS** | `hazlenz.expert.analysis.v2`, validator `hazlenz.expert.validator.v1` |
| exact deterministic → Expert projection path | **EXISTS** | D-131 / §119, on the permanent path |
| exact provider | **EXISTS** | `anthropic` adapter |
| exact model | **NOT FROZEN FOR THIS COHORT** | adapter default `claude-sonnet-5`, overridable by `EXPERT_ANTHROPIC_MODEL`; no cohort-level freeze |
| **exact formal cohort definition** | **DOES NOT EXIST** | the only cohort artifact declares itself `FORMAL_EXPERT_COHORT_CANDIDATE_NOT_FROZEN` |
| **exact cohort / run identifier** | **DOES NOT EXIST** | no cohort id and no run id in any artifact |
| **exact number of planned provider calls** | **DOES NOT EXIST** | not preregistered anywhere |
| **exact cost / call hard cap** | **DOES NOT EXIST** | `callCeiling` / `spendCeilingUsd` are caller-supplied `HarnessOptions` parameters with no frozen value; `COHORT_SIZE_POLICY` states row counts only |

## The only cohort artifact in the repository

`verification/expert-hazlenz-formal-cohort-assembly-2026-08-31/manifest/candidate-rows.json`

```
artifact                        FORMAL_EXPERT_COHORT_CANDIDATE_NOT_FROZEN
rows                            45
rows carrying a gap             0
rows carrying an interaction    0
rows carrying a governed record 0
```

Its own generator writes the reason into the file: *"CANDIDATE ONLY. Not frozen, not named, not
authorized. Semantic truth fields are deliberately empty and governed records are absent."* It is a
§122 artifact and **predates the §127–§129 reviewed semantic corpus entirely** — it does not contain
a single SEM row.

## P4 as frozen, quoted from the authority

`expert-evaluation-plan.ts` (`0b9b273a…`, the §99.7 recovered authority, hash unchanged):

> `P4_PRESPEND_AUTHORIZATION` — *"an explicit owner authorization naming **the cohort, the call count
> and the ceiling**"*
> `blocksIfUnmet`: SAFETY, REGULATORY_INTEGRITY, REASONING_QUALITY, RELIABILITY

The authorization sets the bit to TRUE. The frozen precondition is not a bit — it is a requirement
that the authorization **name three things**, and it names none of them:

- **the cohort** — not nameable; no frozen cohort exists to name
- **the call count** — not stated, and not derivable, because the row set is undetermined
- **the ceiling** — not stated

This is recorded as a finding about the *object* of the authorization, not a dispute with the
owner's decision. The decision to authorize is theirs and is accepted. What is missing is the thing
it authorizes execution of.

## Pre-spend gate

10 bits evaluated. **4 TRUE, 5 FALSE, 1 AMBIGUOUS.**

```
TRUE      SCORER_MATCHES_PREREGISTRATION
TRUE      CORPUS_TRUTH_UNCHANGED
TRUE      PROVIDER_CREDENTIAL_AVAILABLE
TRUE      PROJECTION_ENABLED_IN_EVALUATED_PATH
FALSE     FROZEN_COHORT_EXISTS
FALSE     COHORT_RUN_IDENTIFIER_PREREGISTERED
FALSE     CALL_AND_COST_CAP_PREREGISTERED
FALSE     P4_PRESPEND_AUTHORIZATION_COMPLETE
FALSE     COMPOSITION_SUPPLY_SUFFICIENT
AMBIGUOUS MODEL_CALLABLE_WITHOUT_SPENDING_COHORT
```

The authorization's own instruction governs: *"If any required bit is FALSE or ambiguous: DO NOT
SPEND THE COHORT. Return BLOCKED with the exact reason."*

## Composition supply, re-measured with the reviewed corpus included

Per-class **upper bounds**, computed independently. A real ≤60-row selection must satisfy every class
*simultaneously* within the same rows, so achievable ≤ these. That makes a BLOCKED conclusion robust.

| class | required | supply | verdict |
|---|---|---|---|
| GOVERNED_RECORD_SUPPLIED | 40 | 0 | **BLOCKED — short 40** |
| NO_GOVERNED_RECORD | 8 | 60 | ok |
| CLARIFICATION_NOT_OWED | 14 | 50 | ok |
| **CLARIFICATION_OWED** | 20 | **25** | **ok — closed by §127–§129** |
| FORBIDDEN_FAMILY_NEGATIVE_CONTROL | 48 | 44 | **BLOCKED — short 4** |
| LIFE_CRITICAL_PRESENT | 10 | 72 | ok |
| **CROSS_HAZARD_INTERACTION** | 10 | **17** | **ok — closed by §127–§129** |
| DETERMINISTIC_MISS_RECALL_OPPORTUNITY | 10 | 45 | ok |
| MULTI_HAZARD | 12 | 61 | ok |
| NEGATED_OR_SAFE_STATE | 10 | 45 | ok |
| DISAGREEMENT_OPPORTUNITY | 6 | 0 | **BLOCKED — short 6** |
| DETERMINISTIC_HAZARD_PRESENT | 30 | 113 | ok |

**The good news is real: the two classes that blocked the cohort at §126 are now closed.**
`CLARIFICATION_OWED` 3 → 25 and `CROSS_HAZARD_INTERACTION` 5 → 17. The reviewed semantic corpus did
exactly what it was authored to do.

**Three classes are short, and they are not all the same kind of problem.**

1. **`GOVERNED_RECORD_SUPPLIED` (0 / 40) and `DISAGREEMENT_OPPORTUNITY` (0 / 6) are a WIRING gap,
   not an impossibility.** The 64 record payloads exist and the owner already produced a read-only
   snapshot of them, reconciled in §126 (snapshot `a2c5dc32…`, manifest `680540d9…`); that snapshot
   carries `approvedText` and `reviewState`. It sits outside the repository at the owner's choice and
   is not part of any cohort artifact, and this operation's authorization does not extend to it. The
   in-repo release definition (`federal-core-2026-08-28.1.json`) carries `citationKey` and `citation`
   only, and `GovernedStandardView` needs `{ citation, title, approvedText, backingState }`. Counted
   as 0 because a class is supplied by what a **frozen cohort row carries**, and no cohort row carries
   a governed record. All 64 are `mechanically_validated → UNAPPROVED_RECORD`, so attaching them
   would satisfy both classes at once — while leaving `REVIEWER_APPROVED_GOVERNED_RECORDS = 0` and
   the M07 approved-text axis unexercised, a limitation already on record.

2. **`FORBIDDEN_FAMILY_NEGATIVE_CONTROL` (44 / 48) is a genuine supply shortfall.** §124's label
   metadata puts +16 capability in gauntlet offsets 2 and 3, which would take it to 60 — but those
   are RESERVED, open-once, and opening them is its own authorization. They remain unopened.

None of this is a reason to spend the cohort now; all of it is what the next decision needs.

## Confinement

```
PROVIDER_INVOCATION_COUNT = 0
FORMAL_COHORT_SPENT       = FALSE
RESERVED_MATERIAL_OPENED  = FALSE
PRODUCTION_ACCESS         = FALSE
DATABASE_ACCESS           = FALSE
DEPLOYMENT                = FALSE
COMMIT / PUSH / TAG       = FALSE
```

No corpus truth, prompt, schema, scorer, normalizer, projection, routing rule, grounding
implementation, threshold or gate was modified. The reviewed semantic corpus is byte-identical:
manifest `6a2c564c…`, truth keys `2e4377ea…`, provenance `16b76f48…`.

## What would unblock execution

Stated as options, with no number proposed for anything frozen.

1. **Assemble and freeze the cohort** from the now-sufficient semantic classes, then issue a P4
   authorization that names the cohort identifier, the call count and the ceiling. This requires
   first resolving how governed records reach cohort rows, and resolving
   `FORBIDDEN_FAMILY_NEGATIVE_CONTROL`.
2. **Open gauntlet offsets 2 and 3** under a separate authorization, closing the negative-control
   shortfall. Open-once and irreversible.
3. **Freeze a smaller measured scope** that does not claim the classes it cannot supply, accepting
   that a HARD_GATE with zero opportunity is UNMEASURED and UNMEASURED **FAILS** — the gate fails
   honestly rather than passing on absent evidence.

What is not available is executing a cohort that does not exist.
