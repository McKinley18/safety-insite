You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- HEAD commit is 3842b9c Expand SafeScope baseline calibration dataset.
- Branch main is ahead of origin/main by 1 local commit.
- Field validation dataset validates:
  - Total Cases: 200
  - Valid Cases: 200
  - Duplicate signature count: 0
  - scenarioFamily coverage: 200
  - jurisdiction coverage: 200
  - mechanism coverage: 200
  - riskBand coverage: 200
  - standardFamily coverage: 200
  - evidenceGap coverage: 200
- Source governance validation passed.
- Frontend build passed.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Build a SafeScope 200-case baseline calibration runner.

Purpose:
The dataset now has 200 unique, schema-valid field scenarios. The next step is to run SafeScope against the dataset and compare actual reasoning outputs against expected fields.

This is not just schema validation. This is actual SafeScope calibration scoring.

Requirements:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
   - backend/scripts/validate-dataset-uniqueness.ts
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts
   - backend/src/safescope-v2/safescope-v2.service.ts
   - backend/src/safescope-v2/brain
2. Create a calibration runner script, such as:
   - backend/scripts/run-safescope-200-baseline-calibration.ts
3. The runner should load all 200 dataset cases.
4. For each case, run the available SafeScope reasoning/orchestration path in the safest currently supported way.
5. Do not require a database or external network.
6. If full orchestration dependency injection is difficult, use existing deterministic services/modules directly where safe.
7. Do not fake output. If a field cannot be scored from current SafeScope output, mark it as not_scored or unavailable.
8. Compare actual SafeScope outputs against expected dataset fields where possible:
   - jurisdiction
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - expectedRiskBand
   - expectedStandardFamily
   - evidenceGapsExpected
   - expectedCorrectiveActionTheme
   - advisoryGuardrails
9. Scoring should include:
   - total cases
   - cases run
   - cases failed to run
   - hazard family matches
   - scenario family matches
   - mechanism matches
   - jurisdiction matches
   - risk band matches
   - standard family matches
   - evidence gap behavior matches
   - corrective action theme matches if scorable
   - advisory guardrail pass count
   - overall alignment percentage
10. Output should clearly distinguish:
   - exact_match
   - partial_match
   - mismatch
   - not_scored
   - run_error
11. Create a JSON report, such as:
   - safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json
12. Create a markdown report:
   - project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md
13. The reports should include:
   - summary metrics
   - top mismatch categories
   - cases requiring review
   - cases not scorable and why
   - recommended improvements
14. Do not overclaim production readiness.
15. Do not make SafeScope declare violations.
16. Do not make SafeScope issue citations.
17. Preserve advisory guardrails:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
18. Add the runner to package scripts only if appropriate and low-risk.
19. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
   - cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
   - cd frontend-next && npm run build
   - grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true
20. Commit locally only with:
Add SafeScope 200 case calibration runner

Before committing, show:
- git diff --stat
- files changed
- validation/calibration results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
