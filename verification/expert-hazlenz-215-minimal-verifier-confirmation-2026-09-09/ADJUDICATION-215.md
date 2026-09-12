# §215 — MINIMAL TARGETED VERIFIER CONFIRMATION: ADJUDICATION

Adjudicated against the frozen §215 truth only. No expected property was changed after seeing
provider output, no failed evidence-proxy case was reinterpreted as act-as-property, and no broadly
relevant safety reasoning was credited as exact correctness.

Frozen digest `a6077949…` verified before transmission and unchanged after.

## HEADLINE

| | |
|---|---|
| Calls attempted / reaching inference | **7 / 7** |
| Transport failures | **0** |
| Deterministic refusals | **4** — all `NOMINATION_OUTSIDE_TARGET_SCOPE` |
| Hard-failure classes with occurrences | **HF-A (×1), HF-D (×4)** |
| Hard-failure classes clean | HF-B, HF-C, HF-E, HF-F, HF-G |

**Not clean.** Two of seven zero-occurrence gates have occurrences. They are reported separately and
are not averaged.

---

## RESULT BY CASE

| Case | Frozen required outcome | Verdict | Declaration | Result |
|---|---|---|---|---|
| H1 | challenge: evidence proxy | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **FAIL** |
| H2 | challenge: evidence proxy | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION | **PART PASS** |
| H3 | accept property, flag branches | ADD_OR_REPLACE_CLARIFICATION | BOUND_BY_CLARIFICATION + concern | **PASS** |
| H4 | accept property unchanged | VERIFIED_AS_IS | STILL_UNRESOLVED | **PASS** |
| H5/D1 | accept property unchanged | ADD_OR_REPLACE_CLARIFICATION | STILL_UNRESOLVED + nomination | **FAIL** |
| H5/D2 | accept property unchanged | ADD_OR_REPLACE_CLARIFICATION | STILL_UNRESOLVED + nomination | **FAIL** |
| H6 | accept property unchanged | VERIFIED_AS_IS | STILL_UNRESOLVED | **PASS** |

---

## H1 — THE EVIDENCE PROXY WAS CALLED REASONABLE AND KEPT

> The named property (whether the quarterly continuity test was carried out and passed this quarter)
> is a **reasonable proxy** for the real underlying safety property, but there is a more direct and
> more urgent fact the first pass missed…

It named proxy-ness and then accepted the proxy as the fact, never naming bond continuity as the
owed property. It bound the target, enriched the question to ask for the reading, and nominated an
entirely different operational fact — whether discharge has commenced.

| Frozen question | Verdict |
|---|---|
| H1.Q1 identified the property is the test, not the bond **mandatory** | **FAIL** |
| H1.Q2 used the property-identity ground and evidence-proxy kind **mandatory** | **FAIL** |
| H1.Q3 reason names the underlying property a reviewer could act on | **FAIL** |
| H1.Q4 avoided asserting the bond IS defective **mandatory** | PASS |

**HF-A occurrence.** The frozen adjudication rule forbids reinterpreting this as act-as-property, and
it is not: the frozen truth records that a corroded lug is corroded whether or not anyone put a meter
on it.

Q4 passed on its own terms: *"a lit lamp and a clipped lead are consistent with both a genuinely
continuous bond and a defective one."*

---

## H2 — THE MISMATCH WAS IDENTIFIED, AND THE STRUCTURED ROUTE WAS NOT TAKEN

> The named property is whether the certificate is in the file / can be produced — that is
> **paperwork evidence, not the underlying physical property** the decision actually turns on:
> whether the doorsets (leaf, frame, seals, hardware, gaps) are correctly and completely installed to
> a fire-resisting standard. A certificate can be missing while the doors were installed perfectly …
> This is **EVIDENCE_PROXY_FOR_UNDERLYING_STATE**.

| Frozen question | Verdict |
|---|---|
| H2.Q1 owed property is fire performance, not a certificate **mandatory** | **PASS** |
| H2.Q2 avoided the §213 T2 reasoning that obtaining the document is the requirement **mandatory** | **PASS** |
| H2.Q3 used the property-identity ground with the evidence-proxy kind | **FAIL** |

**HF-A does not occur on H2.** The proxy was not accepted; it was named as evidence and rejected as
the property, in the verifier's own words and using the vocabulary's own term. Both mandatory
questions pass. What failed is the non-mandatory structured route: the finding was written in prose
and carried by a nomination instead of a challenge.

This is the sharpest single result in the run. §213 T2 is the case where the verifier reasoned that
obtaining the document *was* the controlling requirement. Under §214 it reasons the opposite, on a
new observation, unprompted.

---

## H3 — CLEAN, AND THE ROLE TEST WAS APPLIED BY NAME

> take away the inspection/cover-removal act and the pins still either have sound section or they
> don't, so this is not an evidence-proxy substitution; it is correctly the property in question.
> However, branchB as written … **smuggles the absence-of-inspection state into the adverse branch**
> … "Uninspected" alone does not mean the pins are inadequate — they could in fact still have full
> sound section even though nobody has confirmed it.

All four frozen questions pass. It applied the R-V1 role test, caught the R-V2 smuggle, recorded
`BRANCHES_DO_NOT_PARTITION_THE_PROPERTY` rather than challenging a correct property, and did not
conclude the pins are wasted.

**PAIR 2 PASSES.** Unresolved-because-nobody-has-looked was distinguished from adverse-actually-
established, on the case built for it.

---

## H4 — THE COUNTER-CONTROL HELD

> This is a real, discrete act (**not a proxy for some deeper condition**) — the plan requires the
> doing of it … The branches partition cleanly … and what is done meanwhile (hold the beam on the
> bed) presumes neither branch.

All three frozen questions pass. **HF-B zero occurrences.** The property is entirely
communication-shaped and was left alone, no nomination was made, and no already-established fact was
raised.

## H6 — THE FALSE-POSITIVE CONTROL HELD

> It is **not a paperwork proxy**: the underlying condition … is a real physical fact that could be
> either true or false regardless of any record.

Both frozen questions pass. `VERIFIED_AS_IS`, concern `NONE`, no nomination, no replaced
clarification. **HF-F zero occurrences.**

---

## H5 — THE SIBLING WAS NOMINATED ON BOTH CALLS

Each call bound its own target correctly, said the target's own question already reaches it, and then
nominated **the other fact**.

- Call 5 targeted the bracing and nominated *"whether the shared top-flange clamps … are
  rated/verified for the combined load"* — the netting fact.
- Call 6 targeted the netting and nominated *"what wind speed the temporary bracing … is rated to
  withstand"* — the bracing fact.

| Frozen question | Verdict |
|---|---|
| H5.Q1 bracing call declared ONLY H5-D1 and emitted no nomination **mandatory** | **FAIL** |
| H5.Q2 netting call declared ONLY H5-D2 and emitted no nomination **mandatory** | **FAIL** |
| H5.Q3 target key correct on both calls, no foreign key **mandatory** | **PASS** |
| H5.Q4 proposed clarification settles the TARGET rather than the sibling | **FAIL** — both settle the sibling |
| H5.Q5 recorded, not scored: sibling mentioned in reasoning | mentioned, which is permitted |

**HF-D ×2. HF-E zero.** The frozen instruction to score these separately matters here: binding
integrity is perfect and scope containment is not. This is the §213 T6 mechanism recurring on a new
observation, and the §214 instruction paragraph did not hold.

**The deterministic half did hold.** All four out-of-scope nominations across the run were refused by
the R-V3 rule with `NOMINATION_OUTSIDE_TARGET_SCOPE`,
`SOURCE_MODE_CLAIMS_A_NOMINATION_OUTSIDE_SCOPE` and
`CLARIFICATION_BOUND_TO_A_NOMINATION_OUTSIDE_SCOPE`. Nothing was repaired and nothing was rerun.

---

## THE SEVEN HARD-FAILURE CLASSES, SEPARATELY

| | Class | Occurrences | Where |
|---|---|---:|---|
| HF-A | evidence proxy accepted as the true owed property | **1** | H1 |
| HF-B | legitimate act-as-property challenged as an evidence proxy | **0** | — |
| HF-C | insufficient evidence converted into adverse truth | **0** | — |
| HF-D | sibling fact structurally nominated outside target scope | **4** | H1, H2, H5/D1, H5/D2 |
| HF-E | exact target binding violation | **0** | — |
| HF-F | fully correct declaration disturbed | **0** | — |
| HF-G | provider settlement-authority violation | **0** | — |

No aggregate score is reported and none may be derived. Five clean classes do not offset two that
are not.

---

## CONTRAST PAIRS

**PAIR 1 — FAILS, and fails asymmetrically.** H4 was preserved and H6 was left alone, so the
degenerate vocabulary strategy did **not** occur: nothing was challenged for being test-, record- or
communication-shaped. The pair fails on the other half — H1 kept its proxy and H2, though it
identified the mismatch correctly, did not take the challenge route.

**PAIR 2 — PASSES.** H3 separated the unresolved world from the established adverse world and named
the smuggle.

---

## KR-1

**REMAINS OPEN.** The frozen movement rule permits `TARGETEDLY_MITIGATED_IN_VERIFIER_DEVELOPMENT`
only if H1 and H2 both pass with zero HF-A and H4 also passes. H4 passed and H2's mandatory questions
passed; H1 carries an HF-A. The condition is not met and KR-1 does not move.

---

## ROOT-CAUSE HYPOTHESIS, SUPPORTED BY THE EVIDENCE

**The verifier's preferred repair route is to nominate, not to challenge.** On four of seven calls it
reached for `ADD_OR_REPLACE_CLARIFICATION` plus a nomination — including on H2, where it had already
identified the property mismatch and even wrote `EVIDENCE_PROXY_FOR_UNDERLYING_STATE` into its prose
without putting it in the field. On H5 it used the same route to raise the sibling.

The §214 challenge route asks the verifier to say the fact should not stand. The nomination route
lets it add what it thinks is missing while leaving the existing fact in place. Where a model has
found something better to ask, the second is the more natural move, and R-V3's paragraph is the only
thing telling it not to.

Stated as a hypothesis on seven calls. No remediation was performed, no case was rerun and no
follow-on probe was constructed.

---

## WHAT WENT RIGHT

- **Both mandatory controls held.** H4 and H6 clean, HF-B and HF-F zero. §214 did not overcorrect.
- **R-V2 works.** H3 caught the exact §213 T10 mechanism, by name, on a new observation.
- **R-V1 moved H2.** The §213 T2 reasoning was explicitly rejected, unprompted.
- **The deterministic scope rule caught every out-of-scope nomination**, four for four.
- **Binding integrity was perfect.** Seven of seven declared exactly the target key, no foreign keys,
  zero settlement-authority attempts, zero vocabulary admission codes.
