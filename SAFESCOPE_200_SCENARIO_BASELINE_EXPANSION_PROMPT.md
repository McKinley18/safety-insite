You are continuing the Sentinel Safety / SafeScope build.

Current verified state:
- Repository is clean.
- Branch main is ahead of origin/main by 3 local commits.
- Current field validation dataset validates:
  - Total Cases: 100
  - Valid Cases: 100
  - scenarioFamily: 100
  - riskBand: 100
  - mechanism: 100
  - jurisdiction: 100
  - evidenceGap: 100
  - standardFamily: 100
- Dataset uniqueness validation reports:
  - Duplicate signature count: 0
- Frontend build passed.
- No frontend backend/src imports found.
- Do not push.
- Do not deploy.
- Local commits only.

Goal:
Expand the SafeScope baseline calibration dataset from 100 to exactly 200 unique, schema-valid scenarios using the same controlled matrix-based method.

Important:
Do not simply reword existing scenarios.
Do not create duplicates with changed wording.
Do not create 100 variants of the same conveyor/electrical/fall scenario.
Every added scenario must be unique by hazard family, scenario family, mechanism, jurisdiction, equipment/context, task, control failure, and exposure pattern.

Part A — Inspect existing dataset and uniqueness logic:
1. Inspect:
   - safescope-data/benchmarks/safescope-field-validation-dataset.v1.json
   - backend/scripts/validate-safescope-field-validation-dataset.ts
   - backend/scripts/score-safescope-field-validation-dataset.ts
   - backend/scripts/validate-dataset-uniqueness.ts
   - project-docs/08-audits/SAFESCOPE_100_SCENARIO_BASELINE_CALIBRATION.md
2. Identify the existing 100 scenario signatures before adding new ones.
3. Preserve the existing schema exactly unless a validation-safe additive field is already supported.

Part B — Expand dataset to exactly 200 total cases:
1. Add exactly 100 new complete cases so the dataset totals exactly 200.
2. Continue ID sequencing consistently.
3. Every case must include:
   - id
   - observationText
   - siteType
   - jurisdiction
   - equipment
   - task
   - controlFailure
   - exposurePattern
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

Part C — Coverage requirements for the additional 100:
The new 100 cases must expand coverage across underrepresented or higher-complexity situations, including:

MSHA / mining:
- haul road berm deficiencies
- dump point edge protection
- seatbelt/ROPS context ambiguity
- mobile equipment pre-op defects
- backup alarm/visibility concerns
- equipment-pedestrian interaction
- crusher/screen/conveyor guarding
- maintenance near moving machine parts
- electrical cabinets/cables in wet or damaged conditions
- fire extinguisher access/inspection/readiness
- workplace exam documentation ambiguity
- highwall/ground condition concern if supported
- stockpile/feed hopper engulfment or draw-down concern if supported

OSHA general industry:
- machine guarding point-of-operation exposure
- conveyor or rotating shaft guarding
- lockout/tagout procedural ambiguity
- energized troubleshooting exposure
- damaged cords/panels/extension cord misuse
- walking-working surface slip/trip hazards
- fixed ladder/platform/open-sided edge concerns
- chemical labeling/SDS/PPE/ventilation uncertainty
- emergency exit/access blockage
- fire extinguisher placement/access/inspection ambiguity
- forklift-pedestrian interaction
- powered industrial truck visibility/loading issues
- confined space/atmospheric hazard ambiguity if supported

OSHA construction:
- excavation/trenching protective system ambiguity
- spoil pile/setback issues
- scaffold planking/access/guardrail concerns
- aerial lift/fall protection concerns
- ladder use/setup/access issues
- roof or leading-edge fall exposure
- struck-by material handling/crane/rigging ambiguity if supported
- temporary electrical/GFCI/cord damage
- silica/dust/respiratory exposure uncertainty if supported
- housekeeping/egress/access issues

Cross-cutting complexity:
- at least 15 vague/incomplete observations
- at least 10 conflicting-evidence observations
- at least 10 jurisdiction-ambiguous observations
- at least 10 cases where expectedCitationCandidate should be null because evidence is insufficient
- at least 10 cases where risk should remain unknown/moderate due to missing exposure or control details
- at least 10 high/critical cases with credible active exposure
- at least 10 cases where existing controls reduce residual risk but do not erase initial risk

Part D — Strengthen duplicate detection:
1. Update backend/scripts/validate-dataset-uniqueness.ts if needed.
2. Duplicate signature detection must check all 200 cases using:
   - expectedHazardFamily
   - expectedScenarioFamily
   - expectedMechanism
   - jurisdiction
   - equipment
   - task
   - controlFailure
   - exposurePattern
3. Add a near-duplicate warning based on observation text normalization:
   - lowercase
   - remove punctuation
   - remove extra spaces
   - optionally compare key tokens
4. Do not fail on near-duplicate warnings unless exact duplicate signatures exist, but print warnings clearly.
5. The script should output:
   - total cases
   - valid cases if easy
   - duplicate signature count
   - duplicate IDs if any
   - near-duplicate warning count
   - hazard family counts
   - scenario family counts
   - jurisdiction counts
   - risk band counts
   - evidence gap counts
   - readiness status

Part E — Documentation:
Create or update:
- project-docs/08-audits/SAFESCOPE_200_SCENARIO_BASELINE_CALIBRATION.md

Document:
- 200-case matrix expansion
- uniqueness rules
- hazard/jurisdiction coverage
- vague/conflicting/jurisdiction-ambiguous scenario coverage
- limitations
- that this is calibration data, not legal determination data

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
- Do not claim legal correctness.
- Do not treat expectedCitationCandidate as a final citation.
- Do not weaken validation to pass.
- Do not push.
- Do not deploy.

Validation requirements:
Run:
- cd backend && npx ts-node scripts/validate-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/score-safescope-field-validation-dataset.ts
- cd backend && npx ts-node scripts/validate-dataset-uniqueness.ts
- cd frontend-next && npm run build
- grep -R "backend/src" frontend-next --include="*.ts" --include="*.tsx" -n || true

Commit locally only with:
Expand SafeScope baseline calibration to 200 scenarios

Before committing, show:
- git diff --stat
- files changed
- validation results

After committing, show:
- git status
- git log --oneline -10

Do not push.
Do not deploy.
