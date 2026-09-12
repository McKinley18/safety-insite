# §151 — The Hardened Fixture-Authoring Standard

**Binding on every future scored HazLenz clarification fixture. No set may enter hosted spend without
passing it.**

Enforced in two halves, and the split is the whole design:

- **Mechanical** — `scripts/lib/expert-fixture-linter.ts`, `hazlenz.expert.fixture-linter.v1`. Fails
  closed. Every check is exercised against a row built to trip it in
  `test:expert-fixture-hardening` section F, because a gate nobody has seen fire is not a gate.
- **Manual-review signatures** — the semantic properties, carried per row as declarations the author
  signs in their own words. The linter verifies a signature **exists and is substantive**. It never
  verifies that it is **true**, and an unsigned row fails closed.

> **THE LINTER CANNOT CATCH THE DEFECTS THAT ACTUALLY HAPPENED.** All four of §149's and §150's are
> semantic: a presupposition leak, an unstated-premise derivation, a real gap inside a FORBIDDEN row,
> and a second equally exact selector. §148 measured what a keyword rule does when trusted with a
> judgement about meaning — in sample it looked perfect, and out of sample an adverb produced the
> deleting label. Pretending deterministic linting settles fixture validity would be the §140 mistake
> one layer down.

---

## 1. A scored REQUIRED fixture must prove

| # | claim | the defect it prevents |
|---|---|---|
| **R1** | `NOT_ALREADY_STATED` — the missing fact is not stated anywhere in the observation or supplied evidence | a gap that is not a gap |
| **R2** | `NO_PRESUPPOSITION` — no sentence linguistically or logically presupposes it | **class A** — §149 US-D1's *"traffic is passing in **the open** lane"* |
| **R3** | `NOT_DETERMINISTICALLY_DERIVABLE` — not derivable from stated facts without an added premise | **class B**, in its REQUIRED-side form |
| **R4** | `TWO_PLAUSIBLE_VALUES` — at least two materially plausible values remain open | a rhetorical question |
| **R5** | `BRANCHES_CHANGE_A_CURRENT_DECISION` — those values change a contract-valid `affectedDecision` **today, not as a follow-up** | **class F** — §150 RB-B1, whose two outcomes read differently and converged on the same current action |
| **R6** | `NO_HIDDEN_DEFAULT` — no supplied record or stated fact collapses a branch | §147 CR-E1, where the record supplied the unknown branch's default |
| **R7** | `SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED` — the expected question targets the only exact missing fact, **or every equally exact selector is enumerated as acceptable** | **class I** — §150 RB-D1 |
| **R8** | `AFFECTED_DECISION_JUSTIFIED` — the expected label is the decision the answer blocks | **class E** |

**R5 has a specific discipline.** The signature must speak to what happens **now**. Two textually
different outcomes are not two decisions if both reduce to the same immediate action, and the
mechanical check is a string comparison that cannot see the difference. *(Two of this operation's own
sixteen signatures failed that discipline on first writing and were rewritten to state the immediate
action explicitly — the check caught its author.)*

**R7 is the change most likely to move a future score.** Where two questions resolve one decision,
**both** are listed and **either** counts as recall.

---

## 2. A scored FORBIDDEN fixture must prove

| # | claim | the defect it prevents |
|---|---|---|
| **F1** | `ESTABLISHED_OR_DECISION_INVARIANT` — the relevant fact is established, or the unknown is decision-invariant | the base case |
| **F2** | `NO_UNSTATED_PREMISE` — reaching that conclusion needs no premise absent from the evidence | **class B** — §149 US-I1, where "cable removed at both ends" needed the premise that nobody reconnects it |
| **F3** | `NO_SIBLING_DECISION_CRITICAL_GAP` — **no other** decision-critical gap remains anywhere in the row, including one introduced as background colour | **class C** — §150 RB-H1's shared CIP caustic header |
| **F4** | `WORDING_CREATES_NO_OPPORTUNITY` — no sentence introduces an entity whose state is left open | the general form of F3 |
| **F5** | `ADVERTISED_ABSENCE_INVARIANCE_DEMONSTRATED` — advertised-absence wording is permitted **only where the invariance is demonstrated in the same observation** | **class J** — §150 RB-F1 versus §149 US-J1 |

**F3 is the claim RB-H1 would have failed**, and it is the one that requires real work: the author
must actively search their own row for a second gap rather than assume the row is about the thing
they meant it to be about.

**F5 is a permission, not a prohibition.** A negative control that says *"X is unknown and X does not
matter"* is the purest available test of the invariance limb, and refusing to author one would remove
the only direct test of it. US-J1 carried the wording and the model correctly stayed silent, because
the control was **observed working** in the same observation. RB-F1 carried the wording with an
ongoing unquantified defect and no demonstrated invariance.

---

## 3. A candidate-family fixture must additionally prove

**Canonical family identity, or an explicit accepted alias mapping.** This is **class D** — §150's
RB-C1, where authored truth said `suspended_loads`, the deterministic engine emitted `cranes_hoists`,
and union coverage read 6/7 for a hazard that was in fact covered.

Mechanically enforced: a truth family outside `CANONICAL_DETERMINISTIC_FAMILIES` must declare a
`familyAliases` mapping, and the alias target must itself be canonical.

---

## 4. The mechanical checks, and each one has been seen to fire

`DUPLICATE_ROW_ID` · `DUPLICATE_DOMAIN` · `MALFORMED_TRUTH_PARTITION` · `TRUTH_BUCKETS_OVERLAP` ·
`TRUTH_FAMILY_OUTSIDE_VOCABULARY` · `NEGATED_FAMILY_OUTSIDE_VOCABULARY` · `NEGATED_FAMILY_IS_FORBIDDEN` ·
`LIFE_CRITICAL_NOT_PRESENT` · `DUPLICATE_GAP_ID` · `GAP_DESCRIPTION_INSUBSTANTIAL` ·
`MISSING_EXPECTED_OPPORTUNITY_METADATA` · `REQUIRED_ROW_WITHOUT_AFFECTED_DECISION` ·
`AFFECTED_DECISION_DISAGREEMENT` · `FORBIDDEN_ROW_CARRIES_EXPECTED_GAP` ·
`FORBIDDEN_ROW_CARRIES_AFFECTED_DECISION` · `DENOMINATOR_INCONSISTENT_WITH_ROW` ·
`DENOMINATOR_CONTAMINATION` · `UNKNOWN_DENOMINATOR` · `FAMILY_ALIAS_MISSING` ·
`FAMILY_ALIAS_TARGET_NOT_CANONICAL` · `OBSERVATION_INSUBSTANTIAL` · `UNSIGNED_REVIEW_CLAIM` ·
`REVIEW_NOTE_INSUBSTANTIAL` · `REVIEW_NOTE_RESTATES_THE_CLAIM` · `UNKNOWN_REVIEW_CLAIM`

`REVIEW_NOTE_RESTATES_THE_CLAIM` exists because a signature that echoes its own claim name is not a
reason. The linter refuses it.

---

## 5. The gate

```
mechanical failures  > 0   ->  BLOCKED
unsigned or hollow   > 0   ->  BLOCKED
both zero                  ->  PASSED, and PASSED MEANS ONLY THIS:
                               the mechanical properties hold, and a human has signed for each
                               semantic property in their own words. The signatures are claims,
                               not proofs, and a later reader may disagree with any of them.
```

Then, and only then, a **manual semantic review** before any provider authorization, and the set's
digest is frozen prospectively so a later run is provably against the reviewed material. **The digest
covers the signatures**, not only the observations — otherwise a row could be re-signed after review
and still match.

---

## 6. Why the standard exists at all

Across §149 and §150 the answer key was wrong four times and **every time in the same direction —
against the model**. Under sound re-adjudication both of §150's REQUIRED misses disappeared.

> **An instrument that errs consistently in one direction is not noisy. It is biased, and it cannot
> certify the thing it is measuring.**

That is the finding this standard answers, and it is why the next empirical step must use the hardened
set rather than a broader run of the old one.
