You are working in the Sentinel_Safety repo.

Goal:
Wire SafeScope approved-knowledge-retrieval-output-v1 and field-output-composer-v1 into the real SafeScope orchestration path so the main SafeScope output can expose governed, field-facing advisory output generated from the validated retrieval/composer pipeline.

Rules:
- Do not push.
- Do not deploy.
- Make local edits only.
- Preserve all advisory-only boundaries.
- Do not use violation/citation/conclusive enforcement language.
- Do not remove existing governance, evidence sufficiency, confidence, observation understanding, taxonomy, or field output contract behavior.
- Prefer additive changes over disruptive rewrites.
- Make appropriate decisions without asking the user for input.
- If an issue appears, fix it using the existing project conventions.
- Keep TypeScript strict and validation-driven.

Required work:
1. Inspect current orchestration files:
   - backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts
   - backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/
   - backend/src/safescope-v2/field-output-composer-v1/
   - backend/scripts/validate-safescope-main-output-observation-understanding.ts
   - backend/scripts/validate-safescope-field-output-contract.ts
   - backend/scripts/run-safescope-full-validation.ts

2. Integrate the retrieval/composer pipeline into the main SafeScope orchestration output:
   - The orchestrator should create approved knowledge retrieval output from the hazard/observation text.
   - The orchestrator should pass retrieval output into the field output composer.
   - The main output should expose a new clearly named field such as:
     fieldAdvisoryOutput
     or
     composedFieldOutput
   - The field must include practical field-facing notes, evidence gaps, advisory boundaries, and reviewer actions.
   - The new field must not replace existing output fields yet; keep backward compatibility.

3. Add/extend validation:
   - Add a targeted validator script if needed:
     backend/scripts/validate-safescope-orchestrator-field-output-wiring.ts
   - Validate that:
     a. conveyor guarding observation returns composed field output
     b. damaged electrical cord observation returns composed field output
     c. vague observation stays cautious/advisory
     d. advisory boundaries are always present
     e. no prohibited conclusive enforcement language appears
   - Add the validator to backend/scripts/run-safescope-full-validation.ts.

4. Update docs:
   - project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
   - project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md
   - project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
   - project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md

5. Run targeted validation first:
   - cd backend
   - npm run build
   - npx ts-node scripts/validate-safescope-approved-knowledge-retrieval-output-v1.ts
   - npx ts-node scripts/validate-safescope-field-output-composer-v1.ts
   - npx ts-node scripts/validate-safescope-orchestrator-field-output-wiring.ts

6. Run full validation only after targeted validation passes:
   - npm run validate:safescope:full

7. Run frontend build:
   - cd ../frontend-next
   - npm run build

8. Return to root and show final status:
   - cd ..
   - git status --short
   - git --no-pager diff --stat
   - git log --oneline origin/main..HEAD

9. Commit locally only if all validation/build steps pass:
   - git add all relevant changed/new files
   - git commit -m "Wire SafeScope field output composer into orchestration"

Expected result:
- Main SafeScope orchestration now includes governed field-facing advisory output from the validated retrieval/composer pipeline.
- Full validation passes.
- Frontend build passes.
- Local commit created.
- No push performed.
