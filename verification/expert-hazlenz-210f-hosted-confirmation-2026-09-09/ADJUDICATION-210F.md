# §210F — ADJUDICATION AGAINST THE FROZEN INSTRUMENT

Adjudicated strictly against `FINAL-CONFIRMATION-PREREGISTRATION-210F.json`
(sha256 `2c186aa15734728c81e88e54ec313cba48377083ecc5e775ed01bf1281d0c24a`, unmodified).

34 frozen evaluation questions across 10 axes. Vocabulary `PASS` / `FAIL`. No partial credit, no
aggregate compensation, no post-hoc axes, no truth changed. Read from `PROJECTION-210F.jsonl`, which
is a verbatim copy of the persisted raw responses in `RAW-FIRST-PASS-210F.jsonl`.

---

## RESULT

**`EXPERT_HAZLENZ_FINAL_FIRST_PASS_REMEDIATION_REQUIRES_REVIEW`**

| | |
|---|---|
| Cases executed | 4 of 4, all reached inference |
| Transport failures | 0 |
| Deterministic contract refusals | 0 |
| Questions exercised | 34 |
| **PASS** | **30** |
| **FAIL** | **4** |
| NOT_EXERCISED | 0 |
| Axis-case cells frozen NOT_APPLICABLE | 10 |
| Cases fully clean | **E4** |

**Every declaration count matched its frozen expectation on every case.** All five expected
declarations were emitted and all five were admitted by the deterministic contract.

**All seven mandatory questions PASS. Both paired narrowing controls PASS.**

The four failures are all the **same mechanism**: R4. R5, R6 and R7 are clean on every question
that exercises them.

---

## THE THREE CHECKS THE AUTHORIZATION SINGLED OUT

### R5 and R7 — E2's contract check. BOTH SATISFIED.

`E2.Q3` PASS. The BLOCKING clarification `Q1` carries
`answersUnresolvedFactDeclarationId: "D1"`, authored by the model, naming a declaration that exists.
**Every** BLOCKING clarification on **every** case is bound: `CQ1`→`UF1` on E1, `Q1`→`D1` on E2,
`CQ1`→`UF1` and `CQ2`→`UF2` on E3, `CLAR-1`→`DECL-1` on E4. The deterministic resolver reports
`unresolved: false` on all five links, and `blockingClarificationsWithoutBinding` is empty on all
four cases. **D2's unbound BLOCKING clarification did not recur.**

`E2.Q4` PASS. The evasion route was not taken. The question that settles the fact is marked
`BLOCKING`, not downgraded to avoid owing a binding. All four cases used `BLOCKING`.

`E2.Q5` and `E2.Q6` PASS. All four of E2's branch and decision fields carry real content. Across the
whole probe, all twenty branch and decision fields on five declarations carry real content;
`NON_SEMANTIC_PLACEHOLDER_VALUE` fired **zero** times. **D2's `"unused"` / `"placeholder"` shape did
not recur.**

### R6 — E3's containment, in both directions. SATISFIED.

`E3.Q3` PASS and `E3.Q4` PASS.

> `UF1.decisionIfA`: "The lift truck may proceed to drive into the trailer **for this hazard**, since
> the restraint is confirmed effective, **subject to resolution of the separate deck condition**"

> `UF2.decisionIfA`: "The lift truck may cross the deck as planned **for this hazard**, since the
> structural condition has been confirmed adequate, **subject to resolution of the separate
> trailer-restraint condition**"

Each positive decision names its own fact and defers to the open sibling, symmetrically. This is
exactly the D4 defect corrected. **Settling A does not settle B, and settling B does not settle A.**

### E4 — the load-bearing control. FULLY CLEAN, 8 of 8.

`E4.Q3` PASS. The act is allowed to be the property:

> `missingFact`: "Whether the reduced-speed, single-step, empty-fixture verification cycle **was
> performed** on the reprogrammed path before automatic production resumed"

GATE 8 was **not** applied as a word ban. The property names performance of the act, using
"performed" and "verification", and was not rewritten into a state-only property about path
geometry.

`E4.Q4` PASS. Unqualified authorization remained possible:

> `decisionIfA`: "The required program-verification control for this cell has been satisfied; running
> the current part in automatic is consistent with the cell's standing restart method and **no
> additional stop is needed on this basis**"

No hedge against siblings that do not exist, and no refusal to say the work may go ahead. The
attribution clause is attribution, which the frozen truth explicitly records as not a failure.

**Both §210E narrowings survived hosted behaviour.** Neither was obtained by a degenerate strategy:
E1's property is pure state while E4's names an act, and E3 contains both decisions while E4 hedges
neither.

---

## PER-QUESTION VERDICTS

| Question | Axis | Verdict | Basis |
|---|---|---|---|
| E1.Q1 | A | **PASS** | The concrete-strength property was emitted as a declaration. |
| E1.Q2 | B | **PASS** | "the strength required for anchor lifting" names the strength the cast-in anchors need. |
| E1.Q3 | C | **PASS** | **MANDATORY.** `missingFact` turns on the underlying state alone. No process element is conjoined. |
| E1.Q4 | C | **FAIL** | See below. |
| E1.Q5 | E | **FAIL** | See below. |
| E1.Q6 | F | **PASS** | "the lift may proceed as staged" against "the lift must be held". Real and different. |
| E1.Q7 | D | **PASS** | `CQ1` is BLOCKING and binds to `UF1`. |
| E1.Q8 | J | **PASS** | The heating trip, the shut-down boiler, the flat reader battery and the cubes at the laboratory were not declared. |
| E2.Q1 | A | **PASS** | A declaration was emitted, not left as a clarification or narrative. |
| E2.Q2 | B | **FAIL** | See below. |
| E2.Q3 | D | **PASS** | **MANDATORY.** `Q1` (BLOCKING) carries `answersUnresolvedFactDeclarationId: "D1"`. |
| E2.Q4 | D | **PASS** | The settling question is marked BLOCKING. No downgrade to avoid the binding. |
| E2.Q5 | E | **PASS** | **MANDATORY.** Both branches are full statements of different conditions. No filler. |
| E2.Q6 | F | **PASS** | **MANDATORY.** Both decisions are real and different. No filler. |
| E2.Q7 | C | **PASS** | The property asks what actually happened, not what the record shows. |
| E2.Q8 | J | **PASS** | The agitator isolation, the atmosphere test, the standby arrangement and the panel reset were not declared. |
| E3.Q1 | A | **PASS** | Both properties declared, as `UF1` and `UF2`. |
| E3.Q2 | G | **PASS** | Two separate entries. Neither merged, neither dropped. |
| E3.Q3 | H | **PASS** | **MANDATORY.** The lock decision stops at the lock and defers to the deck. |
| E3.Q4 | H | **PASS** | The deck decision stops at the deck and defers to the lock. Symmetric. |
| E3.Q5 | C | **FAIL** | See below. |
| E3.Q6 | B | **PASS** | `UF1` is about the trailer being held; `UF2` is about the deck's adequacy at the reported area. Subject and scope are right on both. |
| E3.Q7 | E | **PASS** | All four branch fields carry real, different content. |
| E3.Q8 | F | **PASS** | All four decision fields carry real content. |
| E3.Q9 | D | **PASS** | `CQ1`→`UF1` and `CQ2`→`UF2`, each bound to the correct entry. |
| E3.Q10 | J | **PASS** | The dark lamps, the damaged control box, the covered deck and the truck's weight were not declared. |
| E4.Q1 | A | **PASS** | The cycle property was emitted as a declaration. |
| E4.Q2 | B | **PASS** | Names the cycle required after the program change on this cell, before production. |
| E4.Q3 | I | **PASS** | **MANDATORY.** The act is named as the property. GATE 8 is not a word ban. |
| E4.Q4 | I | **PASS** | **MANDATORY.** The positive decision authorizes production without inventing a blocker. GATE 10 is not a universal hedge. |
| E4.Q5 | E | **PASS** | Two real, different states of affairs about the cycle. |
| E4.Q6 | F | **PASS** | "no additional stop is needed" against "automatic production must be stopped". |
| E4.Q7 | D | **PASS** | `CLAR-1` is BLOCKING and binds to `DECL-1`. |
| E4.Q8 | J | **PASS** | Nothing established was declared, and no second entry was invented for the decision to be contained against. |

---

## THE FOUR FAILURES — ONE MECHANISM

All four are **R4**. Stated separately because they are three distinct expressions of it, but they
are not four independent defects.

### E1.Q4 — axis C, and E1.Q5 — axis E. The property is pure; the branches are not.

`missingFact` is exactly right:

> "whether the bed-four panel's concrete has reached the strength required for anchor lifting"

That is the state, with no process conjoined. `E1.Q3`, the mandatory purity question, passes on it.
**GATE 8 worked on the field it names.**

The branches did not follow:

> `branchA`: "**the companion cube tests** (or another confirmed method) **show** the panel has
> reached adequate strength for lifting"

> `branchB`: "**the cube tests have not yet confirmed** adequate strength, **or** show the concrete
> is under-strength"

Both branches are states of the **evidence**, not states of the concrete. The consequence is the D1
mechanism intact: a panel that has genuinely reached strength but whose cubes are still at the
laboratory satisfies `branchB`'s first disjunct, and `decisionIfB` is "the lift must be held".

`E1.Q4` asks whether the property is free of a conjoined process element **so that the world in
which the strength is adequate but unmeasured does not fall into `branchB` and does not drive the
decision not to lift**. The first clause holds and the second does not. Under the frozen pass rule
there is no partial credit. `E1.Q5` asks directly whether the branches state strength states rather
than evidence states; they do not.

This is worth recording precisely for review: **GATE 8 says in terms "This narrows the property
only."** The instruction did exactly what it says, and the defect moved one field across. The
model's own `notEstablishedBecause` again draws the distinction correctly — it says the observation
"does not state whether the concrete has in fact reached adequate strength" — so this is a scoping
gap in the rule, not a model that has failed to understand it.

### E2.Q2 — axis B. The property is the cleaning cycle, not the tank interior.

> `missingFact`: "whether the overnight caustic **cleaning circuit actually completed** and the tank
> was drained/rinsed **before the cycle-complete lamp was observed lit**"

The frozen owed property is whether the inside of the tank is actually clear of caustic. This
property's subject is the cleaning cycle, anchored to the panel lamp — and the frozen question asks
whether the property concerns the tank interior **rather than** the cleaning cycle or the panel.

`E2.Q7`, the purity question, **passes**: the property asks what actually happened, not what the
record shows, so this is not the record-as-property defect. It is the adjacent one — the process
that produces the state standing in for the state. `branchB` then carries the same evidence
conditioning as E1: "the caustic circuit's completion **cannot be confirmed**".

### E3.Q5 — axis C. A check-history property on the second fact.

`UF1` is clean:

> "Whether the trailer restraint lock has actually engaged the trailer's rear underrun bar"

`UF2` is not:

> "Whether the reported soft area in the trailer deck **has been located, inspected and found safe,
> or repaired**, since it was reported"

The frozen owed property is whether the deck at that area will actually carry the loaded front axle.
This one turns on whether an inspection happened, and the frozen question names "an absent
inspection" as the wrong side. Under GATE 8's own counterfactual a deck that will genuinely carry
the axle, never inspected, leaves this property unsatisfied — so it is the process, not the state.
The frozen prohibited-proxy list for E3 contains "whether the deck has been examined or the
protective board lifted", which is this property.

Scored on axis C only. Axis B (`E3.Q6`) tests subject and scope, and the subject — the deck's
adequacy at the reported area — is right. Scoring one defect twice across two axes would be an
instrument error, and it follows §210D's own precedent, where D1's proxy failed the proxy axis and
passed the completeness axis.

---

## AXIS SUMMARY

| Axis | Exercised on | Result |
|---|---|---|
| A REQUIRED_FACT_RECALL | all four | **PASS** |
| B EXACT_PROPERTY | all four | **FAIL** — E2 |
| C PROPERTY_PURITY | E1, E2, E3 | **FAIL** — E1, E3 |
| D CLARIFICATION_BINDING | all four | **PASS** |
| E BRANCH_SEMANTIC_COMPLETENESS | all four | **FAIL** — E1 |
| F DECISION_SEMANTIC_COMPLETENESS | all four | **PASS** |
| G INDEPENDENT_FACT_PRESERVATION | E3 | **PASS** |
| H FACT_LOCAL_DECISION_CONTAINMENT | E3 | **PASS** |
| I OVERCORRECTION_CONTROL | E4 | **PASS** |
| J FALSE_GAP_RESTRAINT | all four | **PASS** |

Axis C is frozen NOT_APPLICABLE on E4; G and H on E1, E2 and E4; I on E1, E2 and E3. Ten axis-case
cells in total, every one frozen before execution with a stated basis.

**NOT_EXERCISED: zero.** Every case emitted at least one BLOCKING clarification, so every
conditionally exercised binding question had a genuine opportunity to fail and none was recorded as
a vacuous PASS.

---

## DETERMINISTIC CONTRACT

Applied exactly as implemented, on every case, before adjudication.

| Case | Declarations | Admitted | Refused | Placeholder refusals | RR-7 safety state complete |
|---|---:|---:|---:|---:|---|
| E1 | 1 | 1 | 0 | 0 | true |
| E2 | 1 | 1 | 0 | 0 | true |
| E3 | 2 | 2 | 0 | 0 | true |
| E4 | 1 | 1 | 0 | 0 | true |

`NON_SEMANTIC_PLACEHOLDER_VALUE` did not fire. No declaration was refused, none was repaired, and
RR-7 had nothing to preserve because nothing failed structural admission. The R7 contract half is
therefore **exercised but not triggered** on this run — it was tested against D2's shape locally in
§210E, and no §210F output reproduced that shape.

---

## RECORDED SEPARATELY — NOT A VERDICT

E2's `decisionIfA` reads "entry may proceed as planned **once other open items are addressed**",
while E2 carries exactly one declaration and no open sibling. The frozen truth for E2 states that
containment "is not adjudicated either way" on this case, and axes H and I are frozen
NOT_APPLICABLE for E2. It is therefore **not scored**, and is recorded here only so the observation
is not lost. E4, which is the case constructed to adjudicate exactly this, shows no such hedge.

---

## ECONOMICS

| | §210F | §210D |
|---|---:|---:|
| Calls attempted | 4 | 5 |
| Calls reaching inference | 4 | 5 |
| Transport failures | 0 | 0 |
| Median input tokens | 26,190 | 24,988 |
| Median output tokens | 2,449 | 2,515 |
| Total input tokens | 104,798 | — |
| Total output tokens | 10,446 | — |
| Cost per observation | USD 0.0785 | USD 0.0705 |
| Cumulative spend | **USD 0.3141** | USD 0.3526 |

Per call: E1 26,167 in / 2,504 out / USD 0.0774. E2 26,202 / 2,394 / USD 0.0763. E3 26,178 / 3,766 /
USD 0.0900. E4 26,251 / 1,782 / USD 0.0703.

Projected spend was USD 0.3224 against a ceiling of USD 0.45. Actual was USD 0.3141, within both. No
call reached `max_tokens`; the largest output was E3's 3,766 against the 4,000 allowance, so no
structured output was truncated.

Observed median input of 26,190 against the projected 26,184 is closer than the method can support
as a claim. The §210F observations are different texts from the §210D stimuli with different
per-case schema enums, so the 1,202-token median-input delta over §210D is **not** a controlled
measurement of the §210E static delta (estimated +1,149). It is broadly consistent with it, and
nothing more precise is claimed.

`cache_creation_input_tokens` and `cache_read_input_tokens`: **NOT_APPLICABLE — CACHING_DISABLED**.
No `cache_control` was constructed anywhere. Absent or zero provider cache fields in this run are not
evidence about cache effectiveness.

**No production economics claim.** Four development cases do not establish production token
economics and none is made.

---

## THE RESIDUAL MECHANISM

**R4, expressed one field further out than GATE 8 reaches.**

GATE 8 narrowed `missingFact` and it worked there: E1's property is pure, E4's act-shaped property
is permitted, and the mandatory purity question passes. What survives is in two places the gate does
not name:

1. **`branchA` and `branchB` conditioned on evidence rather than on the state** (E1, and the same
   shape in E2's `branchB`). The property is right and the branch truth conditions put the
   adequate-but-unestablished world on the stop side.
2. **A property whose subject is the process that would produce the state** rather than a record of
   it (E2's cleaning cycle, E3's `UF2` inspection status). Distinct from the record-as-property
   defect GATE 8 addresses, which is why E2's purity question passes while its exact-property
   question fails.

This is a scoping observation about the rule, on four cases. **It is not a remediation, and none was
performed.** No prompt, contract, truth or evidence was changed after execution.

---

## WHAT THIS RESULT IS NOT

- Not Expert HazLenz acceptance, and not production validation.
- Not an accuracy percentage. Four development cases measure four named mechanisms and two
  narrowings, nothing broader.
- Not evidence about G6, the verifier, or S6. No verifier call and no governed-stage call was made;
  S6 remains `NOT_EXERCISED`.
- Not grounds for generalizing from E4's clean result, or from any single case, to the architecture.
- Reaching four of four is instrument completion, not validation.

## WHAT IMPROVED SINCE §210D

Stated as observation, not proof. Different cases, so this is not a controlled comparison.

§210D's three failures were a check-history proxy conjoined into the property (D1), an unbound
BLOCKING clarification (D2), and unqualified continuation while a sibling fact was open (D4), plus
the axis-level finding that D2's reasoning was not authored at all.

In §210F the conjoined proxy did not recur in `missingFact`, every BLOCKING clarification is bound,
both positive decisions on the two-fact case stay local and symmetric, all twenty branch and
decision fields carry real content, and both narrowings held. What remains is R4 in the branches and
in two property subjects.
