You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Branch main is clean and synced with origin/main.
- Latest commit is c7085f6 Add SafeScope observation trace snapshot validator.
- Recent SafeScope work includes:
  - observation understanding brain
  - observation trace snapshot validator
  - semantic routing guard
  - semantic conflict gauntlet
  - expanded observation understanding coverage
  - equipment/task/mechanism detector coverage
  - powered door control and evidence brain records
  - extinguisher label disambiguation and health exposure regression fix
  - Vulcan employer Pro promo code

Goal:
Build the next SafeScope layer: Scenario Intelligence.

Purpose:
SafeScope should interpret the full safety scenario described by a user, including the equipment, task, observed condition, mechanism of injury, likely exposure, missing controls, possible applicable standard families, corrective action logic, confidence, evidence gaps, and review guardrails.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify the current files for:
   - observation understanding brain
   - equipment knowledge registry
   - task mechanism detector
   - semantic routing guard
   - semantic conflict gauntlet
   - orchestrator/main SafeScope output
   - validation scripts
3. Create a scenario intelligence model that combines:
   - observed equipment
   - task context
   - unsafe condition
   - operational state
   - energy source
   - mechanism of injury
   - exposed person/activity
   - missing or failed control
   - likely control hierarchy level
   - candidate standard family
   - evidence gaps
   - confidence signals
   - required human review flags
4. Keep all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
5. Do not make SafeScope claim a violation. It may identify likely standard families and review candidates only.
6. Add a registry/type structure if needed.
7. Wire the scenario intelligence into the SafeScope brain/orchestrator output without breaking existing output.
8. Add validation scenarios covering at least:
   - unguarded conveyor tail pulley during cleanup
   - damaged powered door used by employees
   - fire extinguisher with label/inspection ambiguity
   - energized equipment being serviced without lockout context
   - mobile equipment operating near pedestrians
   - elevated work with missing fall protection detail
   - chemical exposure with unclear route
   - vague observation with insufficient information
9. Add regression tests or validation scripts that prove:
   - clear scenarios produce scenario-level intelligence
   - vague scenarios produce evidence gaps instead of overclaiming
   - conflicting scenarios trigger semantic conflict handling
   - standard candidates remain advisory/review-only
   - existing validation scripts still pass
10. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - any remaining gaps
11. Do not push or deploy. Local changes and local commits only unless explicitly instructed.

Deliverable:
A local commit titled:
Add SafeScope scenario intelligence layer

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12
