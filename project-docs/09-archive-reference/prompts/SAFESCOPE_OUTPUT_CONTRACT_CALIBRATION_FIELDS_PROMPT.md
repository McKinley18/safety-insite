You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean after removing temp.ts.
- Branch main is ahead of origin/main with local calibration framework commits.
- Dataset validation passes:
  - 200 total cases
  - 200 valid cases
  - 0 duplicate signatures
- Triage summary shows:
  - hazardFamily: field_not_available 200/200
  - jurisdiction: field_not_available 200/200
  - scenarioFamily: mismatch 200/200
  - mechanism: exact_match 107/200
  - riskBand: exact_match 54/200
- Frontend build passes.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Expose SafeScope calibration output contract fields so the 200-case calibration runner can score hazard family/domain and jurisdiction honestly.

Purpose:
Before tuning reasoning, SafeScope must return calibration-friendly output fields for hazard family/domain and jurisdiction assessment. These fields may already exist internally but are unavailable to the runner. This task should expose existing determinations, not invent or overclaim new reasoning.

Part A — Inspect current output contract:
1. Inspect:
   - backend/src/safescope-v2/types/safescope-intelligence.types.ts
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts
   - backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.types.ts
   - backend/src/safescope-v2/safescope-v2.service.ts
   - backend/scripts/run-safescope-200-baseline-calibration.ts
   - backend/scripts/run-safescope-200-baseline-calibration-triage.ts
2. Determine where SafeScope currently computes:
   - jurisdiction / agency / site-type assessment
   - hazard domain / hazard family / primary family
   - scenario family if available
3. Do not duplicate logic if a field already exists internally.

Part B — Add calibration-friendly contract fields:
Add a safe, explicit calibration/meta output object such as:
- calibrationTrace
or
- normalizedAssessment
or
- outputContract

It should include, where available:
- hazardFamily
- hazardDomain
- scenarioFamily
- jurisdiction
- standardFamily
- riskBand
- mechanism
- evidenceGapKeys

Important:
- These are advisory/calibration fields, not legal conclusions.
- If unavailable, output null or unavailable with reason.
- Do not declare violations.
- Do not issue citations.

Part C — Update calibration runners:
1. Update:
   - backend/scripts/run-safescope-200-baseline-calibration.ts
   - backend/scripts/run-safescope-200-baseline-calibration-triage.ts
2. Make the runners extract hazardFamily and jurisdiction from the new output contract fields.
3. Preserve fallback extraction from old paths if useful.
4. Do not count unavailable fields as mismatches.
5. Update triage reasons so field availability is clear.

Part D — Update reports:
Update generated reports:
- safescope-data/benchmarks/safescope-200-baseline-calibration-results.v1.json
- safescope-data/benchmarks/safescope-200-baseline-triage-results.v1.json
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_RESULTS.md
- project-docs/08-audits/SAFESCOPE_200_CASE_CALIBRATION_TRIAGE.md

Reports should clearly state:
- hazardFamily and jurisdiction are now scorable if the contract exposure works
- any remaining unavailable fields
- current match rates
- next tuning priorities

Part E — Guardrails:
Preserve all advisory guardrails:
- advisoryOnly
- doesNotDeclareViolation
- doesNotCreateCitation
- doesNotOverrideRegulation
- requiresQualifiedReview
- doesNotSelfModifyWithoutApproval

Do not:
- tune risk scoring yet
- tune mechanism scoring yet
- tune standards/citation logic yet
- change dataset expectations
- weaken validation

Part F — Validation:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration.ts
- cd backend && npx ts-node scripts/run-safescope-200-baseline-calibration-triage.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Commit locally only with:
Expose SafeScope calibration output contract

Before committing, show:
- git diff --stat
- files changed
- baseline calibration summary
- triage summary
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
