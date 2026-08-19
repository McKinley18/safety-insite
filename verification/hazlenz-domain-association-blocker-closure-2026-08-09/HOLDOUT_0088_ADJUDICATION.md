# holdout-0088 adjudication

Observation: “An unlabeled drum is closed; contents and release status are unknown. The report mentions a prior citation but does not establish that the same condition exists today.”

Expected family: `hazard_communication`.

The fresh response classified the current state as `HISTORICAL`, exposed `domainIntelligence.hazcomGhs`, emitted a `multiHazardDecomposition.primaryHazard.hazardFamily` and `hazards[0].hazardFamily` of `hazard_communication`, and preserved the same family in `historicalHazards`. It also produced HazCom clarification questions and no unsupported active promotion.

Conclusion: **SCORING/ADJUDICATION MISMATCH**, not a recall regression and not a side effect of finding-domain precedence. The prior scorer inspected top-level `family`/`classification` and `additionalHazards` but omitted the canonical nested decomposition and historical-hazard fields. No production code was changed. The generalized verification correction is to score all canonical hazard-family locations, including decomposition hazards and historical hazards.
