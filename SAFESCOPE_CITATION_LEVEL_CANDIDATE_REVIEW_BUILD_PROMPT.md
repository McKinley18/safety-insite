You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 12 local commits.
- HEAD commit is af8d231 Add SafeScope approved source governance.
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
  - normalized observation context
  - approved source governance
- Do not push or deploy.

Goal:
Build the SafeScope citation-level candidate review engine.

Purpose:
SafeScope currently maps hazard scenarios to advisory standard-family candidates. The next step is to safely introduce citation-level review candidates that are governed by the approved source governance model and evidence gates.

This engine must not declare violations, issue citations, or state that a regulation definitely applies. It should only surface citation-level candidates for qualified review when source governance and evidence requirements support doing so.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify existing files related to:
   - source governance
   - approved knowledge context
   - regulatory brain
   - standard-family candidate mapper
   - scenario-family knowledge registry
   - normalized observation context
   - scenario intelligence service
   - evidence gap question generator
   - corrective action reasoning brain
   - intelligence orchestrator
   - SafeScope output types
   - validation scripts
   - benchmark JSON files
   - audit markdown reports
3. Create a citation-level candidate review model and service.
4. Citation-level candidate records should support:
   - id
   - citation
   - title
   - agency
   - jurisdiction
   - industryScope
   - sourceGovernanceId
   - authorityTier
   - approvalStatus
   - relatedStandardFamily
   - relatedScenarioFamilies
   - relatedHazardDomains
   - relatedEquipmentIndicators
   - relatedTaskIndicators
   - relatedMechanismIndicators
   - relatedExposureIndicators
   - requiredEvidence
   - missingEvidence
   - evidenceSatisfied
   - confidence
   - confidenceBoosters
   - confidenceReducers
   - applicabilityNotes
   - prohibitedUses
   - humanReviewTriggers
   - advisoryGuardrails
   - sourceTrace
5. The engine should only surface a citation candidate if:
   - the source governance record is approved
   - the record is not deprecated, rejected, draft, pending, superseded, or duplicate-only
   - the citation belongs to a relevant standard-family candidate
   - the scenario family and normalized observation context provide enough signals
6. If evidence is missing, the engine may still surface the candidate as a low-confidence review candidate only if it clearly lists missing evidence and requires qualified review.
7. The engine must clearly separate:
   - candidate citations for qualified review
   - missing evidence
   - evidence gates satisfied
   - source trace
   - confidence
   - advisory guardrails
8. Add initial citation-level candidate examples for at least:
   - conveyor guarding / moving machine parts
   - hazardous energy / lockout review
   - fire extinguisher inspection or access review
   - mobile equipment / pedestrian interaction review
   - fall protection / elevated work review
   - chemical exposure / SDS / PPE / ventilation review
   - electrical damaged cord, panel, or energized part review
   - emergency access / egress obstruction review
9. Use placeholder or internal governed records only if real approved source records do not already exist, but mark them appropriately according to governance status. Do not treat unapproved placeholders as authoritative.
10. Wire the citation-level candidate review engine into intelligence orchestrator output.
11. SafeScope output should clearly separate:
   - scenario family matches
   - standard-family review candidates
   - citation-level review candidates
   - corrective action reasoning
   - evidence gaps
   - follow-up questions
   - approved source trace
   - confidence
   - guardrails
12. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
13. The citation-level engine must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - say a specific regulation definitely applies without required evidence
   - treat unapproved, draft, pending, rejected, deprecated, superseded, or duplicate-only records as authoritative
   - override qualified professional review
   - remove or weaken existing advisory guardrails
14. Add or update validation scripts to prove:
   - approved source records can produce citation-level candidates
   - unapproved/deprecated/rejected records do not produce authoritative candidates
   - missing evidence lowers confidence and generates evidence gaps
   - clear observations produce relevant citation-level review candidates
   - vague observations do not overclaim
   - source trace is preserved
   - advisory guardrails remain present
   - existing source-governance, normalized-context, scenario intelligence, standard-family, corrective-action, evidence-question, and field-realism validations still pass
15. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
16. Commit locally only with the commit title:
Add SafeScope citation-level candidate review engine

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15
