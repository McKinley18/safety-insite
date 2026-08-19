# Baseline defect taxonomy

- `TEMPORAL_INTERMITTENT_COLLAPSED`: recurring/startup-only conditions returned `ACTIVE`.
- `TEMPORAL_FUTURE_AS_CURRENT`: scheduled excavation/hot work was treated as active rather than planned.
- `TEMPORAL_CORRECTION_CONTEXT_LOSS`: replacement/removal evidence in the observation was not carried to the hazard fragment.
- `TEMPORAL_TOP_LEVEL_UNKNOWN`: response-level `requiresHumanReview` logic frequently masked a more specific decomposed state.
- `STANDARD_PREDICATE_WEAK`: applicability evaluation existed, but the user-facing decision/rationale was generic or advisory.
- `STANDARD_SCOPE_DEPTH`: multiple plausible jurisdiction standards remain visible without a consistently explicit scope predicate.

The temporal fix addressed the first three categories narrowly. The standards categories remain an explicit next implementation target; no scenario-specific phrase patch was added.
