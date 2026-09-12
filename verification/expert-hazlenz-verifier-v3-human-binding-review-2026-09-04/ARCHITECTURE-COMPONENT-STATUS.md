# Architecture component status — one verdict per component, never one for the architecture

**§168, 2026-09-04. Zero provider calls.**

The authorization forbids collapsing these into a single architecture verdict, and the evidence
makes clear why: the components differ sharply in how much of them has actually been exercised. Two
were never exercised hosted at all, and one of the strongest-looking results is strong only in a
sense that is easy to overstate.

---

## Status legend

| status | meaning |
|---|---|
| `PROVEN_LOCAL` | deterministic proof exists; no hosted evidence needed or available |
| `SUPPORTED_HOSTED` | behaved as specified across the §167 hosted draws |
| `SUPPORTED_HUMAN_REVIEWED` | a human has confirmed the semantic claim behind it |
| `UNEXERCISED_HOSTED` | implemented, but the hosted run never put it in the position it exists for |
| `REQUIRES_MORE_HUMAN_TRUTH` | cannot advance without truth that does not yet exist |
| `REQUIRES_REMEDIATION` | a named defect must be fixed |
| `NOT_READY` | not fit for integration in any form |

---

## 1. `CLOSED_SET_OWED_FACT_LEDGER`

**`PROVEN_LOCAL` + `SUPPORTED_HOSTED`**

44/44 local assertions in §165. Across the 12 hosted draws: 0 facts removed, 0 preservation
violations, 0 implicit-coverage side effects, and the ledger grew on all 5 nomination draws. Every
status change carried a recorded transition with an authority.

Nothing about this component depends on the pending binding review — it governs structure, not
meaning.

## 2. `EXPLICIT_BINDING_FACT_KEY`

**`SUPPORTED_HOSTED`** · `SUPPORTED_HUMAN_REVIEWED` **pending**

Mechanically complete: 12/12 draws produced a syntactically valid key that was a member of the
closed set, and the contract's refusals (typo, case change, non-string, out-of-set) are proven
locally.

**What is not yet established is the only thing that matters semantically:** whether each bound
question actually asks for the fact it bound to. §164 classified that `REQUIRES_HUMAN_TRUTH`, and
`BINDING-ADJUDICATION-FORM.json` is open with all 12 dispositions `null`. Until it returns, this
component's semantic claim is unadjudicated — **not** confirmed by the two §167 columns agreeing,
which is agreement between a declaration and a cue matcher.

## 3. `ADDITIVE_NOMINATION`

**`SUPPORTED_HOSTED`** for the *additive* property · `REQUIRES_MORE_HUMAN_TRUTH` for discovery

Exercised on 5 of 6 HS-A1 draws. In every case the ledger grew and the bound fact survived: the
substitutive failure mode the component exists to prevent did not occur and, by construction, cannot.

The *discovery* question — should the verifier be expected to find such gaps at all, and was draw 6
a defect — is unspecified in the contract and is at adjudication in
`HS-A1-DRAW-6-ADJUDICATION-PACKET.md`.

## 4. `TARGET_COVERAGE_WARNING`

**`PROVEN_LOCAL`** · **`UNEXERCISED_HOSTED` for its primary case**

This is the status most at risk of being overstated, so it is stated carefully.

The warning fired on 5 of 12 draws and was silent on 7, and in every case the computation was
correct. **But it never once fired for the reason it exists.** Its purpose is to catch an *owed*
fact left uncovered; the owed target was `COVERED` on all 12 draws. Every firing was triggered by an
additively **nominated** fact sitting unresolved — a correct secondary behaviour, not the primary one.

So: the set-difference computation is `SUPPORTED_HOSTED`, and the failure mode it was built to
detect **has not occurred hosted even once**. Its value is currently unexercised rather than proven,
and §167's clean result is precisely why.

## 5. `PER_FACT_DECLARATIONS`

**`SUPPORTED_HOSTED`**

12/12 draws returned exactly one declaration per supplied key, none for an unsupplied key, no
duplicates, and no declaration disagreeing with `bindingFactKey`. Zero `CHALLENGE_FACT_VALIDITY`
declarations were emitted, so the challenge path and its arbitration bridge are **unexercised
hosted** — the parsing and refusal rules around them remain `PROVEN_LOCAL` only.

## 6. `CONDITIONAL_SECOND_DRAW_POLICY_C`

**`UNEXERCISED_HOSTED`**

The gate requires an admitted `NO_CLARIFICATION_REQUIRED` on a trigger-positive case. **Zero of the
12 draws fell silent**, so the gate never opened and no second draw was issued. Policy C's hosted
behaviour is entirely unmeasured.

It must not be upgraded on the strength of §167. If anything, §167 weakens the case for needing it:
the silence failure it was designed to mitigate did not occur under v3 on this sample.

## 7. `DEGENERATE_RETRY_POLICY`

**`PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION`** — unchanged · **`UNEXERCISED_HOSTED`**

Zero degenerate responses, zero truncations, zero transport failures across 12 draws. The policy was
never invoked. Its status is exactly what it was before §167.

## 8. `QUESTION_BUDGET`

**`REQUIRES_REMEDIATION`**

A governance gap is now visible in hosted evidence. The §165 budget rule governs how HazLenz
**assembles** questions from surviving owed facts. It does **not** govern the single `question`
string the verifier returns, and nothing in the v3 contract inspects that string for compound
structure — `MORE_THAN_ONE_PROPOSED_CLARIFICATION` refuses an *array*, not two questions inside one
string.

Two HS-A1 draws returned a string containing two questions about **different equipment with
different immediate controls**, which the budget's combination rule would not have authorised. The
rule and the artefact it should govern are administered by different mechanisms.

The *form* of remediation depends on the compound adjudication; the **existence** of the gap does
not, which is why this is `REQUIRES_REMEDIATION` now rather than pending.

## 9. `MULTI_GAP_PRESERVATION`

**`SUPPORTED_HOSTED`** for preservation · `REQUIRES_MORE_HUMAN_TRUTH` for discovery

Preservation held on every draw. Discovery is unspecified, has no threshold, and its only confirmed
denominator is a single gap on a single row — a 5-of-6 figure on that denominator is not a recall
rate and must not become one.

---

## Summary

| component | status |
|---|---|
| `CLOSED_SET_OWED_FACT_LEDGER` | `PROVEN_LOCAL` + `SUPPORTED_HOSTED` |
| `EXPLICIT_BINDING_FACT_KEY` | `SUPPORTED_HOSTED`; human review **open** |
| `ADDITIVE_NOMINATION` | `SUPPORTED_HOSTED` (additivity); `REQUIRES_MORE_HUMAN_TRUTH` (discovery) |
| `TARGET_COVERAGE_WARNING` | `PROVEN_LOCAL`; **`UNEXERCISED_HOSTED` for its primary case** |
| `PER_FACT_DECLARATIONS` | `SUPPORTED_HOSTED`; challenge path `UNEXERCISED_HOSTED` |
| `CONDITIONAL_SECOND_DRAW_POLICY_C` | **`UNEXERCISED_HOSTED`** |
| `DEGENERATE_RETRY_POLICY` | `PROVEN_LOCAL / AWAITING_HOSTED_INTEGRATION`; `UNEXERCISED_HOSTED` |
| `QUESTION_BUDGET` | **`REQUIRES_REMEDIATION`** |
| `MULTI_GAP_PRESERVATION` | `SUPPORTED_HOSTED` (preservation); `REQUIRES_MORE_HUMAN_TRUTH` (discovery) |

**The pattern worth naming.** §167 was a clean run, and a clean run exercises failure-handling
machinery *less*, not more. Four components are wholly or partly unexercised hosted precisely
because nothing went wrong. That is a good outcome for the product and a thin one for the evidence,
and the two should not be confused.
