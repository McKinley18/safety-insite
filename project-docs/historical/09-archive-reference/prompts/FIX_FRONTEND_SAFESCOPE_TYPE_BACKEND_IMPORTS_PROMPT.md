You are fixing a frontend build failure in Sentinel Safety.

Current failure:
cd frontend-next && npm run build fails with:

frontend-next/lib/safescope/types/index.ts:1:42
Type error: Cannot find module '../../../backend/src/safescope-v2/brain/observation-context/observation-context.types'

Cause:
frontend-next/lib/safescope/types/index.ts imports backend source files directly. Frontend code must not import from backend/src. Vercel/frontend builds cannot depend on backend internal source paths.

Current repo state:
- Repository has unpushed local commits.
- HEAD is f4844c2 Fix narrative export bridge import.
- There is an untracked prompt file:
  SAFESCOPE_RISK_DISPLAY_REPORT_INTEGRATION_BUILD_PROMPT.md
- Do not push.
- Do not deploy.

Goal:
Fix frontend SafeScope type definitions so frontend-next builds successfully without backend/src imports.

Requirements:
1. Inspect:
   - frontend-next/lib/safescope/types/index.ts
   - frontend-next/lib/safescope/adapters/intelligence-display.adapter.ts
   - frontend-next/lib/safescope/export/narrative-export.bridge.ts
   - frontend-next/components/safescope/panels/IntelligencePanel.tsx
   - frontend-next/components/inspection/SafeScopeReasoningPanel.tsx
2. Remove all frontend imports from backend/src.
3. Replace frontend-next/lib/safescope/types/index.ts with frontend-local type definitions only.
4. Define minimal frontend-safe structural types needed by the adapter, panels, and report bridge. Use flexible optional fields where necessary to avoid tight coupling to backend internals.
5. Include risk reasoning fields needed by the new risk display/report integration:
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
6. Preserve existing frontend adapter, panel, and narrative bridge behavior.
7. Do not modify backend runtime code unless absolutely necessary.
8. Search frontend-next for backend/src imports and remove any remaining ones:
   grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n
9. Run:
   cd frontend-next && npm run build
10. Commit locally only after build passes with:
Fix frontend SafeScope type imports
11. Include the untracked SAFESCOPE_RISK_DISPLAY_REPORT_INTEGRATION_BUILD_PROMPT.md in the commit if it is still present.
12. After committing, show:
   - git status
   - git log --oneline -10
   - git show --stat --oneline HEAD
13. Do not push or deploy.
