You are continuing the Sentinel Safety / SafeScope backend build.

Goal:
Implement SafeScope Cross-Domain Causal Chain Reasoning v1.

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
- targeted validation mode
- full validation passing at 47/47
- frontend build passing

New capability needed:
SafeScope should not only detect multiple hazards. It should explain how hazards interact and how one unsafe condition can create or worsen another. This is a major step toward true safety-intelligence behavior.

Examples:
- Unguarded conveyor + employee cleanup nearby + no lockout = rotating nip-point exposure plus unexpected startup pathway.
- Damaged electrical cord + wet floor = electrical shock risk worsened by conductive surface/slip exposure.
- Forklift traffic + blocked pedestrian walkway + poor visibility = struck-by risk amplified by forced pedestrian path.
- Chemical container unlabeled + spill nearby + no SDS = exposure uncertainty plus emergency response uncertainty.
- Open edge + material staging nearby = fall exposure plus struck-by/material handling interaction.
- Confined space entry + no atmospheric testing + poor rescue readiness = atmospheric hazard plus emergency response failure.

Build the following:

1. Cross-domain causal chain system

Create:
backend/src/safescope-v2/cross-domain-causal-chain/
  cross-domain-causal-chain.types.ts
  cross-domain-causal-chain.service.ts
  cross-domain-causal-chain.validator.ts

The service should accept:
{
  observationText,
  taxonomyRoute,
  multiHazardDecomposition,
  evidenceWeighting,
  approvedKnowledgeMatches,
  scenarioMatches,
  evaluatedScenarioMatches,
  context
}

It should output:
- version
- primaryCausalChain[]
- contributingHazards[]
- initiatingConditions[]
- escalationFactors[]
- exposurePathways[]
- controlBreakdownPathways[]
- plausibleInjuryMechanisms[]
- compoundRiskLevel: low | moderate | high | critical | uncertain
- chainConfidence: strong | moderate | weak | insufficient | conflicting
- missingCausalFacts[]
- contradictionLimits[]
- reviewerQuestions[]
- advisoryBoundary
- doesNotDeclareViolation: true
- requiresQualifiedReview: true

2. Deterministic causal logic

Implement deterministic rules for these interaction families:

A. Machine guarding / LOTO interaction
Signals:
- conveyor, pulley, rotating, nip point, guard removed, unguarded
- cleanup, maintenance, servicing
- energized, running, not locked out, unexpected startup
Output should identify:
- mechanical energy source
- access/exposure pathway
- guarding failure
- energy-control uncertainty or failure
- caught-in/nip-point injury mechanism

B. Electrical + wet/slip interaction
Signals:
- damaged cord, exposed wire, electrical panel, live, energized
- wet floor, water, spill, damp
Output should identify:
- electrical shock pathway
- environmental amplifier
- slip/contact escalation factor

C. Mobile equipment + pedestrian interaction
Signals:
- forklift, loader, haul truck, mobile equipment, traffic
- pedestrian, walkway, blind spot, poor visibility, no separation
Output should identify:
- struck-by pathway
- visibility/segregation failure
- pedestrian exposure pathway

D. HazCom + spill/SDS uncertainty
Signals:
- unlabeled, no label, chemical container, SDS missing
- spill, leaking, unknown chemical
Output should identify:
- chemical exposure uncertainty
- emergency response uncertainty
- identity/control information gap

E. Fall + material handling interaction
Signals:
- open edge, elevated platform, unprotected edge, guardrail missing
- stacked material, staging, unstable load, stored material
Output should identify:
- fall pathway
- struck-by or instability pathway
- housekeeping/material placement escalation

F. Confined space + emergency response interaction
Signals:
- confined space, tank, vessel, pit
- no atmospheric testing, oxygen, toxic, flammable, rescue, attendant
Output should identify:
- atmospheric exposure pathway
- rescue/readiness failure
- entry control uncertainty

3. Evidence-aware behavior

Use the existing field evidence weighting result:
- If evidenceGrade is conflicting, chainConfidence must be conflicting or weak.
- If evidenceGrade is insufficient, chainConfidence must be insufficient or weak.
- If missing exposure facts exist, include them in missingCausalFacts.
- If contradictions exist, include them in contradictionLimits.
- Do not overstate the causal chain when evidence is weak.
- Keep output advisory-only.

4. Integration

Wire CrossDomainCausalChainService into:
backend/src/safescope-v2/approved-knowledge-retrieval-output-v1/
backend/src/safescope-v2/field-output-composer-v1/

Retrieval output should include:
crossDomainCausalChain

Field output composer should use it to:
- add a causal-chain field assessment section
- explain compound hazard interactions in plain language
- add reviewer questions tied to missing causal facts
- avoid violation/citation language
- avoid overconfident language when confidence is weak/conflicting

5. Validation

Create:
backend/scripts/validate-safescope-cross-domain-causal-chain-v1.ts

Validation cases must include:
- conveyor guarding + cleanup + no LOTO
- damaged cord + wet floor
- forklift + pedestrian blind spot + no separation
- unlabeled chemical + spill + SDS missing
- open edge + unstable material staging
- confined space + no atmospheric testing + rescue uncertainty
- conflicting evidence case
- vague insufficient evidence case
- integration case verifying retrieval output includes crossDomainCausalChain
- integration case verifying composer includes causal-chain advisory wording

Validator must fail if:
- advisoryBoundary is missing
- doesNotDeclareViolation is not true
- requiresQualifiedReview is not true
- confident violation/citation language appears
- conflicting evidence produces strong chainConfidence
- vague evidence produces strong chainConfidence
- key pathways are missing from the expected interaction cases

6. Runner wiring

Add validator to:
backend/scripts/run-safescope-full-validation.ts

Add validator to targeted runner:
backend/scripts/run-safescope-targeted-validation.ts

Relevant areas:
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
project-docs/09-archive-reference/prompts/SAFESCOPE_CROSS_DOMAIN_CAUSAL_CHAIN_REASONING_V1_PROMPT.md

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
If precision benchmark files changed only by generatedAt timestamp, restore them.

Commit locally only:
git add relevant files
git commit -m "Add SafeScope cross-domain causal chain reasoning v1"

Do not push.
