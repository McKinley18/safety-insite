You are continuing the Sentinel Safety / SafeScope v2 build.

Current verified state:
- Repository is clean.
- HEAD commit is d0bfcfd Add SafeScope risk reasoning brain.
- Branch main is ahead of origin/main by 6 local commits.
- Recent completed SafeScope layers:
  - canonical pipeline map
  - risk reasoning brain
  - intelligence output contract
  - report-ready narrative generator
  - frontend intelligence display adapter
  - frontend intelligence display panels
  - report narrative export bridge
- Do not push.
- Do not deploy.

Goal:
Add SafeScope risk display and report integration.

Purpose:
SafeScope now has a backend risk reasoning brain. The next step is to make that risk reasoning visible and usable in the inspection workflow, SafeScope panels, and report-ready narrative/export flow.

This should not redesign the UI. It should extend the existing display adapter, panels, and report bridge to surface risk reasoning clearly and professionally.

Requirements:
1. Inspect the current frontend and backend structure before changing anything.
2. Identify current files related to:
   - backend/src/safescope-v2/brain/risk-reasoning
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/orchestration/contract/intelligence-output.contract.ts
   - frontend-next/lib/safescope/types/index.ts
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/components/inspection/SafeScopeReasoningPanel.tsx
   - frontend-next/components/inspection/RiskReviewSection.tsx
   - frontend-next/components/inspection/GenerateReportSection.tsx
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
3. Add frontend-safe risk reasoning types if needed.
4. Extend the SafeScope intelligence display adapter to expose risk display sections.
5. Risk display should include, where available:
   - initialRiskLevel
   - residualRiskLevel
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
   - riskDrivers
   - riskReducers
   - uncertaintyFactors
   - evidenceGaps
   - urgencyLevel
   - suggestedDueDateLogic
   - verificationRequirements
   - confidence
   - humanReviewTriggers
   - advisoryGuardrails
6. Add or extend a frontend panel for risk reasoning, such as:
   - SafeScopeRiskReasoningPanel
   or extend the existing IntelligencePanel with a clear Risk Reasoning section.
7. Keep design consistent with existing Sentinel Safety UI:
   - professional navy/slate look
   - clear section headers
   - compact readable cards
   - no full redesign
8. Wire risk reasoning into the inspection/SafeScope display flow where safe.
9. Extend the report narrative export bridge so risk reasoning can be included in future report output.
10. Preserve existing manual inspection risk inputs. Do not break user-entered severity/likelihood/risk review fields.
11. Clearly distinguish:
   - SafeScope advisory risk reasoning
   - user-entered/manual risk assessment
   - missing evidence/uncertainty
   - initial risk
   - residual risk after controls
12. Preserve all advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
13. Frontend/report language must never:
   - declare a violation
   - issue or simulate a citation
   - override qualified professional risk assessment
   - hide uncertainty
   - present advisory risk as final determination
14. Add lightweight validation/type coverage if appropriate.
15. Run relevant validations:
   - cd frontend-next && npm run build
   - backend risk validation if backend code is touched
   - canonical pipeline validation if pipeline contract is touched
16. Commit locally only with the commit title:
Add SafeScope risk display and report integration

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -8
