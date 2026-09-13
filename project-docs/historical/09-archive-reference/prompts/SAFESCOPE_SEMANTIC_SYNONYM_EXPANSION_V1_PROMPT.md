You are continuing the Sentinel Safety / SafeScope backend build.

Goal:
Implement SafeScope Semantic Synonym Expansion v1.

Context:
SafeScope currently has:
- hazard taxonomy routing
- approved knowledge retrieval
- field output composer
- scenario expansion and scenario evaluation scoring
- field evidence weighting and contradiction handling
- multi-hazard decomposition
- observation narrative synthesis
- cross-domain causal chain reasoning
- corrective action strategy ranking
- risk verification and residual risk reassessment
- human review feedback loop and learning governance
- source freshness governance
- jurisdiction applicability decision tree
- audit-ready reasoning trace and explainability
- source ingestion and approved update workflow
- reviewer candidate console backend/frontend/API wiring
- full validation passing at 57/57
- frontend build passing

New capability needed:
SafeScope needs to recognize equivalent field language across safety observations without relying only on exact keywords.

Build Semantic Synonym Expansion v1 as a governed deterministic semantic signal layer.

Requirements:

1. Create:
backend/src/safescope-v2/semantic-synonym-expansion/
  semantic-synonym-expansion.types.ts
  semantic-synonym-expansion.service.ts
  semantic-synonym-expansion.validator.ts

2. The service should accept:
{
  observationText,
  taxonomyRoute,
  context,
  jurisdictionAssessment,
  evidenceWeighting,
  multiHazardAnalysis
}

3. The service should output:
- version
- normalizedObservationText
- expandedSignals[]
- detectedSynonymGroups[]
- primarySemanticFamilies[]
- semanticConfidenceScore
- matchedCanonicalTerms[]
- unmappedTerms[]
- possibleAmbiguities[]
- governanceWarnings[]
- reviewerQuestions[]
- advisoryBoundary

4. Create governed synonym groups for at least:
- machine_guarding:
  pinch point, nip point, caught-in, caught between, draw-in, rotating parts, moving parts, in-running nip
- lockout_tagout:
  energized, live, power on, running, not isolated, not locked out, no lock, unexpected startup, stored energy
- electrical:
  exposed wire, damaged cord, frayed cord, live conductor, open panel, missing cover, shock hazard
- slips_trips_falls:
  wet floor, slick surface, slippery, standing water, spill, trip hazard, uneven surface
- fall_protection:
  open edge, unprotected edge, missing guardrail, no fall protection, elevated work, leading edge
- mobile_equipment:
  forklift, loader, haul truck, powered industrial truck, mobile equipment, blind spot, pedestrian exposure
- hazcom:
  unlabeled, no label, missing SDS, unknown chemical, secondary container, illegible label
- confined_space:
  confined space, tank, vessel, pit, atmospheric hazard, oxygen deficient, no air monitoring
- emergency_egress:
  blocked exit, blocked egress, obstructed walkway, emergency route blocked, exit access blocked

5. Matching rules:
- Normalize punctuation/case.
- Avoid unsafe substring false positives.
- “guarded” must not match inside “unguarded.”
- “labeled” must not match inside “unlabeled.”
- Longer phrase matches should win over shorter phrase matches.
- Preserve original observation text.
- Do not produce citation/violation language.

6. Integration:
Wire semantic synonym expansion into:
backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/
backend/src/safescope-v2/field-output-composer-v1/
backend/src/safescope-v2/audit-ready-reasoning-trace/

The retrieval output should include semanticSynonymExpansion.

The composer should use expanded signals to:
- improve field assessment wording
- improve reviewer questions
- avoid overconfidence when synonym matches are ambiguous
- preserve advisory-only boundaries

The audit trace should list:
- synonym groups used
- canonical terms matched
- ambiguity warnings
- confidence contribution

7. Validation:
Create:
backend/scripts/validate-safescope-semantic-synonym-expansion-v1.ts

Validation cases must include:
- “in-running nip point at conveyor tail pulley”
- “caught-in point near rotating shaft”
- “power still on and no lock applied”
- “frayed extension cord across wet floor”
- “slick walkway from standing water”
- “open edge with no guardrail”
- “forklift blind spot with pedestrians nearby”
- “secondary chemical container with no label”
- “tank entry with no air monitoring”
- “blocked emergency exit route”
- substring safety: guarded must not match unguarded incorrectly
- substring safety: labeled must not match unlabeled incorrectly
- vague observation should not produce high semantic confidence

Validator should fail if:
- canonical terms are missing for clear synonym cases
- substring false positives occur
- advisoryBoundary is missing
- prohibited violation/citation language appears
- vague observations receive high confidence

8. Add validator to:
backend/scripts/run-safescope-full-validation.ts
backend/scripts/run-safescope-targeted-validation.ts

Add to targeted areas:
- core
- knowledge
- output
- orchestrator
- governance if appropriate

9. Documentation:
Update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md
project-docs/04-safescope-engine/SAFESCOPE_REMAINING_AI_CLASSIFICATION_GAP_ANALYSIS.md

Archive this prompt to:
project-docs/09-archive-reference/prompts/SAFESCOPE_SEMANTIC_SYNONYM_EXPANSION_V1_PROMPT.md

10. Validation required before commit:
cd backend
npm run validate:safescope:targeted:core
npm run validate:safescope:targeted:knowledge
npm run validate:safescope:targeted:output
npm run validate:safescope:targeted:orchestrator
npm run validate:safescope:targeted:governance
npm run build
npm run validate:safescope:full

cd ../frontend-next
npm run build

cd ..

Before committing:
- Restore timestamp-only benchmark churn.
- Restore generated reviewer candidate validation data churn if present.

git restore \
  safescope-data/benchmarks/safescope-precision-batch-001-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json \
  safescope-data/benchmarks/safescope-precision-batch-003-results.v1.json \
  safescope-data/reviewer-candidates/candidates.json 2>/dev/null || true

Commit locally only:
git add \
  backend/src/safescope-v2/semantic-synonym-expansion \
  backend/scripts/validate-safescope-semantic-synonym-expansion-v1.ts \
  backend/scripts/run-safescope-full-validation.ts \
  backend/scripts/run-safescope-targeted-validation.ts \
  backend/src/safescope-v2/approved-knowledge-retrieval-output-v1 \
  backend/src/safescope-v2/field-output-composer-v1 \
  backend/src/safescope-v2/audit-ready-reasoning-trace \
  project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md \
  project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md \
  project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md \
  project-docs/04-safescope-engine/SAFESCOPE_REMAINING_AI_CLASSIFICATION_GAP_ANALYSIS.md \
  project-docs/09-archive-reference/prompts/SAFESCOPE_SEMANTIC_SYNONYM_EXPANSION_V1_PROMPT.md

git commit -m "Add SafeScope semantic synonym expansion v1"

git status
git log --oneline origin/main..HEAD

Do not push.
