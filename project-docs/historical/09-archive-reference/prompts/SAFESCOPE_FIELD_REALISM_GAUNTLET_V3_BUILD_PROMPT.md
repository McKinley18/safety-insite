You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository should be clean.
- SafeScope has recently added:
  - scenario intelligence layer
  - scenario family knowledge registry
  - standard family candidate mapper
  - corrective action reasoning brain
  - evidence gap question generator
- Branch main may be several local commits ahead of origin/main.
- Do not push or deploy.

Goal:
Build SafeScope Field Realism Regression Gauntlet v3.

Purpose:
SafeScope now has multiple AI-style reasoning layers. Before adding more capability, strengthen the regression gauntlet so the system proves it can handle messy, realistic field observations instead of only clean benchmark examples.

The v3 gauntlet should test real-world ambiguity, conflicting descriptions, incomplete evidence, jurisdiction uncertainty, mixed hazards, corrective action quality, standard-family overclaim prevention, evidence-gap question quality, and advisory guardrail compliance.

Requirements:
1. Inspect the existing SafeScope v2 validation, benchmark, and gauntlet structure before changing anything.
2. Identify existing files related to:
   - field realism gauntlet
   - field realism pack v2
   - scenario intelligence validation
   - scenario family knowledge validation
   - standard family candidate mapper validation
   - corrective action reasoning validation
   - evidence gap question validation
   - benchmark output JSON files
   - audit markdown reports
3. Create or update a Field Realism Regression Gauntlet v3 validation script.
4. The v3 gauntlet must include at least 60 test scenarios.
5. Include scenario categories for:
   - vague observations
   - mixed hazards
   - conflicting facts
   - wrong user assumptions
   - partial photo-like descriptions
   - employee exposure uncertainty
   - MSHA vs OSHA jurisdiction ambiguity
   - missing task context
   - missing operational state
   - missing energy source detail
   - standard-family overclaim prevention
   - corrective action specificity
   - evidence-gap question quality
   - semantic routing accuracy
   - scenario-family matching accuracy
   - standard-family candidate relevance
6. Include at least the following hazard families:
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
7. Each test scenario should evaluate:
   - expected hazard domain
   - expected scenario family, when enough evidence exists
   - expected standard-family candidate, when appropriate
   - whether evidence gaps should be generated
   - whether follow-up questions should be generated
   - whether corrective actions should be specific or conservative
   - whether human review should be triggered
   - whether SafeScope avoids declaring a violation
   - whether advisory guardrails are preserved
8. The v3 gauntlet should score:
   - domain alignment
   - scenario-family alignment
   - standard-family candidate relevance
   - corrective action specificity
   - evidence-gap quality
   - question quality
   - guardrail compliance
   - overclaim prevention
   - overall readiness
9. Add or update benchmark output JSON and audit markdown report files.
10. Keep all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
11. The gauntlet must fail if SafeScope:
   - declares a violation
   - issues or simulates a citation
   - says a specific regulation definitely applies without required evidence
   - ignores obvious ambiguity
   - fails to generate evidence-gap questions for vague scenarios
   - gives generic corrective actions for clear scenario families
   - drops existing scenario intelligence output fields
12. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
13. Commit locally only with the commit title:
Add SafeScope field realism gauntlet v3

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -12
