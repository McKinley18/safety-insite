You are continuing the Sentinel Safety / SafeScope backend build.

Goal:
Implement SafeScope Risk Verification + Residual Risk Reassessment v1.

Context:
SafeScope currently has:
- hazard taxonomy routing
- approved knowledge retrieval
- field output composer
- scenario expansion pack
- scenario evaluation scoring
- field evidence weighting and contradiction handling
- multi-hazard observation decomposition
- observation narrative synthesis
- cross-domain causal chain reasoning
- corrective action strategy ranking
- targeted validation mode
- master validation passing at 49/49
- frontend build passing

New capability needed:
SafeScope must evaluate whether a proposed or completed corrective action actually addresses the hazard mechanism and whether residual risk remains.

This is critical because SafeScope should not simply recommend actions. It should reason about action quality, verification, residual exposure, and whether the hazard is truly controlled.

Build the following:

1. Risk Verification + Residual Risk System

Create:
backend/src/safescope-v2/risk-verification-residual-risk/
  risk-verification-residual-risk.types.ts
  risk-verification-residual-risk.service.ts
  risk-verification-residual-risk.validator.ts

The service should accept:
{
  observationText,
  hazardRoute,
  evidenceWeighting,
  causalChains,
  correctiveActionStrategy,
  proposedActions,
  completedActions,
  context
}

It should output:
- verificationStatus:
  - not_ready_for_verification
  - verification_needed
  - partially_verified
  - verified_controlled
  - residual_risk_remaining
  - escalation_required
- residualRiskLevel:
  - none
  - low
  - moderate
  - high
  - critical
  - unknown
- actionEffectiveness:
  - effective
  - partially_effective
  - weak
  - ineffective
  - unknown
- addressedMechanisms[]
- unaddressedMechanisms[]
- verificationSteps[]
- residualRiskReasons[]
- additionalControlsNeeded[]
- weakActionWarnings[]
- reviewerQuestions[]
- confidenceAdjustment
- advisoryBoundary

2. Deterministic reasoning rules

SafeScope should identify weak or incomplete actions such as:
- "be careful"
- "retrain only"
- "monitor"
- "talk to employee"
- "put up sign only"
- "remind crew"
- "clean later"
- "inspect later"

These should not be treated as sufficient controls for physical hazards with active exposure.

SafeScope should recognize stronger controls such as:
- remove from service
- isolate energy
- lock out/tag out
- install/replace guard
- barricade/exclusion zone
- repair/replace damaged component
- stop work until verified
- test atmosphere
- provide required protective system
- remove spill and verify dry/non-slip surface
- label container and verify SDS
- clear egress path
- verify competent/qualified review

3. Residual risk logic

Examples:
- Unguarded conveyor + action "retrain employees" => residual risk remains high.
- Damaged electrical cord + action "remove from service and replace cord" => verification needed, residual risk low if verified.
- Wet floor cleaned but no dry verification => residual risk moderate.
- Conflicting evidence => not ready for verification or escalation required.
- Multi-hazard observation where only one hazard was fixed => residual risk remains for unresolved hazards.
- Corrective action already taken but exposure status unclear => verification needed.
- High severity + weak evidence => escalation required.

4. Integration

Wire RiskVerificationResidualRiskService into:
backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/
backend/src/safescope-v2/field-output-composer-v1/

The retrieval output should include residual risk verification.

The composer output should:
- include verification steps
- include residual risk warnings
- avoid marking hazards as resolved unless verification supports it
- avoid confident closure when evidence is weak/conflicting
- preserve advisory-only boundaries
- never claim legal compliance
- never claim a violation/citation

5. Validation

Create:
backend/scripts/validate-safescope-risk-verification-residual-risk-v1.ts

Validation cases must include:
- unguarded conveyor + retrain only => residual risk high / weak action warning
- unguarded conveyor + guard installed but no exposure verification => verification needed
- damaged cord + removed from service/replaced => partially verified or verified controlled
- wet floor cleaned but still damp/no dry verification => residual risk remaining
- conflicting energized/de-energized evidence => not ready or escalation required
- multi-hazard case where only one hazard is corrected => residual risk remaining
- vague observation + vague action => unknown / not ready
- strong physical control + verification step present => low or none residual risk
- integration case confirming retrieval output includes residual risk verification
- integration case confirming composer does not close out unresolved risk

Validator should fail if:
- weak actions are treated as fully effective for serious hazards
- residual risk is missing when hazards remain unresolved
- conflicting evidence is treated as verified controlled
- advisoryBoundary is missing
- output uses violation/citation/legal compliance language

6. Runner wiring

Add validator to:
backend/scripts/run-safescope-full-validation.ts

Add validator to targeted validation runner:
backend/scripts/run-safescope-targeted-validation.ts

Areas:
- core
- output
- orchestrator
- governance if appropriate

7. Documentation

Update:
project-docs/00-index/SENTINEL_SAFETY_CAPABILITY_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_SYSTEM_INDEX.md
project-docs/04-safescope-engine/SAFESCOPE_AI_TRANSITION_GAP_MAP.md
project-docs/04-safescope-engine/SAFESCOPE_VALIDATED_AI_TRANSITION_PLAN.md

Archive this prompt to:
project-docs/09-archive-reference/prompts/SAFESCOPE_RISK_VERIFICATION_AND_RESIDUAL_RISK_REASSESSMENT_V1_PROMPT.md

8. Validation required before commit

Run:
cd backend
npm run validate:safescope:targeted:core
npm run validate:safescope:targeted:output
npm run validate:safescope:targeted:orchestrator
npm run build
npm run validate:safescope:full

Then:
cd ../frontend-next
npm run build

Before committing:
- If precision benchmark files changed only by generatedAt timestamp, restore them.
- Do not commit timestamp-only benchmark churn.

Commit locally only:
git add relevant files
git commit -m "Add SafeScope risk verification and residual risk reassessment v1"

Do not push.
