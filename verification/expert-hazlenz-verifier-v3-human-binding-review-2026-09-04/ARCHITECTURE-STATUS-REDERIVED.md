# Architecture status, re-derived on human-validated dispositions

**§169, 2026-09-05. Zero provider calls. Nothing integrated. §167 not rescored.**

The 12 binding dispositions have been returned by the product owner. This re-derives the §168
component status against them, and records one new defect class the review surfaced.

---

## 1. The human-validated counts

```
HUMAN_VALIDATED_BOUNDED_DEVELOPMENT_COUNTS
```

| | |
|---|---|
| `BINDING_SEMANTICALLY_CORRECT` | **8 / 12** |
| `BINDING_PARTIALLY_CORRECT` | **4 / 12** |
| `BINDING_INCORRECT` | **0 / 12** |
| `BINDING_AMBIGUOUS` | **0 / 12** |
| `affectedDecision` correct | **12 / 12** |
| materially unsupported hazard assumptions | **0** |
| evidence-sufficiency weaknesses (HS-A1) | **3** — VC-08-1, VC-08-4, VC-08-6 |
| temporal-scope weakness (HS-E1) | **1** — VC-04-1 |
| compound acceptable / needing repair / unacceptable | **0 / 0 / 2** — VC-08-2, VC-08-3 |
| owed-target preservation | HS-A1 **6/6** · HS-E1 **6/6** |
| additive nomination on HS-A1 | 5/6 — **not a required axis, not a threshold** |

**Exact counts over 12 draws on 2 rows. Not production accuracy rates and not convertible into any.**

## 2. The distinction that decides how this reads

**Question A — does the clarification ask for the supplied owed fact — is Yes on all twelve.** Zero
bindings were incorrect.

All four partials sit on **question B**: whether an answer would *resolve* the fact.

So the closed-set binding mechanism **selected the right target every time**. The defect the review
found lives one level down, in how much the question demands of the answer. These are separate
findings and are counted separately; the second must not be reported as a binding failure.

## 3. The new defect class

```
CLARIFICATION_EVIDENCE_SUFFICIENCY = REQUIRES_REMEDIATION
```

**Evidence sufficiency (3 draws, HS-A1).** VC-08-1, -4 and -6 offer "visually … verified",
"control-panel status indicator" or "physical inspection" as acceptable evidence alongside a
functional test. Each of those is consistent with a safeguard that is **present and
non-functional**, so an answer citing one would not settle the owed fact. The owner's preferred
formulation is closer to VC-08-5: whether the device's *functional status* has been verified,
preferably by an actual functional test or an authoritative record of one.

**Temporal scope (1 draw, HS-E1).** VC-04-1 asks whether the interlock was "tested and confirmed …
following this morning's return to service", which reads as testing **after** return to service. The
owed fact is whether the protective function was verified **before** it. VC-04-2 through -6 state the
temporal relationship clearly and were marked fully correct.

## 4. An instrument finding, recorded because it is load-bearing

The §167 cue instrument scored **12/12 `TARGET_REACHED`**. Human review found **8/12** fully correct.

This is not a contradiction and **§167 is not rescored** — it is a measured statement of what the
instrument can see:

> **The §162 cue instrument measures TOPIC REACH, not RESOLUTION SUFFICIENCY.**

The instrument and the human agree 12/12 on question A. On question B the instrument is silent *by
construction*: a cue match cannot tell whether the evidence a question demands would actually settle
the fact.

**Consequence for any future claim.** §167's 12/12 may not be read as "12 fully correct bindings".
The supported reading is **12/12 topic reach with 8/12 human-confirmed resolution sufficiency**.

This vindicates the §164 obligation rather than undermining it: binding truthfulness was classified
`REQUIRES_HUMAN_TRUTH` and human sampling of bound pairs was required precisely because an automated
judge would have missed this. The sampling found something the instrument could not.

## 5. Component status, re-derived

| component | §168 status | §169 status | change |
|---|---|---|---|
| `CLOSED_SET_OWED_FACT_LEDGER` | `PROVEN_LOCAL` + `SUPPORTED_HOSTED` | **`SUPPORTED_HUMAN_REVIEWED`** | 0 incorrect bindings; every recorded transition traced to an admitted binding a human confirmed asks the owed fact |
| `EXPLICIT_BINDING_FACT_KEY` | `SUPPORTED_HOSTED`, review open | **`SUPPORTED_HUMAN_REVIEWED`** | target selection confirmed 12/12 by human review, 0 incorrect |
| `ADDITIVE_NOMINATION` (additivity) | `SUPPORTED_HOSTED` | `SUPPORTED_HOSTED` | unchanged |
| additive-gap **discovery** | `REQUIRES_MORE_HUMAN_TRUTH` | **`NOT_CURRENTLY_A_REQUIRED_AXIS`** | resolved by the draw-6 disposition |
| `TARGET_COVERAGE_WARNING` | `PROVEN_LOCAL`; `UNEXERCISED_HOSTED` primary case | unchanged | the primary case still has not occurred hosted |
| `PER_FACT_DECLARATIONS` | `SUPPORTED_HOSTED` | `SUPPORTED_HOSTED` | challenge path still `UNEXERCISED_HOSTED` |
| `CONDITIONAL_SECOND_DRAW_POLICY_C` | `UNEXERCISED_HOSTED` | unchanged | 0 silent draws |
| `DEGENERATE_RETRY_POLICY` | `PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION` | unchanged | 0 degenerate responses |
| `QUESTION_BUDGET` | `REQUIRES_REMEDIATION` | **`REQUIRES_REMEDIATION` — remediation form now fixed** | `STRUCTURAL_PER_FACT_QUESTION_REPRESENTATION` |
| `MULTI_GAP_PRESERVATION` | `SUPPORTED_HOSTED` | **`SUPPORTED_HUMAN_REVIEWED`** | preservation 6/6 on both rows |
| **`CLARIFICATION_EVIDENCE_SUFFICIENCY`** | *(did not exist)* | **`REQUIRES_REMEDIATION`** | **new** — 3 evidence-sufficiency + 1 temporal-scope weakness |

## 6. Two remediations, both specified and neither implemented

### 6a. Question representation — `STRUCTURAL_PER_FACT_QUESTION_REPRESENTATION`

Give each declared fact its own question field in the v3 response schema: a `question` for the
binding and a separate one carried with the nomination. It cannot mis-split, needs no heuristic, and
the nomination is **already** a structurally separate object in the response.

**Prohibited:** a lexical/conjunction parser over model prose as the safety gate. Splitting on
`"and separately,"` is a heuristic on model wording; a mis-split safety question is worse than a
compound one.

### 6b. Evidence sufficiency — the owner's "most important next remediation"

> A binding must ask for evidence that actually establishes the protective function, not merely
> physical presence, visibility, or an indicator that could be mistaken for function.

Two places this could live, and they are not equivalent:

| where | how | assessment |
|---|---|---|
| **owed-fact task state** *(recommended)* | add an `acceptableEvidence` / `whatWouldSettleIt` field to the supplied owed fact, populated by HazLenz — e.g. *"a functional test of loss-of-flame shutdown, or an authoritative record of one; physical presence, visibility or a status indicator does not settle this"* | **HazLenz-owned, does not touch frozen semantic material, and does not ask the model to infer what counts as settling evidence.** The verifier is told, not trusted to know |
| model instruction | add prose to the instruction warning against presence/visibility/indicator evidence | a v4 semantic change to frozen material, needing its own authorization, and it generalises a lesson learned on one hazard family into a global prior |

**Neither is enforceable by contract.** "Does this question demand function-establishing evidence?"
is a semantic judgement, and a deterministic gate for it would be the semantic matcher §160 retired.
The remediation improves what the verifier is *asked*; it cannot be made a hard admission check, and
residual sufficiency remains a human-sampling obligation.

**Not implemented. Either route requires its own authorization.**

## 7. What is now unblocked, and what is not

**Unblocked for inactive development integration** — closed-set ledger, exact factKey binding,
additive-not-substitutive invariant, coverage-warning computation, per-fact declaration parsing,
observability, deterministic state transitions. The §168 gate (no `BINDING_INCORRECT` disposition)
is satisfied: **0 incorrect**. The population boundary remains a hard condition.

**Still blocked:**

- **customer-path activation** — silence-side truth. `HUMAN_AUTHORITATIVE_SILENCE_ROWS = 0`, and the
  five candidates are `NOT_READY_LENGTH_CONFOUNDED`. No precision, specificity, over-questioning or
  customer-burden claim may rest on this architecture.
- **question representation** — structural repair outstanding.
- **evidence sufficiency** — remediation specified, not implemented.
- policy C, the degenerate policy and the challenge path remain `UNEXERCISED_HOSTED`.

## 8. Historical integrity

§167 is not rescored. The 12/12 `TARGET_REACHED` figure stands as what it measured. Everything in
this document is `HUMAN_POSTHOC_ADJUDICATION`, recorded separately, exactly as §168 Phase 1 requires.
