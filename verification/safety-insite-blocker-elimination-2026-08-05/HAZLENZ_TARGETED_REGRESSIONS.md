# Targeted regressions

Authenticated API regressions exercised:

- Active solvent/container leak: `chemical_release` plus review-only `hazard_communication` candidate.
- Labeled solvent leak with SDS: `chemical_release` without invented identity deficiency.
- Closed unlabeled drum with unknown contents/release status: `hazard_communication` only; no `chemical_release`.
- Closed labeled intact container with no release: no active release/identity promotion.
- Powered industrial truck reversing in a pedestrian aisle: powered-truck family retained alongside mobile-equipment routing.
- Parked/secured/out-of-service truck: explicit powered-truck fallback suppressed.
- Active welding/cutting/hot-work operation: hot-work family retained alongside adjacent hazards.
- Verified controlled machine/container conditions: no inherited hazardous-energy candidate in guided output.

Build and authenticated frozen-corpus runs provide the machine-readable regression evidence.
