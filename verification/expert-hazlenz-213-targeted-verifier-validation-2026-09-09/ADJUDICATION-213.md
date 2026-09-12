# §213 — FROZEN TARGETED VERIFIER VALIDATION: ADJUDICATION

Adjudicated against the frozen §211 evaluation questions only. No question was added, removed or
reworded, and no expected outcome was changed. Digest `3d325fd3…` verified before execution and
unchanged after.

## HEADLINE

| | |
|---|---|
| Calls attempted / reaching inference | **11 / 11** |
| Canary (call 1) | **PASSED** — reached inference |
| Transport failures | **0** |
| Contract refusals | **0** |
| Hard-failure classes with occurrences | **HF-1 (×2), HF-4 (×2)** |
| Hard-failure classes clean | HF-2, HF-3, HF-5, HF-6, HF-7 |

**Not clean.** Two of seven hard-failure classes have occurrences, and both are zero-occurrence
gates. They are reported separately and are not averaged.

---

## PER-CASE VERDICTS

| Case | Frozen required outcome | Verifier verdict | Declaration | Result |
|---|---|---|---|---|
| T1 | challenge: property is its own evidence | VERIFIED_AS_IS | STILL_UNRESOLVED | **FAIL** |
| T2 | challenge: property is its own evidence | VERIFIED_AS_IS | STILL_UNRESOLVED | **FAIL** |
| T3 | challenge: already-established process | ADD_OR_REPLACE_CLARIFICATION | CHALLENGE_FACT_VALIDITY | **PASS** |
| T4 | accept the property unchanged | VERIFIED_AS_IS | STILL_UNRESOLVED | **PASS** |
| T5 | accept the property unchanged | ADD_OR_REPLACE_CLARIFICATION | CHALLENGE_FACT_VALIDITY | PASS on axes; see note |
| T6/1 | accept the property unchanged | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **PART FAIL** |
| T6/2 | accept the property unchanged | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **PART FAIL** |
| T7 | accept property, replace clarification | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **PASS** |
| T8 | accept the property unchanged | VERIFIED_AS_IS | STILL_UNRESOLVED | **PASS** |
| T9 | accept property, flag unresolved action | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **PASS** |
| T10 | accept property, flag adverse branch | VERIFIED_AS_IS | STILL_UNRESOLVED | **FAIL** |

---

## THE TWO KR-1 FAILURES, IN THE VERIFIER'S OWN WORDS

### T1 — the crack test accepted as the property

The frozen property is whether the lifting eye welds are **actually sound enough to carry the frame**.
The declaration named whether they **were crack tested**. The verifier applied the perfect-knowledge
test and reached the opposite answer:

> Seeing the frame as it physically is would not settle this: a sound-looking weld is consistent with
> both an untested weld and a tested-and-passed one, so the act of testing (and its documented
> result) is the property, not something visible on inspection.

The frozen counterfactual is *if the weld metal could simply be seen through, you would see whether
the welds are sound*. The verifier substituted **visual inspection** for **perfect knowledge of the
physical state**, and that substitution converted an evidence proxy into an act-as-property case.

It then affirmed the branches:

> Branch A and branch B genuinely partition the property.

`branchB` reads "the welds were not tested, or were tested and failed, so their soundness is
**unconfirmed or inadequate**".

| Frozen question | Axis | Verdict |
|---|---|---|
| T1.Q1 property names the test, not the soundness | V1 **mandatory** | **FAIL** |
| T1.Q2 the test is evidence, not the state | V2 **mandatory** | **FAIL** |
| T1.Q3 branchB partitions tested/untested | V4 | **FAIL** |
| T1.Q4 avoided asserting the welds ARE unsound | V5 | PASS |
| T1.Q5 challenge reason reviewable | V10 **mandatory** | NOT_EXERCISED — no challenge was made |

### T2 — the certificate accepted as the property

The frozen property is whether the bund **will actually retain** a release. The verifier stated the
collapse directly:

> The property named (whether the certificate is on file / can be confirmed issued) is the correct
> property: the decision turns on whether the required periodic verification act was actually
> carried out, not merely on the bund's visual appearance.

This is the §212 act-as-property narrowing applied to a case it does not cover. A periodic
verification act is how retention is established; it is not retention.

| Frozen question | Axis | Verdict |
|---|---|---|
| T2.Q1 property is retention, not a certificate | V1 **mandatory** | **FAIL** |
| T2.Q2 document is a record of evidence | V2 **mandatory** | **FAIL** |
| T2.Q3 locating the certificate would not settle it | V6 | **FAIL** |

### T3 — the same family, handled correctly

T3 is the third KR-1-family case and it **passed cleanly**, which is what makes the result
diagnostic rather than a flat negative.

> Time-based ventilation (opening doors for a specified period) is a procedural proxy for the actual
> underlying hazard, which is residual fumigant gas concentration in a tightly packed load.

It challenged with `THE_OBSERVATION_ALREADY_ESTABLISHES_IT` — the correct ground, because the
observation states the ventilation was completed — and nominated the correct owed property.

| Frozen question | Axis | Verdict |
|---|---|---|
| T3.Q1 identified the already-established process and named residual gas | V1 **mandatory** | **PASS** |
| T3.Q2 a completed procedure does not establish the state | V2 **mandatory** | **PASS** |
| T3.Q3 ground distinguishable from same-action | V10 | **PASS** |

**Root-cause hypothesis, supported by the evidence and stated as a hypothesis.** All three cases
are evidence-proxy shapes. T3's observation **states that the process was completed**; T1's and
T2's state that a **record is absent**. Where the process is established, the verifier separated
the process from the state. Where the only visible trace is an absent record, it reasoned that the
absence *is* the decision-critical fact. Three cases; no wider claim is made.

---

## THE T10 FAILURE

The property is correct and the verifier said so. `branchB` reads "the suspension is **unproven**,
or does not carry the truss", so the sound-but-uncalculated world lands on the adverse side and
drives a stop. The frozen outcome required the branch to be flagged with
`BRANCHES_DO_NOT_PARTITION_THE_PROPERTY`. The verifier returned `representationConcern: NONE`.

| Frozen question | Axis | Verdict |
|---|---|---|
| T10.Q1 identified branchB's "unproven" disjunct | V5 **mandatory** | **FAIL** |
| T10.Q2 avoided concluding the suspension IS inadequate | V5 **mandatory** | **PASS** |
| T10.Q3 left fields intact while acting on the branch | V4 | **FAIL** — it did not act on the branch |
| T10.Q4 avoided treating six incident-free years as establishing branchA | V1 | **PASS** |

Q4 passed explicitly and well: *"six years of incident-free use is not evidence of adequate margin —
it is consistent with both an adequately-rated suspension and with an under-margined one that simply
has not yet failed."*

---

## THE T6 PART FAILURE, AND WHAT IT IS NOT

Binding was **exactly correct on both calls**: call 1 bound T6-D1 and proposed the party-wall
question; call 2 bound T6-D2 and proposed the asbestos question. The §212 isolation excluded each
sibling clarification from the other's prompt, and the evidence records that.

Each call then **nominated the sibling fact** as an additive new owed fact.

| Frozen question | Axis | Verdict |
|---|---|---|
| T6.Q1 party-wall call addressed ONLY the party wall | V9 **mandatory** | **FAIL** |
| T6.Q2 asbestos call addressed ONLY the asbestos | V9 **mandatory** | **FAIL** |
| T6.Q3 imported the sibling's clarification or decision | V8 | **PASS** — not imported |
| T6.Q4 each call kept its own decisionWhileUnresolved | V7 | **PASS** |

**HF-3 did not occur.** The frozen hard-failure class is *bound to the wrong adjacent or sibling
fact*, and the binding was right in both calls. The frozen axis question asks something stricter —
whether the sibling was left **untouched** — and a nomination touches it. The two are scored
separately and deliberately: the safety-critical class is clean, the isolation axis is not.

Recorded, not scored: a nomination is a legitimate additive action under the v3 contract, and the
observation genuinely describes both hazards, so the verifier could reach the sibling without the
sibling's clarification. Whether §211's "untouched" wording should have anticipated the nomination
route is a question about the instrument, and the instrument is frozen.

---

## RECORDED SEPARATELY — NOT VERDICTS

**T5 used `THE_OBSERVATION_ALREADY_ESTABLISHES_IT` for something it does not mean.** Its reason is
*"The bound question already reaches this fact… need not be re-asked"*. That ground means the
**observation** settles the fact, not that a question covers it. Every frozen T5 question passed on
its own wording — the property was accepted as correct, the fan neighbour was not resolved, and the
bump-test question was treated as settling — so no verdict changed. The misuse is recorded because
a challenge ground used for the wrong thing is a reviewability problem, and the deterministic
contract admitted it because ground membership is structural and ground *aptness* is not.

**T5 also nominated a different adjacent property** — interim attendance and portable monitoring.
The frozen T5.Q1 names the ventilation-fan property specifically and that drift did not occur, so
the question passes as frozen.

**Prompt ordering.** The §212 block is appended after the base prompt's closing line "Return your
verdict as JSON matching the required schema." This is exactly the construction §212 validated and
was not changed during execution.

---

## AXIS SUMMARY

| Axis | Exercised on | Result |
|---|---|---|
| V1 exact property identity | T1 T2 T3 T5 T7 T8 T9 T10 | **FAIL** — T1, T2 |
| V2 state versus evidence | T1 T2 T3 | **FAIL** — T1, T2 |
| V3 act-as-property narrowing | T4 | **PASS** |
| V4 branch/property alignment | T1 T8 T10 | **FAIL** — T1, T10 |
| V5 unresolved-state containment | T1 T10 | **FAIL** — T10.Q1 |
| V6 clarification sufficiency | T2 T5 T7 | **FAIL** — T2 |
| V7 decisionWhileUnresolved | T6 T8 T9 | **PASS** |
| V8 adjacent-fact drift | T5 T6 | **PASS** |
| V9 multi-fact isolation | T6 | **FAIL** |
| V10 challenge reviewability | T3 (T1 not exercised) | **PASS** |

---

## THE SEVEN HARD-FAILURE CLASSES, SEPARATELY

| | Class | Occurrences | Cases |
|---|---|---:|---|
| HF-1 | evidence proxy accepted as the property | **2** | T1, T2 |
| HF-2 | legitimate act-as-property rejected | **0** | — |
| HF-3 | bound to the wrong adjacent or sibling fact | **0** | — |
| HF-4 | insufficient evidence became adverse truth | **2** | T1, T10 |
| HF-5 | insufficient clarification approved | **0** | — |
| HF-6 | decisionWhileUnresolved lost | **0** | — |
| HF-7 | provider settlement-authority breach | **0** | — |

HF-4 is scored where the verifier **approved a representation** in which "not established" sits
inside the adverse branch: T1's *"unconfirmed or inadequate"* affirmed as a genuine partition, and
T10's *"unproven, or does not carry"* verified as-is. Neither verdict asserted the adverse state
itself, and both are recorded that way.

**No aggregate percentage is reported and none may be derived from this document.** Five clean
classes do not offset two that are not.

---

## WHAT WENT RIGHT, STATED AS PLAINLY AS WHAT DID NOT

- **The act-as-property counter-control held.** T4 passed all three mandatory questions and T8 was
  left alone. The verifier did not become a machine that challenges anything containing process
  language, which was the §210G-shaped risk of the R-B block.
- **The new §212 vocabulary was used, and used correctly where it was used.** T9 returned
  `UNRESOLVED_ACTION_PRESUMES_A_BRANCH` on exactly the case that was built for it. T3 returned a
  challenge with the right ground and a reviewable reason.
- **Every structural guarantee held on all eleven calls.** One declaration per call, always the
  target key, never a foreign key, zero admission codes, zero settlement-authority attempts.
- **The remediated payload worked.** The property, the branches, the decisions, the unresolved
  action, the gap and the bound clarification all reached the verifier, and its reasoning quotes
  them.

The architecture §212 built is doing its job. What §213 measures is that the **behaviour** on the
KR-1 family is inconsistent.
