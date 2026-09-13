You are working in the Sentinel_Safety repository.

Goal:
Create SafeScope targeted validation mode so future development does not require running the full master validation suite after every small edit.

Current known state:
- main is clean and synced to origin/main at commit 3643c43.
- Full SafeScope validation recently passed 42/42.
- Frontend build passed.
- SafeScope now includes:
  - hazard taxonomy coverage routing
  - hazard information absorption
  - approved knowledge review API v1
  - approved knowledge promotion workflow
  - approved knowledge retrieval output v1
  - field output composer v1
  - orchestrator field output wiring
  - master validation runner
  - system index audit
  - draft knowledge pack registry / gap reports

Important rules:
- Do not push.
- Work locally only.
- Do not remove or weaken any advisory-only governance.
- Do not introduce violation/citation declaration language.
- Do not bypass human review requirements.
- Do not delete existing validators.
- Make targeted validation additive and compatible with the existing full validation runner.
- Preserve the current full validation command:
  npm run validate:safescope:full

Build requirements:
1. Add a targeted validation runner:
   backend/scripts/run-safescope-targeted-validation.ts

2. The runner must accept:
   --area taxonomy
   --area knowledge
   --area output
   --area orchestrator
   --area governance
   --area precision
   --area frontend-safe
   --area core
   --area all

3. The targeted runner should run appropriate subsets:
   taxonomy:
   - validate-safescope-hazard-taxonomy-coverage.ts
   - validate-safescope-hazard-information-absorption.ts

   knowledge:
   - validate-safescope-approved-knowledge-review-api-v1.ts
   - validate-safescope-approved-knowledge-promotion-v1.ts
   - validate-safescope-approved-knowledge-retrieval-output-v1.ts
   - validate-safescope-approved-knowledge-registry-io.ts
   - validate-safescope-approved-knowledge-search.ts
   - validate-safescope-approved-knowledge-registry-schema.ts

   output:
   - validate-safescope-approved-knowledge-retrieval-output-v1.ts
   - validate-safescope-field-output-composer-v1.ts
   - validate-safescope-field-output-contract.ts

   orchestrator:
   - validate-safescope-orchestrator-field-output-wiring.ts
   - validate-safescope-governance-output-snapshot.ts
   - validate-safescope-main-output-observation-understanding.ts
   - validate-safescope-observation-trace-snapshot.ts

   governance:
   - validate-safescope-governance-output-snapshot.ts
   - validate-safescope-governance-pipeline-contract.ts
   - validate-safescope-approved-knowledge-registry-write-guard.ts
   - validate-safescope-approved-knowledge-promotion-workflow-governance.ts
   - validate-safescope-approved-source-knowledge-intake-governance.ts
   - validate-safescope-source-backed-applicability-governance.ts
   - validate-safescope-human-review-learning-governance.ts
   - validate-safescope-output-policy.ts
   - validate-safescope-confidence-governance.ts

   precision:
   - run-safescope-precision-batch-001.ts
   - run-safescope-precision-batch-002.ts
   - run-safescope-precision-batch-003.ts

   core:
   - npm run build
   - audit-safescope-system-index.ts
   - validate-safescope-hazard-taxonomy-coverage.ts
   - validate-safescope-approved-knowledge-retrieval-output-v1.ts
   - validate-safescope-field-output-composer-v1.ts
   - validate-safescope-orchestrator-field-output-wiring.ts
   - validate-safescope-field-output-contract.ts

   frontend-safe:
   - do not run frontend build from backend runner unless simple and safe; instead document the separate command:
     cd frontend-next && npm run build

   all:
   - may call the existing full runner or run all target groups without duplicates.

4. Add npm scripts in backend/package.json:
   validate:safescope:targeted
   validate:safescope:targeted:taxonomy
   validate:safescope:targeted:knowledge
   validate:safescope:targeted:output
   validate:safescope:targeted:orchestrator
   validate:safescope:targeted:governance
   validate:safescope:targeted:precision
   validate:safescope:targeted:core

5. Add documentation:
   project-docs/04-safescope-engine/SAFESCOPE_TARGETED_VALIDATION_GUIDE.md

6. Update:
   project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
   project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

7. Add audit coverage:
   Update audit-safescope-system-index.ts so it checks that:
   - targeted validation runner exists
   - targeted validation guide exists
   - backend/package.json includes validate:safescope:targeted

8. Run validation and commit.
