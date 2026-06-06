You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 2 local commits.
- Current local commits include:
  - 3842b9c Expand SafeScope baseline calibration dataset
  - 691a838 Add SafeScope 200 case calibration runner
- Field validation dataset validates:
  - Total Cases: 200
  - Valid Cases: 200
  - Duplicate signature count: 0
- Calibration runner runs 200/200 cases with 0 run errors.
- Current calibration metrics:
  - hazardFamily: 0/200
  - scenarioFamily: 0/200
  - jurisdiction: 0/200
  - mechanism: 107/200
  - riskBand: 54/200
- Do not push.
- Do not deploy.
- Local commits only.

Problem:
The calibration runner likely does not correctly map actual SafeScope output fields for hazardFamily, scenarioFamily, and jurisdiction. Before tuning SafeScope reasoning, the runner must accurately extract actual output fields and distinguish true mismatches from not_scored/unavailable fields.

Goal:
Refine the SafeScope 200-case calibration runner output mapping and reporting.

Requirements:
1. Inspect:
   - backend/scripts/run-safescope-200-baseline-calibration.ts
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.types.ts
   - backend/src/safescope-v2/brain
2. Determine the actual output field paths for:
   - hazard family/domain
   - scenario family
   - jurisdiction
   - mechanism
   - risk band
   - standard family/citation candidates
   - evidence gaps/questions
   - corrective action theme
   - advisory guardrails
3. Update the runner so each category can return:
   - exact_match
   - partial_match
   - mismatch
   - not_scored
   - unavailable
   - run_error
4. Do not count unavailable/not_scored fields as mismatches.
5. Add output extraction diagnostics for a small sample of cases, such as first 5 cases, so we can see:
   - expected fields
   - extracted actual fields
   - match status
6. Improve report JSON so each case includes:
   - expected
   - actualExtracted
   - matchStatus
   - notes
7. Improve aggregate metrics to include:
   - total cases
   - run cases
   - run errors
   - scorable counts by category
   - exact matches by category
   - partial matches by category
   - mismatches by category
   - not_scored/unavailable by category
   - alignment percentage calculated only from scorable categories
8. Do not fake scores.
9. Do not tune SafeScope reasoning in this step unless required only to expose existing output fields.
10. Do not weaken advisory guardrails.
11. Preserve:
   - advisoryOnly
   - doesNotDeclareViolation
   - doesNotCreateCitation
   - doesNotOverrideRegulation
   - requiresQualifiedReview
   - doesNotSelfModifyWithoutApproval
12. Update:
   - project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md
   with honest refined results and known unscored fields.
13. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
   - cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
   - cd frontend-next && npm run build
   - grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true
14. Commit locally only with:
Refine SafeScope calibration output mapping

Before committing, show:
- git diff --stat
- files changed
- calibration results
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
