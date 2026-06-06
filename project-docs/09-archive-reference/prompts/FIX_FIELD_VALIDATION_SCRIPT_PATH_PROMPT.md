You are fixing a SafeScope validation script path issue.

Current verified state:
- Repository is clean.
- HEAD commit is cd3eac4 Advance SafeScope AI maturity foundation.
- Branch main is ahead of origin/main by 1 commit.
- Frontend build passed.
- grep found no frontend backend/src imports.
- score-safescope-field-validation-dataset.ts worked.
- validate-safescope-field-validation-dataset.ts failed when run from backend/ because it tries to open:
  safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
  relative to backend/ instead of the repo root.
- Do not push.
- Do not deploy.

Goal:
Fix backend/scripts/validate-safescope-field-validation-dataset.ts so it resolves the field validation dataset path reliably from the repository root regardless of whether the script is run from:
- ~/Sentinel_Safety
- ~/Sentinel_Safety/backend

Requirements:
1. Inspect:
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
2. Fix path resolution using Node path utilities such as process.cwd(), __dirname, or path.resolve.
3. Prefer a robust repo-root-relative resolution.
4. Do not change the dataset content unless required.
5. Do not weaken validation.
6. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd frontend-next && npm run build
7. Commit locally only with:
Fix SafeScope field validation script path

Before committing, show:
- git diff --stat
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
