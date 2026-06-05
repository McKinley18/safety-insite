You are fixing a SafeScope field validation dataset/schema mismatch.

Current verified state:
- Repository is clean.
- HEAD commit is 99e4416 Expand SafeScope source depth and field validation.
- Branch main is ahead of origin/main by 1 local commit.
- Do not push.
- Do not deploy.
- Local commits only.

Problem:
The latest source depth / field validation expansion is not ready.

Observed validation:
- backend/scripts/validate-safescope-field-validation-dataset.ts reports:
  Total Cases: 10
  Valid Cases: 0
  Missing Required Fields: 10
  Field Validation Dataset validation failed.
- backend/scripts/score-safescope-field-validation-dataset.ts reports:
  Total Cases: 10
  Valid Cases: 10
  scenarioFamily: 10
  jurisdiction: 10
  readiness: Ready

This means the validation script and scoring script are not aligned on the expected dataset schema.

Also, the prior summary claimed the dataset expanded to 100 scenarios, but the actual scripts still report 10 cases. Do not claim or fake 100 cases unless the dataset is actually expanded and validated.

Goal:
Fix the field validation dataset, validation script, and scoring script so they use one consistent schema and both validations pass.

Requirements:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
   - scripts/fix_dataset.py
2. Determine the current dataset structure.
3. Align both scripts to the same required schema.
4. Required fields should be consistent and include:
   - id
   - observationText
   - siteType
   - jurisdiction
   - equipment
   - task
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - expectedRiskBand
   - expectedStandardFamily
   - expectedCitationCandidate
   - expectedCorrectiveActionTheme
   - evidenceGapsExpected
   - reviewerNotes
   - qualifiedReviewerDisposition
   - advisoryGuardrails
5. If current records use older field names, migrate the dataset to the required schema.
6. Keep the dataset honest:
   - If there are only 10 cases, keep it at 10 and document that.
   - Only expand to 20+ cases if you actually add complete, realistic, validated records.
   - Do not claim 100 cases unless 100 complete cases actually exist and both scripts report 100.
7. Fix scoring output so it reports:
   - total cases
   - valid cases
   - scenario family coverage
   - jurisdiction coverage
   - risk band coverage
   - mechanism coverage
   - standard family coverage
   - evidence gap coverage
   - missing required fields
   - readiness status
8. Fix validation output so it agrees with scoring on valid case counts.
9. Remove scripts/fix_dataset.py from tracked source unless it is intentionally documented and useful. If it is just a temporary helper, delete it.
10. Do not weaken validation just to pass.
11. Do not modify runtime SafeScope reasoning unless absolutely required.
12. Do not touch frontend unless necessary.
13. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd frontend-next && npm run build
   - grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true
14. Commit locally only with:
Fix SafeScope field validation schema alignment

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
