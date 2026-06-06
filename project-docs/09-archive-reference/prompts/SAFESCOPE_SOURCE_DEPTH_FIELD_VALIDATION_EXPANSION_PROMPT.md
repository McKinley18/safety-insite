You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is synced with origin/main.
- HEAD commit is bde651a Advance SafeScope AI maturity foundation.
- Frontend build passed.
- Field validation scripts pass, but scoring currently reports:
  - scenarioFamily: 0
  - jurisdiction: 0
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Build SafeScope Source Depth & Field Validation Expansion.

Purpose:
SafeScope now has a governed AI maturity foundation. The next accuracy-preserving step is to deepen approved/pending source coverage and improve the field validation dataset/scoring quality so it better measures real-world readiness.

Primary objectives:
1. Expand field validation dataset quality.
2. Fix field validation scoring coverage for scenarioFamily and jurisdiction.
3. Add additional field validation seed cases.
4. Expand approved/pending source records conservatively.
5. Preserve governance, advisory-only limits, and validation discipline.

Part A — Field validation dataset quality:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
2. Determine why scoring reports:
   - scenarioFamily: 0
   - jurisdiction: 0
3. Fix either:
   - the dataset fields, if they are missing or named inconsistently
   - the scoring script, if it is reading the wrong property names
   - or both, if needed
4. Do not weaken validation.
5. Field validation records should consistently include:
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
   - expectedCitationCandidate if known or null
   - expectedCorrectiveActionTheme
   - evidenceGapsExpected
   - reviewerNotes
   - qualifiedReviewerDisposition
   - advisoryGuardrails

Part B — Field validation dataset expansion:
1. Expand the dataset from 10 cases to at least 20 total cases.
2. Add realistic field-style observations across:
   - conveyor cleanup near tail pulley
   - unguarded conveyor head pulley/drive
   - damaged electrical cord in use
   - energized equipment service with unclear lockout
   - mobile equipment near pedestrians
   - berm/roadway edge concern
   - elevated work/fall exposure
   - blocked emergency exit/access
   - chemical odor/exposure with missing SDS/PPE/ventilation facts
   - fire extinguisher inspection/access ambiguity
   - powered door malfunction with employee exposure
   - trench/excavation protective system ambiguity
   - scaffold or elevated platform access issue
   - walking-working surface slip/trip/fall issue
   - workplace exam / inspection documentation ambiguity, if current architecture supports it
3. Include vague and conflicting cases that should produce evidence gaps, not overclaims.
4. Do not use these cases to claim legal correctness. They are validation seeds for reasoning consistency.

Part C — Source depth expansion:
1. Inspect:
   - backend/src/safescope-v2/brain/source-governance/source-governance.registry.ts
   - backend/src/safescope-v2/brain/source-governance/source-governance.types.ts
   - backend/src/safescope-v2/brain/citation-review-brain
   - backend/src/safescope-v2/brain/standard-family-mapper
   - project-docs/05-source-intelligence
   - safescope-data/source-intelligence
2. Add conservative source records or source candidates for high-value families.
3. Prioritize:
   - MSHA guarding/moving machine parts
   - MSHA mobile equipment / berms / roadway edge protection
   - MSHA electrical
   - MSHA fire protection / emergency readiness
   - OSHA 1910 machine guarding
   - OSHA 1910 LOTO
   - OSHA 1910 electrical
   - OSHA 1910 walking-working surfaces
   - OSHA 1910 HazCom/SDS
   - OSHA 1926 fall protection
   - OSHA 1926 excavations/trenching
   - OSHA 1926 scaffolds
4. If exact applicability, citation mapping, or authority is uncertain, mark the record as:
   - draft
   - pending_review
   not approved.
5. Only high-confidence records with clear governance metadata should be approved.
6. Every source record/candidate should preserve:
   - authorityTier
   - approvalStatus
   - evidenceRequiredBeforeUse
   - nonApplicabilityIndicators
   - prohibitedUses
   - advisoryGuardrails
   - traceNotes

Part D — Scoring/readiness improvement:
1. Improve the scoring script output so it clearly reports:
   - total cases
   - valid cases
   - scenario family coverage count
   - jurisdiction coverage count
   - risk band coverage count
   - mechanism coverage count
   - evidence gap coverage count
   - source/standard family coverage count
   - missing fields by case
   - readiness status
   - recommended next field cases
2. It should flag when coverage values are unexpectedly zero.
3. It should not overclaim production or legal readiness.

Part E — Documentation:
Add or update:
- project-docs/08-audits/SAFESCOPE_SOURCE_DEPTH_FIELD_VALIDATION_EXPANSION.md

The document should summarize:
- field validation improvements
- dataset expansion
- scoring improvements
- source expansion
- governance status
- validation run
- remaining gaps
- next recommended batch

Accuracy / governance requirements:
- Preserve all advisory guardrails:
  - advisoryOnly
  - doesNotDeclareViolation
  - doesNotCreateCitation
  - doesNotOverrideRegulation
  - requiresQualifiedReview
  - doesNotSelfModifyWithoutApproval
- Do not make SafeScope declare violations.
- Do not make SafeScope issue citations.
- Do not treat pending/draft/rejected/deprecated records as authoritative.
- Do not hide evidence gaps.
- Do not weaken existing validations.
- Do not break frontend/backend separation.
- Do not push.
- Do not deploy.

Validation requirements:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- source governance validation if source governance is touched
- citation review validation if citation logic is touched
- cd frontend-next && npm run build if frontend is touched
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Commit:
Commit locally only with:
Expand SafeScope source depth and field validation

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
