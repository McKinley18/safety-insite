You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is 98793fa Add SafeScope scenario intelligence layer.
- SafeScope scenario intelligence is fully integrated, benchmarked, and committed locally.
- Do not push or deploy.

Goal:
Build the SafeScope scenario-family knowledge expansion registry.

Purpose:
SafeScope now has a scenario intelligence layer. The next step is to make scenario knowledge scalable by creating scenario-family knowledge records. These records should help SafeScope reason consistently across real-world hazard families without hardcoding one-off responses.

Requirements:
1. Inspect the current SafeScope v2 structure before changing anything.
2. Identify the new scenario intelligence files and how they are wired into:
   - reasoning orchestrator
   - intelligence orchestrator
   - SafeScope output types
   - mechanism brain
   - controls brain
   - evidence brain
   - regulatory brain
3. Create a scenario-family knowledge model and registry.
4. Each scenario-family record should support:
   - id
   - title
   - domain
   - applicable industries or jurisdictions
   - common observation phrases
   - equipment indicators
   - task indicators
   - unsafe condition indicators
   - operational state indicators
   - energy source indicators
   - mechanism-of-injury indicators
   - exposure indicators
   - missing or failed control indicators
   - critical evidence questions
   - evidence gaps
   - control hierarchy guidance
   - candidate standard families
   - corrective action themes
   - confidence boosters
   - confidence reducers
   - semantic conflict triggers
   - human review triggers
   - advisory guardrails
5. Add initial scenario-family records for:
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
6. Wire the scenario-family registry into the scenario intelligence service.
7. SafeScope should use scenario-family records to enrich:
   - scenario summary
   - mechanisms of injury
   - evidence gaps
   - corrective action themes
   - candidate standard families
   - confidence scoring
   - human-review flags
8. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
9. Do not make SafeScope declare violations or issue citations.
10. Add or update validation scripts to prove:
   - each scenario family can be matched
   - vague inputs create evidence gaps instead of overclaiming
   - conflicting inputs trigger conflict handling
   - candidate standard families remain advisory/review-only
   - confidence scoring improves for clear observations
   - confidence scoring decreases for vague observations
   - existing scenario intelligence validations still pass
11. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - any remaining gaps
12. Commit locally only with the commit title:
Add SafeScope scenario family knowledge registry

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12
