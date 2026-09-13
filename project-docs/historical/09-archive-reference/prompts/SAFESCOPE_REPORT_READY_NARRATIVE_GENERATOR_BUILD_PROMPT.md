You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 15 local commits.
- HEAD commit is f764ceb Add SafeScope intelligence output contract.
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
  - citation-level candidate review
  - reviewer feedback learning queue
  - intelligence output contract
- Do not push or deploy.

Goal:
Build the SafeScope report-ready narrative generator.

Purpose:
SafeScope now has a stable intelligence output contract. The next step is to translate structured SafeScope reasoning into professional, report-ready narrative language for inspection findings, corrective action summaries, executive summaries, and audit appendices.

The generator should produce clear, defensible language that is useful to safety professionals while preserving all advisory guardrails. It must not declare violations, issue citations, or overstate applicability.

Requirements:
1. Inspect the existing SafeScope v2 structure before changing anything.
2. Identify existing files related to:
   - intelligence output contract
   - scenario intelligence
   - scenario family matches
   - standard-family candidates
   - citation-level review candidates
   - corrective action reasoning
   - evidence gaps
   - follow-up questions
   - approved source trace
   - reviewer feedback trace
   - confidence summary
   - advisory guardrails
   - current report or executive summary generation, if any
   - validation scripts
   - benchmark JSON files
   - audit markdown reports
3. Create a report-ready narrative generator model and service.
4. Narrative output should support:
   - findingTitle
   - findingSummary
   - scenarioExplanation
   - mechanismOfInjuryNarrative
   - exposureNarrative
   - evidenceGapNarrative
   - followUpQuestionNarrative
   - standardFamilyReviewNarrative
   - citationCandidateReviewNarrative
   - correctiveActionNarrative
   - immediateActionNarrative
   - interimControlNarrative
   - permanentCorrectionNarrative
   - administrativeFollowUpNarrative
   - verificationNarrative
   - confidenceNarrative
   - qualifiedReviewDisclaimer
   - auditAppendixNarrative
   - conciseMode
   - professionalMode
   - auditMode
5. The generator should support at least three output modes:
   - concise finding mode
   - professional report mode
   - audit/debug appendix mode
6. The narrative should be scenario-specific and avoid generic repeated wording.
7. Add coverage for at least these scenario families:
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
8. Narrative language must clearly distinguish:
   - observed facts
   - inferred scenario reasoning
   - evidence gaps
   - review candidates
   - corrective action recommendations
   - qualified-review requirements
9. Wire the narrative generator into the intelligence orchestrator output and/or output contract without breaking existing consumers.
10. SafeScope output should clearly separate:
   - structured reasoning data
   - report-ready narrative
   - audit/debug narrative
   - advisory guardrails
11. Preserve all SafeScope guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
12. The narrative generator must never:
   - declare that a violation occurred
   - issue or simulate a citation
   - state that a specific citation definitely applies without required evidence
   - treat reviewer feedback as approved knowledge
   - treat unapproved/deprecated/rejected source records as authoritative
   - remove or weaken existing advisory guardrails
   - write misleading final determination language
13. Add or update validation scripts to prove:
   - report narratives are generated from the intelligence output contract
   - narratives are scenario-specific
   - evidence gaps remain visible
   - citation-level candidates remain advisory-only
   - corrective actions remain separated from citation candidates
   - qualified-review disclaimer is present
   - concise/professional/audit modes all work
   - no narrative declares violations or issues citations
   - existing intelligence-output, citation-review, source-governance, normalized-context, scenario intelligence, standard-family, corrective-action, evidence-question, and field-realism validations still pass
14. Run all relevant validation commands and report:
   - files changed
   - tests/validators run
   - pass/fail status
   - readiness score
   - any remaining gaps
15. Commit locally only with the commit title:
Add SafeScope report-ready narrative generator

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -15
