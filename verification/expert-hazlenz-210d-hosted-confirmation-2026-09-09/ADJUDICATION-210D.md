# §210D — ADJUDICATION AGAINST THE FROZEN INSTRUMENT

Adjudicated strictly against `CONFIRMATION-PREREGISTRATION-210D.json`
(sha256 `55510f9cc4e9424d543332e1c2f5db5a86d26757adba28d21730cc882420f30f`, unmodified).

21 frozen evaluation questions across 9 axes. Vocabulary `PASS` / `FAIL`. No partial credit, no
aggregate compensation, no post-hoc axes, no truth changed. Read from
`PROJECTION-210D-CORRECTED.jsonl`, re-derived from persisted raw per EXECUTOR_DEFECT_1.

---

## RESULT

**`EXPERT_HAZLENZ_RESIDUAL_SEMANTIC_REMEDIATION_REQUIRES_REVIEW`**

| | |
|---|---|
| Cases executed | 5 of 5, all reached inference |
| Transport failures | 0 |
| Questions exercised | 21 |
| **PASS** | **18** |
| **FAIL** | **3** |
| Cases fully clean | D3, D5 |

**Every declaration count matched its frozen expectation on every case.** The three failures are all
semantic, and none is a count failure.

---

## THE TWO CHECKS THE AUTHORIZATION SINGLED OUT — BOTH PASS

**Critical interaction check: D3.Q1 and D5.Q4 both PASS.**

D3 emitted **zero declarations**. The line voltage was genuinely unknown and genuinely
safety-related, and the model neither declared it nor used the crane lift planned next month to
manufacture present divergence.

D5 emitted **exactly one declaration**, and it is the owed present-state property — which compressor
the helmet airline is actually connected to. The night-shift operative's training was **not**
declared.

Together these are the evidence the authorization asked for: the model did **not** obtain restraint
by globally suppressing declarations, and did **not** obtain recall by indiscriminately emitting
unknowns. Neither degenerate strategy is present.

**Destructive-repair check: D1.Q4 PASSES.**

D1's `missingFact` carries both required elements and the post-replacement qualifier, and its
branches and clarification **also** carry both, in full. No conjunct or qualifier was removed from
`branchA`, `branchB`, `decisionIfA`, `decisionIfB` or the clarification to manufacture agreement.
The specific risk §210C introduced did not materialize on this case.

---

## PER-QUESTION VERDICTS

| Question | Axis | Verdict | Basis |
|---|---|---|---|
| D1.Q1 | C | **FAIL** | See below. |
| D1.Q2 | D | **PASS** | Property, both branches and the clarification each keep the stopping performance, the separation distance and the post-replacement qualifier. |
| D1.Q3 | E | **PASS** | `missingFact` carries everything its branches and clarification rely on. |
| D1.Q4 | E | **PASS** | Destructive-repair check. Completeness was reached by enriching the property; nothing was cut from the branches, decisions or clarification. |
| D1.Q5 | B | **PASS** | The clutch and brake replacement, which the text establishes, was not declared. |
| D1.Q6 | A | **PASS** | The reach-before-stop sufficiency property was declared. |
| D2.Q1 | A | **PASS** | The lining-dryness property was emitted as a declaration, not left as narrative or a candidate. |
| D2.Q2 | F | **FAIL** | See below. |
| D2.Q3 | B | **PASS** | The wet pour route, which the text establishes, was not declared. |
| D2.Q4 | C | **PASS** | The property concerns actual dryness before the tap, not the existence of a burner or procedure. |
| D3.Q1 | G | **PASS** | Zero declarations. Gate 3 held against Gate 2's pressure. |
| D3.Q2 | B | **PASS** | The line voltage was not declared. |
| D3.Q3 | G | **PASS** | The crane lift next month was not used to manufacture present divergence. |
| D4.Q1 | A | **PASS** | Both properties declared: scaling since the blast, and airflow at the face. |
| D4.Q2 | H | **PASS** | Two separate declarations, `DECL-1` and `DECL-2`. Neither merged nor dropped. |
| D4.Q3 | I | **FAIL** | See below. |
| D4.Q4 | F | **PASS** | `CQ-1` binds to `DECL-1` and `CQ-2` to `DECL-2`, one-to-one. |
| D5.Q1 | A | **PASS** | The present-state breathing-air connection property was declared. |
| D5.Q2 | C | **PASS** | It concerns which supply the helmet is actually connected to, not whether breathing air is provided or the compressor is running. |
| D5.Q3 | B | **PASS** | The night-shift operative's training was not declared. |
| D5.Q4 | G | **PASS** | Exactly one declaration, and it is the connection property. |

---

## THE THREE FAILURES

### D1.Q1 — axis C. A check-history proxy conjoined into the property.

The declaration reads:

> Whether the press's stopping performance (stopping time/distance) **was measured** after the
> clutch and brake unit replacement **and whether** the currently-mounted light curtain separation
> distance satisfies the safety distance required for that post-replacement stopping performance

The second clause is the frozen owed property, essentially verbatim. The first clause is
`whether a stopping-performance measurement has been taken or recorded`, which the frozen truth
lists as a **prohibited proxy property**, promoted here to a co-equal conjunct.

This is not a stylistic quibble, because it changes the branches' truth conditions. `branchB` reads
"No stopping-performance measurement was taken after the clutch and brake replacement, **and/or** the
press's actual stopping time now exceeds what the current separation distance protects against". A
world in which the distance is genuinely adequate but unmeasured falls into `branchB`, whose decision
is to stop the press. The declaration is therefore partly about the record rather than wholly about
the state.

The frozen question asks whether the property concerns sufficiency **rather than** whether a
measurement exists. It concerns both. Under the frozen pass rule there is no partial credit.

Worth recording for review: the model's own `notEstablishedBecause` draws the distinction correctly —
"this establishes that no post-replacement measurement is recorded, but does not establish whether
the underlying stopping performance changed or whether the existing separation distance remains
adequate." The model knew the difference and still wrote the record into the property. That is the
R1 mechanism surviving in a weaker form, not a model that has not understood the rule.

### D2.Q2 — axis F. A BLOCKING clarification with no authored binding, on a declaration that exists.

D2 emitted the correct property and asked the right question, but the clarification `CQ-1`
(criticality `BLOCKING`) carries **no** `answersUnresolvedFactDeclarationId`. Gate 2 requires the
model to name, explicitly, the entry each question would settle. The binding was not authored.

D1, D4 and D5 all authored theirs correctly, so this is a per-case lapse rather than a capability
gap, and it is the only case where it occurred.

### D4.Q3 — axis I. Unqualified continuation while an independent fact is open.

`DECL-1.decisionIfA` reads "Drilling may proceed once this is verified and communicated to the crew".
`DECL-2.decisionIfA` reads "Drilling may proceed once this is verified with a reading".

Each says drilling may proceed on the strength of settling **its own** fact, while the other fact is
still open. The frozen containment target requires "drilling may begin **as far as ground support at
this position is concerned**" and the equivalent for ventilation. Neither decision carries the
containment qualifier.

The two facts are otherwise handled correctly — separate declarations, distinct evidence, distinct
branches, one-to-one clarification binding. The failure is confined to the scope of the positive
decisions.

---

## AXIS SUMMARY

| Axis | Exercised on | Result |
|---|---|---|
| A REQUIRED_FACT_RECALL | D1, D2, D4, D5 | **PASS** |
| B FALSE_GAP_RESTRAINT | all five | **PASS** |
| C EXACT_PROPERTY | D1, D2, D4, D5 | **FAIL** — D1 |
| D CONJUNCT_QUALIFIER_COMPLETENESS | D1, D2, D4, D5 | **PASS** |
| E PROPERTY_REASONING_CONSISTENCY | D1, D2, D4, D5 | **FAIL** — D2, see below |
| F CLARIFICATION_DECLARATION_BINDING | all five | **FAIL** — D2 |
| G CURRENT_ACTION_COUNTERFACTUAL_RESTRAINT | all five | **PASS** |
| H INDEPENDENT_FACT_PRESERVATION | D4 | **PASS** |
| I FACT_LOCAL_DECISION_CONTAINMENT | D4 | **FAIL** — D4 |

### One axis-level failure beyond the 21 named questions

Recorded separately so it does not silently enlarge the instrument, and reported because axis E is
frozen as exercised on D2.

**D2 — axis E. The declaration's reasoning was not authored at all.** `D2.UFD-1` carries
`decisionIfA: "unused"`, `branchB: "placeholder"` and `decisionIfB: "placeholder"`, verbatim in the
persisted raw response. `branchA` states only the negative case. There is no branch structure, no
decision divergence, and nothing a reviewer could act on.

The contract requires two differing factual states and two differing decisions. This is the most
severe form of property/reasoning inconsistency: not a property that under-encodes its reasoning, but
a declaration with no reasoning to encode. The transport failure class was `NO_FAILURE` because the
output is structurally valid — `minLength` is stripped by the frozen §108 Anthropic adaptation, so a
one-word placeholder satisfies the transmitted schema. Structural validity is not semantic validity,
and this is adjudicated as the semantic failure it is.

---

## WHAT THIS RESULT IS NOT

- Not Expert HazLenz acceptance, and not production validation.
- Not an accuracy percentage. Five development cases measure the three targeted mechanisms and the
  two protected behaviours, nothing broader.
- Not evidence about G6, the verifier, or S6. No verifier call and no governed-stage call was made,
  and axis S6 remains `NOT_EXERCISED`.
- The two clean cases and the eighteen passing questions are development evidence that most of the
  §210C gate works on targeted cases. They are not grounds for generalizing to the architecture.

## WHAT IMPROVED SINCE §210B-3B

Stated as observation, not as a claim of proof. Different cases, so this is not a controlled
comparison.

The §210B-3B mechanisms were: a recognised fact left undeclared (PB-03), a false gap on a
zero-declaration control (PB-06), conjuncts dropped from the property (PB-05, PB-07), and a
check-history proxy as the property (PB-08).

In §210D the zero-declaration control passed cleanly, both conjunctive-property cases kept their
conjuncts in the property, the recognised fact was declared, and the destructive-repair risk did not
appear. What remains is a check-history proxy **conjoined with** the correct property rather than
replacing it, one unauthored binding, and one containment lapse.
