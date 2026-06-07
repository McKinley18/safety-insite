You are working in the Sentinel_Safety repo.

Goal:
Implement SafeScope Approved Knowledge Population + Real Retrieval Matching v1 as a larger AI-transition edit.

Context:
SafeScope already has:
- hazard taxonomy coverage routing
- hazard information absorption
- approved knowledge registry IO/search scaffolds
- approved knowledge review API v1
- approved knowledge promotion workflow v1
- evidence sufficiency
- confidence governance
- source-backed applicability governance
- output policy governor
- defensible corrective action core
- field output contract validator
- master validation runner

Objective:
Wire approved/reviewed knowledge retrieval into SafeScope field output generation without weakening advisory-only boundaries.

Strict requirements:
1. Do not claim violations.
2. Do not issue citations as final determinations.
3. Do not bypass human review.
4. Do not auto-promote draft candidates into approved knowledge.
5. Do not use draft knowledge as authoritative final output.
6. Approved knowledge output must remain advisory, source-backed, evidence-aware, and reviewable.
7. All new files must have validators.
8. Add validation to the master runner.
9. Preserve existing passing validations.
10. Do not push.

Build:
1. Create a new backend system under:
   backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/

2. Include:
   - approved-knowledge-retrieval-output-v1.types.ts
   - approved-knowledge-retrieval-output-v1.service.ts
   - approved-knowledge-retrieval-output-v1.validator.ts

3. The service should accept:
   - observationText
   - optional jurisdiction
   - optional industry/site context
   - optional evidence fields
   - taxonomy route result if provided

4. The service should:
   - route the observation through hazard taxonomy if no route is provided
   - query approved/reviewed knowledge records using existing registry/search scaffolds if available
   - return matched records with authority tier, source/citation metadata, confidence, and applicability notes
   - separate approved records from draft candidates
   - never treat drafts as authoritative
   - provide evidence gaps when applicability is incomplete
   - provide advisory output boundaries

5. Output shape should include:
   - version
   - observationSummary
   - taxonomyRoute
   - approvedKnowledgeMatches
   - draftKnowledgeWarnings
   - applicabilityAssessment
   - confidence
   - evidenceGaps
   - advisoryBoundaries
   - recommendedReviewerActions
   - fieldOutputNotes

6. Add a validation script:
   backend/scripts/validate-safescope-approved-knowledge-retrieval-output-v1.ts

7. Validator must test:
   - clear machine guarding/conveyor observation
   - clear electrical damaged cord observation
   - HazCom unlabeled secondary container observation
   - vague observation with insufficient evidence
   - draft-only knowledge must not be treated as approved
   - output includes advisory boundaries
   - output includes evidence gaps when applicable
   - no prohibited final violation language appears

8. Add the validator to:
   backend/scripts/run-safescope-full-validation.ts

9. Update docs:
   - project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
   - project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md
   - project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
   - project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md

10. Archive this prompt under:
    project-docs/09-archive-reference/prompts/SAFESCOPE_APPROVED_KNOWLEDGE_POPULATION_AND_RETRIEVAL_MATCHING_V1_PROMPT.md

Validation:
Run:
cd backend
npm run build
npx ts-node scripts/validate-safescope-approved-knowledge-retrieval-output-v1.ts
npm run validate:safescope:full

Then:
cd ../frontend-next
npm run build
EOF
