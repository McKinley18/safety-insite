You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- Latest completed SafeScope milestone is corrective action specificity expansion.
- Recent completed layers:
  - approved source expansion
  - citation evidence-gate hardening
  - risk reasoning brain
  - risk display/report integration
  - corrective action specificity expansion
  - canonical pipeline map
- Do not push.
- Do not deploy.

Goal:
Harden SafeScope corrective action risk logic.

Purpose:
SafeScope corrective actions are now more scenario-specific, but the previous build noted placeholder risk-informed logic. Replace placeholder logic with deterministic, scenario-aware urgency and corrective action rules tied to risk reasoning, exposure, missing controls, and credible worst-case outcome.

Requirements:
1. Inspect current corrective action and risk reasoning files before changing anything.
2. Identify files related to:
   - backend/src/safescope-v2/brain/corrective-action-brain
   - backend/src/safescope-v2/brain/risk-reasoning
   - backend/src/safescope-v2/brain/scenario-intelligence
   - backend/src/safescope-v2/brain/scenario-family-knowledge
   - backend/src/safescope-v2/brain/evidence-gap-question-generator
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/orchestration/contract/pipeline.registry.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - existing corrective action validation scripts
3. Replace placeholder risk-informed logic with deterministic rules that consider:
   - initialRiskLevel
   - residualRiskLevel
   - urgencyLevel
   - credibleWorstCaseOutcome
   - employeeExposureConfirmed or exposure uncertainty
   - operational state
   - energy source
   - missing or failed controls
   - control hierarchy level
   - evidence gaps
   - human review triggers
4. Corrective action urgency should follow consistent rules:
   - critical/immediate risk: stop-use, isolate, barricade, remove exposure, or suspend task where appropriate until qualified review/control verification occurs
   - serious/high risk: urgent interim controls and prioritized permanent correction
   - moderate risk: scheduled correction with verification evidence
   - low risk: monitor/correct through normal workflow with documentation
   - unknown risk: request evidence and avoid over-specific final action
5. Corrective action output should retain clear separation:
   - immediateAction
   - interimControl
   - permanentCorrectiveAction
   - engineeringControlRecommendation
   - administrativeFollowUp
   - trainingCommunicationNeed
   - verificationEvidenceRequired
   - responsibleRoleSuggestion
   - suggestedDueDateLogic
   - residualRiskExpectation
   - humanReviewTriggers
   - advisoryGuardrails
6. Add deterministic scenario-specific rules for at least:
   - conveyor cleanup near moving parts
   - unguarded conveyor pulley or drive
   - powered door damage/malfunction with employee exposure
   - fire extinguisher inspection / label / access ambiguity
   - energized equipment servicing without clear lockout context
   - mobile equipment operating near pedestrians
   - elevated work with possible fall exposure
   - chemical exposure with unclear route or missing SDS/PPE/ventilation context
   - electrical exposure from damaged cords, panels, or energized parts
   - blocked emergency access or egress
7. Avoid generic/banned language:
   - “be careful”
   - “follow safety rules”
   - “fix the issue”
   - “train employees” without specifying topic and verification
8. Preserve advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
9. Corrective action logic must never:
   - declare a violation
   - issue or simulate a citation
   - override qualified professional judgment
   - hide uncertainty
   - recommend unsafe work continuation when immediate exposure is plausible
10. Add or update validation scripts to prove:
   - critical/immediate scenarios generate immediate exposure-removal logic
   - high/serious scenarios generate urgent interim controls
   - moderate/low scenarios generate scheduled/monitored corrections
   - unknown/vague scenarios generate evidence requests instead of over-specific actions
   - scenario-specific action language is used
   - banned generic phrases are absent
   - verification evidence is included
   - guardrails remain present
   - risk reasoning integration remains intact
   - canonical pipeline validation still passes
11. Run relevant validations:
   - corrective action validation
   - risk reasoning validation if available
   - canonical pipeline validation
   - frontend build only if frontend code is touched
12. Commit locally only with the commit title:
Harden SafeScope corrective action risk logic

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
