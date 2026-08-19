# Condition-state model

HazLenz now carries condition state independently from hazard-family identity. The production response exposes `conditionState` and `conditionStateEvidence`; decomposition fragments retain their own evidence and are filtered with fragment-scoped controls.

States used in this phase are `ACTIVE`, `UNKNOWN`, `CONTRADICTORY`, `SAFE_VERIFIED`, and `HISTORICAL`. A controlled finding can coexist with an active sibling; observation-level controlled handling is only applied when no active decomposition fragment remains. Historical decomposition hazards are also exposed in a structured `historicalHazards` collection and are not included in current `additionalHazards`.

General rules:

- Verified controls suppress active deficiency treatment for that family only.
- Historical statements remain advisory/history and are not promoted as current violations.
- Contradictory same-object/current-time evidence preserves the family, marks uncertainty, and keeps clarification available.
- Missing threshold or jurisdiction facts remain unknown rather than fabricated.
- Decomposition identity is not derived from display order.
- Context-free “unsafe condition near equipment” text is kept `UNKNOWN`/`Unclassified` until a concrete hazard predicate exists; generic classifier fallbacks cannot create a specific active family.
