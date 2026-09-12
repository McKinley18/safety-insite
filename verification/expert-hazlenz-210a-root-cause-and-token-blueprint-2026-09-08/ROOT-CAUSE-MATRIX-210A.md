# ROOT-CAUSE-MATRIX-210A

One row per failed §209 slot. **29 slots.** Zero provider calls, zero database operations, no §209 verdict reinterpreted.

`DERIVED` = copied or counted from frozen evidence. `ANALYSIS` = the agent's reading of that evidence, downstream of the product owner's verdict, with explicit confidence.

Family counts: **RC-A** 10, **RC-B** 8, **RC-C** 4, **RC-D** 3, **RC-E** 4


---

## AC-01

### `AC-01.FACT1.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-01.242-300.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier directly evaluates the lanyard-attachment fact and recognizes the clarification as sufficient, but its verdict rationale also evaluates the separate duct-capacity fact and the row’s other possible contingencies, so it is not about this fact and no other.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span

### `AC-01.FACT2.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.HAZARD_SEVERITY.OBS-AC-01.499-623.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier directly evaluates the duct-capacity owed fact and correctly assesses its clarification, but it also discusses the independent lanyard fact and other row-level considerations, so exact single-fact binding is not maintained.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span


---

## AC-02

### `AC-02.FACT1.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-02.235-369.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier substantively reaches and evaluates the exact wheel-speed owed fact, but its rationale also evaluates the tongue-guard clarification, the PAT-label issue, and the row more generally; this is correct topic reach with adjacent-property drift rather than exact single-fact binding.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span

### `AC-02.FACT2.M` — axis M CLARIFICATION_RESOLUTION_SUFFICIENCY

| | |
|---|---|
| gate(s) | G7 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` |
| root-cause family | **RC-A** — PROCESS_FOR_STATE |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The clarification can be answered negatively on whether the gap was checked or adjusted without establishing the actual present clearance, so it can leave the frozen owed property unsettled.

**Observed defect (ANALYSIS):** the clarification asks whether the guard gap was CHECKED/ADJUSTED; a negative answer leaves the actual present clearance unestablished

**Relevant exact evidence (ANALYSIS):** the §208B verifier VERIFIED_AS_IS this clarification, so the verifier did not catch the process/state substitution either

**Candidate remediation (ANALYSIS):** RC-A present-state rule; a process question is sufficient only when the process outcome is itself the frozen property

### `AC-02.FACT2.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-02.434-567.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier reaches the guard-clearance fact, but its rationale also substantively discusses the separate wheel-speed and PAT-label properties rather than remaining exclusively bound to this fact.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span


---

## AC-03

### `AC-03.ROW.A` — axis A FIRST_PASS_GAP_RECALL

| | |
|---|---|
| gate(s) | G1, G2, G3 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-D** — RECOGNISED_NOT_EMITTED |
| first stage where defect appears | `FIRST_PASS_STRUCTURED_EMISSION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The fan-operation gap was declared, but the independent pooled-liquid identity gap was not emitted as a structured declaration even though it changes the current response.

**Observed defect (ANALYSIS):** the pooled-liquid identity gap was recognised and asked about but never emitted as a structured declaration

**Relevant exact evidence (ANALYSIS):** CAND-SPILL is INSUFFICIENT_EVIDENCE and names the identity question; CLAR-SPILL-ID asks it exactly; unresolvedFactDeclarations contains only DECL-FAN-STATE. Recognition succeeded; emission did not.

**Candidate remediation (ANALYSIS):** emission completeness at the contract level -- an INSUFFICIENT_EVIDENCE candidate or a BLOCKING clarification that reaches no declaration is a structural defect the deterministic layer can DETECT AND REFUSE (never repair)

### `AC-03.ROW.H` — axis H MULTI_GAP_PRESERVATION

| | |
|---|---|
| gate(s) | G2 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-D** — RECOGNISED_NOT_EMITTED |
| first stage where defect appears | `FIRST_PASS_STRUCTURED_EMISSION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** Only the fan gap survived as a structured owed fact; the independent liquid-identity gap disappeared from the declaration set, so the two gaps were not preserved independently.

**Observed defect (ANALYSIS):** only the fan gap survived as a structured owed fact, so the two independent gaps were not preserved independently

**Relevant exact evidence (ANALYSIS):** same emission gap as AC-03.ROW.A

**Candidate remediation (ANALYSIS):** resolved by the RC-D fix

### `AC-03.FACT1.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-03.438-566.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier correctly reaches the fan-status fact but also evaluates the separate liquid-identity clarification and other row-level contingencies.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span


---

## AC-05

### `AC-05.ROW.B` — axis B FIRST_PASS_GAP_PRECISION

| | |
|---|---|
| gate(s) | G3, G4 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-E** — ESTABLISHED_TREATED_AS_OPEN |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The model declared personal-versus-shared padlock ownership even though the fitter’s exclusive control of the only key is established and the frozen truth makes lock ownership decision-neutral today.

**Observed defect (ANALYSIS):** padlock ownership was declared although the fitter's exclusive key control is established and lock ownership is decision-neutral today

**Relevant exact evidence (ANALYSIS):** decl-lock-ownership is the row's only declaration and is the frozen false gap

**Candidate remediation (ANALYSIS):** the precision half of the RC-A present-state rule: a property the text answers, or whose answers do not change today's action, is not an owed fact

### `AC-05.ROW.I` — axis I FALSE_GAP_SUPPRESSION

| | |
|---|---|
| gate(s) | G4 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-E** — ESTABLISHED_TREATED_AS_OPEN |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** An unnecessary owed fact was created for personal-versus-workshop lock ownership on a row whose decision-critical isolation and key-control state was already established.

**Observed defect (ANALYSIS):** an unnecessary owed fact was created on a row whose decision-critical state was established

**Relevant exact evidence (ANALYSIS):** same declaration

**Candidate remediation (ANALYSIS):** resolved by the RC-E fix


---

## AC-07

### `AC-07.ROW.B` — axis B FIRST_PASS_GAP_PRECISION

| | |
|---|---|
| gate(s) | G3, G4 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-E** — ESTABLISHED_TREATED_AS_OPEN |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The normal-panel-position fact is legitimate, but the model also declared a separate open-panel sound-level fact that the frozen truth does not require as an owed fact.

**Observed defect (ANALYSIS):** an open-panel sound-level fact was declared that the frozen truth does not require

**Relevant exact evidence (ANALYSIS):** d1 (sound level) is the surplus declaration; d2 (normal panel position) is the legitimate one

**Candidate remediation (ANALYSIS):** same precision lever as AC-05

### `AC-07.FACT1.F` — axis F DECISION_DIVERGENCE_VALIDITY

| | |
|---|---|
| gate(s) | G9 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.HAZARD_SEVERITY.OBS-AC-07.264-348.1` |
| root-cause family | **RC-E** — DOWNSTREAM_OVERCLAIM |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | MEDIUM |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The branches lead to different actions, but the positive branch overreaches from a limited sound-level measurement to a broader conclusion that no hearing-protection requirement is triggered.

**Observed defect (ANALYSIS):** decisionIfA generalises a limited sound-level measurement into a conclusion that no hearing-protection requirement is triggered

**Relevant exact evidence (ANALYSIS):** the F slot is bound to d1, the surplus declaration; the overclaim is in its decisionIfA

**Candidate remediation (ANALYSIS):** RC-E removes the surplus declaration; independently, a decision statement may not claim more than its branch establishes (the frozen prohibitedDecisionClaims boundary)


---

## AC-08

### `AC-08.FACT1.M` — axis M CLARIFICATION_RESOLUTION_SUFFICIENCY

| | |
|---|---|
| gate(s) | G7 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-08.600-658.1` |
| root-cause family | **RC-A** — EXISTENCE_FOR_EFFECT |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The question asks generally what traffic-management arrangements exist and can be satisfied by measures such as speed limits or right-of-way rules that do not establish whether pedestrians and trucks are prevented from occupying this crossing simultaneously.

**Observed defect (ANALYSIS):** the clarification asks what traffic-management arrangements EXIST; it can be satisfied without establishing whether simultaneous pedestrian/truck occupancy is prevented

**Relevant exact evidence (ANALYSIS):** decl-traffic-mgmt.missingFact asks whether arrangements "provide any operational control"; clar-traffic-mgmt enumerates arrangement types rather than the effect required

**Candidate remediation (ANALYSIS):** RC-A present-state rule extended to EFFECT: where the frozen property is an achieved effect, naming the mechanism is not the property


---

## AC-10

### `AC-10.FACT1.C` — axis C OWED_PROPERTY_SEMANTIC_CORRECTNESS

| | |
|---|---|
| gate(s) | G5 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-10.343-528.1` |
| root-cause family | **RC-C** — QUALIFIER_IN_WRONG_FIELD |
| first stage where defect appears | `FIRST_PASS_FIELD_ROUTING` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The declaration identifies the correct absence-of-voltage verification issue, but its property statement does not fully preserve the frozen before-and-after proving sequence; that qualifier appears only later in the clarification.

**Observed defect (ANALYSIS):** the before-and-after proving sequence is absent from the declared property; it appears only in the clarification, which the projection does not carry

**Relevant exact evidence (ANALYSIS):** q1 asks whether the proving unit was used "before and after that test"; d1.missingFact and branchA say only "using a proving unit (perhaps since put away)". The projected OwedFact carries neither missingFact nor the clarification, so the verifier never saw the qualifier.

**Candidate remediation (ANALYSIS):** require every essential qualifier present anywhere in the declaration set to appear in the fields the projection carries; this is the D15 loss shape and is what axis Q measures

### `AC-10.FACT1.E` — axis E BRANCH_PLAUSIBILITY

| | |
|---|---|
| gate(s) | G5 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-10.343-528.1` |
| root-cause family | **RC-C** — QUALIFIER_IN_WRONG_FIELD |
| first stage where defect appears | `FIRST_PASS_FIELD_ROUTING` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The negative branch captures failed verification, but the positive branch says a proving unit was used without explicitly preserving that the indicator was proved both before and after the point-of-work test, so the exact verification state is underspecified.

**Observed defect (ANALYSIS):** branchA does not preserve that the indicator was proved both before and after the test, so the positive branch underspecifies the verification state

**Relevant exact evidence (ANALYSIS):** same declaration d1

**Candidate remediation (ANALYSIS):** resolved by the RC-C fix


---

## AC-18

### `AC-18.FACT1.F` — axis F DECISION_DIVERGENCE_VALIDITY

| | |
|---|---|
| gate(s) | G9 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-18.534-622.1` |
| root-cause family | **RC-C** — MISSING_CONJUNCT |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The positive decision to continue work does not follow from a rating for a person alone because the frozen fact also requires capacity for the materials being carried.

**Observed defect (ANALYSIS):** decisionIfA concludes work may continue from a rating for a person alone, while the frozen fact also requires capacity for the materials being carried

**Relevant exact evidence (ANALYSIS):** D1.missingFact, branchA and Q1 all say "with a person on them"; the materials load conjunct is absent from every field

**Candidate remediation (ANALYSIS):** conjunct-completeness: where the frozen property is conjunctive, every conjunct must survive into the declared property, both branches and the clarification

### `AC-18.FACT1.M` — axis M CLARIFICATION_RESOLUTION_SUFFICIENCY

| | |
|---|---|
| gate(s) | G7 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-18.534-622.1` |
| root-cause family | **RC-C** — MISSING_CONJUNCT |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The clarification asks about the 1.8 metre span with a person but omits the materials load, so an answer can leave the actual-load property unresolved.

**Observed defect (ANALYSIS):** the clarification omits the materials load, so an answer can leave the actual-load property unresolved

**Relevant exact evidence (ANALYSIS):** Q1 asks about the 1.8 m span with a person only

**Candidate remediation (ANALYSIS):** resolved by the RC-C fix


---

## AC-19

### `AC-19.ROW.A` — axis A FIRST_PASS_GAP_RECALL

| | |
|---|---|
| gate(s) | G1, G3 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-A** — AVAILABILITY_FOR_USE |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The decision-critical fact is whether dressers actually wear RPE during abrasive cutting; the model instead declared only whether RPE is available in lockers, so the required fact was not declared.

**Observed defect (ANALYSIS):** the decision-critical property "do the dressers actually wear RPE during cutting" was replaced by "is RPE available in the lockers"

**Relevant exact evidence (ANALYSIS):** DEC-1.missingFact names presence and accessibility in lockers; branchA/B and CL-1 carry the same availability framing. No candidate is INSUFFICIENT_EVIDENCE (CAND-1 CONTROLLED, CAND-2/3 UNKNOWN).

**Candidate remediation (ANALYSIS):** first-pass instruction must require the declared property to be a PRESENT STATE of the work as observed, and must reject a capability/availability proxy for it

### `AC-19.ROW.B` — axis B FIRST_PASS_GAP_PRECISION

| | |
|---|---|
| gate(s) | G3, G4 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-A** — AVAILABILITY_FOR_USE |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The availability declaration substitutes an unobserved equipment-location question for the frozen current-control property of actual RPE use and is not a legitimate owed fact for this row.

**Observed defect (ANALYSIS):** the availability declaration is not a legitimate owed fact for this row

**Relevant exact evidence (ANALYSIS):** same single declaration DEC-1 as AC-19.ROW.A; precision fails because the one declaration emitted is the substituted property

**Candidate remediation (ANALYSIS):** resolved by the RC-A fix; no separate lever

### `AC-19.FACT1.M` — axis M CLARIFICATION_RESOLUTION_SUFFICIENCY

| | |
|---|---|
| gate(s) | G7 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-19.426-497.1` |
| root-cause family | **RC-A** — AVAILABILITY_FOR_USE |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** Asking whether RPE is available cannot establish whether the dressers actually wear it when abrasive cutting resumes, so the exact owed property remains open.

**Observed defect (ANALYSIS):** the clarification asks about availability and cannot settle actual use

**Relevant exact evidence (ANALYSIS):** CL-1 asks "Is RPE actually available to the dressers ... for use when abrasive cutting resumes?" -- the availability frame is inherited from the declaration

**Candidate remediation (ANALYSIS):** resolved by the RC-A fix; the clarification inherits the property frame


---

## AC-20

### `AC-20.FACT1.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-20.207-347.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier correctly evaluates the three pre-start-condition fact but also substantively evaluates the independent combustible-core fact and row-level alternatives.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span

### `AC-20.FACT2.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.HAZARD_EXISTENCE.OBS-AC-20.639-776.1` |
| root-cause family | **RC-B** — SIBLING_PROPERTY_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier correctly evaluates the combustible-core fact but also substantively evaluates the separate pre-start-condition fact and other row-level gaps.

**Observed defect (ANALYSIS):** the verifier reached the correct owed fact but its rationale also evaluated sibling properties visible in the same payload, so the verdict is not bound to this fact and no other

**Relevant exact evidence (ANALYSIS):** every axis-L slot on a row carrying more than one admitted OwedFact drifted (6 of 6); no L slot passed on such a row. AC-03 carries one fact but two clarifications and drifted on the sibling clarification.

**Candidate remediation (ANALYSIS):** single-fact verifier payload: supply exactly the target OwedFact, its own clarification and its own evidence span


---

## AC-22

### `AC-22.ROW.A` — axis A FIRST_PASS_GAP_RECALL

| | |
|---|---|
| gate(s) | G1, G3 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-A** — EXISTENCE_FOR_ACTION |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The frozen fact asks what was actually done about both compressed-air and accumulator energy before entry; the model instead declared whether an accumulator bleed or blocking method exists.

**Observed defect (ANALYSIS):** the frozen property (what was actually done about compressed-air AND accumulator energy before entry) was replaced by "does a bleed/block method exist", and the compressed-air conjunct was dropped

**Relevant exact evidence (ANALYSIS):** UF-1.missingFact = "Whether a physical means exists to bleed down or block the hydraulic accumulator's stored pressure". Candidate pneumatic_energy_not_locked exists but is ACTIVE and never enters a declaration.

**Candidate remediation (ANALYSIS):** RC-A present-state rule, plus a conjunct-completeness check when the frozen property is conjunctive

### `AC-22.ROW.B` — axis B FIRST_PASS_GAP_PRECISION

| | |
|---|---|
| gate(s) | G3, G4 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-A** — EXISTENCE_FOR_ACTION |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The sole declaration substitutes downstream engineering-method availability for the current pre-entry stored-energy state and omits the compressed-air conjunct, so it is not a precise owed fact for this row.

**Observed defect (ANALYSIS):** the sole declaration substitutes engineering-method availability for the pre-entry energy state and omits the compressed-air conjunct

**Relevant exact evidence (ANALYSIS):** same UF-1 declaration

**Candidate remediation (ANALYSIS):** resolved by the RC-A fix

### `AC-22.FACT1.L` — axis L VERIFIER_TARGET_BINDING

| | |
|---|---|
| gate(s) | G6 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1` |
| root-cause family | **RC-B** — SIBLING_CANDIDATE_IN_PAYLOAD |
| first stage where defect appears | `VERIFIER_INPUT_COMPOSITION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | MEDIUM |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The verifier is bound to the projected accumulator-method fact, but its rationale also evaluates the unlocked air valve and incomplete procedure while failing to recognize that the projected fact substituted for the frozen pre-entry energy-state property.

**Observed defect (ANALYSIS):** the verifier evaluated the unlocked air valve and the incomplete procedure alongside the target fact, and did not detect that the projected fact had substituted for the frozen property

**Relevant exact evidence (ANALYSIS):** AC-22 has one admitted fact and one clarification but three hazard candidates; the two properties named in the adjudicator reason are exactly the other two candidates

**Candidate remediation (ANALYSIS):** RC-B payload isolation covers the drift; the missed substitution is an RC-A consequence and is not repaired by isolation alone

### `AC-22.FACT1.N` — axis N GOVERNED_EVIDENCE_QUOTATION_BOUNDARY

| | |
|---|---|
| gate(s) | G14 |
| DERIVED verdict | `PARTIALLY_CORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1` |
| root-cause family | **RC-A** — REQUIREMENT_FOR_FACT |
| first stage where defect appears | `GOVERNED_STAGE_BINDING` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** GOV-ECP-01 legitimately concerns stored-energy control, but the bearing statement stretches that requirement into bearing on whether a physical method actually exists on this particular machine, which the record cannot establish.

**Observed defect (ANALYSIS):** a governed record stating a REQUIREMENT was declared to bear on whether a physical method EXISTS on this machine

**Relevant exact evidence (ANALYSIS):** RAW-GOVERNED-208 AC-22 bearingStatement: "...the requirement that stored or residual energy be dissipated or restrained ... which bears on whether such a method exists on the machine." The binding target was already an existence question (UF-1).

**Candidate remediation (ANALYSIS):** RC-A fixes the bound property; additionally the governed contract should force the bearing statement to separate what the record REQUIRES from what it EVIDENCES

### `AC-22.FACT1.T` — axis T FIRST_PASS_GOVERNED_EVIDENCE_SEMANTIC_GROUNDING

| | |
|---|---|
| gate(s) | G14 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1` |
| root-cause family | **RC-A** — REQUIREMENT_FOR_FACT |
| first stage where defect appears | `GOVERNED_STAGE_BINDING` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The provider-visible governed text was sufficient to judge grounding, but the binding statement extends the record from a requirement to dissipate or restrain stored energy to the factual existence of a method on this machine; that factual proposition is not grounded by the record.

**Observed defect (ANALYSIS):** the binding extends a normative requirement into a factual proposition about this machine, which the record cannot ground

**Relevant exact evidence (ANALYSIS):** same bearingStatement; the product owner recorded that the provider-visible governed text WAS sufficient to judge grounding, so this is not an evidence-supply defect

**Candidate remediation (ANALYSIS):** same as AC-22.FACT1.N

### `AC-22.FACT1.M` — axis M CLARIFICATION_RESOLUTION_SUFFICIENCY

| | |
|---|---|
| gate(s) | G7 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | `FP.REQUIRED_CONTROL.OBS-AC-22.367-417.1` |
| root-cause family | **RC-A** — EXISTENCE_FOR_ACTION |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | DOWNSTREAM_CONSEQUENCE |
| confidence | HIGH |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The clarification asks whether the accumulator can be bled or blocked; it does not establish what was actually done about both compressed air and accumulator energy before the technician entered, so it cannot settle the frozen fact.

**Observed defect (ANALYSIS):** the clarification asks whether the accumulator CAN be bled or blocked, not what was done before entry

**Relevant exact evidence (ANALYSIS):** CQ-1 is a capability question inherited from UF-1

**Candidate remediation (ANALYSIS):** resolved by the RC-A fix


---

## AC-23

### `AC-23.ROW.A` — axis A FIRST_PASS_GAP_RECALL

| | |
|---|---|
| gate(s) | G1, G3 |
| DERIVED verdict | `INCORRECT` |
| DERIVED factKey | — |
| root-cause family | **RC-D** — UNKNOWN_ASSERTED_AS_ESTABLISHED |
| first stage where defect appears | `FIRST_PASS_GENERATION` |
| upstream / downstream | UPSTREAM_ROOT |
| confidence | MEDIUM |

**PRODUCT_OWNER verdict reason (verbatim, DERIVED):** The ladder base-slip property is decision-critical and unresolved, but the first pass produced no structured declaration for it.

**Observed defect (ANALYSIS):** the ladder base-slip property is decision-critical and unresolved but produced no structured declaration

**Relevant exact evidence (ANALYSIS):** all four AC-23 candidates are ACTIVE, none INSUFFICIENT_EVIDENCE; zero clarifications and zero declarations were produced. The base-slip condition was framed as an established active hazard rather than an open question, so the unresolved-fact path was never entered.

**Candidate remediation (ANALYSIS):** the first-pass instruction must separate "this hazard is present" from "this decision-critical property is unknown"; an ACTIVE hazard does not discharge an open property that still governs today's action

