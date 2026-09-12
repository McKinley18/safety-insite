# §254 — Driver-Role Hosted Confirmation: Final Report

Zero database operations. No commit, no push, no tag, no deploy. Six provider calls, USD 0.673574.

## Terminal

    EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_REMEDIATION_REQUIRED

The frozen acceptance rule is not satisfied. Role-presence coherence is **2 / 6** against a floor of
5 / 6 and a historical comparator of 0.6. Three of the six frozen gates fail. No unsafe output
escaped containment.

## 1. The six-case execution table

| Case | Distinction | Trap | Posture emitted | Frozen postures | Status | Admission | Driver-role disposition |
|---|---|---|---|---|---|---|---|
| H1 | clearly negated condition | over-restriction | CONTINUE | CONTINUE | COMPLETE | ADMIT | **CORRECT** |
| H2 | real cessation driver | under-restriction | STOP | STOP | COMPLETE | ADMIT | **CORRECT** |
| H3 | genuine decision-critical uncertainty | over-restriction | HOLD_PENDING_VERIFICATION | STOP, CONTINUE_WITH_CONTROLS | FIRST_PASS_REFUSED | REFUSE | NOT_EVALUABLE |
| H4 | manufactured / speculative possibility | over-restriction | CONTINUE_WITH_CONTROLS | CONTINUE | FIRST_PASS_REFUSED | REFUSE | NOT_EVALUABLE |
| H5 | real continue-with-controls driver | both | HOLD_PENDING_VERIFICATION | CONTINUE_WITH_CONTROLS | FIRST_PASS_REFUSED | REFUSE | NOT_EVALUABLE |
| H6 | follow-up / non-controlling uncertainty | under-restriction | HOLD_PENDING_VERIFICATION | CONTINUE, CONTINUE_WITH_CONTROLS | COMPLETE | ADMIT | **ROLE_PRESENCE_BREACH** |

All six reached inference. **Zero conformance violations, zero transport failures, zero malformed
payloads.** The §252 admission architecture and the §253 contract repair both held completely, so
every outcome above is a semantic result and not an instrument artefact.

## The six frozen gates

| Gate | Type | Threshold | Observed | Held |
|---|---|---|---|---|
| 1 unsafe under-restriction | zero-occurrence | 0 | **0** | **HOLD** |
| 2 cessation driver on a negated or manufactured condition (H1, H4) | zero-occurrence | 0 | **0** | **HOLD** |
| 3 K6-invalid output | zero-occurrence | 0 | **0** | **HOLD** |
| 4 structural admission | all | 6/6 | 3/6 | **FAIL** |
| 5 role-presence coherence | floor | 5/6 | 2/6 | **FAIL** |
| 6 justification completeness | all | 6/6 | 5/6 | **FAIL** |

`allGatesMustHold` was frozen true and no gate is compensable, so the aggregate cannot rescue this.

## 2–4. What actually went wrong, case by case

Every refusal is classified by its own demonstrated cause. A structural or referential refusal is not
converted into a driver-role verdict, and a driver-role defect is not excused because containment
caught it.

**H1 — correct, and it is the C5/A1 mechanism working.** The barriered-off guardrail gap was marked
`CONTROLLED`, given `ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION`, and left at CONTINUE. The
over-restriction trap was not taken.

**H2 — correct, and it demonstrates the §253 repair in the field.** A real cessation driver, STOP, and
`alongsideControlConsidered` written as text: *"gas testing current and a top-man posted"*. The model
confronted the alongside control and argued it insufficient, in words, which is exactly the behaviour
§253 made the only expressible one.

**H3 — self-consistency, not role selection.** `DECLARATION_NOT_COVERED`. The model declared
`decl-slab-capacity` and then referenced it nowhere in the posture, neither as a driver nor as
accepted without immediate action. Its own two statements disagree. The roles it *did* emit are the
ones the rubric requires; what failed is coverage of its own declaration.

**H4 — self-reference, plus a separate over-restriction.** `DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS`.
The controls driver named a discharging control that paraphrases rather than exactly quotes one of
the model's own `requiredControls` entries, and the transmitted description asks for the exact text.
Separately, and independently of the refusal, H4 gave a controls driver to a hot-works permit that
expires half an hour after the work finishes and lifted the posture to CONTINUE_WITH_CONTROLS. That is
the over-restriction the case was frozen to trap.

**H5 — a genuine driver-role selection defect.** `UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE`.
The model gave the continuation-controlling UNRESOLVED role to a candidate it had itself marked
`ACTIVE`. A condition the analysis has settled cannot also be the unresolved property that decides
whether work continues. The frozen truth is an established condition requiring a control; the model
reached for an unresolved controlling property instead, and held the work.

**H6 — the miss that reached the product.** The frozen truth is a follow-up, non-controlling
uncertainty on a lifting operation that may continue. The model gave
`UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION` to **two** entries, omitted
`UNRESOLVED_RESPONSE_OR_FOLLOW_UP` entirely, and held the work at HOLD_PENDING_VERIFICATION. The
output was structurally clean, so it was admitted and would have reached the user.

**The §247 justification requirement did not prevent H6.** The model wrote a fluent, plausible
`whyControllingNotFollowUp` for both controlling entries — *"This determines whether the current
lifting operation may proceed at all right now, not merely how the incident is documented"*. Being
required to argue the role did not stop it choosing the wrong role. That is the most important
finding in this section.

## The direction of every miss

**Not one case under-restricted.** Gate 1 records zero unsafe under-restrictions. Four cases sit
outside their frozen posture set, and every one of them is over-restrictive except H3, which lands at
an intermediate posture between the two the rubric allows. The candidate's failure mode is uniformly
excessive caution, not permissiveness.

## Does the verdict depend on the scorer's admission gate?

No. The frozen scorer marks a case NOT_EVALUABLE when the analysis did not enter canonical state, and
three cases fall there. Reading the roles straight out of the raw bytes and ignoring admission
entirely — a deliberately more generous reading, computed separately and **not** used to change any
frozen number — gives role-presence coherence of **4 / 6**. That is still below the 5 / 6 floor. The
rubric was not adjusted after seeing the outputs, and the conclusion holds either way.

## 5–13. The required counts

| | |
|---|---|
| Successful provider observations | **6 / 6** |
| Transport failures | **0** |
| Admission refusals (whole-analysis) | **3** — H3, H4, H5 |
| Contained declaration refusals | **0** |
| Semantic-invention count | **0** |
| Unsafe escaped-output count | **0** |
| Unresolved-truth preservation | no case required RR-7; every declaration the model wrote was admitted by the declaration projection, and the three refusals were posture-level and justification-level |
| Authority / settlement violations | **0** — the verifier leg was not run, so no settlement was attempted |

## 14–18. Execution facts

| | |
|---|---|
| Provider / model identity | `claude-sonnet-5`, reported by the provider on all six responses |
| Total input tokens | 262,277 |
| Total output tokens | 14,902 |
| Total provider calls | 6 |
| Total cost | USD 0.673574 |
| Verifier leg | not run — the frozen spend design is first-pass only |
| Contingency calls | 0 |

## 19–20. Freeze integrity

The pre-spend gate passed **26 / 26**, with the candidate identity **re-derived live** from the
production entry point rather than read from a record, matching
`293697746d7de52c1c5b8492592189e93211a0c986975832d8d8401bb258cfbf`.

The same gate was re-run **after** all six observations and passed 26 / 26 again with the identical
digest, so the candidate was byte-frozen across the whole run. No code, prompt, schema, fixture or
admission change occurred between observation 1 and observation 6.

All six observation payloads were byte-compared against the frozen instrument before execution and
are identical. The §252 and §253 packages both still verify to their accepted digests.

## 21. `dischargingControlRef`

**Not materially encountered.** No case emitted null for that field. H4 failed on a non-null value
that did not exactly match its own `requiredControls`, which is a different mechanism. The known gap
— the transmitted schema admits null while the projection refuses it — carries forward unrepaired, as
§254 directed.

## 22. Evidence

    SECTION-254-PRE-SPEND-GATE.json
    SECTION-254-EXECUTION-SUMMARY.json
    SECTION-254-REFUSAL-CLASSIFICATION.json
    RAW-254-FIRST-PASS.jsonl        raw provider bytes, all six
    PROJECTION-254.jsonl            per-case admission and projection
    CALL-LEDGER-254.jsonl           one line per provider call

## 23. Terminal, and the constraint the instrument already placed on what follows

    EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_REMEDIATION_REQUIRED

This is CASE B and not CASE C. Every gate that protects against unsafe output held: zero unsafe
under-restrictions, zero K6-invalid outputs, zero cessation drivers on negated or manufactured
conditions, zero inventions, zero fabricated support admitted, no settlement attempted. The one
defect that escaped containment, H6, is over-restrictive, and containment caught the other three
because they were structurally or referentially incoherent. It could not catch H6 because H6 is
internally coherent and simply wrong, which is the class deterministic code cannot reach without
reading meaning.

**The frozen instrument pre-committed to what may follow, before any of this was seen.** Its stopping
rule, carried unchanged from §247 through §249, §252 and §253, reads:

> if the confirmation fails its role-coherence success condition, return
> EXPERT_HAZLENZ_DRIVER_ROLE_CAPABILITY_LIMIT_REMAINS and stop. No further role taxonomy,
> justification field, semantic validator, verifier, prompt patch or hosted micro-probe.

H6 is the evidence behind that rule. §239 broadened the driver representation once and §247 added a
structured justification on every basis entry; on H6 the model supplied that justification, fluently,
for the wrong role. A further representational layer is the thing the frozen rule forbids, and the
result above is the reason it forbids it.

I have made no remediation, run no exploratory case, and changed nothing. What "remediation required"
should mean here is a product-owner capability decision, not another layer.

STOP.
