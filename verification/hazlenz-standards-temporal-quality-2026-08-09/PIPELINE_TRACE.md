# Pipeline trace

## Standards

`POST /safescope-v2/classify` → `SafeScopeV2Service` orchestration → decomposition/family routing → standard-applicability rules and citation ranking → `standardApplicability`, `standardDecisions`, `primaryCitation`, and narrative/display projection. Baseline evidence shows applicability structures are present, but `standardDecisions` is often advisory/empty while `standardApplicability.evaluationResults` contains the richer rule evaluation. This is a composition/depth gap, not a demonstrated citation-ranking recall failure.

## Temporal

`classify` → `MultiHazardDecompositionService.inferConditionState(fragment, fullObservation, domainId)` → per-hazard `conditionState`, `temporalEvidence`, `currentCondition`, and `correctionStatus` → `SafeScopeV2Service` response-level state/suppression → finding snapshot and Step 2 rendering. The defect was in decomposition state inference: intermittent and planned activity wording previously fell through to `ACTIVE`, and correction evidence was not consistently recognized when it appeared in the full observation rather than the hazard fragment. The narrow fix adds evidence-bound `INTERMITTENT`/`PLANNED_FUTURE` states and recognizes verified replacement/removal evidence without changing association or standards ranking.
