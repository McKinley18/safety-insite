# §210H — ADJUDICATION AGAINST THE FROZEN INSTRUMENT

Adjudicated strictly against `FINAL-R4-CONFIRMATION-PREREGISTRATION-210H.json`
(sha256 `2c578a2ce4e1a1012c6797b83799b9a3ebd804e063ce09a1361fdd69a4f2d4a2`, unmodified).

27 frozen evaluation questions across 10 axes. Vocabulary `PASS` / `FAIL`. No partial credit, no
aggregate compensation, no post-hoc axes, no newly invented axes, no truth changed. Read from
`PROJECTION-210H.jsonl`, a verbatim copy of the persisted raw responses in
`RAW-FIRST-PASS-210H.jsonl`.

---

## RESULT

**`EXPERT_HAZLENZ_R4_ALIGNMENT_REQUIRES_REVIEW`**

| | |
|---|---|
| Cases executed | 3 of 3, all reached inference |
| Transport failures | 0 |
| Deterministic contract refusals | 0 |
| Questions exercised | 27 |
| **PASS** | **21** |
| **FAIL** | **6** |
| NOT_EXERCISED | 0 at question level |
| Axis-case cells frozen NOT_APPLICABLE | 5 |
| Cases fully clean | **G2, G3** |
| Mandatory questions passed | **6 of 9** |
| **G1 + G3 narrowing pair** | **FAIL** (G1 half fails, G3 half passes) |

Every declaration count matched its frozen expectation. All three declarations were admitted by the
deterministic contract.

**All six failures are on G1.** G2 and G3 are clean on every question.

---

## THE NARROWING PAIR — THE DECISIVE READING

| Half | Questions | Result |
|---|---|---|
| **G1** evidence must not become the state | `G1.Q3` FAIL, `G1.Q5` FAIL | **FAIL** |
| **G3** an act may remain the property | `G3.Q2` PASS, `G3.Q3` PASS | **PASS** |

**The G3 half is clean, and that is a real gain.** GATE 12 did not become a ban on process
language, did not become a preference for physical-state properties, and did not become a global
hedge. All three mandatory narrowing questions passed on the load-bearing case.

**The G1 half fails.** The model kept process framing where the process is only evidence.

**This is not the global-strategy failure the pair was designed to catch.** A model that globally
preserved process framing would have failed G2 as well, and G2 selected the underlying state
cleanly. The behaviour is selective, and the boundary it draws is the finding.

---

## PER-QUESTION VERDICTS

| Question | Axis | Verdict | Basis |
|---|---|---|---|
| G1.Q1 | A | **PASS** | An entry addressing the ties was emitted, not left as narrative. Recall is scored on emission, following the §210D D1 precedent; the entry's wrongness is scored below. |
| G1.Q2 | B | **FAIL** | See below. |
| G1.Q3 | C | **FAIL** | **MANDATORY.** See below. |
| G1.Q4 | D | **FAIL** | See below. |
| G1.Q5 | G | **FAIL** | **MANDATORY.** See below. |
| G1.Q6 | E | **FAIL** | See below. |
| G1.Q7 | F | **FAIL** | **MANDATORY.** See below. |
| G1.Q8 | I | **PASS** | The boards, guard rails, sole plates, signed tag and missing sheet were not declared as owed facts. |
| G1.Q9 | J | **PASS** | All four semantic fields carry real content, and the BLOCKING clarification is bound to a declaration that exists. |
| G2.Q1 | A | **PASS** | The trapped-slurry property was emitted as a declaration. |
| G2.Q2 | C | **PASS** | **MANDATORY.** The property is "whether the rising leg above the joint currently holds a solidified plug and/or trapped hydraulic head" — the present state, not the run-down. |
| G2.Q3 | D | **PASS** | **MANDATORY.** Branches partition the physical condition of the leg: clear and not carrying head, against set solid and/or carrying head. |
| G2.Q4 | E | **PASS** | **MANDATORY.** Both decisions follow from their branch being true. Neither turns on the procedure having run or been recorded. |
| G2.Q5 | B | **PASS** | Named to this joint and this mechanism, not line safety in general. |
| G2.Q6 | G | **PASS** | A genuinely drained, untapped leg satisfies branchA. branchB requires the leg to actually be set or carrying head. |
| G2.Q7 | F | **PASS** | The clarification names the settling acts and carries the state in its purpose clause. See the recorded note below. |
| G2.Q8 | I | **PASS** | The pump isolation, the opened drain, the shutdown and the line's history were not declared. |
| G2.Q9 | J | **PASS** | Four real fields; `CQ1` BLOCKING bound to `D1`. |
| G3.Q1 | A | **PASS** | The booking-off property was emitted as a declaration. |
| G3.Q2 | H | **PASS** | **MANDATORY.** `missingFact` names the act: the second crane booked off the runway and its driver told in person, per the standing arrangement, before the walkway is used. |
| G3.Q3 | H | **PASS** | **MANDATORY.** Both branches are act-shaped, each with its consequence attached. Neither was converted into a position of the other crane. |
| G3.Q4 | H | **PASS** | **MANDATORY.** `decisionIfA` says the fitter may proceed onto the walkway. See the reading below. |
| G3.Q5 | B | **PASS** | Named to this walkway and this arrangement, before anyone goes onto it. |
| G3.Q6 | E | **PASS** | Both decisions follow from their branch. Neither turns on a record being produced. |
| G3.Q7 | F | **PASS** | The clarification asks whether the act occurred, which is correct on this case, and was not downgraded into whether a booking record exists. |
| G3.Q8 | I | **PASS** | The isolation, hand rails, barrier, training and harness were not declared, and no second entry was invented. |
| G3.Q9 | J | **PASS** | Four real fields; `CQ1` BLOCKING bound to `D1`. |

---

## THE SIX FAILURES — ALL ON G1, ALL ONE MECHANISM

The declaration is `decl_tie_test_performed`, and the id is the finding.

> `missingFact`: "Whether the first tie in each pattern on this scaffold **achieved the required
> pull-test resistance value at installation**"

The frozen owed property is whether the ties are actually holding in sound material behind the
render. The frozen prohibited-proxy list for G1 names "whether the ties have been pull tested" in
those words.

### G1.Q3 — axis C, MANDATORY. The property is the test.

The declaration is about a pull-test resistance value, not about whether the ties hold. This is
worse than the §210F E1 shape: there the property was correct and only the branches drifted; here
the drift reached `missingFact` itself. Under GATE 12's own property-selection question — what would
you need if you could see through the gable — the answer is what the fixings are anchored into, and
the test is how you would find out.

### G1.Q5 — axis G, MANDATORY. The frozen world lands on the adverse branch.

> `branchB`: "The first tie in each pattern **was not tested**, or was tested and did not achieve the
> required resistance, so the restraint the ties provide is **unconfirmed** or inadequate"

The frozen world is ties genuinely anchored in sound blockwork with the sheet never found. That
world satisfies branchB's first disjunct, and `decisionIfB` is "Work should not proceed until the
ties are inspected and pull tested". Absence of evidence has been written as the adverse state being
true, which is exactly what the frozen truth forbids. The `or` disjunct is the same construction
§210F D1 and E1 produced.

### G1.Q7 — axis F, MANDATORY. The clarification asks whether the test happened.

> "Was the first tie in each pattern **actually pull tested at installation**, even though the
> reading sheet is not currently in the file?"

A "yes, it was tested" settles nothing about whether the ties hold, because the reading is not
asked for. The clarification does not seek information capable of settling the property; it seeks
whether an activity occurred.

### G1.Q2 — axis B. A different property, at a different time.

Scored separately from C because it fails on its own terms and for a separable reason: the property
is framed **at installation**, while the decision under analysis is whether the gang may go up now.
Even a purely state-shaped property framed at installation would fail this question. The axis
definition names "a broader, narrower or **different** one", and this is a different property.

### G1.Q4 — axis D. Branches partition the evidence.

`branchA` is conditioned on the tie having been tested and achieving a value; `branchB` carries
"was not tested" as a disjunct and the word "unconfirmed". The branches divide tested from untested,
not holding from not holding.

### G1.Q6 — axis E. The decision follows from confirmation.

> `decisionIfA`: "**Once this is confirmed** (by any means, e.g. locating the sheet or obtaining
> confirmation from the firm), no further tie-related action is needed…"

`decisionIfA` must follow from `branchA` being TRUE. This one follows from confirmation having been
obtained.

---

## AXIS SUMMARY

| Axis | Exercised on | Result |
|---|---|---|
| A REQUIRED_FACT_RECALL | G1 G2 G3 | **PASS** |
| B EXACT_PROPERTY | G1 G2 G3 | **FAIL** — G1 |
| C PROPERTY_VS_PROCESS_SELECTION | G1 G2 | **FAIL** — G1 |
| D BRANCH_PROPERTY_ALIGNMENT | G1 G2 | **FAIL** — G1 |
| E DECISION_PROPERTY_ALIGNMENT | G1 G2 G3 | **FAIL** — G1 |
| F CLARIFICATION_SETTLES_PROPERTY | G1 G2 G3 | **FAIL** — G1 |
| G STATE_WORLD_PLACEMENT | G1 G2 | **FAIL** — G1 |
| H PROCESS_AS_PROPERTY_NARROWING | G3 | **PASS** |
| I FALSE_GAP_RESTRAINT | G1 G2 G3 | **PASS** |
| J DECLARATION_CONTRACT_COMPLETENESS | G1 G2 G3 | **PASS** |

Axes C, D and G are frozen NOT_APPLICABLE on G3; axis H on G1 and G2. Five cells, every one frozen
before execution with a stated basis. No question was recorded NOT_EXERCISED: all three cases
emitted a clarification addressing the owed fact and all three marked it BLOCKING, so both
conditionally exercised halves had a genuine opportunity to fail.

---

## CLOSED MECHANISMS — NO NEW REGRESSION

R5, R6 and R7 were not targets and no stimulus was shaped to exercise them. Observed anyway:

- **R5 binding.** All three cases emitted a BLOCKING clarification and all three carry an authored
  `answersUnresolvedFactDeclarationId` naming a declaration that exists. The deterministic resolver
  reports `unresolved: false` on all three links and
  `blockingClarificationsWithoutBinding` is empty on every case. **No regression.**
- **R7 placeholder rejection.** `NON_SEMANTIC_PLACEHOLDER_VALUE` fired zero times. All twelve branch
  and decision fields across three declarations carry real content. **No regression.**
- **R6 containment.** `NOT_EXERCISED_ACROSS_THE_PROBE`, by frozen design: every case carries exactly
  one declaration and containment is owed only to an open sibling. **Not converted to PASS.**

---

## DETERMINISTIC CONTRACT

Applied exactly as implemented, on every case, before adjudication. No R4B matcher was added.

| Case | Declarations | Admitted | Refused | Placeholder refusals | RR-7 safety state complete |
|---|---:|---:|---:|---:|---|
| G1 | 1 | 1 | 0 | 0 | true |
| G2 | 1 | 1 | 0 | 0 | true |
| G3 | 1 | 1 | 0 | 0 | true |

Nothing was refused, nothing repaired, and RR-7 had nothing to preserve. Note that G1's declaration
is **structurally valid and semantically wrong**: the contract admitted it because deciding that a
branch tracks evidence rather than state is a semantic judgement deterministic code may not make.
That separation held exactly as designed, and it is why R4B is adjudicated by reading.

---

## RECORDED SEPARATELY — NOT VERDICTS

Two readings that a reviewer should see, neither of which changed a verdict.

**G1's `decisionIfA` ends "other open items are unaffected by this fact alone", on a case with no
sibling entry.** G1's axes H and I are frozen NOT_APPLICABLE and containment is not adjudicated
there, so this is not scored. It is recorded because it is the same hedge-against-a-non-existent-
sibling shape §210F E2 produced.

**G3's `decisionIfB` reads "until the crane is confirmed off the runway (or the driver is directly
informed and the crane secured)".** Where branchB is true the act did not occur, so confirmation
alone could not settle it; performance could. The parenthetical supplies performance and the
frozen question contrasts against a *record* being produced, which this is not. Scored PASS, with
the looseness noted.

**G3.Q4's reading.** `decisionIfA` says "The runway is clear of crane-movement exposure for this job
and, with the other stated controls in place, the fitter may proceed onto the walkway". The clause
"the other stated controls" points at controls the observation ESTABLISHES as in place — the
isolation, the hand rails, the barrier, the training, the harness. It names no unresolved matter and
no outstanding check, and it says the work may go ahead. Under the frozen truth, attribution to an
established context is not qualification. PASS.

**G2.Q7's reading.** The clarification's grammatical subject is whether the leg has been tapped or
vented, but it carries the state in its purpose clause and the property itself was never redefined.
The frozen contrast for G2 is against asking whether the run-down was completed, which it does not
do. PASS, with the phrasing noted.

---

## ECONOMICS

| | §210H | §210F |
|---|---:|---:|
| Calls attempted | 3 | 4 |
| Calls reaching inference | 3 | 4 |
| Transport failures | 0 | 0 |
| Median input tokens | 27,167 | 26,190 |
| Median output tokens | 2,329 | 2,449 |
| Total input tokens | 81,568 | 104,798 |
| Total output tokens | 7,358 | 10,446 |
| Cost per observation | USD 0.0789 | USD 0.0785 |
| Cumulative spend | **USD 0.2367** | USD 0.3141 |

Per call: G1 27,167 in / 2,852 out / USD 0.0829. G2 27,152 / 2,329 / USD 0.0776. G3 27,249 / 2,177 /
USD 0.0763.

Projected spend was USD 0.2369 against a ceiling of USD 0.35. Actual was USD 0.2367, within both.
No call reached `max_tokens`; the largest output was G1's 2,852 against the 4,000 allowance, so no
structured output was truncated. Every call stopped on `tool_use`.

Observed median input of 27,167 against the projected 27,237 is closer than the method can support
as a claim. The 977-token median-input gain over §210F is **not** a controlled measurement of the
§210G static delta (estimated +1,047): the §210H observations are different texts with different
per-case schema enums, so per-case input varies for several reasons at once. Broadly consistent, and
nothing more precise is claimed.

`cache_creation_input_tokens` and `cache_read_input_tokens`: **NOT_APPLICABLE — CACHING_DISABLED**.
No `cache_control` was constructed anywhere. Absent or zero provider cache fields in this run are not
evidence about cache effectiveness.

**No production economics claim.** Three development cases do not establish production token
economics and none is made.

---

## THE RESIDUAL MECHANISM

**R4B survives on one shape, and the boundary is informative.**

GATE 12 held on G2 and G3 and failed on G1. The difference between G2 and G1 is not the rule; it is
what the underlying state looks like.

- **G2's state is a physical condition of the plant** — slurry standing in a rising leg. The model
  named it, partitioned it, and put the drained-but-unchecked world on the satisfactory side.
- **G3's property is an act**, and the model kept it as one, with act-shaped branches and an
  unqualified positive decision.
- **G1's state is the adequacy of a concealed fixing**, whose only practical evidence is a test. Here
  the model collapsed the state into the test and never recovered: property, both branches, both
  decisions and the clarification all moved to the test together.

So the failure is not a global preference for process language, and not a global stripping of it.
It is that where a state is **only ever knowable through one specific test**, the test and the state
became the same thing to the model. GATE 12's counterfactual is stated in the prompt and would have
separated them; on this case it was not applied.

Stated as an observation on three cases. **No remediation was performed, no case was rerun, and no
further probe was constructed.**

---

## WHAT THIS RESULT IS NOT

- Not Expert HazLenz acceptance, and not production validation.
- Not an accuracy percentage. Three development cases measure one named mechanism and one narrowing.
- Not evidence about G6, the verifier, or S6. No verifier call and no governed-stage call was made;
  S6 remains `NOT_EXERCISED`.
- Not grounds for generalizing from G3's clean result, or from any single case, to the architecture.
- Reaching three of three is instrument completion, not validation.

## WHAT CHANGED SINCE §210F

Stated as observation, not proof. Different cases, so this is not a controlled comparison.

§210F's four failures were: a correct property with evidence-conditioned branches (E1), the
establishment process as the property (E2 and E3's second entry), and the decision-side consequence.
In §210H the establishment-process substitution did **not** recur on G2, which is the case built for
it, and both §210G narrowings held on G3. What remains is the evidence-conditioned shape of E1,
appearing on G1 in a stronger form: it has reached `missingFact` rather than stopping at the
branches.
