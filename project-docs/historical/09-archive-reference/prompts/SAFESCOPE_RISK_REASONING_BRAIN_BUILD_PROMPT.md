You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is 7b8c1f3 Add SafeScope canonical pipeline map.
- Branch main is ahead of origin/main by 4 local commits.
- Recent completed SafeScope layers:
  - AI readiness manifest
  - architecture/product maturity audit
  - canonical pipeline map
  - normalized observation context
  - scenario intelligence
  - scenario-family knowledge
  - standard-family candidate mapper
  - citation-level candidate review
  - corrective action reasoning
  - evidence-gap question generator
  - reviewer feedback learning queue
  - frontend intelligence display
  - report narrative export bridge
- Do not push.
- Do not deploy.

Goal:
Build the SafeScope risk reasoning brain.

Purpose:
SafeScope can now identify scenarios, map standards/citation review candidates, generate corrective actions, and expose evidence gaps. The next step is to strengthen risk assessment so SafeScope can explain why a hazard is low, medium, high, serious, or critical based on the actual scenario dynamics.

This risk brain should not merely assign a generic score. It should reason from severity, likelihood, exposure, mechanism of injury, energy source, missing controls, uncertainty, and credible worst-case outcome.

Requirements:
1. Inspect the current SafeScope v2 structure before changing anything.
2. Identify existing risk-related files and integrations, including:
   - backend/src/safescope-v2/risk
   - backend/src/risk
   - risk matrix/profile files
   - existing SafeScope risk fields
   - intelligence orchestrator
   - canonical pipeline registry
   - normalized observation context
   - scenario intelligence
   - corrective action reasoning brain
   - evidence-gap question generator
   - frontend SafeScope display adapter/panels
   - report narrative export bridge
   - validation scripts
3. Create a SafeScope risk reasoning model and service.
4. Risk reasoning output should support:
   - riskReasoningId
   - scenarioFamilyId
   - hazardDomain
   - mechanismOfInjury
   - credibleWorstCaseOutcome
   - severityEstimate
   - likelihoodEstimate
   - exposureFrequency
   - exposureDuration
   - exposedPopulation
   - energySourceSeverity
   - controlFailureSeverity
   - existingControls
   - missingOrFailedControls
   - uncertaintyFactors
   - evidenceGaps
   - initialRiskLevel
   - residualRiskLevel
   - riskDrivers
   - riskReducers
   - urgencyLevel
   - suggestedDueDateLogic
   - verificationRequirements
   - confidence
   - humanReviewTriggers
   - advisoryGuardrails
5. Risk levels should support at least:
   - low
   - moderate
   - high
   - serious
   - critical
   - unknown
6. Urgency levels should support at least:
   - monitor
   - scheduled
   - prompt
   - urgent
   - immediate
   - unknown
7. Risk reasoning should account for:
   - active employee exposure
   - unclear exposure
   - energized/running equipment
   - hazardous energy
   - fall height/elevated work
   - chemical exposure route
   - electrical exposure
   - struck-by/caught-between potential
   - blocked emergency access
   - missing or failed engineered controls
   - administrative controls only
   - uncertainty and missing evidence
8. Add scenario-specific risk reasoning coverage for at least:
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
9. Wire risk reasoning into:
   - canonical pipeline map
   - intelligence orchestrator output
   - intelligence output contract/types
   - report-ready narrative generator if appropriate
   - frontend display adapter/panels if safe and minimal
10. Preserve existing risk behavior where needed. Do not break existing inspection risk inputs.
11. SafeScope risk reasoning must clearly distinguish:
   - confirmed risk factors
   - inferred risk factors
   - missing evidence
   - uncertainty
   - initial risk
   - residual risk after controls
12. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
13. Risk reasoning must never:
   - declare a violation
   - issue or simulate a citation
   - override a qualified professional risk assessment
   - assign false certainty when evidence is missing
   - hide uncertainty
14. Add or update validation scripts to prove:
   - clear severe scenarios produce higher risk and urgent/immediate urgency
   - vague scenarios produce unknown/moderate risk with evidence gaps
   - missing controls increase risk
   - existing controls reduce residual risk
   - risk reasoning preserves advisory guardrails
   - initial and residual risk are separated
   - field realism gauntlet and existing SafeScope validations still pass
15. Run relevant validations:
   - risk reasoning validation
   - canonical pipeline validation
   - frontend build only if frontend code is touched
   - backend validation only if backend runtime code is touched
16. Commit locally only with the commit title:
Add SafeScope risk reasoning brain

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
