# HazLenz adjudication patch log

## Production changes

1. backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts
   - Added an evidence-bound UNKNOWN mobile-equipment candidate for unresolved haul-route contexts.
   - Treated the literal active phrase "hot work" as a concrete mechanism for filtering, preventing an active sibling from being discarded.
   - Added focused temporal/decomposition regressions.
2. backend/src/safescope-v2/safescope-v2.service.ts
   - Prevented the generic insufficient-context cleanup from clearing a decomposition that contains concrete hot-work or mobile-equipment evidence.
3. backend/src/safescope-v2/safescope-v2.controller.ts
   - Changed verified-control display normalization to filter only the controlled fragment and preserve active sibling hazards in additionalHazards and multiHazardDecomposition.

## Non-production changes

- Added evaluation-only adjudication/scoring scripts and machine-readable artifacts. Frozen corpus and expected answers were not modified.
- No protected inspection-intelligence file was changed.

## Acceptance

The changes are general evidence-bound rules, not scenario-ID or expected-answer branches. Targeted regressions, the authenticated precision holdout, frozen raw run, and metamorphic run were executed after rebuilding.
