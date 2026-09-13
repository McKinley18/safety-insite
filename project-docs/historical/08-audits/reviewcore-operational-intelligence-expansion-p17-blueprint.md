# ReviewCore Operational Intelligence Expansion P17 Blueprint

## 1. Current Architecture
- **Knowledge Architecture**: Hardcoded registries (`scenario-family.registry.ts`, `standard-family-candidate.registry.ts`, `evidence-gap-question.registry.ts`, `corrective-action-template.registry.ts`) act as the source of truth for hazard classification, mapping, and mitigation.
- **Scenario Understanding**: Uses substring matching (`.includes()`) in `scenario-intelligence.service.ts`, `equipment-understanding.service.ts`, etc., to build `SafeScopeUnderstanding`.
- **Corrective Actions**: Uses a static mapping in `corrective-action-template.registry.ts` based only on the hazard domain. Lacks task, equipment, or mechanism context.
- **Evidence Gaps**: Statically maps scenario families to specific questions in `evidence-gap-question.registry.ts`.
- **Governance**: Pipeline logic enforces policies (no citations, advisory only, human review required).

## 2. App Readiness Gaps
- **Inspection Flow**: Needs to clearly delineate AI advisory suggestions from confirmed facts.
- **Review Flow**: `inspection-review` does not expose the full reasoning trace (why a standard applies, supporting facts, missing facts, confidence).
- **Corrective Actions**: Actions are generic, making them less actionable for the field. They need dynamic context (equipment, task, mechanism).
- **Dashboards/Reports**: Need clear disclaimers that output is advisory and not a legal compliance determination.

## 3. Taxonomy Expansions
We will add or expand the following families in the registries:
- Mobile equipment / pedestrian interaction
- Conveyors, pulleys, rollers, belt cleanup, guarding
- Machine guarding / point of operation / rotating shafts
- Electrical panels, cords, damaged insulation, wet locations
- Fall protection, ladders, scaffolds, elevated platforms
- Housekeeping / slips, trips, spills, walkways
- LOTO / maintenance energy control
- Chemical exposure / SDS / ventilation / PPE
- Confined space recognition
- Excavation / trenching
- Struck-by / caught-between / stored energy

## 4. Rule-based vs Structured Reasoning
- Currently, corrective actions and standard matchings are driven by simple static arrays and `.includes()` statements.
- Standard candidates need fields for `applicabilityReasoning`, `requiredFacts`, `missingFacts`, `sourceAuthorityTier`, `confidenceBand`.

## 5. Corrective Action Improvement
- Update `CorrectiveActionTemplate` type and registry to include:
  - `relatedEquipment`
  - `relatedTask`
  - `relatedMechanism`
  - `immediateExposureControl`
  - `interimControls`
  - `permanentCorrection`
  - `verificationMethod`
  - `responsibleRole`
  - `urgencyLogic`

## 6. Standard Matching Improvement
- Update `StandardFamilyCandidateRecord` type and registry to include:
  - `whyItMayApply`
  - `factsSupportingApplicability`
  - `factsStillMissing`
  - `sourceAuthorityTier`
  - `confidenceBand`
  - `humanReviewRequired`

## 7. UI Explanations
- Ensure the frontend or the API payloads specifically structure the output to highlight "Advisory Only" and explain the reasoning steps clearly.

## Proposed P17 File List
- `backend/src/safescope-v2/corrective-actions/corrective-action-template.registry.ts`
- `backend/src/safescope-v2/corrective-actions/corrective-action-template.types.ts`
- `backend/src/safescope-v2/brain/standard-family-mapper/standard-family-candidate.registry.ts`
- `backend/src/safescope-v2/brain/standard-family-mapper/standard-family-candidate.types.ts`
- `backend/src/safescope-v2/brain/scenario-family-knowledge/scenario-family.registry.ts`
- `backend/src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.registry.ts`
- `backend/src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.types.ts`

## Exact Implementation Plan
1. **Types**: Update `StandardFamilyCandidateRecord`, `CorrectiveActionTemplate`, and `EvidenceGapQuestionRecord` interfaces to add the required fields for contextual reasoning.
2. **Standard Registry Expansion**: Migrate and expand `STANDARD_FAMILY_REGISTRY` to include the new fields (`whyItMayApply`, `sourceAuthorityTier`, etc.) and add new categories.
3. **Corrective Action Expansion**: Re-write `CORRECTIVE_ACTION_TEMPLATE_REGISTRY` to move away from generic domains and target specific scenarios/mechanisms, including `verificationMethod` and `urgencyLogic`.
4. **Evidence Gaps Expansion**: Update `EVIDENCE_GAP_QUESTION_REGISTRY` to cover new taxonomies and ask precise factual questions.
5. **Scenario Expansion**: Ensure `SCENARIO_FAMILY_REGISTRY` covers all the high-priority P17 categories.
6. **Validation**: Run existing typescript checks and validators (`npm run build`, `npm run calibrate:safescope-200`, `npx ts-node scripts/validate-safescope-ai-contract.ts`) to ensure 200/200 exact matches remain intact.
