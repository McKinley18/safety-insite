# §210B-3B — ADJUDICATION AGAINST THE FROZEN §210B-3A INSTRUMENT

Adjudicated strictly against `PROBE-PREREGISTRATION-210B3A.json`
(sha256 `7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5`, unmodified).

Axes A–I only. Vocabulary `PASS` / `FAIL`. `NOT_APPLICABLE` only where frozen before execution.
`NOT_EXERCISED` is used only where the model had **no genuine opportunity to succeed or fail** — one
case, for a transport reason, recorded below. No partial credit. No aggregate compensation. No
post-hoc axes. No truth was altered, and no output was repaired or re-drawn.

---

## RESULT

**`EXPERT_HAZLENZ_SEMANTIC_REMEDIATION_DEVELOPMENT_REQUIRES_REVIEW`**

Six of the 22 exercised evaluation questions failed, across four of the seven executed cases. Under
the frozen pass rule one substantive semantic failure is sufficient; there are four distinct
mechanisms.

| | |
|---|---|
| Cases executed | 7 of 8 (PB-02 structurally rejected, see DEFECT 3) |
| Evaluation questions exercised | 22 of 26 |
| Questions PASS | 16 |
| Questions FAIL | 6 |
| Questions NOT_EXERCISED | 4 (all PB-02) |
| Cases fully clean | PB-01, PB-04 |
| Cases with a substantive failure | PB-03, PB-05, PB-06, PB-07, PB-08 |

---

## PER-QUESTION VERDICTS

| Question | Axis | Verdict | Basis |
|---|---|---|---|
| PB-01.Q1 | C | **PASS** | Declared property is "whether water suppression is actually reaching and wetting the cutting point on the blade during the cut" — the actual state, not availability. |
| PB-01.Q2 | B | **PASS** | No declaration about bowser level, tap position or hose connection. |
| PB-01.Q3 | A | **PASS** | The suppression property was declared. |
| PB-01.Q4 | F | **PASS** | The clarification asks whether water is actually reaching and suppressing dust at the blade during the cut; a complete answer settles it. |
| PB-02.Q1 | C | **NOT_EXERCISED** | Provider rejected the request before inference. No output exists. |
| PB-02.Q2 | I | **NOT_EXERCISED** | As above. Axis I is exercised on PB-02 alone, so axis I is unexercised in this run. |
| PB-02.Q3 | B | **NOT_EXERCISED** | As above. |
| PB-02.Q4 | D | **NOT_EXERCISED** | As above. |
| PB-03.Q1 | C | **FAIL** | The declared property is "whether the welder is wearing respiratory protection during this weld". That is neither present capture performance nor examination history — it is a different property altogether. |
| PB-03.Q2 | B | **PASS** | Examination currency was not declared as an owed fact. |
| PB-03.Q3 | E | **FAIL** | Branches describe respiratory-protection states. They cannot settle the frozen owed property, which is present LEV capture at the arc. |
| PB-04.Q1 | A | **PASS** | Both properties declared: the scissor-lift gate latch, and the bowed upright's capacity at its current load. |
| PB-04.Q2 | G | **PASS** | Two separate declarations, `UF-1` and `UF-2`, not one merged conjunctive entry. |
| PB-04.Q3 | E | **PASS** | Each declaration's branches settle only its own property. |
| PB-05.Q1 | D | **FAIL** | Neither `missingFact` keeps both conjuncts. `decl-1` is "the included angle between the two sling legs"; `decl-2` is "the sling's rated working load limit". Both are the shapes the frozen truth explicitly prohibits. |
| PB-05.Q2 | F | **PASS** | The first clarification asks the joint question — the angle *and* whether rated capacity at that angle exceeds the load — so a complete answer settles adequacy. |
| PB-05.Q3 | B | **PASS** | The load mass, which the text establishes, was not declared. |
| PB-06.Q1 | B | **FAIL** | One declaration was made where the frozen expectation is zero. |
| PB-06.Q2 | B | **FAIL** | The declared fact is "whether the crane's statutory thorough examination is currently in date and free of recorded defects" — the certificate currency, explicitly listed under `prohibitedDeclarations`. |
| PB-07.Q1 | D | **FAIL** | Only the first sequence element survives into a property. `decl-block-valve-confirmation` covers the block valves being confirmed shut before the bleed was opened; the second required element — the bleed confirmed relieving to zero with the isolation still in place, immediately before breaking — appears in no declaration's `missingFact`. |
| PB-07.Q2 | F | **PASS** | The clarification asks for the sequence explicitly, so a general answer that verification occurred would not settle it. |
| PB-07.Q3 | B | **PASS** | The present zero reading was not declared as an owed fact. |
| PB-08.Q1 | A | **PASS** | Two declarations, one for each owed fact area. |
| PB-08.Q2 | H | **PASS** | `decisionIfA` reads "No compensating action needed; the emergency stop is a valid control for the ongoing refuelling" — scoped to that control, which is the form the frozen containment target expressly permits. It does not claim the bay is safe. |
| PB-08.Q3 | H | **PASS** | The bund `decisionIfA` reads "Containment is intact for the current simultaneous transfers" — scoped to containment, not to the bay. |
| PB-08.Q4 | G | **PASS** | Two separate declarations. |

### One axis-level failure beyond the named questions

The frozen axes are exercised per `axes[].exercisedOn`, which is broader than the 26 named questions.
Two axis verdicts follow from the evidence above and are recorded rather than left implicit:

| Case | Axis | Verdict | Basis |
|---|---|---|---|
| PB-03 | A | **FAIL** | The frozen owed property — whether the LEV is actually capturing fume at the arc now, given the damage and repair — emitted as **no declaration at all**. |
| PB-08 | C | **FAIL** | `decl_estop_test` declares "whether the emergency stop mushroom has been function tested against the pump since recommissioning". That is a **check-history proxy**, a class axis C names explicitly. The frozen owed property is whether the stop *actually shuts down the pump when operated*. |

---

## AXIS SUMMARY

| Axis | Exercised on | Result |
|---|---|---|
| A REQUIRED_FACT_RECALL | PB-01, 03, 04, 05, 07, 08 (PB-02 not executed) | **FAIL** — PB-03 |
| B FALSE_GAP_RESTRAINT | PB-01, 03, 04, 05, 06, 07, 08 | **FAIL** — PB-06 |
| C EXACT_PROPERTY | PB-01, 03, 04, 05, 07, 08 | **FAIL** — PB-03, PB-08 |
| D CONJUNCT_QUALIFIER_COMPLETENESS | PB-01, 03, 04, 05, 07, 08 | **FAIL** — PB-05, PB-07 |
| E BRANCH_SETTLEMENT_COMPLETENESS | PB-01, 03, 04, 05, 07, 08 | **FAIL** — PB-03 |
| F CLARIFICATION_SUFFICIENCY | PB-01, 03, 04, 05, 07, 08 | **PASS** |
| G INDEPENDENT_FACT_PRESERVATION | PB-04, PB-05, PB-08 | **PASS** |
| H FACT_LOCAL_DECISION_CONTAINMENT | PB-04, PB-08 | **PASS** |
| I GOVERNED_NORMATIVE_DESCRIPTIVE_BOUNDARY | PB-02 only | **NOT_EXERCISED** |

---

## THE FOUR MECHANISMS, AND WHAT THEY SAY ABOUT S1–S6

Each failure is matched to the invariant that was supposed to prevent it. This is diagnosis for
product-owner review, not remediation, and nothing was tuned.

**1. PB-03 — the right question asked, no declaration emitted. This is the S2 mechanism, unfixed.**

The model raised the capture question as a clarification at `IMPORTANT` criticality: *"Does the loose
taped repair on the capture arm allow a measurable or visible loss of draw/suction at the hood…"* It
then declared something else entirely. S2 says that for anything the model itself treats as
unresolved and decision-critical, either a declaration states it or the model concludes it does not
change today's action. Neither happened. This is the same shape as the AC-03 defect S2 was written
for, on a case built to expose exactly that mechanism.

**2. PB-06 — a false gap on a zero-declaration control. The S5 counterfactual test was not applied.**

The crane is isolated with two padlocks, tagged, barriered, hook landed, out of use, with no lifting
scheduled. The frozen truth records the examination date as a genuine unknown that is decision-neutral
*today*. The model declared it anyway. Its own branches show why it should not have: `decisionIfA`
and `decisionIfB` differ only about **returning the crane to service after the gearbox work** — a
future action — not about anything done today. S5 was deliberately not restated in the §210B-2 block,
on the reasoning that v15 already carries the counterfactual test. On this case it did not hold.

**3. PB-05 and PB-07 — conjunctive properties split into halves. S3 partially effective.**

Both cases require one property settled by two parts at once. In both, the model split it, and in
both the `missingFact` of each half carries only its own part. S3 asks the model to put missing parts
back "into `missingFact`, both branches and the question — not into one of them". The branches and
clarifications *did* keep the joint determination; the properties did not. The instruction appears to
have reached the branches and the question but not the property statement.

**4. PB-08 — a check-history proxy in the property. S1 partially effective.**

`decl_estop_test` names whether the stop *has been function tested*, where the owed property is
whether it *actually shuts down the pump*. S1 states in terms that "a check having happened is not
the checked condition being acceptable". As with mechanism 3, the branches recover the actual state
while the property does not.

The pattern across mechanisms 3 and 4 is consistent and worth the product owner's attention: on these
seven cases the §210B-2 block reached the branches and the clarifications more reliably than it
reached `missingFact` itself.

---

## WHAT THIS RESULT IS NOT

- It is **not** Expert HazLenz acceptance, and not a regression result.
- It is **not** evidence about G6 or verifier exact-binding remediation. No verifier call was made.
- It is **not** evidence about S6 or the governed normative/descriptive boundary. Axis I was never
  exercised, for the transport reason in DEFECT 3.
- The PB-02 rejection is **not** a semantic failure and is not counted as one.
- Two clean cases (PB-01, PB-04) are development evidence that parts of the remediation work on
  targeted cases. They are not grounds for generalizing to the architecture or to other cases.
