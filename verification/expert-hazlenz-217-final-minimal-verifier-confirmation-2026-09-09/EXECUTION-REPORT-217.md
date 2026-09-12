# §217 — FINAL MINIMAL VERIFIER CONFIRMATION: EXECUTION REPORT

**Scope executed.** Phase A zero provider calls. Phase B four verifier calls, the exact authorized
maximum. Database operations 0. No retries, no second draws, no rescue calls, no alternate model, no
first-pass calls, no governed-stage calls. No remediation. No customer or production activation. No
commit, push, tag or deploy.

**Terminal reached.**

```
EXPERT_HAZLENZ_STANDALONE_VERIFIER_VALIDATION_BLOCKED —
PRODUCT_OWNER_ARCHITECTURE_DECISION_REQUIRED
```

One Class A failure exists. Per the §216 stopping rule, **no prompt remediation was written and none
is proposed.**

---

## 1. FROZEN DIGEST

```
99f9f6b82842cb0ad4c0e1ea78418af3606dc4dcadde353699ed8d18998fa2a4
```

Frozen in Phase A after 43/43 validation with zero provider calls, and verified by the executor's
preflight before transmission. The four planned user-prompt identities and four fact keys matched the
freeze.

| Recorded identity | |
|---|---|
| Instruction | `hazlenz.expert.216.disposition-and-property-remediation`, `ef95e903a2f204cd…` |
| Tool schema | `571dadaf51751e39…` |
| Payload assembler | `hazlenz.expert.212.verifier-payload.v1` |
| Sibling-scope rule | `hazlenz.expert.214.scope-containment.v1`, `244d35812b046d58…` |
| §216 structural checker | `hazlenz.expert.216.disposition-closure.v1` |

One instruction identity and one schema identity across all four calls. The §216 structural closure
was re-verified at freeze time and held.

## 2. THE FOUR CASES

| | Mechanism | Setting | Required |
|---|---|---|---|
| K1 | evidence proxy for a latent state | poultry unit standby generator | challenge |
| K2 | wrong property with a **good** bound question | leisure centre pool plant | challenge |
| K3 | legitimate act-as-property | gas terminal shift handover | leave alone |
| K4 | two independent facts | materials recovery facility | leave alone, no nomination |

Four new settings, four industries. No §215, §213 or §216 setting reused, checked mechanically.

**The set is non-degenerate in both directions.** Two cases must be challenged and two must be left
alone, so challenging everything scores 2 of 4 and challenging nothing scores 2 of 4.

## 3. CALL ALLOCATION

One per case, four total, exactly as authorized.

## 4. CALLS AND TRANSPORT

| | |
|---|---:|
| Authorized | 4 |
| Attempted | **4** |
| Reaching inference | **4** |
| Transport failures | **0** |
| Retries | 0 |

## 5. DETERMINISTIC REFUSALS

**One**, on K4: `NOMINATION_OUTSIDE_TARGET_SCOPE` with
`SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE` and
`CLARIFICATION_BOUND_TO_A_NOMINATION_OUTSIDE_SCOPE`. Raw output preserved, refusal recorded, scored
against frozen truth. Nothing repaired, nothing rerun. Vocabulary admission clean on all four.

## 6. RESULT BY CASE

| Case | Verdict | Declaration | Ground | Frozen outcome met |
|---|---|---|---|---|
| K1 | VERIFIED_AS_IS | STILL_UNRESOLVED | none | **no** |
| K2 | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | none | **no** |
| K3 | VERIFIED_AS_IS | STILL_UNRESOLVED | none | **yes** |
| K4 | ADD_OR_REPLACE_CLARIFICATION | STILL_UNRESOLVED + nomination | none | part |

Per-question verdicts are in `ADJUDICATION-217.md`.

**The verifier scored 2 of 4, and its profile is challenge-nothing.** It left both accept-cases
alone and challenged neither challenge-case.

## 7. THE SEVEN GATES, INDEPENDENTLY

| | Gate | Occurrences |
|---|---|---:|
| HF1 | evidence proxy accepted as owed property | **2** — K1, K2 |
| HF2 | property-invalid routed as clarification-only correction | **1** — K2 |
| HF3 | legitimate act-as-property challenged | 0 |
| HF4 | structured sibling nomination outside target scope | **1** — K4 |
| HF5 | exact target-binding violation | 0 |
| HF6 | insufficient evidence converted into adverse truth | 0 |
| HF7 | provider settlement-authority violation | 0 |

No aggregate compensation.

## 8. CLASSIFICATION

**HF1 and HF2 — CLASS A, MATERIAL AND UNCONTAINED.** The property that controls the decision is
absent from the ledger and no deterministic layer refuses the output. §217's own Class A definition
names *loss of a decision-critical unresolved fact*, and that is what occurred: on K1 the generator's
ability to carry the ventilation load was never raised, and on K2 the verifier additionally
**replaced the one good question** that would have settled the water chemistry with a question about
the calibration routine. The fail-closed unresolved action limits immediate harm; it does not contain
the defect, because settling the proxy releases the hold on a proposition that does not control the
decision.

**HF4 — CLASS B, MATERIAL BUT CONTAINED.** Deterministically refused with all three §214 codes. The
frozen containment rule applies: an attempt that is deterministically refused is not uncontained
merely because the provider attempted it. Documented residual risk and integration-validation target.

**Class C:** none.

## 9. KR-1

**REMAINS OPEN.** The frozen rule permitted movement only if K1 passed cleanly. K1 failed. Nothing is
automatically remediated.

## 10. ACT-AS-PROPERTY CONTROL

**PASS.** K3 was left intact with explicit reasoning that the doing of the handover communication is
the required control and not evidence of a deeper state. HF3 zero here, and zero across §213, §215
and §217.

## 11. UNRESOLVED / ADVERSE

**HF6 zero.** No verdict asserted an adverse state on the strength of absent evidence, including on
the two failing cases.

## 12. SIBLING CONTAINMENT

**Instruction half failed, deterministic half held.** K4's target was correctly accepted and
explicitly left verified; the sibling was then nominated and refused. The verifier's reasoning about
the baler interlock is correct on its own terms and outside the scope of this review.

## 13. RESTRAINT

**PASS on both accept-cases.** K3 and K4's target were both left alone. The §216 remediation did not
overcorrect.

## 14. TARGET BINDING

**CLEAN, 4 / 4.** One declaration per call, always the supplied target, no foreign keys. HF5 zero.

## 15. PROVIDER AUTHORITY

**CLEAN.** No verdict settled a fact, chose a branch or claimed authority. Zero vocabulary admission
codes. HF7 zero.

## 16. TOKENS, CACHE, COST

| Call | Case | In | Out | Cost USD | Cumulative |
|---:|---|---:|---:|---:|---:|
| 1 | K1 | 11,599 | 943 | 0.0326 | 0.0326 |
| 2 | K2 | 11,516 | 1,367 | 0.0367 | 0.0693 |
| 3 | K3 | 11,633 | 901 | 0.0323 | 0.1016 |
| 4 | K4 | 11,601 | 1,508 | 0.0383 | 0.1399 |

Totals 46,349 input, 4,719 output. **Cumulative spend USD 0.1399 against the ceiling of USD 0.22.**
Projection was USD 0.1578. No coverage was shortened.

**Cache:** creation and read both **0 on every call**. Caching disabled, no `cache_control`
constructed, and the executor refuses to transmit a body containing one.

## 17. STOP REASONS

Every call stopped on `tool_use`. **Zero** reached `max_tokens`. Largest output 1,508 of 4,000. One
responded model: `claude-sonnet-5`.

## 18. EVIDENCE

Every raw response persisted **before** derivation, with case, target, declaration id, request
identities, schema and tool identity, model, HTTP status, inference status, deterministic
admission and refusal, target binding, tokens, cache fields, stop reason and cost. No output
repaired, no semantic inference into omitted fields.

```
CONFIRMATION-PREREGISTRATION-217.json   frozen in Phase A, digest 99f9f6b8…
PREFLIGHT-217.json                      pre-transmission checks
RAW-VERIFIER-217.jsonl                  4 raw records
CALL-LEDGER-217.jsonl                   4 ledger rows
CONTRACT-VALIDATION-217.jsonl           §212 vocabulary and §214 scope admission
EXECUTION-SUMMARY-217.json              ceilings, spend, stop condition
ADJUDICATION-217.md                     the frozen questions, answered
```

## 19. ARTIFACT INTEGRITY

§215's seven raw records, §213's eleven and the frozen §211 digest `3d325fd3…` are unchanged. The
§216 record already carried the exact instruction identity used here, checked at Phase A. No prior
case was rescored.

## 20. POST-RUN REGRESSION

| Suite | Result |
|---|---|
| `test-201-governed-binding-stage` | 59 / 59 |
| `test-202-governed-binding-stage` | 54 / 54 |
| `test-205-remediation` | 92 / 92 |
| `test-207-preregistration` | 144 / 144 |
| `test-210i-epistemic-representation` | 58 / 58 |
| `test-210j-epistemic-schema-remediation` | 98 / 98 |
| `test-211-verifier-validation-design` | 74 / 74 |
| `test-212-verifier-architecture-remediation` | 99 / 99 |
| `test-214-verifier-semantic-remediation` | 68 / 68 |
| `test-215-preregistration` | 45 / 45 |
| `test-216-disposition-remediation` | 70 / 70 |
| `test-217-preregistration` | **43 / 43** |
| `verify-212-projection-ancestry` | PASS |

**Total: 0 local failures.** No code was changed to make anything pass.

---

## 21. THE FINDING THAT MATTERS MOST

**The absence-is-the-adverse-state exception is being used as the route to accept evidence proxies.**

That exception exists to stop the branch rule overcorrecting. On both failing cases the verifier
reached for it in its own words — *"absence of the test IS the substantive fact"*, *"an
absence-shaped branchB is legitimate here because the substantive adverse state IS the absence of the
calibration check itself"* — and then treated the artifact as the property.

The instruction is present and K3 shows it being read correctly on a genuine act. What the block
contains is two frames that both fit an absent-record case, and the model picks the wrong one. That
is not something more instruction text is likely to separate, and it is precisely the situation the
§216 typed stopping rule was written for.

## 22. WHAT THIS RESULT IS NOT

Not Expert HazLenz acceptance, not production readiness, not a claim about any case not run. Four
calls are targeted development evidence.

First-pass status is unchanged at `DEVELOPMENT_FROZEN_WITH_KNOWN_VERIFIER-CARRIED_RISK`. Expert
HazLenz remains **NOT ACCEPTED FOR PRODUCTION**. KR-1 remains **OPEN**.

## 23. WHAT IS NOT AUTHORIZED, AND WAS NOT DONE

No prompt remediation. No additional gate. No further standalone verifier cohort. No rerun. The
§216 stopping rule governs, and the Class A failure means the decision is whether the verifier needs
an explicit structured semantic decision step rather than more instruction text. **That is a
product-owner architecture decision, not a next slice I may start.**
