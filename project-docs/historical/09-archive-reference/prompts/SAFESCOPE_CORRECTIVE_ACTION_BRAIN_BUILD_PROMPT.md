You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 4 local commits.
- HEAD commit is 70c9385 Add SafeScope standard family candidate mapper.
- Recent completed SafeScope layers:
  - scenario intelligence layer
  - scenario family knowledge registry
  - standard family candidate mapper
- Do not push or deploy.

Goal:
Build the SafeScope corrective action reasoning brain.

Purpose:
SafeScope can now understand scenarios, match scenario families, and generate advisory standard-family candidates. The next step is to produce scenario-specific corrective action reasoning that is tied to the hazard family, mechanism of injury, exposure route, missing or failed controls, evidence gaps, and control hierarchy.

This brain must avoid generic, repetitive corrective actions. It should produce practical, defensible, field-realistic actions that safety professionals can review and assign.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify how these systems are currently wired:
   - scenario intelligence service
   - scenario-family knowledge registry
   - standard-family candidate mapper
   - controls brain
   - evidence brain
   - mechanism brain
   - regulatory brain
   - reasoning orchestrator
   - intelligence orchestrator
   - SafeScope output types
   - existing corrective action reasoning, if any
   - validation scripts and benchmark outputs
3. Create a corrective action reasoning model and service.
4. Corrective action reasoning output should support:
   - scenarioFamilyId
   - hazardDomain
   - mechanismOfInjury
   - exposurePathway
   - missingOrFailedControls
   - immediateActions
   - interimControls
   - permanentCorrections
   - administrativeFollowUps
   - verificationSteps
   - evidenceNeededBeforeFinalizing
   - responsibleRoleSuggestions
   - urgencyLevel
   - controlHierarchyLevel
   - standardFamilyReviewLinks
   - confidence
   - humanReviewTriggers
   - advisoryGuardrails
5. Corrective actions should be specific to the scenario family. Add coverage for at least:
   - conveyor cleanup near moving parts
   - unguarded conveyor pulley or drive
   - powered door damage or malfunction with employee exposure
   - fire extinguisher inspection / label / access ambiguity
   - energized equipment servicing or maintenance without clear lockout context
   - mobile equipment operating near pedestrians
   - elevated work with possible fall exposure
   - chemical exposure with unclear route or missing SDS/PPE/ventilation context
   - electrical exposure from damaged cords, panels, or energized parts
   - blocked emergency access or egress
6. Corrective actions should be structured by control maturity:
   - immediate exposure control
   - temporary/interim control
   - permanent engineered or physical correction
   - administrative follow-up
   - verification/documentation
7. Wire the corrective action reasoning brain into scenario intelligence output and/or the intelligence orchestrator output.
8. SafeScope output should clearly separate:
   - scenario family matches
   - standard-family review candidates
   - corrective action reasoning
   - evidence gaps
   - confidence
   - guardrails
9. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
10. The corrective action brain must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - say a specific regulation definitely applies without required evidence
   - override qualified professional review
   - generate unsafe advice
11. Add or update validation scripts to prove:
   - clear scenario-family matches produce specific corrective actions
   - vague inputs produce evidence-needed prompts instead of overconfident actions
   - conflicting inputs trigger review flags
   - corrective actions use control hierarchy logic
   - standard-family candidates remain advisory/review-only
   - existing scenario intelligence, scenario-family, and standard-family validations still pass
12. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - any remaining gaps
13. Commit locally only with the commit title:
Add SafeScope corrective action reasoning brain

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12
