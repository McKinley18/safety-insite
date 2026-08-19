# Negation / Control-State Contract

Reusable classification for how classifier-relevant evidence in an observation should be treated, per the remediation task's Phase 3 spec:

| State | Definition | Classifier behavior after this fix |
|---|---|---|
| AFFIRMED | Hazard term present, not negated, no competing safe/effective-control language nearby | Scores normally (unchanged) |
| NEGATED | Hazard term present only inside a negation window ("no," "not," "without," "never," "wasn't observed," etc. — see `negation-context.util.ts`) with no other non-negated occurrence elsewhere in the text | `hasNonNegatedSubstring`/`testNonNegated` exclude it from scoring |
| RESOLVED_BY_EFFECTIVE_CONTROL | A control object (guard/guardrail/energy isolation) is described as installed/enclosed AND explicitly confirmed effective, with no failure/defeat language anywhere in the text | New "Verified Effective Control" guardrail applies a -60 penalty to the relevant profile |
| UNKNOWN | Control condition explicitly stated as unconfirmed/could-not-be-determined | Not specifically boosted or suppressed by this fix; scores on whatever raw signals are present, generally landing at low/medium confidence already (verified in the adversarial matrix) — flagged here as a real, defensible follow-up rather than claimed as solved |
| AMBIGUOUS | Evidence too sparse/generic to support a specific family | Unaffected by this fix — the existing low-score → low-confidence path already handles this correctly (verified: the pre-existing "ambiguous-evidence" case scored 25% low before and after) |

## Design principles enforced by this contract

- A positive hazard keyword inside a negated span must not automatically promote the hazard (`hasNonNegatedSubstring`).
- The same hazard affirmed elsewhere in the same observation, even if a different mention of a related term is negated, must still score (`hasNonNegatedSubstring`/`testNonNegated` scan every occurrence, not just the first, and only require one non-negated hit) — verified directly with the "positive-after-negation" and "mixed-one-negated-one-affirmed" adversarial cases.
- Effectiveness discounts (`RESOLVED_BY_EFFECTIVE_CONTROL`) are gated behind an explicit, broad failure-language check that fires on ANY hint of "missing/broken/loose/not verified/etc." anywhere in the text — on ambiguous evidence, the system defaults to keeping the hazard flagged, not to suppressing it. This is a deliberate safety-conservative bias, matching every other heuristic guardrail already present in `weighted-classifier.service.ts`.
- No fix in this pass hard-codes recognition of the specific benchmark sentences used to discover the defect — every change is a general term/pattern (a shared substring-negation utility, a generic "no deficiencies were noted"/"clean and dry" style closing-phrase signal, a generic control-effectiveness-language guardrail) applicable to any future observation using similar real-world phrasing, not a lookup keyed to the exact adversarial-matrix text.
