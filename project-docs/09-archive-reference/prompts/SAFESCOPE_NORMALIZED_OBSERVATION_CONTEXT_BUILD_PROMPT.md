You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 8 local commits.
- HEAD commit is 3d161df Add SafeScope field realism gauntlet v3.
- Recent completed SafeScope layers:
  - observation understanding brain
  - semantic routing guard
  - semantic conflict gauntlet
  - scenario intelligence layer
  - scenario family knowledge registry
  - standard family candidate mapper
  - corrective action reasoning brain
  - evidence gap question generator
  - field realism regression gauntlet v3
- Do not push or deploy.

Goal:
Build the SafeScope normalized observation context object.

Purpose:
SafeScope now has multiple reasoning brains. The next step is to improve consistency, efficiency, and explainability by creating one shared normalized observation context object that all downstream brains can consume instead of each layer repeatedly interpreting the same raw observation independently.

This should make SafeScope faster, easier to debug, easier to test, and less likely to produce inconsistent reasoning across scenario intelligence, standard-family mapping, corrective actions, evidence-gap questions, controls, mechanisms, and regulatory review.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify how raw observations currently flow through:
   - observation understanding brain
   - semantic routing guard
   - semantic conflict gauntlet
   - scenario intelligence service
   - scenario family knowledge registry
   - standard family candidate mapper
   - corrective action reasoning brain
   - evidence gap question generator
   - controls brain
   - evidence brain
   - mechanism brain
   - regulatory brain
   - reasoning orchestrator
   - intelligence orchestrator
   - SafeScope output types
   - validation scripts and benchmark outputs
3. Create a normalized observation context model and service.
4. The normalized observation context object should support:
   - rawObservation
   - normalizedText
   - tokenizedSignals or matchedTerms
   - detectedEquipment
   - detectedComponents
   - detectedTasks
   - detectedUnsafeConditions
   - detectedOperationalStates
   - detectedEnergySources
   - detectedMechanismsOfInjury
   - detectedExposureSignals
   - detectedControls
   - detectedMissingOrFailedControls
   - detectedJurisdictionSignals
   - detectedIndustrySignals
   - ambiguitySignals
   - conflictSignals
   - photoLikeDescriptionSignals
   - employeeExposureKnown
   - employeeExposureUnclear
   - taskContextKnown
   - operationalStateKnown
   - confidenceSignals
   - evidenceGaps
   - trace
   - advisoryGuardrails
5. The service should normalize common language variations, such as:
   - running / operating / energized / live
   - cleaning / clearing / servicing / maintaining / repairing
   - missing guard / removed guard / damaged guard / no guard
   - employee nearby / miner exposed / worker in area / pedestrian nearby
   - damaged cord / exposed wire / open panel / energized part
   - blocked exit / obstructed egress / emergency access blocked
6. The normalized context should not overclaim. If a fact is not clear, mark it as unclear and create evidence gaps.
7. Wire the normalized observation context into the intelligence orchestrator and scenario intelligence flow.
8. Downstream brains should use the normalized context where practical, without breaking existing behavior:
   - scenario intelligence
   - standard-family mapper
   - corrective action brain
   - evidence-gap question generator
9. SafeScope output should expose a concise observationContext or normalizedObservation section for audit/debug traceability.
10. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
11. The normalized observation context must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - say a specific regulation definitely applies without required evidence
   - override qualified professional review
   - convert unclear facts into confirmed facts
12. Add or update validation scripts to prove:
   - normalized context extracts equipment, task, operational state, exposure, controls, and mechanisms correctly for clear observations
   - vague observations produce ambiguity signals and evidence gaps
   - conflicting observations produce conflict signals
   - downstream scenario intelligence still works
   - standard-family candidates remain advisory/review-only
   - corrective actions remain scenario-specific
   - evidence-gap questions remain targeted
   - field realism gauntlet v3 still passes
13. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
14. Commit locally only with the commit title:
Add SafeScope normalized observation context

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12
