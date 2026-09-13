You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- HEAD commit is ad8f15b Expand SafeScope source depth and field validation.
- Branch main is ahead of origin/main by 1 local commit.
- Field validation scripts pass:
  - Total Cases: 10
  - Valid Cases: 10
  - scenarioFamily: 10
  - jurisdiction: 10
  - mechanism: 10
  - riskBand: 10
  - standardFamily: 10
  - evidenceGap: 10
- Source governance validation passed.
- Frontend build passed.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Expand the SafeScope field validation dataset from 10 cases to 25 complete, realistic, schema-valid field cases.

Purpose:
The field validation schema is now stable. The next accuracy-preserving step is to expand the dataset gradually with realistic inspection observations that test SafeScope's hazard recognition, risk reasoning, standards/citation review candidate logic, corrective action reasoning, and evidence-gap behavior.

Requirements:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
2. Preserve the existing schema exactly.
3. Expand the dataset to exactly 25 total cases.
4. Every case must include:
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
5. Include a mix of:
   - clear high-risk cases
   - moderate cases
   - vague/incomplete cases
   - conflicting evidence cases
   - jurisdiction-ambiguous cases
   - cases where citation review should remain limited
6. Add cases across at least:
   - conveyor cleanup near moving parts
   - unguarded conveyor pulley/drive
   - energized equipment/LOTO ambiguity
   - damaged electrical cord or panel
   - mobile equipment near pedestrians
   - berm/roadway edge protection
   - fall exposure/elevated work
   - scaffold/platform issue
   - trench/excavation protective system ambiguity
   - chemical exposure/SDS/PPE/ventilation uncertainty
   - fire extinguisher inspection/access ambiguity
   - blocked emergency access/egress
   - powered door malfunction
   - housekeeping/slip-trip walking-working surface
   - workplace examination/documentation ambiguity if supported
7. Do not claim legal correctness.
8. Do not make SafeScope declare violations.
9. Do not make SafeScope issue citations.
10. Citation candidate fields may be null or review-candidate strings where appropriate.
11. Vague/conflicting cases should include evidence gaps and qualified review disposition.
12. Update scoring script only if needed for better summary output. Do not weaken it.
13. Update validation script only if necessary. Do not weaken it.
14. Add or update documentation:
   - project-docs/08-audits/SAFESCOPE_FIELD_VALIDATION_25_CASE_EXPANSION.md
15. Run:
   - cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
   - cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
   - cd frontend-next && npm run build
   - grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true
16. Commit locally only with:
Expand SafeScope field validation dataset

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
