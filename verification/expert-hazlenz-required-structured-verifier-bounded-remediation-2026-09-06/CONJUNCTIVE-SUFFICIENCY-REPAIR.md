# §191 — Repair 2: conjunctive evidence sufficiency

**Evidence class: MODEL_DIAGNOSTIC.** This repair rests on §190's model adjudication of a
15-execution cohort. The frozen human semantic gate remains `UNMEASURED` at 65/112. If that
instrument is later completed and disagrees, the basis for this repair changes with it.

---

## The defect

§190 judged all three HR-08 executions `CLARIFICATION_EVIDENCE_SUFFICIENT = FAIL`. The owed fact is
**conjunctive** — *isolated **AND** proved dead* — and its own `whyUnresolved` repeats the
conjunction. The first-pass question the verifier certified offers a **disjunction**: a truthful
"yes" is obtainable on the strength of a lock having been applied, which is a *different act* from
proving dead and establishes one conjunct of two.

Step 3 of v3 already demanded that an answer *"would settle the fact that changes the decision"*.
What was missing was **how to run that test on a fact requiring several things**: nothing told the
verifier to decompose the owed fact and check the question against each part.

## The general principle, as the authorization states it

> **When an owed fact contains multiple necessary conjuncts, a clarification is sufficient only if
> its answer would establish every required conjunct.**

## What v3.1 adds

Sixteen lines at the end of step 3 — where the sufficiency test already lives. Full text in
`SOURCE-DIFF.md`. Four things are stated:

1. **Decompose, then test each part.** *"Read the fact you were given, and list every separate thing
   it requires. Then take the question AS WRITTEN and ask, for EACH of those things on its own,
   whether an answer would establish it."* The examples given are structural rather than domain
   terms — *a thing done AND proved*, *a thing done AFTER one event and BEFORE another*, *a state
   reached AND confirmed* — so the rule reaches temporal conjuncts as well as act-and-proof pairs.

2. **All, not some.** *"The question is sufficient only if an answer would establish EVERY one of
   them. If it would establish some and leave the others open, it is NOT sufficient, however exactly
   it names the topic."* The closing clause is deliberate: it separates **aim** from **power**,
   which is exactly the pair §190 had to hold apart on HR-08, where the question's target was
   correct and its reach was not.

3. **The weakest-branch rule for disjunctions.** *"Watch the word 'or'. A question offering
   alternatives is answered by whichever is easiest to say yes to, so read it as satisfied by its
   WEAKEST branch, and ask whether that branch alone would establish the owed property."*

4. **No trade shorthand may supply a missing conjunct.** *"Judge this from the fact you were handed
   and the two answers it states — not from what a term usually implies in the trade. If the fact
   requires two things, and someone who did only one of them could answer the question truthfully,
   the question does not reach the fact."*

Point 4 is the one the authorization was most specific about — *"Do NOT assume 'lockout' semantically
entails proof-of-dead unless the supplied fact/evidence contract explicitly defines that
equivalence."* It is implemented as a **general prohibition on importing customary meaning**, with no
term named. That also answers the strongest counter-argument on HR-08 in the right place: under OSHA
1910.147(d)(6) a properly performed lockout does include verification, and the rule's response is not
to deny that but to say the verifier reasons from the supplied owed property, not from what the term
usually carries.

## No row-specific wording

The authorization requires the fix be stated generally. Proof suite **B.9** enforces it: the rule
text is scanned for fifteen cohort terms — *auger, isolator, lockout, dryer, accumulator, burner,
debarker, interlock, conveyor, guard, torque, flame, hydraulic, HR-0, HR-1* — and the suite fails if
any appears. None does.

The suite's fixtures are invented for the purpose and drawn from neither the cohort nor its
industries: a two-conjunct fact (*drained **and** confirmed empty*) and a three-conjunct temporal
fact (*reset, **after** the overhaul, **before** restart*), each with question variants reaching one
conjunct, offering a disjunction, or reaching both.

---

## Deterministic coverage — section B, 10 assertions

| assertion | proves |
|---|---|
| B.1 | the rule is present in the v3.1 prompt |
| B.2–B.3 | it requires listing every requirement and testing each on its own |
| B.4–B.5 | sufficiency requires **every** conjunct; partial coverage is explicitly not sufficient |
| B.6 | a disjunctive question is read as its weakest branch |
| B.7–B.8 | trade shorthand may not supply a conjunct; the "did only one of them" test is concrete |
| B.9 | **no §187 cohort term appears in the rule** |
| B.10 | the generic fixtures declare 2 and 3 conjuncts respectively |

## The honest limit

These assertions prove the rule **is present, correctly scoped and generically stated**. They do not
prove it works. Whether a model given this instruction actually decomposes a conjunctive owed fact
and rejects a disjunctive question is a **behavioural** question, and only a fresh prospective hosted
cohort can answer it — which §191 does not authorize. The proof suite prints that limit in its own
output rather than leaving a reader to infer it.

A cohort designed to test this should include owed facts with **act-and-proof** conjuncts and with
**temporal** conjuncts, paired with questions that reach one part, all parts, and a disjunction — and
should include sufficient questions too, so the instrument can detect over-rejection as well as
under-rejection.
