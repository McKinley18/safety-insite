# HS-A1 draw 6 — additive-gap omission adjudication packet

**FOR HUMAN ADJUDICATION. §168, 2026-09-04. Zero provider calls. This packet assigns no
disposition.**

---

## 1. What happened, mechanically

One of the six HS-A1 draws bound the supplied owed fact and emitted **no** additive nomination. The
other five bound the same fact and additionally nominated the auger-isolation gap.

| | draw 6 | the other five |
|---|---|---|
| `bindingFactKey` | `owed:hs-a1:flame_failure_safeguard_functional_status` | same |
| `owedFactDeclarations` | that key → `BOUND_BY_CLARIFICATION` | same |
| `clarificationSourceMode` | `SUPPLIED_FACT` | `SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION` |
| additive nomination | **none** | present |
| ledger facts before → after | 1 → 1 | 1 → 2 |
| owed fact status after | `COVERED` | `COVERED` |
| contract admission | admitted | admitted |

Nothing was removed, replaced or implicitly covered on any of the six.

## 2. The draw-6 clarification, verbatim

> Can facility personnel confirm, by physical inspection or functional test (not visual sighting
> from the walkway), whether the flame-failure device on the burner is currently functional and
> properly wired, since it cannot be seen from the walkway due to the shroud?

## 3. The gap that was not raised

The product owner's standing determination (§165):

```
FLAME_FAILURE_FACT   = decision-critical
AUGER_ISOLATION_FACT = independently decision-critical
RELATIONSHIP         = SIMULTANEOUS_INDEPENDENT_GAPS
```

The auger fact was **not** supplied to the verifier on any draw. Reaching it required the verifier's
own nomination path. Five draws took it; this one did not.

---

## 4. The architectural question, answered from frozen material before the disposition

The authorization directs that this be settled first, because it decides what the omission *is*.
The answer below is read off the frozen contract and instruction, not inferred from behaviour.

### `OWED_FACT_PRESERVATION` — **required**, and specified

The v3 contract requires every supplied `factKey` to receive exactly one declaration
(`OWED_FACT_NOT_DECLARED` refuses a verdict that omits one), refuses a binding outside the closed
set, and refuses any route to `COVERED` other than an explicit admitted binding. The §165 coverage
postcondition fires on any owed fact left `UNRESOLVED`. This axis is fully specified and
deterministically enforced.

### `ADDITIVE_GAP_DISCOVERY_RECALL` — **permitted, never required, and never given a target**

Three pieces of frozen material say so:

1. **The v3 contract caps nominations at one and requires none.** `nominatedFact` is nullable; there
   is no admission code for a missing nomination, and there could not be one — the contract has no
   way to know a fact it was never given exists.
2. **The instruction's standing prior is the opposite of a recall target.** v3 inherits v2's text
   byte-identically: *"THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER… You are not looking for
   something wrong, you are not completing the analysis, and you are not improving it."* An
   instruction that tells the model nomination is usually unnecessary cannot simultaneously be read
   as requiring one.
3. **The verifier's jurisdiction is bounded to the clarification set.** *"Your jurisdiction is
   EXACTLY ONE THING: whether the clarification set is right. You do not re-analyse the hazards."*
   Exhaustive discovery of every independently valid gap is hazard analysis, which is the first
   pass's job and explicitly not the verifier's.

**Consequence for reading draw 6.** The two axes are separate and only one of them has a
specification. On `OWED_FACT_PRESERVATION`, draw 6 is indistinguishable from the other five: the
owed fact was bound and covered. On `ADDITIVE_GAP_DISCOVERY_RECALL`, draw 6 differs — but that axis
has no contractual requirement, no threshold, and no measurement basis, so the difference cannot be
scored as a contract violation.

**What is genuinely open** is a product question the contract does not reach: *should* the
architecture require, or at least measure, discovery of independently valid gaps beyond the supplied
set — and if so, at what cost to the "usually NO" prior that currently protects against
over-questioning? That question is what this adjudication decides, and it is not answered here.

**A measurement caution that bears on the disposition.** If additive-gap discovery becomes a scored
axis, its denominator is the set of independently valid gaps a human has confirmed exist. Exactly
one such gap has ever been confirmed on one row. A 5-of-6 figure on a denominator of one row is not
a recall rate and must not become one.

---

## 5. Allowed dispositions

- [ ] `TARGET_CORRECT_BUT_SECONDARY_GAP_OMITTED`
- [ ] `SECONDARY_GAP_NOT_REQUIRED_IN_THIS_VERIFIER_ROLE`
- [ ] `MULTI_GAP_RECALL_DEFECT`
- [ ] `AMBIGUOUS`

Omission is **not** to be classified as a verifier failure by default; the architectural question in
§4 is the ground for whichever disposition is chosen.

## 6. What each disposition would commit the programme to

Recorded so the choice is made with its consequences visible, not as advocacy for any of them.

| disposition | what follows |
|---|---|
| `TARGET_CORRECT_BUT_SECONDARY_GAP_OMITTED` | draw 6 is on-target and the omission is recorded as an observation. Additive-gap discovery stays unspecified and unmeasured. No remediation. |
| `SECONDARY_GAP_NOT_REQUIRED_IN_THIS_VERIFIER_ROLE` | the axis is closed deliberately: multi-gap discovery becomes the first pass's responsibility, and the verifier's job stays preservation-only. The §164 multi-gap preservation design would need its scope restated. |
| `MULTI_GAP_RECALL_DEFECT` | a new required axis is opened. It needs a specification, a human-confirmed denominator across more than one row, and a threshold set before any measurement — and it puts pressure on the "usually NO" prior, which is currently the only thing restraining over-questioning. |
| `AMBIGUOUS` | draw 6 is removed prospectively from any additive-gap denominator; historical §167 records stay unchanged. |

**Reviewer:** ______________________  **Date:** ____________
