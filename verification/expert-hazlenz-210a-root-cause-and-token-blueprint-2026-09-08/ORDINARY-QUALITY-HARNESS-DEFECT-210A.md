# ORDINARY-QUALITY-HARNESS-DEFECT-210A

**This is an EVALUATION-HARNESS defect. It is not an Expert HazLenz behavioural failure and is
recorded separately so the two are never conflated.**

## Defect

`backend/scripts/compute-208-gates.ts` emits all seven ordinary-quality criteria with a hardcoded
outcome and never computes them from the recorded verdicts:

- **line 185** — `ORDINARY_QUALITY_CRITERIA.map(c => ({ ... }))` attaches a fixed outcome to every
  criterion rather than evaluating its threshold against the slots it is measured on.
- **line 215** — `ordinaryQualityOutcome: 'AWAITING_ADJUDICATION'` is a string literal.

Consequence: with §209 complete at 177/177 and `readyForGateComputation: true`, `GATE-RESULTS-209.json`
still reports every criterion as `AWAITING_ADJUDICATION`, carrying the note "cannot be evaluated before
adjudication" — which is no longer true. OQ-1 … OQ-7 are **unevaluated**, not passing and not failing.

## Scope of impact — none on the §209 result

The §209 acceptance terminal is unaffected. Eight hard safety-critical gates (G1–G7, G9) plus coverage
gate G14 failed, and the frozen rule is explicit: *no aggregate or ordinary-quality result may
compensate for a failed hard gate.* The determination `NOT_ACCEPTED` stands on the hard gates alone
and does not depend on any OQ value.

What is lost is **diagnostic**, not dispositive: OQ-1 (axis C), OQ-2 (axis E), OQ-3 (axis D), OQ-4
(axis G), OQ-5 (axis M on the single ordinary-classed fact AC-09-F1), OQ-6 (governed axes S and N) and
OQ-7 (the ≤9 AMBIGUOUS ceiling) would each have quantified how close the ordinary quality bar is —
information that would sharpen §210B sequencing but changes no gate.

## Not repaired in this slice

Repair was considered against the four conditions in the authorization and **is not applied**:

| Condition | Assessment |
|---|---|
| entirely isolated | **Yes** — the change is confined to the OQ block; hard-gate evaluation is a separate code path |
| zero-provider | **Yes** |
| does not alter frozen §209 results | **Would alter `GATE-RESULTS-209.json`**, which is now a recorded §209 acceptance artefact with hash `c52b6944…c6d23a` |
| product-owner authorization still required | **Yes — not given** |

The third condition is decisive. `GATE-RESULTS-209.json` was written as part of the completed §209
acceptance computation. Re-running the corrected script would overwrite a frozen result artefact, and
that requires explicit authorization even though the hard-gate outcomes would be unchanged.

## Recommended handling in §210B

1. Fix the two lines so each criterion is evaluated against its own slots and thresholds.
2. **Do not overwrite `GATE-RESULTS-209.json`.** Emit the corrected computation as a new, separately
   named artefact that carries the §209 worksheet identity, so the frozen record and the corrected
   record can both be inspected.
3. Add a regression test asserting that no gate or criterion outcome is a literal — that every
   reported outcome is derived from slot verdicts.
4. Re-assert that the hard-gate results are byte-identical before and after, so the repair is shown to
   be diagnostic-only.
