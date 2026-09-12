# §181 — HR-04 STRUCTURAL REPLAY REPORT

Zero provider calls, zero database operations, zero source-code changes to runtime. The replay drives
the real, already-integrated, inactive modules with DEVELOPMENT-population fixture state.

---

## The question A0 exists to answer

> With the architecture as it exists **today**, can HR-04 be represented such that *guard present*
> does **not** structurally erase the owed securement fact — **without** adding `requiredProperty`,
> `propertyType`, a securement enum, a function enum, or any new settlement field?

**Answer: yes.** Checks 1.1–1.5, all passing.

## How the distinction is carried

Two owed facts, two `factKey`s:

```
owed:guarding:guard_presence                      span: "The fixed guard ... is in position."
owed:guarding:current_securement_of_fixed_guard   span: "the fastenings were last torque-checked
                                                          at the annual service"
```

The securement fact carries a governed settlement target derived from `app-mg-01` with no new field:

> *"Evidence establishing guarding_status by a verification method the governed record for 1910.212
> recognises."*

**The distinction is carried by `factKey` identity plus `acceptableEvidence.requirement`.** No property
field was needed, and the property vocabulary §178 refused to enumerate stays unenumerated.

## What happens when presence is settled

| step | result |
|---|---|
| admit both facts | both `UNRESOLVED`, ledger holds 2 |
| representing presence at all | securement fact **not removed**; `factsRemoved` empty (1.3) |
| settle the **presence** fact via `ADMISSIBLE_EVIDENCE` | presence → `SETTLED_BY_EVIDENCE`; securement **still `UNRESOLVED`** (1.4) |

> **Presence cannot structurally erase securement, because they are different facts.** The ledger is
> append-only, `factsRemoved` is empty, and `preservationViolations` reports none (P6).

This is the architectural property §180 hoped for and A0 confirms it holds **today**, in the shipped
inactive modules, with no change of any kind.

## What the replay deliberately did not do

The replay **did not decide** whether the `app-mg-01` criterion actually settles securement. It
cannot, and it must not:

```
SEMANTIC_JUDGMENT_REQUIRED — whether "a verification method the governed record for 1910.212
recognises" settles CURRENT SECUREMENT is a semantic question. This replay stops here.
```

That branch stops exactly where `CLARIFICATION_EVIDENCE_SUFFICIENCY = SEMANTIC_JUDGMENT_REQUIRED`
says it must. Proof P5 asserts no matcher, classifier, similarity score, embedding or property
comparison was introduced — checked against the code with comments stripped, so the file is not
punished for describing what it refuses to do.

**And the alignment audit makes that stopping point sharper than it looks.** `app-mg-01`'s only
verification method is `physical_inspection`, which the audit classifies
`QUESTION_STRONGER_THAN_METHOD` against its own *"Is the guard functional?"* question. So the
criterion HR-04's fact would carry is one a human reviewer should be expected to judge
**insufficient** — and the architecture's correct behaviour is to leave the fact `UNRESOLVED`, which
is what it does.

## Positive controls

| row | owed fact | result |
|---|---|---|
| **HR-06** | interlock function after tooth change | a bound question clears the coverage warning (5.1) |
| **HR-08** | local isolator lockout, `LIFE_CRITICAL` | unbound → `TARGET_COVERAGE_WARNING = true`, key listed uncovered (5.2); carries a governed criterion from `app-loto-01` (5.3) |
| **HR-10** | settled positive control | settling removes it from the unresolved set and clears the warning **without dropping it** (5.4) |

5.4 is the budget property §180 predicted, now demonstrated: **a settled fact stops competing for the
question budget by ceasing to be owed**, which is categorically different from being deferred or
suppressed.

## Fixture provenance, and why it is safe

The owed facts are `DEVELOPMENT_HUMAN_TRUTH` in a `DEVELOPMENT` population. Proof P2b drives the
boundary directly: constructing a `PRODUCTION` ledger from the same fact **throws**
`DEVELOPMENT_HUMAN_TRUTH_IN_PRODUCTION_POPULATION`.

They are **not** a re-authoring of the frozen §174 truth. The frozen verdicts stay REQUIRED/SILENCE,
no row text was touched (P3, 0 drifted), and nothing in this replay was scored against them. The
HR-05 and HR-07 facts are labelled in their own `whyUnresolved` text as replay constructs whose
frozen truth is SILENCE and is not revisited.

## What this replay does NOT establish

- **Not** that HR-04 is behaviourally fixed. No model ran. The replay shows what the architecture can
  *represent*, not what a provider would *do* when handed it.
- **Not** that the settlement criterion is adequate — that is `SEMANTIC_JUDGMENT_REQUIRED` and, on
  `app-mg-01` specifically, the audit suggests it is not.
- **Not** that displaced-fact leakage is fixed. See `A0-DISPLACED-FACT-REPLAY.md`: the controls hold
  structurally, and whether a model uses them is unmeasured.
