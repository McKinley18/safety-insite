# Canonical guided finding response

## Decision

The existing production response remains backward compatible and gains one canonical `guidedFinding` projection. Detailed evidence, predicate decisions, citations, and legacy fields remain available internally; the field UI consumes the projection.

## Visible contract

- `observedCondition`, `hazardCategory`
- one `primaryStandard`, explicitly `direct` or `candidate`
- at most two materially distinct `additionalStandards`
- no more than three deduplicated, stable clarification questions
- categorical, provisional-or-confirmed risk proposal
- immediate, permanent, and verification corrective-action fields
- mandatory qualified-review status
- limitations and deterministic provenance

Primary promotion requires a supported applicability decision. Unknown material predicates keep a standard visibly candidate. Contradicted/not-applicable decisions are excluded. The contract contains a deterministic input hash and engine/rules versions, but no wall-clock field.

## Compatibility

The adapter is attached at the controller boundary after evidence-boundary and visible-citation safeguards. Existing clients continue receiving existing response fields. Saved analysis snapshots and report source snapshots preserve `guidedFinding`.

## Tests

`npm run test:guided-finding-response`: 21 assertions passed, covering direct/candidate presentation, confidence labels, evidence gaps, stable/deduplicated questions, provisional risk, action tiers, human review, and determinism.

