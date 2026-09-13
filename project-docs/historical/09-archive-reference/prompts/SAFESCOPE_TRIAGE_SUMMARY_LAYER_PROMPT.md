You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 5 local commits.
- Current local calibration stack includes:
  - 3842b9c Expand SafeScope baseline calibration dataset
  - 691a838 Add SafeScope 200 case calibration runner
  - 707ac58 Refine SafeScope calibration output mapping
  - 3bf3b4e Add SafeScope calibration triage diagnostics
  - 3868665 Add SafeScope calibration triage results
- Dataset validation passes:
  - 200 total cases
  - 200 valid cases
  - 0 duplicate signatures
- Frontend build passes.
- Do not push.
- Do not deploy.
- Local commits only.

Problem:
The triage results JSON currently has raw case-level details but lacks top-level summary/metrics/recommendations, making it harder to use for engineering decisions.

Goal:
Add a top-level SafeScope calibration triage summary layer.

Requirements:
1. Inspect:
   - backend/scripts/run-safescope-200-baseline-calibration-triage.ts
   - safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json
   - project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md
2. Update the triage runner so its JSON output includes top-level:
   - summary
   - metrics
   - unavailableCounts
   - mismatchReasonCounts
   - categoryBreakdown
   - topMismatchCategories
   - topRecommendations
   - details
3. The summary should include:
   - total cases
   - run cases
   - run errors
   - scorable categories
   - unavailable categories
   - strongest current match areas
   - weakest current match areas
4. The metrics should include per category:
   - scorable
   - exact_match
   - partial_match
   - mismatch
   - unavailable
   - not_scored
5. The topRecommendations should be ranked and honest. Likely recommendations may include:
   - expose hazardFamily/domain in calibration output contract
   - expose jurisdiction assessment in calibration output contract
   - align scenarioFamily taxonomy
   - improve evidence gap comparison/extraction
   - tune riskBand calibration after output contract is stable
6. Do not fake metrics.
7. Do not tune reasoning.
8. Do not change the dataset.
9. Do not weaken validations.
10. Update or create:
   - project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_TRIAGE.md
11. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
   - cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
   - cd frontend-next && npm run build
   - grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true
12. Commit locally only with:
Add SafeScope calibration triage summary

Before committing, show:
- git diff --stat
- files changed
- triage summary output
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
