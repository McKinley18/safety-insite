You are working in the Sentinel Safety repo.

Goal:
Add a SafeScope Approved Knowledge Registry Schema and Draft Candidate Export foundation.

This layer defines the approved-knowledge record format SafeScope will eventually trust, plus a draft candidate export format for records that pass governance but are not yet approved.

This is not automatic learning.
This is not a citation generator.
This is not a violation-declaration layer.
This is not a scenario memorization layer.
Do not create a 100-case baseline.
Do not create large scenario datasets.
Do not automatically write approved knowledge.
Do not create DB migrations yet.

Important product boundary:
SafeScope remains advisory-only.
It must not declare violations.
It must not create citations.
It must require qualified human review.
Do not remove or weaken any existing guardrails.

Current committed checkpoint:
- 9ac0b2c Add SafeScope master validation runner
- 6df09d3 Add SafeScope governance output snapshot fixture
- f789644 Add SafeScope governance pipeline contract validator
- 2e8377d Add SafeScope approved knowledge registry write guard core
- 2c879de Add SafeScope approved knowledge promotion workflow governance core
- a9ebc83 Add SafeScope approved source knowledge intake governance core
- 5030380 Add SafeScope source-backed applicability governance core
- 7f67cce Add SafeScope human review learning governance core
- 6ff13f9 Add SafeScope defensible corrective action core

Task:
Create a SafeScope approved-knowledge registry schema foundation under:

backend/src/safescope-v2/approved-knowledge-registry/

Add these files:

1. backend/src/safescope-v2/approved-knowledge-registry/approved-knowledge-record.types.ts
2. backend/src/safescope-v2/approved-knowledge-registry/approved-knowledge-registry.validator.ts
3. backend/src/safescope-v2/approved-knowledge-registry/approved-knowledge-draft-export.service.ts
4. backend/scripts/validate-safescope-approved-knowledge-registry-schema.ts

Also create data directories and seed files:

5. safescope-data/approved-knowledge/approved-knowledge-registry.v1.json
6. safescope-data/approved-knowledge/draft-candidates/README.md

Do not create DB migrations.
Do not persist runtime records.
Do not connect this to automatic learning yet.
Do not use external network calls.

Required approved knowledge record shape:
- recordId
- version
- status: approved | draft_candidate | retired | rejected
- authority
  - agency: OSHA | MSHA | NIOSH | ANSI | NFPA | COMPANY | UNKNOWN
  - authorityTier: primary_regulation | official_guidance | consensus_standard | company_policy | unknown
  - jurisdiction: osha_general_industry | osha_construction | msha | company_policy | unknown
  - sourceUrl
  - citation
  - title
  - effectiveDate
  - revisionDate
  - sourceDateStatus: current | outdated | unknown
- mapping
  - standardFamily
  - hazardFamilies
  - mechanisms
  - equipmentGroups
  - taskContexts
  - applicabilitySignals
  - requiredFacts
  - disqualifyingFacts
  - evidenceQuestions
- applicability
  - plainLanguageSummary
  - appliesWhen
  - doesNotApplyWhen
  - requiredReviewerChecks
- correctiveActionLinks
  - preferredControlFamilies
  - verificationMethods
  - commonWeakActionsToAvoid
- governance
  - approvedBy
  - approvedAt
  - lastReviewedAt
  - reviewerRole
  - changeReason
  - supersedesRecordIds
  - duplicateKeys
  - advisoryOnly: true
  - doesNotDeclareViolation: true
  - doesNotCreateCitation: true
  - requiresQualifiedReview: true

Required validator behavior:
- Validate every approved record has required fields.
- Validate no record weakens advisory guardrails.
- Validate approved records require approvedBy, approvedAt, reviewerRole, and changeReason.
- Validate draft_candidate records do not require approvedBy/approvedAt but must remain non-approved.
- Validate rejected/retired records are not treated as usable.
- Validate citation/title/jurisdiction/sourceUrl exist for approved primary regulation or official guidance.
- Validate unknown authority cannot be approved.
- Validate duplicateKeys are present and stable.
- Validate mapping has at least one hazard family, mechanism, applicability signal, and evidence question for approved records.
- Validate no prohibited declaration language appears:
  - "is a violation"
  - "creates a citation"
  - "will be cited"
  - "non-compliant"
  - "noncompliant"
  - "regulatory violation"
  - "must comply"
- Validation should fail with process.exit(1) if any record fails.

Required draft export service behavior:
- Accept candidate-like input from ASKIG/AKPWG/AKRWG style governance outputs.
- Produce a draft_candidate record shape.
- Never mark exported draft as approved.
- Include missing fields as explicit review needs.
- Preserve advisory guardrails.
- Do not write automatically unless called by validation script with a test output path.
- Write test draft export only to safescope-data/approved-knowledge/draft-candidates/test-draft-candidate.v1.json during validation.

Validation script:
Create backend/scripts/validate-safescope-approved-knowledge-registry-schema.ts

It should:
1. Validate an empty approved registry file is structurally valid.
2. Validate one in-memory approved OSHA sample record passes.
3. Validate one in-memory approved MSHA sample record passes.
4. Validate unknown authority approved record fails.
5. Validate missing citation approved record fails.
6. Validate prohibited declaration language fails.
7. Validate draft_candidate record can exist without approvedBy/approvedAt.
8. Validate draft export service creates a draft_candidate, not approved.
9. Validate exported draft preserves advisory guardrails.
10. Validate duplicateKeys and mapping completeness checks work.

After implementation, run:

cd backend
npm run build
npx ts-node scripts/validate-safescope-approved-knowledge-registry-schema.ts
npm run validate:safescope:full

Then run:

cd ../frontend-next
npm run build

Then update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md

Add a new checkpoint section stating:
- SafeScope Approved Knowledge Registry Schema added.
- It defines the approved knowledge record structure.
- It defines draft candidate export behavior.
- It validates authority, citation, jurisdiction, source URL, mapping completeness, duplicate keys, review metadata, and advisory guardrails.
- It prevents draft candidates from being treated as approved records.
- It does not persist runtime knowledge or automatically promote knowledge.
- Existing master validation remains green.
- Advisory-only boundaries remain preserved.

Also update:
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Add a short note after the Approved Knowledge Registry Write Guard note stating that the Approved Knowledge Registry Schema is the structural foundation for future source-backed approved knowledge records and draft candidates.

Archive this prompt into:

project-docs/09-archive-reference/prompts/

Do not commit unless all validation passes.

At the end, show:
- git status --short
- git diff --stat
- exact validation results
- files changed
